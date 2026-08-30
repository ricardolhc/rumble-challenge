import { useMemo, useState } from "react";

import personagensJson from "../personagens.json";

import { CharacterGrid } from "./components/selection/CharacterGrid";
import { DrawButton } from "./components/selection/DrawButton";
import { SelectionHeader } from "./components/selection/SelectionHeader";
import { SettingsButton } from "./components/selection/SettingsButton";
import { SettingsModal } from "./components/settings/SettingsModal";
import { TeamModal } from "./components/TeamModal";
import { useCharacterDraw } from "./hooks/useCharacterDraw";
import { useSelectionSettings } from "./hooks/useSelectionSettings";
import type { CharacterType } from "./selection.types";
import { getCharacterKey } from "./utils/selection.utils";

export type { CharacterType } from "./selection.types";
export { getCharacterKey } from "./utils/selection.utils";

const characters: CharacterType[] = personagensJson;

export function SelectionPage() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const {
    drawCount,
    drawSpeed,
    bannedCharacters,
    individualBans,
    setDrawCount,
    setDrawSpeed,
    toggleBan,
    toggleIndividualBan,
  } = useSelectionSettings();

  const {
    highlightedIndexes,
    isSelecting,
    selectedTeam,
    hasAvailableTeam,
    selectCharacters,
    closeTeam,
  } = useCharacterDraw({
    characters,
    drawCount,
    drawSpeed,
    bannedCharacters,
    individualBans,
  });

  const availableCharactersCount = useMemo(
    () =>
      characters.filter(
        (character) => !bannedCharacters.has(getCharacterKey(character)),
      ).length,
    [bannedCharacters],
  );

  return (
    <>
      <main
        className="relative flex min-h-screen w-full flex-col overflow-x-hidden px-4 py-4 text-white"
        style={{
          backgroundColor: "#11151d",
          backgroundImage:
            "radial-gradient(circle, rgba(148, 163, 184, 0.13) 1.2px, transparent 1.2px)",
          backgroundSize: "20px 20px",
        }}
      >
        <SettingsButton
          disabled={isSelecting}
          onClick={() => setIsSettingsOpen(true)}
        />

        <SelectionHeader
          availableCharactersCount={availableCharactersCount}
          drawCount={drawCount}
          bannedCharactersCount={bannedCharacters.size}
        />

        <div className="mx-auto mb-4 h-px w-full max-w-[1600px] bg-slate-700/50" />

        <CharacterGrid
          characters={characters}
          bannedCharacters={bannedCharacters}
          highlightedIndexes={highlightedIndexes}
          isSelecting={isSelecting}
        />

        <DrawButton
          drawCount={drawCount}
          isSelecting={isSelecting}
          hasAvailableTeam={hasAvailableTeam}
          onClick={selectCharacters}
        />
      </main>

      {isSettingsOpen && (
        <SettingsModal
          characters={characters}
          bannedCharacters={bannedCharacters}
          onToggleBan={toggleBan}
          individualBans={individualBans}
          onToggleIndividualBan={toggleIndividualBan}
          drawCount={drawCount}
          drawSpeed={drawSpeed}
          onDrawCountChange={setDrawCount}
          onDrawSpeedChange={setDrawSpeed}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}

      {selectedTeam && <TeamModal team={selectedTeam} onClose={closeTeam} />}
    </>
  );
}
