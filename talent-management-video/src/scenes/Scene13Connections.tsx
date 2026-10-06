import type React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Background } from "../components/Background";
import { Camera } from "../components/Camera";
import { Narration } from "../components/Narration";
import { Kicker, WordReveal } from "../components/Text";
import { Icon, type IconName } from "../components/Icons";
import { COLORS, EASE, FONT } from "../theme";
import { progress } from "../lib/anim";

export const SCENE_13_DURATION = 480;

const narration = [
  {
    text: "Together, these initiatives create a powerful talent ecosystem that transforms data into decisions, potential into capability, and employees into future leaders.",
    from: 200,
    to: 460,
  },
];

type Node = { id: string; label: string; icon: IconName; x: number; y: number };

const nodes: Node[] = [
  { id: "perf", label: "Performance", icon: "performance", x: 1000, y: 300 },
  { id: "nine", label: "9-Box", icon: "ninebox", x: 1320, y: 300 },
  { id: "crit", label: "Critical Roles", icon: "critical", x: 1000, y: 560 },
  { id: "succ", label: "Succession", icon: "succession", x: 1640, y: 430 },
  {
    id: "lead",
    label: "Leadership Programmes",
    icon: "leadership",
    x: 1000,
    y: 820,
  },
  { id: "ready", label: "Readiness", icon: "shield", x: 1640, y: 700 },
  { id: "idp", label: "IDPs", icon: "idp", x: 1320, y: 820 },
  { id: "cap", label: "Capability", icon: "learning", x: 1320, y: 560 },
  {
    id: "nat",
    label: "Nationalization",
    icon: "nationalization",
    x: 1000,
    y: 1000,
  },
  { id: "fut", label: "Future Workforce", icon: "people", x: 1640, y: 960 },
];

const links: ReadonlyArray<{ from: string; to: string; text: string }> = [
  { from: "perf", to: "nine", text: "Performance feeds 9-Box" },
  { from: "nine", to: "succ", text: "9-Box feeds Succession" },
  { from: "crit", to: "succ", text: "Critical Roles feed Succession" },
  { from: "lead", to: "ready", text: "Leadership Programmes feed Readiness" },
  { from: "idp", to: "cap", text: "IDPs improve Capability" },
  {
    from: "nat",
    to: "fut",
    text: "Nationalization supports the Future Workforce",
  },
];

type Props = { readonly subtitles?: boolean };

export const Scene13Connections: React.FC<Props> = ({ subtitles = true }) => {
  const frame = useCurrentFrame();
  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));
  const stepStart = 40;
  const step = 28;

  return (
    <AbsoluteFill>
      <Background particles={70} glow="orange" />
      <Camera zoomFrom={1.0} zoomTo={0.9} panY={-80} frames={[0, 480]}>
        <svg
          width={1920}
          height={1080}
          style={{ position: "absolute", inset: 0 }}
        >
          <defs>
            <marker
              id="arrow"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="8"
              markerHeight="8"
              orient="auto-start-reverse"
            >
              <path d="M0 0 L10 5 L0 10 z" fill={COLORS.orange} />
            </marker>
          </defs>
          {links.map((l, i) => {
            const a = byId[l.from];
            const b = byId[l.to];
            const t = progress(
              frame,
              stepStart + i * step,
              stepStart + i * step + 26,
              EASE.inOut,
            );
            const mx = (a.x + b.x) / 2;
            const d = `M${a.x} ${a.y} C ${mx} ${a.y}, ${mx} ${b.y}, ${b.x} ${b.y}`;
            return (
              <g key={i}>
                <path
                  d={d}
                  fill="none"
                  stroke={COLORS.lightBlue}
                  strokeOpacity={0.18}
                  strokeWidth={2}
                />
                <path
                  d={d}
                  fill="none"
                  stroke={COLORS.orange}
                  strokeWidth={3.5}
                  strokeLinecap="round"
                  strokeDasharray={1200}
                  strokeDashoffset={1200 * (1 - t)}
                  markerEnd={t >= 0.98 ? "url(#arrow)" : undefined}
                />
                {t >= 1 ? (
                  <path
                    d={d}
                    fill="none"
                    stroke={COLORS.white}
                    strokeWidth={6}
                    strokeLinecap="round"
                    strokeDasharray="3 300"
                    strokeDashoffset={-((frame * 6 + i * 60) % 600)}
                    opacity={0.9}
                  />
                ) : null}
              </g>
            );
          })}
        </svg>
        {nodes.map((n, i) => {
          const t = progress(frame, 10 + i * 6, 40 + i * 6);
          return (
            <div
              key={n.id}
              style={{
                position: "absolute",
                left: n.x - 120,
                top: n.y - 38,
                width: 240,
                padding: "12px 16px",
                display: "flex",
                alignItems: "center",
                gap: 12,
                borderRadius: 16,
                background: "rgba(8,31,44,0.82)",
                border: "1px solid rgba(156,219,217,0.4)",
                boxShadow: "0 14px 40px rgba(0,0,0,0.45)",
                fontFamily: FONT,
                opacity: t,
                scale: String(0.7 + 0.3 * t),
              }}
            >
              <Icon name={n.icon} size={28} />
              <div
                style={{
                  fontSize: 21,
                  fontWeight: 600,
                  color: COLORS.white,
                  lineHeight: 1.1,
                }}
              >
                {n.label}
              </div>
            </div>
          );
        })}
      </Camera>

      <div style={{ position: "absolute", left: 140, top: 120, maxWidth: 700 }}>
        <Kicker index="13" label="How everything connects" />
        <div style={{ marginTop: 26 }}>
          <WordReveal
            from={14}
            size={84}
            weight={800}
            align="left"
            letterSpacing={-3}
            stagger={6}
          >
            Data into decisions. Potential into capability.
          </WordReveal>
        </div>
        <div
          style={{
            marginTop: 40,
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          {links.map((l, i) => {
            const t = progress(
              frame,
              stepStart + i * step + 8,
              stepStart + i * step + 28,
            );
            const parts = l.text.split(/ (feeds|feed|improve|supports) /);
            return (
              <div
                key={i}
                style={{
                  fontFamily: FONT,
                  fontSize: 28,
                  color: COLORS.white,
                  opacity: t,
                  translate: `${(1 - t) * -20}px 0px`,
                  display: "flex",
                  gap: 12,
                  alignItems: "baseline",
                }}
              >
                <span style={{ fontWeight: 700 }}>{parts[0]}</span>
                <span
                  style={{
                    color: COLORS.orange,
                    fontWeight: 600,
                    fontSize: 22,
                    letterSpacing: 2,
                    textTransform: "uppercase",
                  }}
                >
                  {parts[1]}
                </span>
                <span style={{ fontWeight: 700 }}>{parts[2]}</span>
              </div>
            );
          })}
        </div>
      </div>

      <Narration lines={narration} enabled={subtitles} />
    </AbsoluteFill>
  );
};
