import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { NOISE_GLSL } from "./shaders";
import { journey } from "./store";
import { CORE_RADIUS } from "./data";

const coreVertex = /* glsl */ `
varying vec3 vNormal;
varying vec3 vView;
varying vec3 vPos;
void main(){
  vPos = position;
  vNormal = normalize(mat3(modelMatrix) * normal);
  vec3 worldPos = (modelMatrix * vec4(position, 1.0)).xyz;
  vView = normalize(cameraPosition - worldPos);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const coreFragment = /* glsl */ `
uniform float uTime;
uniform float uBoost;
varying vec3 vNormal;
varying vec3 vView;
varying vec3 vPos;
${NOISE_GLSL}
void main(){
  vec3 p = normalize(vPos);
  float n  = fbm(p * 2.2 + vec3(0.0, uTime * 0.035, uTime * 0.02));
  float n2 = fbm(p * 5.0 - vec3(uTime * 0.045, 0.0, uTime * 0.02));

  // deep violet surface
  vec3 base = mix(vec3(0.035, 0.008, 0.10), vec3(0.22, 0.07, 0.46), n * 0.5 + 0.5);

  // neural energy veins crawling across the surface
  float vein = pow(1.0 - abs(sin(n * 6.28318 + n2 * 3.0 + uTime * 0.35)), 7.0);
  vec3 veinCol = mix(vec3(0.30, 0.95, 1.0), vec3(0.80, 0.42, 1.0), n2 * 0.5 + 0.5);

  // rim energy
  float fres = pow(1.0 - max(dot(normalize(vNormal), normalize(vView)), 0.0), 2.6);

  vec3 col = base
    + veinCol * vein * (0.85 + uBoost * 2.2)
    + vec3(0.62, 0.30, 1.0) * fres * (1.05 + uBoost * 1.5);

  // polar energy discharge
  col += vec3(0.30, 0.9, 1.0) * smoothstep(0.78, 1.0, abs(p.y)) * (0.25 + uBoost * 0.9);

  gl_FragColor = vec4(col, 1.0);
}
`;

const glowVertex = /* glsl */ `
varying vec3 vN;
void main(){
  vN = normalize(normalMatrix * normal);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const glowFragment = /* glsl */ `
uniform vec3 uColor;
uniform float uBoost;
varying vec3 vN;
void main(){
  float intensity = pow(max(0.62 - dot(vN, vec3(0.0, 0.0, 1.0)), 0.0), 4.0);
  gl_FragColor = vec4(uColor, 1.0) * intensity * (0.9 + uBoost * 1.3);
}
`;

const beamVertex = /* glsl */ `
varying vec2 vUv;
void main(){
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const beamFragment = /* glsl */ `
uniform float uTime;
uniform float uAct;
varying vec2 vUv;
void main(){
  float falloff = pow(1.0 - abs(vUv.y * 2.0 - 1.0), 2.6);
  float flicker = 0.85 + 0.15 * sin(uTime * 7.0 + vUv.y * 30.0);
  vec3 col = mix(vec3(0.30, 0.9, 1.0), vec3(0.66, 0.33, 1.0), vUv.y);
  gl_FragColor = vec4(col, falloff * flicker * uAct * 0.85);
}
`;

export default function AICore() {
  const coreMat = useRef<THREE.ShaderMaterial>(null);
  const glowMat = useRef<THREE.ShaderMaterial>(null);
  const beamMat = useRef<THREE.ShaderMaterial>(null);
  const ringA = useRef<THREE.Mesh>(null);
  const ringB = useRef<THREE.Mesh>(null);
  const ringAMat = useRef<THREE.MeshBasicMaterial>(null);
  const ringBMat = useRef<THREE.MeshBasicMaterial>(null);
  const light = useRef<THREE.PointLight>(null);
  const coreMesh = useRef<THREE.Mesh>(null);

  const coreUniforms = useMemo(() => ({ uTime: { value: 0 }, uBoost: { value: 0 } }), []);
  const glowUniforms = useMemo(
    () => ({ uColor: { value: new THREE.Color("#8b5cf6") }, uBoost: { value: 0 } }),
    []
  );
  const beamUniforms = useMemo(() => ({ uTime: { value: 0 }, uAct: { value: 0 } }), []);

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    const act = journey.activation;
    const boost = 0.22 + act * 0.85 + journey.revenue * 0.12;

    coreUniforms.uTime.value = t;
    coreUniforms.uBoost.value = boost;
    glowUniforms.uBoost.value = boost;
    beamUniforms.uTime.value = t;
    beamUniforms.uAct.value = act;

    if (coreMesh.current) coreMesh.current.rotation.y += dt * 0.03;

    if (ringA.current) {
      ringA.current.rotation.z += dt * 0.12;
      ringA.current.rotation.x = Math.PI / 2 + Math.sin(t * 0.2) * 0.08;
    }
    if (ringB.current) {
      ringB.current.rotation.z -= dt * 0.08;
      ringB.current.rotation.x = Math.PI / 2.3 + Math.cos(t * 0.17) * 0.1;
    }
    if (ringAMat.current) ringAMat.current.opacity = 0.18 + act * 0.5;
    if (ringBMat.current) ringBMat.current.opacity = 0.12 + act * 0.4;

    if (light.current) light.current.intensity = 480 + act * 700;
  });

  return (
    <group>
      {/* the planet */}
      <mesh ref={coreMesh}>
        <sphereGeometry args={[CORE_RADIUS, 128, 128]} />
        <shaderMaterial
          ref={coreMat}
          vertexShader={coreVertex}
          fragmentShader={coreFragment}
          uniforms={coreUniforms}
        />
      </mesh>

      {/* atmosphere / corona */}
      <mesh scale={1.38}>
        <sphereGeometry args={[CORE_RADIUS, 64, 64]} />
        <shaderMaterial
          ref={glowMat}
          vertexShader={glowVertex}
          fragmentShader={glowFragment}
          uniforms={glowUniforms}
          side={THREE.BackSide}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* inner energy rings */}
      <mesh ref={ringA} rotation-x={Math.PI / 2}>
        <torusGeometry args={[CORE_RADIUS * 1.45, 0.045, 8, 160]} />
        <meshBasicMaterial
          ref={ringAMat}
          color="#22d3ee"
          transparent
          opacity={0.2}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <mesh ref={ringB} rotation-x={Math.PI / 2.3}>
        <torusGeometry args={[CORE_RADIUS * 1.65, 0.035, 8, 160]} />
        <meshBasicMaterial
          ref={ringBMat}
          color="#a855f7"
          transparent
          opacity={0.14}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* polar activation beam (scene 05) */}
      <mesh>
        <cylinderGeometry args={[0.55, 0.55, 90, 16, 1, true]} />
        <shaderMaterial
          ref={beamMat}
          vertexShader={beamVertex}
          fragmentShader={beamFragment}
          uniforms={beamUniforms}
          transparent
          depthWrite={false}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <pointLight ref={light} color="#8b5cf6" intensity={480} distance={140} decay={1.6} />
    </group>
  );
}
