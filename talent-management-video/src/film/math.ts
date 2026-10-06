import { Easing, interpolate } from "remotion";

export type V3 = readonly [number, number, number];

export const v3 = (x: number, y: number, z: number): V3 => [x, y, z];
export const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const scale = (a: V3, s: number): V3 => [a[0] * s, a[1] * s, a[2] * s];
export const lerp3 = (a: V3, b: V3, t: number): V3 => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
];
export const len = (a: V3) => Math.hypot(a[0], a[1], a[2]);
export const dist = (a: V3, b: V3) => len(sub(a, b));

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const smooth = (t: number) => {
  const x = clamp(t);
  return x * x * (3 - 2 * x);
};

export const EASE = {
  out: Easing.bezier(0.16, 1, 0.3, 1),
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
  soft: Easing.bezier(0.33, 1, 0.68, 1),
  in: Easing.bezier(0.55, 0, 1, 0.45),
};

/** Clamped eased 0→1 between two frames. */
export const ramp = (
  frame: number,
  a: number,
  b: number,
  easing: (t: number) => number = EASE.out,
) =>
  interpolate(frame, [a, b], [0, 1], {
    easing,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

/** Fade in over [a, a+inF], hold, fade out over [b-outF, b]. */
export const window01 = (
  frame: number,
  a: number,
  b: number,
  inF = 15,
  outF = 15,
) =>
  interpolate(frame, [a, a + inF, b - outF, b], [0, 1, 1, 0], {
    easing: EASE.inOut,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

/** Cubic Bézier point in 3D. */
export const bezier3 = (p0: V3, p1: V3, p2: V3, p3: V3, t: number): V3 => {
  const u = 1 - t;
  const a = u * u * u;
  const b = 3 * u * u * t;
  const c = 3 * u * t * t;
  const d = t * t * t;
  return [
    a * p0[0] + b * p1[0] + c * p2[0] + d * p3[0],
    a * p0[1] + b * p1[1] + c * p2[1] + d * p3[1],
    a * p0[2] + b * p1[2] + c * p2[2] + d * p3[2],
  ];
};

/** Arc between two points that lifts by `h` at the middle. */
export const arc = (a: V3, b: V3, h: number, t: number): V3 => {
  const m1 = add(lerp3(a, b, 0.25), [0, h, 0]);
  const m2 = add(lerp3(a, b, 0.75), [0, h, 0]);
  return bezier3(a, m1, m2, b, t);
};

/** Deterministic hash noise in [-1, 1]. */
export const noise1 = (x: number, seed = 0) => {
  const s = Math.sin(x * 12.9898 + seed * 78.233) * 43758.5453;
  return (s - Math.floor(s)) * 2 - 1;
};

/** Smooth 1D value noise in [-1, 1]. */
export const smoothNoise = (x: number, seed = 0) => {
  const i = Math.floor(x);
  const f = x - i;
  const u = f * f * (3 - 2 * f);
  return lerp(noise1(i, seed), noise1(i + 1, seed), u);
};
