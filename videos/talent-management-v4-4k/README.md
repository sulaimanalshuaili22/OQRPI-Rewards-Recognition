# OQRPI Talent Management video v4 — 4K UHD

Upscaled from `OQRPI-Talent-Management-v4-1080p.mp4` to **3840×2160**, H.264, 30 fps, original AAC audio. Total length 4:39.

GitHub blocks single files over 100 MB, so the video is stored as 10 playable parts (play them in order: part00 → part09).

## Join into one file (lossless, takes seconds)

With [ffmpeg](https://ffmpeg.org) installed, run this inside this folder:

```
ffmpeg -f concat -safe 0 -i parts.txt -c copy OQRPI-Talent-Management-v4-4K.mp4
```
