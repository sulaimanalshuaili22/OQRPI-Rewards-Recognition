/**
 * Full-screen motion-graphic scenes, in the language of the 9-Box sequence:
 * Command Center cards on midnight blue, real data, every reveal cued to the
 * narrator. They sit above the 3D world and the plates, below chapters,
 * captions and the brand layer.
 *
 *  09 Nationalization      — Omani successors step into critical roles
 *  11 Rewards & Recognition — the OQ RPI awards, celebrated on stage
 *  12 Command Center        — one platform at the centre of seven programmes
 *  13 For every employee    — a path to grow, milestone by milestone
 *  14 Investing in people   — what the investment is creating
 */
import type React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { ACCENT, IconTile, type Accent } from "./Dash";
import type { IconName } from "../../components/Icons";
import { cue, linesOf, SCENES, type SceneId } from "../timeline";
import { EASE, ramp } from "../math";
import { COLORS, FONT } from "../../theme";
import { LEADERSHIP, NATIONALIZATION, PERFORMANCE, REWARDS, SECONDMENT, SUCCESSION, fmt } from "../data";

const S = (id: SceneId) => SCENES[id].start;
const end = (id: SceneId, pad = 0) => SCENES[id].end + pad;
const lineEnd = (id: SceneId, n: number) => linesOf(id)[n].end;
const MUTED = "#8FA6B0";
const CARD_BG = "linear-gradient(165deg, rgba(18,52,62,0.96) 0%, rgba(9,30,40,0.96) 55%, rgba(7,22,31,0.97) 100%)";
const NATIONALIZATION_PLANNED = NATIONALIZATION.plan.reduce((a, p) => a + p.n, 0);

/* ---------------------------------------------------------------- shared */

/** Fades a full-screen scene in and out over the frame window. */
const Window: React.FC<{ readonly from: number; readonly to: number; readonly children: React.ReactNode }> = ({ from, to, children }) => {
  const frame = useCurrentFrame();
  if (frame < from || frame > to) return null;
  const o = ramp(frame, from, from + 16, EASE.inOut) * (1 - ramp(frame, to - 16, to, EASE.inOut));
  return <AbsoluteFill style={{ opacity: o }}>{children}</AbsoluteFill>;
};

/** Midnight-blue stage with a soft key light and a faint engineering grid. */
const Stage: React.FC<{ readonly light?: string; readonly children?: React.ReactNode }> = ({ light = "50% 38%", children }) => (
  <AbsoluteFill style={{ background: `radial-gradient(ellipse 75% 70% at ${light}, #12384a 0%, #0a2433 40%, #061722 75%, #030d14 100%)` }}>
    <AbsoluteFill
      style={{
        backgroundImage:
          "linear-gradient(rgba(156,219,217,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(156,219,217,0.05) 1px, transparent 1px)",
        backgroundSize: "64px 64px",
        maskImage: "radial-gradient(ellipse 70% 60% at 50% 50%, black 30%, transparent 100%)",
      }}
    />
    {children}
  </AbsoluteFill>
);

/** Kicker + statement, top-left under the watermark. */
const Headline: React.FC<{ readonly kicker: string; readonly title: string; readonly from: number }> = ({ kicker, title, from }) => {
  const frame = useCurrentFrame();
  const a = ramp(frame, from, from + 20);
  const b = ramp(frame, from + 8, from + 32);
  return (
    <div style={{ position: "absolute", left: 96, top: 138, fontFamily: FONT }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, opacity: a }}>
        <div style={{ width: 44 * a, height: 3, background: COLORS.orange }} />
        <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: 5, color: COLORS.orange }}>{kicker}</div>
      </div>
      <div style={{ fontSize: 50, fontWeight: 300, color: COLORS.white, marginTop: 10, letterSpacing: -0.5, opacity: b, translate: `0px ${(1 - b) * 16}px` }}>{title}</div>
    </div>
  );
};

/** Neutral professional figure (head and shoulders). */
const Person: React.FC<{ readonly color: string; readonly size?: number; readonly glow?: number }> = ({ color, size = 64, glow = 0 }) => (
  <svg width={size} height={size * 1.1} viewBox="0 0 64 70" style={{ overflow: "visible", filter: glow ? `drop-shadow(0 0 ${12 * glow}px ${color})` : undefined }}>
    <circle cx="32" cy="18" r="13" fill={color} />
    <path d="M6 70 C6 46 18 36 32 36 C46 36 58 46 58 70 Z" fill={color} />
  </svg>
);

const Count: React.FC<{ readonly value: number; readonly from: number; readonly dur?: number }> = ({ value, from, dur = 36 }) => {
  const frame = useCurrentFrame();
  return <>{fmt(Math.round(value * ramp(frame, from, from + dur)))}</>;
};

