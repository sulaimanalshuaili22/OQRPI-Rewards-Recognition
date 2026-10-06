import type React from "react";
import { useMemo } from "react";
import * as THREE from "three";
import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";
import { cameraAt } from "../camera";
import { clamp, EASE, ramp, window01, type V3 } from "../math";
import { LINES, SCENE_LIST, SCENES, type SceneId } from "../timeline";
import { COLORS, FONT } from "../../theme";
import { Icon, type IconName } from "../../components/Icons";

export const W = 1920;
export const H = 1080;

/* ------------------------------------------------------------------ projection */

const projCam = new THREE.PerspectiveCamera(30, W / H, 0.1, 900);
const tmp = new THREE.Vector3();
const fwd = new THREE.Vector3();

export type Projected = {
  readonly x: number;
  readonly y: number;
  readonly depth: number;
  readonly visible: boolean;
  /** CSS blur matching the 3D depth of field */
  readonly blur: number;
  readonly focus: number;
};

export const project = (frame: number, p: V3): Projected => {
  const c = cameraAt(frame);
  projCam.position.set(c.pos[0], c.pos[1], c.pos[2]);
  projCam.fov = c.fov;
  projCam.aspect = W / H;
  projCam.updateProjectionMatrix();
  projCam.lookAt(c.look[0], c.look[1], c.look[2]);
  projCam.updateMatrixWorld();
  tmp.set(p[0], p[1], p[2]);
  projCam.getWorldDirection(fwd);
  const depth = tmp.clone().sub(projCam.position).dot(fwd);
  tmp.project(projCam);
  const x = ((tmp.x + 1) / 2) * W;
  const y = ((1 - tmp.y) / 2) * H;
  const visible = depth > 0.5 && x > -300 && x < W + 300 && y > -300 && y < H + 300;
  const blur = clamp((Math.abs(depth - c.focus) / Math.max(1, c.focus)) * c.bokeh * 2.2, 0, 7);
  return { x, y, depth, visible, blur, focus: c.focus };
};

/* ------------------------------------------------------------------ anchored */

/** Places children at the screen projection of a 3D point (follows the camera, gets DOF blur). */
export const Anchored: React.FC<{
  readonly at: V3;
  readonly from: number;
  readonly to: number;
  readonly children: React.ReactNode;
  readonly sizeWithDistance?: boolean;
  readonly refDepth?: number;
  readonly inF?: number;
  readonly outF?: number;
  readonly maxBlur?: number;
}> = ({ at, from, to, children, sizeWithDistance = false, refDepth = 14, inF = 14, outF = 14, maxBlur = 2.4 }) => {
  const frame = useCurrentFrame();
  if (frame < from || frame > to) return null;
  const pr = project(frame, at);
  if (!pr.visible) return null;
  const o = window01(frame, from, to, inF, outF);
  const s = sizeWithDistance ? clamp(refDepth / pr.depth, 0.55, 1.35) : 1;
  return (
    <div
      style={{
        position: "absolute",
        left: pr.x,
        top: pr.y,
        opacity: o,
        filter: pr.blur > 0.4 ? `blur(${Math.min(maxBlur, pr.blur).toFixed(2)}px)` : undefined,
        scale: String(s),
        transformOrigin: "0 0",
      }}
    >
      {children}
    </div>
  );
};

/* ------------------------------------------------------------------ AR tag */

