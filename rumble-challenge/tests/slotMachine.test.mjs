import assert from "node:assert/strict";
import test from "node:test";
import { createSlotMachineFrames, synchronizeSlotReel } from "../src/pages/utils/slotMachine.utils.ts";
import { findValidTeam } from "../src/pages/utils/selection.utils.ts";

function candidate(index, name = `Character ${index}`) {
  return { index, character: { name, type: "assault" } };
}

const team = [candidate(0), candidate(1), candidate(2)];
const pools = [
  [team[0], candidate(3), candidate(4)],
  [team[1], candidate(5), candidate(6)],
  [team[2], candidate(7), candidate(8)],
];

for (const count of [1, 2, 3]) {
  test(`${count} reels stop in order and keep their final characters`, () => {
    const frames = createSlotMachineFrames({
      team: team.slice(0, count),
      candidatesByMember: pools.slice(0, count),
      speed: "fast",
    });
    assert.ok(frames.length > count);
    assert.deepEqual(frames.at(-1).indexes, [0, 1, 2].slice(0, count));
    assert.equal(frames.at(-1).lockedCount, count);
    let previousLocked = 0;
    for (const frame of frames) {
      assert.equal(frame.indexes.length, count);
      assert.ok(frame.lockedCount >= previousLocked);
      assert.ok(frame.lockedCount <= previousLocked + 1);
      for (let slot = 0; slot < frame.lockedCount; slot++) {
        assert.equal(frame.indexes[slot], slot);
      }
      previousLocked = frame.lockedCount;
    }
  });
}

test("spinning reels change character and only display their eligible candidates", () => {
  const frames = createSlotMachineFrames({ team, candidatesByMember: pools, speed: "medium" });
  for (let slot = 0; slot < 3; slot++) {
    const spinning = frames.filter(frame => frame.lockedCount <= slot);
    assert.ok(new Set(spinning.map(frame => frame.indexes[slot])).size > 1);
    for (const frame of spinning) {
      assert.ok(pools[slot].some(item => item.index === frame.indexes[slot]));
    }
  }
});

test("locked characters cannot reappear in the remaining spinning reels", () => {
  const frames = createSlotMachineFrames({
    team,
    candidatesByMember: [pools[0], [...team, candidate(9, "Character 0")], [...team]],
    speed: "fast",
  });
  for (const frame of frames) {
    for (let slot = frame.lockedCount; slot < 3; slot++) {
      for (let locked = 0; locked < frame.lockedCount; locked++) {
        const shown = [...team, candidate(9, "Character 0")].find(item => item.index === frame.indexes[slot]);
        assert.notEqual(shown.character.name, team[locked].character.name);
      }
    }
  }
});

test("instant mode returns the final team without spinning", () => {
  const frames = createSlotMachineFrames({ team, candidatesByMember: pools, speed: "instant" });
  assert.equal(frames.length, 1);
  assert.deepEqual(frames[0].indexes, [0, 1, 2]);
  assert.equal(frames[0].lockedCount, 3);
  assert.equal(frames[0].delay, 0);
});

test("reels decelerate and slower settings take longer", () => {
  const durations = [];
  for (const speed of ["fast", "medium", "slow", "super-slow"]) {
    const frames = createSlotMachineFrames({ team, candidatesByMember: pools, speed });
    const reels = frames[0].animation?.reels;
    assert.ok(reels, "the browser needs the complete reel strips to animate continuously");
    let previousStop = 0;
    for (const reel of reels) {
      const intervals = reel.times.slice(1).map((time, i) => time - reel.times[i]);
      assert.ok(intervals.slice(0, 12).every(delay => delay <= 50), "initial spin must be rapid for every speed");
      assert.ok(intervals.at(-1) >= intervals[0] * 3, "each reel must visibly slow down before stopping");
      assert.ok(intervals.every((delay, i) => i === 0 || delay >= intervals[i - 1]), "ongoing reels must never accelerate again when another reel stops");
      assert.ok(reel.duration > previousStop, "reels must stop from left to right");
      previousStop = reel.duration;
    }
    durations.push(frames.reduce((total, frame) => total + frame.delay, 0));
  }
  assert.ok(durations.every((duration, i) => i === 0 || duration > durations[i - 1]));
});

