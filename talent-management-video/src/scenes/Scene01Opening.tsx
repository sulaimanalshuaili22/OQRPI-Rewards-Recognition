import type React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Background } from "../components/Background";
import { NetworkField } from "../components/NetworkField";
import { Narration } from "../components/Narration";
import { WordReveal, FadeUp } from "../components/Text";
import { COLORS, EASE, FONT } from "../theme";
import { progress } from "../lib/anim";

export const SCENE_01_DURATION = 480;

const narration = [
  {
    text: "Every successful organisation shares one common strength… its people.",
    from: 50,
    to: 190,
  },
  {
    text: "Behind every operation, every innovation, and every achievement, lies talent.",
    from: 200,
    to: 330,
  },
];

type Props = { readonly subtitles?: boolean };

export const Scene01Opening: React.FC<Props> = ({ subtitles = true }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  // 0–60: single particle breathes in the dark
  // 60–120: burst; network grows
  // 120–300: camera pulls back to reveal the organisation
  const particleIn = progress(frame, 10, 50);
  const burst = progress(frame, 60, 95, EASE.inOut);
  const reveal = progress(frame, 70, 230, EASE.inOut);
  const pullBack = interpolate(frame, [60, 300], [2.6, 1], {
    easing: EASE.cinematic,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const bgFade = progress(frame, 70, 160);
  const breathe = 0.85 + 0.15 * Math.sin(frame * 0.18);
  const titleIn = 300;

  return (
    <AbsoluteFill style={{ backgroundColor: "#02080D" }}>
      <AbsoluteFill style={{ opacity: bgFade }}>
        <Background particles={60} glow="turquoise" />
      </AbsoluteFill>

      {/* The single glowing particle */}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div
          style={{
            width: 24,
            height: 24,
            borderRadius: 999,
            background: COLORS.white,
            boxShadow: `0 0 ${40 * breathe}px ${12 * breathe}px rgba(255,130,0,0.9), 0 0 ${140 * breathe}px ${50 * breathe}px rgba(255,130,0,0.35)`,
            opacity: particleIn * (1 - burst),
            scale: String(0.3 + particleIn * 0.7 + burst * 12),
          }}
        />
      </AbsoluteFill>

      {/* Burst shockwave */}
      <svg
        width={width}
        height={height}
        style={{ position: "absolute", inset: 0 }}
      >
        <circle
          cx={width / 2}
          cy={height / 2}
          r={burst * 1400}
          fill="none"
          stroke={COLORS.orange}
          strokeWidth={3 * (1 - burst)}
          opacity={(1 - burst) * 0.8}
        />
      </svg>

      {/* The living organisational network */}
      <AbsoluteFill
        style={{ scale: String(pullBack), transformOrigin: "50% 50%" }}
      >
        <NetworkField reveal={reveal} radius={560} rotationSpeed={0.0032} />
      </AbsoluteFill>

      {/* Title block */}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div style={{ textAlign: "center", marginTop: 40 }}>
          <WordReveal
            from={titleIn}
            size={118}
            weight={800}
            letterSpacing={-4}
            stagger={8}
          >
            Talent Management
          </WordReveal>
          <FadeUp from={titleIn + 34}>
            <div
              style={{
                marginTop: 22,
                fontSize: 40,
                fontWeight: 400,
                letterSpacing: 1,
                color: COLORS.lightBlue,
                fontFamily: FONT,
              }}
            >
              Building Capability.{" "}
              <span style={{ color: COLORS.orange, fontWeight: 600 }}>
                Creating Futures.
              </span>
            </div>
          </FadeUp>
          <FadeUp from={titleIn + 60} duration={30}>
            <div
              style={{
                margin: "34px auto 0",
                width: 120 * progress(frame, titleIn + 60, titleIn + 100),
                height: 3,
                background: COLORS.orange,
              }}
            />
          </FadeUp>
        </div>
      </AbsoluteFill>

      <Narration lines={narration} enabled={subtitles} />
    </AbsoluteFill>
  );
};
