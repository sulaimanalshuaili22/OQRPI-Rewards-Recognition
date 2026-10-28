import type React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, EASE } from "../theme";

type Props = {
  readonly from: number;
  readonly duration?: number;
  readonly y?: number;
  readonly thickness?: number;
  readonly color?: string;
};

// A fast orange light streak sweeping across the frame.
export const LightStreak: React.FC<Props> = ({
  from,
  duration = 36,
  y,
  thickness = 6,
  color = COLORS.orange,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const cy = y ?? height / 2;
  const t = interpolate(frame, [from, from + duration], [0, 1], {
    easing: EASE.inOut,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  if (t <= 0 || t >= 1) return null;
  const x = -width * 0.6 + t * width * 2.2;
  const len = width * 0.9;
  const opacity = Math.sin(t * Math.PI);
  return (
    <svg
      width={width}
      height={height}
      style={{ position: "absolute", inset: 0 }}
    >
      <defs>
        <linearGradient id="streak" x1="0" x2="1">
          <stop offset="0" stopColor={color} stopOpacity="0" />
          <stop offset="0.5" stopColor={COLORS.white} stopOpacity="1" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect
        x={x - len / 2}
        y={cy - thickness / 2}
        width={len}
        height={thickness}
        fill="url(#streak)"
        opacity={opacity}
      />
      <rect
        x={x - len / 2}
        y={cy - thickness * 6}
        width={len}
        height={thickness * 12}
        fill="url(#streak)"
        opacity={opacity * 0.25}
        style={{ filter: "blur(18px)" }}
      />
    </svg>
  );
};