/* ---------------------------------------------------- 09 Nationalization */

const ROLES: Array<{ readonly role: string; readonly tier: "Technical" | "Leadership"; readonly year: string }> = [
  { role: "Process Engineer", tier: "Technical", year: "2026" },
  { role: "Control Room Supervisor", tier: "Technical", year: "2027" },
  { role: "Reliability Engineer", tier: "Technical", year: "2027" },
  { role: "Section Head", tier: "Leadership", year: "2028" },
  { role: "Department Manager", tier: "Leadership", year: "2029" },
];

const Nationalization: React.FC = () => {
  const frame = useCurrentFrame();
  const from = S("nationalization") + 4;
  const to = end("nationalization", 12);
  const develops = cue("nationalization", 0, "develops and advances");
  const critical = cue("nationalization", 0, "critical roles");
  const leadership = cue("nationalization", 0, "leadership positions");
  const named = cue("nationalization", 0, "a named successor");
  // handover moments: technical roles on "critical roles", leadership roles on "leadership positions"
  const handover = [critical - 6, critical + 16, critical + 38, leadership, leadership + 24];
  const progress = interpolate(frame, [develops, named + 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE.inOut });
  const yearIdx = progress * (NATIONALIZATION.plan.length - 1);
  const cumulative = NATIONALIZATION.plan.reduce((acc, p, i) => acc + p.n * Math.max(0, Math.min(1, yearIdx - i + 1)), 0);
  const cardW = 296;
  const gap = 30;
  const x0 = (1920 - (ROLES.length * cardW + (ROLES.length - 1) * gap)) / 2;
  return (
    <Window from={from} to={to}>
      <Stage light="50% 55%">
        <Headline kicker="NATIONALIZATION" title="Omani talent, stepping into critical roles" from={from + 6} />
        {/* planned nationalizations, counting with the timeline */}
        <div style={{ position: "absolute", right: 96, top: 150, textAlign: "right", fontFamily: FONT, opacity: ramp(frame, develops - 10, develops + 14) }}>
          <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: 3, color: MUTED }}>ROLES PLANNED FOR OMANI TALENT</div>
          <div style={{ fontSize: 76, fontWeight: 800, color: COLORS.white, lineHeight: 1.05 }}>
            {Math.round(cumulative)}
            <span style={{ fontSize: 26, fontWeight: 400, color: COLORS.lightBlue }}> / {NATIONALIZATION_PLANNED} by 2030</span>
          </div>
        </div>
        {/* year rail */}
        <div style={{ position: "absolute", left: x0, width: ROLES.length * cardW + (ROLES.length - 1) * gap, top: 330, height: 40, fontFamily: FONT, opacity: ramp(frame, from + 14, from + 34) }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: 19, height: 2, background: "rgba(156,219,217,0.18)" }} />
          <div style={{ position: "absolute", left: 0, width: `${progress * 100}%`, top: 18, height: 4, borderRadius: 2, background: `linear-gradient(90deg, ${COLORS.turquoise}, ${COLORS.orange})`, boxShadow: `0 0 16px ${COLORS.orange}` }} />
          {NATIONALIZATION.plan.map((p, i) => {
            const x = (i / (NATIONALIZATION.plan.length - 1)) * 100;
            const lit = yearIdx >= i - 0.02;
            return (
              <div key={p.year} style={{ position: "absolute", left: `${x}%`, top: 0, translate: "-50% 0px", textAlign: "center", whiteSpace: "nowrap" }}>
                <div style={{ width: 14, height: 14, margin: "13px auto 0", borderRadius: 7, background: lit ? COLORS.orange : "#203a48", boxShadow: lit ? `0 0 14px ${COLORS.orange}` : undefined }} />
                <div style={{ fontSize: 20, fontWeight: 700, color: lit ? COLORS.white : MUTED, marginTop: 8 }}>{p.year}</div>
                <div style={{ fontSize: 14, color: MUTED }}>+{p.n} roles</div>
              </div>
            );
          })}
        </div>
        {/* tier brackets */}
        {(["Technical", "Leadership"] as const).map((tier) => {
          const idx = ROLES.map((r, i) => (r.tier === tier ? i : -1)).filter((i) => i >= 0);
          const left = x0 + idx[0] * (cardW + gap);
          const width = idx.length * cardW + (idx.length - 1) * gap;
          const o = ramp(frame, tier === "Technical" ? critical - 20 : leadership - 20, tier === "Technical" ? critical : leadership);
          return (
            <div key={tier} style={{ position: "absolute", left, width, top: 448, fontFamily: FONT, opacity: o }}>
              <div style={{ height: 10, borderLeft: `2px solid ${COLORS.turquoise}`, borderRight: `2px solid ${COLORS.turquoise}`, borderTop: `2px solid ${COLORS.turquoise}` }} />
              <div style={{ textAlign: "center", fontSize: 15, fontWeight: 700, letterSpacing: 4, color: COLORS.lightBlue, marginTop: 6 }}>
                {tier === "Technical" ? "CRITICAL TECHNICAL ROLES" : "LEADERSHIP POSITIONS"}
              </div>
            </div>
          );
        })}
        {/* role cards */}
        {ROLES.map((r, i) => {
          const appear = ramp(frame, from + 20 + i * 5, from + 44 + i * 5, EASE.out);
          const h = handover[i];
          const flow = ramp(frame, develops + i * 6, h);
          const k = ramp(frame, h, h + 22, EASE.inOut); // successor takes the seat
          const chip = ramp(frame, named + i * 6, named + 16 + i * 6);
          return (
            <div
              key={r.role}
              style={{
                position: "absolute",
                left: x0 + i * (cardW + gap),
                top: 510,
                width: cardW,
                height: 340,
                borderRadius: 16,
                background: CARD_BG,
                border: "1px solid rgba(255,255,255,0.08)",
                borderTop: `3px solid ${k > 0.5 ? COLORS.orange : COLORS.turquoise}`,
                boxShadow: k > 0 ? `0 -8px 40px -10px rgba(255,130,0,${0.7 * k}), 0 30px 70px rgba(0,0,0,0.5)` : "0 30px 70px rgba(0,0,0,0.5)",
                fontFamily: FONT,
                color: COLORS.white,
                opacity: appear,
                translate: `0px ${(1 - appear) * 30}px`,
                overflow: "hidden",
              }}
            >
              <div style={{ padding: "18px 20px 0" }}>
                <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 3, color: MUTED }}>{r.tier.toUpperCase()}</div>
                <div style={{ fontSize: 24, fontWeight: 700, marginTop: 4, lineHeight: 1.15 }}>{r.role}</div>
              </div>
              {/* the seat */}
              <div style={{ position: "absolute", left: 0, right: 0, top: 112, height: 130 }}>
                {/* knowledge transfer: particles from expert to successor */}
                {flow > 0 && k < 1
                  ? Array.from({ length: 6 }).map((_, p) => {
                      const u = (((frame - develops) / 26 + p / 6) % 1 + 1) % 1;
                      const x = interpolate(u, [0, 1], [104, 186]);
                      const y = 50 - Math.sin(u * Math.PI) * 34;
                      return <div key={p} style={{ position: "absolute", left: x, top: y, width: 7, height: 7, borderRadius: 4, background: COLORS.lightBlue, opacity: flow * (1 - k) * Math.sin(u * Math.PI), boxShadow: `0 0 10px ${COLORS.lightBlue}` }} />;
                    })
                  : null}
                {/* the expatriate expert: steps back to mentor */}
                <div style={{ position: "absolute", left: interpolate(k, [0, 1], [34, 10]), top: interpolate(k, [0, 1], [18, 40]), opacity: interpolate(k, [0, 1], [1, 0.55]), scale: String(interpolate(k, [0, 1], [1, 0.72])) }}>
                  <Person color="#9FB4BD" size={78} />
                </div>
                {/* the Omani successor: steps into the role */}
                <div style={{ position: "absolute", left: interpolate(k, [0, 1], [184, 108]), top: interpolate(k, [0, 1], [18, 4]), scale: String(interpolate(k, [0, 1], [1, 1.25])) }}>
                  <Person color={COLORS.orange} size={78} glow={k} />
                </div>
              </div>
              <div style={{ position: "absolute", left: 20, right: 20, top: 256, display: "flex", justifyContent: "space-between", fontSize: 15, color: MUTED }}>
                <span style={{ opacity: 1 - k }}>Expatriate expert</span>
                <span style={{ opacity: 1 - k, color: COLORS.orange }}>Omani successor</span>
              </div>
              <div style={{ position: "absolute", left: 14, right: 14, top: 244, textAlign: "center", fontSize: 16, opacity: k }}>
                <div style={{ color: COLORS.orange, fontWeight: 700 }}>Nationalized · {r.year}</div>
                <div style={{ color: MUTED, fontSize: 13, marginTop: 2 }}>Expert stays on as mentor</div>
              </div>
              <div style={{ position: "absolute", left: 20, bottom: 16, display: "flex", alignItems: "center", gap: 8, fontSize: 15, fontWeight: 600, color: COLORS.white, opacity: chip, translate: `0px ${(1 - chip) * 8}px` }}>
                <div style={{ width: 22, height: 22, borderRadius: 11, background: "#12B07A", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>✓</div>
                Named successor
              </div>
            </div>
          );
        })}
        {/* the transfer, named */}
        <div style={{ position: "absolute", left: 0, right: 0, top: 862, textAlign: "center", fontFamily: FONT, fontSize: 18, letterSpacing: 4, color: COLORS.lightBlue, opacity: ramp(frame, develops, develops + 20) * (1 - ramp(frame, named - 10, named + 10)) }}>
          KNOWLEDGE TRANSFER · CAPABILITY BUILDING · WORKFORCE LOCALIZATION
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 856, textAlign: "center", fontFamily: FONT, fontSize: 22, color: COLORS.white, opacity: ramp(frame, named, named + 20) }}>
          <b>{NATIONALIZATION.omaniSuccessorsNamed}</b> Omani successors already named · <b>{NATIONALIZATION.planned2026to2027}</b> roles planned for 2026–27
        </div>
      </Stage>
    </Window>
  );
};

