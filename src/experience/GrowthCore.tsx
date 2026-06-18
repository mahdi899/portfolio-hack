import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { journey, sceneFade, COUNT, SceneId } from "./store";
import { NOISE_GLSL } from "./shaders";
import { haloTexture } from "./textures";
import { P } from "./palette";

/* ------------------------------ core shader ------------------------------ */

const CORE_VERT = /* glsl */ `
varying vec3 vPos;
varying vec3 vNormal;
varying vec3 vView;
void main() {
  vPos = position;
  vNormal = normalize(normalMatrix * normal);
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vView = normalize(-mv.xyz);
  gl_Position = projectionMatrix * mv;
}
`;

const CORE_FRAG = /* glsl */ `
uniform float uTime, uBoost, uOpacity;
varying vec3 vPos;
varying vec3 vNormal;
varying vec3 vView;
${NOISE_GLSL}
void main() {
  vec3 p = normalize(vPos);
  float n = fbm(p * 2.4 + vec3(0.0, uTime * 0.05, uTime * 0.07));
  float n2 = fbm(p * 5.2 - uTime * 0.05);
  // energy filaments
  float fil = smoothstep(0.10, 0.0, abs(n + n2 * 0.35) - 0.015);
  vec3 base = mix(vec3(0.05, 0.025, 0.14), vec3(0.32, 0.16, 0.70), 0.5 + 0.5 * n);
  vec3 col = base + fil * vec3(0.78, 0.60, 1.30) * (0.9 + uBoost * 0.8);
  float fres = pow(1.0 - max(dot(vNormal, vView), 0.0), 2.6);
  col += fres * vec3(0.30, 0.72, 0.95) * (0.85 + uBoost * 0.4);
  col += smoothstep(0.45, 0.9, n) * vec3(0.9, 0.8, 1.2) * (0.5 + uBoost * 0.8);
  gl_FragColor = vec4(col, uOpacity);
}
`;

/* --------------------------- inflow particles ---------------------------- */

const FLOW_VERT = /* glsl */ `
attribute float aOff;
attribute float aSpeed;
attribute float aScale;
attribute float aMix;
attribute vec3 aDir;
uniform float uTime, uRMin, uRMax;
varying float vA;
varying float vMix;
void main() {
  float t = fract(aOff + uTime * aSpeed);
  float r = mix(uRMax, uRMin, t);
  float ang = uTime * 0.04 + t * 1.8;
  vec3 d = aDir;
  vec3 pos = vec3(
    d.x * cos(ang) - d.z * sin(ang),
    d.y,
    d.x * sin(ang) + d.z * cos(ang)
  ) * r;
  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  vA = smoothstep(0.0, 0.15, t) * (1.0 - smoothstep(0.82, 1.0, t));
  vMix = aMix;
  gl_PointSize = aScale * (170.0 / max(1.0, -mv.z));
  gl_Position = projectionMatrix * mv;
}
`;

const FLOW_FRAG = /* glsl */ `
uniform float uOpacity;
uniform vec3 uColA, uColB;
varying float vA;
varying float vMix;
void main() {
  float m = smoothstep(0.5, 0.06, length(gl_PointCoord - 0.5));
  float a = m * vA * uOpacity;
  if (a < 0.004) discard;
  gl_FragColor = vec4(mix(uColA, uColB, vMix) * (1.0 + m), a);
}
`;

/* ------------------------- per-scene core staging ------------------------ */

interface Stage {
  id: SceneId;
  pos: [number, number, number];
  scale: number;
  glow: number;
  boost: number;
}

const STAGES: Stage[] = [
  { id: "hero", pos: [0, -2.5, 0], scale: 1, glow: 1, boost: 0.55 },
  { id: "problem", pos: [0, 8, -30], scale: 0.5, glow: 0.7, boost: 0.3 },
  { id: "traffic", pos: [0, 0, 0], scale: 0.92, glow: 1, boost: 0.55 },
  { id: "capture", pos: [0, 0, -6], scale: 0.8, glow: 0.9, boost: 0.5 },
  { id: "gate", pos: [0, 0, -56], scale: 0.45, glow: 0.15, boost: 0.2 },
  { id: "agents", pos: [0, 0, 0], scale: 0.85, glow: 1, boost: 0.6 },
  { id: "revenue", pos: [0, 0, 0], scale: 1.05, glow: 1.15, boost: 1.0 },
  { id: "cta", pos: [0, -2, -14], scale: 0.75, glow: 0.7, boost: 0.45 },
];

