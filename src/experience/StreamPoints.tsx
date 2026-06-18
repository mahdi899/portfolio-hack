import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { COUNT } from "./store";

export interface StreamHandle {
  uniforms: {
    uTime: { value: number };
    uOpacity: { value: number };
    uP0: { value: THREE.Vector3 };
    uP1: { value: THREE.Vector3 };
    uP2: { value: THREE.Vector3 };
  };
}

interface Props {
  p0: [number, number, number];
  p1: [number, number, number];
  p2: [number, number, number];
  color: string;
  /** color at end of the path (defaults to color) */
  color2?: string;
  count?: number;
  size?: number;
  speed?: number;
  jitter?: number;
  /** shrink + vanish at the very end (used for leak sinks) */
  sink?: boolean;
  /** called every frame, returns stream opacity 0..1 */
  getOpacity: () => number;
  /** optional per-frame mutation of curve endpoints */
  onFrame?: (h: StreamHandle, t: number) => void;
}

const VERT = /* glsl */ `
attribute float aT;
attribute vec3 aJitter;
attribute float aScale;
uniform float uTime, uSpeed, uSize, uJitter;
uniform vec3 uP0, uP1, uP2;
varying float vA;
varying float vT;
void main() {
  float t = fract(aT + uTime * uSpeed);
  vT = t;
  vec3 a = mix(uP0, uP1, t);
  vec3 b = mix(uP1, uP2, t);
  vec3 pos = mix(a, b, t);
  pos += aJitter * uJitter * (0.35 + 0.65 * sin(t * 14.0 + aT * 43.0));
  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  float tail = 1.0 - smoothstep(mix(0.82, 0.6, SINK), 1.0, t);
  vA = smoothstep(0.0, 0.1, t) * tail;
  gl_PointSize = uSize * aScale * (160.0 / max(1.0, -mv.z)) * mix(1.0, 1.0 - t * 0.8, SINK);
  gl_Position = projectionMatrix * mv;
}
`;

const FRAG = /* glsl */ `
uniform vec3 uColor, uColor2;
uniform float uOpacity;
varying float vA;
varying float vT;
void main() {
  vec2 d = gl_PointCoord - 0.5;
  float m = smoothstep(0.5, 0.05, length(d));
  vec3 col = mix(uColor, uColor2, vT);
  float a = m * vA * uOpacity;
  if (a < 0.004) discard;
  gl_FragColor = vec4(col * (1.0 + m * 1.4), a);
}
`;

export default function StreamPoints({
  p0,
  p1,
  p2,
  color,
  color2,
  count = 160,
  size = 1.6,
  speed = 0.12,
  jitter = 0.5,
  sink = false,
  getOpacity,
  onFrame,
}: Props) {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const pts = useRef<THREE.Points>(null);
  const n = COUNT(count);

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const t = new Float32Array(n);
    const jit = new Float32Array(n * 3);
    const sc = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      t[i] = Math.random();
      jit[i * 3] = (Math.random() - 0.5) * 2;
      jit[i * 3 + 1] = (Math.random() - 0.5) * 2;
      jit[i * 3 + 2] = (Math.random() - 0.5) * 2;
      sc[i] = 0.5 + Math.random();
    }
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(n * 3), 3));
    g.setAttribute("aT", new THREE.BufferAttribute(t, 1));
    g.setAttribute("aJitter", new THREE.BufferAttribute(jit, 3));
    g.setAttribute("aScale", new THREE.BufferAttribute(sc, 1));
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 10000);
    return g;
  }, [n]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSpeed: { value: speed },
      uSize: { value: size },
      uJitter: { value: jitter },
      uOpacity: { value: 0 },
      uP0: { value: new THREE.Vector3(...p0) },
      uP1: { value: new THREE.Vector3(...p1) },
      uP2: { value: new THREE.Vector3(...p2) },
      uColor: { value: new THREE.Color(color) },
      uColor2: { value: new THREE.Color(color2 ?? color) },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useFrame((state) => {
    if (!mat.current || !pts.current) return;
    const o = getOpacity();
    uniforms.uOpacity.value = o;
    pts.current.visible = o > 0.004;
    if (!pts.current.visible) return;
    uniforms.uTime.value = state.clock.elapsedTime;
    onFrame?.({ uniforms }, state.clock.elapsedTime);
  });

  return (
    <points ref={pts} geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={mat}
        uniforms={uniforms}
        vertexShader={VERT}
        fragmentShader={FRAG}
        defines={{ SINK: sink ? "1.0" : "0.0" }}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
