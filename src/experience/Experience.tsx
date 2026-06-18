import CameraRig from "./CameraRig";
import Effects from "./Effects";
import Starfield from "./Starfield";
import GrowthCore from "./GrowthCore";
import SceneProblem from "./SceneProblem";
import SceneTraffic from "./SceneTraffic";
import SceneCapture from "./SceneCapture";
import SceneGate from "./SceneGate";
import SceneAgents from "./SceneAgents";
import SceneTunnel from "./SceneTunnel";
import SceneCrm from "./SceneCrm";
import SceneHuman from "./SceneHuman";
import SceneRevenue from "./SceneRevenue";
import { P } from "./palette";

export default function Experience() {
  return (
    <>
      <color attach="background" args={[P.bg]} />
      <ambientLight intensity={0.3} color="#7d6cd6" />

      <CameraRig />

      {/* outer universe */}
      <Starfield />
      <GrowthCore />
      <SceneProblem />
      <SceneTraffic />
      <SceneCapture />
      <SceneGate />
      <SceneAgents />

      {/* inside the machine */}
      <SceneTunnel />
      <SceneCrm />
      <SceneHuman />

      {/* pull-back finale */}
      <SceneRevenue />

      <Effects />
    </>
  );
}
