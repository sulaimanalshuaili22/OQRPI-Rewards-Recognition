#!/usr/bin/env python3
"""
Subtitles (SRT) from a film timeline, chunked the same way as the on-screen
captions (≤ 80 characters, broken at punctuation, timed by characters).

Usage:  python tools/srt.py src/v5/timeline.json deliverables/OQRPI-Talent-Management-v5.en.srt
"""
import json
import re
import sys

src, dst = sys.argv[1], sys.argv[2]
tl = json.load(open(src, encoding="utf-8"))
FPS = tl["fps"]


def chunk(text, start, end, max_len=80):
    """Balanced chunks: as few as fit max_len, of similar length, ending at punctuation where possible."""
    words = text.split(" ")
    n = -(-len(text) // max_len)
    target = len(text) / n
    parts, cur = [], ""
    for i, w in enumerate(words):
        nxt = f"{cur} {w}" if cur else w
        left = len(parts) < n - 1
        punct = re.search(r"[,.:?…]$", cur) is not None
        if cur and left and (len(nxt) > target * 1.15 or (punct and len(cur) > target * 0.6)):
            parts.append(cur)
            cur = w
        else:
            cur = nxt
    parts.append(cur)
    total = sum(len(p) for p in parts)
    speech_end = end - 8
    t, out = start, []
    for i, p in enumerate(parts):
        d = (speech_end - start) * len(p) / total
        out.append([p, round(t), round(end if i == len(parts) - 1 else t + d)])
        t += d
    return out


def ts(frame):
    ms = round(frame / FPS * 1000)
    h, ms = divmod(ms, 3600000)
    m, ms = divmod(ms, 60000)
    s, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"


cues = [c for line in tl["lines"] for c in chunk(line["text"], line["start"], line["end"])]
# no two cues on screen at once
for a, b in zip(cues, cues[1:]):
    a[2] = min(a[2], b[1] - 1)
with open(dst, "w", encoding="utf-8") as f:
    for i, (text, a, b) in enumerate(cues, 1):
        f.write(f"{i}\n{ts(a)} --> {ts(b)}\n{text}\n\n")
print(f"wrote {dst}: {len(cues)} cues")
