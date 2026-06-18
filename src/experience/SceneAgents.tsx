import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import StreamPoints from "./StreamPoints";
import { journey, sceneFade } from "./store";
import { labelTexture } from "./textures";
import { P } from "./palette";

interface AgentDef {
  id: string;
  name: string;
  color: string;
  radius: number;
  speed: number;
  phase: number;
  incline: number;
  tiltZ: number;
  yOff: number;
}

const AGENTS: AgentDef[] = [
  { id: "dm", name: "DM Agent", color: P.pink, radius: 12.5, speed: 0.16, phase: 0.4, incline: 0.32, tiltZ: 0.1, yOff: 2.4 },
  { id: "follow", name: "Follow-Up Agent", color: P.purpleSoft, radius: 14.5, speed: 0.13, phase: 1.6, incline: -0.22, tiltZ: -0.15, yOff: -2 },
  { id: "appt", name: "Appointment Agent", color: P.mint, radius: 16.5, speed: 0.11, phase: 2.8, incline: 0.18, tiltZ: 0.22, yOff: 4.4 },
  { id: "crm", name: "CRM Agent", color: P.cyan, radius: 13.5, speed: 0.145, phase: 4.0, incline: -0.3, tiltZ: 0.05, yOff: -4 },
  { id: "content", name: "Content Agent", color: P.purple, radius: 17.5, speed: 0.095, phase: 5.1, incline: 0.1, tiltZ: -0.26, yOff: 0.8 },
  { id: "revenue", name: "Revenue Agent", color: P.gold, radius: 15.5, speed: 0.12, phase: 0.0, incline: -0.12, tiltZ: 0.3, yOff: -5.4 },
];

export default function SceneAgents() {
  const group = useRef<THREE.Group>(null);
  const agentRefs = useRef<(THREE.Group | null)[]>([]);
  const agentPos = useMemo(() => AGENTS.map(() => new THREE.Vector3(10, 0, 0)), []);
  const labels = useMemo(() => AGENTS.map((a) => labelTexture(a.name, { color: a.color })), []);
  const op = () => sceneFade(journey.smooth, "agents");

  useFrame((state) => {
    if (!group.current) return;
    const w = op();
    group.current.visible = w > 0.004;
    if (!group.current.visible) return;
    const t = state.clock.elapsedTime;

    AGENTS.forEach((a, i) => {
      const g = agentRefs.current[i];
      if (!g) return;
      const ang = t * a.speed * Math.PI * 2 * 0.35 + a.phase;
      const x = Math.cos(ang) * a.radius;
      const z = Math.sin(ang) * a.radius;
      const y = Math.sin(ang) * a.radius * a.incline * 0.5 + a.yOff;
      g.position.set(x, y, z);
      agentPos[i].copy(g.position);
      g.rotation.y = -ang;
      g.children.forEach((ch) => {
        const mesh = ch as THREE.Mesh;
        const m = mesh.material as THREE.MeshBasicMaterial | THREE.SpriteMaterial;
        if (m?.userData?.base !== undefined) m.opacity = m.userData.base * w;
        if (mesh.userData.spin) mesh.rotation.x = t * mesh.userData.spin;
      });
    });

    // orbit path rings
    group.current.children.forEach((ch) => {
      if (!ch.userData.isPath) return;
      const m = (ch as THREE.Mesh).material as THREE.MeshBasicMaterial;
      m.opacity = m.userData.base * w;
    });
  });

  return (
    <group ref={group}>
      {AGENTS.map((a, i) => (
        <group key={a.id} ref={(el) => (agentRefs.current[i] = el)}>
          <mesh userData={{ spin: 0.6 }}>
            <octahedronGeometry args={[0.62, 0]} />
            <meshBasicMaterial color={a.color} transparent opacity={1} userData={{ base: 1 }} toneMapped={false} />
          </mesh>
          <mesh userData={{ spin: -0.4 }}>
            <torusGeometry args={[1.05, 0.035, 8, 48]} />
            <meshBasicMaterial color={a.color} transparent opacity={0.7} userData={{ base: 0.7 }} depthWrite={false} blending={THREE.AdditiveBlending} />
          </mesh>
          <sprite position={[0, 1.8, 0]} scale={[6.6, 1.65, 1]}>
            <spriteMaterial map={labels[i]} transparent opacity={0.95} userData={{ base: 0.95 }} depthWrite={false} />
          </sprite>
        </group>
      ))}

      {/* faint orbit paths */}
      {AGENTS.map((a) => (
        <mesh
          key={`path-${a.id}`}
          position={[0, a.yOff, 0]}
          rotation={[Math.PI / 2 + a.incline * 0.5, 0, a.tiltZ]}
          userData={{ isPath: true }}
        >
          <torusGeometry args={[a.radius, 0.012, 6, 128]} />
          <meshBasicMaterial color={a.color} transparent opacity={0.14} userData={{ base: 0.14 }} depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
      ))}

      {/* work beams: agent <-> core */}
      {AGENTS.map((a, i) => (
        <StreamPoints
          key={`beam-${a.id}`}
          p0={[0, 0, 0]}
          p1={[5, 1, 0]}
          p2={[10, 0, 0]}
          color={a.color}
          count={48}
          size={1.7}
          speed={0.3 + i * 0.03}
          jitter={0.12}
          getOpacity={op}
          onFrame={(h) => {
            h.uniforms.uP2.value.copy(agentPos[i]);
            h.uniforms.uP1.value.copy(agentPos[i]).multiplyScalar(0.5);
            h.uniforms.uP1.value.y += 1.4;
          }}
        />
      ))}
    </group>
  );
}
