import assert from "node:assert/strict";
import test from "node:test";
import { createLeverCycle } from "../src/pages/utils/leverPull.utils.ts";

test("the draw starts only when the downward animation reaches the bottom", () => {
  const events = [];
  const cycle = createLeverCycle({
    onPhaseChange: phase => events.push(phase),
    onBottom: () => events.push("draw"),
  });
  cycle.pull();
  cycle.pull();
  assert.deepEqual(events, ["pulling"]);
  cycle.bottomReached();
  assert.deepEqual(events, ["pulling", "returning", "draw"]);
  cycle.bottomReached();
  assert.deepEqual(events, ["pulling", "returning", "draw"]);
  cycle.returned();
  assert.deepEqual(events, ["pulling", "returning", "draw", "idle"]);
});

test("leaving before the bottom cancels the pending draw", () => {
  const events = [];
  const cycle = createLeverCycle({ onPhaseChange: phase => events.push(phase), onBottom: () => events.push("draw") });
  cycle.pull();
  cycle.cancel();
  cycle.bottomReached();
  cycle.returned();
  assert.deepEqual(events, ["pulling"]);
});

test("the return cannot trigger another draw and the next pull works after resting", () => {
  let draws = 0;
  const cycle = createLeverCycle({ onPhaseChange() {}, onBottom() { draws++; } });
  cycle.pull();
  cycle.bottomReached();
  cycle.pull();
  cycle.bottomReached();
  assert.equal(draws, 1);
  cycle.returned();
  cycle.returned();
  cycle.pull();
  cycle.bottomReached();
  assert.equal(draws, 2);
});
