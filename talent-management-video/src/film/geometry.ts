/**
 * Shared set geometry. Both the 3D world and the AR overlay use these
 * functions, so interface tags stay locked to the objects they describe.
 */
import { add, type V3 } from "./math";
import { SET } from "./layout";

/* 03 — ecosystem: 12 programmes on a tilted ring around the hub */
export const PROGRAMS = [
  { label: "Performance & Potential", icon: "performance" },
  { label: "Succession & Critical Roles", icon: "succession" },
  { label: "9-Box Talent Matrix", icon: "ninebox" },
  { label: "Leadership Development · MASAR · ROBBAN", icon: "leadership" },
  { label: "Nationalization", icon: "nationalization" },
  { label: "Individual Development Plans", icon: "idp" },
  { label: "Secondment Management", icon: "secondment" },
  { label: "Rewards & Recognition", icon: "rewards" },
  { label: "BU Talent Scorecard", icon: "analytics" },
  { label: "Talent Assistant", icon: "ai" },
  { label: "Executive Talent Overview", icon: "people" },
  { label: "Learning & Development", icon: "learning" },
] as const;

export const ECO_RADIUS = 9.5;
export const programPos = (i: number): V3 => {
  const a = (i / PROGRAMS.length) * Math.PI * 2 + 0.3;
  const x = Math.cos(a) * ECO_RADIUS;
  const z = Math.sin(a) * ECO_RADIUS;
  // tilt the ring ~16° so it reads in depth
  const y = z * -0.28 + Math.sin(a * 3) * 0.6;
  return add(SET.ecosystem as V3, [x, y, z]);
};

/* 04 — talent DNA helix */
export const HELIX = { radius: 1.6, height: 14, turns: 3.2 };
export const helixPoint = (s: number, strand: 0 | 1, spin: number): V3 => {
  const a = s * HELIX.turns * Math.PI * 2 + strand * Math.PI + spin;
  return add(SET.performance as V3, [Math.cos(a) * HELIX.radius, 0.6 + s * HELIX.height, Math.sin(a) * HELIX.radius]);
};
export const DNA_INDICATORS = [
  { label: "Skills", s: 0.12 },
  { label: "Performance", s: 0.28 },
  { label: "Potential", s: 0.44 },
  { label: "Certifications", s: 0.6 },
  { label: "Readiness", s: 0.76 },
  { label: "Leadership", s: 0.92 },
];
export const DNA_FLOW: V3[] = [
  add(SET.performance as V3, [1.5, 13.5, 0]),
  add(SET.performance as V3, [9, 10.5, -7]),
  add(SET.performance as V3, [17, 8.5, -14]),
];

/* 05 — 9-box */
export const TILE = 4;
// As on the Talent Command Center: runway (potential) runs left→right,
// performance runs bottom→top (far edge = exceeds target).
export const tilePos = (perf: number, pot: number): V3 =>
  add(SET.ninebox as V3, [(pot - 1) * TILE, 0, (1 - perf) * TILE]);

/* 06 — critical roles: a radial organisation (cone of tiers) */
export const TIERS = [
  { n: 1, r: 0, y: 12 },
  { n: 5, r: 3.2, y: 8.5 },
  { n: 12, r: 6.4, y: 5 },
  { n: 24, r: 9.6, y: 1.6 },
];
export const orgNode = (tier: number, k: number): V3 => {
  const t = TIERS[tier];
  const a = (k / t.n) * Math.PI * 2 + tier * 0.4;
  return add(SET.critical as V3, [Math.cos(a) * t.r, t.y, Math.sin(a) * t.r]);
};
export const orgParent = (tier: number, k: number) =>
  Math.floor((k * TIERS[tier - 1].n) / TIERS[tier].n);
export const CRITICAL: Array<{ tier: number; k: number; label?: string }> = [
  { tier: 1, k: 1, label: "Leadership continuity" },
  { tier: 1, k: 3 },
  { tier: 2, k: 4, label: "Operations" },
  { tier: 2, k: 9, label: "Business performance" },
  { tier: 3, k: 6, label: "Safety" },
  { tier: 3, k: 15 },
  { tier: 3, k: 21 },
];

/* 07 — succession tower */
export const LEVELS = [0, 4, 8, 12];
export const TOWER_R = 4.5;
export const seatPos = (level: number, k: number, n: number): V3 => {
  const a = (k / n) * Math.PI * 2 + level * 0.5;
  return add(SET.succession as V3, [Math.cos(a) * TOWER_R, LEVELS[level], Math.sin(a) * TOWER_R]);
};
export const SEATS = [8, 6, 5, 3];
/** hero's spiral ascent from the bottom ring to the vacant top seat, t 0→1 */
export const heroAscent = (t: number): V3 => {
  const target = seatPos(3, 0, SEATS[3]);
  const start = seatPos(0, 2, SEATS[0]);
  const a0 = Math.atan2(start[2] - SET.succession[2], start[0] - SET.succession[0]);
  const a1 = Math.atan2(target[2] - SET.succession[2], target[0] - SET.succession[0]) + Math.PI * 2;
  const a = a0 + (a1 - a0) * t;
  const r = TOWER_R * (1 - 0.35 * Math.sin(t * Math.PI));
  return add(SET.succession as V3, [Math.cos(a) * r, LEVELS[3] * t, Math.sin(a) * r]);
};
export const SUCCESSION_FLOW = ["Position", "Successor", "Development", "Readiness", "Future Appointment"];

