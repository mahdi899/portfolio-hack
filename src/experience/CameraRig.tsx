import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { journey, RANGES, smoothstep } from "./store";

interface Key {
  p: number;
  pos: [number, number, number];
  look: [number, number, number];
}

const R = RANGES;

/** cinematic camera path through the whole story */
const KEYS: Key[] = [
  { p: -0.001, pos: [0, 9, 56], look: [0, 1.5, 0] },
  { p: R.hero[1] * 0.62, pos: [0, 6, 48], look: [0, 1, 0] },
  { p: R.hero[1], pos: [0, 6.5, 44], look: [0, 0, 0] },
  { p: R.problem[0] + 0.025, pos: [0, 8, 42], look: [0, -2, 0] },
  { p: R.problem[1] - 0.01, pos: [2.5, 7, 40], look: [0, -2, 0] },
  { p: (R.traffic[0] + R.traffic[1]) / 2, pos: [0, 2, 48], look: [0, 0, 0] },
  { p: (R.capture[0] + R.capture[1]) / 2, pos: [0, 0.5, 36], look: [0, 0, 0] },
  { p: (R.gate[0] + R.gate[1]) / 2, pos: [0, 0, 45], look: [0, 0, 0] },
  { p: R.gate[1] - 0.01, pos: [3, 1.5, 45], look: [0, 0, 0] },
  { p: (R.agents[0] + R.agents[1]) / 2, pos: [10, 9, 42], look: [0, 0, 0] },
  { p: R.tunnel[0] + 0.008, pos: [0, 0.5, 30], look: [0, 0, -60] },
  { p: R.tunnel[1] - 0.004, pos: [0, 1.2, -126], look: [0, 1.4, -160] },
  { p: (R.crm[0] + R.crm[1]) / 2, pos: [0, 3, -133.5], look: [0, 1, -160] },
  { p: R.crm[1] - 0.008, pos: [1.5, 2.6, -135], look: [0, 1, -160] },
  { p: R.human[0] + 0.018, pos: [-4, 2.8, -138], look: [0.5, 1.4, -160] },
  { p: R.human[1] - 0.008, pos: [-1.5, 3.4, -139.5], look: [0, 1.2, -160] },
  { p: R.revenue[0] + 0.045, pos: [0, 11, 64], look: [0, 0, 0] },
  { p: R.revenue[1] - 0.005, pos: [0, 8, 58], look: [0, 0, 0] },
  { p: 0.97, pos: [0, 4, 66], look: [0, 1, 0] },
  { p: 1.001, pos: [0, 4.5, 70], look: [0, 1, 0] },
];

export default function CameraRig() {
  const pointer = useRef({ x: 0, y: 0 });
  const pos = useMemo(() => new THREE.Vector3(), []);
  const look = useMemo(() => new THREE.Vector3(), []);
  const a = useMemo(() => new THREE.Vector3(), []);
  const b = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useFrame((state, dt) => {
    journey.smooth = THREE.MathUtils.damp(
      journey.smooth,
      journey.progress,
      3.4,
      Math.min(dt, 0.05)
    );
    const p = journey.smooth;
    const t = state.clock.elapsedTime;

    let i = 0;
    while (i < KEYS.length - 2 && KEYS[i + 1].p < p) i++;
    const k0 = KEYS[i];
    const k1 = KEYS[i + 1];
    const k = smoothstep(k0.p, k1.p, p);

    a.set(...k0.pos);
    b.set(...k1.pos);
    pos.lerpVectors(a, b, k);
    a.set(...k0.look);
    b.set(...k1.look);
    look.lerpVectors(a, b, k);

    // gentle idle drift + pointer parallax
    pos.x += Math.sin(t * 0.23) * 0.5 + pointer.current.x * 1.6;
    pos.y += Math.cos(t * 0.19) * 0.35 - pointer.current.y * 1.1;

    state.camera.position.lerp(pos, 1 - Math.exp(-dt * 5));
    state.camera.lookAt(look);
  });

  return null;
}
