import { useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { journey } from "./store";
import { CORE_RADIUS, LayerDef, PlanetDef } from "./data";
import { galaxyAudio } from "../audio/galaxyAudio";

/* ------------------------------ orbit ring ------------------------------ */

const ringVertex = /* glsl */ `
varying vec2 vP;
void main(){
  vP = position.xy;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const ringFragment = /* glsl */ `
uniform float uTime;
uniform float uAct;
uniform float uRadius;
uniform vec3 uColor;
varying vec2 vP;
void main(){
  float r = length(vP);
  float d = abs(r - uRadius);
  float line = smoothstep(0.075, 0.0, d);
  float glow = exp(-d * 2.0) * 0.45;
  float ang = atan(vP.y, vP.x);
  float dash = 0.6 + 0.4 * sin(ang * 90.0 - uTime * 1.6);
  // bright comet arc sweeping the ring
  float comet = pow(0.5 + 0.5 * sin(ang - uTime * 0.45), 10.0);
  float a = (line * (0.35 + 0.65 * dash) + glow) * (0.08 + uAct * 0.8)
          + comet * line * uAct * 1.6;
  gl_FragColor = vec4(uColor, a);
}
`;

function OrbitRing({ layer }: { layer: LayerDef }) {
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uAct: { value: 0 },
      uRadius: { value: layer.radius },
      uColor: { value: new THREE.Color(layer.color) },
    }),
    [layer]
  );

  useFrame((state) => {
    uniforms.uTime.value = state.clock.elapsedTime;
    uniforms.uAct.value = journey[layer.id] * (0.7 + journey.activation * 0.5);
  });

  return (
    <mesh rotation-x={-Math.PI / 2}>
      <ringGeometry args={[layer.radius - 1.2, layer.radius + 1.2, 256]} />
      <shaderMaterial
        vertexShader={ringVertex}
        fragmentShader={ringFragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

/* ---------------------------- energy stream ----------------------------- */

const streamVertex = /* glsl */ `
varying vec2 vUv;
void main(){
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const streamFragment = /* glsl */ `
uniform float uTime;
uniform float uStrength;
uniform float uOffset;
uniform vec3 uColorA;
uniform vec3 uColorB;
varying vec2 vUv;
void main(){
  // pulses travel from the planet (u=0) toward the core (u=1)
  float f = fract(vUv.x * 2.5 - uTime * 0.65 + uOffset);
  float pulse = smoothstep(0.0, 0.12, f) * smoothstep(0.34, 0.12, f);
  vec3 col = mix(uColorA, uColorB, vUv.x);
  float a = (0.10 + pulse * 1.7) * uStrength;
  a *= smoothstep(0.0, 0.06, vUv.x) * smoothstep(1.0, 0.9, vUv.x);
  gl_FragColor = vec4(col * (0.55 + pulse * 1.9), a);
}
`;

/* ------------------------------- planet --------------------------------- */

const haloVertex = /* glsl */ `
varying vec3 vN;
void main(){
  vN = normalize(normalMatrix * normal);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const haloFragment = /* glsl */ `
uniform vec3 uColor;
uniform float uIntensity;
varying vec3 vN;
void main(){
  float i = pow(max(0.6 - dot(vN, vec3(0.0, 0.0, 1.0)), 0.0), 3.0);
  gl_FragColor = vec4(uColor, 1.0) * i * uIntensity;
}
`;

function buildParticleShell(count: number, rMin: number, rMax: number) {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r = rMin + Math.random() * (rMax - rMin);
    const u = Math.random() * 2 - 1;
    const th = Math.random() * Math.PI * 2;
    const s = Math.sqrt(1 - u * u);
    positions[i * 3] = s * Math.cos(th) * r;
    positions[i * 3 + 1] = u * r * 0.6;
    positions[i * 3 + 2] = s * Math.sin(th) * r;
  }
  return positions;
}

function PlanetSystem({ layer, planet }: { layer: LayerDef; planet: PlanetDef }) {
  const pivot = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const mesh = useRef<THREE.Mesh>(null);
  const surface = useRef<THREE.MeshStandardMaterial>(null);
  const particles = useRef<THREE.Points>(null);
  const particleMat = useRef<THREE.PointsMaterial>(null);
  const label = useRef<HTMLDivElement>(null);
  const hover = useRef(0);
  const [hovered, setHovered] = useState(false);

  const streamUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uStrength: { value: 0 },
      uOffset: { value: planet.angle },
      uColorA: { value: new THREE.Color(layer.color) },
      uColorB: { value: new THREE.Color("#67e8f9") },
    }),
    [layer, planet]
  );

  const haloUniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color(layer.color) },
      uIntensity: { value: 0 },
    }),
    [layer]
  );

  const worldPos = useMemo(() => new THREE.Vector3(), []);
  const toPlanet = useMemo(() => new THREE.Vector3(), []);
  const closest = useMemo(() => new THREE.Vector3(), []);

  const streamGeometry = useMemo(() => {
    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(layer.radius, 0, 0),
      new THREE.Vector3(layer.radius * 0.5, 2.2, planet.bend),
      new THREE.Vector3(CORE_RADIUS * 1.06, 0.35, 0)
    );
    return new THREE.TubeGeometry(curve, 64, 0.05, 6, false);
  }, [layer, planet]);

  const particlePositions = useMemo(
    () => buildParticleShell(40, planet.size * 1.6, planet.size * 2.8),
    [planet]
  );

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    const act = journey[layer.id];
    const full = journey.activation;

    if (pivot.current) {
      pivot.current.rotation.y = planet.angle + t * planet.speed * (1 + full * 0.5);
    }

    hover.current += ((hovered ? 1 : 0) - hover.current) * Math.min(1, dt * 7);
    const h = hover.current;

    if (body.current) {
      const s = Math.max(0.001, act) * (1 + h * 0.18);
      body.current.scale.setScalar(s);
    }
    if (mesh.current) mesh.current.rotation.y += dt * 0.35;
    if (surface.current) {
      surface.current.emissiveIntensity = 0.35 + act * 0.7 + h * 1.6 + full * 0.5;
    }

    haloUniforms.uIntensity.value = act * (0.8 + full * 0.5) + h * 1.2;

    streamUniforms.uTime.value = t;
    streamUniforms.uStrength.value =
      Math.max(0.025, act * (0.45 + full * 0.85) + h * 1.3);

    if (particles.current) particles.current.rotation.y -= dt * 0.45;
    if (particleMat.current) {
      particleMat.current.opacity = act * (0.35 + full * 0.3) + h * 0.4;
    }

    if (label.current && body.current) {
      // hide labels that get too close to (or too far from) the lens
      body.current.getWorldPosition(worldPos);
      const cam = state.camera.position;
      const dist = worldPos.distanceTo(cam);
      const distFade =
        Math.min(1, Math.max(0, (dist - 7) / 6)) *
        Math.min(1, Math.max(0, (70 - dist) / 20));

      // fade labels whose sight-line passes through the core
      toPlanet.copy(worldPos).sub(cam);
      const tt = THREE.MathUtils.clamp(
        -cam.dot(toPlanet) / toPlanet.lengthSq(),
        0,
        1
      );
      closest.copy(toPlanet).multiplyScalar(tt).add(cam);
      const coreClearance = closest.length();
      const occFade =
        tt > 0.02 && tt < 0.98
          ? Math.min(1, Math.max(0, (coreClearance - CORE_RADIUS - 0.5) / 2.5))
          : 1;

      label.current.style.opacity = String(
        act * (0.55 + h * 0.45) * distFade * occFade
      );
    }
  });

  const onOver = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    if (journey[layer.id] < 0.35) return;
    setHovered(true);
    journey.hovered = { name: planet.name, layer: layer.name, detail: planet.detail };
    galaxyAudio.planetHover(layer.id);
    document.body.style.cursor = "pointer";
  };
  const onOut = () => {
    setHovered(false);
    if (journey.hovered?.name === planet.name) journey.hovered = null;
    document.body.style.cursor = "auto";
  };

  return (
    <group ref={pivot}>
      <group ref={body} position={[layer.radius, 0, 0]}>
        {/* invisible larger hit target */}
        <mesh onPointerOver={onOver} onPointerOut={onOut}>
          <sphereGeometry args={[planet.size * 2.3, 12, 12]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} depthTest={false} />
        </mesh>

        {/* planet body */}
        <mesh ref={mesh}>
          <sphereGeometry args={[planet.size, 48, 48]} />
          <meshStandardMaterial
            ref={surface}
            color="#0c0718"
            emissive={layer.color}
            emissiveIntensity={0.35}
            roughness={0.35}
            metalness={0.35}
          />
        </mesh>

        {/* atmospheric rim glow */}
        <mesh scale={1.45}>
          <sphereGeometry args={[planet.size, 32, 32]} />
          <shaderMaterial
            vertexShader={haloVertex}
            fragmentShader={haloFragment}
            uniforms={haloUniforms}
            side={THREE.BackSide}
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>

        {/* emitted data particles */}
        <points ref={particles}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[particlePositions, 3]} />
          </bufferGeometry>
          <pointsMaterial
            ref={particleMat}
            color={layer.color}
            size={0.07}
            transparent
            opacity={0}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            sizeAttenuation
          />
        </points>

        {/* holographic label */}
        <Html center distanceFactor={26} position={[0, planet.size * 1.9, 0]} zIndexRange={[5, 0]}>
          <div ref={label} className="planet-label" style={{ opacity: 0 }}>
            <span className="planet-label-name" style={{ color: layer.color }}>
              {planet.name}
            </span>
            <span className="planet-label-detail">{planet.detail}</span>
          </div>
        </Html>
      </group>

      {/* energy stream to the core (static in pivot space, rotates with planet) */}
      <mesh geometry={streamGeometry}>
        <shaderMaterial
          vertexShader={streamVertex}
          fragmentShader={streamFragment}
          uniforms={streamUniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

/* ------------------------------ layer root ------------------------------ */

export default function OrbitLayer({ layer }: { layer: LayerDef }) {
  return (
    <group rotation={layer.tilt}>
      <OrbitRing layer={layer} />
      {layer.planets.map((p) => (
        <PlanetSystem key={p.id} layer={layer} planet={p} />
      ))}
    </group>
  );
}
