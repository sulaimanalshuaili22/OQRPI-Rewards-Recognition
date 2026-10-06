import type React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Background } from "../components/Background";
import { Camera } from "../components/Camera";
import { Narration } from "../components/Narration";
import { Kicker, WordReveal } from "../components/Text";
import { FlowChips } from "../components/FlowChips";
import { Icon } from "../components/Icons";
import { COLORS, EASE, FONT } from "../theme";
import { progress } from "../lib/anim";

export const SCENE_07_DURATION = 420;

const narration = [
  {
    text: "Succession Planning ensures that future leaders are identified, developed, and prepared before business-critical vacancies occur.",
    from: 25,
    to: 240,
  },
];

const tiers = [
  "Executive",
  "Senior Leadership",
  "Middle Management",
  "Emerging Leaders",
];

type Props = { readonly subtitles?: boolean };

export const Scene07Succession: React.FC<Props> = ({ subtitles = true }) => {
  const frame = useCurrentFrame();
  const left = 1000;
  const top = 200;
  const rowH = 150;
  const w = 780;

  return (
    <AbsoluteFill>
      <Background particles={50} glow="turquoise" />
      <Camera zoomFrom={1.06} zoomTo={1} panY={-10}>
        {/* Pipeline tiers */}
        {tiers.map((t, i) => {
          const tin = progress(frame, 30 + i * 16, 60 + i * 16);
          const y = top + i * rowH;
          return (
            <div
              key={t}
              style={{
                position: "absolute",
                left,
                top: y,
                width: w,
                height: rowH - 22,
                borderRadius: 18,
                background:
                  i === 0 ? "rgba(255,130,0,0.14)" : "rgba(255,255,255,0.05)",
                border: `1px solid ${i === 0 ? "rgba(255,130,0,0.6)" : "rgba(156,219,217,0.3)"}`,
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                opacity: tin,
                translate: `${(1 - tin) * 60}px 0px`,
                display: "flex",
                alignItems: "center",
                padding: "0 28px",
                gap: 22,
                fontFamily: FONT,
              }}
            >
              <div
                style={{
                  fontSize: 16,
                  letterSpacing: 3,
                  color: i === 0 ? COLORS.orange : COLORS.midnight30,
                  textTransform: "uppercase",
                  width: 170,
                  fontWeight: 600,
                }}
              >
                Level {4 - i}
              </div>
              <div
                style={{
                  fontSize: 30,
                  fontWeight: 700,
                  color: COLORS.white,
                  flex: 1,
                }}
              >
                {t}
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                {Array.from({ length: 5 - i }).map((_, k) => {
                  const ready = progress(
                    frame,
                    150 + i * 20 + k * 8,
                    175 + i * 20 + k * 8,
                  );
                  return (
                    <div
                      key={k}
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 99,
                        background:
                          ready > 0.5 ? COLORS.orange : "rgba(255,255,255,0.1)",
                        border: "1px solid rgba(255,255,255,0.2)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow:
                          ready > 0.5 ? "0 0 22px rgba(255,130,0,0.7)" : "none",
                        scale: String(0.8 + ready * 0.2),
                      }}
                    >
                      <Icon name="people" size={22} color={COLORS.white} />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Successors graduating upward */}
        <svg
          width={1920}
          height={1080}
          style={{ position: "absolute", inset: 0 }}
        >
          {[0, 1, 2].map((i) => {
            const t = progress(frame, 190 + i * 40, 260 + i * 40, EASE.inOut);
            const x = left + w - 60 - i * 54;
            const yFrom = top + (i + 1) * rowH + 64;
            const yTo = top + i * rowH + 64;
            const y = yFrom + (yTo - yFrom) * t;
            return (
              <g key={i} opacity={t > 0 && t < 1 ? 1 : 0}>
                <line
                  x1={x}
                  y1={yFrom}
                  x2={x}
                  y2={y}
                  stroke={COLORS.orange}
                  strokeWidth={3}
                  strokeOpacity={0.7}
                  strokeDasharray="6 8"
                />
                <circle cx={x} cy={y} r={14} fill={COLORS.orange} />
                <circle
                  cx={x}
                  cy={y}
                  r={26}
                  fill="none"
                  stroke={COLORS.orange}
                  strokeOpacity={0.5}
                />
              </g>
            );
          })}
        </svg>
      </Camera>

      <div style={{ position: "absolute", left: 140, top: 120, maxWidth: 700 }}>
        <Kicker index="07" label="Succession Planning" />
        <div style={{ marginTop: 26 }}>
          <WordReveal
            from={14}
            size={84}
            weight={800}
            align="left"
            letterSpacing={-3}
            stagger={6}
          >
            Ready before the vacancy occurs.
          </WordReveal>
        </div>
        <div style={{ marginTop: 50 }}>
          <FlowChips
            from={200}
            step={20}
            size={26}
            vertical
            items={[
              "Position",
              "Successor",
              "Development",
              "Readiness",
              "Future Appointment",
            ]}
            frame={frame}
          />
        </div>
      </div>

      <Narration lines={narration} enabled={subtitles} />
    </AbsoluteFill>
  );
};
