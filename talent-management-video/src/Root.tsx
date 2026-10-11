import type React from "react";
import { Composition } from "remotion";
import { Film, type FilmProps } from "./film/Film";
import { FPS, TOTAL_FRAMES } from "./film/timeline";

const defaults: FilmProps = { captions: true, soundtrack: "soundtrack.mp3" };

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="TalentManagement"
        component={Film}
        durationInFrames={TOTAL_FRAMES}
        fps={FPS}
        width={1920}
        height={1080}
        defaultProps={defaults}
      />
      <Composition
        id="TalentManagement-4K"
        component={Film}
        durationInFrames={TOTAL_FRAMES}
        fps={FPS}
        width={3840}
        height={2160}
        defaultProps={defaults}
      />
    </>
  );
};
