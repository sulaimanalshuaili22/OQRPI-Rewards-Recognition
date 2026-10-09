/**
 * OQ RPI Talent Management, v5: "The Handover".
 *
 * Four acts, about three minutes:
 *   I   The stakes      309 roles that can never be empty; 309 lights on the real plant
 *   II  The system      Know · Grow · Secure · Sustain (the programmes as tools, not chapters)
 *   III The proof       the capability being built, and the work ahead
 *   IV  The handover    the room goes quiet; "It is built by people."
 *
 * Real photography and footage are the primary world; graphics are overlays.
 * The picture is cut to the narration in timeline.json (tools/voiceover.py).
 */
import type React from "react";
import { AbsoluteFill, Audio, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { EASE, ramp, window01 } from "../film/math";
import { COLORS, FONT, FONT_AR } from "../theme";
import "../theme";
import { LEADERSHIP, NATIONALIZATION, PERFORMANCE, REWARDS, SUCCESSION } from "../film/data";
import { cue, LOGO_HIT, lineEnd, lineStart, SCENES, TOTAL_FRAMES, type SceneId } from "./timeline";
import {
  Captions,
  Chip,
  Count,
  fmt,
  Grade,
  H,
  Kicker,
  LogoImg,
  Movement,
  Panel,
  Plates,
  Reveal,
  sceneStarts,
  type Shot,
  Source,
  Stripes,
  StripeWipe,
  SX,
  SY,
  W,
  Watermark,
} from "./kit";
import { Lights } from "./lights";

export type Film5Props = {
  /** burned-in documentary subtitles (an SRT is also delivered) */
  readonly captions: boolean;
  /** file in public/audio; empty renders silent */
  readonly soundtrack: string;
};

const S = (id: SceneId) => SCENES[id].start;
const E = (id: SceneId) => SCENES[id].end;

/* ================================================================== shots */

// Act I: the night plate runs from the title card to the end of the questions.
const NIGHT_FROM = lineEnd("coldopen", 1) - 6;
const TITLE_OUT = SCENES.lights.start + 22;
// Secure: the same plate returns and the named successors turn orange.
const NAMED_FROM = lineStart("secure", 1) - 14;
const NAMED_AT = cue("secure", 1, "One hundred and thirty-two");
// Nationalization block inside Secure
const NAT_FROM = lineStart("secure", 2) - 10;
// Sustain: the Command Center, then the Arabic question
const CC_FROM = cue("sustain", 1, "the Talent Command Center") - 10;
const AR_FROM = lineStart("sustain", 2) - 6;
// Act IV
const HUSH_END = lineStart("handover", 0) - 4;
const PEOPLE_FROM = lineStart("handover", 1) - 8;
const END_FROM = lineStart("handover", 2) - 16;

const SHOTS: Shot[] = [
  /* I · the stakes: a control-room operator, then the control room at work */
  { clip: "control-room-operator", from: 0, to: lineStart("coldopen", 1) + 4, zoom: [1.0, 1.12], drift: [30, -6], fadeIn: 40, fadeOut: 8, dim: 0.12 },
  { clip: "control-room", from: lineStart("coldopen", 1) - 4, to: NIGHT_FROM + 12, zoom: [1.04, 1.12], fadeIn: 8, fadeOut: 0 },
  /* the plant at night: title card, then 309 lights, then the three questions */
  {
    clip: "refinery-night",
    from: NIGHT_FROM,
    to: E("lights") + 10,
    zoom: [1.0, 1.14],
    drift: [-40, -10],
    fadeIn: 14,
    fadeOut: 12,
    locked: (
      <Lights
        appear={[TITLE_OUT - NIGHT_FROM, lineEnd("lights", 0) - NIGHT_FROM - 10]}
        dim={[[lineStart("lights", 2) - NIGHT_FROM - 10, lineStart("lights", 2) - NIGHT_FROM + 14, 0.35]]}
      />
    ),
  },

  /* II · 01 Know: an honest conversation, leaders in one room */
  { clip: "team-meeting-live", from: S("know") - 2, to: lineStart("know", 1) + 4, zoom: [1.0, 1.05], fadeIn: 6, fadeOut: 0 },
  { clip: "boardroom-live", from: lineStart("know", 1) - 6, to: lineStart("know", 2) + 4, zoom: [1.0, 1.05], fadeIn: 10, fadeOut: 0 },
  { clip: "boardroom", from: lineStart("know", 2) - 6, to: E("know") + 4, zoom: [1.1, 1.16], fadeIn: 10, fadeOut: 0, dim: 0.72 },

  /* II · 02 Grow: MASAR at work, the ROBBAN cohort, a secondee bringing capability home */
  { clip: "masar-cohort-live", from: S("grow") - 2, to: cue("grow", 1, "Twenty-four") - 4, zoom: [1.0, 1.04], fadeIn: 6, fadeOut: 0 },
  { clip: "robban-cohort-live", from: cue("grow", 1, "Twenty-four") - 10, to: lineStart("grow", 2) + 2, zoom: [1.0, 1.04], fadeIn: 10, fadeOut: 0 },
  // walk-glass: cropped to the two engineers, clear of the glass reflection on the right
  { clip: "walk-glass", from: lineStart("grow", 2) - 8, to: E("grow") + 4, crop: { cx: 0.31, cy: 0.52, w: 0.6 }, zoom: [1.0, 1.06], drift: [-14, 0], fadeIn: 10, fadeOut: 0 },

  /* II · 03 Secure: planning the handover; the 132 named successors; nationalization */
  { clip: "tablet-sunset", from: S("secure") - 2, to: NAMED_FROM + 12, zoom: [1.0, 1.08], drift: [0, -10], fadeIn: 6, fadeOut: 0 },
  {
    clip: "refinery-night",
    from: NAMED_FROM,
    to: NAT_FROM + 14,
    zoom: [1.1, 1.18],
    drift: [-30, 0],
    fadeIn: 14,
    fadeOut: 0,
    dim: 0.1,
    locked: <Lights appear={[0, 1]} named={NAMED_AT - NAMED_FROM} />,
  },
  { clip: "engineers-walking", from: NAT_FROM, to: E("secure") + 4, zoom: [1.02, 1.1], drift: [20, 0], fadeIn: 14, fadeOut: 0, dim: 0.1, soften: { at: cue("secure", 2, "two hundred and forty-two") - 16, dim: 0.62, blur: 14 } },

  /* II · 04 Sustain: recognition, the Command Center on site, the Arabic question */
  { clip: "employees-live", from: S("sustain") - 2, to: CC_FROM - 70, zoom: [1.0, 1.04], fadeIn: 6, fadeOut: 0, dim: 0.1, soften: { at: cue("sustain", 0, "One thousand") - 14, dim: 0.5, blur: 10 } },
  { clip: "tablet-dusk-plant", from: CC_FROM - 80, to: CC_FROM + 14, zoom: [1.0, 1.08], fadeIn: 10, fadeOut: 0 },
  { clip: "site-dusk-aerial", from: CC_FROM, to: E("sustain") + 4, zoom: [1.06, 1.12], fadeIn: 12, fadeOut: 0, dim: 0.8 },

  /* III · the proof */
  { clip: "site-dusk-aerial", from: S("proof") - 2, to: E("proof") + 8, zoom: [1.12, 1.22], drift: [-20, 0], fadeIn: 6, fadeOut: 10, dim: 0.7 },

  /* IV · the handover: hush, then dawn, then the people */
  { clip: "sunset-pointing", from: S("handover"), to: HUSH_END + 12, zoom: [1.0, 1.1], drift: [-10, -6], fadeIn: 24, fadeOut: 0 },
  { clip: "sunrise-drone", from: HUSH_END, to: PEOPLE_FROM + 10, zoom: [1.0, 1.05], fadeIn: 14, fadeOut: 0, trim: 3.0 },
  { clip: "site-engineer-drawings", from: PEOPLE_FROM, to: PEOPLE_FROM + 24, zoom: [1.06, 1.1], fadeIn: 6, fadeOut: 0 },
  { clip: "office-walk-laptop", from: PEOPLE_FROM + 20, to: PEOPLE_FROM + 46, zoom: [1.06, 1.1], fadeIn: 4, fadeOut: 0 },
  { clip: "robban-cohort", from: PEOPLE_FROM + 42, to: PEOPLE_FROM + 70, zoom: [1.04, 1.1], fadeIn: 4, fadeOut: 0 },
  { clip: "masar-cohort", from: PEOPLE_FROM + 66, to: END_FROM + 30, zoom: [1.04, 1.12], fadeIn: 4, fadeOut: 0 },
];

/* ================================================================== Act I */

const ColdOpen: React.FC = () => {
  const frame = useCurrentFrame();
  const a = cue("coldopen", 0, "three hundred and nine");
  const b = lineStart("coldopen", 1) - 2;
  if (frame < a - 10 || frame > b) return null;
  const o = window01(frame, a - 6, b, 10, 12);
  // right third: the operator sits left of centre
  return (
    <div style={{ position: "absolute", right: SX, top: 330, opacity: o, display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
      <Kicker>Critical roles · 2026</Kicker>
      <div style={{ marginTop: 18 }}>
        <Count to={SUCCESSION.criticalRoles} at={a} dur={1} size={250} from={SUCCESSION.criticalRoles} />
      </div>
      <div style={{ marginTop: 12 }}>
        <Reveal text="that can never be empty" at={cue("coldopen", 0, "can never")} size={52} weight={400} align="right" />
      </div>
    </div>
  );
};

const TitleCard: React.FC = () => {
  const frame = useCurrentFrame();
  const a = NIGHT_FROM + 16;
  const b = TITLE_OUT;
  if (frame < a || frame > b) return null;
  const o = window01(frame, a, b, 18, 18);
  const parts = ["Protecting critical capability", "Building future leaders", "Advancing Omani talent"];
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: o }}>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 60% 45% at 50% 50%, rgba(4,15,23,0.78), rgba(4,15,23,0.25) 100%)" }} />
      <div style={{ position: "relative", fontFamily: FONT, display: "flex", flexDirection: "column", alignItems: "center", gap: 26 }}>
        <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: 10, color: COLORS.orange, opacity: ramp(frame, a, a + 20) }}>OQ RPI</div>
        <div style={{ fontSize: 96, fontWeight: 300, letterSpacing: 22, color: COLORS.white, opacity: ramp(frame, a + 6, a + 30), marginRight: -22 }}>TALENT MANAGEMENT</div>
        <div style={{ display: "flex", gap: 22, alignItems: "center", fontSize: 34, fontWeight: 500, color: "rgba(255,255,255,0.95)" }}>
          {parts.map((p, i) => (
            <span key={p} style={{ display: "flex", gap: 22, alignItems: "center", opacity: ramp(frame, a + 22 + i * 8, a + 40 + i * 8) }}>
              {i ? <span style={{ width: 8, height: 8, borderRadius: 4, background: COLORS.orange }} /> : null}
              {p}
            </span>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const LightsCount: React.FC = () => {
  const frame = useCurrentFrame();
  const a = TITLE_OUT;
  const b = lineStart("lights", 2) - 6;
  if (frame < a || frame > b) return null;
  const o = window01(frame, a, b, 12, 14);
  return (
    <div style={{ position: "absolute", left: SX, bottom: SY + 170, opacity: o }}>
      <Count to={SUCCESSION.criticalRoles} at={a} dur={lineEnd("lights", 0) - a - 10} size={150} />
      <div style={{ fontFamily: FONT, fontSize: 36, fontWeight: 500, color: COLORS.white, marginTop: 8 }}>critical roles, one light each</div>
    </div>
  );
};

const Questions: React.FC = () => {
  const frame = useCurrentFrame();
  const a = lineStart("lights", 2) - 12;
  const b = E("lights") + 4;
  if (frame < a || frame > b) return null;
  const o = window01(frame, a, b, 12, 12);
  const qs: Array<[string, string]> = [
    ["Which roles matter most?", "Which roles"],
    ["Who is ready to take them?", "Who is ready"],
    ["What must we build before we need it?", "And what must"],
  ];
  return (
    <AbsoluteFill style={{ opacity: o }}>
    <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(4,15,23,0.85) 0%, rgba(4,15,23,0.55) 55%, rgba(4,15,23,0) 85%)" }} />
    <div style={{ position: "absolute", left: SX, top: 250, display: "flex", flexDirection: "column", gap: 34 }}>
      <Kicker>Three questions the business cannot get wrong</Kicker>
      {qs.map(([q, ph], i) => {
        const t = cue("lights", 2, ph);
        const k = ramp(frame, t - 4, t + 16);
        return (
          <div key={q} style={{ display: "flex", alignItems: "baseline", gap: 26, opacity: k, translate: `${(1 - k) * -24}px 0px` }}>
            <span style={{ fontFamily: FONT, fontSize: 40, fontWeight: 700, color: COLORS.orange }}>0{i + 1}</span>
            <span style={{ fontFamily: FONT, fontSize: 68, fontWeight: 600, color: COLORS.white, textShadow: "0 2px 18px rgba(0,0,0,0.6)" }}>{q}</span>
          </div>
        );
      })}
    </div>
    </AbsoluteFill>
  );
};

/* ================================================================== Act II · Know */

const PerformanceReviews: React.FC = () => {
  const frame = useCurrentFrame();
  const a = cue("know", 0, "six hundred and eighty");
  const b = lineStart("know", 1) + 4;
  if (frame < a - 8 || frame > b) return null;
  const o = window01(frame, a - 8, b, 10, 12);
  return (
    <div style={{ position: "absolute", left: SX, bottom: SY + 120, opacity: o }}>
      <Panel style={{ padding: "28px 36px" }}>
        <Count to={PERFORMANCE.rated2026} at={a} dur={28} size={130} color={COLORS.white} />
        <div style={{ fontFamily: FONT, fontSize: 36, fontWeight: 500, color: COLORS.white, marginTop: 10 }}>performance reviews · 2026</div>
      </Panel>
    </div>
  );
};

/** A clean, front-on 9-Box: only the "ready now" cell is lit; no names, no counts elsewhere. */
const NineBox: React.FC = () => {
  const frame = useCurrentFrame();
  const a = lineStart("know", 2) - 6;
  const b = E("know") + 6;
  if (frame < a || frame > b) return null;
  const o = window01(frame, a, b, 12, 12);
  const at43 = cue("know", 2, "forty-three");
  const lit = ramp(frame, at43 - 2, at43 + 14);
  const cw = 196;
  const ch = 128;
  const gap = 12;
  const gx = 1050;
  const gy = 290;
  return (
    <AbsoluteFill style={{ opacity: o }}>
      {/* the hero number */}
      <div style={{ position: "absolute", left: SX, top: 290 }}>
        <Kicker>Talent Review · 2026</Kicker>
        <div style={{ marginTop: 16 }}>
          <Count to={PERFORMANCE.hiLeadReadyToday} at={at43} dur={24} size={260} color={COLORS.orange} />
        </div>
        <div style={{ fontFamily: FONT, fontSize: 46, fontWeight: 600, color: COLORS.white, marginTop: 6, opacity: ramp(frame, at43 + 4, at43 + 20) }}>leaders ready to step up today</div>
        <div style={{ fontFamily: FONT, fontSize: 32, fontWeight: 400, color: COLORS.lightBlue, marginTop: 22, opacity: ramp(frame, at43 + 26, at43 + 44) }}>
          A decision tool, not a label.
        </div>
      </div>
      {/* the grid */}
      <div style={{ position: "absolute", left: gx, top: gy, opacity: ramp(frame, a, a + 18) }}>
        {[0, 1, 2].map((r) =>
          [0, 1, 2].map((c) => {
            const hot = r === 0 && c === 2;
            const d = (r + (2 - c)) * 3;
            const k = ramp(frame, a + d, a + d + 14);
            return (
              <div
                key={`${r}-${c}`}
                style={{
                  position: "absolute",
                  left: c * (cw + gap),
                  top: r * (ch + gap),
                  width: cw,
                  height: ch,
                  borderRadius: 10,
                  border: hot ? `3px solid ${COLORS.orange}` : "2px solid rgba(156,219,217,0.45)",
                  background: hot ? `rgba(255,130,0,${0.18 + 0.72 * lit})` : "rgba(8,31,44,0.55)",
                  boxShadow: hot ? `0 0 ${60 * lit}px rgba(255,130,0,0.6)` : undefined,
                  opacity: k,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: FONT,
                  fontSize: 30,
                  fontWeight: 700,
                  color: "#fff",
                }}
              >
                {hot ? <span style={{ opacity: lit }}>Ready now</span> : null}
              </div>
            );
          }),
        )}
        {/* axes */}
        <div style={{ position: "absolute", left: -58, top: 3 * ch + 2 * gap, transformOrigin: "0 0", rotate: "-90deg", fontFamily: FONT, fontSize: 26, fontWeight: 700, letterSpacing: 4, color: COLORS.lightBlue, whiteSpace: "nowrap" }}>
          PERFORMANCE →
        </div>
        <div style={{ position: "absolute", left: 0, top: 3 * ch + 2 * gap + 22, fontFamily: FONT, fontSize: 26, fontWeight: 700, letterSpacing: 4, color: COLORS.lightBlue }}>POTENTIAL →</div>
      </div>
    </AbsoluteFill>
  );
};

/* ================================================================== Act II · Grow */

const GrowFacts: React.FC = () => {
  const frame = useCurrentFrame();
  const m = cue("grow", 1, "Two hundred and thirty-seven");
  const r = cue("grow", 1, "Twenty-four");
  const sec = lineStart("grow", 2);
  const masar = window01(frame, m - 6, r - 6, 10, 10);
  const robban = window01(frame, r - 2, sec + 2, 10, 10);
  const secO = window01(frame, sec + 6, E("grow") + 4, 12, 12);
  // host organisations of the secondments on record (SECONDMENT.hosts in data.ts)
  const hosts = ["OQ SAOC", "OQ8", "OPAL", "Council of Ministers", "Oman Vision 2040"];
  return (
    <>
      {masar > 0 ? (
        <div style={{ position: "absolute", left: SX, bottom: SY + 110, opacity: masar }}>
          <Panel>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 28 }}>
              <Count to={LEADERSHIP.masar.alumni} at={m} dur={30} size={140} />
              <div style={{ paddingBottom: 14 }}>
                <div style={{ fontFamily: FONT, fontSize: 40, fontWeight: 700, color: COLORS.white }}>MASAR alumni</div>
                <div style={{ fontFamily: FONT, fontSize: 30, color: COLORS.lightBlue, marginTop: 6 }}>leadership journey · 2023–2025</div>
              </div>
            </div>
            <div style={{ marginTop: 18 }}>
              <Chip s="DELIVERED" />
            </div>
          </Panel>
        </div>
      ) : null}
      {robban > 0 ? (
        <div style={{ position: "absolute", right: SX, top: SY + 90, opacity: robban }}>
          <Panel style={{ display: "flex", alignItems: "center", gap: 34 }}>
            <Img src={staticFile("brand/robban-logo-white.png")} style={{ height: 96 }} />
            <div style={{ width: 2, alignSelf: "stretch", background: "rgba(255,255,255,0.25)" }} />
            <div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 18 }}>
                <Count to={LEADERSHIP.robban.cohort} at={r} dur={20} size={110} />
                <span style={{ fontFamily: FONT, fontSize: 40, fontWeight: 700, color: COLORS.white }}>leaders</span>
              </div>
              <div style={{ fontFamily: FONT, fontSize: 30, color: COLORS.lightBlue, marginTop: 4 }}>October 2026 · with the Center for Creative Leadership</div>
              <div style={{ marginTop: 14 }}>
                <Chip s="IN PLACE" />
              </div>
            </div>
          </Panel>
        </div>
      ) : null}
      {secO > 0 ? (
        <div style={{ position: "absolute", right: SX, bottom: SY + 110, opacity: secO, textAlign: "right" }}>
          <Panel style={{ maxWidth: 960 }}>
            <Kicker>Secondments</Kicker>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "flex-end", columnGap: 14, rowGap: 4, fontFamily: FONT, fontSize: 36, fontWeight: 600, color: COLORS.white, marginTop: 16, lineHeight: 1.35 }}>
              {hosts.map((h, i) => (
                <span key={h} style={{ whiteSpace: "nowrap", opacity: ramp(frame, sec + 14 + i * 6, sec + 28 + i * 6) }}>
                  {h}
                  {i < hosts.length - 1 ? <span style={{ color: COLORS.orange }}> ·</span> : null}
                </span>
              ))}
            </div>
            <div style={{ fontFamily: FONT, fontSize: 30, color: COLORS.lightBlue, marginTop: 12 }}>across OQ and national institutions</div>
          </Panel>
        </div>
      ) : null}
    </>
  );
};

