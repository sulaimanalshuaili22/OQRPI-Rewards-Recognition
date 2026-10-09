/**
 * v5 visual kit. Real photography and footage are the primary world; every
 * graphic is an overlay on it. Type rules for projection: body 32 px and up,
 * labels 26 px and up (bold capitals), fine print (sources) 24 px. Nothing is
 * placed outside the 10% safe area (SX, SY), so the film is LED-wall safe.
 */
import type React from "react";
import { useMemo } from "react";
import { Video } from "@remotion/media";
import { AbsoluteFill, Img, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { clamp, EASE, ramp, window01 } from "../film/math";
import { COLORS, FONT, FONT_AR } from "../theme";
import { FPS, LINES, SCENE_LIST, type SceneId } from "./timeline";

export const W = 1920;
export const H = 1080;
/** 10% safe area */
export const SX = 192;
export const SY = 108;

export const fmt = (n: number) => n.toLocaleString("en-US");

/* ------------------------------------------------------------------ plates */

/** Source size of each plate (photos in public/photos, footage in public/footage). */
const SOURCES: Record<string, { readonly size: [number, number]; readonly video?: number }> = {
  // Corporate Communications photographs
  "refinery-night": { size: [2400, 1348] },
  "control-room-operator": { size: [2000, 1334] },
  "sunset-pointing": { size: [2000, 1334] },
  "tablet-sunset": { size: [2000, 1334] },
  "tablet-dusk-plant": { size: [2000, 1334] },
  "walk-glass": { size: [2000, 1334] },
  "engineers-walking": { size: [2000, 1334] },
  "site-engineer-drawings": { size: [2000, 1334] },
  "office-walk-laptop": { size: [2000, 1125] },
  "team-meeting": { size: [2000, 1336] },
  boardroom: { size: [2400, 1601] },
  "masar-cohort": { size: [1600, 1200] },
  "robban-cohort": { size: [1600, 900] },
  "site-dusk-aerial": { size: [2000, 1124] },
  // moving footage (seconds of usable clip)
  "control-room": { size: [1920, 1080], video: 2.6 },
  "talent-review": { size: [1920, 1080], video: 2.18 },
  "boardroom-live": { size: [1920, 1080], video: 5.03 },
  "masar-cohort-live": { size: [1920, 1080], video: 5.03 },
  "robban-cohort-live": { size: [1920, 1080], video: 5.03 },
  "team-meeting-live": { size: [1920, 1080], video: 5.03 },
  "employees-live": { size: [1920, 1080], video: 5.03 },
  "sunrise-drone": { size: [1920, 1080], video: 10.0 },
  "refinery-aerial": { size: [1920, 1080], video: 0.94 },
  "field-engineers": { size: [1920, 1080], video: 1.4 },
  "lab-woman": { size: [1920, 1080], video: 1.68 },
  scientist: { size: [1920, 1080], video: 3.42 },
};

export type Shot = {
  readonly clip: keyof typeof SOURCES | string;
  readonly from: number;
  readonly to: number;
  /** crop: centre (0–1 of the source) and the width of the source to show (0–1) */
  readonly crop?: { readonly cx: number; readonly cy: number; readonly w: number };
  readonly zoom?: [number, number];
  /** drift in px over the shot */
  readonly drift?: [number, number];
  readonly fadeIn?: number;
  readonly fadeOut?: number;
  /** 0–1 extra darkening for text legibility */
  readonly dim?: number;
  /** seconds into the clip to start from */
  readonly trim?: number;
  /** from frame `at` (absolute), blur and darken the plate so data can sit over people without covering faces */
  readonly soften?: { readonly at: number; readonly dim: number; readonly blur: number };
  /** overlay locked to the photograph (positioned in % of the source) */
  readonly locked?: React.ReactNode;
};

const PlateShot: React.FC<{ readonly shot: Shot }> = ({ shot }) => {
  const frame = useCurrentFrame(); // local to the Sequence
  const src = SOURCES[shot.clip];
  if (!src) {
    throw new Error(`Unknown plate ${shot.clip}`);
  }
  const dur = shot.to - shot.from;
  const fadeIn = Math.min(shot.fadeIn ?? 12, Math.floor(dur / 2) - 1);
  const fadeOutF = shot.fadeOut ?? 12;
  const fadeOut = Math.min(Math.max(1, fadeOutF), dur - fadeIn - 1);
  const o = interpolate(frame, [0, fadeIn, dur - fadeOut, dur], [fadeIn > 0 ? 0 : 1, 1, 1, fadeOutF ? 0 : 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE.inOut,
  });
  const t = EASE.inOut(clamp(frame / dur));
  const [zA, zB] = shot.zoom ?? [1.0, 1.06];
  const z = zA + (zB - zA) * t;
  const [sw, sh] = src.size;
  const crop = shot.crop ?? { cx: 0.5, cy: 0.5, w: Math.min(1, (W / H) / (sw / sh)) };
  // displayed image size: the crop width fills the frame, then the camera zoom
  let imgW = (W / crop.w) * z;
  let imgH = imgW * (sh / sw);
  if (imgH < H) {
    imgH = H * z;
    imgW = imgH * (sw / sh);
  }
  const dx = (shot.drift?.[0] ?? 0) * t;
  const dy = (shot.drift?.[1] ?? 0) * t;
  // keep the frame covered whatever the crop and drift
  const left = clamp(W / 2 - crop.cx * imgW + dx, W - imgW, 0);
  const top = clamp(H / 2 - crop.cy * imgH + dy, H - imgH, 0);

  let media: React.ReactNode;
  if (src.video) {
    const len = (src.video - (shot.trim ?? 0)) * FPS;
    // slow the clip to fill the shot; never ask it to run past its last frame
    const rate = len / dur;
    if (rate < 0.34) {
      throw new Error(`Shot ${shot.clip} (${dur} f) is too long for its ${src.video}s clip`);
    }
    media = (
      <Video
        src={staticFile(`footage/${shot.clip}.mp4`)}
        muted
        playbackRate={Math.min(1, rate)}
        trimBefore={shot.trim ? Math.round(shot.trim * FPS) : undefined}
        style={{ width: "100%", height: "100%" }}
      />
    );
  } else {
    media = <Img src={staticFile(`photos/${shot.clip}.jpg`)} style={{ width: "100%", height: "100%" }} />;
  }
  const soft = shot.soften ? ramp(frame, shot.soften.at - shot.from, shot.soften.at - shot.from + 18, EASE.inOut) : 0;
  return (
    <AbsoluteFill style={{ opacity: o, overflow: "hidden", backgroundColor: COLORS.midnightDeep }}>
      <div style={{ position: "absolute", left, top, width: imgW, height: imgH, filter: soft > 0.01 ? `blur(${(soft * (shot.soften?.blur ?? 0)).toFixed(1)}px)` : undefined }}>
        {media}
        {shot.locked ? <div style={{ position: "absolute", inset: 0 }}>{shot.locked}</div> : null}
      </div>
      {/* OQ grade: deep-navy shadows, quiet lower third for the captions */}
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(4,18,28,0.3) 0%, rgba(4,18,28,0) 24%, rgba(4,18,28,0) 58%, rgba(4,18,28,0.6) 100%)" }} />
      {shot.dim || soft ? <AbsoluteFill style={{ background: `rgba(4,15,23,${Math.max(shot.dim ?? 0, soft * (shot.soften?.dim ?? 0))})` }} /> : null}
    </AbsoluteFill>
  );
};