/* ---------------------------------------------- 11 Rewards & Recognition */

type Award = { readonly title: string; readonly line: string; readonly accent: Accent; readonly kind: "medal" | "trophy" | "star" };

const Emblem: React.FC<{ readonly kind: Award["kind"]; readonly color: string; readonly size: number }> = ({ kind, color, size }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{ overflow: "visible", filter: `drop-shadow(0 0 18px ${color}88)` }}>
    <defs>
      <linearGradient id={`g-${kind}-${color.slice(1)}`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#ffffff" stopOpacity="0.85" />
        <stop offset="0.35" stopColor={color} />
        <stop offset="1" stopColor={color} stopOpacity="0.7" />
      </linearGradient>
    </defs>
    {kind === "trophy" ? (
      <g fill={`url(#g-${kind}-${color.slice(1)})`}>
        <path d="M28 10 H72 V36 C72 52 62 62 50 62 C38 62 28 52 28 36 Z" />
        <path d="M28 16 H14 C14 34 22 42 32 44 L31 38 C24 36 21 30 20 22 H28 Z" />
        <path d="M72 16 H86 C86 34 78 42 68 44 L69 38 C76 36 79 30 80 22 H72 Z" />
        <rect x="45" y="60" width="10" height="14" />
        <rect x="32" y="74" width="36" height="8" rx="2" />
        <rect x="26" y="84" width="48" height="10" rx="3" />
      </g>
    ) : kind === "medal" ? (
      <g>
        <path d="M30 4 L44 40 L36 44 L22 8 Z" fill={COLORS.orange} opacity="0.9" />
        <path d="M70 4 L56 40 L64 44 L78 8 Z" fill={COLORS.turquoise} opacity="0.9" />
        <circle cx="50" cy="64" r="28" fill={`url(#g-${kind}-${color.slice(1)})`} />
        <circle cx="50" cy="64" r="20" fill="none" stroke="#ffffff" strokeOpacity="0.55" strokeWidth="2" />
        <path d="M50 50 L54 60 L65 60 L56 67 L59 78 L50 71 L41 78 L44 67 L35 60 L46 60 Z" fill="#ffffff" fillOpacity="0.9" />
      </g>
    ) : (
      <g>
        <path d="M50 4 L62 36 L96 38 L70 60 L79 94 L50 75 L21 94 L30 60 L4 38 L38 36 Z" fill={`url(#g-${kind}-${color.slice(1)})`} />
      </g>
    )}
  </svg>
);

