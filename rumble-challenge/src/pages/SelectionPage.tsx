import { useEffect, useMemo, useRef, useState } from "react";

import { useTranslation } from "react-i18next";

import { AboutModal } from "./components/AboutModal";
import { CharacterModal } from "./components/CharacterModal";
import { HelpButton } from "./components/HelpButton";
import { LanguageSelector } from "./components/LanguageSelector";
import { CharacterGrid } from "./components/selection/CharacterGrid";
import { DrawButton } from "./components/selection/DrawButton";
import { SelectionHeader } from "./components/selection/SelectionHeader";
import { SettingsButton } from "./components/selection/SettingsButton";
import { SettingsModal } from "./components/settings/SettingsModal";

import type { DrawLog } from "./components/settings/settings.types";

import { TeamModal } from "./components/TeamModal";

import { addDrawLog, getDrawLogs } from "./components/utils/drawLogs.utils";

import { useCharacterDescriptions } from "./hooks/useCharacterDescriptions";
import { useCharacterDraw } from "./hooks/useCharacterDraw";
import { useSelectionSettings } from "./hooks/useSelectionSettings";

import type { CharacterType } from "./selection.types";

import { getCharacterKey } from "./utils/selection.utils";

export type { CharacterType } from "./selection.types";

export { getCharacterKey } from "./utils/selection.utils";

const CHARACTERS_URL = "https://api.npoint.io/ac031218a4837bc1162c";

export function SelectionPage() {
  const { t } = useTranslation();

  const [characters, setCharacters] = useState<CharacterType[]>([]);

  const [isLoadingCharacters, setIsLoadingCharacters] = useState(true);

  const [charactersError, setCharactersError] = useState<string | null>(null);

  const [selectedCharacter, setSelectedCharacter] =
    useState<CharacterType | null>(null);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [isAboutOpen, setIsAboutOpen] = useState(false);

  const [drawLogs, setDrawLogs] = useState<DrawLog[]>(() => getDrawLogs());

  const lastLoggedTeamRef = useRef<CharacterType[] | null>(null);

  const { descriptions, isLoading: isLoadingDescriptions } =
    useCharacterDescriptions();

  const {
    drawCount,
    setDrawCount,
    drawSpeed,
    setDrawSpeed,
    bannedCharacters,
    individualBans,
    handleToggleBan,
    handleToggleIndividualBan,
    challengeMode,
    setChallengeMode,
    banCharacters,
  } = useSelectionSettings();

  useEffect(() => {
    const controller = new AbortController();

    async function loadCharacters() {
      try {
        setIsLoadingCharacters(true);
        setCharactersError(null);

        const response = await fetch(CHARACTERS_URL, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(
            `${t("selection.page.loadingCharactersError")}: ${response.status}`,
          );
        }

        const data: CharacterType[] = await response.json();

        setCharacters(data);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        console.error("Erro ao carregar personagens:", error);

        setCharactersError(
          t("selection.page.loadingCharactersErrorDescription"),
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingCharacters(false);
        }
      }
    }

    void loadCharacters();

    return () => {
      controller.abort();
    };
  }, [t]);

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
    onTeamDrawn: challengeMode ? banCharacters : undefined,
  });

  const availableCharactersCount = useMemo(
    () =>
      characters.filter(
        (character) => !bannedCharacters.has(getCharacterKey(character)),
      ).length,
    [characters, bannedCharacters],
  );

  useEffect(() => {
    if (!selectedTeam) {
      return;
    }

    if (lastLoggedTeamRef.current === selectedTeam) {
      return;
    }

    lastLoggedTeamRef.current = selectedTeam;

    const updatedLogs = addDrawLog(selectedTeam);

    setDrawLogs(updatedLogs);
  }, [selectedTeam]);

  function openSettings() {
    setIsAboutOpen(false);
    setIsSettingsOpen(true);
  }

  function openAbout() {
    setIsSettingsOpen(false);
    setIsAboutOpen(true);
  }

  return (
    <>
      <main
        className="
          relative
          flex
          min-h-screen
          w-full
          flex-col
          overflow-x-hidden
          px-4
          py-4
          text-white
        "
        style={{
          backgroundColor: "#11151d",
          backgroundImage:
            "radial-gradient(circle, rgba(148, 163, 184, 0.13) 1.2px, transparent 1.2px)",
          backgroundSize: "20px 20px",
        }}
      >
        <SettingsButton
          disabled={isSelecting || isLoadingCharacters}
          onClick={openSettings}
        />

        <HelpButton
          disabled={isSelecting || isLoadingCharacters}
          onClick={openAbout}
        />

        <LanguageSelector disabled={isSelecting} />

        {isLoadingCharacters && (
          <div className="flex flex-1 items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div
                className="
                  h-10
                  w-10
                  animate-spin
                  rounded-full
                  border-4
                  border-slate-700
                  border-t-blue-500
                "
              />

              <span className="text-sm text-slate-400">
                {t("selection.page.loadingCharacters")}
              </span>
            </div>
          </div>
        )}

        {!isLoadingCharacters && charactersError && (
          <div className="flex flex-1 items-center justify-center">
            <div
              className="
                  rounded-xl
                  border
                  border-red-500/30
                  bg-red-500/10
                  px-6
                  py-4
                  text-center
                "
            >
              <p className="font-medium text-red-400">{charactersError}</p>
            </div>
          </div>
        )}

        {!isLoadingCharacters && !charactersError && (
          <>
            <SelectionHeader
              availableCharactersCount={availableCharactersCount}
              drawCount={drawCount}
              bannedCharactersCount={bannedCharacters.size}
              challengeMode={challengeMode}
            />

            <div
              className="
                  mx-auto
                  mb-4
                  h-px
                  w-full
                  max-w-[1600px]
                  bg-slate-700/50
                "
            />

            <CharacterGrid
              characters={characters}
              bannedCharacters={bannedCharacters}
              highlightedIndexes={highlightedIndexes}
              isSelecting={isSelecting}
              onCharacterClick={setSelectedCharacter}
            />

            <DrawButton
              drawCount={drawCount}
              isSelecting={isSelecting}
              hasAvailableTeam={hasAvailableTeam}
              onClick={selectCharacters}
            />
          </>
        )}
      </main>

      {isSettingsOpen && (
        <SettingsModal
          characters={characters}
          bannedCharacters={bannedCharacters}
          individualBans={individualBans}
          drawCount={drawCount}
          drawSpeed={drawSpeed}
          challengeMode={challengeMode}
          onToggleBan={handleToggleBan}
          onToggleIndividualBan={handleToggleIndividualBan}
          onDrawCountChange={setDrawCount}
          onDrawSpeedChange={setDrawSpeed}
          onChallengeModeChange={setChallengeMode}
          onClose={() => setIsSettingsOpen(false)}
          drawLogs={drawLogs}
        />
      )}

      {isAboutOpen && <AboutModal onClose={() => setIsAboutOpen(false)} />}

      {selectedTeam && <TeamModal team={selectedTeam} onClose={closeTeam} />}

      {selectedCharacter && (
        <CharacterModal
          character={selectedCharacter}
          description={
            isLoadingDescriptions
              ? t("selection.page.loadingCharacterDescription")
              : (descriptions[selectedCharacter.id]?.description ??
                t("selection.page.characterDescriptionUnavailable"))
          }
          onClose={() => setSelectedCharacter(null)}
        />
      )}
    </>
  );
}