export const Plates: React.FC<{ readonly shots: readonly Shot[] }> = ({ shots }) => (
  <>
    {shots.map((s, i) => (
      <Sequence key={`${s.clip}-${i}`} from={s.from} durationInFrames={Math.max(1, s.to - s.from)} name={`Plate · ${s.clip}`} layout="none">
        <PlateShot shot={s} />
      </Sequence>
    ))}
  </>
);

/* ------------------------------------------------------------------ OQ stripes */

/** The three OQ stripes (orange, silver, turquoise): the film's one motion signature. */
export const Stripes: React.FC<{ readonly progress: number; readonly scale?: number }> = ({ progress, scale = 1 }) => (
  <svg width={150 * scale} height={96 * scale} viewBox="0 0 150 96" style={{ overflow: "visible" }}>
    <polygon points="76,0 106,0 34,96 4,96" fill={COLORS.orange} opacity={progress} transform={`translate(${(1 - progress) * 40} 0)`} />
    <polygon points="116,0 131,0 59,96 44,96" fill={COLORS.silver} opacity={progress} transform={`translate(${(1 - progress) * 60} 0)`} />
    <polygon points="138,0 150,0 78,96 66,96" fill={COLORS.turquoise} opacity={progress} transform={`translate(${(1 - progress) * 80} 0)`} />
  </svg>
);

