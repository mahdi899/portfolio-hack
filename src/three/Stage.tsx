import { Suspense, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { VolumetricField } from "./VolumetricField";
import { initPointer } from "./pointerStore";

const BG_VOID = "#05060a";

export interface StageProps {
  particles: number;
  energy: number;
  reduced: boolean;
  bloom: boolean;
  dpr: [number, number];
}

/**
 * The single global WebGL canvas living behind the whole document. Default
 * export so it can be code-split with React.lazy and skipped entirely on
 * low-end devices.
 */
export default function Stage({ particles, energy, reduced, dpr }: StageProps) {
  useEffect(() => {
    initPointer();
  }, []);

  return (
    <Canvas
      className="webgl-stage"
      dpr={dpr}
      gl={{
        antialias: false,
        alpha: false,
        powerPreference: "high-performance",
        stencil: false,
        depth: true,
      }}
      onCreated={({ gl, scene }) => {
        gl.setClearColor(0x05060a, 1);
        gl.domElement.style.background = BG_VOID;
        scene.background = new THREE.Color(BG_VOID);
        scene.fog = new THREE.FogExp2(BG_VOID, 0.028);
      }}
      camera={{ position: [0, 0, 16], fov: 55 }}
      frameloop={reduced ? "demand" : "always"}
    >
      <Suspense fallback={null}>
        <VolumetricField particles={particles} energy={energy} reduced={reduced} />
      </Suspense>
    </Canvas>
  );
}
