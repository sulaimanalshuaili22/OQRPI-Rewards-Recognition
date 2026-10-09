/**
 * "309 Lights": one light for every critical role, placed on the real plant in
 * the night photograph (refinery-night.jpg). The positions are illustrative
 * (spread across the plant footprint), the count is real.
 */
import type React from "react";
import { useCurrentFrame } from "remotion";
import { EASE, ramp } from "../film/math";
import { COLORS } from "../theme";
import { SUCCESSION } from "../film/data";

/** Plant footprint in refinery-night.jpg, in % of the image. */
const FOOTPRINT: ReadonlyArray<[number, number]> = [
  [24.5, 43.5], [43.2, 39.4], [59.9, 38.9], [72.9, 42.1], [95.5, 50.5], [94.5, 73.1],
  [88.5, 81.5], [75.5, 75.5], [64.1, 75.9], [52.1, 70.4], [41.1, 64.8], [29.7, 52.8],
];

const inside = (x: number, y: number) => {
  let c = false;
  for (let i = 0, j = FOOTPRINT.length - 1; i < FOOTPRINT.length; j = i++) {
    const [xi, yi] = FOOTPRINT[i];
    const [xj, yj] = FOOTPRINT[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      c = !c;
    }
  }
  return c;
};

/** Deterministic sampler (mulberry32). */
const rng = (seed: number) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

type Light = { readonly x: number; readonly y: number; readonly order: number; readonly named: boolean; readonly namedOrder: number };

const build = (): Light[] => {
  const r = rng(309);
  const pts: Array<{ x: number; y: number }> = [];
  let guard = 0;
  while (pts.length < SUCCESSION.criticalRoles && guard < 200000) {
    guard++;
    const x = 24 + r() * 72;
    const y = 38 + r() * 44;
    if (!inside(x, y)) continue;
    // keep the lights apart (aspect-corrected distance in % units)
    if (pts.some((p) => Math.hypot((p.x - x) * 1.78, p.y - y) < 2.2)) continue;
    pts.push({ x, y });
  }
  // appear in a sweep from the left of the plant to the right, with jitter
  const order = pts.map((p, i) => ({ i, k: p.x + r() * 14 })).sort((a, b) => a.k - b.k);
  const rank = new Array<number>(pts.length);
  order.forEach((o, n) => (rank[o.i] = n));
  // 132 of them have a named successor
  const pick = pts.map((_, i) => ({ i, k: r() })).sort((a, b) => a.k - b.k);
  const namedRank = new Array<number>(pts.length).fill(-1);
  pick.slice(0, SUCCESSION.rolesWithSuccessor).forEach((p, n) => (namedRank[p.i] = n));
  return pts.map((p, i) => ({ x: p.x, y: p.y, order: rank[i], named: namedRank[i] >= 0, namedOrder: namedRank[i] }));
};

export const LIGHTS = build();

/**
 * Lights locked to the photograph. Frames are local to the plate's Sequence.
 * appear: [a, b] the lights switch on across the plant;
 * named: frame from which the 132 roles with a named successor turn orange;
 * dimTo: 0–1 brightness while text sits over the photograph.
 */
export const Lights: React.FC<{
  readonly appear: [number, number];
  readonly named?: number;
  readonly dim?: Array<[number, number, number]>;
  readonly fadeOut?: [number, number];
}> = ({ appear, named, dim = [], fadeOut }) => {
  const frame = useCurrentFrame();
  const n = LIGHTS.length;
  let level = 1;
  for (const [a, b, to] of dim) {
    level = Math.min(level, 1 - (1 - to) * ramp(frame, a, b, EASE.inOut));
  }
  if (fadeOut) {
    level *= 1 - ramp(frame, fadeOut[0], fadeOut[1], EASE.inOut);
  }
  if (level <= 0) return null;
  return (
    <svg width="100%" height="100%" viewBox="0 0 100 56.17" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, overflow: "visible", opacity: level }}>
      <defs>
        <radialGradient id="lt-w">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
          <stop offset="35%" stopColor={COLORS.lightBlue} stopOpacity="0.85" />
          <stop offset="100%" stopColor={COLORS.turquoise} stopOpacity="0" />
        </radialGradient>
        <radialGradient id="lt-o">
          <stop offset="0%" stopColor="#fff4e6" stopOpacity="1" />
          <stop offset="35%" stopColor={COLORS.orange} stopOpacity="0.95" />
          <stop offset="100%" stopColor={COLORS.orange} stopOpacity="0" />
        </radialGradient>
      </defs>
      {LIGHTS.map((l, i) => {
        const t0 = appear[0] + ((appear[1] - appear[0]) * l.order) / n;
        const on = ramp(frame, t0, t0 + 10, EASE.out);
        if (on <= 0) return null;
        const pop = 1 + 0.9 * (1 - ramp(frame, t0, t0 + 16, EASE.out));
        const turn = named !== undefined && l.named ? ramp(frame, named + l.namedOrder * 0.35, named + l.namedOrder * 0.35 + 12, EASE.out) : 0;
        const flicker = 0.85 + 0.15 * Math.sin(frame * 0.12 + i * 1.7);
        // y in the 100 × 56.17 box (the photograph's aspect)
        const cx = l.x;
        const cy = (l.y / 100) * 56.17;
        return (
          <g key={i} opacity={on * flicker}>
            <circle cx={cx} cy={cy} r={0.62 * pop * (1 + 0.25 * turn)} fill="url(#lt-w)" opacity={1 - turn} />
            {turn > 0 ? <circle cx={cx} cy={cy} r={0.78 * (1 + 0.6 * (1 - turn))} fill="url(#lt-o)" opacity={turn} /> : null}
          </g>
        );
      })}
    </svg>
  );
};
