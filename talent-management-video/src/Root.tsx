import type React from "react";
import { Composition, Folder } from "remotion";
import { TalentManagementVideo, TOTAL_DURATION } from "./TalentManagementVideo";
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

const FPS = 30;
const WIDTH = 1920;
const HEIGHT = 1080;

const sceneProps = { subtitles: true };

const scenes = [
  { id: "01-Opening", component: Scene01Opening, duration: SCENE_01_DURATION },
  { id: "02-Why", component: Scene02Why, duration: SCENE_02_DURATION },
  {
    id: "03-Ecosystem",
    component: Scene03Ecosystem,
    duration: SCENE_03_DURATION,
  },
  {
    id: "04-Performance",
    component: Scene04Performance,
    duration: SCENE_04_DURATION,
  },
  { id: "05-NineBox", component: Scene05NineBox, duration: SCENE_05_DURATION },
  {
    id: "06-CriticalRoles",
    component: Scene06CriticalRoles,
    duration: SCENE_06_DURATION,
  },
  {
    id: "07-Succession",
    component: Scene07Succession,
    duration: SCENE_07_DURATION,
  },
  {
    id: "08-Leadership",
    component: Scene08Leadership,
    duration: SCENE_08_DURATION,
  },
  {
    id: "09-Nationalization",
    component: Scene09Nationalization,
    duration: SCENE_09_DURATION,
  },
  {
    id: "10-Secondment",
    component: Scene10Secondment,
    duration: SCENE_10_DURATION,
  },
  { id: "11-Rewards", component: Scene11Rewards, duration: SCENE_11_DURATION },
  {
    id: "12-Platform",
    component: Scene12Platform,
    duration: SCENE_12_DURATION,
  },
  {
    id: "13-Connections",
    component: Scene13Connections,
    duration: SCENE_13_DURATION,
  },
  { id: "14-Future", component: Scene14Future, duration: SCENE_14_DURATION },
] as const;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="TalentManagement"
        component={TalentManagementVideo}
        durationInFrames={TOTAL_DURATION}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={{
          subtitles: true,
          musicFile: "music.mp3",
          voiceFile: "voiceover.mp3",
        }}
      />
      {/* Same film at 4K UHD. Every scene is authored in 1080p units and scaled 2x. */}
      <Composition
        id="TalentManagement-4K"
        component={TalentManagementVideo}
        durationInFrames={TOTAL_DURATION}
        fps={FPS}
        width={WIDTH * 2}
        height={HEIGHT * 2}
        defaultProps={{
          subtitles: true,
          musicFile: "music.mp3",
          voiceFile: "voiceover.mp3",
        }}
      />
      <Folder name="Scenes">
        {scenes.map((s) => (
          <Composition
            key={s.id}
            id={s.id}
            component={s.component}
            durationInFrames={s.duration}
            fps={FPS}
            width={WIDTH}
            height={HEIGHT}
            defaultProps={sceneProps}
          />
        ))}
      </Folder>
    </>
  );
};
