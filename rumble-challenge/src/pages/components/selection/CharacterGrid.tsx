import { Character } from "../Character";

import type { CharacterType } from "../../selection.types";

import { getCharacterKey } from "../../utils/selection.utils";

interface CharacterGridProps {
  characters: CharacterType[];
  bannedCharacters: Set<string>;
  highlightedIndexes: number[];
  isSelecting: boolean;
  onCharacterClick: (character: CharacterType) => void;
}

export function CharacterGrid({
  characters,
  bannedCharacters,
  highlightedIndexes,
  isSelecting,
  onCharacterClick,
}: CharacterGridProps) {
  const highlighted = new Set(highlightedIndexes);

  return (
    <section className="mx-auto flex w-full max-w-[1680px] flex-wrap justify-center gap-0">
      {characters.map((character, index) => {
        const isGloballyBanned = bannedCharacters.has(
          getCharacterKey(character),
        );

        const isHighlighted = highlighted.has(index);

        return (
          <div
            key={getCharacterKey(character)}
            role="button"
            tabIndex={isSelecting ? -1 : 0}
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
              duration-200

              ${isSelecting ? "cursor-default" : "cursor-pointer"}

              ${isGloballyBanned ? "opacity-25 grayscale" : ""}

              ${isSelecting && !isHighlighted ? "opacity-15" : ""}

              ${
                !isSelecting
                  ? "focus-visible:ring-2 focus-visible:ring-emerald-400"
                  : ""
              }
            `}
          >
            <Character
              name={character.name}
              image={character.image}
              symbol={character.symbol}
              background={character.background}
              imageWidth={character.imageWidth}
              imageHeight={character.imageHeight}
              isHighlighted={isHighlighted}
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
