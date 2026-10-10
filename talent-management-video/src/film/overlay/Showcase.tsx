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
import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { ACCENT, IconTile, Status, type Accent } from "./Dash";
import type { IconName } from "../../components/Icons";
import { cue, FPS, linesOf, SCENES, type SceneId } from "../timeline";
import { EASE, ramp } from "../math";
import { COLORS, FONT } from "../../theme";
import { CYCLE, RING, stageAngle } from "../ecosystem";
import { AS_OF, LEADERSHIP, NATIONALIZATION, PERFORMANCE, REWARDS, SECONDMENT, SUCCESSION, fmt } from "../data";

const S = (id: SceneId) => SCENES[id].start;
const end = (id: SceneId, pad = 0) => SCENES[id].end + pad;
const lineEnd = (id: SceneId, n: number) => linesOf(id)[n].end;
export const MUTED = "#8FA6B0";
export const CARD_BG = "linear-gradient(165deg, rgba(18,52,62,0.96) 0%, rgba(9,30,40,0.96) 55%, rgba(7,22,31,0.97) 100%)";
const NATIONALIZATION_PLANNED = NATIONALIZATION.plan.reduce((a, p) => a + p.n, 0);

/* ---------------------------------------------------------------- shared */

/** Fades a full-screen scene in and out over the frame window. */
export const Window: React.FC<{
  readonly from: number;
  readonly to: number;
  readonly children: React.ReactNode;
  /** "full": fade and depth move out; "fade": a plain fade, so the frame holds its geometry for a match cut */
  readonly exit?: "full" | "fade";
}> = ({ from, to, children, exit = "full" }) => {
  const frame = useCurrentFrame();
  if (frame < from || frame > to) return null;
  const o = ramp(frame, from, from + 16, EASE.inOut) * (1 - ramp(frame, to - 16, to, EASE.inOut));
  // the camera never sits still: a slow push-in with a few degrees of drift,
  // and a perspective snap in and out so the scene arrives from depth
  const t = (frame - from) / Math.max(1, to - from);
  const inD = 1 - ramp(frame, from, from + 26, EASE.out);
  const outD = exit === "full" ? ramp(frame, to - 22, to, EASE.inOut) : 0;
  return (
    <AbsoluteFill style={{ opacity: o, perspective: 2400, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          transformStyle: "preserve-3d",
          transform: `rotateX(${inD * 7 - outD * 5}deg) rotateY(${Math.sin(t * Math.PI) * 1.4 - 0.7}deg) scale(${1.02 + 0.045 * t + inD * 0.08 - outD * 0.06})`,
          filter: inD > 0.05 || outD > 0.05 ? `blur(${(inD * 6 + outD * 5).toFixed(1)}px)` : undefined,
        }}
      >
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Midnight-blue stage with a soft key light and a faint engineering grid. */
export const Stage: React.FC<{ readonly light?: string; readonly children?: React.ReactNode }> = ({ light = "50% 38%", children }) => (
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
export const Person: React.FC<{ readonly color: string; readonly size?: number; readonly glow?: number }> = ({ color, size = 64, glow = 0 }) => (
  <svg width={size} height={size * 1.1} viewBox="0 0 64 70" style={{ overflow: "visible", filter: glow ? `drop-shadow(0 0 ${12 * glow}px ${color})` : undefined }}>
    <circle cx="32" cy="18" r="13" fill={color} />
    <path d="M6 70 C6 46 18 36 32 36 C46 36 58 46 58 70 Z" fill={color} />
  </svg>
);

const Count: React.FC<{ readonly value: number; readonly from: number; readonly dur?: number }> = ({ value, from, dur = 36 }) => {
  const frame = useCurrentFrame();
  return <>{fmt(Math.round(value * ramp(frame, from, from + dur)))}</>;
};

/* ------------------------------------------ 02 RPI 2030 Transformation */

/** The RPI 2030 Transformation house, as published (levels 1–4). */
const HOUSE = {
  aspiration: "PROFITABLE AND SUSTAINABLE BUSINESS CAPITALIZING ON NATIONAL RESOURCES",
  objectives: ["Profitable business resilient to market environment", "Competitive and sustainable operation", "Customer's preferred choice"],
  priorities: [
    { title: "Business Excellence", items: ["Safety and Operational Excellence focus", "Maximized margin capture and commercial excellence", "Financial discipline", "Digitalization driving productivity"] },
    { title: "Flexibility & Profitability", items: ["Feed and yield flexibility, close to the market", "Broadened, differentiated value-add grades", "Strategic partnerships and innovation"] },
    { title: "Sustainability & Compliance", items: ["Compliance with regulations", "Decarbonization and energy efficiency", "Sustainable business model aligned with the market"] },
    { title: "People & Culture", items: ["Performance driven, customer centric culture", "Future-ready organization", "Strong collaboration and organizational agility"] },
  ],
  execution: "Transformation Plan 2.0 (2025–2027) · Transformation Plan 3.0 (2028–2030)",
} as const;

const Transformation: React.FC = () => {
  const frame = useCurrentFrame();
  const from = S("transformation") + 4;
  const to = end("transformation", 12);
  const direction = cue("transformation", 0, "clear direction");
  const core = cue("transformation", 0, "strengthening the core");
  const pillar = cue("transformation", 1, "People and Culture");
  const outcome = cue("transformation", 1, "a future-ready organization");
  const t = ramp(frame, from, to, (x) => x);
  const house = ramp(frame, from + 20, from + 50, EASE.out);
  const focus = ramp(frame, pillar - 6, pillar + 22, EASE.inOut);
  const lit = ramp(frame, outcome - 4, outcome + 16, EASE.out);
  const tag = ramp(frame, outcome + 14, outcome + 34, EASE.out);
  // the house: right of the headline, levels stacked
  const X = 600;
  const W = 1230;
  const level = (i: number) => ramp(frame, from + 24 + i * 8, from + 48 + i * 8, EASE.out);
  const cardW = (W - 24) / 2;
  const cardH = 196;
  return (
    <Window from={from} to={to}>
      <AbsoluteFill style={{ background: COLORS.midnightDeep, overflow: "hidden" }}>
        <Img src={staticFile("photos/plant-sunset-skyline.jpg")} style={{ position: "absolute", left: 0, top: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 60%", scale: String(1.04 + 0.05 * t), translate: `${-16 * t}px 0px` }} />
        <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(4,15,23,0.86) 0%, rgba(4,15,23,0.74) 55%, rgba(4,15,23,0.42) 100%)" }} />
        <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(4,15,23,0.55) 0%, rgba(4,15,23,0) 40%)" }} />
        <Headline kicker="RPI 2030 TRANSFORMATION" title="Strengthening the core, while embracing the future" from={direction - 10} />
        {/* level 1: aspiration */}
        <div style={{ position: "absolute", left: X, top: 240, width: W, opacity: house * level(0), translate: `0px ${(1 - level(0)) * 14}px`, fontFamily: FONT }}>
          <svg width={W} height={26} style={{ display: "block" }}>
            <polyline points={`${W * 0.08},26 ${W / 2},2 ${W * 0.92},26`} fill="none" stroke="rgba(156,219,217,0.55)" strokeWidth={2} />
          </svg>
          <div style={{ padding: "11px 20px", background: "linear-gradient(180deg, #13324A, #0B2231)", border: "1px solid rgba(255,255,255,0.14)", borderRadius: 6, textAlign: "center", fontSize: 15, fontWeight: 800, letterSpacing: 1.5, color: COLORS.white }}>{HOUSE.aspiration}</div>
        </div>
        {/* level 2: objectives */}
        <div style={{ position: "absolute", left: X, top: 336, width: W, display: "flex", gap: 12, opacity: level(1), translate: `0px ${(1 - level(1)) * 14}px` }}>
          {HOUSE.objectives.map((o) => (
            <div key={o} style={{ flex: 1, padding: "12px 14px", background: "linear-gradient(180deg, #13324A, #0B2231)", border: "1px solid rgba(255,255,255,0.14)", borderRadius: 6, fontFamily: FONT, fontSize: 15, fontWeight: 700, color: COLORS.white, textAlign: "center", textTransform: "uppercase", letterSpacing: 0.6 }}>{o}</div>
          ))}
        </div>
        {/* level 3: strategic priorities */}
        {HOUSE.priorities.map((p, i) => {
          const pc = p.title === "People & Culture";
          const col = i % 2;
          const row = Math.floor(i / 2);
          const k = level(2 + i * 0.5);
          const dim = pc ? 0 : focus * 0.72;
          return (
            <div
              key={p.title}
              style={{
                position: "absolute",
                left: X + col * (cardW + 24),
                top: 406 + row * (cardH + 16),
                width: cardW,
                height: cardH,
                boxSizing: "border-box",
                padding: "16px 20px",
                borderRadius: 10,
                background: pc ? `linear-gradient(165deg, rgba(20,58,72,${0.96}) 0%, rgba(9,30,40,0.97) 100%)` : "rgba(236,239,241,0.94)",
                border: pc ? `1px solid rgba(255,130,0,${0.35 + 0.55 * focus})` : "1px solid rgba(255,255,255,0.3)",
                borderTop: pc ? `3px solid ${COLORS.orange}` : "3px solid rgba(8,31,44,0.4)",
                boxShadow: pc ? `0 -8px 40px -10px rgba(255,130,0,${0.6 * focus}), 0 30px 70px rgba(0,0,0,${0.3 + 0.3 * focus})` : "0 20px 50px rgba(0,0,0,0.3)",
                fontFamily: FONT,
                color: pc ? COLORS.white : "#13324A",
                opacity: k * (1 - dim),
                scale: String(0.96 + 0.04 * k + (pc ? 0.05 * focus : 0)),
                translate: `0px ${(1 - k) * 14 - (pc ? 8 * focus : 0)}px`,
                zIndex: pc ? 2 : 1,
              }}
            >
              <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: 0.4, textTransform: "uppercase", color: pc ? COLORS.white : "#081F2C" }}>{p.title}</div>
              <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
                {p.items.map((it) => {
                  const hot = pc && it === "Future-ready organization";
                  return (
                    <div key={it} style={{ position: "relative", display: "flex", alignItems: "center", gap: 10, fontSize: hot ? 19 + 3 * lit : 16, fontWeight: hot ? 800 : 500, color: hot ? (lit > 0.5 ? COLORS.orange : COLORS.white) : pc ? "#DCE6EA" : "#2B4656", lineHeight: 1.35, textShadow: hot ? `0 0 ${18 * lit}px rgba(255,130,0,0.8)` : undefined }}>
                      <span style={{ width: hot ? 10 : 6, height: hot ? 10 : 6, borderRadius: 5, background: hot ? COLORS.orange : pc ? COLORS.lightBlue : "#52626B", flexShrink: 0, boxShadow: hot ? `0 0 ${12 * lit}px ${COLORS.orange}` : undefined }} />
                      {it}
                    </div>
                  );
                })}
              </div>
              {pc ? (
                <div style={{ position: "absolute", right: 18, bottom: 14, display: "flex", alignItems: "center", gap: 10, padding: "7px 14px", borderRadius: 999, background: "rgba(255,130,0,0.14)", border: `1px solid ${COLORS.orange}`, fontSize: 14, fontWeight: 700, letterSpacing: 1.2, color: "#FFD9B0", opacity: tag, translate: `0px ${(1 - tag) * 8}px` }}>
                  <IconTile icon="people" accent="orange" size={24} />
                  DELIVERED BY TALENT MANAGEMENT
                </div>
              ) : null}
            </div>
          );
        })}
        {/* level 4: execution */}
        <div style={{ position: "absolute", left: X, top: 406 + 2 * (cardH + 16) + 2, width: W, padding: "12px 0", textAlign: "center", border: "1px solid rgba(156,219,217,0.35)", borderRadius: 6, fontFamily: FONT, fontSize: 17, fontWeight: 700, color: COLORS.white, background: "rgba(8,31,44,0.6)", opacity: level(4) * (1 - 0.5 * focus) }}>
          {HOUSE.execution}
        </div>
        <div style={{ position: "absolute", left: 96, top: 870, fontFamily: FONT, fontSize: 15, color: MUTED, opacity: ramp(frame, core, core + 20) }}>Source: RPI 2030 Transformation · Strategic priorities, level 3</div>
      </AbsoluteFill>
    </Window>
  );
};

/* ---------------------------------------------------- 09 Nationalization */

// Roles in the order OQ RPI specified (Oct 2026 revision). The years run with
// the position on the timeline rail, as before; they are illustrative.
const ROLES: Array<{ readonly role: string; readonly tier: "Technical" | "Leadership"; readonly year: string }> = [
  { role: "Process Engineer", tier: "Technical", year: "2026" },
  { role: "Area Engineer", tier: "Technical", year: "2027" },
  { role: "Reliability Engineer", tier: "Technical", year: "2027" },
  { role: "Sr Panel Operator", tier: "Technical", year: "2028" },
  { role: "Department Head", tier: "Leadership", year: "2029" },
];

const Nationalization: React.FC = () => {
  const frame = useCurrentFrame();
  const from = S("nationalization") + 2.4 * FPS - 10; // after the on-site plate
  const to = end("nationalization", 12);
  const develops = cue("nationalization", 0, "develops and advances");
  const critical = cue("nationalization", 0, "critical roles");
  const leadership = cue("nationalization", 0, "leadership positions");
  const named = cue("nationalization", 0, "a named successor");
  // handover moments: technical roles on "critical roles", leadership roles on "leadership positions"
  const handover = [critical - 6, critical + 12, critical + 30, critical + 48, leadership + 30];
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
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 6 }}>
            <Status kind="plan" note="2026–2030" />
          </div>
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
                <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: 3, color: MUTED }}>{r.tier.toUpperCase()}</div>
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
                <div style={{ color: MUTED, fontSize: 14, marginTop: 2 }}>Expert stays on as mentor</div>
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
          <span style={{ display: "inline-flex", alignItems: "center", gap: 26 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
              <Status kind="inplace" /> <b>{NATIONALIZATION.omaniSuccessorsNamed}</b> Omani successors named
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
              <Status kind="plan" /> <b>{NATIONALIZATION.planned2026to2027}</b> roles planned for 2026–27
            </span>
          </span>
          <div style={{ fontSize: 14, color: MUTED, marginTop: 6 }}>Source: OQ RPI Nationalization Tracker · as of {AS_OF}</div>
        </div>
      </Stage>
    </Window>
  );
};

