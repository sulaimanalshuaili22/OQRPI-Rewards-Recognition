# OQ RPI · Talent Management — cinematic brand film

A ≈3:17 corporate motion-graphics film introducing the OQ RPI Talent Management
ecosystem, built in [Remotion](https://www.remotion.dev) (React → video).
Fourteen scenes, OQ brand palette, glassmorphism HUDs, a pseudo-3D workforce
network, animated dashboards, cinematic camera moves and light-leak cuts.

## Quick start

```bash
npm install
npm run dev          # opens Remotion Studio — scrub, edit and preview every scene
```

In Studio, `TalentManagement` is the full film. The `Scenes` folder holds each
scene as its own composition so it can be previewed and timed in isolation.

## Rendering

```bash
# Full HD master (1920×1080, H.264)
npx remotion render TalentManagement out/talent-management-1080p.mp4

# 4K UHD master (3840×2160) — same film, scaled from the 1080p layout
npx remotion render TalentManagement-4K out/talent-management-4k.mp4 --crf 16

# ProRes for the edit suite
npx remotion render TalentManagement-4K out/talent-management-4k.mov --codec=prores --prores-profile=4444

# Fast half-size preview
npx remotion render TalentManagement out/preview.mp4 --scale=0.5
```

Expect roughly 10–20 minutes for a 1080p render on a modern laptop and
3–4× that for 4K. Renders are fully offline — fonts are bundled in
`public/fonts`.

### Audio

Music and voice-over are not bundled. Place `music.mp3` and `voiceover.mp3` in
`public/audio/` and pass them as props (see `public/audio/README.md`). The
narrator's lines are shown as on-screen captions until the voice track is laid
in; turn them off with `"subtitles": false`.

`VOICEOVER-SCRIPT.md` contains the complete narration with timecodes and the
music brief for the composer.

### Chromium

Remotion downloads its own headless Chrome on first render. On a locked-down
network, point it at an installed browser instead:

```bash
npx remotion render TalentManagement out/film.mp4 --browser-executable=/path/to/chrome
```

## Project layout

```
src/
  Root.tsx                   composition registry (film, 4K film, per-scene comps)
  TalentManagementVideo.tsx  the timeline: TransitionSeries of 14 scenes + audio
  theme.ts                   OQ palette, typography, easing curves
  components/                reusable motion pieces
    Background.tsx           deep-navy backdrop, grid, particles, vignette
    NetworkField.tsx         pseudo-3D "living organisation" network
    GlassPanel.tsx           glassmorphism container
    Charts.tsx               bars, trend line, donut, KPI tile
    Text.tsx                 WordReveal, FadeUp, Kicker
    Narration.tsx            lower-third narration captions
    Refinery.tsx             line-art refinery skyline with animated flows
    Logo.tsx                 OQ RPI wordmark (vector)
    LightStreak.tsx          orange light streak
    LightLeakOverlay.tsx     warm light-leak cut (WebGL)
    FlowChips.tsx            "A → B → C" output animations
    Icons.tsx                outline icon set in the OQ iconography style
    Camera.tsx               slow push / drift camera wrapper
  scenes/                    Scene01Opening … Scene14Future
public/
  fonts/                     Inter (stand-in for Aktiv Grotesk), bundled offline
  audio/                     drop music.mp3 / voiceover.mp3 here
```

## Brand notes

- Colours follow the OQ Brand Guidelines screen values: Midnight Blue `#081F2C`,
  OQ Orange `#FF8200`, Light Blue `#9CDBD9`, Turquoise `#00B0B9`, White, plus
  light metallic grey accents. OQ Orange is used as the single highlight
  colour, as the data-visualisation guidance prescribes.
- Typography: the brand typeface Aktiv Grotesk is licensed; the film ships with
  Inter, a close grotesk. To switch, drop the Aktiv Grotesk `.woff2` files into
  `public/fonts/` and update the URLs in `src/theme.ts`.
- The OQ RPI wordmark is redrawn as vector in `src/components/Logo.tsx`. Swap in
  the official SVG if a brand-approved file is available.

## Editing

Every scene exports a `SCENE_xx_DURATION` constant; change it to re-time the
scene and the full film re-flows automatically. Narration timing lives at the
top of each scene file. Animations are driven by `useCurrentFrame()` and are
fully deterministic, so renders are reproducible frame for frame.
