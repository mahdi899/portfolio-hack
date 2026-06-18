import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import StreamPoints from "./StreamPoints";
import { journey, sceneFade } from "./store";
import { labelTexture, haloTexture } from "./textures";
import { P } from "./palette";

interface NodeDef {
  id: string;
  label: string;
  index: string;
  x: number;
  color: string;
}

const NODES: NodeDef[] = [
  { id: "traffic", label: "Traffic", index: "01", x: -28.5, color: P.pink },
  { id: "capture", label: "Capture", index: "02", x: -20, color: P.purpleSoft },
  { id: "qualify", label: "Qualification", index: "03", x: -11.5, color: P.purple },
  { id: "automation", label: "Automation", index: "04", x: 11.5, color: P.cyan },
  { id: "crm", label: "CRM", index: "05", x: 19, color: P.cyanSoft },
  { id: "conversion", label: "Conversion", index: "06", x: 26, color: P.mint },
  { id: "revenue", label: "Revenue", index: "07", x: 33, color: P.gold },
];

export default function SceneRevenue() {
  const group = useRef<THREE.Group>(null);
  const labels = useMemo(
    () => NODES.map((nd) => labelTexture(nd.label, { color: nd.color, sub: nd.index })),
    []
  );
  const glow = useMemo(() => haloTexture("#ffffff"), []);
  const op = () => sceneFade(journey.smooth, "revenue");

  useFrame((state) => {
    if (!group.current) return;
    const w = op();
    group.current.visible = w > 0.004;
    if (!group.current.visible) return;
    const t = state.clock.elapsedTime;
    group.current.traverse((ch) => {
      const mesh = ch as THREE.Mesh;
      const m = mesh.material as THREE.MeshBasicMaterial | THREE.SpriteMaterial;
      if (m?.userData?.base !== undefined) m.opacity = m.userData.base * w;
      if (mesh.userData.spin) mesh.rotation.z = t * mesh.userData.spin;
    });
  });

  return (
    <group ref={group}>
      {/* pipeline rail */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.035, 0.035, 70, 8]} />
        <meshBasicMaterial color={P.purple} transparent opacity={0.5} userData={{ base: 0.5 }} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>

      {/* system nodes */}
      {NODES.map((nd, i) => (
        <group key={nd.id} position={[nd.x, 0, 0]}>
          <mesh userData={{ spin: i % 2 ? 0.25 : -0.25 }}>
            <torusGeometry args={[1.85, 0.05, 10, 64]} />
            <meshBasicMaterial color={nd.color} transparent opacity={0.95} userData={{ base: 0.95 }} depthWrite={false} blending={THREE.AdditiveBlending} />
          </mesh>
          <mesh>
            <circleGeometry args={[1.55, 48]} />
            <meshBasicMaterial color="#070918" transparent opacity={0.88} userData={{ base: 0.88 }} />
          </mesh>
          <sprite scale={[3.4, 3.4, 1]}>
            <spriteMaterial map={glow} color={nd.color} transparent opacity={0.3} userData={{ base: 0.3 }} depthWrite={false} blending={THREE.AdditiveBlending} />
          </sprite>
          <sprite position={[0, -3.8, 0]} scale={[10.5, 2.62, 1]}>
            <spriteMaterial map={labels[i]} transparent opacity={0.95} userData={{ base: 0.95 }} depthWrite={false} />
          </sprite>
        </group>
      ))}

      {/* wide system orbit */}
      <mesh rotation={[Math.PI / 2.14, 0, 0.06]} scale={[1.35, 1, 0.5]}>
        <torusGeometry args={[33, 0.04, 8, 200]} />
        <meshBasicMaterial color={P.purple} transparent opacity={0.3} userData={{ base: 0.3 }} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh rotation={[Math.PI / 2.05, 0, -0.1]} scale={[1.5, 1, 0.42]}>
        <torusGeometry args={[36, 0.03, 8, 200]} />
        <meshBasicMaterial color={P.cyan} transparent opacity={0.18} userData={{ base: 0.18 }} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>

      {/* value flowing left -> core -> right */}
      <StreamPoints
        p0={[-32, 0, 0.4]}
        p1={[-16, 0.6, 1]}
        p2={[-1, 0, 0.4]}
        color={P.pink}
        color2={P.purpleSoft}
        count={130}
        size={1.6}
        speed={0.12}
        jitter={0.18}
        getOpacity={op}
      />
      <StreamPoints
        p0={[1, 0, 0.4]}
        p1={[18, 0.6, 1]}
        p2={[36, 0, 0.4]}
        color={P.cyan}
        color2={P.gold}
        count={130}
        size={1.6}
        speed={0.12}
        jitter={0.18}
        getOpacity={op}
      />
    </group>
  );
}
