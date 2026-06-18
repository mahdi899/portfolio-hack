import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import StreamPoints from "./StreamPoints";
import { journey, sceneFade } from "./store";
import { haloTexture } from "./textures";
import { P } from "./palette";

/** chamber sits deep inside the machine, at the end of the tunnel */
export const CHAMBER_Z = -160;

const FLOOR_VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const FLOOR_FRAG = /* glsl */ `
uniform float uTime, uOpacity;
varying vec2 vUv;
void main() {
  vec2 q = vUv * 2.0 - 1.0;
  float r = length(q);
  if (r > 1.0) discard;
  float rings = smoothstep(0.035, 0.0, abs(fract(r * 8.0 - uTime * 0.08) - 0.5) - 0.46);
  float ang = atan(q.y, q.x);
  float rays = smoothstep(0.985, 1.0, abs(sin(ang * 12.0)));
  float glow = exp(-r * 2.6);
  vec3 col = mix(vec3(0.32, 0.2, 0.8), vec3(0.12, 0.65, 0.8), glow);
  float a = (rings * 0.3 * (1.0 - r) + rays * 0.12 * (1.0 - r) + glow * 0.55) * uOpacity;
  if (a < 0.004) discard;
  gl_FragColor = vec4(col, a);
}
`;

/** where DOM record cards roughly sit on screen — lines reach toward them */
const ANCHORS: [number, number, number][] = [
  [-13, 5, CHAMBER_Z + 2],
  [-15.5, 0.2, CHAMBER_Z + 4],
  [-11, -3.4, CHAMBER_Z + 5],
  [12.5, 5, CHAMBER_Z + 2],
  [15, 0.6, CHAMBER_Z + 4],
  [10.5, -3.2, CHAMBER_Z + 5],
];

const CUBE_POS = new THREE.Vector3(0, 1.5, CHAMBER_Z);

export default function SceneCrm() {
  const group = useRef<THREE.Group>(null);
  const cube = useRef<THREE.Group>(null);
  const halo = useMemo(() => haloTexture(P.cyan), []);

  const floorUniforms = useMemo(
    () => ({ uTime: { value: 0 }, uOpacity: { value: 0 } }),
    []
  );

  /** chamber floor stays visible through the human-close scene too */
  const roomOp = () =>
    Math.max(
      sceneFade(journey.smooth, "crm"),
      sceneFade(journey.smooth, "human") * 0.55
    );
  const op = () => sceneFade(journey.smooth, "crm");

  const tubes = useMemo(
    () =>
      ANCHORS.map((a) => {
        const curve = new THREE.QuadraticBezierCurve3(
          CUBE_POS.clone(),
          new THREE.Vector3(a[0] * 0.5, (a[1] + CUBE_POS.y) * 0.5 + 1.6, (a[2] + CHAMBER_Z) / 2),
          new THREE.Vector3(...a)
        );
        return new THREE.TubeGeometry(curve, 32, 0.028, 6, false);
      }),
    []
  );

  useFrame((state) => {
    if (!group.current) return;
    const w = roomOp();
    const wCube = op();
    group.current.visible = w > 0.004;
    if (!group.current.visible) return;
    const t = state.clock.elapsedTime;
    floorUniforms.uTime.value = t;
    floorUniforms.uOpacity.value = w;

    if (cube.current) {
      cube.current.visible = wCube > 0.004;
      cube.current.rotation.y = t * 0.22;
      cube.current.position.y = CUBE_POS.y + Math.sin(t * 0.7) * 0.18;
      cube.current.children.forEach((ch) => {
        const mesh = ch as THREE.Mesh;
        const m = mesh.material as THREE.MeshBasicMaterial;
        if (m?.userData?.base !== undefined) m.opacity = m.userData.base * wCube;
        if (mesh.userData.counter) mesh.rotation.y = -t * 0.5;
      });
    }

    group.current.children.forEach((ch) => {
      if (!ch.userData.fadeCrm) return;
      const m = (ch as THREE.Mesh).material as THREE.MeshBasicMaterial;
      m.opacity = m.userData.base * wCube;
    });
  });

  return (
    <group ref={group}>
      {/* floor */}
      <mesh position={[0, -3.4, CHAMBER_Z]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[38, 38]} />
        <shaderMaterial
          uniforms={floorUniforms}
          vertexShader={FLOOR_VERT}
          fragmentShader={FLOOR_FRAG}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* data cube */}
      <group ref={cube} position={CUBE_POS.toArray()}>
        <lineSegments>
          <edgesGeometry args={[new THREE.BoxGeometry(4.6, 4.6, 4.6)]} />
          <lineBasicMaterial color={P.cyan} transparent opacity={0.9} userData={{ base: 0.9 }} />
        </lineSegments>
        <lineSegments userData={{ counter: true }}>
          <edgesGeometry args={[new THREE.BoxGeometry(3.3, 3.3, 3.3)]} />
          <lineBasicMaterial color={P.purpleSoft} transparent opacity={0.75} userData={{ base: 0.75 }} />
        </lineSegments>
        <mesh>
          <boxGeometry args={[2.1, 2.1, 2.1]} />
          <meshBasicMaterial color="#171058" transparent opacity={0.55} userData={{ base: 0.55 }} />
        </mesh>
        <sprite scale={[9, 9, 1]}>
          <spriteMaterial map={halo} transparent opacity={0.4} userData={{ base: 0.4 }} depthWrite={false} blending={THREE.AdditiveBlending} />
        </sprite>
      </group>

      {/* light pillar under the cube */}
      <mesh position={[0, -1.6, CHAMBER_Z]} userData={{ fadeCrm: true }}>
        <cylinderGeometry args={[1.5, 2.4, 3.6, 24, 1, true]} />
        <meshBasicMaterial
          color={P.cyan}
          transparent
          opacity={0.07}
          userData={{ base: 0.07 }}
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* connection lines toward the record cards */}
      {tubes.map((g, i) => (
        <mesh key={i} geometry={g} userData={{ fadeCrm: true }}>
          <meshBasicMaterial
            color={i % 2 ? P.purpleSoft : P.cyan}
            transparent
            opacity={0.4}
            userData={{ base: 0.4 }}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}

      {/* pulses travelling along the lines */}
      {ANCHORS.map((a, i) => (
        <StreamPoints
          key={`p-${i}`}
          p0={[CUBE_POS.x, CUBE_POS.y, CUBE_POS.z]}
          p1={[a[0] * 0.5, (a[1] + CUBE_POS.y) * 0.5 + 1.6, (a[2] + CHAMBER_Z) / 2]}
          p2={a}
          color={i % 2 ? P.purpleSoft : P.cyan}
          color2={P.mint}
          count={26}
          size={1.5}
          speed={0.16 + i * 0.02}
          jitter={0.04}
          getOpacity={op}
        />
      ))}

      {/* record glints rising inside the cube */}
      <StreamPoints
        p0={[0, -2.6, CHAMBER_Z]}
        p1={[0, 1.4, CHAMBER_Z]}
        p2={[0, 4.6, CHAMBER_Z]}
        color={P.cyanSoft}
        color2={P.purpleSoft}
        count={130}
        size={1.5}
        speed={0.07}
        jitter={1.5}
        getOpacity={op}
      />
    </group>
  );
}
