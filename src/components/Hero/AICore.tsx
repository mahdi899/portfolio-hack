import { Suspense, lazy } from "react";
import { motion } from "framer-motion";
import { useSystemState } from "../../state/useSystemState";
import { useDeviceTier } from "../../hooks/useDeviceTier";
import { useInView } from "../../hooks/useInView";

const AICore3D = lazy(() => import("../../three/AICore3D"));

/**
 * The central AI core. Renders a true volumetric 3D core (rings, orbits,
 * fresnel shader, particles, bloom) on capable devices, and falls back to the
 * CSS core otherwise. It powers up through the boot sequence and intensifies
 * while the system is "thinking" (a node is active).
 */
export function AICore() {
  const { bootPhase, activeNode, reducedMotion } = useSystemState();
  const profile = useDeviceTier();
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.05 }, false);
  const thinking = activeNode !== null;
  const energized = bootPhase >= 3;
  const energy = thinking ? 1 : energized ? 0.32 : 0.06;

  if (profile.webgl) {
    return (
      <div
        ref={ref}
        className={`core core--3d ${energized ? "core--on" : ""} ${thinking ? "core--think" : ""}`}
      >
        <div className="core__halo" />
        <Suspense fallback={<CssCore thinking={thinking} reducedMotion={reducedMotion} />}>
          <AICore3D
            energy={energy}
            reduced={reducedMotion}
            paused={!inView}
            bloom={profile.bloom}
            dpr={profile.dpr}
          />
        </Suspense>
      </div>
    );
  }

  return (
    <div className={`core ${energized ? "core--on" : ""} ${thinking ? "core--think" : ""}`}>
      <div className="core__halo" />
      <CssCore thinking={thinking} reducedMotion={reducedMotion} />
    </div>
  );
}

function CssCore({ thinking, reducedMotion }: { thinking: boolean; reducedMotion: boolean }) {
  const ringSpeed = reducedMotion ? 0 : thinking ? 1 : 0.45;
  return (
    <>
      <motion.div
        className="core__ring core__ring--a"
        animate={reducedMotion ? {} : { rotate: 360 }}
        transition={{ duration: 14 / (ringSpeed || 0.45), ease: "linear", repeat: Infinity }}
      />
      <motion.div
        className="core__ring core__ring--b"
        animate={reducedMotion ? {} : { rotate: -360 }}
        transition={{ duration: 22 / (ringSpeed || 0.45), ease: "linear", repeat: Infinity }}
      />
      <motion.div
        className="core__ring core__ring--c"
        animate={reducedMotion ? {} : { rotate: 360 }}
        transition={{ duration: 30 / (ringSpeed || 0.45), ease: "linear", repeat: Infinity }}
      />

      <div className="core__orbit">
        {[0, 1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className="core__electron"
            style={{ transform: `rotate(${i * 72}deg) translateX(74px)` }}
          />
        ))}
      </div>

      <motion.div
        className="core__sphere"
        animate={reducedMotion ? {} : { scale: thinking ? [1, 1.07, 1] : [1, 1.03, 1] }}
        transition={{ duration: thinking ? 1.1 : 2.4, ease: "easeInOut", repeat: Infinity }}
      >
        <span className="core__glyph">N</span>
        <span className="core__scan" />
      </motion.div>
    </>
  );
}
