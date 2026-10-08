/**
 * Live-action plates: real OQ RPI people and facilities, cut to the narration.
 * Moving footage comes from the OQ corporate film (cropped clear of its
 * subtitles and watermark); stills are Corporate Communications photographs
 * (public/photos). Every plate fills the frame. Cuts inside a montage are true
 * cross-dissolves (the incoming shot fades in over the outgoing one, so the 3D
 * world never flashes through).
 */
import type React from "react";
import { Video } from "@remotion/media";
import { AbsoluteFill, Img, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { at, cue, FPS, linesOf, SCENES, type SceneId } from "../timeline";
import { EASE } from "../math";
import { COLORS } from "../../theme";

const CLIP_SECONDS: Record<string, number> = {
  "aerial-campus": 1.66, "plant-equipment": 2.18, "eyes-man": 2.08, "world-map": 3.92, "eyes-woman": 0.8,
  staircase: 2.42, "open-office": 1.04, coaching: 1.02, "glass-building": 2.1, "face-light": 2.68,
  "lab-team": 0.7, "lab-woman": 1.68, scientist: 3.42, "omani-youth": 1.9, "field-engineers": 1.4,
  workshop: 0.82, "office-walk": 0.88, "oq-lobby": 1.66, "leadership-call": 2.16, "control-room": 2.6,
  "strategy-glass": 2.3, "talent-review": 2.18, "refinery-aerial": 0.94, "eyes-1": 2.74, "eyes-2": 0.54,
  "eyes-3": 0.86, "eyes-4": 0.86, "eyes-5": 1.58, "eyes-6": 1.06, "eyes-7": 0.94,
};

/** High-resolution Corporate Communications stills that hold up full frame. */
const PHOTOS: Record<string, { readonly focus: string }> = {
  "refinery-night": { focus: "60% 60%" },
  boardroom: { focus: "45% 50%" },
  "team-meeting": { focus: "55% 50%" },
  "masar-cohort": { focus: "50% 45%" },
  "night-panorama": { focus: "50% 55%" },
};

/** OQ RPI people, for the photo wall ("its people"). */
const WALL = [
  "employees", "field-team", "masar-cohort", "lab-engineer",
  "collaboration", "boardroom", "engineer-tablet", "control-room",
  "colleagues-laptop", "operator", "team-meeting", "office-colleagues",
];

type Shot = {
  readonly clip: string; // footage name, photo name, or "wall"
  readonly from: number;
  readonly to: number;
  readonly fadeIn: number;
  readonly fadeOut: number;
  readonly zoom: [number, number];
  readonly drift: [number, number];
};

const XF = 12; // cross-dissolve length inside a montage

/** Shots edge to edge between cue frames, each dissolving over the previous. */
const montage = (cuts: number[], clips: string[], end: number, lastFade = 20): Shot[] =>
  clips.map((clip, i) => {
    const last = i === clips.length - 1;
    return {
      clip,
      from: Math.round(cuts[i]),
      to: Math.round(last ? end : cuts[i + 1] + XF),
      fadeIn: i === 0 ? 16 : XF,
      fadeOut: last ? lastFade : 0,
      zoom: i % 2 ? [1.1, 1.03] : [1.03, 1.1],
      drift: i % 2 ? [-14, 6] : [12, -6],
    };
  });

const single = (clip: string, from: number, seconds: number, zoom: [number, number] = [1.02, 1.1], fadeOut = 20): Shot => ({
  clip,
  from: Math.round(from),
  to: Math.round(from + seconds * FPS),
  fadeIn: 14,
  fadeOut,
  zoom,
  drift: [10, -4],
});

const lineEnd = (id: SceneId, n: number) => linesOf(id)[n].end;
const S = (id: SceneId) => SCENES[id].start;

export const SHOTS: Shot[] = [
  // 01 — one face; OQ RPI's people; then the site, its operation, innovation,
  //      achievement — and the talent behind it
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
    ["eyes-1", "wall", "refinery-night", "control-room", "scientist", "field-engineers", "strategy-glass"],
    lineEnd("opening", 1) + 4,
    30,
  ),
  // 02 — the real site, then the teams who run it
  single("refinery-aerial", S("why"), 2.6, [1.0, 1.12]),
  single("team-meeting", cue("why", 1, "OQ RPI Talent Management exists"), 3.4),
  // 03 — OQ
  single("oq-lobby", S("ecosystem"), 2.6),
  // 04 — a performance conversation
  single("coaching", S("performance"), 2.4),
  // 05 — a talent review in session
  single("talent-review", S("ninebox"), 2.5),
  // 06 — the plant whose safety depends on critical roles
  single("plant-equipment", S("critical"), 2.3),
  // 07 — leaders in discussion
  single("leadership-call", S("succession"), 2.4),
  // 08 — the MASAR cohort at work
  single("masar-cohort", S("leadership"), 3.0),
  // 10 — OQ's reach
  single("world-map", S("secondment"), 3.4, [1.0, 1.06]),
  // 14 — the site at night under the closing title
  single("night-panorama", cue("future", 0, "The future"), (lineEnd("future", 0) + 10 - cue("future", 0, "The future")) / FPS, [1.04, 1.12]),
];

