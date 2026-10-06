import type { V3 } from "./math";

/**
 * World positions of each set piece in the OQ RPI digital twin. The camera
 * travels between them, so the film is one continuous journey instead of
 * a sequence of slides.
 */
export const SET = {
  opening: [0, 0, 0],
  why: [0, -34, -48],
  ecosystem: [0, -22, -100],
  performance: [42, -26, -132],
  ninebox: [84, -24, -160],
  critical: [104, -24, -206],
  succession: [84, -24, -250],
  leadership: [40, -26, -284],
  nationalization: [-4, -30, -316],
  secondment: [-50, -24, -340],
  rewards: [-90, -26, -366],
  platform: [-118, -24, -405],
  overview: [-8, -30, -262],
  future: [-20, -30, -250],
} as const satisfies Record<string, V3>;

export const BRAND = {
  orange: "#FF8200",
  midnight: "#081F2C",
  deep: "#02070C",
  turquoise: "#00B0B9",
  lightBlue: "#9CDBD9",
  white: "#FFFFFF",
  silver: "#C9CFD4",
} as const;

/** HDR colours (values > 1 bloom). */
export const HDR = {
  orange: [3.2, 1.25, 0.05] as V3,
  orangeSoft: [1.6, 0.62, 0.05] as V3,
  turquoise: [0.0, 1.4, 1.5] as V3,
  ice: [1.1, 1.6, 1.6] as V3,
  white: [2.2, 2.2, 2.2] as V3,
  dim: [0.25, 0.42, 0.45] as V3,
};
