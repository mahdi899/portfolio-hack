import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import StreamPoints from "./StreamPoints";
import { journey, sceneFade } from "./store";
import { haloTexture } from "./textures";
import { P } from "./palette";

export interface PortalDef {
  id: string;
  pos: [number, number, number];
  color: string;
  color2: string;
}

/** matches the DOM channel labels (left: IG / Ads / Content, right: Landing / Telegram) */
export const PORTALS: PortalDef[] = [
  { id: "instagram", pos: [-26, 7.5, -4], color: P.pink, color2: P.purple },
  { id: "ads", pos: [-29, -1, 2], color: P.purple, color2: P.violet },
  { id: "content", pos: [-23, -9, 4], color: P.purpleSoft, color2: P.purple },
  { id: "landing", pos: [25, 4.5, -2], color: P.cyan, color2: "#0e7490" },
  { id: "telegram", pos: [27, -6.5, 2], color: P.cyanSoft, color2: P.mint },
];

export default function SceneTraffic() {
  const group = useRef<THREE.Group>(null);
  const glow = useMemo(() => haloTexture("#ffffff"), []);
  const op = () => sceneFade(journey.smooth, "traffic");

  useFrame((state) => {
    if (!group.current) return;
    const w = op();
    group.current.visible = w > 0.004;
    if (!group.current.visible) return;
    const t = state.clock.elapsedTime;
    group.current.children.forEach((portal, i) => {
      const pulse = 1 + Math.sin(t * 1.6 + i * 1.7) * 0.05;
      portal.scale.setScalar(pulse);
      portal.children.forEach((ch) => {
        const mesh = ch as THREE.Mesh;
        const m = mesh.material as THREE.MeshBasicMaterial | THREE.SpriteMaterial;
        if (m?.userData?.base !== undefined) m.opacity = m.userData.base * w;
        if (mesh.userData.spin) mesh.rotation.z = t * mesh.userData.spin;
      });
    });
  });

  return (
    <>
      <group ref={group}>
        {PORTALS.map((pt) => (
          <group key={pt.id} position={pt.pos}>
            <mesh userData={{ spin: 0.5 }}>
              <torusGeometry args={[2.5, 0.07, 12, 72]} />
              <meshBasicMaterial
                color={pt.color}
                transparent
                opacity={0.95}
                userData={{ base: 0.95 }}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
              />
            </mesh>
            <mesh userData={{ spin: -0.3 }} scale={1.28}>
              <torusGeometry args={[2.5, 0.025, 8, 72]} />
              <meshBasicMaterial
                color={pt.color}
                transparent
                opacity={0.4}
                userData={{ base: 0.4 }}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
              />
            </mesh>
            {/* inner energy disc */}
            <sprite scale={[5.4, 5.4, 1]}>
              <spriteMaterial
                map={glow}
                color={pt.color}
                transparent
                opacity={0.42}
                userData={{ base: 0.42 }}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
              />
            </sprite>
          </group>
        ))}
      </group>

      {/* particle beams into the core */}
      {PORTALS.map((pt) => {
        const mid: [number, number, number] = [
          pt.pos[0] * 0.45,
          pt.pos[1] * 0.45 + 2.5,
          pt.pos[2] * 0.5 + 7,
        ];
        return (
          <StreamPoints
            key={pt.id}
            p0={pt.pos}
            p1={mid}
            p2={[0, 0, 0]}
            color={pt.color}
            color2={pt.color2}
            count={170}
            size={2.0}
            speed={0.085}
            jitter={0.55}
            getOpacity={op}
          />
        );
      })}
    </>
  );
}
