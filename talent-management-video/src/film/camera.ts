import { add, clamp, dist, smoothNoise, type V3 } from "./math";
import { SET } from "./layout";
import { at, SCENES, TOTAL_FRAMES, LOGO_HIT, FPS, type SceneId } from "./timeline";

type Key = {
  readonly f: number;
  readonly pos: V3;
  readonly look: V3;
  readonly fov: number;
  /** depth-of-field strength (bokeh scale) */
  readonly bokeh?: number;
  /** fog density */
  readonly fog?: number;
};

const k = (
  id: SceneId,
  sec: number,
  origin: V3,
  pos: V3,
  look: V3,
  fov: number,
  extra: Partial<Pick<Key, "bokeh" | "fog">> = {},
): Key => ({
  f: at(id, sec),
  pos: add(origin, pos),
  look: add(origin, look),
  fov,
  ...extra,
});

const O = SET.opening as V3;
const W = SET.why as V3;
const E = SET.ecosystem as V3;
const P = SET.performance as V3;
const N = SET.ninebox as V3;
const C = SET.critical as V3;
const S = SET.succession as V3;
const L = SET.leadership as V3;
const Q = SET.nationalization as V3;
const X = SET.secondment as V3;
const R = SET.rewards as V3;
const A = SET.platform as V3;
const M = SET.overview as V3;
const F = SET.future as V3;

/** Leadership path: hero travels along local -x through five gates. */
export const leadershipPath = (t: number): V3 => {
  const x = 20 - 40 * t;
  return add(L, [x, 1 + Math.sin(t * Math.PI) * 1.5, Math.sin(t * Math.PI * 1.5) * 4]);
};

const chase = (t: number): V3 => add(leadershipPath(t), [7, 2.6, 5]);
const chaseLook = (t: number): V3 => leadershipPath(Math.min(1, t + 0.12));

const hit = (LOGO_HIT - SCENES.future.start) / FPS;
const futureEnd = SCENES.future.duration / FPS;