/* ---------------------------------------------- 11 Rewards & Recognition */

type Award = { readonly title: string; readonly line: string; readonly accent: Accent; readonly kind: "medal" | "shield" | "star" | "cup" };

/** The OQ Excellence Award cup, cut out from its photograph (true alpha, natural edges). */
const CUP_RATIO = 408 / 295;

/** The OQ RPI presentation plaque, redrawn as a shield: navy velvet, cream panel, gold plate. */
const Shield: React.FC<{ readonly size: number }> = ({ size }) => (
  <svg width={size} height={size * 1.12} viewBox="0 0 100 112" style={{ overflow: "visible", filter: "drop-shadow(0 0 22px rgba(247,197,72,0.55))" }}>
    <defs>
      <linearGradient id="shield-gold" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#FFF1B8" />
        <stop offset="0.45" stopColor="#F7C548" />
        <stop offset="1" stopColor="#B8860B" />
      </linearGradient>
      <linearGradient id="shield-navy" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#13324A" />
        <stop offset="1" stopColor="#081F2C" />
      </linearGradient>
    </defs>
    <path d="M50 2 L94 14 V54 C94 80 74 100 50 110 C26 100 6 80 6 54 V14 Z" fill="url(#shield-gold)" />
    <path d="M50 7 L89 18 V54 C89 77 71 95 50 104 C29 95 11 77 11 54 V18 Z" fill="url(#shield-navy)" />
    <path d="M50 14 L82 23 V54 C82 73 67 88 50 96 C33 88 18 73 18 54 V23 Z" fill="#EDE4D3" />
    <rect x="30" y="34" width="40" height="30" rx="3" fill="url(#shield-gold)" />
    <text x="50" y="47" textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight="800" fontSize="9.5" fill="#081F2C" letterSpacing="0.3">OQ RPI</text>
    <text x="50" y="58" textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight="700" fontSize="5.2" fill="#081F2C" letterSpacing="1.2">GRAND WINNER</text>
    <rect x="34" y="70" width="32" height="6" rx="1.5" fill="url(#shield-gold)" />
    <text x="50" y="86" textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight="800" fontSize="7" fill="#081F2C">OQ<tspan fill="#FF8200">RPI</tspan></text>
  </svg>
);

