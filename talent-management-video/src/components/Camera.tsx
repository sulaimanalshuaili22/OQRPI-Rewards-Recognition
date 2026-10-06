import type React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { EASE } from "../theme";

type Props = {
  readonly children: React.ReactNode;
  readonly zoomFrom?: number;
  readonly zoomTo?: number;
  readonly panX?: number; // px drift over the scene
  readonly panY?: number;
  readonly frames?: [number, number];
  readonly easing?: (t: number) => number;
};

// Slow, continuous "camera" move across the whole scene duration.
export const Camera: React.FC<Props> = ({
  children,
  zoomFrom = 1,
  zoomTo = 1.06,
  panX = 0,
  panY = 0,
  frames,
  easing = EASE.soft,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const [a, b] = frames ?? [0, durationInFrames];
  const t = interpolate(frame, [a, b], [0, 1], {
    easing,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill
      style={{
        scale: String(zoomFrom + (zoomTo - zoomFrom) * t),
        translate: `${panX * t}px ${panY * t}px`,
        transformOrigin: "50% 50%",
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
