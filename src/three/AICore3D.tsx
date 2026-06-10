import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const CORE_VERT = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vView = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;

const CORE_FRAG = /* glsl */ `
  uniform vec3 uInner;
  uniform vec3 uRim;
  uniform float uTime;
  uniform float uEnergy;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    float fres = pow(1.0 - max(dot(vNormal, vView), 0.0), 2.4);
    vec3 col = mix(uInner, uRim, fres);
    float pulse = 0.6 + 0.4 * sin(uTime * 2.0);
    col *= (0.75 + uEnergy * 0.9) * (0.82 + 0.18 * pulse);
    float alpha = fres * 0.85 + 0.28;
    gl_FragColor = vec4(col, alpha);
  }
`;

function CoreSphere({ energyRef, reduced }: { energyRef: React.MutableRefObject<number>; reduced: boolean }) {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uEnergy: { value: 0 },
      uInner: { value: new THREE.Color("#3a0a6b") },
      uRim: { value: new THREE.Color("#c084fc") },
    }),
    []
  );

  useFrame((_, delta) => {
    const u = matRef.current?.uniforms;
    if (!u) return;
    if (!reduced) u.uTime.value += delta;
    u.uEnergy.value += (energyRef.current - u.uEnergy.value) * 0.07;
  });

  return (
    <mesh>
      <icosahedronGeometry args={[1.05, 4]} />
      <shaderMaterial
        ref={matRef}
        uniforms={uniforms}
        vertexShader={CORE_VERT}
        fragmentShader={CORE_FRAG}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

function WireShell({ energyRef, reduced }: { energyRef: React.MutableRefObject<number>; reduced: boolean }) {
  const ref = useRef<THREE.LineSegments>(null);
  const geo = useMemo(() => new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(1.4, 1)), []);
  useFrame((_, delta) => {
    if (!ref.current) return;
    if (!reduced) {
      const s = 0.1 + energyRef.current * 0.4;
      ref.current.rotation.y += delta * (0.2 + s);
      ref.current.rotation.x += delta * 0.08;
    }
  });
  return (
    <lineSegments ref={ref} geometry={geo}>
      <lineBasicMaterial color="#7dd3fc" transparent opacity={0.35} blending={THREE.AdditiveBlending} depthWrite={false} />
    </lineSegments>
  );
}

function Rings({ energyRef, reduced }: { energyRef: React.MutableRefObject<number>; reduced: boolean }) {
  const g = useRef<THREE.Group>(null);
  const rings = useMemo(
    () => [
      { r: 2.0, tube: 0.012, rot: [Math.PI / 2.2, 0, 0], color: "#a855f7", sp: 0.5 },
      { r: 2.5, tube: 0.01, rot: [Math.PI / 1.7, Math.PI / 4, 0], color: "#38bdf8", sp: -0.35 },
      { r: 3.0, tube: 0.008, rot: [Math.PI / 2.6, -Math.PI / 5, Math.PI / 6], color: "#22e3a3", sp: 0.22 },
    ],
    []
  );
  useFrame((_, delta) => {
    if (!g.current || reduced) return;
    const boost = 1 + energyRef.current * 1.6;
    g.current.children.forEach((c, i) => {
      c.rotation.z += delta * rings[i].sp * boost;
    });
  });
  return (
    <group ref={g}>
      {rings.map((rg, i) => (
        <mesh key={i} rotation={rg.rot as [number, number, number]}>
          <torusGeometry args={[rg.r, rg.tube, 12, 120]} />
          <meshBasicMaterial color={rg.color} transparent opacity={0.9} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}

function Electrons({ energyRef, reduced }: { energyRef: React.MutableRefObject<number>; reduced: boolean }) {
  const g = useRef<THREE.Group>(null);
  const orbits = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => ({
        r: 1.9 + (i % 3) * 0.55,
        speed: 0.4 + Math.random() * 0.7,
        phase: Math.random() * Math.PI * 2,
        tilt: (i / 7) * Math.PI,
        color: ["#c084fc", "#7dd3fc", "#5eead4"][i % 3],
      })),
    []
  );
  const t = useRef(0);
  useFrame((_, delta) => {
    if (!g.current) return;
    if (!reduced) t.current += delta * (1 + energyRef.current * 1.4);
    g.current.children.forEach((c, i) => {
      const o = orbits[i];
      const a = t.current * o.speed + o.phase;
      const x = Math.cos(a) * o.r;
      const z = Math.sin(a) * o.r;
      c.position.set(x, Math.sin(a) * Math.sin(o.tilt) * o.r * 0.5, z * Math.cos(o.tilt));
    });
  });
  return (
    <group ref={g}>
      {orbits.map((o, i) => (
        <mesh key={i}>
          <sphereGeometry args={[0.05, 12, 12]} />
          <meshBasicMaterial color={o.color} blending={THREE.AdditiveBlending} />
        </mesh>
      ))}
    </group>
  );
}

function CoreParticles({ reduced }: { reduced: boolean }) {
  const ref = useRef<THREE.Points>(null);
  const geo = useMemo(() => {
    const N = 160;
    const pos = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const r = 1.6 + Math.random() * 1.8;
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = r * Math.sin(ph) * Math.cos(th);
      pos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th);
      pos[i * 3 + 2] = r * Math.cos(ph);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return g;
  }, []);
  useFrame((_, delta) => {
    if (ref.current && !reduced) ref.current.rotation.y += delta * 0.15;
  });
  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial size={0.05} color="#a855f7" transparent opacity={0.8} blending={THREE.AdditiveBlending} depthWrite={false} sizeAttenuation />
    </points>
  );
}

function Scene({ energyRef, reduced }: { energyRef: React.MutableRefObject<number>; reduced: boolean }) {
  const group = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!group.current) return;
    if (!reduced) {
      const t = state.clock.elapsedTime;
      group.current.rotation.y = Math.sin(t * 0.15) * 0.3;
      group.current.position.y = Math.sin(t * 0.6) * 0.08;
    }
  });
  return (
    <group ref={group}>
      <CoreSphere energyRef={energyRef} reduced={reduced} />
      <WireShell energyRef={energyRef} reduced={reduced} />
      <Rings energyRef={energyRef} reduced={reduced} />
      <Electrons energyRef={energyRef} reduced={reduced} />
      <CoreParticles reduced={reduced} />
    </group>
  );
}

export interface AICore3DProps {
  energy: number;
  reduced: boolean;
  paused?: boolean;
  bloom: boolean;
  dpr: [number, number];
}

/** Self-contained WebGL canvas for the central AI core. Default export for lazy(). */
export default function AICore3D({ energy, reduced, paused, dpr }: AICore3DProps) {
  const energyRef = useRef(energy);
  energyRef.current = energy;

  return (
    <Canvas
      className="core3d-canvas"
      dpr={dpr}
      gl={{ antialias: false, alpha: true, powerPreference: "high-performance", stencil: false }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
      }}
      camera={{ position: [0, 0, 7], fov: 50 }}
      frameloop={reduced || paused ? "demand" : "always"}
    >
      <Suspense fallback={null}>
        <Scene energyRef={energyRef} reduced={reduced} />
      </Suspense>
    </Canvas>
  );
}