const Emblem: React.FC<{ readonly kind: Award["kind"]; readonly color: string; readonly size: number }> = ({ kind, color, size }) => {
  if (kind === "shield") return <Shield size={size} />;
  if (kind === "cup") {
    return <Img src={staticFile("photos/excellence-award-cup.png")} style={{ width: size, height: size * CUP_RATIO, filter: "drop-shadow(0 0 26px rgba(247,197,72,0.45)) drop-shadow(0 18px 24px rgba(0,0,0,0.45))" }} />;
  }
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ overflow: "visible", filter: `drop-shadow(0 0 18px ${color}88)` }}>
      <defs>
        <linearGradient id={`g-${kind}-${color.slice(1)}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.85" />
          <stop offset="0.35" stopColor={color} />
          <stop offset="1" stopColor={color} stopOpacity="0.7" />
        </linearGradient>
      </defs>
      {kind === "medal" ? (
        <g>
          <path d="M30 4 L44 40 L36 44 L22 8 Z" fill={COLORS.orange} opacity="0.9" />
          <path d="M70 4 L56 40 L64 44 L78 8 Z" fill={COLORS.turquoise} opacity="0.9" />
          <circle cx="50" cy="64" r="28" fill={`url(#g-${kind}-${color.slice(1)})`} />
          <circle cx="50" cy="64" r="20" fill="none" stroke="#ffffff" strokeOpacity="0.55" strokeWidth="2" />
          <path d="M50 50 L54 60 L65 60 L56 67 L59 78 L50 71 L41 78 L44 67 L35 60 L46 60 Z" fill="#ffffff" fillOpacity="0.9" />
        </g>
      ) : (
        <path d="M50 4 L62 36 L96 38 L70 60 L79 94 L50 75 L21 94 L30 60 L4 38 L38 36 Z" fill={`url(#g-${kind}-${color.slice(1)})`} />
      )}
    </svg>
  );
};

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
    { title: "Grand Winner Award", line: `${REWARDS.grandWinner.total} certificates · OQ RPI's highest honour`, accent: "gold", kind: "shield", at: cue("rewards", 0, "celebrates the people"), x: 960, y: 420, hero: true },
    { title: "Testahal", line: `${fmt(testahal.rewarded)} employees recognised`, accent: "green", kind: "medal", at: cue("rewards", 0, "Testahal"), x: 1310, y: 500 },
    { title: "OQ Excellence Award", line: "Recognises projects across all OQ assets", accent: "gold", kind: "cup", at: cue("rewards", 0, "we value") - 4, x: 1612, y: 540 },
  ];
  const hero = awards[2].at;
  const burst = ramp(frame, hero, hero + 30, EASE.out);
  // OQ Excellence: from its entrance (about 3:02) the cup rises slowly onto a
  // tier of its own above the OQ RPI awards: the OQ-wide, project award
  const exAt = awards[4].at;
  const rise = interpolate(frame, [exAt + 4, exAt + 120], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.45, 0, 0.15, 1) });
  const RISE = 300;
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
        <div style={{ position: "absolute", left: 160, right: 160, top: 760, height: 2, background: "linear-gradient(90deg, transparent, rgba(247,197,72,0.5), transparent)", opacity: ramp(frame, from + 10, from + 40) }} />
        {awards.map((a) => {
          const t = ramp(frame, a.at - 4, a.at + 18, EASE.out);
          const set = ramp(frame, from + 10, from + 34, EASE.out);
          const color = ACCENT[a.accent];
          const cup = a.kind === "cup";
          const size = a.hero ? 210 : cup ? 120 + 46 * rise : 150;
          const w = a.hero ? 400 : cup ? 420 : 320;
          return (
            <div
              key={a.title}
              style={{
                position: "absolute",
                left: a.x - w / 2,
                top: a.y - (a.hero ? 60 : 30) - (cup ? RISE * rise + (CUP_RATIO * size - 150) : 0),
                width: w,
                textAlign: "center",
                fontFamily: FONT,
                opacity: set * (0.28 + 0.72 * t),
                filter: `grayscale(${1 - t}) brightness(${0.7 + 0.3 * t})`,
                translate: `0px ${(1 - t) * 14}px`,
                scale: String(0.94 + 0.06 * t + (a.hero ? 0.04 * burst : 0)),
              }}
            >
              {cup ? (
                // a shaft of light from above that the cup rises into
                <div style={{ position: "absolute", left: w / 2 - 90, top: -260, width: 180, height: 260 + CUP_RATIO * size, background: "linear-gradient(180deg, rgba(255,226,160,0) 0%, rgba(255,214,140,0.16) 55%, rgba(255,214,140,0.05) 100%)", filter: "blur(10px)", opacity: rise }} />
              ) : null}
              {a.hero ? (
                <div style={{ position: "absolute", left: w / 2 - 170, top: -60, width: 340, height: 340, borderRadius: 170, background: `repeating-conic-gradient(from ${frame * 0.3}deg, rgba(247,197,72,0.16) 0deg 6deg, transparent 6deg 18deg)`, maskImage: "radial-gradient(circle, black 30%, transparent 70%)", opacity: burst }} />
              ) : null}
              <div style={{ position: "relative", display: "flex", justifyContent: "center" }}>
                <Emblem kind={a.kind} color={color} size={size} />
              </div>
              <div style={{ position: "relative", fontSize: a.hero ? 38 : cup ? 28 + 4 * rise : 28, fontWeight: 800, color: COLORS.white, marginTop: 16, whiteSpace: "nowrap" }}>{a.title}</div>
              <div style={{ position: "relative", fontSize: a.hero ? 21 : 18, color: a.hero || cup ? "#F7C548" : COLORS.lightBlue, marginTop: 6, opacity: t, whiteSpace: cup ? "nowrap" : undefined }}>{a.line}</div>
              <div style={{ position: "relative", width: 60, height: 3, margin: "12px auto 0", background: color, borderRadius: 2 }} />
              {cup ? (
                <div style={{ position: "relative", marginTop: 14, fontSize: 15, fontWeight: 700, letterSpacing: 4, color: "#F7C548", opacity: ramp(rise, 0.6, 1) }}>OQ-WIDE AWARD</div>
              ) : null}
            </div>
          );
        })}
        {/* Grand Winner tiers */}
        <div style={{ position: "absolute", left: 960 - 260, top: 772, width: 520, display: "flex", justifyContent: "center", gap: 18, fontFamily: FONT, opacity: ramp(frame, hero + 16, hero + 36) }}>
          {REWARDS.grandWinner.tiers.map((t, i) => (
            <div key={t.tier} style={{ textAlign: "center", opacity: ramp(frame, hero + 16 + i * 5, hero + 30 + i * 5), translate: `0px ${(1 - ramp(frame, hero + 16 + i * 5, hero + 30 + i * 5)) * 10}px` }}>
              <div style={{ width: 14, height: 14, margin: "0 auto 6px", rotate: "45deg", background: t.color, boxShadow: `0 0 12px ${t.color}` }} />
              <div style={{ fontSize: 24, fontWeight: 800, color: COLORS.white, lineHeight: 1 }}>{t.n}</div>
              <div style={{ fontSize: 14, letterSpacing: 2, color: MUTED, marginTop: 3 }}>{t.tier.toUpperCase()}</div>
            </div>
          ))}
        </div>
        {/* the year in recognition */}
        <div style={{ position: "absolute", left: 0, right: 0, top: 868, display: "flex", justifyContent: "center", gap: 46, fontFamily: FONT, color: COLORS.white, opacity: ramp(frame, hero + 20, hero + 44) }}>
          <div style={{ fontSize: 22 }}>
            <b style={{ fontSize: 30 }}>
              <Count value={REWARDS.granted} from={hero + 20} />
            </b>{" "}
            recognitions · {REWARDS.period} <Status kind="delivered" />
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
  const from = S("platform") + 2.2 * FPS - 10; // after the on-site plate
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
          <div style={{ fontSize: 15, letterSpacing: 1, fontWeight: 500, color: MUTED, marginTop: 6 }}>Figures from the Talent Command Center · as of {AS_OF}</div>
        </div>
      </Stage>
    </Window>
  );
};

