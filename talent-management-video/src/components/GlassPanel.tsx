import type React from "react";
import { COLORS } from "../theme";

type Props = {
  readonly children?: React.ReactNode;
  readonly style?: React.CSSProperties;
  readonly accent?: "orange" | "turquoise" | "none";
  readonly padding?: number;
};

// Glassmorphism container used for dashboards, cards and HUD overlays.
export const GlassPanel: React.FC<Props> = ({
  children,
  style,
  accent = "none",
  padding = 36,
}) => {
  const accentColor =
    accent === "orange"
      ? COLORS.orange
      : accent === "turquoise"
        ? COLORS.turquoise
        : null;
  return (
    <div
      style={{
        position: "relative",
        padding,
        borderRadius: 28,
        background:
          "linear-gradient(135deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 60%, rgba(156,219,217,0.06) 100%)",
        border: "1px solid rgba(255,255,255,0.14)",
        boxShadow:
          "0 30px 80px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.18), inset 0 0 60px rgba(156,219,217,0.04)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        overflow: "hidden",
        ...style,
      }}
    >
      {accentColor ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: 5,
            background: `linear-gradient(180deg, ${accentColor}, rgba(255,255,255,0))`,
          }}
        />
      ) : null}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 1,
          background:
            "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.5) 50%, rgba(255,255,255,0) 100%)",
        }}
      />
      {children}
    </div>
  );
};