/* ================================================================== Act II · Secure */

const Successors: React.FC = () => {
  const frame = useCurrentFrame();
  const a = NAMED_AT - 10;
  const b = NAT_FROM + 6;
  if (frame < a || frame > b) return null;
  const o = window01(frame, a, b, 12, 12);
  const named = cue("secure", 1, "Named is not");
  return (
    <div style={{ position: "absolute", left: SX, bottom: SY + 110, opacity: o }}>
      <Panel style={{ maxWidth: 880 }}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 22 }}>
          <Count to={SUCCESSION.rolesWithSuccessor} at={NAMED_AT} dur={40} size={140} color={COLORS.orange} />
          <div style={{ fontFamily: FONT, fontSize: 56, fontWeight: 300, color: COLORS.white, paddingBottom: 14 }}>of {SUCCESSION.criticalRoles}</div>
        </div>
        <div style={{ fontFamily: FONT, fontSize: 38, fontWeight: 600, color: COLORS.white, marginTop: 8 }}>critical roles have a named successor</div>
        <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 18 }}>
          <Chip s="IN PLACE" />
          <span style={{ fontFamily: FONT, fontSize: 30, color: COLORS.lightBlue, opacity: ramp(frame, named, named + 18) }}>Named is not ready. Readiness is confirmed in the Talent Review.</span>
        </div>
      </Panel>
    </div>
  );
};