/* ------------------------------------------------ 13 For every employee */

/** Where the ecosystem cycle lands when it shrinks into the employee scene. */
export const MINI = { x: 252, y: 846, s: 0.22 };
const P0: [number, number] = [MINI.x + RING.rx * MINI.s + 12, MINI.y];
const P1: [number, number] = [880, 880];
const P2: [number, number] = [1120, 330];
const P3: [number, number] = [1780, 300];
const bez = (t: number): [number, number] => {
  const u = 1 - t;
  return [0, 1].map((k) => u * u * u * P0[k] + 3 * u * u * t * P1[k] + 3 * u * t * t * P2[k] + t * t * t * P3[k]) as [number, number];
};

/** The ecosystem ring in miniature, its stages lighting as the path reaches them. */
const MiniRing: React.FC<{ readonly lit: (i: number) => number; readonly o: number }> = ({ lit, o }) => {
  const rx = RING.rx * MINI.s;
  const ry = RING.ry * MINI.s;
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 1080, opacity: o }}>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <ellipse cx={MINI.x} cy={MINI.y} rx={rx} ry={ry} fill="none" stroke="rgba(156,219,217,0.45)" strokeWidth={2} />
        {CYCLE.map((c, i) => {
          const a = stageAngle(i);
          const L = lit(i);
          return <circle key={c.id} cx={MINI.x + Math.cos(a) * rx} cy={MINI.y + Math.sin(a) * ry} r={7 + 3 * L} fill={L > 0.5 ? COLORS.orange : "#2E5566"} stroke="#061722" strokeWidth={2} style={{ filter: L > 0.5 ? "drop-shadow(0 0 8px rgba(255,130,0,0.9))" : undefined }} />;
        })}
      </svg>
      <div style={{ position: "absolute", left: MINI.x - 120, width: 240, top: MINI.y + ry + 14, textAlign: "center", fontFamily: FONT, fontSize: 15, fontWeight: 700, letterSpacing: 3, color: COLORS.lightBlue }}>THE ECOSYSTEM</div>
    </div>
  );
};