const KEYS: Key[] = [
  // 01 — a single particle in the dark, then the organisation is revealed
  k("opening", 0, O, [0, 0, 5.5], [0, 0, 0], 26, { bokeh: 6, fog: 0.012 }),
  k("opening", 4.2, O, [0.3, 0.15, 6.8], [0, 0, 0], 27, { bokeh: 5 }),
  k("opening", 8.5, O, [4, 3, 21], [0, 0, 0], 36, { bokeh: 3 }),
  k("opening", 14, O, [-9, 6, 33], [0, 0, 0], 40, { bokeh: 2.5 }),
  k("opening", 19.0, O, [-5, 9, 40], [0, -3, 0], 40, { bokeh: 2.5 }),
  // 02 — dive down into the refinery digital twin
  k("why", 1.4, W, [-20, 6, 24], [0, 3, 0], 40, { bokeh: 3, fog: 0.013 }),
  k("why", 8.5, W, [-10, 8.5, 21], [3, 3.5, -3], 38, { bokeh: 3 }),
  k("why", 15, W, [12, 5.5, 11], [0, 4, -4], 38, { bokeh: 3 }),
  k("why", 22.4, W, [5, 14, 21], [0, 6, -10], 40, { bokeh: 2 }),
  // 03 — rise to the living ecosystem
  k("ecosystem", 1.8, E, [0, 7, 32], [0, 0, 0], 40, { bokeh: 2, fog: 0.011 }),
  k("ecosystem", 8, E, [15, 8, 23], [0, 0, 0], 40, { bokeh: 2.5 }),
  k("ecosystem", 13, E, [-11, 4, 21], [0, 0, 0], 40, { bokeh: 2.5 }),
  k("ecosystem", 17.6, E, [-6, 2, 15], [0, 0, 0], 38, { bokeh: 3 }),
  // 04 — an employee becomes Talent DNA
  k("performance", 1.6, P, [0, 1.7, 7], [0, 1.3, 0], 30, { bokeh: 5, fog: 0.013 }),
  k("performance", 6, P, [4.5, 5, 9.5], [0, 5, 0], 34, { bokeh: 4 }),
  k("performance", 11, P, [-6.5, 9, 11.5], [0, 8, 0], 38, { bokeh: 3.5 }),
  k("performance", 16.4, P, [6, 12, 14], [2, 8, -2], 40, { bokeh: 3 }),
  // 05 — the 9-Box matrix
  k("ninebox", 1.3, N, [-13, 5, 17], [0, 0, 0], 40, { bokeh: 3 }),
  k("ninebox", 7.5, N, [0, 12, 15], [0, 0, 0], 40, { bokeh: 3 }),
  k("ninebox", 13.8, N, [7, 16, 9], [2, 0, -2], 40, { bokeh: 3 }),
  // 06 — critical roles light up across the organisation
  k("critical", 1.3, C, [0, 8, 28], [0, 6, 0], 40, { bokeh: 2.5 }),
  k("critical", 7, C, [17, 10, 18], [0, 6, 0], 40, { bokeh: 3 }),
  k("critical", 13, C, [10, 4.5, 14], [0, 4.5, 0], 38, { bokeh: 3.5 }),
  k("critical", 17.4, C, [4, 5, 8.5], [2, 5, 1.5], 34, { bokeh: 5 }),
  // 07 — succession pipeline (crane up the tower)
  k("succession", 0.9, S, [0, 1.5, 13], [0, 2, 0], 38, { bokeh: 4 }),
  k("succession", 6.2, S, [8, 7, 10], [0, 7, 0], 38, { bokeh: 3.5 }),
  k("succession", 12.2, S, [3, 16, 9.5], [0, 13, 0], 38, { bokeh: 3 }),
  // 08 — chase the hero through the leadership journey
  { ...k("leadership", 0.9, O, chase(0.0), chaseLook(0.0), 40, { bokeh: 3 }) },
  { ...k("leadership", 4.5, O, chase(0.3), chaseLook(0.3), 42, { bokeh: 3 }) },
  { ...k("leadership", 8.5, O, chase(0.62), chaseLook(0.62), 42, { bokeh: 3 }) },
  { ...k("leadership", 13.4, O, chase(0.95), chaseLook(0.95), 40, { bokeh: 3 }) },
  // 09 — the national talent landscape
  k("nationalization", 1.1, Q, [-15, 4, 18], [0, 2, 0], 40, { bokeh: 3 }),
  k("nationalization", 8, Q, [6, 8, 14], [0, 4, -6], 40, { bokeh: 3 }),
  k("nationalization", 13.5, Q, [0, 15, 7], [0, 8, -10], 40, { bokeh: 2.5 }),
  // 10 — across the secondment bridge
  k("secondment", 1, X, [17, 4, 16], [10, 0, 0], 40, { bokeh: 3 }),
  k("secondment", 7, X, [0, 10, 24], [0, 3, 0], 42, { bokeh: 2 }),
  k("secondment", 12.3, X, [-15, 4, 12], [-10, 0, 0], 40, { bokeh: 3 }),
  // 11 — recognition under the spotlights
  k("rewards", 1, R, [0, 5, 16], [0, 2, 0], 38, { bokeh: 3.5 }),
  k("rewards", 6, R, [10, 6, 10], [0, 2, 0], 38, { bokeh: 4 }),
  k("rewards", 11, R, [4, 3, 7.5], [0, 2.5, 0], 34, { bokeh: 5 }),
  // 12 — inside the AI talent intelligence platform
  k("platform", 1.3, A, [0, 4, 25], [0, 4, 0], 40, { bokeh: 2.5 }),
  k("platform", 7.5, A, [0, 4.4, 13], [0, 4, 0], 40, { bokeh: 3 }),
  k("platform", 14.6, A, [-8, 6, 8.5], [0, 4, 0], 40, { bokeh: 3.5 }),
  // 13 — rise above the whole digital twin
  k("connections", 2.2, M, [0, 88, 106], [0, 0, 12], 46, { bokeh: 0.6, fog: 0.002 }),
  k("connections", 9.5, M, [20, 100, 82], [0, 0, 10], 46, { bokeh: 0.6 }),
  k("connections", 17.4, M, [0, 112, 60], [0, 0, 8], 46, { bokeh: 0.6, fog: 0.0024 }),
  // 14 — the future: refinery becomes the workforce; camera rises
  k("future", 2.4, F, [16, 9, 38], [0, 5, 0], 36, { bokeh: 2, fog: 0.009 }),
  k("future", 8, F, [7, 7, 31], [0, 6, 0], 36, { bokeh: 2.5 }),
  k("future", 14, F, [3, 13, 37], [0, 8, 0], 38, { bokeh: 2 }),
  k("future", hit, F, [0, 30, 54], [0, 10, 0], 40, { bokeh: 1.5 }),
  k("future", futureEnd, F, [0, 33, 58], [0, 10, 0], 40, { bokeh: 1.5 }),
];

