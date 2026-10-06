import type React from "react";
import { lightLeak } from "@remotion/effects/light-leak";
import { interpolate, Solid, useCurrentFrame, useVideoConfig } from "remotion";

type Props = {
  readonly seed?: number;
  readonly hueShift?: number;
};

// Warm (OQ-orange-leaning) light leak that plays over a cut point.
export const LightLeakOverlay: React.FC<Props> = ({
  seed = 3,
  hueShift = 10,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames, height, width, fps } = useVideoConfig();
  return (
    <Solid
      width={width}
      height={height}
      premountFor={fps}
      effects={[
        lightLeak({
          seed,
          hueShift,
          progress: interpolate(frame, [0, durationInFrames - 1], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }),
      ]}
    />
  );
};