const Rewards: React.FC = () => {
  const frame = useCurrentFrame();
  const from = S("rewards") + 2;
  const to = end("rewards", 12);
  const testahal = REWARDS.programmes.find((p) => p.name === "Testahal")!;
  const aab = REWARDS.programmes.find((p) => p.name === "Above & Beyond")!;
  const hsse = REWARDS.programmes.find((p) => p.name === "HSSE Award")!;
  const awards: Array<Award & { readonly at: number; readonly x: number; readonly y: number; readonly hero?: boolean }> = [
    { title: "HSSE Award", line: `${hsse.rewarded} recognised for safety excellence`, accent: "purple", kind: "medal", at: cue("rewards", 0, "reinforces the behaviours"), x: 250, y: 560 },
    { title: "Above & Beyond", line: `${aab.rewarded} recognised in 2026`, accent: "orange", kind: "medal", at: cue("rewards", 0, "Above and Beyond"), x: 610, y: 500 },
    { title: "Grand Winner Award", line: "OQ RPI's highest annual honour", accent: "gold", kind: "trophy", at: cue("rewards", 0, "celebrates the people"), x: 960, y: 440, hero: true },
    { title: "Testahal", line: `${fmt(testahal.rewarded)} employees recognised`, accent: "green", kind: "medal", at: cue("rewards", 0, "Testahal"), x: 1310, y: 500 },
    { title: "Special Achievement", line: "Recognition for exceptional contribution", accent: "teal", kind: "star", at: cue("rewards", 0, "we value") + 6, x: 1670, y: 560 },
  ];
  const hero = awards[2].at;
  const burst = ramp(frame, hero, hero + 30, EASE.out);
  return (
    <Window from={from} to={to}>
      <Stage light="50% 30%">
        {/* spotlight cones */}
        <AbsoluteFill style={{ background: "conic-gradient(from 168deg at 50% -8%, transparent 0deg, rgba(255,214,140,0.10) 10deg, transparent 24deg)", opacity: 0.6 + 0.4 * burst }} />
        <AbsoluteFill style={{ background: `radial-gradient(ellipse 30% 40% at 50% 46%, rgba(247,197,72,${0.22 * burst}), transparent 70%)` }} />
        {/* rising gold dust */}
        {Array.from({ length: 46 }).map((_, i) => {
          const sx = (i * 397) % 1920;
          const speed = 0.6 + ((i * 53) % 10) / 10;
          const y = 1080 - (((frame - from) * speed * 2.2 + i * 211) % 1180);
          return <div key={i} style={{ position: "absolute", left: sx, top: y, width: 3 + (i % 3), height: 3 + (i % 3), borderRadius: 3, background: i % 4 ? "#F7C548" : COLORS.orange, opacity: 0.25 + 0.35 * ((i * 7) % 10) / 10 }} />;
        })}
        <Headline kicker="REWARDS & RECOGNITION" title="Celebrating the people behind our success" from={from + 4} />
        {/* pedestal line */}
        <div style={{ position: "absolute", left: 160, right: 160, top: 800, height: 2, background: "linear-gradient(90deg, transparent, rgba(247,197,72,0.5), transparent)", opacity: ramp(frame, from + 10, from + 40) }} />
        {awards.map((a) => {
          const t = ramp(frame, a.at - 4, a.at + 18, EASE.out);
          const set = ramp(frame, from + 10, from + 34, EASE.out);
          const color = ACCENT[a.accent];
          const size = a.hero ? 210 : 150;
          const w = a.hero ? 400 : 320;
          return (
            <div
              key={a.title}
              style={{
                position: "absolute",
                left: a.x - w / 2,
                top: a.y - (a.hero ? 60 : 30),
                width: w,
                textAlign: "center",
                fontFamily: FONT,
                opacity: set * (0.28 + 0.72 * t),
                filter: `grayscale(${1 - t}) brightness(${0.7 + 0.3 * t})`,
                translate: `0px ${(1 - t) * 14}px`,
                scale: String(0.94 + 0.06 * t + (a.hero ? 0.04 * burst : 0)),
              }}
            >
              {a.hero ? (
                <div style={{ position: "absolute", left: w / 2 - 170, top: -60, width: 340, height: 340, borderRadius: 170, background: `repeating-conic-gradient(from ${frame * 0.3}deg, rgba(247,197,72,0.16) 0deg 6deg, transparent 6deg 18deg)`, maskImage: "radial-gradient(circle, black 30%, transparent 70%)", opacity: burst }} />
              ) : null}
              <div style={{ position: "relative", display: "flex", justifyContent: "center" }}>
                <Emblem kind={a.kind} color={color} size={size} />
              </div>
              <div style={{ position: "relative", fontSize: a.hero ? 38 : 28, fontWeight: 800, color: COLORS.white, marginTop: 16 }}>{a.title}</div>
              <div style={{ position: "relative", fontSize: a.hero ? 21 : 18, color: a.hero ? "#F7C548" : COLORS.lightBlue, marginTop: 6, opacity: t }}>{a.line}</div>
              <div style={{ position: "relative", width: 60, height: 3, margin: "12px auto 0", background: color, borderRadius: 2 }} />
            </div>
          );
        })}
        {/* the year in recognition */}
        <div style={{ position: "absolute", left: 0, right: 0, top: 836, display: "flex", justifyContent: "center", gap: 46, fontFamily: FONT, color: COLORS.white, opacity: ramp(frame, hero + 20, hero + 44) }}>
          <div style={{ fontSize: 22 }}>
            <b style={{ fontSize: 30 }}>
              <Count value={REWARDS.granted} from={hero + 20} />
            </b>{" "}
            recognitions · {REWARDS.period}
          </div>
          <div style={{ fontSize: 22 }}>
            <b style={{ fontSize: 30 }}>OMR {fmt(REWARDS.usedOMR)}</b> awarded
          </div>
        </div>
      </Stage>
    </Window>
  );
};

