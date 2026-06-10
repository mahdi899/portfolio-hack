import { Suspense, lazy, useEffect, useState } from "react";
import { useSystemState } from "../state/useSystemState";
import { useDeviceTier } from "../hooks/useDeviceTier";
import { Background } from "./Background";
import "./WebGLBackground.css";

const Stage = lazy(() => import("../three/Stage"));

/**
 * Chooses the living background: the heavy volumetric WebGL stage on capable
 * devices, or the lightweight Canvas2D field as a fallback. The Canvas2D grid
 * + vignette always render underneath for instant paint and graceful failure.
 */
export function WebGLBackground() {
  const { activeNode, booted, reducedMotion } = useSystemState();
  const profile = useDeviceTier();
  const [failed, setFailed] = useState(false);

  // energy target the 3D field eases toward
  const energy = activeNode ? 1 : booted ? 0.28 : 0.05;

  useEffect(() => {
    const onErr = (e: ErrorEvent) => {
      if (typeof e.message === "string" && /webgl|context|three/i.test(e.message)) {
        setFailed(true);
      }
    };
    window.addEventListener("error", onErr);
    return () => window.removeEventListener("error", onErr);
  }, []);

  const useWebgl = profile.webgl && !failed;

  return (
    <div className="webgl-bg" aria-hidden="true">
      <div className="webgl-bg__base" />
      {useWebgl && (
        <div className="webgl-layer">
          <Suspense fallback={null}>
            <Stage
              particles={profile.particles}
              energy={energy}
              reduced={reducedMotion}
              bloom={profile.bloom}
              dpr={profile.dpr}
            />
          </Suspense>
        </div>
      )}
      <Background overlay={useWebgl} />
    </div>
  );
}
