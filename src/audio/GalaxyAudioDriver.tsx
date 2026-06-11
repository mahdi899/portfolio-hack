import { useEffect } from "react";
import { galaxyAudio } from "./galaxyAudio";

/** Syncs scroll / journey state to procedural galaxy audio every frame. */
export default function GalaxyAudioDriver() {
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      if (galaxyAudio.enabled) galaxyAudio.syncJourney();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return null;
}
