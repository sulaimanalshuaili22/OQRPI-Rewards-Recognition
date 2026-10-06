import { interpolate } from "remotion";
import { EASE } from "../theme";

type Opts = {
  readonly from?: number;
  readonly to?: number;
  readonly easing?: (t: number) => number;
};

// Clamped eased progress from 0 to 1 between two frames.
export const progress = (
  frame: number,
  start: number,
  end: number,
  easing: (t: number) => number = EASE.out,
): number =>
  interpolate(frame, [start, end], [0, 1], {
    easing,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

// Eased value between from/to over a frame range.
export const ease = (
  frame: number,
  start: number,
  end: number,
  { from = 0, to = 1, easing = EASE.out }: Opts = {},
): number =>
  interpolate(frame, [start, end], [from, to], {
    easing,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

// Fade in, hold, fade out.
export const envelope = (
  frame: number,
  inStart: number,
  inEnd: number,
  outStart: number,
  outEnd: number,
): number =>
  interpolate(frame, [inStart, inEnd, outStart, outEnd], [0, 1, 1, 0], {
    easing: EASE.inOut,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
