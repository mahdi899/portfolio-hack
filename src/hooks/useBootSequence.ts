import { useEffect, useState } from "react";

/**
 * Staged power-up state machine for the cinematic boot.
 * 0 dark -> 1 glow ramp -> 2 core pulse -> 3 rings spin up ->
 * 4 connections igniting -> 5 operational.
 */
export type BootPhase = 0 | 1 | 2 | 3 | 4 | 5;

const STEPS: { phase: BootPhase; at: number }[] = [
  { phase: 1, at: 200 },
  { phase: 2, at: 900 },
  { phase: 3, at: 1500 },
  { phase: 4, at: 2100 },
  { phase: 5, at: 3200 },
];

export function useBootSequence(reduced: boolean) {
  const [phase, setPhase] = useState<BootPhase>(0);

  useEffect(() => {
    if (reduced) {
      setPhase(5);
      return;
    }
    const timers = STEPS.map((s) =>
      window.setTimeout(() => setPhase(s.phase), s.at)
    );
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [reduced]);

  return { phase, booted: phase >= 5 } as const;
}