/* -------------------------------------------- 12 Talent Command Center */

const MODULES: Array<{ readonly name: string; readonly say: string; readonly icon: IconName; readonly accent: Accent; readonly metric: string }> = [
  { name: "Performance Management", say: "Performance Management", icon: "performance", accent: "teal", metric: `${fmt(PERFORMANCE.rated2026)} rated · ${PERFORMANCE.highPotential} high potential` },
  { name: "Succession Planning", say: "Succession Planning", icon: "succession", accent: "teal", metric: `${SUCCESSION.peopleInPipeline} people in the pipeline` },
  { name: "Critical Roles", say: "Critical Roles", icon: "critical", accent: "red", metric: `${SUCCESSION.criticalRoles} critical roles tracked` },
  { name: "Leadership Development", say: "Leadership Development", icon: "leadership", accent: "purple", metric: `${LEADERSHIP.masar.alumni} MASAR · ${LEADERSHIP.robban.cohort} ROBBAN` },
  { name: "Nationalization", say: "Nationalization", icon: "nationalization", accent: "green", metric: `${NATIONALIZATION_PLANNED} roles planned to 2030` },
  { name: "Secondment", say: "Secondment", icon: "secondment", accent: "orange", metric: `${SECONDMENT.onRecord} secondments on record` },
  { name: "Rewards & Recognition", say: "Rewards and Recognition", icon: "rewards", accent: "gold", metric: `${fmt(REWARDS.granted)} recognitions in 2026` },
];