/* 08 — leadership gates along the path */
export const GATES = [
  { t: 0.12, label: "Key ICs & HiPos", step: "Step 1", programmes: "MASAR · JCCP Women in Leadership" },
  { t: 0.31, label: "First-line leaders", step: "Step 2", programmes: "MASAR · ROBBAN · Takatuf Lead" },
  { t: 0.5, label: "Managers", step: "Step 3", programmes: "ROBBAN · MASAR" },
  { t: 0.69, label: "Heads", step: "Step 4", programmes: "MASAR · CCL SLP London" },
  { t: 0.88, label: "Executives", step: "Step 5", programmes: "SLT Effectiveness · JCCP Next Tech" },
];

/* 09 — national talent terraces */
export const STAGES = ["2026", "2027", "2028", "2029", "2030"];
export const TERRACE = { cols: 14, gapX: 1.6, depth: 4.2, rise: 1.7 };
export const terraceBase = (row: number, col: number): V3 =>
  add(SET.nationalization as V3, [
    (col - (TERRACE.cols - 1) / 2) * TERRACE.gapX,
    row * TERRACE.rise,
    -row * TERRACE.depth,
  ]);

/* 10 — secondment */
export const HOME: V3 = add(SET.secondment as V3, [11, 0, 0]);
export const HOST: V3 = add(SET.secondment as V3, [-11, 0, 0]);

/* 11 — rewards stage */
export const STAGE_R = 5.2;
export const stagePos = (k: number, n: number): V3 => {
  const a = (k / n) * Math.PI * 2 + 0.2;
  return add(SET.rewards as V3, [Math.cos(a) * STAGE_R, 0, Math.sin(a) * STAGE_R]);
};
export const AWARDS = [
  { title: "Testahal", sub: "1,111 rewarded · 2026" },
  { title: "Above & Beyond", sub: "149 rewarded · 2026" },
  { title: "HSSE Award", sub: "65 rewarded · 2026" },
  { title: "Reliability Award", sub: "44 rewarded · 2026" },
];
export const awardPos = (k: number, spin: number): V3 => {
  const a = (k / AWARDS.length) * Math.PI * 2 + spin;
  return add(SET.rewards as V3, [Math.cos(a) * 8.5, 4.2 + Math.sin(a * 2) * 0.6, Math.sin(a) * 8.5]);
};

/* 12 — platform panels on a cylinder around the AI core */
export const CORE: V3 = add(SET.platform as V3, [0, 4, 0]);
export const panelPos = (angleDeg: number, y: number, r = 6.2): V3 => {
  const a = (angleDeg * Math.PI) / 180;
  return add(SET.platform as V3, [Math.sin(a) * r, y, Math.cos(a) * r]);
};

/* 13 — the ecosystem seen from above: a compact map of the digital twin */
const MAP_SCALE = 0.3;
const mapPos = (p: V3): V3 => [
  SET.overview[0] + (p[0] - SET.overview[0]) * MAP_SCALE,
  SET.overview[1],
  SET.overview[2] + (p[2] - SET.overview[2]) * MAP_SCALE,
];
const WORLD_BEACONS = {
  performance: { label: "Performance & Potential", pos: SET.performance as V3 },
  ninebox: { label: "9-Box Talent Matrix", pos: SET.ninebox as V3 },
  critical: { label: "Critical Roles", pos: SET.critical as V3 },
  succession: { label: "Succession", pos: SET.succession as V3 },
  leadership: { label: "MASAR · ROBBAN", pos: SET.leadership as V3 },
  readiness: { label: "Readiness", pos: [70, -26, -282] as V3 },
  idp: { label: "IDPs", pos: [20, -24, -118] as V3 },
  capability: { label: "Capability", pos: SET.ecosystem as V3 },
  nationalization: { label: "Nationalization", pos: SET.nationalization as V3 },
  future: { label: "Future Workforce", pos: [-40, -26, -290] as V3 },
  secondment: { label: "Secondment", pos: SET.secondment as V3 },
  rewards: { label: "Rewards & Recognition", pos: SET.rewards as V3 },
  platform: { label: "Talent Command Center", pos: SET.platform as V3 },
} as const;
export type BeaconId = keyof typeof WORLD_BEACONS;
export const BEACONS = Object.fromEntries(
  Object.entries(WORLD_BEACONS).map(([k, b]) => [k, { label: b.label, pos: mapPos(b.pos) }]),
) as Record<BeaconId, { label: string; pos: V3 }>;
export const FLOWS: Array<{ from: BeaconId; to: BeaconId; verb: string }> = [
  { from: "performance", to: "ninebox", verb: "feeds" },
  { from: "ninebox", to: "succession", verb: "feeds" },
  { from: "critical", to: "succession", verb: "feed" },
  { from: "leadership", to: "readiness", verb: "feed" },
  { from: "idp", to: "capability", verb: "improve" },
  { from: "nationalization", to: "future", verb: "supports" },
];
