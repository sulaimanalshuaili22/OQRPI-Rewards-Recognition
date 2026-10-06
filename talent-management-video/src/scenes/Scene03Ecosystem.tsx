import type React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Background } from "../components/Background";
import { Camera } from "../components/Camera";
import { Narration } from "../components/Narration";
import { Kicker, WordReveal } from "../components/Text";
import { Icon, type IconName } from "../components/Icons";
import { COLORS, EASE, FONT } from "../theme";
import { progress } from "../lib/anim";

export const SCENE_03_DURATION = 540;

export const PROGRAMS: ReadonlyArray<{ label: string; icon: IconName }> = [
  { label: "Performance Management", icon: "performance" },
  { label: "Succession Planning", icon: "succession" },
  { label: "Critical Roles Management", icon: "critical" },
  { label: "Leadership Development", icon: "leadership" },
  { label: "Learning & Development", icon: "learning" },
  { label: "Individual Development Plans", icon: "idp" },
  { label: "Nationalization", icon: "nationalization" },
  { label: "Talent Review", icon: "review" },
  { label: "9-Box Matrix", icon: "ninebox" },
  { label: "Rewards & Recognition", icon: "rewards" },
  { label: "Secondment Management", icon: "secondment" },
  { label: "Talent Analytics", icon: "analytics" },
];

const narration = [
  {
    text: "Talent Management is not a collection of separate programmes. It is one integrated ecosystem.",
    from: 30,
    to: 200,
  },
  {
    text: "Each programme generates insights, actions and data that strengthen the next.",
    from: 300,
    to: 470,
  },
];

type Props = { readonly subtitles?: boolean };