const PhotoWall: React.FC<{ readonly t: number }> = ({ t }) => {
  const frame = useCurrentFrame();
  const cols = 4;
  const gap = 14;
  const tw = (1920 * 1.1 - gap * (cols + 1)) / cols;
  const th = (1080 * 1.1 - gap * 4) / 3;
  return (
    <AbsoluteFill style={{ background: COLORS.midnightDeep, justifyContent: "center", alignItems: "center" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, ${tw}px)`,
          gap,
          scale: String(1.0 + 0.06 * t),
          translate: `${-30 * t}px ${-10 * t}px`,
        }}
      >
        {WALL.map((p, i) => {
          // tiles settle in a diagonal wave
          const d = ((i % cols) + Math.floor(i / cols)) * 3;
          const k = interpolate(frame, [d, d + 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE.out });
          return (
            <div key={p} style={{ width: tw, height: th, overflow: "hidden", borderRadius: 6, opacity: k, scale: String(1.08 - 0.08 * k) }}>
              <Img src={staticFile(`photos/${p}.jpg`)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          );
        })}
      </div>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 70% 65% at 50% 50%, rgba(4,15,23,0) 40%, rgba(4,15,23,0.7) 100%)" }} />
    </AbsoluteFill>
  );
};

const PlateShot: React.FC<{ readonly shot: Shot }> = ({ shot }) => {
  const frame = useCurrentFrame(); // local to the Sequence
  const dur = shot.to - shot.from;
  const len = (CLIP_SECONDS[shot.clip] ?? 1) * FPS;
  const rate = Math.max(0.4, Math.min(1, len / dur));
  const o = interpolate(frame, [0, shot.fadeIn, dur - Math.max(1, shot.fadeOut), dur], [0, 1, 1, shot.fadeOut ? 0 : 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE.inOut,
  });
  const t = frame / dur;
  const z = shot.zoom[0] + (shot.zoom[1] - shot.zoom[0]) * t;
  const dx = shot.drift[0] * t;
  const dy = shot.drift[1] * t;
  const photo = PHOTOS[shot.clip];
  return (
    <AbsoluteFill style={{ opacity: o, overflow: "hidden" }}>
      {shot.clip === "wall" ? (
        <PhotoWall t={t} />
      ) : photo ? (
        <Img
          src={staticFile(`photos/${shot.clip}.jpg`)}
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: photo.focus, scale: String(z), translate: `${dx}px ${dy}px` }}
        />
      ) : (
        <Video
          src={staticFile(`footage/${shot.clip}.mp4`)}
          muted
          playbackRate={rate}
          style={{ width: "100%", height: "100%", scale: String(z), translate: `${dx}px ${dy}px` }}
        />
      )}
      {/* OQ grade: deep-navy shadows, legible lower third */}
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(4,18,28,0.35) 0%, rgba(4,18,28,0) 28%, rgba(4,18,28,0) 55%, rgba(4,18,28,0.65) 100%)" }} />
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
