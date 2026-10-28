import { memo, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { CharacterType, RouletteAnimation, RouletteFrame } from "../../selection.types";
import type { DrawCount } from "../settings/settings.types";
import { rouletteBallPosition, roulettePoint, rouletteSectorPath, rouletteWheelAngle } from "../../utils/roulette.utils";
import { synchronizeSlotReel } from "../../utils/slotMachine.utils";
import "./Roulette.css";

type CharacterNames = Record<string, { name: string }>;

interface WheelArtProps {
  entries: number[];
  characters: CharacterType[];
  infos: CharacterNames;
  winners?: number[];
}

const WheelArt = memo(function WheelArt({ entries, characters, infos, winners = [] }: WheelArtProps) {
  const id = useId();
  return (
    <svg className="roulette__disc" viewBox="0 0 600 600" aria-hidden="true">
      <defs>
        <radialGradient id={`${id}-bowl`}>
          <stop offset="0" stopColor="#344940" />
          <stop offset="0.65" stopColor="#1d3028" />
          <stop offset="1" stopColor="#101c18" />
        </radialGradient>
        {entries.map((index, position) => (
          <clipPath key={index} id={`${id}-pocket-${position}`} clipPathUnits="userSpaceOnUse">
            <path d={rouletteSectorPath(position, entries.length)} />
          </clipPath>
        ))}
      </defs>
      <circle cx="300" cy="300" r="259" fill={`url(#${id}-bowl)`} />
      {Array.from({ length: 12 }, (_, spoke) => {
        const point = roulettePoint(174, spoke * 30);
        return <path
          key={spoke}
          className="roulette__spoke roulette__spoke--flash"
          style={{ animationDelay: `${-spoke * 0.17}s` }}
          d={`M 300 300 L ${point.x} ${point.y}`}
          stroke="#c3ac6930"
          strokeWidth="2"
        />;
      })}
      <circle cx="300" cy="300" r="170" fill="none" stroke="#a18b53" strokeWidth="3" />
      {entries.map((index, position) => {
        const character = characters[index];
        if (!character) return null;
        const angle = (position + 0.5) * 360 / entries.length;
        const point = roulettePoint(212, angle);
        const path = rouletteSectorPath(position, entries.length);
        return (
          <g key={index} data-character-index={index}>
            <title>{infos[character.id]?.name ?? character.name}</title>
            <path d={path} fill={position % 2 ? "#25312c" : "#19251f"} />
            <g clipPath={`url(#${id}-pocket-${position})`}>
              <image
                href={character.image}
                x={point.x - 38}
                y={point.y - 42}
                width="76"
                height="84"
                preserveAspectRatio="xMidYMin slice"
                transform={`rotate(${angle} ${point.x} ${point.y})`}
              />
            </g>
            <path
              className={!winners.includes(index) && position % 2 === 0 ? "roulette__pocket-flash" : undefined}
              style={{ animationDelay: `${-position * 0.09}s` }}
              d={path}
              fill="none"
              stroke={winners.includes(index) ? "#6ee7b7" : "#bda66b80"}
              strokeWidth={winners.includes(index) ? 4 : 1.5}
            />
          </g>
        );
      })}
    </svg>
  );
});

interface RouletteMotionProps {
  animation: RouletteAnimation;
  elapsed: number;
  settledCount: number;
  characters: CharacterType[];
  infos: CharacterNames;
}

function RouletteMotion({ animation, elapsed, settledCount, characters, infos }: RouletteMotionProps) {
  const [initial] = useState(() => ({ plan: animation, elapsed }));
  const { plan } = initial;
  const rotorRef = useRef<HTMLDivElement>(null);
  const orbitRefs = useRef<(HTMLDivElement | null)[]>([]);
  const ballRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const movements = useRef<{ motion: Animation; duration: number }[]>([]);
  const currentElapsed = useRef(elapsed);
  const [reducedMotion, setReducedMotion] = useState(() =>
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const winners = useMemo(() => plan.balls.slice(0, settledCount).map(ball => ball.targetIndex), [plan, settledCount]);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const change = (event: MediaQueryListEvent) => setReducedMotion(event.matches);
    query.addEventListener("change", change);
    return () => query.removeEventListener("change", change);
  }, []);

  useLayoutEffect(() => { currentElapsed.current = elapsed; }, [elapsed]);

  useLayoutEffect(() => {
    const running: typeof movements.current = [];
    function animate(element: HTMLElement | null, keyframes: Keyframe[]) {
      if (!element) return;
      const duration = plan.wheelDuration;
      if (duration === 0 || reducedMotion) {
        const end = keyframes.at(-1)!;
        if (typeof end.transform === "string") element.style.transform = end.transform;
        return;
      }
      const motion = element.animate(keyframes, {
        duration, easing: "linear", fill: "forwards",
      });
      motion.currentTime = Math.min(currentElapsed.current, duration);
      running.push({ motion, duration });
    }
    // Sample a continuous trajectory once; the browser interpolates it without React ticks.
    const times = new Set([0, plan.wheelDuration, ...plan.balls.flatMap(ball => [ball.dropTime, ball.duration])]);
    for (let time = 1000 / 60; time < plan.wheelDuration; time += 1000 / 60) times.add(time);
    const timeline = [...times].sort((a, b) => a - b);
    const offset = (time: number) => plan.wheelDuration ? time / plan.wheelDuration : 1;
    animate(rotorRef.current, timeline.map(time => ({
      offset: offset(time), transform: `rotate(${rouletteWheelAngle(plan, time)}deg)`,
    })));
    plan.balls.forEach((ball, slot) => {
      const positions = timeline.map(time => rouletteBallPosition(plan, ball, time));
      animate(orbitRefs.current[slot], positions.map((position, index) => ({
        offset: offset(timeline[index]), transform: `rotate(${position.angle}deg)`,
      })));
      animate(ballRefs.current[slot], positions.map((position, index) => ({
        offset: offset(timeline[index]),
        transform: `translate(-50%, -50%) translateY(${-position.radius / 6}cqw)`,
      })));
    });
    movements.current = running;
    return () => {
      running.forEach(({ motion }) => motion.cancel());
      movements.current = [];
    };
  }, [initial, plan, reducedMotion]);

  useLayoutEffect(() => {
    movements.current.forEach(({ motion, duration }) => {
      synchronizeSlotReel(motion, elapsed, duration, elapsed >= duration);
    });
  }, [elapsed]);

  return (
    <>
      <div ref={rotorRef} className="roulette__rotor">
        <WheelArt entries={plan.entries} characters={characters} infos={infos} winners={winners} />
      </div>
      {plan.balls.map((ball, slot) => (
        <div key={ball.member} ref={element => { orbitRefs.current[slot] = element; }} className="roulette__orbit" data-settled={slot < settledCount} aria-hidden="true">
          <span ref={element => { ballRefs.current[slot] = element; }} className="roulette__ball" data-member={ball.member}>
            {ball.member}
          </span>
        </div>
      ))}
    </>
  );
}