test("continuous strips start together and finish on the same characters and times as the result frames", () => {
  const frames = createSlotMachineFrames({ team, candidatesByMember: pools, speed: "medium" });
  const animation = frames[0].animation;
  assert.ok(animation);
  assert.equal(animation.reels.length, 3);
  for (const [slot, reel] of animation.reels.entries()) {
    assert.equal(reel.times[0], 0);
    assert.equal(reel.indexes.at(-1), slot);
    assert.equal(reel.indexes.length, reel.times.length);
    const stopped = frames.find(frame => frame.lockedCount > slot);
    assert.equal(stopped.elapsed, reel.duration);
    assert.equal(stopped.indexes[slot], slot);
  }
  assert.ok(frames.every(frame => frame.animation.id === animation.id));
});

test("remaining reels keep full speed until after the previous winner has stopped", () => {
  for (const speed of ["fast", "medium", "slow", "super-slow"]) {
    const reels = createSlotMachineFrames({ team, candidatesByMember: pools, speed })[0].animation.reels;
    for (let slot = 1; slot < reels.length; slot++) {
      const reel = reels[slot];
      const brakingStep = reel.times.findIndex((time, i) => i > 0 && time - reel.times[i - 1] > 40);
      const brakingAt = reel.times[brakingStep - 1];
      assert.ok(brakingAt > reels[slot - 1].duration, "the next reel must not brake while the previous reel is still spinning");
    }
  }
});

test("the final landing takes extra time while the other reels keep their independent schedules", () => {
  const reels = createSlotMachineFrames({ team, candidatesByMember: pools, speed: "medium" })[0].animation.reels;
  for (const reel of reels) {
    const last = reel.times.at(-1) - reel.times.at(-2);
    const previous = reel.times.at(-2) - reel.times.at(-3);
    assert.ok(last >= 500);
    assert.ok(last > previous * 1.9);
  }
});

test("reels keep eligible neighbors around the winner without changing the result", () => {
  for (const speed of ["instant", "medium"]) {
    const frames = createSlotMachineFrames({ team, candidatesByMember: pools, speed });
    const reels = frames[0].animation?.reels;
    assert.ok(reels, "instant draws also need stationary adjacent options");
    for (const [slot, reel] of reels.entries()) {
      assert.ok(pools[slot].some(item => item.index === reel.beforeIndex));
      assert.ok(pools[slot].some(item => item.index === reel.afterIndex));
      assert.notEqual(reel.afterIndex, slot);
      if (speed !== "instant") assert.notEqual(reel.indexes.at(-2), slot);
    }
    assert.deepEqual(frames.at(-1).indexes, [0, 1, 2]);
  }
});

test("one eligible candidate per reel still completes with no empty frames", () => {
  const frames = createSlotMachineFrames({ team, candidatesByMember: team.map(item => [item]), speed: "fast" });
  assert.ok(frames.every(frame => frame.indexes.every(index => Number.isInteger(index))));
  assert.deepEqual(frames.at(-1).indexes, [0, 1, 2]);
});

test("a valid team with global and individual bans remains the final result", () => {
  const characters = [candidate(0, "A"), candidate(1, "A"), candidate(2, "B"), candidate(3, "C"), candidate(4, "D")];
  const selected = findValidTeam({
    characters,
    members: [1, 2, 3],
    bannedCharacters: new Set(["D::assault"]),
    individualBans: { 1: new Set(["A::assault", "C::assault"]), 2: new Set(), 3: new Set() },
  });
  assert.deepEqual(selected.map(item => item.index), [2, 0, 3]);
  const frames = createSlotMachineFrames({ team: selected, candidatesByMember: selected.map(item => [item]), speed: "fast" });
  assert.deepEqual(frames.at(-1).indexes, [2, 0, 3]);
});

test("small progress drift adjusts the running reel without jumping its position", () => {
  const movement = { currentTime: 940, rate: 1, updatePlaybackRate(rate) { this.rate = rate; } };
  synchronizeSlotReel(movement, 1000, 3000, false);
  assert.equal(movement.currentTime, 940);
  assert.ok(movement.rate > 1 && movement.rate <= 1.08);
  synchronizeSlotReel(movement, 900, 3000, false);
  assert.equal(movement.currentTime, 940);
  assert.ok(movement.rate < 1 && movement.rate >= 0.92);
});

test("late progress catches up and a locked reel is exactly on the winning character", () => {
  const movement = { currentTime: 500, rate: 1, updatePlaybackRate(rate) { this.rate = rate; } };
  synchronizeSlotReel(movement, 1400, 3000, false);
  assert.equal(movement.currentTime, 1400);
  synchronizeSlotReel(movement, 3000, 3000, true);
  assert.equal(movement.currentTime, 3000);
  assert.equal(movement.rate, 1);
});