const CommandHub: React.FC = () => {
  const frame = useCurrentFrame();
  const from = S("platform") + 4;
  const to = lineEnd("platform", 0) + 18;
  const hubAt = cue("platform", 0, "Talent Command Center");
  const visibility = cue("platform", 0, "real-time visibility");
  const cx = 960;
  const cy = 548;
  const rx = 650;
  const ry = 268;
  const hub = ramp(frame, hubAt - 10, hubAt + 20, EASE.out);
  const all = ramp(frame, visibility, visibility + 20);
  return (
    <Window from={from} to={to}>
      <Stage light="50% 52%">
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
          {MODULES.map((m, i) => {
            const a = -Math.PI / 2 + (i / MODULES.length) * Math.PI * 2;
            const x = cx + Math.cos(a) * rx;
            const y = cy + Math.sin(a) * ry;
            const lit = ramp(frame, cue("platform", 0, m.say) - 4, cue("platform", 0, m.say) + 12);
            const color = ACCENT[m.accent];
            return (
              <g key={m.name}>
                <line x1={cx} y1={cy} x2={x} y2={y} stroke="rgba(156,219,217,0.16)" strokeWidth={2} />
                <line x1={cx} y1={cy} x2={x} y2={y} stroke={color} strokeWidth={3} strokeDasharray="10 14" strokeDashoffset={-frame * 2.2} opacity={lit} />
              </g>
            );
          })}
          <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke="rgba(156,219,217,0.10)" strokeWidth={2} strokeDasharray="4 10" />
        </svg>
        {/* hub */}
        <div style={{ position: "absolute", left: cx - 170, top: cy - 170, width: 340, height: 340, opacity: hub, scale: String(0.8 + 0.2 * hub) }}>
          <div style={{ position: "absolute", inset: 0, borderRadius: 170, border: `2px solid ${COLORS.turquoise}55`, rotate: `${frame * 0.4}deg`, borderTopColor: COLORS.orange }} />
          <div style={{ position: "absolute", inset: 26, borderRadius: 150, background: "radial-gradient(circle at 50% 35%, #15475a, #0a2633 70%)", boxShadow: `0 0 ${60 + 40 * all}px rgba(0,176,185,${0.35 + 0.3 * all})`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: FONT, textAlign: "center" }}>
            <Img src={staticFile("brand/oq-rpi-logo-white.png")} style={{ height: 50 }} />
            <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: 4, color: COLORS.lightBlue, marginTop: 14 }}>TALENT</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: COLORS.white, letterSpacing: 1 }}>COMMAND CENTER</div>
          </div>
        </div>
        {MODULES.map((m, i) => {
          const a = -Math.PI / 2 + (i / MODULES.length) * Math.PI * 2;
          const x = cx + Math.cos(a) * rx;
          const y = cy + Math.sin(a) * ry;
          const c = cue("platform", 0, m.say);
          const lit = ramp(frame, c - 4, c + 12);
          const appear = ramp(frame, from + 10 + i * 3, from + 30 + i * 3);
          const color = ACCENT[m.accent];
          return (
            <div
              key={m.name}
              style={{
                position: "absolute",
                left: x - 160,
                top: y - 52,
                width: 320,
                height: 104,
                boxSizing: "border-box",
                padding: "14px 16px",
                display: "flex",
                alignItems: "center",
                gap: 14,
                borderRadius: 14,
                background: CARD_BG,
                border: "1px solid rgba(255,255,255,0.08)",
                borderTop: `3px solid ${lit > 0.5 ? color : "rgba(255,255,255,0.12)"}`,
                boxShadow: `0 -8px 34px -12px ${color}${lit > 0.5 ? "CC" : "00"}, 0 24px 60px rgba(0,0,0,0.5)`,
                fontFamily: FONT,
                color: COLORS.white,
                opacity: appear * (0.5 + 0.5 * Math.max(lit, all)),
                scale: String(1 + 0.06 * lit * (1 - ramp(frame, c + 12, c + 30))),
              }}
            >
              <IconTile icon={m.icon} accent={m.accent} size={50} />
              <div>
                <div style={{ fontSize: 21, fontWeight: 700, lineHeight: 1.15 }}>{m.name}</div>
                <div style={{ fontSize: 15, color: COLORS.lightBlue, marginTop: 4, opacity: lit }}>{m.metric}</div>
              </div>
            </div>
          );
        })}
        <div style={{ position: "absolute", left: 0, right: 0, top: 864, textAlign: "center", fontFamily: FONT, fontSize: 22, letterSpacing: 6, color: COLORS.orange, fontWeight: 700, opacity: all }}>
          REAL-TIME VISIBILITY FOR EVERY LEADER
        </div>
      </Stage>
    </Window>
  );
};

