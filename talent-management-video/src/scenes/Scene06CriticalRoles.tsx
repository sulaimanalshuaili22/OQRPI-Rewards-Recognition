import type React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Background } from "../components/Background";
import { Camera } from "../components/Camera";
import { Narration } from "../components/Narration";
import { Kicker, WordReveal, FadeUp } from "../components/Text";
import { Icon } from "../components/Icons";
import { COLORS, EASE, FONT } from "../theme";
import { progress } from "../lib/anim";

export const SCENE_06_DURATION = 390;

const narration = [
  {
    text: "Not all positions carry the same level of organisational risk.",
    from: 20,
    to: 132,
  },
  {
    text: "Critical Roles identify positions whose vacancy would significantly impact safety, operations, leadership continuity, or business performance.",
    from: 136,
    to: 384,
  },
];

// Org tree: level -> number of nodes
const levels = [1, 3, 7, 14];
const criticalSet = new Set(["0-0", "1-1", "2-2", "2-5", "3-3", "3-9", "3-12"]);

type Props = { readonly subtitles?: boolean };

export const Scene06CriticalRoles: React.FC<Props> = ({ subtitles = true }) => {
  const frame = useCurrentFrame();
  const { width } = useVideoConfig();
  const left = 860;
  const treeW = width - left - 140;
  const top = 200;
  const levelGap = 170;

  const nodePos = (l: number, i: number) => {
    const n = levels[l];
    return { x: left + ((i + 0.5) / n) * treeW, y: top + l * levelGap };
  };

  const highlightStart = 150;

  return (
    <AbsoluteFill>
      <Background particles={40} glow="orange" />
      <Camera zoomFrom={1.04} zoomTo={1.0}>
        <svg
          width={1920}
          height={1080}
          style={{ position: "absolute", inset: 0 }}
        >
          {levels.map((n, l) =>
            l === 0
              ? null
              : Array.from({ length: n }).map((_, i) => {
                  const parentN = levels[l - 1];
                  const parent = Math.floor((i / n) * parentN);
                  const a = nodePos(l - 1, parent);
                  const b = nodePos(l, i);
                  const t = progress(
                    frame,
                    30 + l * 24 + i * 2,
                    60 + l * 24 + i * 2,
                    EASE.inOut,
                  );
                  const crit = criticalSet.has(`${l}-${i}`);
                  const h = progress(
                    frame,
                    highlightStart + l * 20,
                    highlightStart + 30 + l * 20,
                  );
                  return (
                    <path
                      key={`${l}-${i}`}
                      d={`M${a.x} ${a.y + 28} C ${a.x} ${a.y + 90}, ${b.x} ${b.y - 90}, ${b.x} ${b.y - 28}`}
                      fill="none"
                      stroke={crit && h > 0 ? COLORS.orange : COLORS.lightBlue}
                      strokeOpacity={crit && h > 0 ? 0.9 : 0.3}
                      strokeWidth={crit && h > 0 ? 2.5 : 1.4}
                      strokeDasharray={400}
                      strokeDashoffset={400 * (1 - t)}
                    />
                  );
                }),
          )}
        </svg>
        {levels.map((n, l) =>
          Array.from({ length: n }).map((_, i) => {
            const p = nodePos(l, i);
            const t = progress(frame, 20 + l * 24 + i * 2, 50 + l * 24 + i * 2);
            const crit = criticalSet.has(`${l}-${i}`);
            const h = crit
              ? progress(
                  frame,
                  highlightStart + l * 20,
                  highlightStart + 30 + l * 20,
                )
              : 0;
            const ring = 0.5 + 0.5 * Math.sin(frame * 0.12 + i);
            const size = l === 0 ? 72 : l === 1 ? 60 : l === 2 ? 48 : 36;
            return (
              <div
                key={`${l}-${i}`}
                style={{
                  position: "absolute",
                  left: p.x - size / 2,
                  top: p.y - size / 2,
                  width: size,
                  height: size,
                  borderRadius: 999,
                  background: h > 0 ? COLORS.orange : "rgba(8,31,44,0.9)",
                  border: `2px solid ${h > 0 ? COLORS.orange : "rgba(156,219,217,0.55)"}`,
                  boxShadow:
                    h > 0
                      ? `0 0 ${30 + 30 * ring}px rgba(255,130,0,${0.5 + 0.4 * ring})`
                      : "0 8px 24px rgba(0,0,0,0.4)",
                  opacity: t,
                  scale: String(0.4 + 0.6 * t + h * 0.2),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {h > 0 ? (
                  <div
                    style={{
                      position: "absolute",
                      inset: -14 - ring * 18,
                      borderRadius: 999,
                      border: "1.5px solid rgba(255,130,0,0.6)",
                      opacity: 1 - ring,
                    }}
                  />
                ) : null}
                <Icon
                  name="people"
                  size={size * 0.5}
                  color={h > 0 ? COLORS.white : COLORS.lightBlue}
                />
              </div>
            );
          }),
        )}
      </Camera>

      <div style={{ position: "absolute", left: 140, top: 120, maxWidth: 620 }}>
        <Kicker index="06" label="Critical Roles" />
        <div style={{ marginTop: 26 }}>
          <WordReveal
            from={14}
            size={84}
            weight={800}
            align="left"
            letterSpacing={-3}
            stagger={6}
          >
            Where a vacancy carries risk.
          </WordReveal>
        </div>
        <div
          style={{
            marginTop: 44,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 14,
            maxWidth: 600,
          }}
        >
          {[
            { l: "Safety", i: "shield" as const },
            { l: "Operations", i: "performance" as const },
            { l: "Leadership continuity", i: "leadership" as const },
            { l: "Business performance", i: "analytics" as const },
          ].map((x, i) => (
            <FadeUp key={x.l} from={200 + i * 14}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "18px 20px",
                  borderRadius: 16,
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  fontFamily: FONT,
                  fontSize: 26,
                  fontWeight: 600,
                  color: COLORS.white,
                }}
              >
                <Icon name={x.i} size={30} />
                {x.l}
              </div>
            </FadeUp>
          ))}
        </div>
      </div>

      <Narration lines={narration} enabled={subtitles} />
    </AbsoluteFill>
  );
};