/**
 * Scene change: the three OQ stripes sweep across the frame at the stripe
 * angle; the cut happens under the orange stripe.
 */
export const StripeWipe: React.FC<{ readonly at: number }> = ({ at }) => {
  const frame = useCurrentFrame();
  const d = frame - at;
  if (d < -16 || d > 18) return null;
  const bars = [
    { col: COLORS.orange, w: 420, delay: 0 },
    { col: COLORS.silver, w: 120, delay: 3 },
    { col: COLORS.turquoise, w: 90, delay: 6 },
  ];
  return (
    <AbsoluteFill style={{ pointerEvents: "none", overflow: "hidden" }}>
      {bars.map((b, i) => {
        const p = interpolate(d - b.delay, [-16, 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE.inOut });
        const x = -900 + p * (W + 1800);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              top: -200,
              left: x - b.w / 2,
              width: b.w,
              height: H + 400,
              background: b.col,
              transform: "skewX(-37deg)",
              opacity: i === 0 ? 0.96 : 0.9,
              boxShadow: i === 0 ? `0 0 80px 20px ${COLORS.orange}66` : undefined,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ type */

export const Kicker: React.FC<{ readonly children: React.ReactNode; readonly color?: string; readonly o?: number }> = ({ children, color = COLORS.orange, o = 1 }) => (
  <div style={{ fontFamily: FONT, fontSize: 26, fontWeight: 700, letterSpacing: 5, textTransform: "uppercase", color, opacity: o, display: "flex", alignItems: "center", gap: 16 }}>
    <div style={{ width: 44, height: 3, background: color }} />
    {children}
  </div>
);

/** Words rise into place one by one. */
export const Reveal: React.FC<{
  readonly text: string;
  readonly at: number;
  readonly size: number;
  readonly weight?: number;
  readonly color?: string;
  readonly stagger?: number;
  readonly align?: "left" | "center" | "right";
  readonly maxWidth?: number;
}> = ({ text, at, size, weight = 600, color = COLORS.white, stagger = 3, align = "left", maxWidth }) => {
  const frame = useCurrentFrame();
  const words = text.split(" ");
  return (
    <div
      style={{
        fontFamily: FONT,
        fontSize: size,
        fontWeight: weight,
        color,
        lineHeight: 1.12,
        letterSpacing: size > 60 ? -1 : 0,
        display: "flex",
        flexWrap: "wrap",
        justifyContent: align === "center" ? "center" : align === "right" ? "flex-end" : "flex-start",
        columnGap: size * 0.26,
        maxWidth,
        textShadow: "0 2px 18px rgba(0,0,0,0.55)",
      }}
    >
      {words.map((w, i) => {
        const k = ramp(frame, at + i * stagger, at + i * stagger + 18, EASE.out);
        return (
          <span key={i} style={{ display: "inline-block", overflow: "hidden", paddingBottom: size * 0.08 }}>
            <span style={{ display: "inline-block", translate: `0px ${(1 - k) * 105}%`, opacity: k }}>{w}</span>
          </span>
        );
      })}
    </div>
  );
};

/** A count-up number. */
export const Count: React.FC<{
  readonly to: number;
  readonly at: number;
  readonly dur?: number;
  readonly size: number;
  readonly color?: string;
  readonly from?: number;
}> = ({ to, at, dur = 36, size, color = COLORS.white, from = 0 }) => {
  const frame = useCurrentFrame();
  const k = ramp(frame, at, at + dur, EASE.out);
  const v = Math.round(from + (to - from) * k);
  return (
    <div
      style={{
        fontFamily: FONT,
        fontSize: size,
        fontWeight: 700,
        color,
        lineHeight: 0.95,
        letterSpacing: -size * 0.03,
        fontVariantNumeric: "tabular-nums",
        opacity: ramp(frame, at - 4, at + 8),
        textShadow: "0 4px 30px rgba(0,0,0,0.5)",
      }}
    >
      {fmt(v)}
    </div>
  );
};

export type Status = "DELIVERED" | "IN PLACE" | "PLAN";
const CHIP: Record<Status, { readonly bg: string; readonly fg: string; readonly border: string }> = {
  DELIVERED: { bg: COLORS.green, fg: "#fff", border: COLORS.green },
  "IN PLACE": { bg: COLORS.turquoise, fg: "#fff", border: COLORS.turquoise },
  PLAN: { bg: "transparent", fg: COLORS.yellow, border: COLORS.yellow },
};

export const Chip: React.FC<{ readonly s: Status; readonly o?: number }> = ({ s, o = 1 }) => (
  <span
    style={{
      fontFamily: FONT,
      fontSize: 22,
      fontWeight: 800,
      letterSpacing: 2.5,
      padding: "6px 14px",
      borderRadius: 6,
      background: CHIP[s].bg,
      color: CHIP[s].fg,
      border: `2px solid ${CHIP[s].border}`,
      opacity: o,
      whiteSpace: "nowrap",
      display: "inline-block",
      lineHeight: 1.1,
    }}
  >
    {s}
  </span>
);

/** Fine print: source and data date. */
export const Source: React.FC<{ readonly o?: number; readonly text?: string }> = ({ o = 1, text = "Source: OQ RPI Talent Command Center · data as of 30 Sep 2026" }) => (
  <div style={{ fontFamily: FONT, fontSize: 24, fontWeight: 500, color: "rgba(230,233,234,0.78)", opacity: o, letterSpacing: 0.3 }}>{text}</div>
);

/** Panel: a dark glass block that keeps type legible over photography. */
export const Panel: React.FC<{ readonly children: React.ReactNode; readonly style?: React.CSSProperties }> = ({ children, style }) => (
  <div
    style={{
      background: "linear-gradient(135deg, rgba(8,31,44,0.86), rgba(4,15,23,0.78))",
      border: "1px solid rgba(255,255,255,0.14)",
      borderRadius: 18,
      boxShadow: "0 30px 80px rgba(0,0,0,0.45)",
      padding: "34px 40px",
      ...style,
    }}
  >
    {children}
  </div>
);

/* ------------------------------------------------------------------ movement marker */

/** Act/movement marker, top right: "II · KNOW" with its Arabic. */
export const Movement: React.FC<{
  readonly from: number;
  readonly to: number;
  readonly index: string;
  readonly en: string;
  readonly ar: string;
  readonly sub: string;
}> = ({ from, to, index, en, ar, sub }) => {
  const frame = useCurrentFrame();
  if (frame < from || frame > to) return null;
  const o = window01(frame, from, to, 12, 18);
  const line = ramp(frame, from, from + 24);
  return (
    <div style={{ position: "absolute", right: SX, top: SY, textAlign: "right", fontFamily: FONT, opacity: o, textShadow: "0 2px 12px rgba(0,0,0,0.6)" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "flex-end", gap: 18 }}>
        <span style={{ fontSize: 30, fontWeight: 600, color: COLORS.orange, letterSpacing: 3 }}>{index}</span>
        <span style={{ fontSize: 46, fontWeight: 800, color: COLORS.white, letterSpacing: 8 }}>{en}</span>
        <span style={{ fontFamily: FONT_AR, fontSize: 44, fontWeight: 700, color: COLORS.lightBlue }}>{ar}</span>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 14, marginTop: 8 }}>
        <div style={{ width: 70 * line, height: 2, background: "rgba(255,255,255,0.65)" }} />
        <span style={{ fontSize: 28, fontWeight: 400, color: "rgba(255,255,255,0.92)" }}>{sub}</span>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ captions */

type Chunk = { text: string; start: number; end: number };

/** Split narration into balanced subtitles: as few as fit `max`, of similar length, ending at punctuation where possible. */
export const chunkLine = (text: string, start: number, end: number, max = 80): Chunk[] => {
  const words = text.split(" ");
  const n = Math.ceil(text.length / max);
  const target = text.length / n;
  const parts: string[] = [];
  let cur = "";
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    const left = parts.length < n - 1;
    const punct = /[,.:?…]$/.test(cur);
    if (cur && left && (next.length > target * 1.15 || (punct && cur.length > target * 0.6))) {
      parts.push(cur);
      cur = w;
    } else {
      cur = next;
    }
  }
  parts.push(cur);
  const total = parts.reduce((a, p) => a + p.length, 0);
  const speechEnd = end - 8;
  let t = start;
  return parts.map((p, i) => {
    const d = ((speechEnd - start) * p.length) / total;
    const c = { text: p, start: Math.round(t), end: Math.round(i === parts.length - 1 ? end : t + d) };
    t += d;
    return c;
  });
};

/** Documentary subtitles. Lines set as on-screen titles are not repeated as captions. */
export const Captions: React.FC<{ readonly skip: (scene: SceneId, n: number) => boolean }> = ({ skip }) => {
  const frame = useCurrentFrame();
  const chunks = useMemo(() => {
    const count: Partial<Record<SceneId, number>> = {};
    return LINES.flatMap((l) => {
      const n = count[l.scene] ?? 0;
      count[l.scene] = n + 1;
      return skip(l.scene, n) ? [] : chunkLine(l.text, l.start, l.end);
    });
  }, [skip]);
  const c = chunks.find((k) => frame >= k.start && frame <= k.end);
  if (!c) return null;
  const o = window01(frame, c.start, c.end, 6, 6);
  return (
    <div style={{ position: "absolute", left: SX, right: SX, bottom: SY - 20, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
      <div
        style={{
          fontFamily: FONT,
          fontSize: 38,
          fontWeight: 500,
          lineHeight: 1.3,
          color: "#fff",
          textAlign: "center",
          padding: "6px 18px",
          borderRadius: 8,
          background: "rgba(2,8,13,0.45)",
          textShadow: "0 2px 6px rgba(0,0,0,0.85)",
          opacity: o,
        }}
      >
        {c.text}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ grade, brand */

export const Grade: React.FC = () => {
  const frame = useCurrentFrame();
  const seed = Math.floor(frame % 24);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 80% 75% at 50% 48%, rgba(0,0,0,0) 55%, rgba(1,5,9,0.6) 100%)" }} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity: 0.06, mixBlendMode: "overlay" }}>
        <filter id="grain5">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={seed} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain5)" />
      </svg>
    </AbsoluteFill>
  );
};

const LOGO = staticFile("brand/oq-rpi-logo-white.png");
export const LOGO_RATIO = 1866 / 450;
export const LogoImg: React.FC<{ readonly width: number; readonly style?: React.CSSProperties }> = ({ width, style }) => (
  <Img src={LOGO} style={{ width, height: width / LOGO_RATIO, ...style }} />
);

/** Small OQ RPI mark, top left, inside the safe area. */
export const Watermark: React.FC<{ readonly from: number; readonly to: number }> = ({ from, to }) => {
  const frame = useCurrentFrame();
  const o = window01(frame, from, to, 20, 20);
  if (o <= 0) return null;
  return (
    <div style={{ position: "absolute", left: SX, top: SY, opacity: 0.9 * o, display: "flex", alignItems: "center", gap: 16 }}>
      <LogoImg width={150} style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.5))" }} />
    </div>
  );
};

/** Frames where a scene starts (for the stripe wipe), skipping the ones listed. */
export const sceneStarts = (except: readonly SceneId[]) => SCENE_LIST.slice(1).filter((s) => !except.includes(s.id)).map((s) => s.start);