/* ------------------------------------------------ 13 For every employee */

const P0: [number, number] = [150, 900];
const P1: [number, number] = [760, 900];
const P2: [number, number] = [1120, 330];
const P3: [number, number] = [1780, 300];
const bez = (t: number): [number, number] => {
  const u = 1 - t;
  return [0, 1].map((k) => u * u * u * P0[k] + 3 * u * u * t * P1[k] + 3 * u * t * t * P2[k] + t * t * t * P3[k]) as [number, number];
};

const Journey: React.FC = () => {
  const frame = useCurrentFrame();
  const start = cue("connections", 1, "For every employee");
  const from = start - 8;
  const to = end("connections", 12);
  const steps = [
    { t: 0.2, say: "clear expectations", title: "Clear expectations", line: "Goals and an annual performance conversation", metric: `${fmt(PERFORMANCE.rated2026)} employees rated in 2026`, icon: "performance" as IconName, accent: "teal" as Accent },
    { t: 0.52, say: "real development", title: "Real development", line: "IDPs, MASAR, ROBBAN and secondments", metric: `${LEADERSHIP.places2023to2026} leadership places since 2023`, icon: "learning" as IconName, accent: "purple" as Accent },
    { t: 0.84, say: "a visible path", title: "A visible path to grow", line: "Succession and career pathways", metric: `${SUCCESSION.peopleInPipeline} people in the succession pipeline`, icon: "succession" as IconName, accent: "orange" as Accent },
  ];
  const head = interpolate(frame, [start, cue("connections", 1, "a visible path") + 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE.inOut });
  const N = 80;
  const pts = Array.from({ length: N + 1 }, (_, i) => bez(i / N));
  const d = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const total = pts.reduce((acc, p, i) => (i ? acc + Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]) : 0), 0);
  const [hx, hy] = bez(head);
  return (
    <Window from={from} to={to}>
      <Stage light="60% 45%">
        <Headline kicker="FOR EVERY EMPLOYEE" title="A clear path to grow with OQ RPI" from={from + 6} />
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
          <defs>
            <linearGradient id="journey" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0" stopColor={COLORS.turquoise} />
              <stop offset="1" stopColor={COLORS.orange} />
            </linearGradient>
          </defs>
          <path d={d} fill="none" stroke="rgba(156,219,217,0.14)" strokeWidth={4} strokeDasharray="2 12" strokeLinecap="round" />
          <path d={d} fill="none" stroke="url(#journey)" strokeWidth={6} strokeLinecap="round" strokeDasharray={`${total * head} ${total}`} style={{ filter: "drop-shadow(0 0 12px rgba(255,130,0,0.6))" }} />
        </svg>
        {/* the employee, travelling the path */}
        <div style={{ position: "absolute", left: hx - 30, top: hy - 70, opacity: ramp(frame, start, start + 12) }}>
          <Person color={COLORS.white} size={54} glow={0.8} />
        </div>
        {steps.map((s, i) => {
          const [x, y] = bez(s.t);
          const c = cue("connections", 1, s.say);
          const t = ramp(frame, c - 4, c + 18, EASE.out);
          const below = y < 520;
          const color = ACCENT[s.accent];
          return (
            <div key={s.title}>
              <div style={{ position: "absolute", left: x - 16, top: y - 16, width: 32, height: 32, borderRadius: 16, background: t > 0.3 ? color : "#18323f", border: "3px solid #061722", boxShadow: t > 0.3 ? `0 0 26px ${color}` : undefined }} />
              <div
                style={{
                  position: "absolute",
                  left: Math.min(1920 - 96 - 420, Math.max(96, x - 210)),
                  top: below ? y + 40 : y - 230,
                  width: 420,
                  boxSizing: "border-box",
                  padding: "18px 20px",
                  borderRadius: 14,
                  background: CARD_BG,
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderTop: `3px solid ${color}`,
                  boxShadow: `0 -8px 34px -12px ${color}AA, 0 30px 70px rgba(0,0,0,0.5)`,
                  fontFamily: FONT,
                  color: COLORS.white,
                  opacity: t,
                  translate: `0px ${(1 - t) * (below ? -16 : 16)}px`,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <IconTile icon={s.icon} accent={s.accent} size={46} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 3, color: MUTED }}>0{i + 1}</div>
                    <div style={{ fontSize: 26, fontWeight: 700 }}>{s.title}</div>
                  </div>
                </div>
                <div style={{ fontSize: 17, color: "#C9D6DB", marginTop: 10 }}>{s.line}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color, marginTop: 6 }}>{s.metric}</div>
              </div>
            </div>
          );
        })}
      </Stage>
    </Window>
  );
};

