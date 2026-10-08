import type React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { World } from "./world/World";
import { Overlays, TopLayer } from "./overlay/Overlays";
import { Plates } from "./overlay/Plates";
import { Showcase } from "./overlay/Showcase";
import { EndCard, LogoIntro, Watermark } from "./overlay/Brand";
import { Captions, Grade, H, Transitions, W, whipBlur } from "./overlay/ui";
import "../theme";

export type FilmProps = {
  /** documentary subtitles for the narration */
  readonly captions: boolean;
  /** file in public/audio; empty renders silent */
  readonly soundtrack: string;
};

export const Film: React.FC<FilmProps> = ({ captions, soundtrack }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const s = Math.min(width / W, height / H);
  const blur = whipBlur(frame) * s;
  return (
    <AbsoluteFill style={{ backgroundColor: "#02070C" }}>
      {soundtrack ? <Audio src={staticFile(`audio/${soundtrack}`)} /> : null}
      <AbsoluteFill style={{ filter: blur > 0.2 ? `blur(${blur.toFixed(2)}px)` : undefined }}>
        <World width={width} height={height} />
      </AbsoluteFill>
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
        <Overlays />
        <Plates />
        <Showcase />
        <TopLayer />
        <Transitions />
        <Grade />
        <Watermark />
        {captions ? <Captions /> : null}
        <EndCard />
        <LogoIntro />
      </div>
    </AbsoluteFill>
  );
};
