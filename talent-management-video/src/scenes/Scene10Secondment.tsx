import type React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Background } from "../components/Background";
import { Camera } from "../components/Camera";
import { Narration } from "../components/Narration";
import { Kicker, WordReveal, FadeUp } from "../components/Text";
import { Icon } from "../components/Icons";
import { COLORS, EASE, FONT } from "../theme";
import { progress } from "../lib/anim";

export const SCENE_10_DURATION = 330;

const narration = [
  {
    text: "Secondment programmes create broader exposure, accelerate learning, and strengthen organisational capability through strategic experience opportunities.",
    from: 20,
    to: 300,
  },
];

type Props = { readonly subtitles?: boolean };

const Org: React.FC<{
  x: number;
  y: number;
  label: string;
  from: number;
  frame: number;
  accent: string;
}> = ({ x, y, label, from, frame, accent }) => {
  const t = progress(frame, from, from + 30);
  return (
    <div
      style={{
        position: "absolute",
        left: x - 150,
        top: y - 110,
        width: 300,
        height: 220,
        borderRadius: 26,
        background: "rgba(8,31,44,0.8)",
        border: `1px solid ${accent}`,
        boxShadow: `0 0 60px ${accent}33, 0 30px 70px rgba(0,0,0,0.45)`,
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 14,
        fontFamily: FONT,
        opacity: t,
        scale: String(0.8 + 0.2 * t),
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 8,
        }}
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            style={{
              width: 22,
              height: 22,
              borderRadius: 6,
              background: i % 3 === 0 ? accent : "rgba(255,255,255,0.15)",
            }}
          />
        ))}
      </div>
      <div style={{ fontSize: 24, fontWeight: 700, color: COLORS.white }}>
        {label}
      </div>
    </div>
  );
};

export const Scene10Secondment: React.FC<Props> = ({ subtitles = true }) => {
  const frame = useCurrentFrame();
  const ax = 1000;
  const bx = 1640;
  const y = 560;

  // Two arcs: upper (A -> B) and lower (B -> A)
  const arcUp = `M${ax + 150} ${y - 40} C ${ax + 330} ${y - 260}, ${bx - 330} ${y - 260}, ${bx - 150} ${y - 40}`;
  const arcDown = `M${bx - 150} ${y + 40} C ${bx - 330} ${y + 260}, ${ax + 330} ${y + 260}, ${ax + 150} ${y + 40}`;
  const arcsIn = progress(frame, 70, 130, EASE.inOut);

  return (
    <AbsoluteFill>
      <Background particles={50} glow="turquoise" />
      <Camera zoomFrom={1.06} zoomTo={1}>
        <svg
          width={1920}
          height={1080}
          style={{ position: "absolute", inset: 0 }}
        >
          <path
            d={arcUp}
            fill="none"
            stroke={COLORS.orange}
            strokeWidth={3}
            strokeOpacity={0.6}
            strokeDasharray={1200}
            strokeDashoffset={1200 * (1 - arcsIn)}
          />
          <path
            d={arcDown}
            fill="none"
            stroke={COLORS.turquoise}
            strokeWidth={3}
            strokeOpacity={0.6}
            strokeDasharray={1200}
            strokeDashoffset={1200 * (1 - arcsIn)}
          />
          {/* Knowledge-transfer particles travelling along the arcs */}
          {arcsIn >= 1
            ? [0, 1, 2, 3].map((k) => (
                <g key={k}>
                  <path
                    d={arcUp}
                    fill="none"
                    stroke={COLORS.orange}
                    strokeWidth={10}
                    strokeLinecap="round"
                    strokeDasharray="2 2000"
                    strokeDashoffset={-((frame * 7 + k * 220) % 900)}
                    opacity={0.95}
                  />
                  <path
                    d={arcDown}
                    fill="none"
                    stroke={COLORS.turquoise}
                    strokeWidth={10}
                    strokeLinecap="round"
                    strokeDasharray="2 2000"
                    strokeDashoffset={-((frame * 7 + k * 220 + 100) % 900)}
                    opacity={0.95}
                  />
                </g>
              ))
            : null}
        </svg>
        <Org
          x={ax}
          y={y}
          label="Home organisation"
          from={30}
          frame={frame}
          accent={COLORS.orange}
        />
        <Org
          x={bx}
          y={y}
          label="Host organisation"
          from={50}
          frame={frame}
          accent={COLORS.turquoise}
        />
        <div
          style={{
            position: "absolute",
            left: (ax + bx) / 2 - 40,
            top: y - 40,
            width: 80,
            height: 80,
            borderRadius: 99,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.18)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: arcsIn,
          }}
        >
          <Icon name="secondment" size={38} color={COLORS.white} />
        </div>
      </Camera>

      <div style={{ position: "absolute", left: 140, top: 120, maxWidth: 680 }}>
        <Kicker index="10" label="Secondment Management" />
        <div style={{ marginTop: 26 }}>
          <WordReveal
            from={14}
            size={84}
            weight={800}
            align="left"
            letterSpacing={-3}
            stagger={6}
          >
            Experience that travels.
          </WordReveal>
        </div>
        <div
          style={{
            marginTop: 44,
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          {[
            "Broader exposure",
            "Accelerated learning",
            "Knowledge transfer",
            "Strengthened capability",
          ].map((l, i) => (
            <FadeUp key={l} from={150 + i * 16}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  fontFamily: FONT,
                  fontSize: 32,
                  fontWeight: 600,
                  color: COLORS.white,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 3,
                    background: i % 2 === 0 ? COLORS.orange : COLORS.turquoise,
                  }}
                />
                {l}
              </div>
            </FadeUp>
          ))}
        </div>
      </div>

      <Narration lines={narration} enabled={subtitles} />
    </AbsoluteFill>
  );
};
