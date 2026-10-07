/**
 * OQ RPI Talent Command Center UI language, recreated for the film:
 * dark teal cards with an accent top border, gradient icon tiles, uppercase
 * KPI labels, large figures and the "data as of" source line.
 */
import type React from "react";
import { Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Icon, type IconName } from "../../components/Icons";
import { COLORS, FONT, FONT_AR } from "../../theme";
import { ramp, EASE } from "../math";
import { AS_OF, COMMAND_CENTER, fmt } from "../data";

export type Accent = "orange" | "green" | "teal" | "purple" | "gold" | "red";
export const ACCENT: Record<Accent, string> = {
  orange: "#FF8200",
  green: "#12B07A",
  teal: "#16B6C2",
  purple: "#7C6BEA",
  gold: "#F7C548",
  red: "#F04B41",
};

const CARD_BG = "linear-gradient(165deg, rgba(18,52,62,0.94) 0%, rgba(9,30,40,0.94) 55%, rgba(7,22,31,0.95) 100%)";
const MUTED = "#8FA6B0";

export const IconTile: React.FC<{ readonly icon: IconName; readonly accent: Accent; readonly size?: number }> = ({ icon, accent, size = 48 }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: size * 0.24,
      background: `linear-gradient(145deg, ${ACCENT[accent]}, ${ACCENT[accent]}AA)`,
      boxShadow: `0 6px 20px ${ACCENT[accent]}55, inset 0 1px 0 rgba(255,255,255,0.35)`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    }}
  >
    <Icon name={icon} size={size * 0.56} color="#ffffff" strokeWidth={2} />
  </div>
);

/** Talent Command Center card shell. */
export const DashCard: React.FC<{
  readonly title: string;
  readonly sub?: string;
  readonly icon?: IconName;
  readonly accent: Accent;
  readonly width: number;
  readonly children?: React.ReactNode;
  readonly source?: boolean;
  readonly index?: string;
}> = ({ title, sub, icon, accent, width, children, source = true, index }) => (
  <div
    style={{
      width,
      padding: "20px 22px 16px",
      borderRadius: 14,
      background: CARD_BG,
      border: "1px solid rgba(255,255,255,0.08)",
      borderTop: `3px solid ${ACCENT[accent]}`,
      boxShadow: `0 -6px 30px -12px ${ACCENT[accent]}AA, 0 30px 70px rgba(0,0,0,0.5)`,
      fontFamily: FONT,
      color: COLORS.white,
      boxSizing: "border-box",
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      {index ? <div style={{ fontSize: 18, fontWeight: 700, color: MUTED, width: 26 }}>{index}</div> : null}
      {icon ? <IconTile icon={icon} accent={accent} size={44} /> : null}
      <div>
        <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.2, lineHeight: 1.15 }}>{title}</div>
        {sub ? <div style={{ fontSize: 13, color: MUTED, marginTop: 3 }}>{sub}</div> : null}
      </div>
    </div>
    {children ? <div style={{ marginTop: 16 }}>{children}</div> : null}
    {source ? (
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#0B1E27", background: "#9FB4BD", borderRadius: 4, padding: "2px 7px", letterSpacing: 0.4 }}>
          Real data
        </div>
        <div style={{ fontSize: 12, color: MUTED }}>Data as of {AS_OF}</div>
      </div>
    ) : null}
  </div>
);

/** Big headline figure with an animated count-up and progress bar. */
export const BigFigure: React.FC<{
  readonly label: string;
  readonly value: number;
  readonly from: number;
  readonly suffix?: string;
  readonly accent: Accent;
  readonly bar?: number; // 0..1
  readonly note?: string;
}> = ({ label, value, from, suffix = "", accent, bar, note }) => {
  const frame = useCurrentFrame();
  const t = ramp(frame, from, from + 40);
  const n = Math.round(value * t);
  return (
    <div>
      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.6, color: "#C9D6DB", textTransform: "uppercase" }}>{label}</div>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
        <div style={{ fontSize: 50, fontWeight: 800, letterSpacing: -1.5 }}>
          {fmt(n)}
          {suffix}
        </div>
        {note ? <div style={{ fontSize: 12, color: MUTED }}>{note}</div> : null}
      </div>
      {bar !== undefined ? (
        <div style={{ height: 8, background: "rgba(255,255,255,0.08)", borderRadius: 2, marginTop: 6 }}>
          <div style={{ width: `${bar * t * 100}%`, height: "100%", background: ACCENT[accent], borderRadius: 2 }} />
        </div>
      ) : null}
    </div>
  );
};

