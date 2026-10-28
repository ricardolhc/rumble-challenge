import type { CharacterWithIndex, SlotMachineFrame, SlotMachineReel } from "../selection.types";
import type { DrawSpeed } from "../components/settings/settings.types";

interface SlotMachineOptions {
  team: CharacterWithIndex[];
  candidatesByMember: CharacterWithIndex[][];
  speed: DrawSpeed;
}

const SPEED_CONFIG = {
  fast: { spinSteps: 16, staggerSteps: 12, brakeSteps: 8, finalDelay: 220 },
  medium: { spinSteps: 24, staggerSteps: 15, brakeSteps: 10, finalDelay: 300 },
  slow: { spinSteps: 32, staggerSteps: 18, brakeSteps: 12, finalDelay: 400 },
  "super-slow": { spinSteps: 40, staggerSteps: 20, brakeSteps: 14, finalDelay: 500 },
};

const SPIN_DELAY = 40;
let animationSequence = 0;

export function synchronizeSlotReel(
  movement: Pick<Animation, "currentTime" | "updatePlaybackRate">,
  elapsed: number,
  duration: number,
  locked: boolean,
) {
  const expected = Math.min(duration, Math.max(0, elapsed));
  const current = typeof movement.currentTime === "number" ? movement.currentTime : 0;
  const drift = expected - current;

  if (locked || Math.abs(drift) > 160) {
    movement.currentTime = locked ? duration : expected;
    movement.updatePlaybackRate(1);
    return;
  }

  // Correct ordinary timer/network jitter gradually instead of jumping cards.
  movement.updatePlaybackRate(1 + Math.max(-0.08, Math.min(0.08, drift / 800)));
}

export function createSlotMachineFrames({
  team,
  candidatesByMember,
  speed,
}: SlotMachineOptions): SlotMachineFrame[] {
  if (team.length === 0) return [];

  const config = speed === "instant" ? null : SPEED_CONFIG[speed];
  let previousStop = 0;
  const reels: SlotMachineReel[] = team.map((target, slot) => {
    // Keep other winners out of this reel so a stopped character never repeats.
    const otherWinners = new Set(
      team.filter((_, index) => index !== slot).map(item => item.character.name),
    );
    const eligible = candidatesByMember[slot].filter(
      item => !otherWinners.has(item.character.name),
    );
    const pool = eligible.length > 0 ? eligible : [target];
    const indexes: number[] = [];
    const times = [0];

    function nextIndex(avoidTarget = false) {
      let candidates = pool.filter(item => item.index !== indexes.at(-1));
      if (avoidTarget && candidates.some(item => item.index !== target.index)) {
        candidates = candidates.filter(item => item.index !== target.index);
      }
      if (candidates.length === 0) candidates = pool;
      return candidates[Math.floor(Math.random() * candidates.length)].index;
    }

    function neighbors() {
      const beforePool = pool.filter(item => item.index !== indexes[0]);
      const beforeIndex = beforePool.length > 0
        ? beforePool[Math.floor(Math.random() * beforePool.length)].index
        : undefined;
      const aboveWinner = indexes.length > 1 ? indexes.at(-2) : beforeIndex;
      const afterPool = pool.filter(item => item.index !== target.index);
      const different = afterPool.filter(item => item.index !== aboveWinner);
      const afterOptions = different.length > 0 ? different : afterPool;
      const afterIndex = afterOptions.length > 0
        ? afterOptions[Math.floor(Math.random() * afterOptions.length)].index
        : undefined;
      return { beforeIndex, afterIndex };
    }

    if (!config) {
      indexes.push(target.index);
      return { indexes, times, duration: 0, ...neighbors() };
    }

    indexes.push(nextIndex());
    // The next reel keeps its full speed through the previous reel's entire
    // stop, then gets its own braking phase after a short fast-spin interval.
    const spinUntil = slot === 0
      ? config.spinSteps * SPIN_DELAY
      : previousStop + config.staggerSteps * SPIN_DELAY;
    const spinSteps = Math.ceil(spinUntil / SPIN_DELAY);
    for (let step = 0; step < spinSteps; step++) {
      times.push(times.at(-1)! + SPIN_DELAY);
      indexes.push(nextIndex());
    }

    for (let step = 1; step <= config.brakeSteps; step++) {
      const delay = step === config.brakeSteps ? config.finalDelay * 2 : Math.round(
        SPIN_DELAY + (config.finalDelay - SPIN_DELAY) * (step / config.brakeSteps) ** 2,
      );
      times.push(times.at(-1)! + delay);
      indexes.push(step === config.brakeSteps
        ? target.index
        : nextIndex(step === config.brakeSteps - 1));
    }

    previousStop = times.at(-1)!;
    return { indexes, times, duration: previousStop, ...neighbors() };
  });

  const animation = { id: `${Date.now()}-${++animationSequence}`, reels };
  const duration = reels.at(-1)!.duration;
  const sampleTimes = new Set([0, ...reels.map(reel => reel.duration)]);
  // React, audio and peers get lightweight progress updates; the browser moves
  // the complete strips independently, without waiting for these timers.
  for (let elapsed = 80; elapsed < duration; elapsed += 80) sampleTimes.add(elapsed);
  const timeline = [...sampleTimes].sort((a, b) => a - b);
  let previousIndexes: number[] = [];

  return timeline.map((elapsed, step) => {
    const indexes = reels.map(reel =>
      reel.indexes[reel.times.findLastIndex(time => time <= elapsed)],
    );
    const frame = {
      indexes,
      previousIndexes,
      lockedCount: reels.filter(reel => reel.duration <= elapsed).length,
      step,
      delay: (timeline[step + 1] ?? elapsed) - elapsed,
      elapsed,
      animation,
    };
    previousIndexes = indexes;
    return frame;
  });
}
