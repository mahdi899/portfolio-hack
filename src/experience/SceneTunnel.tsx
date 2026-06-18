import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import StreamPoints from "./StreamPoints";
import { journey, sceneFade, COUNT } from "./store";
import { P } from "./palette";

const WALL_VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const WALL_FRAG = /* glsl */ `
uniform float uTime, uOpacity;
varying vec2 vUv;
void main() {
  // longitudinal data rails
  float rails = smoothstep(0.95, 1.0, abs(sin(vUv.x * 3.14159 * 22.0)));
  // travelling rings
  float mov = fract(vUv.y * 14.0 + uTime * 0.45);
  float ring = smoothstep(0.86, 1.0, 1.0 - abs(mov - 0.5) * 2.0);
  vec3 colA = vec3(0.36, 0.23, 0.85);
  vec3 colB = vec3(0.13, 0.72, 0.86);
  vec3 col = mix(colA, colB, vUv.y) * (rails * 0.3 + ring * 1.25);
  float a = (rails * 0.1 + ring * 0.5) * uOpacity;
  if (a < 0.004) discard;
  gl_FragColor = vec4(col, a);
}
`;

const RING_Z = Array.from({ length: 13 }, (_, i) => 28 - i * 14.5);

export default function SceneTunnel() {
  const group = useRef<THREE.Group>(null);
  const caps = useRef<THREE.InstancedMesh>(null);
  const op = () => sceneFade(journey.smooth, "tunnel", 0.18, 0.2);

  const wallUniforms = useMemo(
    () => ({ uTime: { value: 0 }, uOpacity: { value: 0 } }),
    []
  );

  const n = COUNT(40);
  const bits = useMemo(
    () =>
      Array.from({ length: n }, () => ({
        ang: Math.random() * Math.PI * 2,
        r: 3.4 + Math.random() * 2.6,
        z: 35 - Math.random() * 190,
        speed: 26 + Math.random() * 30,
        spin: (Math.random() - 0.5) * 2,
      })),
    [n]
  );
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state, dt) => {
    if (!group.current) return;
    const w = op();
    group.current.visible = w > 0.004;
    if (!group.current.visible) return;
    const t = state.clock.elapsedTime;
    wallUniforms.uTime.value = t;
    wallUniforms.uOpacity.value = w;

    group.current.children.forEach((ch) => {
      const mesh = ch as THREE.Mesh;
      const m = mesh.material as THREE.MeshBasicMaterial;
      if (m?.userData?.base !== undefined) m.opacity = m.userData.base * w;
      if (mesh.userData.ringSpin) mesh.rotation.z = t * mesh.userData.ringSpin;
    });

    if (caps.current) {
      bits.forEach((b, i) => {
        b.z -= b.speed * dt;
        if (b.z < -158) b.z = 38;
        dummy.position.set(Math.cos(b.ang) * b.r, Math.sin(b.ang) * b.r, b.z);
        dummy.rotation.set(0, 0, b.ang + t * b.spin);
        dummy.scale.setScalar(1);
        dummy.updateMatrix();
        caps.current!.setMatrixAt(i, dummy.matrix);
      });
      caps.current.instanceMatrix.needsUpdate = true;
      (caps.current.material as THREE.MeshBasicMaterial).opacity = 0.85 * w;
    }
  });

  return (
    <group ref={group}>
      {/* tunnel walls */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -60]}>
        <cylinderGeometry args={[7.6, 7.6, 192, 72, 48, true]} />
        <shaderMaterial
          uniforms={wallUniforms}
          vertexShader={WALL_VERT}
          fragmentShader={WALL_FRAG}
          transparent
          side={THREE.BackSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* gate rings along the way */}
      {RING_Z.map((z, i) => (
        <mesh key={z} position={[0, 0, z]} userData={{ ringSpin: i % 2 ? 0.18 : -0.14 }}>
          <torusGeometry args={[7.1, 0.05, 8, 72]} />
          <meshBasicMaterial
            color={i % 2 ? P.cyan : P.purple}
            transparent
            opacity={0.55}
            userData={{ base: 0.55 }}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}

      {/* data streams racing down the tunnel */}
      {[0.3, 1.4, 2.6, 3.9, 5.1].map((ang, i) => (
        <StreamPoints
          key={i}
          p0={[Math.cos(ang) * 5.4, Math.sin(ang) * 5.4, 36]}
          p1={[Math.cos(ang + 0.5) * 5.0, Math.sin(ang + 0.5) * 5.0, -60]}
          p2={[Math.cos(ang + 1.0) * 5.4, Math.sin(ang + 1.0) * 5.4, -156]}
          color={i % 2 ? P.cyan : P.purpleSoft}
          color2={i % 2 ? P.mint : P.cyan}
          count={190}
          size={1.9}
          speed={0.3}
          jitter={0.3}
          getOpacity={op}
        />
      ))}

      {/* CRM record bits flying past */}
      <instancedMesh ref={caps} args={[undefined, undefined, n]} frustumCulled={false}>
        <boxGeometry args={[0.26, 0.26, 1.5]} />
        <meshBasicMaterial color={P.cyanSoft} transparent opacity={0.85} toneMapped={false} />
      </instancedMesh>
    </group>
  );
}