export default function GrowthCore() {
  const group = useRef<THREE.Group>(null);
  const ringsRef = useRef<THREE.Group>(null);
  const halo = useMemo(() => haloTexture(P.purple), []);
  const haloInner = useMemo(() => haloTexture("#d8ccff", 0.1), []);
  const haloMat = useRef<THREE.SpriteMaterial>(null);
  const haloInnerMat = useRef<THREE.SpriteMaterial>(null);

  const coreUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uBoost: { value: 0.5 },
      uOpacity: { value: 1 },
    }),
    []
  );

  const flowUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uOpacity: { value: 0 },
      uRMin: { value: 6.6 },
      uRMax: { value: 26 },
      uColA: { value: new THREE.Color(P.purpleSoft) },
      uColB: { value: new THREE.Color(P.cyan) },
    }),
    []
  );

  const nFlow = COUNT(1300);
  const flowGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const dir = new Float32Array(nFlow * 3);
    const off = new Float32Array(nFlow);
    const spd = new Float32Array(nFlow);
    const sc = new Float32Array(nFlow);
    const mx = new Float32Array(nFlow);
    for (let i = 0; i < nFlow; i++) {
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      dir[i * 3] = Math.sin(ph) * Math.cos(th);
      dir[i * 3 + 1] = Math.cos(ph) * 0.5;
      dir[i * 3 + 2] = Math.sin(ph) * Math.sin(th) * 0.55;
      off[i] = Math.random();
      spd[i] = 0.02 + Math.random() * 0.035;
      sc[i] = 0.45 + Math.random() * 0.9;
      mx[i] = Math.random();
    }
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(nFlow * 3), 3));
    g.setAttribute("aDir", new THREE.BufferAttribute(dir, 3));
    g.setAttribute("aOff", new THREE.BufferAttribute(off, 1));
    g.setAttribute("aSpeed", new THREE.BufferAttribute(spd, 1));
    g.setAttribute("aScale", new THREE.BufferAttribute(sc, 1));
    g.setAttribute("aMix", new THREE.BufferAttribute(mx, 1));
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 10000);
    return g;
  }, [nFlow]);

  const tmpPos = useMemo(() => new THREE.Vector3(), []);

  useFrame((state) => {
    if (!group.current) return;
    const p = journey.smooth;
    const t = state.clock.elapsedTime;

    let wSum = 0;
    tmpPos.set(0, 0, 0);
    let scale = 0;
    let glow = 0;
    let boost = 0;
    for (const s of STAGES) {
      const w = sceneFade(p, s.id);
      if (w <= 0) continue;
      wSum += w;
      tmpPos.x += s.pos[0] * w;
      tmpPos.y += s.pos[1] * w;
      tmpPos.z += s.pos[2] * w;
      scale += s.scale * w;
      glow += s.glow * w;
      boost += s.boost * w;
    }

    const visible = wSum > 0.004;
    group.current.visible = visible;
    if (!visible) return;

    const inv = 1 / wSum;
    group.current.position.set(tmpPos.x * inv, tmpPos.y * inv, tmpPos.z * inv);
    const breathe = 1 + Math.sin(t * 0.8) * 0.012;
    group.current.scale.setScalar(scale * inv * breathe);

    const w01 = Math.min(1, wSum);
    coreUniforms.uTime.value = t;
    coreUniforms.uOpacity.value = w01;
    coreUniforms.uBoost.value = boost * inv;

    if (haloMat.current) haloMat.current.opacity = 0.5 * glow * inv * w01;
    if (haloInnerMat.current) haloInnerMat.current.opacity = 0.65 * glow * inv * w01;

    if (ringsRef.current) {
      ringsRef.current.rotation.y = t * 0.05;
      const ringW =
        Math.max(
          sceneFade(p, "hero"),
          sceneFade(p, "traffic") * 0.7,
          sceneFade(p, "agents") * 0.6,
          sceneFade(p, "revenue"),
          sceneFade(p, "cta") * 0.5
        ) * w01;
      ringsRef.current.children.forEach((ch) => {
        const m = (ch as THREE.Mesh).material as THREE.MeshBasicMaterial;
        m.opacity = m.userData.base * ringW;
      });
    }

    flowUniforms.uTime.value = t;
    flowUniforms.uOpacity.value = Math.max(
      sceneFade(p, "hero"),
      sceneFade(p, "cta") * 0.5
    );
  });

  return (
    <group ref={group}>
      {/* plasma sphere */}
      <mesh>
        <sphereGeometry args={[6, 96, 96]} />
        <shaderMaterial
          uniforms={coreUniforms}
          vertexShader={CORE_VERT}
          fragmentShader={CORE_FRAG}
          transparent
        />
      </mesh>

      {/* halos */}
      <sprite scale={[30, 30, 1]}>
        <spriteMaterial
          ref={haloMat}
          map={halo}
          transparent
          opacity={0.5}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>
      <sprite scale={[10.5, 10.5, 1]}>
        <spriteMaterial
          ref={haloInnerMat}
          map={haloInner}
          transparent
          opacity={0.65}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>

      {/* orbit rings */}
      <group ref={ringsRef}>
        <mesh rotation={[Math.PI / 2.25, 0, 0.2]}>
          <torusGeometry args={[10.5, 0.025, 8, 160]} />
          <meshBasicMaterial
            color={P.purpleSoft}
            transparent
            opacity={0.4}
            userData={{ base: 0.4 }}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
        <mesh rotation={[Math.PI / 2.05, 0, -0.32]}>
          <torusGeometry args={[14.5, 0.022, 8, 160]} />
          <meshBasicMaterial
            color={P.cyan}
            transparent
            opacity={0.26}
            userData={{ base: 0.26 }}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
        <mesh rotation={[Math.PI / 1.92, 0, 0.55]} scale={[1.55, 1, 1]}>
          <torusGeometry args={[19, 0.02, 8, 200]} />
          <meshBasicMaterial
            color={P.purple}
            transparent
            opacity={0.3}
            userData={{ base: 0.3 }}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      </group>

      {/* attention particles falling into the core (hero) */}
      <points geometry={flowGeo} frustumCulled={false}>
        <shaderMaterial
          uniforms={flowUniforms}
          vertexShader={FLOW_VERT}
          fragmentShader={FLOW_FRAG}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}
