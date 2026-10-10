import type React from "react";
import { useMemo } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { ThreeCanvas } from "@remotion/three";
import {
  Bloom,
  ChromaticAberration,
  DepthOfField,
  EffectComposer,
  ToneMapping,
} from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { useCurrentFrame } from "remotion";
import { cameraAt } from "../camera";
import { Dust } from "./Constellation";
import { Active } from "./primitives";
import {
  CriticalSet,
  EcosystemSet,
  FutureSet,
  LeadershipSet,
  NationalizationSet,
  NineBoxSet,
  OpeningSet,
  OverviewSet,
  PerformanceSet,
  PlatformSet,
  RewardsSet,
  SecondmentSet,
  SuccessionSet,
  WhySet,
} from "./Sets";
import { SCENES, type SceneId } from "../timeline";

/** Drives the R3F camera and fog from the deterministic camera path. */
const CameraRig: React.FC = () => {
  const frame = useCurrentFrame();
  const { camera, scene, size } = useThree();
  const c = cameraAt(frame);
  const cam = camera as THREE.PerspectiveCamera;
  cam.position.set(c.pos[0], c.pos[1], c.pos[2]);
  cam.fov = c.fov;
  cam.aspect = size.width / size.height;
  cam.near = 0.1;
  cam.far = 900;
  cam.lookAt(c.look[0], c.look[1], c.look[2]);
  cam.updateProjectionMatrix();
  cam.updateMatrixWorld();
  if (scene.fog instanceof THREE.FogExp2) scene.fog.density = c.fog;
  return null;
};

/** Procedural studio environment for realistic reflections on metal and glass. */
const Environment: React.FC = () => {
  const { gl, scene } = useThree();
  useMemo(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    scene.environmentIntensity = 0.35;
    pmrem.dispose();
  }, [gl, scene]);
  return null;
};

const SKY_VERT = /* glsl */ `
  varying vec3 vDir;
  void main() {
    vDir = normalize(position);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const SKY_FRAG = /* glsl */ `
  uniform vec3 uTop;
  uniform vec3 uHorizon;
  uniform vec3 uGlow;
  uniform vec3 uGlowDir;
  varying vec3 vDir;
  void main() {
    float h = clamp(vDir.y * 0.5 + 0.5, 0.0, 1.0);
    vec3 col = mix(uHorizon, uTop, smoothstep(0.42, 0.85, h));
    float g = max(dot(normalize(vDir), normalize(uGlowDir)), 0.0);
    float band = exp(-pow((vDir.y - 0.02) * 7.0, 2.0));
    col += uGlow * (pow(g, 3.0) * 0.9 + pow(g, 24.0) * 1.6) * (0.35 + 0.65 * band);
    gl_FragColor = vec4(col, 1.0);
  }
`;

/** Gradient sky dome that follows the camera (never fogged). */
const Sky: React.FC<{ readonly glow: number }> = ({ glow }) => {
  const frame = useCurrentFrame();
  const c = cameraAt(frame);
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: SKY_VERT,
        fragmentShader: SKY_FRAG,
        uniforms: {
          uTop: { value: new THREE.Color("#010409") },
          uHorizon: { value: new THREE.Color("#06202c") },
          uGlow: { value: new THREE.Color(0, 0, 0) },
          uGlowDir: { value: new THREE.Vector3(0, 0.05, -1) },
        },
        side: THREE.BackSide,
        depthWrite: false,
        fog: false,
      }),
    [],
  );
  (mat.uniforms.uGlow.value as THREE.Color).setRGB(0.5 * glow, 0.17 * glow, 0.01 * glow);
  return (
    <mesh position={c.pos as unknown as [number, number, number]} material={mat} renderOrder={-1}>
      <sphereGeometry args={[800, 32, 16]} />
    </mesh>
  );
};

/** Mount a set from slightly before its scene until just after (camera flights overlap). */
const SetWindow: React.FC<{
  readonly id: SceneId;
  readonly before?: number;
  readonly after?: number;
  readonly children: React.ReactNode;
}> = ({ id, before = 75, after = 75, children }) => (
  <Active from={SCENES[id].start - before} to={SCENES[id].end + after}>
    {children}
  </Active>
);

const Post: React.FC = () => {
  const frame = useCurrentFrame();
  const c = cameraAt(frame);
  const ca = useMemo(() => new THREE.Vector2(0.0006, 0.0004), []);
  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      <DepthOfField worldFocusDistance={c.focus} worldFocusRange={Math.max(2, c.focus * 0.55)} bokehScale={c.bokeh} />
      <Bloom intensity={1.15} luminanceThreshold={0.92} luminanceSmoothing={0.2} mipmapBlur radius={0.78} />
      <ChromaticAberration offset={ca} radialModulation modulationOffset={0.35} />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
    </EffectComposer>
  );
};

export const World: React.FC<{ readonly width: number; readonly height: number }> = ({ width, height }) => {
  const frame = useCurrentFrame();
  const c = cameraAt(frame);
  const dawn =
    frame > SCENES.future.start
      ? Math.min(1, (frame - SCENES.future.start) / 240)
      : 0;
  return (
    <ThreeCanvas
      width={width}
      height={height}
      gl={{ antialias: false, powerPreference: "high-performance", localClippingEnabled: true } as never}
      camera={{ fov: 30, near: 0.1, far: 900, position: [0, 0, 6] }}
    >
      <color attach="background" args={["#02070C"]} />
      <fogExp2 attach="fog" args={["#03111A", 0.011]} />
      <Environment />
      <CameraRig />
      <Sky glow={dawn} />
      <ambientLight intensity={0.12} />
      <hemisphereLight args={["#2a5a6e", "#02070C", 0.9]} />
      <directionalLight position={[30, 60, 25]} intensity={1.2} color="#d6ecff" />
      <directionalLight position={[-40, 20, -60]} intensity={0.6} color="#ff9a50" />
      <Dust camPos={c.pos} />

      <SetWindow id="opening" before={0} after={90}>
        <OpeningSet />
      </SetWindow>
      <SetWindow id="why">
        <WhySet />
      </SetWindow>
      <SetWindow id="ecosystem">
        <EcosystemSet />
      </SetWindow>
      <SetWindow id="performance">
        <PerformanceSet />
      </SetWindow>
      <SetWindow id="ninebox">
        <NineBoxSet />
      </SetWindow>
      <SetWindow id="critical">
        <CriticalSet />
      </SetWindow>
      <SetWindow id="succession">
        <SuccessionSet />
      </SetWindow>
      <SetWindow id="leadership">
        <LeadershipSet />
      </SetWindow>
      <SetWindow id="nationalization">
        <NationalizationSet />
      </SetWindow>
      <SetWindow id="secondment">
        <SecondmentSet />
      </SetWindow>
      <SetWindow id="rewards">
        <RewardsSet />
      </SetWindow>
      <SetWindow id="platform">
        <PlatformSet />
      </SetWindow>
      <SetWindow id="connections" before={60} after={8}>
        <OverviewSet />
      </SetWindow>
      <SetWindow id="future" before={20} after={0}>
        <FutureSet />
      </SetWindow>
      <Post />
    </ThreeCanvas>
  );
};