export const Scene03Ecosystem: React.FC<Props> = ({ subtitles = true }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const cx = width / 2 + 260;
  const cy = height / 2 + 30;
  const orbit = frame * 0.0025;
  const hubIn = progress(frame, 20, 70);
  const rx = 540;
  const ry = 330;

  const nodes = PROGRAMS.map((p, i) => {
    const a = orbit + (i / PROGRAMS.length) * Math.PI * 2 - Math.PI / 2;
    const depth = 0.5 + 0.5 * Math.sin(a); // front/back for subtle 3D
    return {
      ...p,
      x: cx + Math.cos(a) * rx,
      y: cy + Math.sin(a) * ry,
      depth,
      t: progress(frame, 90 + i * 14, 120 + i * 14),
    };
  });

  return (
    <AbsoluteFill>
      <Background particles={80} glow="turquoise" />
      <Camera zoomFrom={1.12} zoomTo={1} panY={10}>
        <svg
          width={width}
          height={height}
          style={{ position: "absolute", inset: 0 }}
        >
          <defs>
            <radialGradient id="hub">
              <stop offset="0" stopColor={COLORS.white} stopOpacity="0.95" />
              <stop offset="35%" stopColor={COLORS.orange} stopOpacity="0.9" />
              <stop offset="100%" stopColor={COLORS.orange} stopOpacity="0" />
            </radialGradient>
          </defs>
          {/* Orbit ring */}
          <ellipse
            cx={cx}
            cy={cy}
            rx={rx}
            ry={ry}
            fill="none"
            stroke={COLORS.lightBlue}
            strokeOpacity={0.15 * hubIn}
            strokeWidth={1}
            strokeDasharray="4 10"
          />
          {/* Spokes to hub + ring connections */}
          {nodes.map((n, i) => {
            const next = nodes[(i + 1) % nodes.length];
            const link = progress(frame, 280 + i * 8, 320 + i * 8, EASE.inOut);
            const pulse = 0.5 + 0.5 * Math.sin(frame * 0.12 - i * 0.9);
            return (
              <g key={i}>
                <line
                  x1={cx}
                  y1={cy}
                  x2={cx + (n.x - cx) * n.t}
                  y2={cy + (n.y - cy) * n.t}
                  stroke={COLORS.lightBlue}
                  strokeOpacity={0.22 + 0.25 * n.depth}
                  strokeWidth={1.4}
                />
                <line
                  x1={cx}
                  y1={cy}
                  x2={n.x}
                  y2={n.y}
                  stroke={COLORS.orange}
                  strokeWidth={2.2}
                  strokeDasharray="18 400"
                  strokeDashoffset={-frame * 4 - i * 40}
                  opacity={n.t * (0.4 + 0.6 * pulse)}
                />
                <line
                  x1={n.x}
                  y1={n.y}
                  x2={n.x + (next.x - n.x) * link}
                  y2={n.y + (next.y - n.y) * link}
                  stroke={COLORS.turquoise}
                  strokeOpacity={0.55}
                  strokeWidth={1.6}
                />
              </g>
            );
          })}
          {/* Hub glow */}
          <circle
            cx={cx}
            cy={cy}
            r={220 * hubIn}
            fill="url(#hub)"
            opacity={0.45}
          />
          <circle
            cx={cx}
            cy={cy}
            r={(150 + 12 * Math.sin(frame * 0.08)) * hubIn}
            fill="none"
            stroke={COLORS.orange}
            strokeOpacity={0.5}
            strokeWidth={1.5}
          />
        </svg>

        {/* Hub label */}
        <div
          style={{
            position: "absolute",
            left: cx - 170,
            top: cy - 80,
            width: 340,
            height: 160,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 999,
            background: "rgba(8,31,44,0.85)",
            border: "1px solid rgba(255,130,0,0.6)",
            boxShadow: "0 0 80px rgba(255,130,0,0.35)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            fontFamily: FONT,
            opacity: hubIn,
            scale: String(0.6 + 0.4 * hubIn),
          }}
        >
          <div
            style={{
              fontSize: 30,
              fontWeight: 800,
              color: COLORS.white,
              letterSpacing: 4,
            }}
          >
            TALENT
          </div>
          <div
            style={{
              fontSize: 30,
              fontWeight: 800,
              color: COLORS.orange,
              letterSpacing: 4,
            }}
          >
            MANAGEMENT
          </div>
        </div>

        {/* Program nodes */}
        {nodes.map((n, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: n.x - 120,
              top: n.y - 44,
              width: 240,
              padding: "14px 18px",
              display: "flex",
              alignItems: "center",
              gap: 14,
              borderRadius: 16,
              background: "rgba(8,31,44,0.72)",
              border: "1px solid rgba(156,219,217,0.35)",
              boxShadow: `0 10px 40px rgba(0,0,0,0.4), 0 0 ${20 + 20 * n.depth}px rgba(0,176,185,0.25)`,
              backdropFilter: "blur(14px)",
              WebkitBackdropFilter: "blur(14px)",
              fontFamily: FONT,
              opacity: n.t * (0.75 + 0.25 * n.depth),
              scale: String((0.86 + 0.14 * n.depth) * (0.7 + 0.3 * n.t)),
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: "rgba(255,130,0,0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Icon name={n.icon} size={28} />
            </div>
            <div
              style={{
                fontSize: 21,
                fontWeight: 600,
                color: COLORS.white,
                lineHeight: 1.15,
              }}
            >
              {n.label}
            </div>
          </div>
        ))}
      </Camera>

      <div style={{ position: "absolute", left: 140, top: 120, maxWidth: 440 }}>
        <Kicker index="03" label="The ecosystem" />
        <div style={{ marginTop: 26 }}>
          <WordReveal
            from={14}
            size={68}
            weight={800}
            align="left"
            letterSpacing={-2.5}
            stagger={6}
          >
            One integrated ecosystem.
          </WordReveal>
        </div>
        <WordReveal
          from={300}
          size={30}
          weight={400}
          align="left"
          color={COLORS.lightBlue}
          letterSpacing={0}
          lineHeight={1.4}
          stagger={3}
          style={{ marginTop: 20 }}
        >
          Insights, actions and data flow between every programme.
        </WordReveal>
      </div>

      <Narration lines={narration} enabled={subtitles} />
    </AbsoluteFill>
  );
};
