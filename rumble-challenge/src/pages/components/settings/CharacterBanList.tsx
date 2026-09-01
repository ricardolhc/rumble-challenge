import { useTranslation } from "react-i18next";

import type { CharacterType } from "../../selection.types";

import { getCharacterKey } from "./settings.utils";

interface CharacterBanListProps {
  characters: CharacterType[];
  bannedCharacters: Set<string>;
  globalBannedCharacters: Set<string>;
  onToggle: (character: CharacterType) => void;
  disableGlobalBans?: boolean;
}

export function CharacterBanList({
  characters,
  bannedCharacters,
  globalBannedCharacters,
  onToggle,
  disableGlobalBans = false,
}: CharacterBanListProps) {
  const { t } = useTranslation();

  return (
    <div className="grid flex-1 grid-cols-2 content-start gap-2 overflow-y-auto px-6 pb-6 md:grid-cols-3">
      {characters.map((character) => {
        const characterKey = getCharacterKey(character);

        const isBanned = bannedCharacters.has(characterKey);

        const isGloballyBanned = globalBannedCharacters.has(characterKey);

        const isDisabled = disableGlobalBans && isGloballyBanned;

        return (
          <button
            key={characterKey}
            type="button"
            disabled={isDisabled}
            onClick={() => {
              if (!isDisabled) {
                onToggle(character);
              }
            }}
            className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-all ${
              isDisabled
                ? "cursor-not-allowed border-orange-500/30 bg-orange-500/5 opacity-60"
                : isBanned
                  ? "cursor-pointer border-red-500/40 bg-red-500/10"
                  : "cursor-pointer border-slate-700 bg-slate-800/40 hover:border-slate-600 hover:bg-slate-800"
            }`}
          >
            <div
              className="
                relative
                h-12
                w-12
                shrink-0
                overflow-hidden
                rounded-lg
                bg-slate-900
              "
              style={{
                backgroundImage: `url(${character.background})`,
                backgroundSize: "48px 48px",
              }}
            >
              <img
                src={character.image}
                alt={character.name}
                className="
                  absolute
                  inset-0
                  h-full
                  w-full
                  origin-bottom
                  scale-125
                  object-contain
                  object-bottom
                "
              />

              {(isBanned || isDisabled) && (
                <div className="absolute inset-0 flex items-center justify-center bg-red-950/65">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    className="h-6 w-6 text-red-400"
                  >
                    <circle cx="12" cy="12" r="9" />

                    <path d="m6 6 12 12" />
                  </svg>
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p
                className={`truncate text-xs font-semibold ${
                  isDisabled
                    ? "text-orange-300"
                    : isBanned
                      ? "text-red-300"
                      : "text-slate-200"
                }`}
                title={character.name}
              >
                {character.name}
              </p>

              <p className="mt-0.5 text-[10px] uppercase">
                {isDisabled ? (
                  <span className="text-orange-400">
                    {t(
                      "selection.components.settings.characterBanList.globalBanned",
                    )}
                  </span>
                ) : isBanned ? (
                  <span className="text-red-500">
                    {t("selection.components.settings.characterBanList.banned")}
                  </span>
                ) : (
                  <span className="text-slate-500">{character.type}</span>
                )}
              </p>
            </div>

            <div
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                isBanned || isDisabled
                  ? "border-red-500 bg-red-500"
                  : "border-slate-600 bg-slate-900"
              }`}
            >
              {(isBanned || isDisabled) && (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="3"
                  className="h-3 w-3"
                >
                  <path d="m5 12 4 4L19 6" />
                </svg>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
