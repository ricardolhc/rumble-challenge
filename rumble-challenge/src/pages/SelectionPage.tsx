import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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
import { MultiplayerButton } from "./components/multiplayer/MultiplayerButton";
import { MultiplayerModal } from "./components/multiplayer/MultiplayerModal";
import { useMultiplayerRoom } from "./hooks/useMultiplayerRoom";

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
  const [isMultiplayerOpen, setIsMultiplayerOpen] = useState(false);
  const [drawLogs, setDrawLogs] = useState<DrawLog[]>(() => getDrawLogs());

  const [remoteHighlightedIndexes, setRemoteHighlightedIndexes] = useState<
    number[]
  >([]);
  const [remoteSelectedTeam, setRemoteSelectedTeam] = useState<
    CharacterType[] | null
  >(null);
  const [remoteIsSelecting, setRemoteIsSelecting] = useState(false);

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

  const handleRemoteDrawStart = useCallback(() => {
    setRemoteSelectedTeam(null);
    setRemoteHighlightedIndexes([]);
    setRemoteIsSelecting(true);
  }, []);

  const handleRemoteDrawFrame = useCallback((indexes: number[]) => {
    setRemoteHighlightedIndexes(indexes);
  }, []);

  const handleRemoteDrawResult = useCallback((team: CharacterType[]) => {
    setRemoteHighlightedIndexes([]);
    setRemoteIsSelecting(false);
    setRemoteSelectedTeam(team);
  }, []);

  const handleRemoteDrawClose = useCallback(() => {
    setRemoteSelectedTeam(null);
    setRemoteHighlightedIndexes([]);
    setRemoteIsSelecting(false);
  }, []);

  const {
    role,
    status: multiplayerStatus,
    connectedGuests,
    guestOfferCode,
    lastHostAnswerCode,
    errorMessage: multiplayerError,
    isHost,
    isGuest,
    isInRoom,
    becomeHost,
    createGuestOffer,
    createHostAnswer,
    applyHostAnswer,
    leaveRoom,
    broadcastDrawStart,
    broadcastDrawFrame,
    broadcastDrawResult,
    broadcastDrawClose,
  } = useMultiplayerRoom({
    onDrawStart: handleRemoteDrawStart,
    onDrawFrame: handleRemoteDrawFrame,
    onDrawResult: handleRemoteDrawResult,
    onDrawClose: handleRemoteDrawClose,
  });

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

  useEffect(() => {
    if (!isHost || !isSelecting) {
      return;
    }

    broadcastDrawFrame(highlightedIndexes);
  }, [highlightedIndexes, isSelecting, isHost, broadcastDrawFrame]);

  useEffect(() => {
    if (!isHost || !selectedTeam) {
      return;
    }

    broadcastDrawResult(selectedTeam);
  }, [selectedTeam, isHost, broadcastDrawResult]);

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
    setIsMultiplayerOpen(false);
    setIsSettingsOpen(true);
  }

  function openAbout() {
    setIsSettingsOpen(false);
    setIsMultiplayerOpen(false);
    setIsAboutOpen(true);
  }

  function openMultiplayer() {
    setIsSettingsOpen(false);
    setIsAboutOpen(false);
    setIsMultiplayerOpen(true);
  }

  function handleSelectCharacters() {
    if (isGuest) {
      return;
    }

    if (isHost) {
      broadcastDrawStart();
    }

    selectCharacters();
  }

  function handleCloseTeam() {
    closeTeam();

    if (isHost) {
      broadcastDrawClose();
    }
  }

  function handleLeaveMultiplayer() {
    leaveRoom();
    setRemoteSelectedTeam(null);
    setRemoteHighlightedIndexes([]);
    setRemoteIsSelecting(false);
  }

  const displayedHighlightedIndexes = isGuest
    ? remoteHighlightedIndexes
    : highlightedIndexes;

  const displayedIsSelecting = isGuest ? remoteIsSelecting : isSelecting;

  const displayedTeam = isGuest ? remoteSelectedTeam : selectedTeam;

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
          disabled={displayedIsSelecting || isLoadingCharacters || isGuest}
          onClick={openSettings}
        />

        <HelpButton
          disabled={displayedIsSelecting || isLoadingCharacters}
          onClick={openAbout}
        />

        <MultiplayerButton
          isInRoom={isInRoom}
          isHost={isHost}
          connectedGuests={connectedGuests}
          disabled={displayedIsSelecting}
          onClick={openMultiplayer}
        />

        <LanguageSelector disabled={displayedIsSelecting} />

        {isLoadingCharacters && (
          <div className="flex flex-1 items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-blue-500" />
              <span className="text-sm text-slate-400">
                {t("selection.page.loadingCharacters")}
              </span>
            </div>
          </div>
        )}

        {!isLoadingCharacters && charactersError && (
          <div className="flex flex-1 items-center justify-center">
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-6 py-4 text-center">
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

            {isGuest && (
              <div className="mx-auto mb-4 flex items-center gap-2 rounded-xl border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-sm text-blue-300">
                <span
                  className={`h-2 w-2 rounded-full ${
                    multiplayerStatus === "connected"
                      ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]"
                      : "animate-pulse bg-yellow-400"
                  }`}
                />
                {multiplayerStatus === "connected"
                  ? "Conectado ao host — aguardando o próximo sorteio"
                  : "Preparando conexão com o host"}
              </div>
            )}

            <div className="mx-auto mb-4 h-px w-full max-w-[1600px] bg-slate-700/50" />

            <CharacterGrid
              characters={characters}
              bannedCharacters={bannedCharacters}
              highlightedIndexes={displayedHighlightedIndexes}
              isSelecting={displayedIsSelecting}
              onCharacterClick={setSelectedCharacter}
            />

            {!isGuest && (
              <DrawButton
                drawCount={drawCount}
                isSelecting={isSelecting}
                hasAvailableTeam={hasAvailableTeam}
                onClick={handleSelectCharacters}
              />
            )}

            {isGuest && (
              <button
                type="button"
                disabled
                className="fixed bottom-6 left-1/2 z-20 -translate-x-1/2 cursor-not-allowed rounded-xl border border-slate-700 bg-slate-800 px-8 py-3 font-bold text-slate-400 shadow-xl"
              >
                {remoteIsSelecting
                  ? "Sorteando..."
                  : multiplayerStatus === "connected"
                    ? "Aguardando host"
                    : "Conectando..."}
              </button>
            )}
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

      {isMultiplayerOpen && (
        <MultiplayerModal
          role={role}
          status={multiplayerStatus}
          connectedGuests={connectedGuests}
          guestOfferCode={guestOfferCode}
          lastHostAnswerCode={lastHostAnswerCode}
          errorMessage={multiplayerError}
          onBecomeHost={becomeHost}
          onCreateGuestOffer={createGuestOffer}
          onCreateHostAnswer={createHostAnswer}
          onApplyHostAnswer={applyHostAnswer}
          onLeaveRoom={handleLeaveMultiplayer}
          onClose={() => setIsMultiplayerOpen(false)}
        />
      )}

      {displayedTeam && (
        <TeamModal
          team={displayedTeam}
          onClose={
            isGuest ? () => setRemoteSelectedTeam(null) : handleCloseTeam
          }
        />
      )}

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
