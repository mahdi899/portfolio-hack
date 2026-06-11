import AICore from "./AICore";
import Galaxy from "./Galaxy";
import Nebula from "./Nebula";
import OrbitLayer from "./OrbitLayer";
import CameraRig from "./CameraRig";
import Effects from "./Effects";
import { LAYERS } from "./data";

export default function Experience() {
  return (
    <>
      <color attach="background" args={["#030014"]} />

      <ambientLight intensity={0.18} color="#6d5bd0" />
      <directionalLight position={[40, 30, 60]} intensity={0.5} color="#4f6bff" />
      <pointLight position={[0, 26, 0]} intensity={160} distance={90} decay={1.8} color="#22d3ee" />

      <CameraRig />
      <Galaxy />
      <Nebula />
      <AICore />

      {LAYERS.map((layer) => (
        <OrbitLayer key={layer.id} layer={layer} />
      ))}

      <Effects />
    </>
  );
}
