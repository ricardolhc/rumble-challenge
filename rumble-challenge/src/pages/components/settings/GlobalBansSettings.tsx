import type { CharacterType } from "../../SelectionPage";
import { CharacterBanList } from "./CharacterBanList";
import { getCharacterKey } from "./settings.utils";

interface GlobalBansSettingsProps {
  characters: CharacterType[];
  bannedCharacters: Set<string>;
  onToggleBan: (character: CharacterType) => void;
}

export function GlobalBansSettings({
  characters,
  bannedCharacters,
  onToggleBan,
}: GlobalBansSettingsProps) {
  function clearGlobalBans() {
    characters.forEach((character) => {
      if (bannedCharacters.has(getCharacterKey(character))) {
        onToggleBan(character);
      }
    });
  }

  return (
    <>
      <div className="flex items-center justify-between px-6 py-4">
        <span className="text-sm text-slate-400">
          <span className="font-semibold text-white">{bannedCharacters.size}</span>{" "}
          banidos de {characters.length}
        </span>

        {bannedCharacters.size > 0 && (
          <button
            type="button"
            onClick={clearGlobalBans}
            className="cursor-pointer text-xs font-medium text-red-400 hover:text-red-300"
          >
            Limpar banimentos
          </button>
        )}
      </div>

      <CharacterBanList
        characters={characters}
        bannedCharacters={bannedCharacters}
        globalBannedCharacters={bannedCharacters}
        onToggle={onToggleBan}
      />
    </>
  );
}
