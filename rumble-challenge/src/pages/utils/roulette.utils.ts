import type { CharacterWithIndex, RouletteAnimation, RouletteBall, RouletteFrame } from "../selection.types";
import type { DrawSpeed, MemberSlot } from "../components/settings/settings.types";
import { getCharacterKey } from "./selection.utils.ts";

interface RouletteEntriesOptions {
  characters: CharacterWithIndex[];
  members: MemberSlot[];
  bannedCharacters: Set<string>;
  individualBans: Record<MemberSlot, Set<string>>;
}

export function getRouletteEntries({ characters, members, bannedCharacters, individualBans }: RouletteEntriesOptions) {
  return characters.filter(({ character }) => {
    const key = getCharacterKey(character);
    return !bannedCharacters.has(key) && members.some(member => !individualBans[member].has(key));
  });
}

export function roulettePoint(radius: number, angle: number) {
  const radians = angle * Math.PI / 180;
  return { x: 300 + Math.sin(radians) * radius, y: 300 - Math.cos(radians) * radius };
}

export function rouletteSectorPath(position: number, count: number) {
  if (count <= 0) return "";
  const start = position * 360 / count;
  const end = (position + 1) * 360 / count;
  const middle = (start + end) / 2;
  const point = (radius: number, angle: number) => {
    const { x, y } = roulettePoint(radius, angle);
    return `${x.toFixed(3)} ${y.toFixed(3)}`;
  };
  // Two arcs also render the full ring correctly when only one pocket remains.
  return `M ${point(250, start)} A 250 250 0 0 1 ${point(250, middle)} A 250 250 0 0 1 ${point(250, end)} L ${point(174, end)} A 174 174 0 0 0 ${point(174, middle)} A 174 174 0 0 0 ${point(174, start)} Z`;
}

const SPEEDS = {
  instant: { wheel: 0, landing: 0, stagger: 0 },
  fast: { wheel: 1800, landing: 650, stagger: 500 },
  medium: { wheel: 2800, landing: 800, stagger: 650 },
  slow: { wheel: 4000, landing: 1000, stagger: 800 },
  "super-slow": { wheel: 5600, landing: 1200, stagger: 1000 },
};
let sequence = 0;

export function rouletteWheelAngle(plan: RouletteAnimation, elapsed: number) {
  if (plan.wheelDuration === 0) return plan.wheelRotation;
  const progress = Math.min(1, Math.max(0, elapsed / plan.wheelDuration));
  return plan.wheelRotation * (1 - (1 - progress) ** 3);
}

export function rouletteBallPosition(plan: RouletteAnimation, ball: RouletteBall, elapsed: number) {
  // Once captured, the ball stays in the same pocket while the rotor coasts.
  const capturedAngle = (time: number) => ball.endAngle + rouletteWheelAngle(plan, time) - plan.wheelRotation;
  if (elapsed >= ball.duration || ball.duration === 0) {
    return { angle: capturedAngle(elapsed), radius: 212 };
  }

  const landingSeconds = (ball.duration - ball.dropTime) / 1000;
  const landingDistance = Math.min(54, Math.max(16, 360 / plan.entries.length * 1.2));
  const captureAngle = capturedAngle(ball.duration);
  const dropAngle = captureAngle + landingDistance;
  const entryVelocity = -2 * landingDistance / landingSeconds;

  if (elapsed < ball.dropTime) {
    // Constant drag reduces angular speed without braking to a halt on the rim.
    const progress = Math.max(0, elapsed / ball.dropTime);
    const distance = ball.startAngle - dropAngle;
    const terminalRatio = -entryVelocity * ball.dropTime / 1000 / distance;
    const travel = (2 - terminalRatio) * progress - (1 - terminalRatio) * progress ** 2;
    return { angle: ball.startAngle - distance * travel, radius: 272 };
  }

  const progress = (elapsed - ball.dropTime) / (ball.duration - ball.dropTime);
  const squared = progress ** 2;
  const cubed = progress ** 3;
  const wheelProgress = 1 - ball.duration / plan.wheelDuration;
  const captureVelocity = 3 * plan.wheelRotation * wheelProgress ** 2 / (plan.wheelDuration / 1000);
  // Match the incoming velocity and the rotor's velocity at capture, avoiding a snap.
  const angle = (2 * cubed - 3 * squared + 1) * dropAngle +
    (cubed - 2 * squared + progress) * entryVelocity * landingSeconds +
    (-2 * cubed + 3 * squared) * captureAngle +
    (cubed - squared) * captureVelocity * landingSeconds;

  // The first impact is strongest; successive rebounds lose height in the pocket.
  const impacts = [[0, 272], [0.46, 216], [0.62, 232], [0.78, 210], [0.87, 219], [0.95, 211], [1, 212]];
  const segment = impacts.findIndex(([time]) => time > progress);
  const [start, from] = impacts[segment - 1];
  const [end, to] = impacts[segment];
  const fraction = (progress - start) / (end - start);
  const fall = segment === 1 ? fraction ** 2 : (1 - Math.cos(fraction * Math.PI)) / 2;
  return { angle, radius: from + (to - from) * fall };
}

export function createRouletteFrames({ team, entries, speed }: {
  team: CharacterWithIndex[];
  entries: CharacterWithIndex[];
  speed: DrawSpeed;
}): RouletteFrame[] {
  if (team.length === 0) return [];
  const indexes = entries.map(item => item.index);
  if (team.some(item => !indexes.includes(item.index))) {
    throw new Error("Roulette target must have an eligible pocket");
  }
  const timing = SPEEDS[speed];
  const lastCapture = timing.wheel + timing.landing + timing.stagger * (team.length - 1);
  const wheelDuration = speed === "instant" ? 0 : lastCapture + 650;
  const wheelRotation = wheelDuration / 1000 * 110 + Math.random() * 120;
  const balls = team.map((item, slot) => {
    const pocket = indexes.indexOf(item.index);
    const targetAngle = ((pocket + 0.5) * 360 / entries.length + wheelRotation) % 360;
    const duration = timing.wheel + timing.landing + timing.stagger * slot;
    return {
      member: (slot + 1) as MemberSlot,
      targetIndex: item.index,
      startAngle: slot * 120,
      endAngle: targetAngle - 360 * Math.max(3, Math.ceil(duration / 1000 * 1.1)),
      dropTime: duration - timing.landing,
      duration,
    };
  });
  const animation = {
    id: `roulette:${Date.now()}:${++sequence}`,
    entries: indexes,
    wheelRotation,
    wheelDuration,
    balls,
  };
  const end = wheelDuration;
  const times = new Set([0, end, ...balls.map(ball => ball.duration)]);
  for (let elapsed = 100; elapsed < end; elapsed += 100) times.add(elapsed);
  const timeline = [...times].sort((a, b) => a - b);
  return timeline.map((elapsed, index) => {
    const settled = balls.filter(ball => ball.duration <= elapsed);
    return {
      indexes: settled.map(ball => ball.targetIndex),
      settledCount: settled.length,
      elapsed,
      delay: (timeline[index + 1] ?? elapsed) - elapsed,
      animation,
    };
  });
}
