import { useContext } from "react";
import { SystemStateContext, type SystemState } from "./SystemStateContext";

export function useSystemState(): SystemState {
  const ctx = useContext(SystemStateContext);
  if (!ctx) {
    throw new Error("useSystemState must be used within a SystemStateProvider");
  }
  return ctx;
}
