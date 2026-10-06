import type React from "react";
import { COLORS, FONT } from "../theme";
import { progress } from "../lib/anim";

type Props = {
  readonly items: readonly string[];
  readonly from: number;
  readonly frame: number;
  readonly step?: number;
  readonly size?: number;
  readonly vertical?: boolean;
};

// "A → B → C" output animation: chips light up in sequence, connected by
// animated orange arrows.
export const FlowChips: React.FC<Props> = ({
  items,
  from,
  frame,
  step = 22,
  size = 30,
  vertical = false,
}) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: vertical ? "column" : "row",
        alignItems: vertical ? "flex-start" : "center",
        gap: 16,
        fontFamily: FONT,
      }}
    >
      {items.map((it, i) => {
        const t = progress(frame, from + i * step, from + i * step + 24);
        const arrow = progress(
          frame,
          from + i * step + 10,
          from + i * step + 26,
        );
        const last = i === items.length - 1;
        return (
          <div
            key={it}
            style={{
              display: "flex",
              flexDirection: vertical ? "column" : "row",
              alignItems: vertical ? "flex-start" : "center",
              gap: 16,
            }}
          >
            <div
              style={{
                padding: `${size * 0.55}px ${size * 1.1}px`,
                borderRadius: 999,
                background: last ? COLORS.orange : "rgba(255,255,255,0.07)",
                border: `1px solid ${last ? COLORS.orange : "rgba(156,219,217,0.4)"}`,
                color: COLORS.white,
                fontSize: size,
                fontWeight: 600,
                letterSpacing: -0.3,
                opacity: t,
                translate: vertical
                  ? `${(1 - t) * -20}px 0px`
                  : `0px ${(1 - t) * 20}px`,
                boxShadow: last ? "0 0 40px rgba(255,130,0,0.45)" : "none",
                whiteSpace: "nowrap",
              }}
            >
              {it}
            </div>
            {!last ? (
              <svg
                width={vertical ? 24 : 64}
                height={vertical ? 48 : 24}
                viewBox={vertical ? "0 0 24 48" : "0 0 64 24"}
                style={{ opacity: arrow, marginLeft: vertical ? size : 0 }}
              >
                {vertical ? (
                  <path
                    d="M12 2 V40 M4 32 L12 42 L20 32"
                    fill="none"
                    stroke={COLORS.orange}
                    strokeWidth={3}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray={80}
                    strokeDashoffset={80 * (1 - arrow)}
                  />
                ) : (
                  <path
                    d="M2 12 H54 M44 4 L56 12 L44 20"
                    fill="none"
                    stroke={COLORS.orange}
                    strokeWidth={3}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray={100}
                    strokeDashoffset={100 * (1 - arrow)}
                  />
                )}
              </svg>
            ) : null}
          </div>
        );
      })}
    </div>
  );
};
