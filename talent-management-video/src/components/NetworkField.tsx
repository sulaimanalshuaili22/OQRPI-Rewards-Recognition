import type React from "react";
import { useMemo } from "react";
import { random, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../theme";

type Props = {
  readonly count?: number;
  readonly radius?: number;
  // 0..1: how much of the network has "grown" in (nodes + edges)
  readonly reveal?: number;
  readonly rotationSpeed?: number;
  readonly opacity?: number;
  readonly centerX?: number;
  readonly centerY?: number;
  readonly focal?: number;
  readonly highlightEvery?: number;
};

type P3 = { x: number; y: number; z: number };

const fibonacciSphere = (count: number, radius: number, seed: string): P3[] => {
  const pts: P3[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const theta = golden * i;
    // Jitter radius so it reads as an organic "workforce" cloud rather than a perfect shell.
    const jitter = 0.72 + random(`${seed}-j-${i}`) * 0.5;
    pts.push({
      x: Math.cos(theta) * r * radius * jitter,
      y: y * radius * jitter * 0.82,
      z: Math.sin(theta) * r * radius * jitter,
    });
  }
  return pts;
};

// Pseudo-3D "living organisational network": nodes on a jittered sphere,
// rotating around Y, projected with perspective and linked to nearest neighbours.
export const NetworkField: React.FC<Props> = ({
  count = 420,
  radius = 520,
  reveal = 1,
  rotationSpeed = 0.0035,
  opacity = 1,
  centerX,
  centerY,
  focal = 1400,
  highlightEvery = 9,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const cx = centerX ?? width / 2;
  const cy = centerY ?? height / 2;

  const points = useMemo(
    () => fibonacciSphere(count, radius, "net"),
    [count, radius],
  );

  const edges = useMemo(() => {
    const out: Array<[number, number]> = [];
    const k = 2;
    for (let i = 0; i < points.length; i++) {
      const dists: Array<{ j: number; d: number }> = [];
      for (let j = 0; j < points.length; j++) {
        if (i === j) continue;
        const dx = points[i].x - points[j].x;
        const dy = points[i].y - points[j].y;
        const dz = points[i].z - points[j].z;
        dists.push({ j, d: dx * dx + dy * dy + dz * dz });
      }
      dists.sort((a, b) => a.d - b.d);
      for (let n = 0; n < k; n++) {
        const j = dists[n].j;
        if (i < j) out.push([i, j]);
      }
    }
    return out;
  }, [points]);

  const angle = frame * rotationSpeed;
  const tilt = 0.32 + Math.sin(frame * 0.004) * 0.08;
  const cosA = Math.cos(angle);
  const sinA = Math.sin(angle);
  const cosT = Math.cos(tilt);
  const sinT = Math.sin(tilt);

  const projected = points.map((p) => {
    const x1 = p.x * cosA - p.z * sinA;
    const z1 = p.x * sinA + p.z * cosA;
    const y2 = p.y * cosT - z1 * sinT;
    const z2 = p.y * sinT + z1 * cosT;
    const scale = focal / (focal + z2 + radius * 0.4);
    return { x: cx + x1 * scale, y: cy + y2 * scale, depth: scale };
  });

  const visibleNodes = Math.floor(reveal * points.length);

  return (
    <svg
      width={width}
      height={height}
      style={{ position: "absolute", inset: 0, opacity }}
    >
      <defs>
        <radialGradient id="nodeGlow">
          <stop offset="0%" stopColor={COLORS.white} stopOpacity="1" />
          <stop offset="40%" stopColor={COLORS.lightBlue} stopOpacity="0.9" />
          <stop offset="100%" stopColor={COLORS.turquoise} stopOpacity="0" />
        </radialGradient>
        <radialGradient id="nodeGlowOrange">
          <stop offset="0%" stopColor={COLORS.white} stopOpacity="1" />
          <stop offset="35%" stopColor={COLORS.orange} stopOpacity="0.95" />
          <stop offset="100%" stopColor={COLORS.orange} stopOpacity="0" />
        </radialGradient>
      </defs>
      <g>
        {edges.map(([a, b], idx) => {
          if (a >= visibleNodes || b >= visibleNodes) return null;
          const pa = projected[a];
          const pb = projected[b];
          const d = (pa.depth + pb.depth) / 2;
          // Light "data pulse" travelling along a subset of edges.
          const pulse = 0.5 + 0.5 * Math.sin(frame * 0.08 + idx * 0.7);
          const isPulsing = idx % 7 === 0;
          return (
            <line
              key={idx}
              x1={pa.x}
              y1={pa.y}
              x2={pb.x}
              y2={pb.y}
              stroke={isPulsing ? COLORS.orange : COLORS.lightBlue}
              strokeOpacity={
                (isPulsing ? 0.18 + pulse * 0.45 : 0.1 + d * 0.18) * d
              }
              strokeWidth={isPulsing ? 1.4 * d : 0.9 * d}
            />
          );
        })}
      </g>
      <g>
        {projected.map((p, i) => {
          if (i >= visibleNodes) return null;
          const nodeReveal = Math.min(1, (visibleNodes - i) / 12);
          const isLead = i % highlightEvery === 0;
          const r = (isLead ? 5.5 : 3) * p.depth * nodeReveal;
          const twinkle = 0.7 + 0.3 * Math.sin(frame * 0.06 + i);
          return (
            <g key={i}>
              {isLead ? (
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={r * 4}
                  fill="url(#nodeGlowOrange)"
                  opacity={0.35 * p.depth * nodeReveal}
                />
              ) : null}
              <circle
                cx={p.x}
                cy={p.y}
                r={r}
                fill={isLead ? COLORS.orange : COLORS.white}
                opacity={(isLead ? 1 : 0.55 + 0.4 * p.depth) * twinkle}
              />
            </g>
          );
        })}
      </g>
    </svg>
  );
};
