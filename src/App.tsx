import { Suspense, useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Experience from "./journey/Experience";
import Overlay from "./ui/Overlay";
import AudioControl from "./ui/AudioControl";
import GalaxyAudioDriver from "./audio/GalaxyAudioDriver";
import { bindAudioUnlock } from "./audio/galaxyAudio";
import { journey } from "./journey/store";

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cleanup = bindAudioUnlock();
    return cleanup;
  }, []);

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
          camera={{ fov: 50, near: 0.1, far: 900, position: [0, 9, 110] }}
          gl={{ antialias: false, powerPreference: "high-performance" }}
          onCreated={({ gl }) => {
            // keep native page scrolling alive on touch devices
            gl.domElement.style.touchAction = "pan-y";
          }}
        >
          <Suspense fallback={null}>
            <Experience />
          </Suspense>
        </Canvas>
      </div>

      <Overlay />
      <AudioControl />
      <GalaxyAudioDriver />

      {/* invisible scroll runway — the journey is 800vh deep */}
      <div ref={scrollRef} className="scroll-space" aria-hidden="true" />
    </>
  );
}
