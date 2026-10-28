import assert from "node:assert/strict";
import test from "node:test";
import { getRouletteEntries, createRouletteFrames, rouletteSectorPath } from "../src/pages/utils/roulette.utils.ts";
import * as roulette from "../src/pages/utils/roulette.utils.ts";
import { findValidTeam } from "../src/pages/utils/selection.utils.ts";

const entries = [0, 1, 2, 3].map(index => ({ index, character: { name: `Hero ${index}`, type: "assault" } }));
const bans = { 1: new Set(["Hero 0::assault"]), 2: new Set(["Hero 1::assault"]), 3: new Set() };

test("global bans remove pockets and individual bans exclude only characters forbidden for every active member", () => {
  const options = { characters: entries, members: [1, 2], bannedCharacters: new Set(["Hero 3::assault"]), individualBans: bans };
  assert.deepEqual(getRouletteEntries(options).map(item => item.index), [0, 1, 2]);
  assert.deepEqual(getRouletteEntries({ ...options, members: [1] }).map(item => item.index), [1, 2]);
});

for (const count of [1, 2, 3]) {
  test(`${count} balls land on the valid team without ignoring member bans`, () => {
    const members = [1, 2, 3].slice(0, count);
    const allowed = getRouletteEntries({ characters: entries, members, bannedCharacters: new Set(), individualBans: bans });
    const team = findValidTeam({ characters: entries, members, bannedCharacters: new Set(), individualBans: bans });
    const frames = createRouletteFrames({ team, entries: allowed, speed: "medium" });
    const plan = frames[0].animation;
    assert.equal(plan.balls.length, count);
    assert.deepEqual(frames.at(-1).indexes, team.map(item => item.index));
    assert.equal(frames.at(-1).settledCount, count);
    for (const [slot, ball] of plan.balls.entries()) {
      assert.equal(ball.targetIndex, team[slot].index);
      const position = plan.entries.indexOf(ball.targetIndex);
      const expected = ((position + 0.5) * 360 / plan.entries.length + plan.wheelRotation) % 360;
      const landed = ((ball.endAngle % 360) + 360) % 360;
      assert.ok(Math.abs(landed - expected) < 0.00001);
      assert.ok(ball.endAngle < ball.startAngle);
      assert.ok(ball.duration < plan.wheelDuration);
    }
  });
}

test("balls settle individually and progressively without changing their target", () => {
  const frames = createRouletteFrames({ team: entries.slice(0, 3), entries, speed: "fast" });
  let settled = 0;
  for (const frame of frames) {
    assert.ok(frame.settledCount >= settled && frame.settledCount <= settled + 1);
    assert.deepEqual(frame.indexes, [0, 1, 2].slice(0, frame.settledCount));
    settled = frame.settledCount;
  }
});

test("instant roulette finishes without motion and slower modes take longer", () => {
  const instant = createRouletteFrames({ team: entries.slice(0, 2), entries, speed: "instant" });
  assert.equal(instant.length, 1);
  assert.deepEqual(instant[0].indexes, [0, 1]);
  assert.equal(instant[0].delay, 0);
  const durations = ["fast", "medium", "slow", "super-slow"].map(speed => {
    const frames = createRouletteFrames({ team: entries.slice(0, 2), entries, speed });
    return frames.at(-1).elapsed;
  });
  assert.ok(durations.every((duration, i) => i === 0 || duration > durations[i - 1]));
});

test("roulette cannot target a character missing from its pockets", () => {
  assert.throws(() => createRouletteFrames({ team: [entries[3]], entries: entries.slice(0, 3), speed: "fast" }));
});

test("a single available character has a full circular pocket without invalid geometry", () => {
  const path = rouletteSectorPath(0, 1);
  assert.ok(!path.includes("NaN"));
  assert.equal((path.match(/A/g) ?? []).length, 4);
  const frames = createRouletteFrames({ team: [entries[0]], entries: [entries[0]], speed: "fast" });
  assert.deepEqual(frames.at(-1).indexes, [0]);
});

test("balls lose angular speed while staying on the outer track before dropping", () => {
  assert.equal(typeof roulette.rouletteBallPosition, "function");
  const plan = createRouletteFrames({ team: entries.slice(0, 3), entries, speed: "medium" })[0].animation;
  for (const ball of plan.balls) {
    assert.ok(ball.dropTime > 0 && ball.dropTime < ball.duration);
    const positions = [0, 0.2, 0.4, 0.6, 0.8].map(part =>
      roulette.rouletteBallPosition(plan, ball, ball.dropTime * part));
    const travel = positions.slice(1).map((position, index) => positions[index].angle - position.angle);
    assert.ok(positions.every(position => Math.abs(position.radius - 272) < 0.001));
    assert.ok(travel.every((distance, index) => distance > 0 && (index === 0 || distance < travel[index - 1])));
  }
});

test("landing has diminishing rebounds and a captured ball travels with its pocket", () => {
  assert.equal(typeof roulette.rouletteBallPosition, "function");
  assert.equal(typeof roulette.rouletteWheelAngle, "function");
  const frames = createRouletteFrames({ team: entries.slice(0, 3), entries, speed: "medium" });
  const plan = frames[0].animation;
  for (const ball of plan.balls) {
    const landing = Array.from({ length: 121 }, (_, i) =>
      roulette.rouletteBallPosition(plan, ball, ball.dropTime + (ball.duration - ball.dropTime) * i / 120));
    assert.ok(landing.every(position => position.radius >= 200 && position.radius <= 273));
    assert.ok(landing.some((position, i) => i > 0 && position.radius > landing[i - 1].radius + 0.05));
    const captured = roulette.rouletteBallPosition(plan, ball, ball.duration);
    const following = roulette.rouletteBallPosition(plan, ball, ball.duration + 100);
    const ended = roulette.rouletteBallPosition(plan, ball, plan.wheelDuration);
    assert.ok(Math.abs(captured.radius - 212) < 0.001);
    assert.ok(Math.abs(following.angle - captured.angle -
      (roulette.rouletteWheelAngle(plan, ball.duration + 100) - roulette.rouletteWheelAngle(plan, ball.duration))) < 0.001);
    assert.ok(following.angle > captured.angle);
    assert.ok(Math.abs(ended.angle - ball.endAngle) < 0.001);
    const before = roulette.rouletteBallPosition(plan, ball, ball.duration - 1);
    assert.ok(Math.abs(before.angle - captured.angle) < 1);
    assert.ok(Math.abs(before.radius - captured.radius) < 1);
  }
  assert.equal(frames.at(-1).elapsed, plan.wheelDuration);
});

test("instant trajectories have finite final coordinates without a falling phase", () => {
  assert.equal(typeof roulette.rouletteBallPosition, "function");
  const plan = createRouletteFrames({ team: entries.slice(0, 3), entries, speed: "instant" })[0].animation;
  for (const ball of plan.balls) {
    const position = roulette.rouletteBallPosition(plan, ball, 0);
    assert.equal(position.radius, 212);
    assert.equal(position.angle, ball.endAngle);
    assert.equal(plan.wheelDuration, 0);
  }
});
