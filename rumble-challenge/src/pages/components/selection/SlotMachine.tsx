import { memo, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { CharacterCardContents } from "../CharacterCardContents";
import { SlotMachineLights } from "./SlotMachineLights";
import type { DrawCount } from "../settings/settings.types";
import type { CharacterType, SlotMachineAnimation, SlotMachineFrame } from "../../selection.types";
import { synchronizeSlotReel } from "../../utils/slotMachine.utils";
import "./SlotMachine.css";

interface SlotMachineProps {
  characters: CharacterType[];
  drawCount: DrawCount;
  frame: SlotMachineFrame | null;
  isSelecting: boolean;
  infos: Record<string, { name: string }>;
  children?: ReactNode;
}

function ReelCharacter({ character, name }: { character: CharacterType; name: string }) {
  return (
    <CharacterCardContents
      alignment={character.alignment}
      name={name}
      image={character.image}
      symbol={character.symbol}
      background={character.background}
      imageWidth={character.imageWidthTeam}
      imageHeight={character.imageHeightTeam}
      portraitReferenceWidth={244}
      isNew={character.isNew}
    />
  );
}

interface ReelStripProps {
  animation: SlotMachineAnimation;
  slot: number;
  elapsed: number;
  locked: boolean;
  characters: CharacterType[];
  infos: SlotMachineProps["infos"];
}

const ReelStrip = memo(function ReelStrip({
  animation,
  slot,
  elapsed,
  locked,
  characters,
  infos,
}: ReelStripProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const movementRef = useRef<Animation | null>(null);
  // The component is keyed by the draw id; its strip is immutable for this spin.
  const [initial] = useState(() => ({ reel: animation.reels[slot], elapsed }));
  const { reel } = initial;

  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track || reel.duration === 0) return;

    const movement = track.animate(
      reel.times.map((time, position) => ({
        offset: time / reel.duration,
        transform: `translateY(-${(position + 1) * 100}%)`,
        // Only the last card eases to zero velocity; fast spinning stays linear.
        easing: position === reel.times.length - 2
          ? "cubic-bezier(0.333333, 0.666667, 0.666667, 1)"
          : "linear",
      })),
      { duration: reel.duration, easing: "linear", fill: "forwards" },
    );
    // A participant joining mid-spin starts at the host's current position.
    movement.currentTime = Math.min(initial.elapsed, reel.duration);
    movementRef.current = movement;
    return () => {
      movement.cancel();
      movementRef.current = null;
    };
  }, [initial, reel]);

  useLayoutEffect(() => {
    const movement = movementRef.current;
    if (movement) synchronizeSlotReel(movement, elapsed, reel.duration, locked);
  }, [elapsed, reel.duration, locked]);

  const faces = useMemo(
    () => [reel.beforeIndex, ...reel.indexes, reel.afterIndex].map((index, position) => {
        const character = index === undefined ? undefined : characters[index];
        const winnerPosition = reel.indexes.length;
        const visiblePosition = position === winnerPosition
          ? "selected"
          : position === winnerPosition - 1
            ? "above"
            : position === winnerPosition + 1 ? "below" : undefined;
        return (
          <div
            key={position}
            className="slot-machine__face"
            data-reel-position={visiblePosition}
          >
            {character && (
              <ReelCharacter
                character={character}
                name={infos[character.id]?.name ?? character.name}
              />
            )}
          </div>
        );
    }),
    [reel, characters, infos],
  );

  return (
    <div ref={trackRef} className="slot-machine__strip" aria-hidden="true">
      {faces}
    </div>
  );
}, (previous, next) =>
  // Progress and network updates must not restart or rebuild an ongoing strip.
  previous.animation.id === next.animation.id &&
  previous.elapsed === next.elapsed &&
  previous.locked === next.locked &&
  previous.slot === next.slot &&
  previous.characters === next.characters &&
  previous.infos === next.infos,
);

