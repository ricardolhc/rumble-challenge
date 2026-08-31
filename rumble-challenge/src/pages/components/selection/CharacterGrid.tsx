import { useEffect, useRef, useState } from "react";

import { Character } from "../Character";

import type { CharacterType } from "../../selection.types";

import { getCharacterKey } from "../../utils/selection.utils";

interface CharacterGridProps {
  characters: CharacterType[];
  bannedCharacters: Set<string>;
  highlightedIndexes: number[];
  isSelecting: boolean;
  onCharacterClick: (character: CharacterType) => void;
  infos: Record<string, { name: string; description: string }>;
}

const LONG_HOVER_DELAY = 3000;

export function CharacterGrid({
  characters,
  bannedCharacters,
  highlightedIndexes,
  isSelecting,
  onCharacterClick,
  infos,
}: CharacterGridProps) {
  const highlighted = new Set(highlightedIndexes);

  const [focusedCharacterKey, setFocusedCharacterKey] = useState<string | null>(
    null,
  );

  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function clearHoverTimeout() {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  }

  function handleMouseEnter(character: CharacterType) {
    if (isSelecting) {
      return;
    }

    clearHoverTimeout();

    const characterKey = getCharacterKey(character);

    hoverTimeoutRef.current = setTimeout(() => {
      setFocusedCharacterKey(characterKey);
      hoverTimeoutRef.current = null;
    }, LONG_HOVER_DELAY);
  }

  function handleMouseLeave(character: CharacterType) {
    clearHoverTimeout();

    const characterKey = getCharacterKey(character);

    if (focusedCharacterKey === characterKey) {
      setFocusedCharacterKey(null);
    }
  }

  useEffect(() => {
    if (isSelecting) {
      clearHoverTimeout();
      setFocusedCharacterKey(null);
    }
  }, [isSelecting]);

  useEffect(() => {
    return () => {
      clearHoverTimeout();
    };
  }, []);

  return (
    <section className="mx-auto flex w-full max-w-[1680px] flex-wrap justify-center gap-0">
      {characters.map((character, index) => {
        const characterKey = getCharacterKey(character);

        const isGloballyBanned = bannedCharacters.has(characterKey);

        const isHighlighted = highlighted.has(index);

        const hasFocusedCharacter = focusedCharacterKey !== null;

        const isFocusedCharacter = focusedCharacterKey === characterKey;

        const shouldFade =
          hasFocusedCharacter && !isFocusedCharacter && !isSelecting;

        return (
          <div
            key={characterKey}
            role="button"
            tabIndex={isSelecting ? -1 : 0}
            onMouseEnter={() => {
              handleMouseEnter(character);
            }}
            onMouseLeave={() => {
              handleMouseLeave(character);
            }}
            onClick={() => {
              if (isSelecting) {
                return;
              }

              onCharacterClick(character);
            }}
            onKeyDown={(event) => {
              if (isSelecting) {
                return;
              }

              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();

                onCharacterClick(character);
              }
            }}
            className={`
              group
              relative
              outline-none
              transition-all
              ease-out

              ${shouldFade ? "opacity-15 duration-[1500ms]" : "duration-300"}

              ${isSelecting ? "cursor-default" : "cursor-pointer"}

              ${isGloballyBanned && !shouldFade ? "opacity-25 grayscale" : ""}

              ${isGloballyBanned ? "grayscale" : ""}

              ${isSelecting && !isHighlighted ? "opacity-15" : ""}

              ${
                !isSelecting
                  ? "focus-visible:ring-2 focus-visible:ring-emerald-400"
                  : ""
              }
            `}
          >
            <Character
              name={infos[character.id]?.name ?? character.name}
              image={character.image}
              symbol={character.symbol}
              background={character.background}
              imageWidth={character.imageWidth}
              imageHeight={character.imageHeight}
              isHighlighted={isHighlighted}
              isFocused={isFocusedCharacter}
              isNew={character.isNew}
              isSelecting={isSelecting}
            />

            {isGloballyBanned && (
              <div
                className={`
                  pointer-events-none
                  absolute
                  inset-0
                  z-[60]
                  flex
                  items-center
                  justify-center
                  transition-transform
                  duration-150
                  ease-out

                  ${!isSelecting ? "group-hover:-translate-y-[4px]" : ""}
                `}
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-600/80 text-white shadow-lg">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    className="h-5 w-5"
                  >
                    <circle cx="12" cy="12" r="9" />

                    <path d="m6 6 12 12" />
                  </svg>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </section>
  );
}
