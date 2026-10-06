import type React from "react";
import {
  AbsoluteFill,
  random,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS } from "../theme";

type Props = {
  readonly particles?: number;
  readonly grid?: boolean;
  readonly glow?: "orange" | "turquoise" | "none";
  readonly vignette?: number;
};

// Cinematic deep-navy backdrop: layered gradients, a faint engineering grid,
// slow-drifting particles and a vignette. Fully deterministic.
export const Background: React.FC<Props> = ({
  particles = 70,
  grid = true,
  glow = "turquoise",
  vignette = 0.75,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const glowColor =
    glow === "orange"
      ? "rgba(255,130,0,0.22)"
      : glow === "turquoise"
        ? "rgba(0,176,185,0.18)"
        : "rgba(0,0,0,0)";

  return (
    <AbsoluteFill
      style={{ backgroundColor: COLORS.midnightDeep, overflow: "hidden" }}
    >
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 90% 70% at 50% 40%, ${COLORS.midnight} 0%, ${COLORS.midnightDeep} 70%, #02080D 100%)`,
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 78% 22%, ${glowColor} 0%, rgba(0,0,0,0) 45%)`,
          translate: `${Math.sin(frame / 180) * 40}px ${Math.cos(frame / 220) * 30}px`,
        }}
      />
      {grid ? (
        <AbsoluteFill
          style={{
            backgroundImage: `linear-gradient(rgba(156,219,217,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(156,219,217,0.06) 1px, transparent 1px)`,
            backgroundSize: "120px 120px",
            maskImage:
              "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(0,0,0,0.9), rgba(0,0,0,0))",
            WebkitMaskImage:
              "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(0,0,0,0.9), rgba(0,0,0,0))",
          }}
        />
      ) : null}
      <svg
        width={width}
        height={height}
        style={{ position: "absolute", inset: 0 }}
      >
        {Array.from({ length: particles }).map((_, i) => {
          const seed = `p-${i}`;
          const baseX = random(seed + "x") * width;
          const baseY = random(seed + "y") * height;
          const speed = 0.15 + random(seed + "s") * 0.35;
          const size = 1 + random(seed + "r") * 2.2;
          const phase = random(seed + "ph") * Math.PI * 2;
          const x = baseX + Math.sin(frame * 0.01 * speed + phase) * 40;
          const y =
            (((baseY - frame * speed * 0.6) % height) + height) % height;
          const twinkle =
            0.25 + 0.5 * (0.5 + 0.5 * Math.sin(frame * 0.05 + phase));
          const isOrange = random(seed + "c") > 0.82;
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={size}
              fill={isOrange ? COLORS.orange : COLORS.lightBlue}
              opacity={twinkle}
            />
          );
        })}
      </svg>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 75% 70% at 50% 50%, rgba(0,0,0,0) 45%, rgba(2,8,13,${vignette}) 100%)`,
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};