export function SlotMachine({
  characters,
  drawCount,
  frame: lastFrame,
  isSelecting,
  infos,
  children,
}: SlotMachineProps) {
  const { t } = useTranslation();
  const preview = useMemo<SlotMachineFrame | null>(() => {
    if (characters.length === 0) return null;
    const seen = new Set<string>();
    const distinctIndexes = characters.flatMap((character, index) => {
      if (seen.has(character.name)) return [];
      seen.add(character.name);
      return [index];
    });
    const indexes = Array.from({ length: drawCount }, (_, slot) =>
      distinctIndexes[slot % distinctIndexes.length],
    );
    return {
      indexes,
      lockedCount: 0,
      step: 0,
      delay: 0,
      elapsed: 0,
      animation: {
        id: `preview:${drawCount}:${characters.length}:${indexes.join("-")}`,
        reels: indexes.map(index => ({
          indexes: [index],
          times: [0],
          duration: 0,
          beforeIndex: (index + characters.length - 1) % characters.length,
          afterIndex: (index + 1) % characters.length,
        })),
      },
    };
  }, [characters, drawCount]);
  const frame = lastFrame?.indexes.length === drawCount ? lastFrame : preview;
  const count = drawCount;
  const lockedCount = frame?.lockedCount ?? 0;

  useEffect(() => {
    const sources = new Set(
      characters.flatMap(character =>
        [character.image, character.symbol, character.background].filter(
          (source): source is string => Boolean(source),
        ),
      ),
    );
    for (const source of sources) {
      const image = new Image();
      image.src = source;
    }
  }, [characters]);

  function renderCharacter(character: CharacterType) {
    return (
      <ReelCharacter
        character={character}
        name={infos[character.id]?.name ?? character.name}
      />
    );
  }

  return (
    <div className={`slot-machine__assembly${children ? " slot-machine__assembly--lever" : ""}`}>
      <section
        className="slot-machine"
        aria-label={t("selection.components.selection.slotMachine.title")}
      >
        <SlotMachineLights />
        <div className="slot-machine__body">
          <div
            className="slot-machine__reels"
            style={{ "--reel-count": count } as CSSProperties}
          >
            {Array.from({ length: count }, (_, slot) => {
              const character = frame ? characters[frame.indexes[slot]] : undefined;
              const previous = frame ? characters[frame.previousIndexes?.[slot] ?? -1] : undefined;
              const locked = slot < lockedCount;
              const isStatic = frame?.animation?.reels[slot]?.duration === 0;
              const rolling = isSelecting && previous && character && previous !== character;

              return (
                <article
                  key={slot}
                  className={`slot-machine__reel${locked ? " slot-machine__reel--locked" : ""}${isStatic ? " slot-machine__reel--static" : ""}`}
                >
                  <h3 className="slot-machine__member">
                    {t("selection.components.teamModal.member")} {slot + 1}
                  </h3>
                  <div className="slot-machine__window">
                    <div className="slot-machine__stage">
                      {character && frame?.animation ? (
                        <>
                          <ReelStrip
                            key={frame.animation.id}
                            animation={frame.animation}
                            slot={slot}
                            elapsed={frame.elapsed ?? 0}
                            locked={locked}
                            characters={characters}
                            infos={infos}
                          />
                          <div className="slot-machine__reduced-motion" aria-hidden="true">
                            {locked || isStatic ? renderCharacter(character) : (
                              <div className="slot-machine__placeholder">?</div>
                            )}
                        </div>
                        {locked && (
                          <span className="sr-only">
                            {infos[character.id]?.name ?? character.name}
                          </span>
                        )}
                      </>
                    ) : character ? (
                      <div
                        key={frame?.step ?? "idle"}
                        className={rolling ? "slot-machine__track" : "slot-machine__still"}
                        style={{
                          "--roll-duration": `${frame?.delay ?? 0}ms`,
                        } as CSSProperties}
                        aria-hidden={isSelecting && !locked}
                      >
                        {rolling && (
                          <div className="slot-machine__face" aria-hidden="true">
                            {renderCharacter(previous)}
                          </div>
                        )}
                        <div className="slot-machine__face">
                          {renderCharacter(character)}
                        </div>
                      </div>
                    ) : (
                      <div className="slot-machine__placeholder" aria-hidden="true">?</div>
                    )}
                    </div>
                    <div className="slot-machine__payline" aria-hidden="true" />
                  </div>
                </article>
              );
            })}
          </div>
        </div>
        {children}
      </section>
    </div>
  );
}