export const Tag: React.FC<{
  readonly at: V3;
  readonly from: number;
  readonly to: number;
  readonly label: string;
  readonly sub?: string;
  readonly icon?: IconName;
  readonly side?: "left" | "right";
  readonly accent?: "orange" | "turquoise";
  readonly lift?: number;
  readonly size?: number;
}> = ({ at, from, to, label, sub, icon, side = "right", accent = "orange", lift = 64, size = 26 }) => {
  const frame = useCurrentFrame();
  const draw = ramp(frame, from, from + 16);
  const textIn = ramp(frame, from + 8, from + 24);
  const col = accent === "orange" ? COLORS.orange : COLORS.turquoise;
  const dx = side === "right" ? 1 : -1;
  const run = 46;
  return (
    <Anchored at={at} from={from} to={to}>
      <svg width={1} height={1} style={{ position: "absolute", overflow: "visible" }}>
        <circle cx={0} cy={0} r={5} fill={col} />
        <circle cx={0} cy={0} r={11 + 3 * Math.sin(frame * 0.15)} fill="none" stroke={col} strokeOpacity={0.6} strokeWidth={1.5} />
        <path
          d={`M0 0 L${dx * lift * 0.6} ${-lift} L${dx * (lift * 0.6 + run)} ${-lift}`}
          fill="none"
          stroke="rgba(255,255,255,0.75)"
          strokeWidth={1.4}
          strokeDasharray={300}
          strokeDashoffset={300 * (1 - draw)}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          top: -lift,
          left: side === "right" ? lift * 0.6 + run + 8 : undefined,
          right: side === "left" ? lift * 0.6 + run + 8 : undefined,
          transform: "translateY(-50%)",
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: `10px 18px 10px ${icon ? 12 : 18}px`,
          borderRadius: 12,
          background: "linear-gradient(135deg, rgba(10,32,44,0.72), rgba(4,15,23,0.55))",
          border: "1px solid rgba(255,255,255,0.16)",
          boxShadow: "0 12px 40px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.12)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          fontFamily: FONT,
          whiteSpace: "nowrap",
          opacity: textIn,
          translate: `${dx * (1 - textIn) * 14}px 0px`,
        }}
      >
        {icon ? (
          <div style={{ width: 36, height: 36, borderRadius: 9, background: `${col}22`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name={icon} size={22} color={col} />
          </div>
        ) : (
          <div style={{ width: 3, height: size * 1.1, background: col, borderRadius: 2 }} />
        )}
        <div>
          <div style={{ fontSize: size, fontWeight: 600, color: COLORS.white, letterSpacing: -0.2, lineHeight: 1.1 }}>{label}</div>
          {sub ? (
            <div style={{ fontSize: size * 0.62, fontWeight: 500, color: COLORS.lightBlue, letterSpacing: 1.2, textTransform: "uppercase", marginTop: 4 }}>
              {sub}
            </div>
          ) : null}
        </div>
      </div>
    </Anchored>
  );
};

/* ------------------------------------------------------------------ glass card */

export const Card: React.FC<{
  readonly at: V3;
  readonly from: number;
  readonly to: number;
  readonly title: string;
  readonly width?: number;
  readonly children: React.ReactNode;
  readonly accent?: "orange" | "turquoise";
  readonly offset?: [number, number];
  readonly refDepth?: number;
}> = ({ at, from, to, title, width = 380, children, accent = "turquoise", offset = [0, 0], refDepth = 14 }) => {
  const frame = useCurrentFrame();
  const t = ramp(frame, from, from + 22);
  const col = accent === "orange" ? COLORS.orange : COLORS.turquoise;
  return (
    <Anchored at={at} from={from} to={to} sizeWithDistance refDepth={refDepth} maxBlur={1.1}>
      <div
        style={{
          position: "absolute",
          left: offset[0] - width / 2,
          top: offset[1],
          width,
          padding: 22,
          borderRadius: 18,
          background: "linear-gradient(140deg, rgba(14,40,54,0.62) 0%, rgba(4,15,23,0.5) 70%)",
          border: "1px solid rgba(255,255,255,0.14)",
          boxShadow: "0 30px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.16)",
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
          fontFamily: FONT,
          translate: `0px ${(1 - t) * 18}px`,
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", left: 0, top: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${col}, rgba(255,255,255,0))` }} />
        <div style={{ fontSize: 15, letterSpacing: 2.6, textTransform: "uppercase", color: COLORS.midnight30, fontWeight: 500 }}>{title}</div>
        <div style={{ marginTop: 12 }}>{children}</div>
      </div>
    </Anchored>
  );
};

/* ------------------------------------------------------------------ cinematic title */

export const Title: React.FC<{
  readonly from: number;
  readonly to: number;
  readonly lines: ReadonlyArray<{ text: string; size: number; weight?: number; color?: string; tracking?: number; delay?: number }>;
  readonly at?: V3;
  readonly y?: number;
}> = ({ from, to, lines, at, y = 0 }) => {
  const frame = useCurrentFrame();
  if (frame < from || frame > to) return null;
  const out = 1 - ramp(frame, to - 20, to, EASE.inOut);
  const body = (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18, fontFamily: FONT, opacity: out }}>
      {lines.map((l, i) => {
        const t = ramp(frame, from + (l.delay ?? i * 14), from + (l.delay ?? i * 14) + 40);
        const tr = (l.tracking ?? 0) + (1 - t) * 18;
        return (
          <div
            key={i}
            style={{
              fontSize: l.size,
              fontWeight: l.weight ?? 300,
              color: l.color ?? COLORS.white,
              letterSpacing: tr,
              opacity: t,
              filter: `blur(${(1 - t) * 12}px)`,
              textShadow: "0 0 40px rgba(0,0,0,0.6)",
              whiteSpace: "nowrap",
              textAlign: "center",
              lineHeight: 1.05,
            }}
          >
            {l.text}
          </div>
        );
      })}
    </div>
  );
  if (at) {
    return (
      <Anchored at={at} from={from} to={to} inF={1} outF={1}>
        <div style={{ position: "absolute", transform: "translate(-50%, -50%)" }}>{body}</div>
      </Anchored>
    );
  }
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", top: y }}>
      {body}
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ chapter marker */

export const Chapter: React.FC<{ readonly id: SceneId; readonly index: string; readonly label: string }> = ({ id, index, label }) => {
  const frame = useCurrentFrame();
  const a = SCENES[id].start + 24;
  const b = a + 150;
  if (frame < a || frame > b) return null;
  const o = window01(frame, a, b, 18, 24);
  const line = ramp(frame, a, a + 30);
  return (
    <div style={{ position: "absolute", left: 120, top: 92, display: "flex", alignItems: "center", gap: 16, fontFamily: FONT, opacity: o }}>
      <div style={{ fontSize: 20, fontWeight: 600, color: COLORS.orange, letterSpacing: 4 }}>{index}</div>
      <div style={{ width: 54 * line, height: 1.5, background: "rgba(255,255,255,0.6)" }} />
      <div style={{ fontSize: 20, fontWeight: 500, color: COLORS.white, letterSpacing: 6, textTransform: "uppercase", opacity: 0.88 }}>{label}</div>
    </div>
  );
};

/* ------------------------------------------------------------------ captions */

type Chunk = { text: string; start: number; end: number };

/** Split long narration into ≤ 2-line documentary subtitles, timed by characters. */
const chunkLine = (text: string, start: number, end: number, max = 88): Chunk[] => {
  const words = text.split(" ");
  const parts: string[] = [];
  let cur = "";
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    const breakable = /[,.…]$/.test(cur);
    if (next.length > max || (breakable && cur.length > max * 0.55)) {
      parts.push(cur);
      cur = w;
    } else {
      cur = next;
    }
  }
  if (cur) parts.push(cur);
  const total = parts.reduce((a, p) => a + p.length, 0);
  const speechEnd = end - 8;
  let t = start;
  return parts.map((p, i) => {
    const d = ((speechEnd - start) * p.length) / total;
    const c = { text: p, start: Math.round(t), end: Math.round(i === parts.length - 1 ? end : t + d + 4) };
    t += d;
    return c;
  });
};

