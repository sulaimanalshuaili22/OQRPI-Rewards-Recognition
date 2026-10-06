import type React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Background } from "../components/Background";
import { Camera } from "../components/Camera";
import { Narration } from "../components/Narration";
import { Kicker, WordReveal, FadeUp } from "../components/Text";
import { Donut, Kpi } from "../components/Charts";
import { Icon } from "../components/Icons";
import { COLORS, FONT } from "../theme";
import { progress } from "../lib/anim";

export const SCENE_09_DURATION = 330;

const narration = [
  {
    text: "Nationalization strengthens sustainable workforce capability by developing and advancing national talent across critical business areas and leadership positions.",
    from: 20,
    to: 292,
  },
];

const stages = ["Graduate", "Professional", "Specialist", "Manager", "Leader"];

type Props = { readonly subtitles?: boolean };

export const Scene09Nationalization: React.FC<Props> = ({
  subtitles = true,
}) => {
  const frame = useCurrentFrame();
  const left = 960;
  const baseY = 760;
  const stepW = 160;
  const stepH = 74;

  return (
    <AbsoluteFill>
      <Background particles={50} glow="orange" />
      <Camera zoomFrom={1.05} zoomTo={1} panY={-8}>
        {/* Career staircase */}
        {stages.map((s, i) => {
          const t = progress(frame, 40 + i * 18, 70 + i * 18);
          const h = stepH * (i + 1);
          const climber = progress(frame, 130 + i * 24, 160 + i * 24);
          return (
            <div key={s}>
              <div
                style={{
                  position: "absolute",
                  left: left + i * stepW,
                  top: baseY - h * t,
                  width: stepW - 10,
                  height: h * t,
                  borderRadius: "12px 12px 0 0",
                  background:
                    i === stages.length - 1
                      ? "linear-gradient(180deg, rgba(255,130,0,0.95), rgba(255,130,0,0.4))"
                      : `linear-gradient(180deg, rgba(156,219,217,${0.35 + i * 0.1}), rgba(156,219,217,0.05))`,
                  border: "1px solid rgba(255,255,255,0.14)",
                  borderBottom: "none",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  left: left + i * stepW,
                  top: baseY + 16,
                  width: stepW - 10,
                  textAlign: "center",
                  fontFamily: FONT,
                  fontSize: 20,
                  color: COLORS.midnight30,
                  letterSpacing: 1,
                  opacity: t,
                }}
              >
                {s}
              </div>
              <div
                style={{
                  position: "absolute",
                  left: left + i * stepW + stepW / 2 - 28,
                  top: baseY - h - 66,
                  width: 56,
                  height: 56,
                  borderRadius: 99,
                  background:
                    i === stages.length - 1
                      ? COLORS.orange
                      : "rgba(8,31,44,0.9)",
                  border: `2px solid ${i === stages.length - 1 ? COLORS.orange : COLORS.lightBlue}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: climber,
                  scale: String(0.5 + climber * 0.5),
                  boxShadow:
                    i === stages.length - 1
                      ? "0 0 36px rgba(255,130,0,0.8)"
                      : "none",
                }}
              >
                <Icon name="people" size={28} color={COLORS.white} />
              </div>
            </div>
          );
        })}
        <div
          style={{
            position: "absolute",
            left: left - 20,
            top: baseY,
            width: stepW * stages.length + 20,
            height: 2,
            background: "rgba(156,219,217,0.35)",
          }}
        />
      </Camera>

      <div style={{ position: "absolute", left: 140, top: 120, maxWidth: 720 }}>
        <Kicker index="09" label="Nationalization" />
        <div style={{ marginTop: 26 }}>
          <WordReveal
            from={14}
            size={84}
            weight={800}
            align="left"
            letterSpacing={-3}
            stagger={6}
          >
            Growing national talent.
          </WordReveal>
        </div>
        <div
          style={{
            marginTop: 44,
            display: "flex",
            gap: 28,
            alignItems: "center",
          }}
        >
          <FadeUp from={120}>
            <Donut
              size={220}
              from={130}
              thickness={20}
              label="Omani"
              sub="talent pipeline"
              segments={[
                { value: 78, color: COLORS.orange },
                { value: 22, color: "rgba(156,219,217,0.4)" },
              ]}
            />
          </FadeUp>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Kpi
              label="In critical roles"
              value={64}
              suffix="%"
              from={150}
              width={260}
            />
            <Kpi
              label="In leadership positions"
              value={58}
              suffix="%"
              from={165}
              width={260}
              accent={COLORS.turquoise}
            />
          </div>
        </div>
      </div>

      <Narration lines={narration} enabled={subtitles} />
    </AbsoluteFill>
  );
};
