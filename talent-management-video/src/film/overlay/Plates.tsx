/**
 * Live-action plates: real OQ people and facilities (from the OQ corporate
 * film, cropped clear of its subtitles and watermark), cut to the narration.
 * Each plate covers the 3D world, then dissolves into it.
 */
import type React from "react";
import { Video } from "@remotion/media";
import { AbsoluteFill, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { at, cue, FPS, linesOf, SCENES, type SceneId } from "../timeline";
import { EASE } from "../math";

const CLIP_SECONDS: Record<string, number> = {
  "aerial-campus": 1.66, "plant-equipment": 2.18, "eyes-man": 2.08, "world-map": 3.92, "eyes-woman": 0.8,
  staircase: 2.42, "open-office": 1.04, coaching: 1.02, "glass-building": 2.1, "face-light": 2.68,
  "lab-team": 0.7, "lab-woman": 1.68, scientist: 3.42, "omani-youth": 1.9, "field-engineers": 1.4,
  workshop: 0.82, "office-walk": 0.88, "oq-lobby": 1.66, "leadership-call": 2.16, "control-room": 2.6,
  "strategy-glass": 2.3, "talent-review": 2.18, "refinery-aerial": 0.94, "eyes-1": 2.74, "eyes-2": 0.54,
  "eyes-3": 0.86, "eyes-4": 0.86, "eyes-5": 1.58, "eyes-6": 1.06, "eyes-7": 0.94,
};

type Shot = {
  readonly clip: string;
  readonly from: number;
  readonly to: number;
  readonly fadeIn: number;
  readonly fadeOut: number;
  readonly zoom: [number, number];
  readonly drift: [number, number];
};

/** Lay clips edge-to-edge between cue frames; each clip slows (down to 0.4×) to fill its slot. */
const montage = (cuts: number[], clips: string[], end: number, fadeIn = 4, lastFade = 18): Shot[] =>
  clips.map((clip, i) => ({
    clip,
    from: Math.round(cuts[i]),
    to: Math.round(i + 1 < cuts.length ? cuts[i + 1] + 2 : end),
    fadeIn: i === 0 ? 14 : fadeIn,
    fadeOut: i === clips.length - 1 ? lastFade : 2,
    zoom: i % 2 ? [1.1, 1.03] : [1.03, 1.1],
    drift: i % 2 ? [-14, 6] : [12, -6],
  }));

const single = (clip: string, from: number, seconds: number, zoom: [number, number] = [1.02, 1.1], fadeOut = 20): Shot => ({
  clip,
  from: Math.round(from),
  to: Math.round(from + seconds * FPS),
  fadeIn: 12,
  fadeOut,
  zoom,
  drift: [10, -4],
});

const lineEnd = (id: SceneId, n: number) => linesOf(id)[n].end;
const S = (id: SceneId) => SCENES[id].start;

export const SHOTS: Shot[] = [
  // 01 — faces, then the operation, innovation and achievement behind OQ RPI
  ...montage(
    [
      at("opening", 3.2),
      cue("opening", 0, "one common"),
      cue("opening", 0, "its people"),
      cue("opening", 1, "At OQ RPI"),
      cue("opening", 1, "every operation"),
      cue("opening", 1, "every innovation"),
      cue("opening", 1, "every achievement"),
      cue("opening", 1, "lies talent"),
    ],
    ["eyes-1", "eyes-5", "eyes-woman", "aerial-campus", "control-room", "scientist", "strategy-glass", "eyes-6"],
    lineEnd("opening", 1) + 6,
  ),
  // 02 — the real site, then the people who run it
  single("refinery-aerial", S("why"), 2.6, [1.0, 1.12]),
  single("control-room", cue("why", 1, "OQ RPI Talent Management exists"), 3.4),
  // 03 — OQ
  single("oq-lobby", S("ecosystem"), 2.6),
  // 04 — field engineers at work
  single("field-engineers", S("performance"), 2.6),
  // 05 — a talent review conversation
  single("talent-review", S("ninebox"), 2.5),
  // 06 — process plant
  single("plant-equipment", S("critical"), 2.5),
  // 07 — leaders in discussion
  single("leadership-call", S("succession"), 2.5),
  // 08 — rising; then the development workshop
  single("staircase", S("leadership"), 2.7),
  single("workshop", cue("leadership", 0, "build future leaders"), 1.8),
  // 09 — Omani talent
  single("omani-youth", S("nationalization"), 2.5),
  single("lab-woman", cue("nationalization", 0, "critical roles and leadership"), 2.2),
  // 10 — OQ's reach
  single("world-map", S("secondment"), 3.4, [1.0, 1.06]),
  // 11 — the people being recognised
  ...montage([S("rewards"), S("rewards") + 1.4 * FPS], ["lab-team", "office-walk"], S("rewards") + 2.9 * FPS),
  // 12 — the workforce the platform serves
  single("open-office", S("platform"), 2.1),
  // 13 — what it means for every employee
  single("coaching", cue("connections", 1, "For every employee"), 2.6),
  // 14 — built by people
  ...montage(
    [
      cue("future", 0, "The future"),
      cue("future", 0, "not built"),
      cue("future", 0, "by systems"),
      cue("future", 0, "It is built by people"),
    ],
    ["eyes-2", "eyes-3", "eyes-7", "face-light"],
    lineEnd("future", 0) + 10,
  ),
  single("glass-building", cue("future", 1, "By investing"), 2.6),
];

const PlateShot: React.FC<{ readonly shot: Shot }> = ({ shot }) => {
  const frame = useCurrentFrame(); // local to the Sequence
  const dur = shot.to - shot.from;
  const len = CLIP_SECONDS[shot.clip] * FPS;
  const rate = Math.max(0.4, Math.min(1, len / dur));
  const o = interpolate(frame, [0, shot.fadeIn, dur - shot.fadeOut, dur], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE.inOut,
  });
  const t = frame / dur;
  const z = shot.zoom[0] + (shot.zoom[1] - shot.zoom[0]) * t;
  const dx = shot.drift[0] * t;
  const dy = shot.drift[1] * t;
  return (
    <AbsoluteFill style={{ opacity: o, overflow: "hidden" }}>
      <Video
        src={staticFile(`footage/${shot.clip}.mp4`)}
        muted
        playbackRate={rate}
        style={{ width: "100%", height: "100%", scale: String(z), translate: `${dx}px ${dy}px` }}
      />
      {/* OQ grade: deep-navy shadows, legible lower third */}
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(4,18,28,0.35) 0%, rgba(4,18,28,0) 28%, rgba(4,18,28,0) 60%, rgba(4,18,28,0.6) 100%)" }} />
      <AbsoluteFill style={{ background: "rgba(8,31,44,0.12)", mixBlendMode: "multiply" }} />
    </AbsoluteFill>
  );
};

export const Plates: React.FC = () => (
  <>
    {SHOTS.map((s, i) => (
      <Sequence key={`${s.clip}-${i}`} from={s.from} durationInFrames={Math.max(1, s.to - s.from)} name={`Plate · ${s.clip}`} layout="none">
        <PlateShot shot={s} />
      </Sequence>
    ))}
  </>
);
