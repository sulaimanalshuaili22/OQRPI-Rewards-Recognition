import type React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { COLORS, EASE, FONT } from "../theme";

type RevealProps = {
  readonly children: string;
  readonly from?: number;
  readonly duration?: number;
  readonly stagger?: number;
  readonly style?: React.CSSProperties;
  readonly color?: string;
  readonly size?: number;
  readonly weight?: number;
  readonly align?: "left" | "center" | "right";
  readonly out?: number; // frame at which to start fading out (optional)
  readonly lineHeight?: number;
  readonly letterSpacing?: number;
};

// Word-by-word cinematic reveal: each word rises, un-blurs and fades in.
export const WordReveal: React.FC<RevealProps> = ({
  children,
  from = 0,
  duration = 18,
  stagger = 4,
  style,
  color = COLORS.white,
  size = 84,
  weight = 700,
  align = "center",
  out,
  lineHeight = 1.08,
  letterSpacing = -1.5,
}) => {
  const frame = useCurrentFrame();
  const words = children.split(" ");
  const fadeOut =
    out === undefined
      ? 1
      : interpolate(frame, [out, out + 16], [1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: EASE.inOut,
        });
  return (
    <div
      style={{
        fontFamily: FONT,
        fontSize: size,
        fontWeight: weight,
        color,
        textAlign: align,
        lineHeight,
        letterSpacing,
        opacity: fadeOut,
        ...style,
      }}
    >
      {words.map((w, i) => {
        const start = from + i * stagger;
        const p = interpolate(frame, [start, start + duration], [0, 1], {
          easing: EASE.out,
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              opacity: p,
              translate: `0px ${(1 - p) * 28}px`,
              filter: `blur(${(1 - p) * 10}px)`,
              marginRight: "0.26em",
            }}
          >
            {w}
          </span>
        );
      })}
    </div>
  );
};

type LineProps = {
  readonly children: React.ReactNode;
  readonly from?: number;
  readonly duration?: number;
  readonly style?: React.CSSProperties;
  readonly out?: number;
  readonly y?: number;
};

// Whole-block reveal with a soft rise.
export const FadeUp: React.FC<LineProps> = ({
  children,
  from = 0,
  duration = 22,
  style,
  out,
  y = 36,
}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [from, from + duration], [0, 1], {
    easing: EASE.out,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fadeOut =
    out === undefined
      ? 1
      : interpolate(frame, [out, out + 16], [1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: EASE.inOut,
        });
  return (
    <div
      style={{
        fontFamily: FONT,
        opacity: p * fadeOut,
        translate: `0px ${(1 - p) * y}px`,
        filter: `blur(${(1 - p) * 6}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

type KickerProps = {
  readonly index: string;
  readonly label: string;
  readonly from?: number;
  readonly out?: number;
  readonly style?: React.CSSProperties;
};

// Chapter marker: orange rule + index + label.
export const Kicker: React.FC<KickerProps> = ({
  index,
  label,
  from = 0,
  out,
  style,
}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [from, from + 20], [0, 1], {
    easing: EASE.out,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fadeOut =
    out === undefined
      ? 1
      : interpolate(frame, [out, out + 14], [1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 18,
        fontFamily: FONT,
        opacity: p * fadeOut,
        ...style,
      }}
    >
      <div
        style={{
          width: 64 * p,
          height: 4,
          background: COLORS.orange,
          borderRadius: 2,
        }}
      />
      <div
        style={{
          fontSize: 26,
          fontWeight: 600,
          letterSpacing: 6,
          color: COLORS.orange,
          textTransform: "uppercase",
        }}
      >
        {index}
      </div>
      <div
        style={{
          fontSize: 26,
          fontWeight: 500,
          letterSpacing: 6,
          color: COLORS.lightBlue,
          textTransform: "uppercase",
          opacity: 0.9,
        }}
      >
        {label}
      </div>
    </div>
  );
};
