import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import StreamPoints from "./StreamPoints";
import { journey, sceneFade } from "./store";
import { leadCardTexture } from "./textures";
import { P } from "./palette";

const CARD_DATA = [
  {
    title: "Lead #2841",
    accent: P.pink,
    fields: [
      { k: "Source", v: "Instagram DM", accent: P.pink },
      { k: "Intent", v: "Service Inquiry" },
      { k: "Status", v: "New Lead", accent: P.cyan },
      { k: "Contact", v: "Captured", accent: P.mint },
    ],
  },
  {
    title: "Lead #2842",
    accent: P.cyan,
    fields: [
      { k: "Source", v: "Landing Page", accent: P.cyan },
      { k: "Intent", v: "Pricing Request" },
      { k: "Status", v: "New Lead", accent: P.cyan },
      { k: "Contact", v: "Captured", accent: P.mint },
    ],
  },
  {
    title: "Lead #2843",
    accent: P.purpleSoft,
    fields: [
      { k: "Source", v: "Meta Ads", accent: P.purpleSoft },
      { k: "Intent", v: "Consultation" },
      { k: "Status", v: "New Lead", accent: P.cyan },
      { k: "Contact", v: "Captured", accent: P.mint },
    ],
  },
  {
    title: "Lead #2844",
    accent: P.mint,
    fields: [
      { k: "Source", v: "WhatsApp", accent: P.mint },
      { k: "Intent", v: "Follow-Up Reply" },
      { k: "Status", v: "New Lead", accent: P.cyan },
      { k: "Contact", v: "Captured", accent: P.mint },
    ],
  },
  {
    title: "Lead #2845",
    accent: P.pink,
    fields: [
      { k: "Source", v: "Story Reply", accent: P.pink },
      { k: "Intent", v: "Question" },
      { k: "Status", v: "New Lead", accent: P.cyan },
      { k: "Contact", v: "Captured", accent: P.mint },
    ],
  },
  {
    title: "Lead #2846",
    accent: P.cyan,
    fields: [
      { k: "Source", v: "Form Submit", accent: P.cyan },
      { k: "Intent", v: "Demo Request" },
      { k: "Status", v: "New Lead", accent: P.cyan },
      { k: "Contact", v: "Captured", accent: P.mint },
    ],
  },
];

interface CardState {
  t: number;
  dur: number;
  from: THREE.Vector3;
  wobble: number;
}

const TARGET = new THREE.Vector3(0, 0, -5);

const spawn = (s: CardState, first = false) => {
  const side = Math.random() > 0.5 ? 1 : -1;
  s.from.set(
    side * (9 + Math.random() * 8),
    (Math.random() - 0.5) * 9 - 1,
    6 + Math.random() * 6
  );
  s.dur = 7 + Math.random() * 4;
  s.t = first ? Math.random() : 0;
  s.wobble = Math.random() * Math.PI * 2;
};

export default function SceneCapture() {
  const group = useRef<THREE.Group>(null);
  const textures = useMemo(
    () => CARD_DATA.map((c) => leadCardTexture(c.title, c.fields, c.accent)),
    []
  );
  const states = useMemo(
    () =>
      CARD_DATA.map(() => {
        const s: CardState = { t: 0, dur: 8, from: new THREE.Vector3(), wobble: 0 };
        spawn(s, true);
        return s;
      }),
    []
  );
  const op = () => sceneFade(journey.smooth, "capture");
  const tmp = useMemo(() => new THREE.Vector3(), []);

  useFrame((state, dt) => {
    if (!group.current) return;
    const w = op();
    group.current.visible = w > 0.004;
    if (!group.current.visible) return;
    const t = state.clock.elapsedTime;

    group.current.children.forEach((card, i) => {
      const s = states[i];
      s.t += dt / s.dur;
      if (s.t >= 1) spawn(s);
      const e = s.t * s.t * (3 - 2 * s.t); // ease toward the core
      tmp.copy(s.from).lerp(TARGET, e * e);
      tmp.y += Math.sin(t * 0.8 + s.wobble) * 0.5;
      card.position.copy(tmp);
      card.quaternion.copy(state.camera.quaternion);
      card.rotation.z = Math.sin(t * 0.5 + s.wobble) * 0.04;
      const appear = Math.min(1, s.t / 0.12);
      const absorb = 1 - Math.max(0, (s.t - 0.82) / 0.18);
      card.scale.setScalar((0.55 + 0.45 * appear) * Math.max(0.05, absorb));
      const m = (card as THREE.Mesh).material as THREE.MeshBasicMaterial;
      m.opacity = w * appear * absorb;
    });
  });

  return (
    <>
      <group ref={group}>
        {CARD_DATA.map((c, i) => (
          <mesh key={c.title}>
            <planeGeometry args={[5.6, 3.4]} />
            <meshBasicMaterial
              map={textures[i]}
              transparent
              opacity={0}
              depthWrite={false}
              side={THREE.DoubleSide}
            />
          </mesh>
        ))}
      </group>

      {/* raw signals still feeding in behind the cards */}
      <StreamPoints
        p0={[-30, 9, -14]}
        p1={[-12, 4, 2]}
        p2={[0, 0, -5]}
        color={P.pink}
        color2={P.purple}
        count={110}
        size={1.7}
        speed={0.09}
        jitter={0.7}
        getOpacity={op}
      />
      <StreamPoints
        p0={[31, 7, -12]}
        p1={[14, 2, 4]}
        p2={[0, 0, -5]}
        color={P.cyan}
        color2={P.mint}
        count={110}
        size={1.7}
        speed={0.08}
        jitter={0.7}
        getOpacity={op}
      />
      <StreamPoints
        p0={[-6, -16, 6]}
        p1={[-2, -7, 8]}
        p2={[0, 0, -5]}
        color={P.purpleSoft}
        count={90}
        size={1.6}
        speed={0.07}
        jitter={0.6}
        getOpacity={op}
      />
    </>
  );
}
