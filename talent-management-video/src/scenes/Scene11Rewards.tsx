import type React from "react";
import { AbsoluteFill, random, useCurrentFrame } from "remotion";
import { Background } from "../components/Background";
import { Camera } from "../components/Camera";
import { GlassPanel } from "../components/GlassPanel";
import { Narration } from "../components/Narration";
import { Kicker, WordReveal, FadeUp } from "../components/Text";
import { Icon } from "../components/Icons";
import { COLORS, EASE, FONT } from "../theme";
import { progress } from "../lib/anim";

export const SCENE_11_DURATION = 330;

const narration = [
  {
    text: "Recognition reinforces desired behaviours, increases engagement, and celebrates the people who make success possible.",
    from: 20,
    to: 225,
  },
];

const awards = [
  {
    title: "Spot Award",
    sub: "Immediate recognition for exceptional contribution",
  },
  { title: "Quarterly Star", sub: "Consistent excellence, every quarter" },
  { title: "Annual Excellence", sub: "The year's defining achievements" },
  { title: "Team Award", sub: "Collaboration that moves the business" },
];

type Props = { readonly subtitles?: boolean };

export const Scene11Rewards: React.FC<Props> = ({ subtitles = true }) => {
  const frame = useCurrentFrame();
  const burst = 70;

  return (
    <AbsoluteFill>
      <Background particles={60} glow="orange" />
      {/* Celebration particles: restrained, brand-coloured */}
      <svg
        width={1920}
        height={1080}
        style={{ position: "absolute", inset: 0 }}
      >
        {Array.from({ length: 90 }).map((_, i) => {
          const a = random(`a${i}`) * Math.PI * 2;
          const sp = 300 + random(`s${i}`) * 700;
          const t = progress(frame, burst, burst + 90, EASE.out);
          const x = 1340 + Math.cos(a) * sp * t;
          const y = 540 + Math.sin(a) * sp * t + 180 * t * t;
          const col = [
            COLORS.orange,
            COLORS.turquoise,
            COLORS.white,
            COLORS.lightBlue,
          ][i % 4];
          return (
            <rect
              key={i}
              x={x}
              y={y}
              width={6}
              height={14}
              rx={2}
              fill={col}
              opacity={(1 - t) * 0.9}
              transform={`rotate(${frame * 4 + i * 30} ${x} ${y})`}
            />
          );
        })}
      </svg>
      <Camera zoomFrom={1.04} zoomTo={1}>
        <div
          style={{
            position: "absolute",
            right: 140,
            top: 170,
            width: 900,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 22,
          }}
        >
          {awards.map((a, i) => (
            <FadeUp key={a.title} from={60 + i * 18} y={50}>
              <GlassPanel
                accent={i === 2 ? "orange" : "turquoise"}
                padding={30}
                style={{ minHeight: 190 }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: 16,
                      background: "rgba(255,130,0,0.14)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Icon name="rewards" size={34} />
                  </div>
                  <div
                    style={{
                      fontFamily: FONT,
                      fontSize: 32,
                      fontWeight: 700,
                      color: COLORS.white,
                    }}
                  >
                    {a.title}
                  </div>
                </div>
                <div
                  style={{
                    fontFamily: FONT,
                    fontSize: 21,
                    color: COLORS.lightBlue,
                    marginTop: 16,
                    lineHeight: 1.35,
                  }}
                >
                  {a.sub}
                </div>
              </GlassPanel>
            </FadeUp>
          ))}
          <FadeUp from={150} style={{ gridColumn: "1 / span 2" }}>
            <GlassPanel padding={24}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontFamily: FONT,
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 16,
                      letterSpacing: 2.5,
                      textTransform: "uppercase",
                      color: COLORS.midnight30,
                    }}
                  >
                    Digital recognition platform
                  </div>
                  <div
                    style={{
                      fontSize: 26,
                      fontWeight: 600,
                      color: COLORS.white,
                      marginTop: 6,
                    }}
                  >
                    Nominate · Approve · Celebrate
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  {["Nominate", "VP approval", "Talent Mgmt", "Announced"].map(
                    (s, i) => {
                      const t = progress(frame, 170 + i * 16, 190 + i * 16);
                      return (
                        <div
                          key={s}
                          style={{
                            padding: "10px 16px",
                            borderRadius: 999,
                            background:
                              t > 0.5
                                ? COLORS.orange
                                : "rgba(255,255,255,0.08)",
                            color: COLORS.white,
                            fontSize: 17,
                            fontWeight: 600,
                            whiteSpace: "nowrap",
                            opacity: 0.5 + t * 0.5,
                          }}
                        >
                          {s}
                        </div>
                      );
                    },
                  )}
                </div>
              </div>
            </GlassPanel>
          </FadeUp>
        </div>
      </Camera>

      <div style={{ position: "absolute", left: 140, top: 120, maxWidth: 680 }}>
        <Kicker index="11" label="Rewards & Recognition" />
        <div style={{ marginTop: 26 }}>
          <WordReveal
            from={14}
            size={84}
            weight={800}
            align="left"
            letterSpacing={-3}
            stagger={6}
          >
            Celebrating the people behind success.
          </WordReveal>
        </div>
      </div>

      <Narration lines={narration} enabled={subtitles} />
    </AbsoluteFill>
  );
};