const Nationalization: React.FC = () => {
  const frame = useCurrentFrame();
  const n242 = cue("secure", 2, "two hundred and forty-two");
  const a = n242 - 14;
  const b = E("secure") + 6;
  if (frame < a || frame > b) return null;
  const o = window01(frame, a, b, 14, 12);
  const mentor = cue("secure", 2, "with each expert");
  const n99 = lineStart("secure", 3);
  const max = Math.max(...NATIONALIZATION.plan.map((p) => p.n));
  const total = NATIONALIZATION.plan.reduce((s, p) => s + p.n, 0);
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <div style={{ position: "absolute", left: SX, top: 250 }}>
        <Kicker>Nationalization · plan 2026–2030</Kicker>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 24, marginTop: 18 }}>
          <Count to={total} at={n242} dur={36} size={170} />
          <div style={{ paddingBottom: 20 }}>
            <Chip s="PLAN" />
          </div>
        </div>
        <div style={{ fontFamily: FONT, fontSize: 40, fontWeight: 600, color: COLORS.white, marginTop: 6, maxWidth: 940 }}>roles planned to be led by Omanis by 2030</div>
        <div style={{ fontFamily: FONT, fontSize: 32, color: COLORS.lightBlue, marginTop: 14, opacity: ramp(frame, mentor, mentor + 18) }}>The expert stays on as mentor until the handover.</div>
        <div style={{ display: "flex", alignItems: "center", gap: 22, marginTop: 44, opacity: ramp(frame, n99 - 4, n99 + 14) }}>
          <Count to={NATIONALIZATION.omaniSuccessorsNamed} at={n99} dur={24} size={110} color={COLORS.orange} />
          <div>
            <div style={{ fontFamily: FONT, fontSize: 36, fontWeight: 600, color: COLORS.white }}>Omani successors already named</div>
            <div style={{ marginTop: 10 }}>
              <Chip s="IN PLACE" />
            </div>
          </div>
        </div>
      </div>
      {/* the plan, year by year */}
      <div style={{ position: "absolute", right: SX, top: 300, display: "flex", alignItems: "flex-end", gap: 30, height: 420 }}>
        {NATIONALIZATION.plan.map((p, i) => {
          const k = ramp(frame, n242 + i * 6, n242 + i * 6 + 24, EASE.out);
          return (
            <div key={p.year} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, width: 110 }}>
              <div style={{ fontFamily: FONT, fontSize: 40, fontWeight: 700, color: COLORS.white, opacity: k }}>{p.n}</div>
              <div style={{ width: 84, height: 300 * (p.n / max) * k, background: `linear-gradient(180deg, ${COLORS.orange}, rgba(255,130,0,0.45))`, borderRadius: "8px 8px 0 0" }} />
              <div style={{ fontFamily: FONT, fontSize: 30, fontWeight: 600, color: COLORS.lightBlue }}>{p.year}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/* ================================================================== Act II · Sustain */

const Recognition: React.FC = () => {
  const frame = useCurrentFrame();
  const n = cue("sustain", 0, "One thousand");
  const a = n - 10;
  const b = CC_FROM - 72;
  if (frame < a || frame > b) return null;
  const o = window01(frame, a, b, 12, 12);
  const progs = REWARDS.programmes.map((p) => p.name);
  return (
    <div style={{ position: "absolute", left: SX, bottom: SY + 110, opacity: o }}>
      <Panel>
        <Count to={REWARDS.granted} at={n} dur={40} size={140} />
        <div style={{ fontFamily: FONT, fontSize: 38, fontWeight: 600, color: COLORS.white, marginTop: 8 }}>recognitions · {REWARDS.period}</div>
        <div style={{ fontFamily: FONT, fontSize: 30, color: COLORS.lightBlue, marginTop: 10 }}>{progs.join("  ·  ")}</div>
        <div style={{ marginTop: 16 }}>
          <Chip s="DELIVERED" />
        </div>
      </Panel>
    </div>
  );
};

const TILES: Array<{ readonly n: number; readonly label: string }> = [
  { n: SUCCESSION.criticalRoles, label: "Critical roles mapped" },
  { n: SUCCESSION.rolesWithSuccessor, label: "With a named successor" },
  { n: PERFORMANCE.hiLeadReadyToday, label: "Ready to step up today" },
  { n: LEADERSHIP.masar.alumni, label: "MASAR alumni" },
  { n: NATIONALIZATION.omaniSuccessorsNamed, label: "Omani successors named" },
  { n: REWARDS.granted, label: "Recognitions in 2026" },
];

const CommandCenter: React.FC = () => {
  const frame = useCurrentFrame();
  const a = CC_FROM + 4;
  const b = E("sustain") + 6;
  if (frame < a || frame > b) return null;
  const o = window01(frame, a, b, 14, 12);
  const back = 1 - 0.55 * ramp(frame, AR_FROM, AR_FROM + 16);
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <div style={{ position: "absolute", left: SX, top: SY + 20, right: SX, opacity: back, filter: `blur(${(1 - back) * 6}px)` }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <Kicker>One place · every leader</Kicker>
            <div style={{ fontFamily: FONT, fontSize: 60, fontWeight: 600, color: COLORS.white, marginTop: 12 }}>OQ RPI Talent Command Center</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, fontFamily: FONT, fontSize: 26, fontWeight: 800, letterSpacing: 3, color: COLORS.green }}>
            <span style={{ width: 16, height: 16, borderRadius: 8, background: COLORS.green, opacity: 0.6 + 0.4 * Math.sin(frame * 0.25) }} />
            LIVE
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 26, marginTop: 40 }}>
          {TILES.map((t, i) => {
            const k = ramp(frame, a + 6 + i * 4, a + 26 + i * 4);
            return (
              <div key={t.label} style={{ opacity: k, translate: `0px ${(1 - k) * 20}px` }}>
                <Panel style={{ padding: "26px 32px" }}>
                  <Count to={t.n} at={a + 8 + i * 4} dur={30} size={96} color={i === 2 ? COLORS.orange : COLORS.white} />
                  <div style={{ fontFamily: FONT, fontSize: 32, fontWeight: 500, color: COLORS.lightBlue, marginTop: 10 }}>{t.label}</div>
                </Panel>
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 26 }}>
          <Source />
        </div>
      </div>
    </AbsoluteFill>
  );
};

