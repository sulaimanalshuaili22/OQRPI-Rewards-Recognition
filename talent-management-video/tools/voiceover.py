#!/usr/bin/env python3
"""
Narrator track + film timeline for the OQ RPI Talent Management film.

Reads src/film/script.json, synthesises every sentence with Kokoro (neural
TTS, offline), shapes the delivery to a documentary read (deliberate clause
pauses, measured pace), masters the voice and writes:

  audio-src/voice_raw.wav        unprocessed narrator (48 kHz)
  src/film/timeline.json         scene windows and caption timings (frames)

The voice is a style blend chosen by speaker-embedding similarity to the
reference narrator (60% am_michael, 20% bm_daniel, 20% bm_lewis).

Usage:
  python tools/voiceover.py --model kokoro-v1.0.onnx --voices voices-v1.0.bin
"""
import argparse
import json
import os
import re

import numpy as np
import soundfile as sf
import librosa
from kokoro_onnx import Kokoro, EspeakConfig

ap = argparse.ArgumentParser()
ap.add_argument("--model", required=True)
ap.add_argument("--voices", required=True)
ap.add_argument("--speed", type=float, default=0.97)
ap.add_argument("--espeak-lib", default="/usr/lib/x86_64-linux-gnu/libespeak-ng.so.1")
ap.add_argument("--espeak-data", default="/usr/lib/x86_64-linux-gnu/espeak-ng-data")
args = ap.parse_args()

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 48000
script = json.load(open(os.path.join(ROOT, "src/film/script.json"), encoding="utf-8"))
FPS = script["fps"]

k = Kokoro(args.model, args.voices,
           espeak_config=EspeakConfig(lib_path=args.espeak_lib, data_path=args.espeak_data))
style = (0.6 * k.get_voice_style("am_michael")
         + 0.2 * k.get_voice_style("bm_daniel")
         + 0.2 * k.get_voice_style("bm_lewis"))


def sentences(text):
    """Split a caption into spoken sentences; an ellipsis becomes its own beat."""
    text = text.replace("…", "... ")
    parts = re.split(r"(?<=[.!?])\s+", text.strip())
    out = []
    for p in parts:
        if "..." in p:
            a, b = p.split("...", 1)
            out.append((a.strip() + ",", 0.75))   # suspended, then a held beat
            if b.strip():
                out.append((b.strip(), 0.55))
        else:
            out.append((p, 0.55))
    return out


def stretch_pauses(y, sr, min_sil=0.13, target=0.38):
    """Lengthen the clause pauses Kokoro leaves at commas to a documentary rhythm."""
    frame = int(0.01 * sr)
    env = np.sqrt(np.convolve(y ** 2, np.ones(frame) / frame, mode="same"))
    quiet = env < 0.012
    out, i, n = [], 0, len(y)
    start_speech = np.argmax(~quiet)
    end_speech = n - np.argmax(~quiet[::-1])
    while i < n:
        state = quiet[i]
        j = i
        while j < n and quiet[j] == state:
            j += 1
        seg = y[i:j]
        dur = (j - i) / sr
        if state and start_speech < i and j < end_speech and min_sil <= dur < target:
            pad = np.zeros(int((target - dur) * sr))
            mid = len(seg) // 2
            seg = np.concatenate([seg[:mid], pad, seg[mid:]])
        out.append(seg)
        i = j
    return np.concatenate(out)


def trim(y, sr, thr=0.008):
    nz = np.where(np.abs(y) > thr)[0]
    if not len(nz):
        return y
    return y[max(0, nz[0] - int(0.03 * sr)): nz[-1] + int(0.12 * sr)]


# Slight, deterministic pace variation keeps the read from sounding mechanical.
PACE = [0.0, -0.02, 0.01, -0.01, 0.02, -0.015, 0.0, 0.015, -0.02, 0.01]

line_audio = []
li = 0
for sc in script["scenes"]:
    for line in sc["lines"]:
        chunks = []
        for si, (sent, after) in enumerate(sentences(line["text"])):
            speed = args.speed + PACE[li % len(PACE)]
            a, s = k.create(sent, voice=style, speed=speed, lang="en-us")
            a = librosa.resample(np.asarray(a, dtype=np.float64), orig_sr=s, target_sr=SR)
            a = trim(a, SR)
            a = stretch_pauses(a, SR)
            chunks.append(a)
            chunks.append(np.zeros(int(after * SR)))
        y = np.concatenate(chunks[:-1])  # drop the trailing pause
        line_audio.append(y)
        li += 1

# Lay out the timeline.
timeline = {"fps": FPS, "scenes": [], "lines": []}
t = 0.0
voice = []
li = 0
for sc in script["scenes"]:
    s_start = t
    t += sc["leadIn"]
    for i, line in enumerate(sc["lines"]):
        if i > 0:
            t += line["gap"]
        y = line_audio[li]
        start, end = t, t + len(y) / SR
        voice.append((start, y))
        timeline["lines"].append({
            "scene": sc["id"],
            "text": line["text"],
            "start": round(start * FPS),
            "end": round(end * FPS) + 8,
        })
        t = end
        li += 1
    t += sc["tail"]
    timeline["scenes"].append({
        "id": sc["id"],
        "name": sc["name"],
        "start": round(s_start * FPS),
        "duration": round(t * FPS) - round(s_start * FPS),
    })

total = round(t * FPS)
timeline["durationInFrames"] = total
out = np.zeros(int((total / FPS + 1) * SR))
for start, y in voice:
    i0 = int(start * SR)
    out[i0:i0 + len(y)] += y
out /= max(1e-9, np.abs(out).max()) / 0.9

os.makedirs(os.path.join(ROOT, "audio-src"), exist_ok=True)
sf.write(os.path.join(ROOT, "audio-src/voice_raw.wav"), out, SR, subtype="PCM_24")
json.dump(timeline, open(os.path.join(ROOT, "src/film/timeline.json"), "w"), indent=2)

speech = sum(len(y) for _, y in voice) / SR
print(f"film {total / FPS:.1f}s, speech {speech:.1f}s ({100 * speech / (total / FPS):.0f}%)")
for s in timeline["scenes"]:
    print(f"  {s['name']:<36} start {s['start'] / FPS:6.1f}s  dur {s['duration'] / FPS:5.1f}s")
