import type React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";
import { Background } from "../components/Background";
import { Narration } from "../components/Narration";
import { Kicker, WordReveal, FadeUp } from "../components/Text";
import { COLORS, EASE, FONT } from "../theme";
import { progress } from "../lib/anim";

export const SCENE_05_DURATION = 390;

const narration = [
  {
    text: "The 9-Box Matrix combines performance and potential to identify future leaders, accelerate talent development, and support succession planning decisions.",
    from: 20,
    to: 294,
  },
];

const cellNames = [
  ["Emerging Talent", "High Potential", "Future Leaders"],
  ["Developing", "Core Talent", "High Performer"],
  ["Under Review", "Solid Contributor", "Specialist"],
];

type Props = { readonly subtitles?: boolean };

export const Scene05NineBox: React.FC<Props> = ({ subtitles = true }) => {
  const frame = useCurrentFrame();
  const cell = 200;
  const gridIn = progress(frame, 20, 70);
  const tiltX = interpolate(frame, [0, 390], [58, 50], { easing: EASE.soft });
  const rotZ = interpolate(frame, [0, 390], [-32, -26], { easing: EASE.soft });

  const people = Array.from({ length: 28 }).map((_, i) => {
    const sx = Math.floor(random(`sx${i}`) * 3);
    const sy = Math.floor(random(`sy${i}`) * 3);
    // Final cell is biased toward the top-right (high performance / potential).
    const ex = Math.min(2, sx + (random(`ex${i}`) > 0.45 ? 1 : 0));
    const ey = Math.max(0, sy - (random(`ey${i}`) > 0.4 ? 1 : 0));
    const start = 120 + random(`st${i}`) * 110;
    const t = progress(frame, start, start + 50, EASE.inOut);
    const jx = (random(`jx${i}`) - 0.5) * 120;
    const jy = (random(`jy${i}`) - 0.5) * 120;
    return {
      x: (sx + (ex - sx) * t) * cell + cell / 2 + jx,
      y: (sy + (ey - sy) * t) * cell + cell / 2 + jy,
      hot: ex === 2 && ey === 0,
      appear: progress(frame, 70 + i * 3, 90 + i * 3),
    };
  });

  const labelsIn = 260;

  return (
    <AbsoluteFill>
      <Background particles={50} glow="orange" />

      <div style={{ position: "absolute", left: 140, top: 120, maxWidth: 620 }}>
        <Kicker index="05" label="The 9-Box Matrix" />
        <div style={{ marginTop: 26 }}>
          <WordReveal
            from={14}
            size={84}
            weight={800}
            align="left"
            letterSpacing={-3}
            stagger={6}
          >
            Performance meets potential.
          </WordReveal>
        </div>
        <div
          style={{
            marginTop: 40,
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          {["High Potential", "Future Leaders", "Emerging Talent"].map(
            (l, i) => (
              <FadeUp key={l} from={labelsIn + i * 14}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    fontFamily: FONT,
                    fontSize: 36,
                    fontWeight: 600,
                    color: COLORS.white,
                  }}
                >
                  <div
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: 99,
                      background: COLORS.orange,
                      boxShadow: "0 0 20px rgba(255,130,0,0.9)",
                    }}
                  />
                  {l}
                </div>
              </FadeUp>
            ),
          )}
        </div>
      </div>

      {/* 3D matrix */}
      <div
        style={{
          position: "absolute",
          left: 1030,
          top: 250,
          width: cell * 3,
          height: cell * 3,
          perspective: 1600,
          opacity: gridIn,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            transformStyle: "preserve-3d",
            transform: `rotateX(${tiltX}deg) rotateZ(${rotZ}deg)`,
            transformOrigin: "50% 50%",
          }}
        >
          {cellNames.map((row, ry) =>
            row.map((name, rx) => {
              const i = ry * 3 + rx;
              const t = progress(frame, 20 + i * 6, 50 + i * 6);
              const hot = rx === 2 && ry === 0;
              const warm = (rx === 2 && ry === 1) || (rx === 1 && ry === 0);
              const glow = hot ? 0.5 + 0.5 * Math.sin(frame * 0.1) : 0;
              return (
                <div
                  key={name}
                  style={{
                    position: "absolute",
                    left: rx * cell,
                    top: ry * cell,
                    width: cell - 8,
                    height: cell - 8,
                    borderRadius: 14,
                    background: hot
                      ? `rgba(255,130,0,${0.55 + 0.25 * glow})`
                      : warm
                        ? "rgba(255,130,0,0.22)"
                        : "rgba(156,219,217,0.08)",
                    border: `1px solid ${hot ? COLORS.orange : "rgba(156,219,217,0.35)"}`,
                    boxShadow: hot
                      ? `0 0 ${60 + 40 * glow}px rgba(255,130,0,0.6)`
                      : "none",
                    opacity: t,
                    transform: `translateZ(${(1 - t) * -200 + (hot ? 24 : 0)}px)`,
                    fontFamily: FONT,
                    fontSize: 20,
                    fontWeight: 600,
                    color: COLORS.white,
                    padding: 16,
                    boxSizing: "border-box",
                  }}
                >
                  {name}
                </div>
              );
            }),
          )}
          {/* People moving across the grid */}
          {people.map((p, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left: p.x - 9,
                top: p.y - 9,
                width: 18,
                height: 18,
                borderRadius: 99,
                background: p.hot ? COLORS.orange : COLORS.white,
                boxShadow: p.hot
                  ? "0 0 24px rgba(255,130,0,1)"
                  : "0 0 12px rgba(255,255,255,0.7)",
                opacity: p.appear,
                transform: `translateZ(60px) scale(${p.appear})`,
              }}
            />
          ))}
          {/* Axis labels */}
          <div
            style={{
              position: "absolute",
              left: 0,
              top: cell * 3 + 20,
              width: cell * 3,
              textAlign: "center",
              fontFamily: FONT,
              fontSize: 22,
              letterSpacing: 5,
              color: COLORS.lightBlue,
              textTransform: "uppercase",
            }}
          >
            Performance →
          </div>
          <div
            style={{
              position: "absolute",
              left: -60,
              top: cell * 3,
              width: cell * 3,
              transformOrigin: "0 0",
              transform: "rotate(-90deg)",
              textAlign: "center",
              fontFamily: FONT,
              fontSize: 22,
              letterSpacing: 5,
              color: COLORS.lightBlue,
              textTransform: "uppercase",
            }}
          >
            Potential →
          </div>
        </div>
      </div>

      <Narration lines={narration} enabled={subtitles} />
    </AbsoluteFill>
  );
};