const QUESTION_AR = "كم عدد القادة الجاهزين اليوم؟";
const ANSWER_AR = "٤٣ قائدًا جاهزون اليوم، وفق مراجعة المواهب ٢٠٢٦.";

const ArabicAssistant: React.FC = () => {
  const frame = useCurrentFrame();
  const a = AR_FROM + 6;
  const b = E("sustain") + 6;
  if (frame < a || frame > b) return null;
  const o = window01(frame, a, b, 12, 12);
  const typed = Math.round(QUESTION_AR.length * ramp(frame, a + 8, a + 40, (x) => x));
  const thinking = frame > a + 44 && frame < a + 62;
  const ans = ramp(frame, a + 62, a + 80);
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: o }}>
      <div style={{ width: 1180, translate: `0px ${(1 - ramp(frame, a, a + 18)) * 30}px` }}>
        <Panel style={{ padding: "36px 44px", background: "linear-gradient(135deg, rgba(8,31,44,0.96), rgba(4,15,23,0.94))" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <Img src={staticFile("brand/tm-assistant.png")} style={{ width: 64, height: 64, borderRadius: 14 }} />
            <div style={{ fontFamily: FONT, fontSize: 34, fontWeight: 700, color: COLORS.white }}>Talent Assistant</div>
            <div style={{ fontFamily: FONT, fontSize: 26, color: COLORS.lightBlue, marginLeft: "auto" }}>English · العربية</div>
          </div>
          {/* question */}
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 30 }}>
            <div style={{ direction: "rtl", fontFamily: FONT_AR, fontSize: 46, fontWeight: 700, color: "#fff", background: COLORS.orange, padding: "14px 28px", borderRadius: 18, minHeight: 66 }}>
              {QUESTION_AR.slice(0, typed)}
              <span style={{ opacity: typed < QUESTION_AR.length && Math.floor(frame / 8) % 2 ? 1 : 0 }}>|</span>
            </div>
          </div>
          {/* answer */}
          <div style={{ marginTop: 24, minHeight: 150 }}>
            {thinking ? (
              <div style={{ display: "flex", gap: 10, padding: "20px 8px" }}>
                {[0, 1, 2].map((i) => (
                  <span key={i} style={{ width: 14, height: 14, borderRadius: 7, background: COLORS.lightBlue, opacity: 0.4 + 0.6 * Math.abs(Math.sin(frame * 0.3 + i)) }} />
                ))}
              </div>
            ) : null}
            <div style={{ opacity: ans, translate: `0px ${(1 - ans) * 14}px` }}>
              <div style={{ direction: "rtl", fontFamily: FONT_AR, fontSize: 46, fontWeight: 700, color: "#fff", background: "rgba(0,176,185,0.22)", border: `2px solid ${COLORS.turquoise}`, padding: "16px 28px", borderRadius: 18 }}>
                {ANSWER_AR}
              </div>
              <div style={{ fontFamily: FONT, fontSize: 30, color: COLORS.lightBlue, marginTop: 16 }}>
                “How many leaders are ready today?” · “43 leaders are ready today, per the 2026 Talent Review.”
              </div>
            </div>
          </div>
        </Panel>
      </div>
    </AbsoluteFill>
  );
};

