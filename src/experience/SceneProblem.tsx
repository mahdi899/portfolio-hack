import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import StreamPoints from "./StreamPoints";
import { journey, sceneFade } from "./store";
import { haloTexture } from "./textures";
import { P } from "./palette";

/** dark sinks where leads disappear */
const HOLES: [number, number, number][] = [
  [-17, -5.5, 4],
  [-6, -7.5, 9],
  [7, -6.5, 7],
  [16, -4.5, 0],
];

/** lead streams pouring in from the horizon, each ending in a sink */
const STREAMS = [
  { from: [-38, 5, -55], hole: 0, color: P.purpleSoft, color2: P.purple },
  { from: [-14, 6.5, -60], hole: 1, color: P.purple, color2: P.violet },
  { from: [6, 6, -58], hole: 2, color: P.cyan, color2: "#0e7490" },
  { from: [28, 4.5, -50], hole: 3, color: P.cyanSoft, color2: P.cyan },
  { from: [-27, 3, -45], hole: 1, color: P.pink, color2: P.purple },
  { from: [19, 2.5, -46], hole: 2, color: P.purpleSoft, color2: P.cyan },
] as const;

export default function SceneProblem() {
  const group = useRef<THREE.Group>(null);
  const rim = useMemo(() => haloTexture(P.purple), []);
  const op = () => sceneFade(journey.smooth, "problem");

  useFrame((state) => {
    if (!group.current) return;
    const w = op();
    group.current.visible = w > 0.004;
    if (!group.current.visible) return;
    const t = state.clock.elapsedTime;
    group.current.children.forEach((hole, i) => {
      hole.rotation.y = t * (0.4 + i * 0.07);
      hole.children.forEach((ch) => {
        const m = (ch as THREE.Mesh).material as THREE.MeshBasicMaterial;
        if (m?.userData?.base !== undefined) m.opacity = m.userData.base * w;
      });
    });
  });

  return (
    <>
      <group ref={group}>
        {HOLES.map((pos, i) => (
          <group key={i} position={pos}>
            {/* void disc */}
            <mesh rotation={[-Math.PI / 2.3, 0, 0]}>
              <circleGeometry args={[2.3, 48]} />
              <meshBasicMaterial color="#02020a" transparent opacity={0.95} userData={{ base: 0.95 }} />
            </mesh>
            {/* glowing rim */}
            <mesh rotation={[-Math.PI / 2.3, 0, 0]}>
              <torusGeometry args={[2.35, 0.05, 8, 64]} />
              <meshBasicMaterial
                color={P.purple}
                transparent
                opacity={0.85}
                userData={{ base: 0.85 }}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
              />
            </mesh>
            {/* under-glow */}
            <sprite scale={[7, 7, 1]} position={[0, -0.4, 0]}>
              <spriteMaterial
                map={rim}
                transparent
                opacity={0.22}
                userData={{ base: 0.22 }}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
              />
            </sprite>
          </group>
        ))}
      </group>

      {STREAMS.map((s, i) => {
        const h = HOLES[s.hole];
        const mid: [number, number, number] = [
          (s.from[0] + h[0]) / 2,
          (s.from[1] + h[1]) / 2 + 1.2,
          (s.from[2] + h[2]) / 2 + 5,
        ];
        return (
          <StreamPoints
            key={i}
            p0={s.from as unknown as [number, number, number]}
            p1={mid}
            p2={h}
            color={s.color}
            color2={s.color2}
            count={210}
            size={1.8}
            speed={0.055 + i * 0.008}
            jitter={0.55}
            sink
            getOpacity={op}
          />
        );
      })}
    </>
  );
}
