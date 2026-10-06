import type React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Background } from "../components/Background";
import { Camera } from "../components/Camera";
import { GlassPanel } from "../components/GlassPanel";
import { Narration } from "../components/Narration";
import { Kicker, WordReveal, FadeUp } from "../components/Text";
import { Bars, TrendLine, Kpi } from "../components/Charts";
import { FlowChips } from "../components/FlowChips";
import { COLORS, FONT } from "../theme";

export const SCENE_04_DURATION = 390;

const narration = [
  {
    text: "Performance Management enables the organisation to understand contribution, recognise achievement, and identify future potential.",
    from: 20,
    to: 250,
  },
  {
    text: "It creates the foundation for all talent decisions.",
    from: 252,
    to: 342,
  },
];

type Props = { readonly subtitles?: boolean };

export const Scene04Performance: React.FC<Props> = ({ subtitles = true }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Background particles={40} glow="turquoise" />
      <Camera zoomFrom={1.05} zoomTo={1} panX={10}>
        <div
          style={{
            position: "absolute",
            right: 140,
            top: 150,
            width: 980,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 22,
          }}
        >
          <FadeUp from={30} style={{ gridColumn: "1 / span 2" }}>
            <GlassPanel accent="orange" padding={28}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    fontFamily: FONT,
                    fontSize: 16,
                    letterSpacing: 2.5,
                    textTransform: "uppercase",
                    color: COLORS.midnight30,
                  }}
                >
                  Goal achievement · enterprise view
                </div>
                <div
                  style={{
                    fontFamily: FONT,
                    fontSize: 16,
                    color: COLORS.turquoise,
                    fontWeight: 600,
                  }}
                >
                  ● LIVE
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 30,
                  marginTop: 18,
                  alignItems: "flex-end",
                }}
              >
                <Bars
                  values={[52, 58, 61, 66, 70, 74, 81, 88]}
                  from={60}
                  width={520}
                  height={170}
                  labels={["Q1", "Q2", "Q3", "Q4", "Q1", "Q2", "Q3", "Q4"]}
                />
                <TrendLine
                  values={[30, 38, 36, 48, 57, 62, 71, 80]}
                  from={80}
                  width={340}
                  height={170}
                />
              </div>
            </GlassPanel>
          </FadeUp>
          <div style={{ display: "flex", gap: 18 }}>
            <Kpi
              label="Goals on track"
              value={87}
              suffix="%"
              from={100}
              width={230}
            />
            <Kpi
              label="High performers"
              value={18}
              suffix="%"
              from={115}
              width={230}
              accent={COLORS.turquoise}
            />
          </div>
          <div style={{ display: "flex", gap: 18 }}>
            <Kpi
              label="Reviews completed"
              value={96}
              suffix="%"
              from={130}
              width={230}
              accent={COLORS.lightBlue}
            />
            <Kpi
              label="Potential identified"
              value={412}
              from={145}
              width={230}
            />
          </div>
        </div>
      </Camera>

      <div style={{ position: "absolute", left: 140, top: 120, maxWidth: 640 }}>
        <Kicker index="04" label="Performance Management" />
        <div style={{ marginTop: 26 }}>
          <WordReveal
            from={14}
            size={84}
            weight={800}
            align="left"
            letterSpacing={-3}
            stagger={6}
          >
            The foundation of every talent decision.
          </WordReveal>
        </div>
      </div>

      <div style={{ position: "absolute", left: 140, bottom: 170 }}>
        <FlowChips
          from={220}
          items={[
            "Performance Results",
            "Talent Reviews",
            "Leadership Decisions",
          ]}
          frame={frame}
        />
      </div>

      <Narration lines={narration} enabled={subtitles} />
    </AbsoluteFill>
  );
};
