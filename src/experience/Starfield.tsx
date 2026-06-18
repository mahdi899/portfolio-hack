import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { journey, sceneFade, COUNT } from "./store";
import { haloTexture } from "./textures";
import { P } from "./palette";

const VERT = /* glsl */ `
attribute float aSize;
attribute float aPhase;
uniform float uTime;
varying float vTw;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vTw = 0.55 + 0.45 * sin(uTime * 0.9 + aPhase);
  gl_PointSize = aSize * (260.0 / max(1.0, -mv.z));
  gl_Position = projectionMatrix * mv;
}
`;

const FRAG = /* glsl */ `
uniform float uOpacity;
uniform vec3 uColor;
varying float vTw;
void main() {
  float m = smoothstep(0.5, 0.08, length(gl_PointCoord - 0.5));
  float a = m * vTw * uOpacity;
  if (a < 0.004) discard;
  gl_FragColor = vec4(uColor, a);
}
`;

/** stars + soft nebula sprites — visible in every "universe" scene */
export default function Starfield() {
  const n = COUNT(1900);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uOpacity: { value: 1 },
      uColor: { value: new THREE.Color("#cdd6ff") },
    }),
    []
  );

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(n * 3);
    const size = new Float32Array(n);
    const phase = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const r = 130 + Math.random() * 240;
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = r * Math.sin(ph) * Math.cos(th);
      pos[i * 3 + 1] = r * Math.cos(ph) * 0.7;
      pos[i * 3 + 2] = r * Math.sin(ph) * Math.sin(th);
      size[i] = 0.5 + Math.random() * 1.6;
      phase[i] = Math.random() * Math.PI * 2;
    }
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aSize", new THREE.BufferAttribute(size, 1));
    g.setAttribute("aPhase", new THREE.BufferAttribute(phase, 1));
    return g;
  }, [n]);

  const nebulaA = useMemo(() => haloTexture(P.violet), []);
  const nebulaB = useMemo(() => haloTexture("#0e7490"), []);
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    const p = journey.smooth;
    const w = Math.max(
      sceneFade(p, "hero"),
      sceneFade(p, "problem"),
      sceneFade(p, "traffic"),
      sceneFade(p, "capture"),
      sceneFade(p, "gate"),
      sceneFade(p, "agents"),
      sceneFade(p, "revenue"),
      sceneFade(p, "cta") * 0.8
    );
    uniforms.uTime.value = state.clock.elapsedTime;
    uniforms.uOpacity.value = w;
    if (group.current) {
      group.current.visible = w > 0.004;
      group.current.rotation.y = state.clock.elapsedTime * 0.004;
      group.current.children.forEach((ch) => {
        if ((ch as THREE.Mesh).isMesh) {
          const m = (ch as THREE.Mesh).material as THREE.MeshBasicMaterial;
          m.opacity = m.userData.base * w;
        }
      });
    }
  });

  return (
    <group ref={group}>
      <points geometry={geometry} frustumCulled={false}>
        <shaderMaterial
          uniforms={uniforms}
          vertexShader={VERT}
          fragmentShader={FRAG}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
      {/* distant nebula washes */}
      <mesh position={[-90, 30, -160]} scale={[150, 100, 1]}>
        <planeGeometry />
        <meshBasicMaterial
          map={nebulaA}
          transparent
          opacity={0.16}
          userData={{ base: 0.16 }}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <mesh position={[100, -20, -180]} scale={[170, 110, 1]}>
        <planeGeometry />
        <meshBasicMaterial
          map={nebulaB}
          transparent
          opacity={0.13}
          userData={{ base: 0.13 }}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}
