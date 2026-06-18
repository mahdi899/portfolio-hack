import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import StreamPoints from "./StreamPoints";
import { journey, sceneFade } from "./store";
import { screenTexture, labelTexture, haloTexture } from "./textures";
import { P } from "./palette";
import { CHAMBER_Z } from "./SceneCrm";

const Z = CHAMBER_Z + 1;

const SCREENS = [
  {
    pos: [-5.2, 2.6, Z + 0.4] as const,
    rotY: 0.42,
    accent: P.gold,
    header: "Hot Lead — Sara M.",
    rows: [
      ["Intent", "High · 92"],
      ["Source", "Instagram DM"],
      ["Status", "Ready to Call"],
      ["Context", "Asked for pricing"],
    ] as [string, string][],
  },
  {
    pos: [0, 3.1, Z - 1.2] as const,
    rotY: 0,
    accent: P.mint,
    header: "Pipeline",
    rows: [
      ["Queue", "4 hot leads"],
      ["Booked", "09:30 · 11:00"],
      ["Next action", "Call now"],
      ["Owner", "Sales Team"],
    ] as [string, string][],
  },
  {
    pos: [5.2, 2.6, Z + 0.4] as const,
    rotY: -0.42,
    accent: P.cyan,
    header: "Lead Context",
    rows: [
      ["History", "3 touchpoints"],
      ["CRM", "Synced"],
      ["Follow-up", "Scheduled"],
      ["Score trend", "Rising"],
    ] as [string, string][],
  },
];

export default function SceneHuman() {
  const group = useRef<THREE.Group>(null);
  const queue = useRef<THREE.InstancedMesh>(null);
  const halo = useMemo(() => haloTexture(P.mint), []);
  const teamLabel = useMemo(() => labelTexture("Sales Team", { color: P.mint, sub: "human close" }), []);
  const screens = useMemo(() => SCREENS.map((s) => screenTexture(s.header, s.rows, s.accent)), []);
  const op = () => sceneFade(journey.smooth, "human");
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const gold = useMemo(() => new THREE.Color(P.gold).multiplyScalar(1.6), []);

  useFrame((state) => {
    if (!group.current) return;
    const w = op();
    group.current.visible = w > 0.004;
    if (!group.current.visible) return;
    const t = state.clock.elapsedTime;

    group.current.traverse((ch) => {
      const m = (ch as THREE.Mesh).material as THREE.MeshBasicMaterial | THREE.SpriteMaterial;
      if (m?.userData?.base !== undefined) m.opacity = m.userData.base * w;
    });

    if (queue.current) {
      for (let i = 0; i < 5; i++) {
        const pulse = i === 0 ? 1 + Math.sin(t * 3) * 0.15 : 1;
        dummy.position.set(-3 + i * 1.5, 0.9 + Math.sin(t * 1.3 + i) * 0.12, Z + 2.4);
        dummy.rotation.set(0, 0, Math.PI / 2);
        dummy.scale.setScalar(0.8 * pulse);
        dummy.updateMatrix();
        queue.current.setMatrixAt(i, dummy.matrix);
        queue.current.setColorAt(i, i === 0 ? gold : new THREE.Color(P.gold));
      }
      queue.current.instanceMatrix.needsUpdate = true;
      if (queue.current.instanceColor) queue.current.instanceColor.needsUpdate = true;
      (queue.current.material as THREE.MeshBasicMaterial).opacity = 0.95 * w;
    }
  });

  return (
    <group ref={group}>
      {/* holographic console screens */}
      {SCREENS.map((s, i) => (
        <mesh key={s.header} position={s.pos as unknown as [number, number, number]} rotation={[0, s.rotY, 0]}>
          <planeGeometry args={[4.6, 3.25]} />
          <meshBasicMaterial map={screens[i]} transparent opacity={0.96} userData={{ base: 0.96 }} depthWrite={false} side={THREE.DoubleSide} />
        </mesh>
      ))}

      {/* command desk */}
      <mesh position={[0, 0.55, Z + 1.6]}>
        <boxGeometry args={[10.5, 0.18, 1.7]} />
        <meshBasicMaterial color="#0b0e22" transparent opacity={0.95} userData={{ base: 0.95 }} />
      </mesh>
      <mesh position={[0, 0.66, Z + 1.6]}>
        <boxGeometry args={[10.5, 0.015, 1.7]} />
        <meshBasicMaterial color={P.mint} transparent opacity={0.28} userData={{ base: 0.28 }} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>

      {/* operator station marker */}
      <mesh position={[0, -3.3, Z + 4.6]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.35, 0.05, 8, 64]} />
        <meshBasicMaterial color={P.mint} transparent opacity={0.8} userData={{ base: 0.8 }} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <sprite position={[0, -2.2, Z + 4.6]} scale={[5, 5, 1]}>
        <spriteMaterial map={halo} transparent opacity={0.18} userData={{ base: 0.18 }} depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>
      <sprite position={[0, -1.7, Z + 4.8]} scale={[5.6, 1.4, 1]}>
        <spriteMaterial map={teamLabel} transparent opacity={0.95} userData={{ base: 0.95 }} depthWrite={false} />
      </sprite>

      {/* hot leads arriving from the system */}
      <StreamPoints
        p0={[-26, 9, Z + 10]}
        p1={[-13, 4.5, Z + 4]}
        p2={[-3, 1.4, Z + 2.4]}
        color={P.gold}
        color2="#fde68a"
        count={120}
        size={2.0}
        speed={0.1}
        jitter={0.4}
        getOpacity={op}
      />
      <StreamPoints
        p0={[24, 10, Z + 8]}
        p1={[12, 5, Z + 3]}
        p2={[3, 1.4, Z + 2.4]}
        color={P.gold}
        color2={P.mint}
        count={80}
        size={1.7}
        speed={0.08}
        jitter={0.35}
        getOpacity={op}
      />

      {/* queued hot-lead capsules on the desk */}
      <instancedMesh ref={queue} args={[undefined, undefined, 5]} frustumCulled={false}>
        <capsuleGeometry args={[0.2, 0.5, 4, 10]} />
        <meshBasicMaterial toneMapped={false} transparent opacity={0.95} />
      </instancedMesh>
    </group>
  );
}