/** Label / value rows as in the Executive Talent Overview cards. */
export const StatRows: React.FC<{ readonly rows: ReadonlyArray<[string, string]>; readonly from: number }> = ({ rows, from }) => {
  const frame = useCurrentFrame();
  return (
    <div>
      {rows.map(([l, v], i) => {
        const t = ramp(frame, from + i * 6, from + i * 6 + 18);
        return (
          <div
            key={l}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "9px 0",
              borderTop: "1px solid rgba(255,255,255,0.08)",
              fontSize: 15,
              opacity: t,
              translate: `${(1 - t) * 10}px 0px`,
            }}
          >
            <span style={{ color: "#C9D6DB" }}>{l}</span>
            <span style={{ fontWeight: 700, fontSize: 18 }}>{v}</span>
          </div>
        );
      })}
    </div>
  );
};

/** Vertical bars with value labels (dashboard style). */
export const VBars: React.FC<{
  readonly data: ReadonlyArray<{ label: string; n: number }>;
  readonly from: number;
  readonly width: number;
  readonly height: number;
  readonly color: string;
}> = ({ data, from, width, height, color }) => {
  const frame = useCurrentFrame();
  const max = Math.max(...data.map((d) => d.n));
  const gap = 12;
  const bw = (width - gap * (data.length - 1)) / data.length;
  return (
    <svg width={width} height={height + 44} style={{ overflow: "visible" }}>
      {data.map((d, i) => {
        const t = ramp(frame, from + i * 5, from + i * 5 + 28);
        const h = (d.n / max) * height * t;
        const x = i * (bw + gap);
        return (
          <g key={d.label}>
            <rect x={x} y={height - h + 18} width={bw} height={h} fill={color} rx={2} />
            <text x={x + bw / 2} y={height - h + 12} fill="#E6EEF1" fontSize={13} fontWeight={700} fontFamily={FONT} textAnchor="middle" opacity={t}>
              {fmt(d.n)}
            </text>
            <text x={x + bw / 2} y={height + 38} fill={MUTED} fontSize={12} fontFamily={FONT} textAnchor="middle">
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

/** Horizontal bars (host organisations, programmes). */
export const HBars: React.FC<{
  readonly data: ReadonlyArray<{ label: string; n: number; color?: string }>;
  readonly from: number;
  readonly width: number;
  readonly color: string;
  readonly labelWidth?: number;
}> = ({ data, from, width, color, labelWidth = 150 }) => {
  const frame = useCurrentFrame();
  const max = Math.max(...data.map((d) => d.n));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
      {data.map((d, i) => {
        const t = ramp(frame, from + i * 5, from + i * 5 + 26);
        const w = ((width - labelWidth - 50) * d.n) / max;
        return (
          <div key={d.label} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}>
            <div style={{ width: labelWidth, textAlign: "right", color: "#C9D6DB", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{d.label}</div>
            <div style={{ width: w * t, height: 18, background: d.color ?? color, borderRadius: 2 }} />
            <div style={{ fontWeight: 700, opacity: t }}>{fmt(d.n)}</div>
          </div>
        );
      })}
    </div>
  );
};

/** KPI tile row (top of every dashboard page). */
export const KpiTile: React.FC<{
  readonly label: string;
  readonly value: string;
  readonly note: string;
  readonly accent: Accent;
  readonly from: number;
  readonly width?: number;
}> = ({ label, value, note, accent, from, width = 250 }) => {
  const frame = useCurrentFrame();
  const t = ramp(frame, from, from + 20);
  return (
    <div
      style={{
        width,
        padding: "10px 14px 14px",
        borderRadius: 12,
        background: CARD_BG,
        border: "1px solid rgba(255,255,255,0.08)",
        borderTop: `2px solid ${ACCENT[accent]}`,
        fontFamily: FONT,
        color: COLORS.white,
        opacity: t,
        translate: `0px ${(1 - t) * 14}px`,
        boxSizing: "border-box",
      }}
    >
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.2, color: "#C9D6DB", textTransform: "uppercase" }}>{label}</div>
      <div style={{ fontSize: 40, fontWeight: 800, textAlign: "center", marginTop: 6, letterSpacing: -1 }}>{value}</div>
      <div style={{ fontSize: 12, color: MUTED, textAlign: "center", marginTop: 2 }}>{note}</div>
    </div>
  );
};

/** The Talent Command Center home page, recreated as a living screen. */
export const CommandCenterHome: React.FC<{ readonly from: number; readonly highlight?: number; readonly highlightFrom?: number }> = ({
  from,
  highlight,
  highlightFrom = Infinity,
}) => {
  const frame = useCurrentFrame();
  const head = ramp(frame, from, from + 24);
  const hl = Number.isFinite(highlightFrom) ? ramp(frame, highlightFrom, highlightFrom + 14) : 0;
  return (
    <div
      style={{
        width: 1500,
        height: 860,
        borderRadius: 18,
        overflow: "hidden",
        position: "relative",
        background: "radial-gradient(ellipse 80% 70% at 75% 10%, #0f3a46 0%, #0a2430 45%, #071a23 100%)",
        border: "1px solid rgba(255,255,255,0.1)",
        boxShadow: "0 60px 140px rgba(0,0,0,0.7)",
        fontFamily: FONT,
        color: COLORS.white,
      }}
    >
      {/* header */}
      <div style={{ position: "absolute", left: 60, top: 34, display: "flex", alignItems: "center", gap: 26, opacity: head }}>
        <Img src={staticFile("brand/oq-rpi-logo-white.png")} style={{ height: 38 }} />
        <div style={{ width: 1, height: 34, background: "rgba(255,255,255,0.25)" }} />
        {COMMAND_CENTER.nav.map((n, i) => (
          <div key={n} style={{ display: "flex", alignItems: "center", gap: 26, fontSize: 17, color: "#E3ECEF" }}>
            {i > 0 ? <div style={{ width: 1, height: 18, background: "rgba(255,255,255,0.25)" }} /> : null}
            {n}
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", right: 150, top: 32, textAlign: "right", opacity: head }}>
        <div style={{ fontSize: 18, fontWeight: 700 }}>{COMMAND_CENTER.tagline[0]}</div>
        <div style={{ fontSize: 22, fontWeight: 700, fontStyle: "italic", color: COLORS.orange }}>{COMMAND_CENTER.tagline[1]}</div>
      </div>
      <svg width={140} height={90} style={{ position: "absolute", right: 0, top: 10, opacity: head }}>
        <polygon points="70,0 100,0 30,90 0,90" fill={COLORS.orange} />
        <polygon points="110,0 125,0 55,90 40,90" fill="#9FB4BD" />
        <polygon points="130,0 140,0 140,8 76,90 62,90" fill={COLORS.turquoise} />
      </svg>
      <div style={{ position: "absolute", left: 60, right: 60, top: 106, height: 1, background: "rgba(255,255,255,0.1)" }} />
      {/* welcome */}
      <div style={{ position: "absolute", left: 60, top: 136, opacity: head, translate: `0px ${(1 - head) * 14}px` }}>
        <div style={{ fontSize: 28, color: COLORS.lightBlue }}>Welcome to</div>
        <div style={{ fontSize: 50, fontWeight: 800, letterSpacing: -1 }}>{COMMAND_CENTER.title}</div>
        <div style={{ fontSize: 16, color: "#C9D6DB", marginTop: 6 }}>Select a project to explore the detailed dashboard, insights and data.</div>
      </div>
      {/* project grid */}
      <div style={{ position: "absolute", left: 60, top: 320, display: "grid", gridTemplateColumns: "repeat(3, 450px)", gap: 20 }}>
        {COMMAND_CENTER.projects.map((p, i) => {
          const t = ramp(frame, from + 18 + i * 5, from + 38 + i * 5, EASE.out);
          const active = highlight === i ? hl : 0;
          return (
            <div
              key={p.n}
              style={{
                height: 150,
                padding: "16px 18px",
                borderRadius: 12,
                background: CARD_BG,
                border: `1px solid ${active ? ACCENT[p.accent as Accent] : "rgba(255,255,255,0.08)"}`,
                borderTop: `3px solid ${ACCENT[p.accent as Accent]}`,
                boxShadow: active ? `0 0 40px ${ACCENT[p.accent as Accent]}88` : `0 -6px 26px -14px ${ACCENT[p.accent as Accent]}`,
                display: "flex",
                gap: 14,
                boxSizing: "border-box",
                opacity: t,
                translate: `0px ${(1 - t) * 24}px`,
                scale: String(1 + active * 0.03),
              }}
            >
              <div style={{ fontSize: 17, fontWeight: 700, color: MUTED, width: 24 }}>{p.n}</div>
              <IconTile icon={p.icon as IconName} accent={p.accent as Accent} size={52} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 21, fontWeight: 700, lineHeight: 1.15 }}>{p.title}</div>
                <div style={{ fontSize: 14, color: "#C9D6DB", marginTop: 6, lineHeight: 1.35 }}>{p.sub}</div>
              </div>
              <div style={{ alignSelf: "flex-end", color: COLORS.orange, fontSize: 24 }}>→</div>
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", left: 60, bottom: 26, display: "flex", alignItems: "center", gap: 12, fontSize: 14 }}>
        <div style={{ width: 22, height: 5, background: COLORS.orange, borderRadius: 2 }} />
        <b>OQ RPI</b>
        <span style={{ color: MUTED }}>|  Talent Management Projects</span>
      </div>
      <div style={{ position: "absolute", right: 60, bottom: 26, fontSize: 13, letterSpacing: 4, color: "#C9D6DB" }}>
        {COMMAND_CENTER.footer} ——
      </div>
    </div>
  );
};

/** Talent Assistant conversation: English then Arabic. */
export const AssistantChat: React.FC<{ readonly from: number; readonly width?: number }> = ({ from, width = 520 }) => {
  const frame = useCurrentFrame();
  const typed = (text: string, start: number, cps = 1.6) => text.slice(0, Math.max(0, Math.floor((frame - start) * cps)));
  const msgs: Array<{ who: "q" | "a"; text: string; at: number; ar?: boolean }> = [
    { who: "q", text: "How many leaders have completed MASAR?", at: from },
    { who: "a", text: "237 MASAR alumni across 11 cohorts since 2023 — 185 of our 306 leaders have been through the journey.", at: from + 34 },
    { who: "q", text: "كم عدد المكافآت الممنوحة في 2026؟", at: from + 120, ar: true },
    { who: "a", text: "تم منح 1,369 مكافأة من يناير إلى أغسطس 2026.", at: from + 150, ar: true },
  ];
  return (
    <DashCard title="Talent Assistant" sub="Ask any question on the talent data, in English or Arabic." icon="ai" accent="teal" width={width}>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {msgs.map((m, i) =>
          frame >= m.at ? (
            <div
              key={i}
              dir={m.ar ? "rtl" : "ltr"}
              style={{
                alignSelf: m.who === "q" ? "flex-end" : "flex-start",
                maxWidth: width * 0.82,
                padding: "10px 14px",
                borderRadius: 12,
                background: m.who === "q" ? "rgba(255,130,0,0.9)" : "rgba(255,255,255,0.08)",
                fontFamily: m.ar ? FONT_AR : FONT,
                fontSize: m.ar ? 19 : 16,
                lineHeight: 1.45,
                opacity: interpolate(frame, [m.at, m.at + 6], [0, 1], { extrapolateRight: "clamp" }),
              }}
            >
              {m.who === "a" && !m.ar ? typed(m.text, m.at + 4, 2.4) : m.ar && m.who === "a" ? typed(m.text, m.at + 4, 1.2) : m.text}
            </div>
          ) : null,
        )}
      </div>
    </DashCard>
  );
};
