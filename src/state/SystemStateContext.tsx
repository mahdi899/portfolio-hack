import {
  createContext,
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { pathFromNode, NODE_BY_ID } from "../data/system";
import { DEFAULT_PROFILE, PROFILE_BY_ID, type SystemProfile } from "../data/profiles";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { useBootSequence, type BootPhase } from "../hooks/useBootSequence";
import { useIdle } from "../hooks/useIdle";

export type CtaPhase = "idle" | "locking" | "locked";

export interface SystemState {
  /** node the user is actively hovering */
  userNode: string | null;
  setUserNode: (id: string | null) => void;
  /** node the autonomous ghost run is currently lighting */
  ghostNode: string | null;
  setGhostNode: (id: string | null) => void;

  /** resolved active node (user takes priority over ghost) */
  activeNode: string | null;
  /** input -> revenue path that should be highlighted */
  activePath: string[];
  isGhost: boolean;
  /** legible HUD status string near the core */
  hudLabel: string;

  /** current business profile */
  profile: SystemProfile;
  profileId: string;
  setProfile: (id: string) => void;

  bootPhase: BootPhase;
  booted: boolean;
  idle: boolean;
  reducedMotion: boolean;

  ctaPhase: CtaPhase;
  triggerLock: () => void;
  resetCta: () => void;
}

export const SystemStateContext = createContext<SystemState | null>(null);

export function SystemStateProvider({ children }: { children: ReactNode }) {
  const reducedMotion = useReducedMotion();
  const { phase: bootPhase, booted } = useBootSequence(reducedMotion);
  const idle = useIdle(5000);

  const [userNode, setUserNode] = useState<string | null>(null);
  const [ghostNode, setGhostNode] = useState<string | null>(null);
  const [profileId, setProfileId] = useState<string>(DEFAULT_PROFILE);
  const [ctaPhase, setCtaPhase] = useState<CtaPhase>("idle");

  const profile = PROFILE_BY_ID[profileId] ?? PROFILE_BY_ID[DEFAULT_PROFILE];

  const activeNode = userNode ?? ghostNode;
  const isGhost = userNode === null && ghostNode !== null;

  const activePath = useMemo(() => pathFromNode(activeNode), [activeNode]);

  const hudLabel = useMemo(() => {
    if (activeNode) {
      const n = NODE_BY_ID[activeNode];
      const name = (n?.label ?? activeNode).toUpperCase();
      if (activeNode === "revenue") return "OUTPUT // REVENUE LOCKED";
      return `RE-ROUTING // ${name} -> REVENUE`;
    }
    return profile.hudLabel;
  }, [activeNode, profile]);

  const setProfile = useCallback((id: string) => setProfileId(id), []);

  const triggerLock = useCallback(() => {
    setCtaPhase("locking");
    window.setTimeout(() => setCtaPhase("locked"), 1500);
  }, []);

  const resetCta = useCallback(() => setCtaPhase("idle"), []);

  const value: SystemState = {
    userNode,
    setUserNode,
    ghostNode,
    setGhostNode,
    activeNode,
    activePath,
    isGhost,
    hudLabel,
    profile,
    profileId,
    setProfile,
    bootPhase,
    booted,
    idle,
    reducedMotion,
    ctaPhase,
    triggerLock,
    resetCta,
  };

  return (
    <SystemStateContext.Provider value={value}>
      {children}
    </SystemStateContext.Provider>
  );
}
