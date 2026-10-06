import type React from "react";
import {
  AbsoluteFill,
  Audio,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { LightLeakOverlay } from "./components/LightLeakOverlay";
import voiceTiming from "./voiceover-timing.json";
import { Scene01Opening, SCENE_01_DURATION } from "./scenes/Scene01Opening";
import { Scene02Why, SCENE_02_DURATION } from "./scenes/Scene02Why";
import { Scene03Ecosystem, SCENE_03_DURATION } from "./scenes/Scene03Ecosystem";
import {
  Scene04Performance,
  SCENE_04_DURATION,
} from "./scenes/Scene04Performance";
import { Scene05NineBox, SCENE_05_DURATION } from "./scenes/Scene05NineBox";
import {
  Scene06CriticalRoles,
  SCENE_06_DURATION,
} from "./scenes/Scene06CriticalRoles";
import {
  Scene07Succession,
  SCENE_07_DURATION,
} from "./scenes/Scene07Succession";
import {
  Scene08Leadership,
  SCENE_08_DURATION,
} from "./scenes/Scene08Leadership";
import {
  Scene09Nationalization,
  SCENE_09_DURATION,
} from "./scenes/Scene09Nationalization";
import {
  Scene10Secondment,
  SCENE_10_DURATION,
} from "./scenes/Scene10Secondment";
import { Scene11Rewards, SCENE_11_DURATION } from "./scenes/Scene11Rewards";
import { Scene12Platform, SCENE_12_DURATION } from "./scenes/Scene12Platform";
import {
  Scene13Connections,
  SCENE_13_DURATION,
} from "./scenes/Scene13Connections";
import { Scene14Future, SCENE_14_DURATION } from "./scenes/Scene14Future";

export type TalentManagementVideoProps = {
  // Show the narration text as a lower third. Turn off once the voice-over track is laid in.
  readonly subtitles: boolean;
  // File names inside /public/audio. Leave empty to render without audio.
  readonly musicFile: string;
  readonly voiceFile: string;
};

const TRANSITION = 20;
const LEAK = 34;

export const SCENE_DURATIONS = [
  SCENE_01_DURATION,
  SCENE_02_DURATION,
  SCENE_03_DURATION,
  SCENE_04_DURATION,
  SCENE_05_DURATION,
  SCENE_06_DURATION,
  SCENE_07_DURATION,
  SCENE_08_DURATION,
  SCENE_09_DURATION,
  SCENE_10_DURATION,
  SCENE_11_DURATION,
  SCENE_12_DURATION,
  SCENE_13_DURATION,
  SCENE_14_DURATION,
] as const;

// 13 cut points: 11 crossfade/slide transitions (shorten the timeline) and 2 light-leak overlays (do not).
const TRANSITION_COUNT = 11;

export const TOTAL_DURATION =
  SCENE_DURATIONS.reduce((a, b) => a + b, 0) - TRANSITION_COUNT * TRANSITION;

const fadeT = () => ({
  presentation: fade(),
  timing: linearTiming({ durationInFrames: TRANSITION }),
});

export const TalentManagementVideo: React.FC<TalentManagementVideoProps> = ({
  subtitles,
  musicFile,
  voiceFile,
}) => {
  const { fps, durationInFrames, width, height } = useVideoConfig();
  const frame = useCurrentFrame();
  // Scenes are authored on a 1920x1080 canvas; larger outputs (e.g. 4K UHD) scale it uniformly.
  const canvasScale = Math.min(width / 1920, height / 1080);
  // Music: gentle rise at the start, fade on the tail, and ducked under the narrator.
  const musicBed = interpolate(
    frame,
    [0, 2 * fps, durationInFrames - 6 * fps, durationInFrames - 1],
    [0, 0.85, 0.85, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const t = frame / fps;
  const speaking = voiceFile
    ? voiceTiming.some((w) => t >= w.start - 0.4 && t <= w.end + 0.6)
    : false;
  const musicVolume = musicBed * (speaking ? 0.38 : 1);

  return (
    <AbsoluteFill style={{ backgroundColor: "#02080D" }}>
      {musicFile ? (
        <Audio src={staticFile(`audio/${musicFile}`)} volume={musicVolume} />
      ) : null}
      {voiceFile ? (
        <Audio src={staticFile(`audio/${voiceFile}`)} volume={1} />
      ) : null}

      <div
        style={{
          position: "absolute",
          width: 1920,
          height: 1080,
          left: (width - 1920 * canvasScale) / 2,
          top: (height - 1080 * canvasScale) / 2,
          scale: String(canvasScale),
          transformOrigin: "0 0",
        }}
      >
        <TransitionSeries>
          <TransitionSeries.Sequence
            name="01 The future begins with people"
            durationInFrames={SCENE_01_DURATION}
            premountFor={fps}
          >
            <Scene01Opening subtitles={subtitles} />
          </TransitionSeries.Sequence>
          <TransitionSeries.Transition {...fadeT()} />

          <TransitionSeries.Sequence
            name="02 Why Talent Management"
            durationInFrames={SCENE_02_DURATION}
            premountFor={fps}
          >
            <Scene02Why subtitles={subtitles} />
          </TransitionSeries.Sequence>
          <TransitionSeries.Transition
            presentation={slide({ direction: "from-right" })}
            timing={linearTiming({ durationInFrames: TRANSITION })}
          />

          <TransitionSeries.Sequence
            name="03 The ecosystem"
            durationInFrames={SCENE_03_DURATION}
            premountFor={fps}
          >
            <Scene03Ecosystem subtitles={subtitles} />
          </TransitionSeries.Sequence>
          <TransitionSeries.Overlay durationInFrames={LEAK} premountFor={fps}>
            <LightLeakOverlay seed={3} />
          </TransitionSeries.Overlay>

          <TransitionSeries.Sequence
            name="04 Performance Management"
            durationInFrames={SCENE_04_DURATION}
            premountFor={fps}
          >
            <Scene04Performance subtitles={subtitles} />
          </TransitionSeries.Sequence>
          <TransitionSeries.Transition {...fadeT()} />

          <TransitionSeries.Sequence
            name="05 The 9-Box Matrix"
            durationInFrames={SCENE_05_DURATION}
            premountFor={fps}
          >
            <Scene05NineBox subtitles={subtitles} />
          </TransitionSeries.Sequence>
          <TransitionSeries.Transition {...fadeT()} />

          <TransitionSeries.Sequence
            name="06 Critical Roles"
            durationInFrames={SCENE_06_DURATION}
            premountFor={fps}
          >
            <Scene06CriticalRoles subtitles={subtitles} />
          </TransitionSeries.Sequence>
          <TransitionSeries.Transition {...fadeT()} />

          <TransitionSeries.Sequence
            name="07 Succession Planning"
            durationInFrames={SCENE_07_DURATION}
            premountFor={fps}
          >
            <Scene07Succession subtitles={subtitles} />
          </TransitionSeries.Sequence>
          <TransitionSeries.Transition
            presentation={slide({ direction: "from-bottom" })}
            timing={linearTiming({ durationInFrames: TRANSITION })}
          />

          <TransitionSeries.Sequence
            name="08 Leadership Development"
            durationInFrames={SCENE_08_DURATION}
            premountFor={fps}
          >
            <Scene08Leadership subtitles={subtitles} />
          </TransitionSeries.Sequence>
          <TransitionSeries.Transition {...fadeT()} />

          <TransitionSeries.Sequence
            name="09 Nationalization"
            durationInFrames={SCENE_09_DURATION}
            premountFor={fps}
          >
            <Scene09Nationalization subtitles={subtitles} />
          </TransitionSeries.Sequence>
          <TransitionSeries.Transition {...fadeT()} />

          <TransitionSeries.Sequence
            name="10 Secondment Management"
            durationInFrames={SCENE_10_DURATION}
            premountFor={fps}
          >
            <Scene10Secondment subtitles={subtitles} />
          </TransitionSeries.Sequence>
          <TransitionSeries.Transition {...fadeT()} />

          <TransitionSeries.Sequence
            name="11 Rewards & Recognition"
            durationInFrames={SCENE_11_DURATION}
            premountFor={fps}
          >
            <Scene11Rewards subtitles={subtitles} />
          </TransitionSeries.Sequence>
          <TransitionSeries.Transition {...fadeT()} />

          <TransitionSeries.Sequence
            name="12 The Intelligent Talent Platform"
            durationInFrames={SCENE_12_DURATION}
            premountFor={fps}
          >
            <Scene12Platform subtitles={subtitles} />
          </TransitionSeries.Sequence>
          <TransitionSeries.Transition {...fadeT()} />

          <TransitionSeries.Sequence
            name="13 How everything connects"
            durationInFrames={SCENE_13_DURATION}
            premountFor={fps}
          >
            <Scene13Connections subtitles={subtitles} />
          </TransitionSeries.Sequence>
          <TransitionSeries.Overlay durationInFrames={LEAK} premountFor={fps}>
            <LightLeakOverlay seed={7} hueShift={0} />
          </TransitionSeries.Overlay>

          <TransitionSeries.Sequence
            name="14 The future of OQ RPI"
            durationInFrames={SCENE_14_DURATION}
            premountFor={fps}
          >
            <Scene14Future subtitles={subtitles} />
          </TransitionSeries.Sequence>
        </TransitionSeries>
      </div>
    </AbsoluteFill>
  );
};
