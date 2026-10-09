# OQ RPI · Talent Management — cinematic brand film

A ~4-minute executive documentary introducing the OQ RPI Talent Management
ecosystem, built in [Remotion](https://www.remotion.dev) with real-time 3D
(Three.js / React Three Fiber).

The film is one continuous camera journey through a digital twin of OQ RPI —
no slides, no cuts between static layouts. Every scene has foreground,
midground and background motion, real depth of field, bloom, film grain and
AR-style interface elements locked to 3D objects.

| # | Scene | What you see |
|---|-------|--------------|
| 01 | The future begins with people | A single particle in the dark bursts into a living constellation of the workforce |
| 02 | Why Talent Management | The camera dives into a holographic digital twin of the refinery; the right talent, role and time light up on real workers |
| 03 | The ecosystem | Twelve programmes orbit a central hub, linked by light |
| 04 | Performance Management | **Talent DNA** — an employee dissolves into data streams: skills, performance, potential, certifications, readiness, leadership |
| 05 | The 9-Box Matrix | Employees stream in and settle by performance × potential; the hero lands in *Future Leaders* |
| 06 | Critical Roles | A scan sweeps a 3D organisation; critical positions ignite |
| 07 | Succession Planning | A vacancy opens; the successor spirals up the pipeline tower to fill it |
| 08 | Leadership Development | A chase shot through five gates of the leadership journey |
| 09 | Nationalization | National talent rising through terraces from graduate to leader |
| 10 | Secondment | People and knowledge travel between organisations on bridges of light |
| 11 | Rewards & Recognition | Spotlights find the people behind success |
| 12 | Intelligent Talent Platform | Inside the AI core, surrounded by live dashboards and an AI assistant |
| 13 | How everything connects | The camera rises over the whole **living workforce ecosystem**; flows connect |
| 14 | The future of OQ RPI | At sunrise the refinery transforms into the workforce; logo reveal |

The **workforce journey** runs through scenes 4–8: the same employee
(Talent ID 0147) becomes data, lands in Future Leaders, is identified as a
successor and passes through the leadership gates.

## Quick start

```bash
npm install
npm run dev          # Remotion Studio
```

## Rendering

```bash
# Full HD master
npx remotion render TalentManagement out/talent-management-1080p.mp4 --gl=angle

# 4K UHD master (real 4K 3D render; overlays scale with it)
npx remotion render TalentManagement-4K out/talent-management-4k.mp4 --gl=angle --crf 16

# Fast half-size preview
npx remotion render TalentManagement out/preview.mp4 --scale=0.5 --gl=angle

# Without on-screen captions
npx remotion render TalentManagement out/film.mp4 --gl=angle --props='{"captions":false}'
```

`--gl=angle` is required (WebGL). On a machine with a GPU, 1080p renders in
roughly 15–30 minutes; on CPU-only machines expect 2–3 hours.

## Sound

`public/audio/soundtrack.mp3` is the final mix: narrator + original score +
sound design, mastered to −16 LUFS. It was benchmarked on the reference
corporate track's characteristics only (not its script or audio):

| Characteristic | Reference | This film |
|---|---|---|
| Narrator | deep male baritone (≈85–130 Hz) | neural voice blend chosen by speaker-embedding similarity (≈112 Hz) |
| Delivery | mean phrase 1.30 s, median pause 0.53 s | mean phrase 1.31 s, median pause 0.53 s |
| Voice above music | ≈12 dB | 12.1 dB |
| Loudness / range | −16.4 LUFS, LRA 5.7 | −15.9 LUFS, LRA 5.0 |
| Music | harmonic-led, light percussion, G major, ~76/152 BPM, brightening build, soft resolve | same palette and arc: piano, strings, warm pad, horns, choir, timpani, light electronic arpeggio |

### Regenerating the audio

```bash
python3 -m venv .venv && .venv/bin/pip install -r tools/requirements.txt
sudo apt-get install fluidsynth musescore-general-soundfont espeak-ng
# Kokoro voice model files: https://github.com/thewh1teagle/kokoro-onnx/releases/tag/model-files-v1.0
.venv/bin/python tools/voiceover.py --model kokoro-v1.0.onnx --voices voices-v1.0.bin
.venv/bin/python tools/score.py
```

`tools/voiceover.py` reads `src/film/script.json` (narration + pacing),
synthesises the narrator and writes `src/film/timeline.json`. **The picture is
cut to the voice**: scene lengths, caption timings and the camera all follow
that timeline, so a re-read re-times the whole film automatically.
`tools/score.py` composes and mixes the music to the same timeline and writes
`src/film/music.json` (the logo hit lands on a musical downbeat).

To use a human narrator, record against `VOICEOVER-SCRIPT.md`, then replace
`audio-src/voice_raw.wav` and re-run `tools/score.py` (adjust the line
timings in `src/film/timeline.json` to the new read).

## Project layout

```
src/
  Root.tsx                 compositions (1080p, 4K)
  film/
    Film.tsx               3D world + AR overlay + grade + captions + soundtrack
    script.json            narration & pacing (source of truth)
    timeline.json          generated: scene windows and caption timings
    music.json             generated: musical landmarks
    camera.ts              continuous camera path (Hermite spline + hand-held drift)
    geometry.ts            set geometry shared by 3D and overlay
    layout.ts              set positions in the digital twin, brand colours
    world/                 Three.js scene: sets, constellation, refinery twin, post FX
    overlay/               AR tags, glass cards, titles, captions, grade, transitions
  components/              logo, icons, charts
tools/
  voiceover.py             narrator + timeline
  score.py                 score, sound design, mix & master
```

## Brand notes

- Colours: OQ Orange `#FF8200`, Midnight Blue `#081F2C`, Light Blue `#9CDBD9`,
  Turquoise `#00B0B9`, white and metallic greys (OQ Brand Guidelines 7.1).
- Typography: Inter (bundled) stands in for the licensed Aktiv Grotesk; swap
  the files in `public/fonts/` and `src/theme.ts` to use the brand font.
- Figures shown in dashboards are illustrative.
