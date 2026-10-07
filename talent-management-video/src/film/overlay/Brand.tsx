/** OQ RPI brand layer: opening logo, top-left watermark, closing logo card. */
import type React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { ramp, EASE } from "../math";
import { LOGO_HIT, SCENES } from "../timeline";
import { COLORS, FONT } from "../../theme";
import { COMMAND_CENTER } from "../data";

const LOGO = staticFile("brand/oq-rpi-logo-white.png");
const LOGO_RATIO = 1866 / 450;

export const INTRO_END = 108;

const Stripes: React.FC<{ readonly progress: number; readonly scale?: number }> = ({ progress, scale = 1 }) => (
  <svg width={150 * scale} height={96 * scale} viewBox="0 0 150 96" style={{ overflow: "visible" }}>
    <polygon points="76,0 106,0 34,96 4,96" fill={COLORS.orange} opacity={progress} transform={`translate(${(1 - progress) * 40} 0)`} />
    <polygon points="116,0 131,0 59,96 44,96" fill="#C9CFD4" opacity={progress} transform={`translate(${(1 - progress) * 60} 0)`} />
    <polygon points="138,0 150,0 78,96 66,96" fill={COLORS.turquoise} opacity={progress} transform={`translate(${(1 - progress) * 80} 0)`} />
  </svg>
);

/** 0 → INTRO_END: OQ RPI logo on midnight blue, light sweep, stripes. */
export const LogoIntro: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame > INTRO_END) return null;
  const inT = ramp(frame, 6, 40, EASE.out);
  const out = 1 - ramp(frame, INTRO_END - 22, INTRO_END, EASE.inOut);
  const sweep = ramp(frame, 18, 60, EASE.inOut);
  const sub = ramp(frame, 34, 60);
  const w = 760;
  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse 70% 60% at 50% 45%, #0d2c3b 0%, #081F2C 55%, #030d14 100%)", opacity: out, justifyContent: "center", alignItems: "center" }}>
      <div style={{ position: "relative", width: w, height: w / LOGO_RATIO, opacity: inT, scale: String(0.92 + 0.08 * inT), filter: `blur(${(1 - inT) * 10}px)` }}>
        <Img src={LOGO} style={{ width: "100%", height: "100%" }} />
        {/* light sweep across the wordmark */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(105deg, rgba(255,255,255,0) ${sweep * 140 - 40}%, rgba(255,255,255,0.55) ${sweep * 140 - 25}%, rgba(255,255,255,0) ${sweep * 140 - 10}%)`,
            mixBlendMode: "overlay",
            WebkitMaskImage: `url(${LOGO})`,
            maskImage: `url(${LOGO})`,
            WebkitMaskSize: "100% 100%",
            maskSize: "100% 100%",
          }}
        />
      </div>
      <div style={{ marginTop: 44, display: "flex", alignItems: "center", gap: 18, fontFamily: FONT, opacity: sub }}>
        <div style={{ width: 60 * sub, height: 2, background: COLORS.orange }} />
        <div style={{ fontSize: 30, fontWeight: 300, letterSpacing: 12, color: COLORS.white }}>TALENT MANAGEMENT</div>
        <div style={{ width: 60 * sub, height: 2, background: COLORS.orange }} />
      </div>
      <div style={{ position: "absolute", right: 70, top: 50 }}>
        <Stripes progress={ramp(frame, 20, 50)} />
      </div>
    </AbsoluteFill>
  );
};

/** Subtle top-left OQ RPI watermark for the whole film (between the intro and the end card). */
export const Watermark: React.FC = () => {
  const frame = useCurrentFrame();
  const o = ramp(frame, INTRO_END - 10, INTRO_END + 14) * (1 - ramp(frame, LOGO_HIT - 30, LOGO_HIT - 6));
  if (o <= 0) return null;
  return (
    <div style={{ position: "absolute", left: 64, top: 46, opacity: 0.88 * o, display: "flex", alignItems: "center", gap: 16 }}>
      <Img src={LOGO} style={{ height: 40, width: 40 * LOGO_RATIO, filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.5))" }} />
      <div style={{ width: 1, height: 30, background: "rgba(255,255,255,0.4)" }} />
      <div style={{ fontFamily: FONT, fontSize: 15, fontWeight: 600, letterSpacing: 3.5, color: "rgba(255,255,255,0.88)", textShadow: "0 1px 6px rgba(0,0,0,0.6)" }}>
        TALENT MANAGEMENT
      </div>
    </div>
  );
};

/** Closing logo card on the musical hit. */
export const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const hit = LOGO_HIT;
  if (frame < hit - 4) return null;
  const reveal = ramp(frame, hit, hit + 40, EASE.out);
  const tag = (i: number) => ramp(frame, hit + 60 + i * 14, hit + 90 + i * 14);
  const endF = SCENES.future.end;
  const black = ramp(frame, endF - 36, endF - 2, EASE.inOut);
  const w = 900;
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 70% 60% at 50% 48%, rgba(5,20,30,0.92) 0%, rgba(5,20,30,0.75) 55%, rgba(3,13,20,0.45) 100%)", opacity: reveal }} />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 34, marginTop: -40 }}>
        <Img
          src={LOGO}
          style={{ width: w, height: w / LOGO_RATIO, opacity: reveal, filter: `blur(${(1 - reveal) * 10}px) drop-shadow(0 10px 40px rgba(0,0,0,0.5))`, scale: String(0.95 + 0.05 * reveal) }}
        />
        <div style={{ fontFamily: FONT, fontSize: 40, fontWeight: 300, letterSpacing: 14, color: COLORS.white, opacity: ramp(frame, hit + 30, hit + 66) }}>
          TALENT MANAGEMENT
        </div>
        <div style={{ display: "flex", gap: 14, alignItems: "baseline", fontFamily: FONT, fontSize: 34, fontWeight: 700 }}>
          <span style={{ color: COLORS.white, opacity: tag(0) }}>{COMMAND_CENTER.tagline[0]}</span>
          <span style={{ color: COLORS.orange, fontStyle: "italic", opacity: tag(1) }}>{COMMAND_CENTER.tagline[1]}</span>
        </div>
        <div style={{ fontFamily: FONT, fontSize: 18, letterSpacing: 8, color: COLORS.lightBlue, opacity: tag(2) }}>{COMMAND_CENTER.footer}</div>
      </div>
      <div style={{ position: "absolute", right: 80, top: 60 }}>
        <Stripes progress={ramp(frame, hit + 10, hit + 40)} scale={1.2} />
      </div>
      <AbsoluteFill style={{ background: "#000", opacity: black }} />
    </AbsoluteFill>
  );
};