const Journey: React.FC = () => {
  const frame = useCurrentFrame();
  const start = cue("connections", 1, "For every employee");
  const from = start - 8;
  const to = end("connections", 12);
  const steps = [
    { t: 0.2, stage: 1, say: "clear expectations", title: "Clear expectations", line: "Goals and an annual performance conversation", metric: `${fmt(PERFORMANCE.rated2026)} employees rated in 2026`, icon: "performance" as IconName, accent: "teal" as Accent },
    { t: 0.52, stage: 2, say: "real development", title: "Real development", line: "IDPs, MASAR, ROBBAN and secondments", metric: `${LEADERSHIP.places2023to2026} leadership places since 2023`, icon: "learning" as IconName, accent: "purple" as Accent },
    { t: 0.84, stage: 3, say: "a visible path", title: "A visible path to grow", line: "Succession and career pathways", metric: `${SUCCESSION.peopleInPipeline} people in the succession pipeline`, icon: "succession" as IconName, accent: "orange" as Accent },
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
        <Headline kicker="THE SAME ECOSYSTEM, FOR EVERY EMPLOYEE" title="A clear path to grow with OQ RPI" from={from + 6} />
        <MiniRing o={1} lit={(i) => Math.max(...steps.map((s) => (s.stage === i ? ramp(frame, cue("connections", 1, s.say) - 4, cue("connections", 1, s.say) + 10) : 0)))} />
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
                    <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: 3, color: MUTED }}>0{i + 1}</div>
                    <div style={{ fontSize: 26, fontWeight: 700 }}>{s.title}</div>
                  </div>
                </div>
                <div style={{ display: "inline-block", marginTop: 10, padding: "3px 10px", borderRadius: 999, border: `1px solid ${COLORS.orange}88`, fontSize: 14, fontWeight: 700, letterSpacing: 1.5, color: "#FFD9B0" }}>
                  FROM STAGE {CYCLE[s.stage].n} · {CYCLE[s.stage].short.toUpperCase()}
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

