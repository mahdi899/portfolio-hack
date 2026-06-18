import { Suspense, useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Experience from "./experience/Experience";
import Overlay from "./overlay/Overlay";
import { journey } from "./experience/store";

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const st = ScrollTrigger.create({
      trigger: scrollRef.current!,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        journey.progress = self.progress;
      },
    });
    return () => st.kill();
  }, []);

  return (
    <>
      <div className="canvas-root">
        <Canvas
          dpr={[1, 1.75]}
          camera={{ fov: 50, near: 0.1, far: 700, position: [0, 18, 86] }}
          gl={{ antialias: false, powerPreference: "high-performance" }}
          onCreated={({ gl }) => {
            gl.domElement.style.touchAction = "pan-y";
          }}
        >
          <Suspense fallback={null}>
            <Experience />
          </Suspense>
        </Canvas>
      </div>

      <Overlay />

      {/* invisible scroll runway driving the journey */}
      <div ref={scrollRef} className="scroll-space" aria-hidden="true" />
    </>
  );
}
