export type LeverPhase = "idle" | "pulling" | "returning";

interface LeverCycleOptions {
  onPhaseChange: (phase: LeverPhase) => void;
  onBottom: () => void;
}

export function createLeverCycle({ onPhaseChange, onBottom }: LeverCycleOptions) {
  let phase: LeverPhase = "idle";

  function changePhase(next: LeverPhase) {
    phase = next;
    onPhaseChange(next);
  }

  return {
    pull() {
      if (phase === "idle") changePhase("pulling");
    },
    bottomReached() {
      if (phase !== "pulling") return;
      changePhase("returning");
      onBottom();
    },
    returned() {
      if (phase === "returning") changePhase("idle");
    },
    cancel() {
      phase = "idle";
    },
  };
}
