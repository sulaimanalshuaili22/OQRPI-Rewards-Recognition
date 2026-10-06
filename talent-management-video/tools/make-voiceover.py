#!/usr/bin/env python3
"""
Build the narrator track for the OQ RPI Talent Management film.

Reads every `narration` line (text + scene-local frame window) straight from
the scene files, synthesises each line with Piper (neural TTS, offline),
places it at its absolute timecode and writes:

  public/audio/voiceover.wav       the assembled narrator track
  src/voiceover-timing.json        [{start, end}] in seconds, used by the film
                                   to duck the music under the narrator

It also prints a timing report so caption windows can be matched to speech.

Usage:
  python3 tools/make-voiceover.py --piper /path/to/piper --model voice.onnx
"""
import argparse
import glob
import json
import os
import re
import subprocess
import sys
import tempfile
import wave

import numpy as np

FPS = 30
# Absolute start frame of each scene in the full film (see TalentManagementVideo.tsx).
SCENE_STARTS = [0, 460, 950, 1490, 1860, 2230, 2600, 3000, 3370, 3680, 3990, 4300, 4760, 5240]
TOTAL_FRAMES = 5930

ap = argparse.ArgumentParser()
ap.add_argument("--piper", default="piper")
ap.add_argument("--model", required=True)
ap.add_argument("--length-scale", type=float, default=1.08)
ap.add_argument("--out", default="public/audio/voiceover.wav")
ap.add_argument("--timing", default="src/voiceover-timing.json")
ap.add_argument("--patch-captions", action="store_true",
                help="rewrite each caption's `to:` frame in the scene files to match the spoken audio")
args = ap.parse_args()

root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
scene_files = sorted(glob.glob(os.path.join(root, "src", "scenes", "Scene*.tsx")))
assert len(scene_files) == 14, scene_files

line_re = re.compile(r'text:\s*"((?:[^"\\]|\\.)*)",\s*from:\s*(\d+),\s*to:\s*(\d+)', re.S)

lines = []
for idx, path in enumerate(scene_files):
    src = open(path, encoding="utf-8").read()
    m = re.search(r"const narration = \[(.*?)\];", src, re.S)
    if not m:
        continue
    for text, f, t in line_re.findall(m.group(1)):
        lines.append({
            "scene": idx + 1,
            "file": os.path.basename(path),
            "text": text.replace("…", "...").replace("’", "'"),
            "from": SCENE_STARTS[idx] + int(f),
            "to": SCENE_STARTS[idx] + int(t),
            "localTo": int(t),
        })

print(f"{len(lines)} narration lines found")


def synth(text, path):
    cmd = [args.piper, "--model", args.model, "--output_file", path,
           "--length_scale", str(args.length_scale), "--sentence_silence", "0.4"]
    subprocess.run(cmd, input=text.encode("utf-8"), check=True,
                   stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    with wave.open(path, "rb") as w:
        sr = w.getframerate()
        data = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float64) / 32768
        if w.getnchannels() == 2:
            data = data.reshape(-1, 2).mean(axis=1)
    return sr, data


sr = None
clips = []
with tempfile.TemporaryDirectory() as tmp:
    for i, ln in enumerate(lines):
        p = os.path.join(tmp, f"{i:02d}.wav")
        s, data = synth(ln["text"], p)
        sr = sr or s
        assert s == sr
        # trim leading/trailing silence
        thr = 0.01
        nz = np.where(np.abs(data) > thr)[0]
        if len(nz):
            data = data[max(0, nz[0] - int(0.05 * sr)): nz[-1] + int(0.15 * sr)]
        clips.append(data)

total_s = TOTAL_FRAMES / FPS + 1
out = np.zeros(int(total_s * sr))
timing = []
report = []
cursor = 0.0
for ln, data in zip(lines, clips):
    start = ln["from"] / FPS
    # never overlap the previous line
    start = max(start, cursor + 0.35)
    dur = len(data) / sr
    end = start + dur
    i0 = int(start * sr)
    n = min(len(data), len(out) - i0)
    # 20 ms fades to avoid clicks
    fade = int(0.02 * sr)
    data = data.copy()
    data[:fade] *= np.linspace(0, 1, fade)
    data[-fade:] *= np.linspace(1, 0, fade)
    out[i0:i0 + n] += data[:n]
    cursor = end
    ln["start"] = start
    timing.append({"start": round(start, 3), "end": round(end, 3)})
    window_end = ln["to"] / FPS
    over = end - window_end
    flag = "OVER" if over > 0 else "ok"
    report.append((ln["scene"], flag, over, start, end, ln))

peak = np.abs(out).max()
out = out / peak * 0.89
with wave.open(os.path.join(root, args.out), "wb") as w:
    w.setnchannels(1)
    w.setsampwidth(2)
    w.setframerate(sr)
    w.writeframes((out * 32767).astype(np.int16).tobytes())
json.dump(timing, open(os.path.join(root, args.timing), "w"), indent=2)

if args.patch_captions:
    # Rewrite `to:` so each caption stays up until the narrator finishes (+0.3 s).
    by_file = {}
    for scene, flag, over, start, end, ln in report:
        by_file.setdefault(ln["file"], []).append((ln, end))
    for fname, items in by_file.items():
        path = os.path.join(root, "src", "scenes", fname)
        src = open(path, encoding="utf-8").read()
        scene_start = SCENE_STARTS[int(fname[5:7]) - 1]
        dur = int(re.search(r"SCENE_\d+_DURATION = (\d+)", src).group(1))
        for ln, end in items:
            new_to = min(dur - 6, int(round(end * FPS - scene_start + 9)))
            pat = re.compile(r'(text:\s*"' + re.escape(ln["text"].replace("...", "\u2026") if "\u2026" in src else ln["text"]) + r'",\s*from:\s*' + str(ln["from"] - scene_start) + r',\s*to:\s*)(\d+)', re.S)
            src, n = pat.subn(lambda m: m.group(1) + str(new_to), src)
            if n != 1:
                # fall back: match by from-frame only within the narration block
                pat = re.compile(r'(from:\s*' + str(ln["from"] - scene_start) + r',\s*to:\s*)(\d+)', re.S)
                src, n = pat.subn(lambda m: m.group(1) + str(new_to), src, count=1)
            print(f"  {fname}: caption from {ln['from'] - scene_start} -> to {new_to} ({'ok' if n == 1 else 'NOT PATCHED'})")
            new_from = int(round(ln["start"] * FPS - scene_start))
            # shift `from:` when the line had to wait for the previous one to finish
            if new_from != ln["from"] - scene_start:
                pat = re.compile(r'(text:\s*"' + re.escape(ln["text"]) + r'",\s*from:\s*)(\d+)', re.S)
                src, n = pat.subn(lambda m: m.group(1) + str(new_from), src)
                print(f"  {fname}: caption from {ln['from'] - scene_start} -> from {new_from} ({'ok' if n == 1 else 'NOT PATCHED'})")
        open(path, "w", encoding="utf-8").write(src)

print(f"wrote {args.out} ({sr} Hz) and {args.timing}\n")
print("scene  status  overrun  start→end      caption-window-end   text")
for scene, flag, over, start, end, ln in report:
    print(f"{scene:>5}  {flag:<6} {over:+6.2f}s  {start:6.2f}→{end:6.2f}   {ln['to'] / FPS:6.2f}   {ln['text'][:60]}")
sys.exit(0)
