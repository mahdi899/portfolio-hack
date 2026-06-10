import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { pointer } from "./pointerStore";

const NEON = [
  new THREE.Color("#a855f7"), // purple
  new THREE.Color("#7c5cff"), // indigo
  new THREE.Color("#38bdf8"), // electric blue
  new THREE.Color("#22e3a3"), // green accent (rare)
];

const PARTICLE_VERT = /* glsl */ `
  uniform float uTime;
  uniform float uSize;
  uniform float uEnergy;
  uniform float uPixelRatio;
  uniform vec2 uPointer;
  attribute float aSeed;
  attribute float aScale;
  attribute vec3 aColor;
  varying vec3 vColor;
  varying float vTwinkle;

  void main() {
    vColor = aColor;
    vec3 p = position;

    float t = uTime * (0.15 + aSeed * 0.25);
    p.x += sin(t + aSeed * 6.2831) * (0.4 + aSeed * 0.6);
    p.y += cos(t * 1.1 + aSeed * 3.14) * (0.4 + aSeed * 0.6);
    p.z += sin(t * 0.7 + aSeed * 1.7) * 0.5;

    // gentle pull toward the cursor in the XY plane, stronger up close
    vec2 toPointer = uPointer * 8.0 - p.xy;
    float d = length(toPointer);
    float pull = (1.0 - smoothstep(0.0, 9.0, d)) * (0.5 + uEnergy);
    p.xy += normalize(toPointer + 0.0001) * pull * 0.9;

    vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    vTwinkle = 0.6 + 0.4 * sin(uTime * 2.0 + aSeed * 20.0);
    float size = uSize * aScale * (1.0 + uEnergy * 0.8);
    gl_PointSize = size * uPixelRatio * (220.0 / -mvPosition.z);
  }
`;

const PARTICLE_FRAG = /* glsl */ `
  uniform float uEnergy;
  varying vec3 vColor;
  varying float vTwinkle;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float core = smoothstep(0.5, 0.0, d);
    float glow = pow(core, 1.6);
    float alpha = glow * (0.55 + 0.45 * vTwinkle);
    vec3 col = vColor * (1.0 + uEnergy * 0.6) + glow * 0.25;
    gl_FragColor = vec4(col, alpha);
  }
`;

function Particles({
  count,
  energyRef,
  reduced,
}: {
  count: number;
  energyRef: React.MutableRefObject<number>;
  reduced: boolean;
}) {
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const { geometry, uniforms } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    const scales = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // distribute in a wide, deep slab so it reads as volumetric depth
      positions[i * 3] = (Math.random() - 0.5) * 34;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 22;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 22 - 4;

      const c = NEON[Math.random() < 0.12 ? 3 : Math.floor(Math.random() * 3)];
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;

      seeds[i] = Math.random();
      scales[i] = 0.4 + Math.random() * Math.random() * 2.4;
    }

    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    g.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));
    g.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
    g.setAttribute("aScale", new THREE.BufferAttribute(scales, 1));

    const u = {
      uTime: { value: 0 },
      uSize: { value: 14 },
      uEnergy: { value: 0 },
      uPixelRatio: { value: Math.min(window.devicePixelRatio || 1, 2) },
      uPointer: { value: new THREE.Vector2(0, 0) },
    };
    return { geometry: g, uniforms: u };
  }, [count]);

  useFrame((_, delta) => {
    const u = matRef.current?.uniforms;
    if (!u) return;
    if (!reduced) u.uTime.value += delta;
    u.uEnergy.value += (energyRef.current - u.uEnergy.value) * 0.06;
    u.uPointer.value.set(pointer.sx, -pointer.sy);
  });

  return (
    <points frustumCulled={false}>
      <primitive object={geometry} attach="geometry" />
      <shaderMaterial
        ref={matRef}
        uniforms={uniforms}
        vertexShader={PARTICLE_VERT}
        fragmentShader={PARTICLE_FRAG}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/** Slowly rotating wireframe lattice — reads as a neural network mesh. */
function NeuralLattice({ reduced }: { reduced: boolean }) {
  const ref = useRef<THREE.LineSegments>(null);
  const geometry = useMemo(() => {
    const pts: number[] = [];
    const nodes: THREE.Vector3[] = [];
    const N = 26;
    for (let i = 0; i < N; i++) {
      nodes.push(
        new THREE.Vector3(
          (Math.random() - 0.5) * 26,
          (Math.random() - 0.5) * 16,
          (Math.random() - 0.5) * 14 - 6
        )
      );
    }
    for (let i = 0; i < N; i++) {
      for (let j = i + 1; j < N; j++) {
        if (nodes[i].distanceTo(nodes[j]) < 7 && Math.random() > 0.4) {
          pts.push(nodes[i].x, nodes[i].y, nodes[i].z);
          pts.push(nodes[j].x, nodes[j].y, nodes[j].z);
        }
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    return g;
  }, []);

  useFrame((_, delta) => {
    if (ref.current && !reduced) ref.current.rotation.z += delta * 0.012;
  });

  return (
    <lineSegments ref={ref} geometry={geometry}>
      <lineBasicMaterial
        color="#6d5cff"
        transparent
        opacity={0.12}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </lineSegments>
  );
}

function cloudTexture(color: string): THREE.Texture {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, color);
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Large soft additive sprites that drift in depth — volumetric energy fog. */
function EnergyClouds({ reduced }: { reduced: boolean }) {
  const group = useRef<THREE.Group>(null);
  const clouds = useMemo(
    () => [
      { tex: cloudTexture("rgba(124,58,237,0.5)"), pos: [-9, 3, -10], scale: 22, sp: 0.05 },
      { tex: cloudTexture("rgba(56,189,248,0.42)"), pos: [10, -4, -12], scale: 26, sp: -0.04 },
      { tex: cloudTexture("rgba(34,227,163,0.3)"), pos: [2, 8, -14], scale: 20, sp: 0.03 },
      { tex: cloudTexture("rgba(168,85,247,0.4)"), pos: [6, -8, -8], scale: 18, sp: -0.06 },
    ],
    []
  );

  useFrame((state) => {
    if (!group.current) return;
    if (!reduced) {
      const t = state.clock.elapsedTime;
      group.current.children.forEach((ch, i) => {
        ch.position.y += Math.sin(t * 0.1 + i) * 0.002;
        ch.rotation.z = t * clouds[i].sp;
      });
    }
    group.current.position.x = pointer.sx * 1.4;
    group.current.position.y = -pointer.sy * 1.0;
  });

  return (
    <group ref={group}>
      {clouds.map((c, i) => (
        <sprite key={i} position={c.pos as [number, number, number]} scale={[c.scale, c.scale, 1]}>
          <spriteMaterial
            map={c.tex}
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            opacity={0.9}
          />
        </sprite>
      ))}
    </group>
  );
}

export function VolumetricField({
  particles,
  energy,
  reduced,
}: {
  particles: number;
  energy: number;
  reduced: boolean;
}) {
  const energyRef = useRef(energy);
  energyRef.current = energy;
  const group = useRef<THREE.Group>(null);

  // subtle whole-field parallax following the cursor for depth
  useFrame(() => {
    if (!group.current) return;
    group.current.rotation.y += (pointer.sx * 0.16 - group.current.rotation.y) * 0.04;
    group.current.rotation.x += (pointer.sy * 0.1 - group.current.rotation.x) * 0.04;
  });

  return (
    <group ref={group}>
      <EnergyClouds reduced={reduced} />
      <NeuralLattice reduced={reduced} />
      <Particles count={particles} energyRef={energyRef} reduced={reduced} />
    </group>
  );
}
