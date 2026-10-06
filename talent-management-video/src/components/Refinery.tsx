import type React from "react";
import { useCurrentFrame } from "remotion";
import { COLORS } from "../theme";

type Props = {
  readonly width?: number;
  readonly height?: number;
  readonly reveal?: number; // 0..1 draws the line-art
  readonly opacity?: number;
  readonly style?: React.CSSProperties;
  readonly flow?: boolean; // animated product flow along the pipelines
};

// Subtle line-art refinery skyline: distillation columns, spherical tanks,
// a flare stack, piperacks and cooling towers. Drawn with stroke-dash reveal.
export const Refinery: React.FC<Props> = ({
  width = 1920,
  height = 520,
  reveal = 1,
  opacity = 1,
  style,
  flow = true,
}) => {
  const frame = useCurrentFrame();
  const sx = width / 1920;
  const sy = height / 520;
  const stroke = COLORS.lightBlue;
  const dash = 4000;
  const offset = dash * (1 - reveal);
  const common = {
    fill: "none",
    stroke,
    strokeWidth: 2.2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeDasharray: dash,
    strokeDashoffset: offset,
  };

  const flare = 0.6 + 0.4 * Math.sin(frame * 0.35) * Math.cos(frame * 0.21);

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 1920 520"
      preserveAspectRatio="none"
      style={{ opacity, ...style }}
    >
      <g transform={`scale(${1} ${1})`}>
        {/* ground line */}
        <path d="M0 500 H1920" {...common} strokeOpacity={0.5} />
        {/* distillation columns */}
        <path d="M220 500 V150 a30 30 0 0 1 60 0 V500" {...common} />
        <path
          d="M232 220 H268 M232 290 H268 M232 360 H268 M232 430 H268"
          {...common}
          strokeOpacity={0.6}
        />
        <path d="M330 500 V90 a28 28 0 0 1 56 0 V500" {...common} />
        <path
          d="M341 160 H375 M341 240 H375 M341 320 H375 M341 400 H375"
          {...common}
          strokeOpacity={0.6}
        />
        <path d="M420 500 V200 a22 22 0 0 1 44 0 V500" {...common} />
        {/* piperack */}
        <path d="M480 500 V380 H1120 V500" {...common} />
        <path
          d="M480 400 H1120 M480 420 H1120 M480 440 H1120"
          {...common}
          strokeOpacity={0.55}
        />
        <path
          d="M560 500 V380 M660 500 V380 M760 500 V380 M860 500 V380 M960 500 V380 M1060 500 V380"
          {...common}
          strokeOpacity={0.5}
        />
        {/* spherical tanks */}
        <circle cx="1230" cy="420" r="70" {...common} />
        <path
          d="M1190 500 V478 M1270 500 V478 M1230 500 V490"
          {...common}
          strokeOpacity={0.7}
        />
        <circle cx="1400" cy="430" r="60" {...common} />
        <path
          d="M1365 500 V482 M1435 500 V482"
          {...common}
          strokeOpacity={0.7}
        />
        {/* cylindrical storage */}
        <path d="M1500 500 V330 H1680 V500" {...common} />
        <path
          d="M1500 330 a90 20 0 0 1 180 0"
          {...common}
          strokeOpacity={0.7}
        />
        <path
          d="M1500 390 H1680 M1500 450 H1680"
          {...common}
          strokeOpacity={0.45}
        />
        {/* flare stack */}
        <path d="M1780 500 V60" {...common} />
        <path d="M1768 60 H1792" {...common} />
        <path
          d="M1740 500 L1780 300 M1820 500 L1780 300"
          {...common}
          strokeOpacity={0.5}
        />
        {/* cooling towers */}
        <path
          d="M1000 500 L1010 260 Q1040 240 1070 260 L1080 500"
          {...common}
        />
        <path
          d="M1100 500 L1110 300 Q1135 285 1160 300 L1170 500"
          {...common}
        />
        {/* heat exchangers */}
        <path d="M600 330 H900" {...common} strokeOpacity={0.6} />
        <path
          d="M600 300 H900 M600 360 H900"
          {...common}
          strokeOpacity={0.35}
        />
        {/* flare */}
        <g opacity={reveal >= 0.98 ? flare : 0}>
          <ellipse
            cx="1780"
            cy="40"
            rx="14"
            ry="28"
            fill={COLORS.orange}
            opacity={0.9}
          />
          <ellipse cx="1780" cy="36" rx="7" ry="16" fill={COLORS.yellow} />
          <ellipse
            cx="1780"
            cy="40"
            rx="38"
            ry="60"
            fill={COLORS.orange}
            opacity={0.12}
          />
        </g>
        {/* animated product flow */}
        {flow && reveal >= 0.98 ? (
          <>
            <path
              d="M480 400 H1120"
              fill="none"
              stroke={COLORS.orange}
              strokeWidth={3}
              strokeDasharray="28 120"
              strokeDashoffset={-frame * 3.5}
              strokeLinecap="round"
              opacity={0.85}
            />
            <path
              d="M600 330 H900"
              fill="none"
              stroke={COLORS.turquoise}
              strokeWidth={3}
              strokeDasharray="20 90"
              strokeDashoffset={frame * 2.6}
              strokeLinecap="round"
              opacity={0.85}
            />
          </>
        ) : null}
      </g>
      <g transform={`scale(${sx} ${sy})`} />
    </svg>
  );
};
