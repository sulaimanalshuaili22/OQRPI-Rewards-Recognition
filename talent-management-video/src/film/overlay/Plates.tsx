/**
 * Live-action plates: real OQ RPI people and facilities, cut to the narration.
 * Moving footage comes from the OQ corporate film (cropped clear of its
 * subtitles and watermark); stills are Corporate Communications photographs
 * (public/photos). Each plate covers the 3D world, then dissolves into it.
 */
import type React from "react";
import { Video } from "@remotion/media";
import { AbsoluteFill, Img, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { at, cue, FPS, linesOf, SCENES, type SceneId } from "../timeline";
import { EASE } from "../math";
import { COLORS, FONT } from "../../theme";

const CLIP_SECONDS: Record<string, number> = {
  "aerial-campus": 1.66, "plant-equipment": 2.18, "eyes-man": 2.08, "world-map": 3.92, "eyes-woman": 0.8,
  staircase: 2.42, "open-office": 1.04, coaching: 1.02, "glass-building": 2.1, "face-light": 2.68,
  "lab-team": 0.7, "lab-woman": 1.68, scientist: 3.42, "omani-youth": 1.9, "field-engineers": 1.4,
  workshop: 0.82, "office-walk": 0.88, "oq-lobby": 1.66, "leadership-call": 2.16, "control-room": 2.6,
  "strategy-glass": 2.3, "talent-review": 2.18, "refinery-aerial": 0.94, "eyes-1": 2.74, "eyes-2": 0.54,
  "eyes-3": 0.86, "eyes-4": 0.86, "eyes-5": 1.58, "eyes-6": 1.06, "eyes-7": 0.94,
};

/**
 * Corporate Communications stills. "cover" fills the frame (high-resolution
 * photographs); "frame" sets a smaller photograph as a print on a blurred,
 * graded copy of itself, so it stays sharp at 1080p and 4K.
 */
type Photo = { readonly mode: "cover" | "frame"; readonly side?: "left" | "right" | "center"; readonly focus?: string; readonly label: string };
const PHOTOS: Record<string, Photo> = {
  "refinery-night": { mode: "cover", focus: "60% 60%", label: "OQ RPI · Sohar" },
  boardroom: { mode: "cover", focus: "45% 50%", label: "OQ RPI · Leadership" },
  "team-meeting": { mode: "cover", focus: "55% 50%", label: "OQ RPI · Our teams" },
  "masar-cohort": { mode: "cover", focus: "50% 45%", label: "MASAR · Leadership journey" },
  employees: { mode: "frame", side: "right", label: "OQ RPI · Our people" },
  "lab-engineer": { mode: "frame", side: "left", label: "OQ RPI · Innovation" },
  "field-team": { mode: "frame", side: "center", label: "OQ RPI · Operations" },
  "growth-chart": { mode: "frame", side: "right", label: "Performance & Potential" },
  operator: { mode: "frame", side: "left", label: "OQ RPI · Operations" },
  "colleagues-laptop": { mode: "frame", side: "right", label: "Succession · Development" },
  collaboration: { mode: "frame", side: "left", label: "OQ RPI · One team" },
  "engineer-tablet": { mode: "frame", side: "right", label: "Omani talent · Future leaders" },
  "digital-talent": { mode: "frame", side: "right", label: "OQ · Digital talent" },
  "office-colleagues": { mode: "frame", side: "left", label: "OQ RPI · Growing together" },
  "night-panorama": { mode: "frame", side: "center", label: "OQ RPI · Sohar" },
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
  // 01 — one face, then the people, the site, its operation, innovation and achievement
  ...montage(
    [
      at("opening", 3.2),
      cue("opening", 0, "its people"),
      cue("opening", 1, "At OQ RPI"),
      cue("opening", 1, "every operation"),
      cue("opening", 1, "every innovation"),
      cue("opening", 1, "every achievement"),
      cue("opening", 1, "lies talent"),
    ],
    ["eyes-1", "employees", "refinery-night", "control-room", "lab-engineer", "field-team", "boardroom"],
    lineEnd("opening", 1) + 20,
    6,
    40,
  ),
  // 02 — the real site, then the teams who run it
  single("refinery-aerial", S("why"), 2.6, [1.0, 1.12]),
  single("team-meeting", cue("why", 1, "OQ RPI Talent Management exists"), 3.4),
  // 03 — OQ
  single("oq-lobby", S("ecosystem"), 2.6),
  // 04 — field engineers at work; growth on the glass
  ...montage([S("performance"), S("performance") + 1.4 * FPS], ["field-engineers", "growth-chart"], S("performance") + 3.4 * FPS),
  // 05 — a talent review conversation
  single("talent-review", S("ninebox"), 2.5),
  // 06 — process plant, and the operators who keep it safe
  ...montage([S("critical"), S("critical") + 1.3 * FPS], ["plant-equipment", "operator"], S("critical") + 3.3 * FPS),
  // 07 — leaders in discussion; a successor being developed
  ...montage([S("succession"), S("succession") + 1.3 * FPS], ["leadership-call", "colleagues-laptop"], S("succession") + 3.3 * FPS),
  // 08 — the MASAR cohort at work
  single("masar-cohort", S("leadership"), 3.0),
  // 09 — Omani and expatriate colleagues as one team; a future Omani leader
  single("collaboration", S("nationalization"), 2.6),
  single("engineer-tablet", cue("nationalization", 0, "critical roles and leadership"), 2.6),
  // 10 — OQ's reach
  single("world-map", S("secondment"), 3.4, [1.0, 1.06]),
  // 11 — the people being recognised
  ...montage([S("rewards"), S("rewards") + 1.4 * FPS], ["lab-team", "office-walk"], S("rewards") + 2.9 * FPS),
  // 12 — OQ's digital talent
  single("digital-talent", S("platform"), 2.4),
  // 13 — what it means for every employee
  single("office-colleagues", cue("connections", 1, "For every employee"), 2.8),
  // 14 — the site at night, then its people
  ...montage(
    [cue("future", 0, "The future"), cue("future", 0, "It is built by people")],
    ["night-panorama", "employees"],
    lineEnd("future", 0) + 10,
  ),
  single("glass-building", cue("future", 1, "By investing"), 2.6),
];

const PhotoPlate: React.FC<{
  readonly name: string;
  readonly photo: Photo;
  readonly t: number;
  readonly z: number;
  readonly dx: number;
  readonly dy: number;
}> = ({ name, photo, t, z, dx, dy }) => {
  const src = staticFile(`photos/${name}.jpg`);
  const label = (
    <div style={{ position: "absolute", left: 0, top: -50, display: "flex", alignItems: "center", gap: 12, fontFamily: FONT, fontSize: 17, fontWeight: 600, letterSpacing: 3, color: "rgba(255,255,255,0.9)", textTransform: "uppercase", opacity: interpolate(t, [0.1, 0.3], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), whiteSpace: "nowrap" }}>
      <div style={{ width: 28, height: 3, background: COLORS.orange }} />
      {photo.label}
    </div>
  );
  if (photo.mode === "cover") {
    return (
      <AbsoluteFill>
        <Img src={src} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: photo.focus ?? "50% 50%", scale: String(z), translate: `${dx}px ${dy}px` }} />
        <div style={{ position: "absolute", left: 96, top: 170 }}>{label}</div>
      </AbsoluteFill>
    );
  }
  // a sharp print over a soft, graded copy of the same photograph
  const side = photo.side ?? "center";
  const boxW = side === "center" ? 1500 : 940;
  const boxH = side === "center" ? 640 : 760;
  const left = side === "left" ? 150 : side === "right" ? 1920 - 150 - boxW : (1920 - boxW) / 2;
  return (
    <AbsoluteFill style={{ background: COLORS.midnight }}>
      <Img src={src} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "blur(36px) brightness(0.45) saturate(1.1)", scale: String(1.15 + (z - 1)) }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 80% 70% at 50% 45%, rgba(8,31,44,0.1) 0%, rgba(8,31,44,0.7) 100%)" }} />
      <div style={{ position: "absolute", left: left + dx * 0.6, top: 150 + dy * 0.6, width: boxW, height: boxH, display: "flex", justifyContent: side === "right" ? "flex-end" : side === "left" ? "flex-start" : "center", alignItems: "center" }}>
        <div style={{ position: "relative", height: "100%", maxWidth: "100%", display: "flex" }}>
          <Img src={src} style={{ height: "100%", maxWidth: "100%", objectFit: "contain", borderRadius: 6, boxShadow: "0 30px 80px rgba(0,0,0,0.55)", scale: String(1 + (z - 1) * 0.4) }} />
          {label}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const PlateShot: React.FC<{ readonly shot: Shot }> = ({ shot }) => {
  const frame = useCurrentFrame(); // local to the Sequence
  const dur = shot.to - shot.from;
  const photo = PHOTOS[shot.clip];
  const len = (CLIP_SECONDS[shot.clip] ?? 1) * FPS;
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
      {photo ? (
        <PhotoPlate name={shot.clip} photo={photo} t={t} z={z} dx={dx} dy={dy} />
      ) : (
        <Video
          src={staticFile(`footage/${shot.clip}.mp4`)}
          muted
          playbackRate={rate}
          style={{ width: "100%", height: "100%", scale: String(z), translate: `${dx}px ${dy}px` }}
        />
      )}
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