/* ================================================================== Act III */

const ROWS: Array<{
  readonly title: string;
  readonly phrase: string;
  readonly facts: Array<{ readonly text: string; readonly s: "DELIVERED" | "IN PLACE" | "PLAN" }>;
}> = [
  {
    title: "Continuity",
    phrase: "Continuity",
    facts: [{ text: `${SUCCESSION.rolesWithSuccessor} of ${SUCCESSION.criticalRoles} critical roles with a named successor`, s: "IN PLACE" }],
  },
  {
    title: "Leadership",
    phrase: "Leaders ready",
    facts: [
      { text: `${LEADERSHIP.masar.alumni} MASAR alumni`, s: "DELIVERED" },
      { text: `${LEADERSHIP.robban.cohort} ROBBAN leaders`, s: "IN PLACE" },
    ],
  },
  {
    title: "National talent",
    phrase: "And Omani talent",
    facts: [
      { text: `${NATIONALIZATION.omaniSuccessorsNamed} Omani successors named`, s: "IN PLACE" },
      { text: `${fmt(NATIONALIZATION.plan.reduce((s, p) => s + p.n, 0))} roles by 2030`, s: "PLAN" },
    ],
  },
];

const Proof: React.FC = () => {
  const frame = useCurrentFrame();
  const a = S("proof") + 10;
  const b = E("proof") + 4;
  if (frame < a || frame > b) return null;
  const o = window01(frame, a, b, 14, 14);
  const ahead = lineStart("proof", 2);
  const remaining = SUCCESSION.criticalRoles - SUCCESSION.rolesWithSuccessor;
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <div style={{ position: "absolute", left: SX, top: SY + 20 }}>
        <Kicker>Investing in our people today</Kicker>
        <div style={{ marginTop: 14 }}>
          <Reveal text="The capability OQ RPI is building" at={lineStart("proof", 0)} size={64} weight={600} />
        </div>
      </div>
      <div style={{ position: "absolute", left: SX, top: 330, display: "flex", flexDirection: "column", gap: 34 }}>
        {ROWS.map((r) => {
          const t = cue("proof", 1, r.phrase);
          const k = ramp(frame, t - 6, t + 14);
          return (
            <div key={r.title} style={{ display: "flex", gap: 26, opacity: k, translate: `${(1 - k) * -20}px 0px` }}>
              <div style={{ width: 6, background: COLORS.orange, borderRadius: 3 }} />
              <div>
                <div style={{ fontFamily: FONT, fontSize: 52, fontWeight: 700, color: COLORS.white }}>{r.title}</div>
                <div style={{ display: "flex", gap: 26, marginTop: 8 }}>
                  {r.facts.map((f) => (
                    <div key={f.text} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <Chip s={f.s} />
                      <span style={{ fontFamily: FONT, fontSize: 32, fontWeight: 500, color: "rgba(255,255,255,0.95)" }}>{f.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {/* the work ahead */}
      <div style={{ position: "absolute", right: SX, top: 330, width: 500, textAlign: "right", opacity: ramp(frame, ahead - 6, ahead + 14) }}>
        <Kicker color={COLORS.orange}>The work ahead</Kicker>
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
          <Count to={remaining} at={cue("proof", 2, "one hundred")} dur={30} size={190} color={COLORS.orange} />
        </div>
        <div style={{ fontFamily: FONT, fontSize: 36, fontWeight: 600, color: COLORS.white, whiteSpace: "nowrap" }}>critical roles still to cover</div>
      </div>
      <div style={{ position: "absolute", left: SX, bottom: SY + 96 }}>
        <Source />
      </div>
    </AbsoluteFill>
  );
};

/* ================================================================== Act IV */

const HandoverTitles: React.FC = () => {
  const frame = useCurrentFrame();
  const l0 = lineStart("handover", 0);
  const l1 = lineStart("handover", 1);
  const t0 = window01(frame, l0 - 6, PEOPLE_FROM + 6, 14, 12);
  const t1 = window01(frame, l1 - 4, END_FROM + 14, 10, 16);
  return (
    <>
      {t0 > 0 ? (
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: t0 }}>
          <Reveal text="The future is not built by systems." at={l0 - 4} size={78} weight={300} align="center" stagger={4} />
        </AbsoluteFill>
      ) : null}
      {t1 > 0 ? (
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: t1 }}>
          <AbsoluteFill style={{ background: "radial-gradient(ellipse 55% 40% at 50% 50%, rgba(4,15,23,0.55), rgba(4,15,23,0) 100%)" }} />
          <div style={{ position: "relative" }}>
            <Reveal text="It is built by people." at={l1 - 2} size={110} weight={700} align="center" stagger={4} />
          </div>
        </AbsoluteFill>
      ) : null}
    </>
  );
};

/** Clean end card: no particles, no photograph behind the lockup. */
const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const a = END_FROM;
  if (frame < a) return null;
  const bg = ramp(frame, a, a + 24, EASE.inOut);
  const logo = ramp(frame, a + 8, a + 40, EASE.out);
  const tag = cue("handover", 2, "Building");
  const black = ramp(frame, TOTAL_FRAMES - 34, TOTAL_FRAMES - 2, EASE.inOut);
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 75% 65% at 50% 45%, #0d2c3b 0%, #081F2C 55%, #030d14 100%)", opacity: bg }} />
      <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: 34, marginTop: -30 }}>
        <LogoImg width={820} style={{ opacity: logo, filter: `blur(${(1 - logo) * 10}px)`, scale: String(0.95 + 0.05 * logo) }} />
        <div style={{ fontFamily: FONT, fontSize: 42, fontWeight: 300, letterSpacing: 16, color: COLORS.white, opacity: ramp(frame, a + 24, a + 50), marginRight: -16 }}>TALENT MANAGEMENT</div>
        <div style={{ display: "flex", gap: 16, alignItems: "baseline", fontFamily: FONT, fontSize: 44, fontWeight: 700, marginTop: 14 }}>
          <span style={{ color: COLORS.white, opacity: ramp(frame, tag, tag + 20) }}>Building tomorrow’s talent,</span>
          <span style={{ color: COLORS.orange, fontStyle: "italic", opacity: ramp(frame, tag + 24, tag + 44) }}>together</span>
        </div>
        <div style={{ direction: "rtl", fontFamily: FONT_AR, fontSize: 44, fontWeight: 700, color: COLORS.lightBlue, opacity: ramp(frame, tag + 40, tag + 64) }}>نبني مواهب الغد، معًا</div>
      </div>
      <div style={{ position: "absolute", right: SX, top: SY }}>
        <Stripes progress={ramp(frame, LOGO_HIT, LOGO_HIT + 24)} scale={1.2} />
      </div>
      <AbsoluteFill style={{ background: "#000", opacity: black }} />
    </AbsoluteFill>
  );
};