KEYS.sort((a, b) => a.f - b.f);

// Hermite interpolation with time-scaled Catmull-Rom tangents: C1-continuous
// motion, so the camera glides between set-ups instead of stopping at keys.
const tangent = (i: number, get: (key: Key) => number) => {
  if (i === 0 || i === KEYS.length - 1) return 0;
  const a = KEYS[i - 1];
  const b = KEYS[i + 1];
  return (get(b) - get(a)) / (b.f - a.f);
};

const hermite = (i: number, f: number, get: (key: Key) => number) => {
  const a = KEYS[i];
  const b = KEYS[i + 1];
  const h = b.f - a.f;
  const t = clamp((f - a.f) / h);
  const t2 = t * t;
  const t3 = t2 * t;
  const m0 = tangent(i, get) * h * 0.85;
  const m1 = tangent(i + 1, get) * h * 0.85;
  return (
    (2 * t3 - 3 * t2 + 1) * get(a) +
    (t3 - 2 * t2 + t) * m0 +
    (-2 * t3 + 3 * t2) * get(b) +
    (t3 - t2) * m1
  );
};

const segment = (f: number) => {
  if (f <= KEYS[0].f) return 0;
  for (let i = 0; i < KEYS.length - 1; i++) {
    if (f < KEYS[i + 1].f) return i;
  }
  return KEYS.length - 2;
};

export type CameraState = {
  readonly pos: V3;
  readonly look: V3;
  readonly fov: number;
  readonly focus: number;
  readonly bokeh: number;
  readonly fog: number;
};

const lastDefined = (i: number, prop: "bokeh" | "fog", fallback: number) => {
  for (let j = i; j >= 0; j--) {
    const v = KEYS[j][prop];
    if (v !== undefined) return v;
  }
  return fallback;
};

export const cameraAt = (frameIn: number): CameraState => {
  const f = clamp(frameIn, KEYS[0].f, Math.max(KEYS[KEYS.length - 1].f, TOTAL_FRAMES));
  const i = segment(f);
  const comp = (sel: (key: Key) => number) => hermite(i, f, sel);
  // Subtle hand-held drift keeps every shot alive.
  const drift = (seed: number, amp: number) =>
    smoothNoise(f / 55, seed) * amp + smoothNoise(f / 17, seed + 9) * amp * 0.25;
  const base: V3 = [comp((q) => q.pos[0]), comp((q) => q.pos[1]), comp((q) => q.pos[2])];
  const look: V3 = [comp((q) => q.look[0]), comp((q) => q.look[1]), comp((q) => q.look[2])];
  const d = dist(base, look);
  const amp = Math.min(0.25, d * 0.008);
  const pos: V3 = [base[0] + drift(1, amp), base[1] + drift(2, amp), base[2] + drift(3, amp)];
  const a = KEYS[i];
  const b = KEYS[Math.min(i + 1, KEYS.length - 1)];
  const t = clamp((f - a.f) / Math.max(1, b.f - a.f));
  const bokeh =
    lastDefined(i, "bokeh", 3) + (lastDefined(i + 1, "bokeh", 3) - lastDefined(i, "bokeh", 3)) * t;
  const fog = lastDefined(i, "fog", 0.011) + (lastDefined(i + 1, "fog", 0.011) - lastDefined(i, "fog", 0.011)) * t;
  return { pos, look, fov: comp((q) => q.fov), focus: d, bokeh, fog };
};
