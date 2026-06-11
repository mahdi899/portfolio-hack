import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Billboard } from "@react-three/drei";
import * as THREE from "three";
import { NOISE_GLSL } from "./shaders";

const nebulaVertex = /* glsl */ `
varying vec2 vUv;
void main(){
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const nebulaFragment = /* glsl */ `
uniform float uTime;
uniform float uSeed;
uniform float uOpacity;
uniform vec3 uColor;
varying vec2 vUv;
${NOISE_GLSL}
void main(){
  vec2 q = vUv - 0.5;
  float r = length(q);
  float n  = fbm(vec3(vUv * 3.0 + uSeed * 13.7, uTime * 0.022 + uSeed));
  float n2 = fbm(vec3(vUv * 7.0 - uSeed * 5.1, -uTime * 0.017 + uSeed * 2.0));
  float cloud = pow(max(n * 0.5 + 0.5, 0.0), 2.3) * (0.55 + 0.45 * (n2 * 0.5 + 0.5));
  float falloff = smoothstep(0.5, 0.08, r);
  gl_FragColor = vec4(uColor, cloud * falloff * uOpacity);
}
`;

interface NebulaDef {
  pos: [number, number, number];
  scale: number;
  color: string;
  opacity: number;
  seed: number;
}

const NEBULAS: NebulaDef[] = [
  { pos: [-130, 35, -170], scale: 280, color: "#7c3aed", opacity: 0.55, seed: 1.3 },
  { pos: [150, -25, -210], scale: 320, color: "#3b2f8f", opacity: 0.6, seed: 2.7 },
  { pos: [60, 70, -260], scale: 250, color: "#9333ea", opacity: 0.42, seed: 3.9 },
  { pos: [-170, -55, -130], scale: 230, color: "#0e7490", opacity: 0.34, seed: 5.2 },
  { pos: [10, -95, -240], scale: 300, color: "#6d28d9", opacity: 0.48, seed: 7.7 },
  { pos: [190, 80, -110], scale: 210, color: "#155e75", opacity: 0.26, seed: 9.1 },
  { pos: [-60, 120, -200], scale: 240, color: "#581c87", opacity: 0.4, seed: 11.4 },
];

function NebulaPlane({ def }: { def: NebulaDef }) {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSeed: { value: def.seed },
      uOpacity: { value: def.opacity },
      uColor: { value: new THREE.Color(def.color) },
    }),
    [def]
  );

  useFrame((state) => {
    uniforms.uTime.value = state.clock.elapsedTime;
  });

  return (
    <Billboard position={def.pos}>
      <mesh scale={def.scale}>
        <planeGeometry args={[1, 1]} />
        <shaderMaterial
          ref={mat}
          vertexShader={nebulaVertex}
          fragmentShader={nebulaFragment}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </Billboard>
  );
}

export default function Nebula() {
  return (
    <>
      {NEBULAS.map((n) => (
        <NebulaPlane key={n.seed} def={n} />
      ))}
    </>
  );
}
