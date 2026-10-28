import type React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { COLORS, EASE, FONT } from "../theme";

type BarsProps = {
  readonly values: readonly number[];
  readonly from: number;
  readonly width: number;
  readonly height: number;
  readonly highlightLast?: boolean;
  readonly labels?: readonly string[];
};

export const Bars: React.FC<BarsProps> = ({
  values,
  from,
  width,
  height,
  highlightLast = true,
  labels,
}) => {
  const frame = useCurrentFrame();
  const max = Math.max(...values);
  const gap = 14;
  const bw = (width - gap * (values.length - 1)) / values.length;
  return (
    <svg width={width} height={height + (labels ? 34 : 0)}>
      {values.map((v, i) => {
        const p = interpolate(
          frame,
          [from + i * 4, from + i * 4 + 26],
          [0, 1],
          {
            easing: EASE.out,
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          },
        );
        const h = (v / max) * height * p;
        const last = highlightLast && i === values.length - 1;
        return (
          <g key={i}>
            <rect
              x={i * (bw + gap)}
              y={height - h}
              width={bw}
              height={h}
              rx={4}
              fill={last ? COLORS.orange : COLORS.lightBlue}
              opacity={last ? 1 : 0.55 + (i / values.length) * 0.4}
            />
            {labels ? (
              <text
                x={i * (bw + gap) + bw / 2}
                y={height + 26}
                fill={COLORS.midnight30}
                fontSize={18}
                fontFamily={FONT}
                textAnchor="middle"
              >
                {labels[i]}
              </text>
            ) : null}
          </g>
        );
      })}
    </svg>
  );
};

type LineProps = {
  readonly values: readonly number[];
  readonly from: number;
  readonly width: number;
  readonly height: number;
  readonly color?: string;
  readonly area?: boolean;
};

export const TrendLine: React.FC<LineProps> = ({
  values,
  from,
  width,
  height,
  color = COLORS.orange,
  area = true,
}) => {
  const frame = useCurrentFrame();
  const max = Math.max(...values);
  const min = Math.min(...values);
  const pts = values.map((v, i) => ({
    x: (i / (values.length - 1)) * width,
    y: height - ((v - min) / (max - min || 1)) * (height - 16) - 8,
  }));
  const d = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x} ${p.y}`).join(" ");
  const p = interpolate(frame, [from, from + 50], [0, 1], {
    easing: EASE.inOut,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const len = 4000;
  const last = pts[pts.length - 1];
  return (
    <svg width={width} height={height} style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id={`area-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.35" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {area ? (
        <path
          d={`${d} L${width} ${height} L0 ${height} Z`}
          fill={`url(#area-${color})`}
          opacity={p}
          style={{ clipPath: `inset(0 ${(1 - p) * 100}% 0 0)` }}
        />
      ) : null}
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={4}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={len}
        strokeDashoffset={len * (1 - p)}
      />
      {p >= 0.98 ? (
        <>
          <circle cx={last.x} cy={last.y} r={14} fill={color} opacity={0.25} />
          <circle cx={last.x} cy={last.y} r={6} fill={COLORS.white} />
        </>
      ) : null}
    </svg>
  );
};

type DonutProps = {
  readonly segments: readonly { value: number; color: string }[];
  readonly from: number;
  readonly size: number;
  readonly thickness?: number;
  readonly label?: string;
  readonly sub?: string;
};

export const Donut: React.FC<DonutProps> = ({
  segments,
  from,
  size,
  thickness = 22,
  label,
  sub,
}) => {
  const frame = useCurrentFrame();
  const r = size / 2 - thickness / 2;
  const c = 2 * Math.PI * r;
  const total = segments.reduce((a, s) => a + s.value, 0);
  const p = interpolate(frame, [from, from + 45], [0, 1], {
    easing: EASE.out,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  let acc = 0;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={thickness}
        />
        {segments.map((s, i) => {
          const frac = (s.value / total) * p;
          const start = acc;
          acc += frac;
          return (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={s.color}
              strokeWidth={thickness}
              strokeDasharray={`${frac * c} ${c}`}
              strokeDashoffset={-start * c}
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
              strokeLinecap="butt"
            />
          );
        })}
      </svg>
      {label ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: FONT,
            color: COLORS.white,
          }}
        >
          <div
            style={{
              fontSize: size * 0.22,
              fontWeight: 700,
              letterSpacing: -1,
            }}
          >
            {label}
          </div>
          {sub ? (
            <div
              style={{
                fontSize: size * 0.085,
                color: COLORS.midnight30,
                marginTop: 4,
              }}
            >
              {sub}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

type KpiProps = {
  readonly label: string;
  readonly value: number;
  readonly suffix?: string;
  readonly from: number;
  readonly accent?: string;
  readonly width?: number;
  readonly decimals?: number;
};

export const Kpi: React.FC<KpiProps> = ({
  label,
  value,
  suffix = "",
  from,
  accent = COLORS.orange,
  width = 260,
  decimals = 0,
}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [from, from + 40], [0, 1], {
    easing: EASE.out,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const n = (value * p).toFixed(decimals);
  return (
    <div
      style={{
        width,
        padding: "22px 26px",
        borderRadius: 18,
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.1)",
        fontFamily: FONT,
        opacity: p,
        translate: `0px ${(1 - p) * 20}px`,
      }}
    >
      <div
        style={{
          fontSize: 16,
          letterSpacing: 2.5,
          textTransform: "uppercase",
          color: COLORS.midnight30,
          fontWeight: 500,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 54,
          fontWeight: 700,
          color: COLORS.white,
          letterSpacing: -1.5,
          marginTop: 6,
          display: "flex",
          alignItems: "baseline",
          gap: 6,
        }}
      >
        {n}
        <span style={{ fontSize: 26, color: accent, fontWeight: 600 }}>
          {suffix}
        </span>
      </div>
      <div
        style={{
          height: 4,
          marginTop: 14,
          borderRadius: 2,
          background: "rgba(255,255,255,0.08)",
          overflow: "hidden",
        }}
      >
        <div
          style={{ width: `${p * 100}%`, height: "100%", background: accent }}
        />
      </div>
    </div>
  );
};
