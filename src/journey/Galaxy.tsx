import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const starVertex = /* glsl */ `
attribute float aSize;
attribute float aPhase;
varying vec3 vColor;
varying float vPhase;
varying float vDepth;
void main(){
  vColor = color;
  vPhase = aPhase;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vDepth = -mv.z;
  gl_PointSize = min(aSize * (300.0 / -mv.z), 7.5);
  gl_Position = projectionMatrix * mv;
}
`;

const starFragment = /* glsl */ `
uniform float uTime;
varying vec3 vColor;
varying float vPhase;
varying float vDepth;
void main(){
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.04, d);
  float twinkle = 0.72 + 0.28 * sin(uTime * 1.6 + vPhase);
  // fade stars that drift too close to the lens
  float nearFade = smoothstep(9.0, 26.0, vDepth);
  gl_FragColor = vec4(vColor, a * twinkle * nearFade);
}
`;

const PALETTE = ["#ffffff", "#cdb9ff", "#8ab8ff", "#d7b6ff", "#9ef0ff", "#ffffff"];

function buildStars(count: number, kind: "galaxy" | "dust") {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const phases = new Float32Array(count);
  const c = new THREE.Color();

  for (let i = 0; i < count; i++) {
    let x = 0;
    let y = 0;
    let z = 0;

    if (kind === "galaxy") {
      if (i < count * 0.55) {
        // spiral disc
        const r = 42 + Math.pow(Math.random(), 1.5) * 215;
        const arm = i % 3;
        const ang = r * 0.021 + arm * ((Math.PI * 2) / 3) + (Math.random() - 0.5) * 0.8;
        x = Math.cos(ang) * r;
        z = Math.sin(ang) * r;
        y = (Math.random() + Math.random() + Math.random() - 1.5) * 7;
      } else {
        // far sphere shell
        const r = 140 + Math.random() * 320;
        const u = Math.random() * 2 - 1;
        const th = Math.random() * Math.PI * 2;
        const s = Math.sqrt(1 - u * u);
        x = s * Math.cos(th) * r;
        y = u * r;
        z = s * Math.sin(th) * r;
      }
    } else {
      // inner cosmic dust drifting between the orbits
      const r = 9 + Math.pow(Math.random(), 1.4) * 62;
      const ang = Math.random() * Math.PI * 2;
      x = Math.cos(ang) * r;
      z = Math.sin(ang) * r;
      y = (Math.random() + Math.random() - 1) * r * 0.32;
    }

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;

    c.set(PALETTE[Math.floor(Math.random() * PALETTE.length)]);
    const lum = kind === "dust" ? 0.25 + Math.random() * 0.4 : 0.45 + Math.random() * 0.55;
    colors[i * 3] = c.r * lum;
    colors[i * 3 + 1] = c.g * lum;
    colors[i * 3 + 2] = c.b * lum;

    sizes[i] = kind === "dust" ? 0.35 + Math.random() * 0.7 : 0.55 + Math.random() * 1.7;
    phases[i] = Math.random() * Math.PI * 2;
  }

  return { positions, colors, sizes, phases };
}

function StarField({ count, kind, speed }: { count: number; kind: "galaxy" | "dust"; speed: number }) {
  const points = useRef<THREE.Points>(null);
  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);
  const data = useMemo(() => buildStars(count, kind), [count, kind]);

  useFrame((state, dt) => {
    uniforms.uTime.value = state.clock.elapsedTime;
    if (points.current) points.current.rotation.y += dt * speed;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[data.positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[data.colors, 3]} />
        <bufferAttribute attach="attributes-aSize" args={[data.sizes, 1]} />
        <bufferAttribute attach="attributes-aPhase" args={[data.phases, 1]} />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={starVertex}
        fragmentShader={starFragment}
        uniforms={uniforms}
        vertexColors
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export default function Galaxy() {
  return (
    <>
      <StarField count={13000} kind="galaxy" speed={0.0045} />
      <StarField count={1700} kind="dust" speed={-0.009} />
    </>
  );
}