/* ================================================================== film */

/** Lines that are set as on-screen titles, so not repeated as captions. */
const TITLED = (scene: SceneId, n: number) => scene === "handover" || (scene === "lights" && n === 2);

const Movements: React.FC = () => (
  <>
    <Movement from={S("know") + 10} to={S("know") + 170} index="01" en="KNOW" ar="نعرف" sub="Who we have, and who is ready" />
    <Movement from={S("grow") + 10} to={S("grow") + 170} index="02" en="GROW" ar="نطوّر" sub="Leaders built before they are needed" />
    <Movement from={S("secure") + 10} to={S("secure") + 170} index="03" en="SECURE" ar="نضمن" sub="Every critical role, a planned handover" />
    <Movement from={S("sustain") + 10} to={S("sustain") + 170} index="04" en="SUSTAIN" ar="نحافظ" sub="Recognition, and one view of it all" />
  </>
);

export const Film5: React.FC<Film5Props> = ({ captions, soundtrack }) => {
  const { width, height } = useVideoConfig();
  const s = Math.min(width / W, height / H);
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.midnightDeep }}>
      {soundtrack ? <Audio src={staticFile(`audio/${soundtrack}`)} /> : null}
      <div
        style={{
          position: "absolute",
          width: W,
          height: H,
          left: (width - W * s) / 2,
          top: (height - H * s) / 2,
          scale: String(s),
          transformOrigin: "0 0",
          overflow: "hidden",
        }}
      >
        <Plates shots={SHOTS} />
        <ColdOpen />
        <TitleCard />
        <LightsCount />
        <Questions />
        <PerformanceReviews />
        <NineBox />
        <GrowFacts />
        <Successors />
        <Nationalization />
        <Recognition />
        <CommandCenter />
        <ArabicAssistant />
        <Proof />
        <HandoverTitles />
        <Movements />
        <Grade />
        <Watermark from={S("know")} to={CC_FROM} />
        {captions ? <Captions skip={TITLED} /> : null}
        <EndCard />
        {sceneStarts(["lights", "handover"]).map((f) => (
          <StripeWipe key={f} at={f} />
        ))}
      </div>
    </AbsoluteFill>
  );
};

export { TOTAL_FRAMES };
