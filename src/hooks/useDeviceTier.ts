import { useEffect, useState } from "react";

export type DeviceTier = "high" | "mid" | "low";

export interface DeviceProfile {
  tier: DeviceTier;
  /** allow the heavy WebGL stage at all */
  webgl: boolean;
  /** particle budget for the volumetric field */
  particles: number;
  /** cap on devicePixelRatio for the R3F canvas */
  dpr: [number, number];
  /** enable bloom postprocessing */
  bloom: boolean;
}

function detect(): DeviceProfile {
  if (typeof window === "undefined") {
    return { tier: "mid", webgl: true, particles: 1400, dpr: [1, 1.5], bloom: true };
  }

  const cores = navigator.hardwareConcurrency ?? 4;
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const small = window.innerWidth < 760;

  // Probe for a working WebGL context.
  let hasWebgl = false;
  try {
    const c = document.createElement("canvas");
    hasWebgl = !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    hasWebgl = false;
  }

  if (!hasWebgl) {
    return { tier: "low", webgl: false, particles: 0, dpr: [1, 1], bloom: false };
  }

  const weak = cores <= 4 || mem <= 4 || (coarse && small);
  if (weak) {
    return {
      tier: "low",
      webgl: true,
      particles: 700,
      dpr: [1, 1.2],
      bloom: false,
    };
  }

  const mid = cores <= 8 || mem <= 8 || coarse;
  if (mid) {
    return {
      tier: "mid",
      webgl: true,
      particles: 1600,
      dpr: [1, 1.5],
      bloom: true,
    };
  }

  return {
    tier: "high",
    webgl: true,
    particles: 2600,
    dpr: [1, 1.75],
    bloom: true,
  };
}

/**
 * Detects a coarse device capability tier once on mount and gates the
 * expensive WebGL features (particle counts, DPR, bloom) accordingly.
 */
export function useDeviceTier(): DeviceProfile {
  const [profile, setProfile] = useState<DeviceProfile>(() => ({
    tier: "mid",
    webgl: false,
    particles: 0,
    dpr: [1, 1.5],
    bloom: false,
  }));

  useEffect(() => {
    setProfile(detect());
  }, []);

  return profile;
}
