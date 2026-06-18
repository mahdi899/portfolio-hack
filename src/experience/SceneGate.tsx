import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import StreamPoints from "./StreamPoints";
import { journey, sceneFade, COUNT } from "./store";
import { haloTexture } from "./textures";
import { P } from "./palette";

interface Lane {
  id: string;
  y: number;
  color: THREE.Color;
  ratio: number;
  hex: string;
}

const LANES: Lane[] = [
  { id: "hot", y: 9, color: new THREE.Color(P.gold).multiplyScalar(1.7), ratio: 0.27, hex: P.gold },
  { id: "warm", y: 3.2, color: new THREE.Color(P.cyan).multiplyScalar(1.5), ratio: 0.41, hex: P.cyan },
  { id: "nurture", y: -2.9, color: new THREE.Color(P.purple).multiplyScalar(1.5), ratio: 0.22, hex: P.purple },
  { id: "filtered", y: -8.6, color: new THREE.Color(P.gray).multiplyScalar(0.7), ratio: 0.1, hex: P.gray },
];

const RAW_COLOR = new THREE.Color(P.purpleSoft).multiplyScalar(1.2);
const X_IN = -34;
const X_OUT = 31;

export default function SceneGate() {
  const group = useRef<THREE.Group>(null);
  const gate = useRef<THREE.Group>(null);
  const inst = useRef<THREE.InstancedMesh>(null);
  const halo = useMemo(() => haloTexture(P.cyan), []);
  const n = COUNT(120);
  const op = () => sceneFade(journey.smooth, "gate");

  const caps = useMemo(() => {
    let li = 0;
    const acc: number[] = [];
    LANES.forEach((l) => acc.push((li += l.ratio)));
    return Array.from({ length: n }, () => {
      const r = Math.random();
      const lane = LANES[acc.findIndex((a) => r <= a) === -1 ? 3 : acc.findIndex((a) => r <= a)];
      return {
        t: Math.random(),
        speed: 0.055 + Math.random() * 0.05,
        yIn: (Math.random() - 0.5) * 15,
        z: (Math.random() - 0.5) * 5,
        lane,
        scale: 0.75 + Math.random() * 0.5,
      };
    });
  }, [n]);

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const colA = useMemo(() => new THREE.Color(), []);

  const posAt = (c: (typeof caps)[number], t: number, out: THREE.Vector3) => {
    if (t < 0.5) {
      const k = t / 0.5;
      const e = k * k * (3 - 2 * k);
      out.set(X_IN + (0 - X_IN) * e, c.yIn * (1 - e), c.z * (1 - e * 0.7));
    } else {
      const k = (t - 0.5) / 0.5;
      const e = k * (2 - k);
      out.set(X_OUT * e, c.lane.y * e, c.z * 0.3 * e);
    }
  };

  const v0 = useMemo(() => new THREE.Vector3(), []);
  const v1 = useMemo(() => new THREE.Vector3(), []);

  useFrame((state, dt) => {
    if (!group.current) return;
    const w = op();
    group.current.visible = w > 0.004;
    if (!group.current.visible) return;
    const t = state.clock.elapsedTime;

    if (gate.current) {
      gate.current.children.forEach((ch) => {
        const mesh = ch as THREE.Mesh;
        const m = mesh.material as THREE.MeshBasicMaterial;
        if (m?.userData?.base !== undefined) m.opacity = m.userData.base * w;
        if (mesh.userData.spin) mesh.rotation.z = t * mesh.userData.spin;
      });
    }

    if (inst.current) {
      caps.forEach((c, i) => {
        c.t += dt * c.speed;
        if (c.t >= 1) {
          c.t = 0;
          c.yIn = (Math.random() - 0.5) * 15;
        }
        posAt(c, c.t, v0);
        posAt(c, Math.min(1, c.t + 0.012), v1);
        v1.sub(v0);
        dummy.position.copy(v0);
        dummy.rotation.set(0, 0, Math.atan2(v1.y, v1.x) - Math.PI / 2);
        const edge = Math.min(1, c.t / 0.06) * (1 - Math.max(0, (c.t - 0.94) / 0.06));
        dummy.scale.setScalar(c.scale * edge * (0.8 + w * 0.2));
        dummy.updateMatrix();
        inst.current!.setMatrixAt(i, dummy.matrix);
        // raw purple in, lane color out — quick blend at the gate
        const k = THREE.MathUtils.smoothstep(c.t, 0.47, 0.55);
        colA.copy(RAW_COLOR).lerp(c.lane.color, k);
        inst.current!.setColorAt(i, colA);
      });
      inst.current.instanceMatrix.needsUpdate = true;
      if (inst.current.instanceColor) inst.current.instanceColor.needsUpdate = true;
    }
  });

  return (
    <group ref={group}>
      {/* the AI gate */}
      <group ref={gate}>
        <mesh userData={{ spin: 0.22 }}>
          <torusGeometry args={[7.2, 0.09, 12, 96]} />
          <meshBasicMaterial color={P.purple} transparent opacity={0.95} userData={{ base: 0.95 }} depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
        <mesh userData={{ spin: -0.34 }}>
          <torusGeometry args={[5.7, 0.06, 12, 96]} />
          <meshBasicMaterial color={P.cyan} transparent opacity={0.8} userData={{ base: 0.8 }} depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
        <mesh userData={{ spin: 0.5 }}>
          <torusGeometry args={[4.4, 0.045, 12, 96]} />
          <meshBasicMaterial color={P.purpleSoft} transparent opacity={0.7} userData={{ base: 0.7 }} depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
        {/* depth disc */}
        <mesh position={[0, 0, -0.4]}>
          <circleGeometry args={[4.3, 64]} />
          <meshBasicMaterial color="#04050f" transparent opacity={0.85} userData={{ base: 0.85 }} />
        </mesh>
        <sprite scale={[16, 16, 1]} position={[0, 0, -0.6]}>
          <spriteMaterial map={halo} transparent opacity={0.3} userData={{ base: 0.3 }} depthWrite={false} blending={THREE.AdditiveBlending} />
        </sprite>
      </group>

      {/* lead capsules */}
      <instancedMesh ref={inst} args={[undefined, undefined, n]} frustumCulled={false}>
        <capsuleGeometry args={[0.17, 0.42, 4, 10]} />
        <meshBasicMaterial toneMapped={false} transparent opacity={0.95} />
      </instancedMesh>

      {/* exit guide streams */}
      {LANES.map((l) => (
        <StreamPoints
          key={l.id}
          p0={[0.5, 0, 0]}
          p1={[X_OUT * 0.5, l.y * 0.62, 0]}
          p2={[X_OUT + 3, l.y * 1.04, 0]}
          color={l.hex}
          count={55}
          size={1.25}
          speed={0.2}
          jitter={0.16}
          getOpacity={op}
        />
      ))}
    </group>
  );
}