interface RouletteProps {
  characters: CharacterType[];
  entries: number[];
  drawCount: DrawCount;
  frame: RouletteFrame | null;
  isSelecting: boolean;
  hasAvailableTeam?: boolean;
  onDraw?: () => void;
  infos: CharacterNames;
}

export function Roulette({ characters, entries, drawCount, frame: previousFrame, isSelecting, hasAvailableTeam = false, onDraw, infos }: RouletteProps) {
  const { t } = useTranslation();
  const eligible = new Set(entries);
  const sameEntries = previousFrame?.animation.entries.length === entries.length &&
    previousFrame.animation.entries.every(index => eligible.has(index));
  const frame = previousFrame && previousFrame.animation.balls.length === drawCount &&
    (isSelecting || sameEntries)
    ? previousFrame : null;
  const visibleEntries = frame?.animation.entries ?? entries;
  const disabled = isSelecting || !hasAvailableTeam || !onDraw;
  const launchLabel = isSelecting
    ? t("selection.components.selection.drawButton.selecting")
    : !onDraw ? t("selection.components.selection.roulette.title")
    : !hasAvailableTeam ? t("selection.components.selection.drawButton.impossibleDraw")
    : t("selection.components.selection.roulette.launch", { count: drawCount });

  return (
    <section className="roulette" aria-label={t("selection.components.selection.roulette.title")}>
      <div className="roulette__body">
        <div className="roulette__stage" data-spinning={isSelecting}>
          <svg className="roulette__rim" viewBox="0 0 600 600" aria-hidden="true">
            <circle cx="300" cy="300" r="292" fill="#171b1e" stroke="#8d794a" strokeWidth="10" />
            <circle cx="300" cy="300" r="278" fill="none" stroke="#bda66c" strokeWidth="2" />
            <circle cx="300" cy="300" r="267" fill="none" stroke="#090d10" strokeWidth="17" />
          </svg>
          {frame ? (
            <RouletteMotion key={frame.animation.id} animation={frame.animation} elapsed={frame.elapsed} settledCount={frame.settledCount} characters={characters} infos={infos} />
          ) : (
            <div className="roulette__rotor"><WheelArt entries={entries} characters={characters} infos={infos} /></div>
          )}
          <button type="button" className="roulette__hub" disabled={disabled} onClick={onDraw} aria-label={launchLabel} aria-busy={isSelecting} title={launchLabel}>
            <img src={`${import.meta.env?.BASE_URL ?? "/"}favicon-rumble.png`} alt="" draggable={false} />
            <small>RUMBLE<br />CHALLENGE</small>
            <span className="roulette__quantity">{t("selection.components.selection.roulette.balls", { count: drawCount })}</span>
          </button>
        </div>
      </div>
      {visibleEntries.length === 0 && <p className="roulette__note">{t("selection.components.selection.roulette.empty")}</p>}
    </section>
  );
}
