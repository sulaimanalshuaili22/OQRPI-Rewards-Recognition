import type React from "react";
import { AbsoluteFill, random, useCurrentFrame } from "remotion";
import { Background } from "../components/Background";
import { Camera } from "../components/Camera";
import { GlassPanel } from "../components/GlassPanel";
import { Narration } from "../components/Narration";
import { Kicker, WordReveal, FadeUp } from "../components/Text";
import { Bars, Donut, Kpi, TrendLine } from "../components/Charts";
import { Icon } from "../components/Icons";
import { COLORS, FONT } from "../theme";
import { progress } from "../lib/anim";

export const SCENE_12_DURATION = 480;

const narration = [
  {
    text: "By bringing talent data together, leaders gain visibility into workforce capabilities, bench strength, succession readiness, leadership pipelines, and strategic talent risks.",
    from: 20,
    to: 330,
  },
];

const chat = [
  {
    who: "Executive",
    text: "Which critical roles have no ready-now successor?",
  },
  {
    who: "Talent AI",
    text: "7 of 42 critical roles. 5 have a ready-in-1-year successor; 2 need targeted action. Opening the readiness view.",
  },
];

type Props = { readonly subtitles?: boolean };

export const Scene12Platform: React.FC<Props> = ({ subtitles = true }) => {
  const frame = useCurrentFrame();
  const typed = (text: string, from: number, cps = 1.4) =>
    text.slice(0, Math.max(0, Math.floor((frame - from) * cps)));

  return (
    <AbsoluteFill>
      <Background particles={40} glow="turquoise" />
      <Camera zoomFrom={1.1} zoomTo={1.0} panY={-10}>
        {/* Command centre */}
        <div
          style={{
            position: "absolute",
            left: 140,
            right: 140,
            top: 270,
            bottom: 150,
          }}
        >
          <FadeUp from={30}>
            <GlassPanel padding={0} style={{ height: 600 }}>
              <div style={{ display: "flex", height: "100%" }}>
                {/* Nav */}
                <div
                  style={{
                    width: 92,
                    borderRight: "1px solid rgba(255,255,255,0.08)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    paddingTop: 24,
                    gap: 20,
                  }}
                >
                  {(
                    [
                      "analytics",
                      "people",
                      "succession",
                      "ninebox",
                      "rewards",
                      "ai",
                    ] as const
                  ).map((n, i) => (
                    <div
                      key={n}
                      style={{
                        width: 52,
                        height: 52,
                        borderRadius: 14,
                        background:
                          i === 0 ? "rgba(255,130,0,0.2)" : "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Icon
                        name={n}
                        size={26}
                        color={i === 0 ? COLORS.orange : COLORS.midnight30}
                      />
                    </div>
                  ))}
                </div>
                {/* Main */}
                <div
                  style={{
                    flex: 1,
                    padding: 28,
                    display: "flex",
                    flexDirection: "column",
                    gap: 20,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      fontFamily: FONT,
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: 15,
                          letterSpacing: 3,
                          textTransform: "uppercase",
                          color: COLORS.midnight30,
                        }}
                      >
                        OQ RPI · Talent Command Centre
                      </div>
                      <div
                        style={{
                          fontSize: 30,
                          fontWeight: 700,
                          color: COLORS.white,
                          marginTop: 4,
                        }}
                      >
                        Executive Talent Intelligence
                      </div>
                    </div>
                    <div
                      style={{
                        fontSize: 16,
                        color: COLORS.turquoise,
                        fontWeight: 600,
                      }}
                    >
                      ● Updated live
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 16 }}>
                    <Kpi
                      label="Bench strength"
                      value={2.4}
                      decimals={1}
                      suffix="x"
                      from={70}
                      width={220}
                    />
                    <Kpi
                      label="Succession readiness"
                      value={83}
                      suffix="%"
                      from={85}
                      width={220}
                      accent={COLORS.turquoise}
                    />
                    <Kpi
                      label="Leadership pipeline"
                      value={146}
                      from={100}
                      width={220}
                      accent={COLORS.lightBlue}
                    />
                    <Kpi
                      label="Talent risk index"
                      value={12}
                      suffix="low"
                      from={115}
                      width={220}
                      accent={COLORS.green}
                    />
                  </div>
                  <div style={{ display: "flex", gap: 16, flex: 1 }}>
                    <div
                      style={{
                        flex: 1.3,
                        borderRadius: 18,
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        padding: 20,
                        fontFamily: FONT,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 15,
                          letterSpacing: 2.5,
                          textTransform: "uppercase",
                          color: COLORS.midnight30,
                        }}
                      >
                        Predictive readiness · next 24 months
                      </div>
                      <div style={{ marginTop: 14 }}>
                        <TrendLine
                          values={[58, 61, 66, 70, 74, 79, 83, 88, 91]}
                          from={130}
                          width={520}
                          height={150}
                          color={COLORS.orange}
                        />
                      </div>
                    </div>
                    <div
                      style={{
                        flex: 1,
                        borderRadius: 18,
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        padding: 20,
                        fontFamily: FONT,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 15,
                          letterSpacing: 2.5,
                          textTransform: "uppercase",
                          color: COLORS.midnight30,
                        }}
                      >
                        Critical role coverage
                      </div>
                      <div
                        style={{
                          display: "flex",
                          gap: 18,
                          marginTop: 14,
                          alignItems: "center",
                        }}
                      >
                        <Donut
                          size={160}
                          from={140}
                          thickness={18}
                          label="83%"
                          sub="covered"
                          segments={[
                            { value: 83, color: COLORS.orange },
                            { value: 12, color: COLORS.turquoise },
                            { value: 5, color: "rgba(255,255,255,0.15)" },
                          ]}
                        />
                        <Bars
                          values={[12, 18, 24, 30, 34, 42]}
                          from={150}
                          width={170}
                          height={120}
                        />
                      </div>
                    </div>
                    {/* Heatmap */}
                    <div
                      style={{
                        flex: 0.9,
                        borderRadius: 18,
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        padding: 20,
                        fontFamily: FONT,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 15,
                          letterSpacing: 2.5,
                          textTransform: "uppercase",
                          color: COLORS.midnight30,
                        }}
                      >
                        Capability heatmap
                      </div>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(8, 1fr)",
                          gap: 6,
                          marginTop: 14,
                        }}
                      >
                        {Array.from({ length: 48 }).map((_, i) => {
                          const v = random(`hm${i}`);
                          const t = progress(frame, 160 + i * 2, 180 + i * 2);
                          return (
                            <div
                              key={i}
                              style={{
                                height: 22,
                                borderRadius: 4,
                                background:
                                  v > 0.8
                                    ? COLORS.orange
                                    : v > 0.45
                                      ? COLORS.turquoise
                                      : COLORS.lightBlue,
                                opacity: (0.2 + v * 0.8) * t,
                              }}
                            />
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
                {/* AI assistant */}
                <div
                  style={{
                    width: 420,
                    borderLeft: "1px solid rgba(255,255,255,0.08)",
                    padding: 24,
                    display: "flex",
                    flexDirection: "column",
                    gap: 16,
                    fontFamily: FONT,
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        background: "rgba(255,130,0,0.18)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Icon name="ai" size={26} />
                    </div>
                    <div
                      style={{
                        fontSize: 22,
                        fontWeight: 700,
                        color: COLORS.white,
                      }}
                    >
                      Talent AI Assistant
                    </div>
                  </div>
                  {chat.map((m, i) => {
                    const from = 190 + i * 70;
                    const vis = progress(frame, from, from + 10);
                    return (
                      <div
                        key={i}
                        style={{
                          alignSelf: i === 0 ? "flex-end" : "flex-start",
                          maxWidth: 330,
                          padding: "14px 18px",
                          borderRadius: 16,
                          background:
                            i === 0
                              ? "rgba(255,130,0,0.85)"
                              : "rgba(255,255,255,0.07)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          color: COLORS.white,
                          fontSize: 19,
                          lineHeight: 1.35,
                          opacity: vis,
                        }}
                      >
                        <div
                          style={{
                            fontSize: 13,
                            letterSpacing: 2,
                            textTransform: "uppercase",
                            opacity: 0.7,
                            marginBottom: 6,
                          }}
                        >
                          {m.who}
                        </div>
                        {typed(m.text, from + 6)}
                        <span style={{ opacity: frame % 20 < 10 ? 1 : 0 }}>
                          ▍
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </GlassPanel>
          </FadeUp>
        </div>
      </Camera>

      <div style={{ position: "absolute", left: 140, top: 96, maxWidth: 1500 }}>
        <Kicker index="12" label="The Intelligent Talent Platform" />
        <div style={{ marginTop: 14 }}>
          <WordReveal
            from={14}
            size={60}
            weight={800}
            align="left"
            letterSpacing={-2.5}
            stagger={5}
          >
            Talent data, unified. Decisions, informed.
          </WordReveal>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          right: 140,
          top: 892,
          display: "flex",
          gap: 12,
        }}
      >
        {[
          "AI Chatbot",
          "Talent Intelligence",
          "Interactive Dashboards",
          "Predictive Analytics",
        ].map((l, i) => (
          <FadeUp key={l} from={330 + i * 12}>
            <div
              style={{
                padding: "12px 20px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.08)",
                border: `1px solid ${i % 2 === 0 ? COLORS.orange : COLORS.turquoise}`,
                color: COLORS.white,
                fontFamily: FONT,
                fontSize: 20,
                fontWeight: 600,
              }}
            >
              {l}
            </div>
          </FadeUp>
        ))}
      </div>

      <Narration lines={narration} enabled={subtitles} />
    </AbsoluteFill>
  );
};