export const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  const chunks = useMemo(() => LINES.flatMap((l) => chunkLine(l.text, l.start, l.end)), []);
  const c = chunks.find((k) => frame >= k.start && frame <= k.end);
  if (!c) return null;
  const o = window01(frame, c.start, c.end, 6, 6);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 74, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
      <div
        style={{
          maxWidth: 1180,
          fontFamily: FONT,
          fontSize: 34,
          fontWeight: 400,
          lineHeight: 1.35,
          color: "rgba(255,255,255,0.96)",
          textAlign: "center",
          letterSpacing: 0.2,
          textShadow: "0 2px 6px rgba(0,0,0,0.85), 0 0 24px rgba(0,0,0,0.6)",
          opacity: o,
        }}
      >
        {c.text}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ grade & transitions */

/** Film grade over everything: vignette, caption gradient, animated grain. */
export const Grade: React.FC = () => {
  const frame = useCurrentFrame();
  const seed = Math.floor(frame % 24);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 78% 72% at 50% 48%, rgba(0,0,0,0) 52%, rgba(1,5,9,0.72) 100%)" }} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0) 72%, rgba(1,6,10,0.55) 100%)" }} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity: 0.07, mixBlendMode: "overlay" }}>
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={seed} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>
    </AbsoluteFill>
  );
};

/** Exposure lift + anamorphic streak on every scene change (synced to the whoosh/boom). */
export const Transitions: React.FC = () => {
  const frame = useCurrentFrame();
  const s = SCENE_LIST.find((sc, i) => i > 0 && Math.abs(frame - sc.start) < 26);
  if (!s) return null;
  const d = frame - s.start;
  const flash = interpolate(d, [-14, 0, 14], [0, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const streakX = interpolate(d, [-20, 20], [-0.3, 1.3], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const y = 380 + random(`streak-${s.id}`) * 320;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(255,190,120,0.9), rgba(255,130,0,0) 70%)", opacity: flash * 0.16, mixBlendMode: "screen" }} />
      <div
        style={{
          position: "absolute",
          top: y,
          left: streakX * W - 700,
          width: 1400,
          height: 3,
          background: "linear-gradient(90deg, rgba(255,130,0,0), rgba(255,200,140,0.95), rgba(156,219,217,0.9), rgba(0,176,185,0))",
          filter: "blur(1px)",
          opacity: flash,
          boxShadow: "0 0 30px 6px rgba(255,140,40,0.45)",
        }}
      />
    </AbsoluteFill>
  );
};

/** Camera-whip blur strength (px) for the 3D layer around scene changes. */
export const whipBlur = (frame: number) => {
  let b = 0;
  for (let i = 1; i < SCENE_LIST.length; i++) {
    const d = frame - SCENE_LIST[i].start;
    b = Math.max(b, interpolate(d, [-26, -6, 6, 22], [0, 3.2, 3.2, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  }
  return b;
};