/* ------------------------------------------- 14 Investing in our people */

const Investing: React.FC = () => {
  const frame = useCurrentFrame();
  const from = cue("future", 1, "By investing") - 6;
  const to = lineEnd("future", 1) + 16;
  const t = ramp(frame, from, to, (x) => x);
  const rows = [
    { say: "the leaders", word: "Leaders", proof: `${LEADERSHIP.masar.alumni} MASAR alumni · ${LEADERSHIP.robban.cohort} ROBBAN leaders in 2026`, color: COLORS.orange },
    { say: "capabilities", word: "Capabilities", proof: `${PERFORMANCE.highPotential} high-potential talents · ${PERFORMANCE.technicalTrack} on the technical track`, color: COLORS.turquoise },
    { say: "opportunities", word: "Opportunities", proof: `${SUCCESSION.peopleInPipeline} successors in the pipeline · ${NATIONALIZATION_PLANNED} roles for Omani talent`, color: COLORS.lightBlue },
  ];
  return (
    <Window from={from} to={to}>
      <AbsoluteFill style={{ background: COLORS.midnightDeep }}>
        {/* our people, full frame */}
        <Img
          src={staticFile("photos/employees.jpg")}
          style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover", objectPosition: "60% 30%", filter: "blur(1.2px) saturate(1.05)", scale: String(1.06 + 0.06 * t), translate: `${-20 * t}px 0px` }}
        />
        <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(4,15,23,0.94) 0%, rgba(4,15,23,0.86) 38%, rgba(4,15,23,0.35) 70%, rgba(4,15,23,0.25) 100%)" }} />
        <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(4,15,23,0.5) 0%, rgba(4,15,23,0) 30%, rgba(4,15,23,0) 70%, rgba(4,15,23,0.7) 100%)" }} />
        <Headline kicker="INVESTING IN OUR PEOPLE TODAY" title="Shaping tomorrow's OQ RPI" from={from + 4} />
        <div style={{ position: "absolute", left: 96, top: 330, display: "flex", flexDirection: "column", gap: 34, fontFamily: FONT }}>
          {rows.map((r) => {
            const c = cue("future", 1, r.say);
            const k = ramp(frame, c - 4, c + 18, EASE.out);
            return (
              <div key={r.word} style={{ display: "flex", gap: 22, alignItems: "stretch", opacity: k, translate: `${(1 - k) * -30}px 0px` }}>
                <div style={{ width: 5, borderRadius: 3, background: r.color, boxShadow: `0 0 18px ${r.color}` }} />
                <div>
                  <div style={{ fontSize: 58, fontWeight: 700, color: COLORS.white, letterSpacing: -1, lineHeight: 1.05 }}>{r.word}</div>
                  <div style={{ fontSize: 23, color: "#C9D6DB", marginTop: 6 }}>{r.proof}</div>
                </div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </Window>
  );
};

export const Showcase: React.FC = () => (
  <>
    <Nationalization />
    <Rewards />
    <CommandHub />
    <Journey />
    <Investing />
  </>
);

