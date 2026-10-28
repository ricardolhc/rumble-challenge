import { useLayoutEffect, useRef, useState } from "react";
import type { AnimationEvent } from "react";
import { createLeverCycle } from "../../utils/leverPull.utils";
import type { LeverPhase } from "../../utils/leverPull.utils";

interface SlotMachineLeverProps {
  disabled: boolean;
  isSelecting: boolean;
  label: string;
  selectingLabel: string;
  onDraw: () => void;
  onPullingChange?: (pulling: boolean) => void;
}

export function SlotMachineLever({
  disabled,
  isSelecting,
  label,
  selectingLabel,
  onDraw,
  onPullingChange,
}: SlotMachineLeverProps) {
  const [phase, setPhase] = useState<LeverPhase>("idle");
  const callbacksRef = useRef({ onDraw, onPullingChange });
  useLayoutEffect(() => {
    callbacksRef.current = { onDraw, onPullingChange };
  }, [onDraw, onPullingChange]);

  const cycleRef = useRef<ReturnType<typeof createLeverCycle> | null>(null);

  useLayoutEffect(() => {
    const cycle = createLeverCycle({
      onPhaseChange(next) {
        setPhase(next);
        callbacksRef.current.onPullingChange?.(next !== "idle");
      },
      onBottom() {
        callbacksRef.current.onDraw();
      },
    });
    cycleRef.current = cycle;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    function finishWithoutMotion() {
      if (!motion.matches) return;
      cycle.bottomReached();
      cycle.returned();
    }
    motion.addEventListener("change", finishWithoutMotion);
    return () => {
      motion.removeEventListener("change", finishWithoutMotion);
      cycle.cancel();
      cycleRef.current = null;
      callbacksRef.current.onPullingChange?.(false);
    };
  }, []);

  function pull() {
    const cycle = cycleRef.current;
    if (disabled || phase !== "idle" || !cycle) return;
    cycle.pull();
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      cycle.bottomReached();
      cycle.returned();
    }
  }

  function handleAnimationEnd(event: AnimationEvent<HTMLButtonElement>) {
    if (event.animationName === "slot-machine-lever-down") cycleRef.current?.bottomReached();
    if (event.animationName === "slot-machine-lever-up") cycleRef.current?.returned();
  }

  const busy = isSelecting || phase !== "idle";
  const accessibleLabel = busy ? selectingLabel : label;

  return (
    <div className="slot-machine__lever-control">
      <button
        type="button"
        className={`slot-machine__lever slot-machine__lever--${phase}`}
        onClick={pull}
        onAnimationEnd={handleAnimationEnd}
        disabled={disabled || phase !== "idle"}
        aria-label={accessibleLabel}
        aria-busy={busy}
        title={accessibleLabel}
      >
        <span className="slot-machine__lever-base" aria-hidden="true" />
        <span className="slot-machine__lever-arm" aria-hidden="true">
          <span className="slot-machine__lever-shaft" />
          <span className="slot-machine__lever-grip" />
        </span>
        <span className="slot-machine__lever-collar" aria-hidden="true" />
      </button>
    </div>
  );
}
