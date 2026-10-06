import type React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Background } from "../components/Background";
import { Camera } from "../components/Camera";
import { Narration } from "../components/Narration";
import { Kicker, WordReveal } from "../components/Text";
import { Icon, type IconName } from "../components/Icons";
import { COLORS, EASE, FONT } from "../theme";
import { progress } from "../lib/anim";

export const SCENE_08_DURATION = 390;

const narration = [
  {
    text: "Leadership Development equips employees with the capabilities, mindsets, and experiences required to lead teams, functions, and future business transformation.",
    from: 20,
    to: 300,
  },
];

const journey: ReadonlyArray<{ label: string; sub: string; icon: IconName }> = [
  {
    label: "Masar Programmes",
    sub: "Structured leadership pathways",
    icon: "leadership",
  },
  {
    label: "Assessments",
    sub: "Capability & potential insight",
    icon: "review",
  },
  {
    label: "Development Centres",
    sub: "Immersive leadership practice",
    icon: "learning",
  },
  {
    label: "Executive Coaching",
    sub: "One-to-one acceleration",
    icon: "people",
  },
  {
    label: "Leadership Journeys",
    sub: "Experience that transforms",
    icon: "analytics",
  },
];

type Props = { readonly subtitles?: boolean };

export const Scene08Leadership: React.FC<Props> = ({ subtitles = true }) => {
  const frame = useCurrentFrame();
  const left = 330;
  const right = 1590;
  const baseY = 700;
  const pathDraw = progress(frame, 60, 230, EASE.inOut);

  const pts = journey.map((_, i) => {
    const x = left + ((right - left) * i) / (journey.length - 1);
    const y = baseY - i * 62 + (i % 2 === 0 ? 0 : 30);
    return { x, y };
  });
  const d = pts
    .map((p, i) => {
      if (i === 0) return `M${p.x} ${p.y}`;
      const prev = pts[i - 1];
      const cx = (prev.x + p.x) / 2;
      return `C ${cx} ${prev.y}, ${cx} ${p.y}, ${p.x} ${p.y}`;
    })
    .join(" ");

  return (
    <AbsoluteFill>
      <Background particles={60} glow="orange" />
      <Camera zoomFrom={1.0} zoomTo={1.04} panY={-14}>
        <svg
          width={1920}
          height={1080}
          style={{ position: "absolute", inset: 0 }}
        >
          <path
            d={d}
            fill="none"
            stroke={COLORS.lightBlue}
            strokeOpacity={0.25}
            strokeWidth={2}
          />
          <path
            d={d}
            fill="none"
            stroke={COLORS.orange}
            strokeWidth={4}
            strokeLinecap="round"
            strokeDasharray={2400}
            strokeDashoffset={2400 * (1 - pathDraw)}
          />
          {/* travelling leader marker */}
          <circle
            cx={pts[0].x + (pts[pts.length - 1].x - pts[0].x) * pathDraw}
            cy={0}
            r={0}
          />
        </svg>
        {journey.map((j, i) => {
          const t = progress(frame, 70 + i * 36, 100 + i * 36);
          const p = pts[i];
          const glow = 0.5 + 0.5 * Math.sin(frame * 0.1 + i);
          return (
            <div key={j.label}>
              <div
                style={{
                  position: "absolute",
                  left: p.x - 16,
                  top: p.y - 16,
                  width: 32,
                  height: 32,
                  borderRadius: 99,
                  background: COLORS.orange,
                  boxShadow: `0 0 ${20 + 20 * glow}px rgba(255,130,0,0.9)`,
                  scale: String(t),
                  border: "3px solid rgba(255,255,255,0.9)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  left: p.x - 150,
                  top: i % 2 === 0 ? p.y + 46 : p.y - 196,
                  width: 300,
                  padding: "22px 24px",
                  borderRadius: 18,
                  background: "rgba(8,31,44,0.75)",
                  border: "1px solid rgba(156,219,217,0.35)",
                  backdropFilter: "blur(16px)",
                  WebkitBackdropFilter: "blur(16px)",
                  boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
                  fontFamily: FONT,
                  opacity: t,
                  translate: `0px ${(1 - t) * (i % 2 === 0 ? 24 : -24)}px`,
                }}
              >
                <Icon name={j.icon} size={34} />
                <div
                  style={{
                    fontSize: 27,
                    fontWeight: 700,
                    color: COLORS.white,
                    marginTop: 12,
                    lineHeight: 1.1,
                  }}
                >
                  {j.label}
                </div>
                <div
                  style={{
                    fontSize: 19,
                    color: COLORS.lightBlue,
                    marginTop: 6,
                  }}
                >
                  {j.sub}
                </div>
              </div>
            </div>
          );
        })}
      </Camera>

      <div style={{ position: "absolute", left: 140, top: 120, maxWidth: 900 }}>
        <Kicker index="08" label="Leadership Development" />
        <div style={{ marginTop: 26 }}>
          <WordReveal
            from={14}
            size={84}
            weight={800}
            align="left"
            letterSpacing={-3}
            stagger={6}
          >
            Capabilities. Mindsets. Experiences.
          </WordReveal>
        </div>
      </div>

      <Narration lines={narration} enabled={subtitles} />
    </AbsoluteFill>
  );
};
