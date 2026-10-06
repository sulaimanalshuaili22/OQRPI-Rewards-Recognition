import type React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Background } from "../components/Background";
import { NetworkField } from "../components/NetworkField";
import { Refinery } from "../components/Refinery";
import { Logo } from "../components/Logo";
import { LightStreak } from "../components/LightStreak";
import { Narration } from "../components/Narration";
import { WordReveal, FadeUp } from "../components/Text";
import { COLORS, EASE, FONT } from "../theme";
import { progress } from "../lib/anim";

export const SCENE_14_DURATION = 690;

const narration = [
  {
    text: "The future is not built by systems. It is built by people.",
    from: 30,
    to: 145,
  },
  {
    text: "By investing in talent today, we create the leaders, capabilities, and opportunities that will shape tomorrow.",
    from: 165,
    to: 346,
  },
  {
    text: "Talent Management. Building the workforce of the future.",
    from: 360,
    to: 465,
  },
];

type Props = { readonly subtitles?: boolean };

export const Scene14Future: React.FC<Props> = ({ subtitles = true }) => {
  const frame = useCurrentFrame();

  // Refinery dissolves into the workforce network, then the camera rises.
  const refineryIn = progress(frame, 0, 80, EASE.inOut);
  const refineryOut = interpolate(frame, [120, 220], [1, 0], {
    easing: EASE.inOut,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const networkIn = progress(frame, 100, 260, EASE.inOut);
  const rise = interpolate(frame, [200, 520], [0, 1], {
    easing: EASE.cinematic,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const networkScale = 1.35 - rise * 0.55;
  const networkY = 260 - rise * 380;

  const quoteOut = 330;
  const logoStart = 480;
  const logoReveal = progress(frame, logoStart, logoStart + 50, EASE.inOut);
  const fadeToBlack = progress(frame, 640, 690, EASE.inOut);

  return (
    <AbsoluteFill style={{ backgroundColor: "#02080D" }}>
      <Background particles={90} glow="orange" />

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          opacity: refineryIn * refineryOut * 0.6,
        }}
      >
        <Refinery reveal={refineryIn} height={520} />
      </div>

      <AbsoluteFill
        style={{
          scale: String(networkScale),
          translate: `0px ${networkY}px`,
          transformOrigin: "50% 50%",
        }}
      >
        <NetworkField
          reveal={networkIn}
          radius={620}
          count={520}
          rotationSpeed={0.0028}
          highlightEvery={7}
        />
      </AbsoluteFill>

      {/* Closing statement */}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div style={{ textAlign: "center", maxWidth: 1600, marginTop: -40 }}>
          <WordReveal
            from={40}
            size={80}
            weight={800}
            letterSpacing={-3}
            stagger={7}
            out={quoteOut}
          >
            The future is not built by systems.
          </WordReveal>
          <WordReveal
            from={110}
            size={80}
            weight={800}
            letterSpacing={-3}
            stagger={7}
            color={COLORS.orange}
            out={quoteOut}
          >
            It is built by people.
          </WordReveal>
        </div>
      </AbsoluteFill>

      {/* Final screen */}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 36,
          }}
        >
          <div style={{ opacity: progress(frame, logoStart, logoStart + 20) }}>
            <Logo height={150} reveal={logoReveal} />
          </div>
          <FadeUp from={logoStart + 40}>
            <div
              style={{
                fontFamily: FONT,
                fontSize: 46,
                fontWeight: 500,
                letterSpacing: 10,
                textTransform: "uppercase",
                color: COLORS.lightBlue,
                textAlign: "center",
              }}
            >
              Talent Management
            </div>
          </FadeUp>
          <div style={{ display: "flex", gap: 40, alignItems: "center" }}>
            {[
              "Building Capability.",
              "Creating Futures.",
              "Securing Tomorrow.",
            ].map((l, i) => (
              <FadeUp key={l} from={logoStart + 70 + i * 16}>
                <div
                  style={{
                    fontFamily: FONT,
                    fontSize: 34,
                    fontWeight: 600,
                    color: i === 2 ? COLORS.orange : COLORS.white,
                    letterSpacing: -0.5,
                  }}
                >
                  {l}
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </AbsoluteFill>

      <LightStreak from={logoStart + 30} duration={40} y={540} thickness={5} />
      <LightStreak
        from={logoStart + 120}
        duration={48}
        y={560}
        thickness={3}
        color={COLORS.turquoise}
      />

      <Narration lines={narration} enabled={subtitles} />

      <AbsoluteFill
        style={{
          backgroundColor: "#000",
          opacity: fadeToBlack,
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};
