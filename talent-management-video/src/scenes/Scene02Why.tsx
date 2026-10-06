import type React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";
import { Background } from "../components/Background";
import { Camera } from "../components/Camera";
import { Refinery } from "../components/Refinery";
import { GlassPanel } from "../components/GlassPanel";
import { Narration } from "../components/Narration";
import { Kicker, WordReveal, FadeUp } from "../components/Text";
import { TrendLine, Kpi } from "../components/Charts";
import { COLORS, EASE, FONT } from "../theme";
import { progress } from "../lib/anim";

export const SCENE_02_DURATION = 510;

const narration = [
  {
    text: "In an increasingly competitive and rapidly changing world, organisations must ensure the right talent is available, in the right roles, at the right time.",
    from: 20,
    to: 276,
  },
  {
    text: "Talent Management exists to build sustainable workforce capability, strengthen leadership pipelines, and secure the future of the business.",
    from: 277,
    to: 504,
  },
];

const pillars = [
  "Capability",
  "Leadership",
  "Performance",
  "Succession",
  "Future Readiness",
];

type Props = { readonly subtitles?: boolean };

export const Scene02Why: React.FC<Props> = ({ subtitles = true }) => {
  const frame = useCurrentFrame();
  const refineryReveal = progress(frame, 0, 120, EASE.inOut);
  const panelsOut = 290;
  const panelsOpacity = interpolate(
    frame,
    [panelsOut, panelsOut + 20],
    [1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );

  // Workforce-planning simulation grid (control room / AI planning visual)
  const cols = 18;
  const rows = 6;

  return (
    <AbsoluteFill>
      <Background particles={50} glow="orange" />
      <Camera zoomFrom={1.08} zoomTo={1} panX={-20}>
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.55,
          }}
        >
          <Refinery reveal={refineryReveal} height={560} />
        </div>
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: 420,
            background:
              "linear-gradient(180deg, rgba(4,15,23,0) 0%, rgba(4,15,23,0.75) 70%, rgba(4,15,23,0.95) 100%)",
          }}
        />
      </Camera>

      <div style={{ position: "absolute", left: 140, top: 120 }}>
        <Kicker index="02" label="Why Talent Management" />
        <div style={{ marginTop: 26, maxWidth: 880 }}>
          <WordReveal
            from={14}
            size={92}
            weight={800}
            align="left"
            letterSpacing={-3}
            stagger={6}
          >
            The right talent. The right roles. The right time.
          </WordReveal>
        </div>
      </div>

      {/* Control-room HUD panels */}
      <div
        style={{
          position: "absolute",
          right: 140,
          top: 400,
          display: "flex",
          gap: 24,
          opacity: panelsOpacity,
        }}
      >
        <FadeUp from={90}>
          <GlassPanel accent="turquoise" style={{ width: 420 }} padding={28}>
            <div
              style={{
                fontFamily: FONT,
                fontSize: 16,
                letterSpacing: 2.5,
                textTransform: "uppercase",
                color: COLORS.midnight30,
              }}
            >
              Workforce planning · 2026–2030
            </div>
            <div style={{ marginTop: 16 }}>
              <TrendLine
                values={[40, 44, 43, 50, 56, 60, 68, 74]}
                from={110}
                width={364}
                height={140}
                color={COLORS.turquoise}
              />
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${cols}, 1fr)`,
                gap: 6,
                marginTop: 20,
              }}
            >
              {Array.from({ length: cols * rows }).map((_, i) => {
                const seedDelay = random(`cell-${i}`) * 90;
                const on = progress(frame, 130 + seedDelay, 150 + seedDelay);
                const critical = random(`crit-${i}`) > 0.86;
                return (
                  <div
                    key={i}
                    style={{
                      height: 10,
                      borderRadius: 2,
                      background: critical ? COLORS.orange : COLORS.lightBlue,
                      opacity: 0.15 + on * (critical ? 0.85 : 0.5),
                    }}
                  />
                );
              })}
            </div>
          </GlassPanel>
        </FadeUp>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <Kpi
            label="Succession coverage"
            value={92}
            suffix="%"
            from={120}
            width={250}
          />
          <Kpi
            label="Critical roles mapped"
            value={100}
            suffix="%"
            from={140}
            width={250}
            accent={COLORS.turquoise}
          />
        </div>
      </div>

      {/* Five pillars */}
      <div
        style={{
          position: "absolute",
          left: 140,
          right: 140,
          top: 540,
          display: "flex",
          gap: 20,
        }}
      >
        {pillars.map((p, i) => {
          const start = 320 + i * 12;
          const t = progress(frame, start, start + 28);
          return (
            <div
              key={p}
              style={{
                flex: 1,
                padding: "30px 28px",
                borderRadius: 20,
                background:
                  i === 4
                    ? "linear-gradient(135deg, rgba(255,130,0,0.9), rgba(255,130,0,0.55))"
                    : "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                fontFamily: FONT,
                opacity: t,
                translate: `0px ${(1 - t) * 40}px`,
              }}
            >
              <div
                style={{
                  fontSize: 18,
                  color: i === 4 ? COLORS.white : COLORS.orange,
                  fontWeight: 600,
                  letterSpacing: 3,
                }}
              >
                0{i + 1}
              </div>
              <div
                style={{
                  fontSize: 36,
                  fontWeight: 700,
                  color: COLORS.white,
                  marginTop: 10,
                  letterSpacing: -0.5,
                  lineHeight: 1.1,
                }}
              >
                {p}
              </div>
            </div>
          );
        })}
      </div>

      <Narration lines={narration} enabled={subtitles} />
    </AbsoluteFill>
  );
};