/**
 * The closing plate (IMG_2798-3: an OQ RPI engineer in front of the plant) with
 * only the three themes. The photograph is layered twice: the full frame
 * behind the titles and a copy with its sky cut away in front of them, so each
 * title rises from behind the refinery's skyline into the sky and is hidden by
 * the real structures until it clears them. Plate, titles and foreground share
 * one container, so they move as one.
 */
const PLATE = { w: 1920, h: Math.round((1920 * 1334) / 2000), top: 0 };
const THEMES_CLOSE: ReadonlyArray<{ readonly say: string; readonly word: string; readonly color: string; readonly slot: number }> = [
  { say: "protecting critical capability", word: "Continuity", color: COLORS.turquoise, slot: 96 },
  { say: "next generation of leaders", word: "Leadership", color: COLORS.orange, slot: 172 },
  { say: "advancing Omani talent", word: "National Talent", color: COLORS.lightBlue, slot: 248 },
];
/** The 2030 goal the three themes serve: a second column in the clear sky right of them. */
const GOAL = { say: "the future-ready organization", x: 640, slot: 146 };
/** below the skyline: the titles start hidden behind the plant */
const BEHIND = 560;

const Investing: React.FC = () => {
  const frame = useCurrentFrame();
  const from = cue("future", 1, "By investing") - 6;
  const to = lineEnd("future", 1) + 16;
  const t = ramp(frame, from, to, (x) => x);
  return (
    <Window from={from} to={to}>
      <AbsoluteFill style={{ background: COLORS.midnightDeep, overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 0, top: PLATE.top, width: PLATE.w, height: PLATE.h, transformOrigin: "30% 20%", scale: String(1 + 0.035 * t) }}>
          <Img src={staticFile("photos/IMG_2798-3.jpg")} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
          {/* deepen the sky behind the titles; the plant and the engineer sit above this */}
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 48% 42% at 18% 12%, rgba(8,31,44,0.62) 0%, rgba(8,31,44,0.3) 55%, rgba(8,31,44,0) 100%)", opacity: ramp(frame, from, from + 40) }} />
          {THEMES_CLOSE.map((th) => {
            const c = cue("future", 1, th.say);
            const k = interpolate(frame, [c - 8, c + 34], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.2, 0.7, 0.2, 1) });
            const y = interpolate(k, [0, 1], [BEHIND, th.slot]);
            if (k <= 0) return null;
            return (
              <div key={th.word} style={{ position: "absolute", left: 140, top: y, display: "flex", alignItems: "center", gap: 18, fontFamily: FONT, whiteSpace: "nowrap", opacity: ramp(k, 0, 0.25) }}>
                <div style={{ width: 6, height: 50, borderRadius: 3, background: th.color, boxShadow: `0 0 16px ${th.color}` }} />
                <div style={{ fontSize: 56, fontWeight: 700, letterSpacing: -0.5, color: COLORS.white, lineHeight: 1.1, textShadow: "0 2px 22px rgba(4,20,34,0.7), 0 1px 3px rgba(4,20,34,0.6)" }}>{th.word}</div>
              </div>
            );
          })}
          {/* the goal: rises through the engineer into the clear sky right of the themes */}
          {(() => {
            const c = cue("future", 1, GOAL.say);
            const k = interpolate(frame, [c - 8, c + 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.2, 0.7, 0.2, 1) });
            if (k <= 0) return null;
            const y = interpolate(k, [0, 1], [BEHIND + 40, GOAL.slot]);
            const arrow = ramp(k, 0.8, 1);
            return (
              <>
                <svg width={120} height={40} style={{ position: "absolute", left: GOAL.x - 120, top: 183, overflow: "visible", opacity: arrow }}>
                  <path d={`M ${8} 20 L ${8 + 92 * arrow} 20`} stroke={COLORS.orange} strokeWidth={3} strokeLinecap="round" />
                  <path d="M 100 12 L 110 20 L 100 28" fill="none" stroke={COLORS.orange} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" opacity={arrow} />
                </svg>
                <div style={{ position: "absolute", left: GOAL.x, top: y, display: "flex", alignItems: "center", gap: 18, fontFamily: FONT, whiteSpace: "nowrap", opacity: ramp(k, 0, 0.25) }}>
                  <div style={{ width: 6, height: 116, borderRadius: 3, background: COLORS.orange, boxShadow: `0 0 16px ${COLORS.orange}` }} />
                  <div>
                    <div style={{ fontSize: 42, fontWeight: 700, letterSpacing: -0.5, color: COLORS.orange, lineHeight: 1.05, textShadow: "0 2px 22px rgba(4,20,34,0.7), 0 1px 3px rgba(4,20,34,0.6)" }}>Future-ready</div>
                    <div style={{ fontSize: 42, fontWeight: 700, letterSpacing: -0.5, color: COLORS.orange, lineHeight: 1.05, textShadow: "0 2px 22px rgba(4,20,34,0.7), 0 1px 3px rgba(4,20,34,0.6)" }}>organization</div>
                    <div style={{ marginTop: 8, fontSize: 14, fontWeight: 800, letterSpacing: 2.5, color: "#FFD9B0", textShadow: "0 1px 6px rgba(4,20,34,0.8)" }}>RPI 2030 TRANSFORMATION</div>
                  </div>
                </div>
              </>
            );
          })()}
          {/* the plant and the engineer, in front of the titles */}
          <Img src={staticFile("photos/IMG_2798-3-foreground.png")} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
        </div>
        {/* a quiet lower edge for the subtitles */}
        <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(4,15,23,0) 70%, rgba(4,15,23,0.55) 100%)" }} />
      </AbsoluteFill>
    </Window>
  );
};

export const Showcase: React.FC = () => (
  <>
    <Transformation />
    <Nationalization />
    <Rewards />
    <CommandHub />
    <Journey />
    <Investing />
  </>
);

