/**
 * The OQ RPI Talent Management ecosystem as one cycle: the single model the
 * film uses to explain how the programmes connect. Scene 03 builds it, every
 * programme chapter shows where it sits in it, and scene 13 walks one
 * (illustrative) talent journey around it.
 *
 * NOTE: a narrative model for the film. Stage names and the links between
 * them should be validated with the Talent Management process owners.
 */
import type { IconName } from "../components/Icons";
import type { SceneId } from "./timeline";

export type Stage = {
  readonly id: string;
  readonly n: number;
  readonly title: string;
  readonly short: string;
  readonly line: string;
  readonly icon: IconName;
  /** what this stage does for the next one, shown on the arrow that leaves it */
  readonly link: string;
};

export const CYCLE: readonly Stage[] = [
  { id: "needs", n: 1, title: "Critical roles", short: "Critical roles", line: "Where continuity matters most", icon: "critical", link: "focuses assessment" },
  { id: "assess", n: 2, title: "Talent assessment", short: "Assessment", line: "Performance · potential · 9-Box review", icon: "ninebox", link: "pinpoints development needs" },
  { id: "develop", n: 3, title: "Targeted development", short: "Development", line: "MASAR · ROBBAN · secondments", icon: "leadership", link: "builds ready successors" },
  { id: "succession", n: 4, title: "Succession & readiness", short: "Succession", line: "Successors named, developed, ready", icon: "succession", link: "fills roles, advances talent" },
  { id: "deploy", n: 5, title: "Deployment & national talent", short: "Deployment", line: "Placement · progression · nationalization", icon: "nationalization", link: "tracked for leaders" },
  { id: "govern", n: 6, title: "Insight & governance", short: "Governance", line: "Talent Command Center · leadership review", icon: "analytics", link: "updates workforce plans" },
];

/** Rewards & Recognition runs across every stage rather than sitting in one. */
export const CROSS_CUTTING = { title: "Rewards & Recognition", line: "Reinforcing contribution at every stage" };

/** Where each programme chapter sits in the cycle ("R" = cross-cutting). */
export const SCENE_STAGE: Partial<Record<SceneId, number | "R">> = {
  critical: 1,
  performance: 2,
  ninebox: 2,
  leadership: 3,
  secondment: 3,
  succession: 4,
  nationalization: 5,
  platform: 6,
  rewards: "R",
};

/** Programmes as they first appear: a collection, before they become a system. */
export const PROGRAMME_CHIPS: ReadonlyArray<{ readonly label: string; readonly stage: number | "R" }> = [
  { label: "Critical Roles", stage: 1 },
  { label: "Performance Management", stage: 2 },
  { label: "9-Box Talent Review", stage: 2 },
  { label: "MASAR", stage: 3 },
  { label: "ROBBAN", stage: 3 },
  { label: "Secondment", stage: 3 },
  { label: "Succession Planning", stage: 4 },
  { label: "Nationalization", stage: 5 },
  { label: "Talent Command Center", stage: 6 },
  { label: "Rewards & Recognition", stage: "R" },
];

/** Ring geometry shared by every rendering of the cycle (1920×1080 space). */
export const RING = { cx: 960, cy: 520, rx: 560, ry: 282 };
export const stageAngle = (i: number) => -Math.PI / 2 + (i / CYCLE.length) * Math.PI * 2;
export const stagePos = (i: number): [number, number] => [RING.cx + Math.cos(stageAngle(i)) * RING.rx, RING.cy + Math.sin(stageAngle(i)) * RING.ry];
export const linkPos = (i: number): [number, number] => {
  const a = stageAngle(i) + Math.PI / CYCLE.length;
  return [RING.cx + Math.cos(a) * RING.rx * 0.97, RING.cy + Math.sin(a) * RING.ry * 0.97];
};
