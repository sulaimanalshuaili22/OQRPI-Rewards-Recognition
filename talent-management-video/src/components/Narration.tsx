import type React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { COLORS, EASE, FONT } from "../theme";

export type NarrationLine = {
  readonly text: string;
  readonly from: number; // frame (scene-local)
  readonly to: number; // frame (scene-local)
};

type Props = {
  readonly lines: readonly NarrationLine[];
  readonly enabled?: boolean;
};

// Subtle lower-third narration text. It tracks the voice-over script so the
// film reads correctly even before the narrator track is laid in.
export const Narration: React.FC<Props> = ({ lines, enabled = true }) => {
  const frame = useCurrentFrame();
  if (!enabled) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 64,
        display: "flex",
        justifyContent: "center",
        pointerEvents: "none",
      }}
    >
      {lines.map((l, i) => {
        const o = interpolate(
          frame,
          [l.from, l.from + 12, l.to - 10, l.to],
          [0, 1, 1, 0],
          {
            easing: EASE.inOut,
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          },
        );
        if (o <= 0) return null;
        const rise = interpolate(frame, [l.from, l.from + 12], [10, 0], {
          easing: EASE.out,
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              bottom: 0,
              maxWidth: 1240,
              padding: "14px 30px",
              borderRadius: 14,
              background: "rgba(4,15,23,0.55)",
              border: "1px solid rgba(255,255,255,0.08)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              fontFamily: FONT,
              fontSize: 30,
              fontWeight: 400,
              lineHeight: 1.35,
              color: COLORS.white,
              textAlign: "center",
              letterSpacing: 0.2,
              opacity: o,
              translate: `0px ${rise}px`,
            }}
          >
            {l.text}
          </div>
        );
      })}
    </div>
  );
};
