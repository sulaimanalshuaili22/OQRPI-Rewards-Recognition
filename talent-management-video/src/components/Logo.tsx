import type React from "react";
import { COLORS, FONT } from "../theme";

type Props = {
  readonly height?: number;
  readonly variant?: "orange-white" | "white";
  readonly style?: React.CSSProperties;
  readonly reveal?: number; // 0..1 draws the OQ rings
};

// OQ RPI wordmark, redrawn as vector: thick-stroke O and Q in OQ Orange with
// the Q's diagonal tail, followed by RPI in heavy grotesk.
export const Logo: React.FC<Props> = ({
  height = 120,
  variant = "orange-white",
  style,
  reveal = 1,
}) => {
  const unit = height / 100;
  const stroke = 22 * unit;
  const r = 36 * unit;
  const circumference = 2 * Math.PI * r;
  const ringColor = variant === "white" ? COLORS.white : COLORS.orange;
  const textColor = COLORS.white;
  const oCx = 50 * unit;
  const qCx = 142 * unit;
  const cy = 50 * unit;
  const w = 200 * unit;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10 * unit,
        ...style,
      }}
    >
      <svg width={w} height={height} viewBox={`0 0 ${w} ${height}`}>
        <circle
          cx={oCx}
          cy={cy}
          r={r}
          fill="none"
          stroke={ringColor}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - reveal)}
          strokeLinecap="butt"
          transform={`rotate(-90 ${oCx} ${cy})`}
        />
        <circle
          cx={qCx}
          cy={cy}
          r={r}
          fill="none"
          stroke={ringColor}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - reveal)}
          strokeLinecap="butt"
          transform={`rotate(-90 ${qCx} ${cy})`}
        />
        <line
          x1={qCx + 14 * unit}
          y1={cy + 14 * unit}
          x2={qCx + 52 * unit}
          y2={cy + 50 * unit}
          stroke={ringColor}
          strokeWidth={stroke}
          strokeLinecap="butt"
          opacity={reveal >= 0.95 ? 1 : 0}
        />
      </svg>
      <div
        style={{
          fontFamily: FONT,
          fontWeight: 800,
          fontSize: 96 * unit,
          letterSpacing: -3 * unit,
          color: textColor,
          lineHeight: 1,
          opacity: reveal,
          marginTop: -2 * unit,
        }}
      >
        RPI
      </div>
    </div>
  );
};
