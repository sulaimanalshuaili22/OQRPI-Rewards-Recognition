import type React from "react";
import { Composition } from "remotion";
import { Film, type FilmProps } from "./film/Film";
import { FPS, TOTAL_FRAMES } from "./film/timeline";
import { Film5, type Film5Props } from "./v5/Film5";
import { TOTAL_FRAMES as TOTAL_FRAMES_V5 } from "./v5/timeline";

const defaults: FilmProps = { captions: true, soundtrack: "soundtrack.mp3" };
const defaultsV5: Film5Props = { captions: true, soundtrack: "soundtrack-v5.mp3" };

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
      {/* v5 "The Handover": the three-minute hero cut */}
      <Composition
        id="TalentManagement-v5"
        component={Film5}
        durationInFrames={TOTAL_FRAMES_V5}
        fps={FPS}
        width={1920}
        height={1080}
        defaultProps={defaultsV5}
      />
      <Composition
        id="TalentManagement-v5-4K"
        component={Film5}
        durationInFrames={TOTAL_FRAMES_V5}
        fps={FPS}
        width={3840}
        height={2160}
        defaultProps={defaultsV5}
      />
    </>
  );
};
