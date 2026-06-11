import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { journey, smoothstep } from "./store";

/**
 * Camera keyframes for the journey. `t` is scroll progress;
 * positions are sampled through a Catmull-Rom curve with a
 * piecewise time remap so each scene lands where the story needs it.
 */
const KEYS: { t: number; p: [number, number, number] }[] = [
  { t: 0.0, p: [0, 9, 110] }, // arrival — deep space
  { t: 0.1, p: [5, 7, 74] }, // approach
  { t: 0.24, p: [27, 8, 34] }, // traffic orbit
  { t: 0.36, p: [8, 5, 27] }, // diving inward
  { t: 0.48, p: [-23, 6, 15] }, // automation orbit
  { t: 0.58, p: [-13, 2, 17] }, // crossing
  { t: 0.68, p: [14, -3.5, 18.5] }, // revenue orbit, close pass
  { t: 0.8, p: [3, 9, 24] }, // rising
  { t: 1.0, p: [0, 34, 62] }, // full system overview
];

export default function CameraRig() {
  const curve = useMemo(
    () =>
      new THREE.CatmullRomCurve3(
        KEYS.map((k) => new THREE.Vector3(...k.p)),
        false,
        "catmullrom",
        0.5
      ),
    []
  );

  const pos = useMemo(() => new THREE.Vector3(), []);
  const look = useMemo(() => new THREE.Vector3(), []);
  const mouse = useRef(new THREE.Vector2(0, 0));
  const mouseSm = useRef(new THREE.Vector2(0, 0));

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      mouse.current.set(
        (e.clientX / window.innerWidth) * 2 - 1,
        -(e.clientY / window.innerHeight) * 2 + 1
      );
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  const remap = (p: number) => {
    const n = KEYS.length - 1;
    for (let i = 0; i < n; i++) {
      const a = KEYS[i].t;
      const b = KEYS[i + 1].t;
      if (p <= b) return (i + (p - a) / (b - a)) / n;
    }
    return 1;
  };

  useFrame((state, dt) => {
    // damp scroll for cinematic motion
    journey.smooth += (journey.progress - journey.smooth) * Math.min(1, dt * 3.2);
    const p = journey.smooth;

    // orbital + system activation states
    journey.traffic = smoothstep(0.13, 0.22, p);
    journey.automation = smoothstep(0.36, 0.45, p);
    journey.revenue = smoothstep(0.56, 0.65, p);
    journey.activation = smoothstep(0.78, 0.92, p);

    curve.getPoint(remap(p), pos);

    // gentle pointer parallax
    mouseSm.current.lerp(mouse.current, Math.min(1, dt * 2.2));
    const mx = mouseSm.current.x;
    const my = mouseSm.current.y;

    // subtle perpetual drift so the universe never feels frozen
    const t = state.clock.elapsedTime;
    const driftX = Math.sin(t * 0.11) * 0.5;
    const driftY = Math.cos(t * 0.09) * 0.35;

    state.camera.position.set(
      pos.x + mx * 1.8 + driftX,
      pos.y + my * 1.1 + driftY,
      pos.z
    );
    look.set(-mx * 3.2, -my * 2.0 + 0.5, 0);
    state.camera.lookAt(look);
  });

  return null;
}
