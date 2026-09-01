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
import { useSoundSettings } from "./hooks/useSoundSettings";

import { useCharacterDraw } from "./hooks/useCharacterDraw";
import { useSelectionSettings } from "./hooks/useSelectionSettings";
import type { CharacterType } from "./selection.types";
import { getCharacterKey } from "./utils/selection.utils";
import { MultiplayerButton } from "./components/multiplayer/MultiplayerButton";
import { MultiplayerModal } from "./components/multiplayer/MultiplayerModal";
import { useMultiplayerRoom } from "./hooks/useMultiplayerRoom";
import { useCharacterInfos } from "./hooks/useCharacterinfos";

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
  const [remoteBannedCharacters, setRemoteBannedCharacters] = useState<
    Set<string>
  >(new Set());
  const [remoteChallengeMode, setRemoteChallengeMode] = useState(false);

  const lastLoggedTeamRef = useRef<CharacterType[] | null>(null);

  const tickAudioRef = useRef<HTMLAudioElement | null>(null);
  const resultAudioRef = useRef<HTMLAudioElement | null>(null);

  const { infos, isLoading: isLoadingDescriptions } = useCharacterInfos();

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
    challengeBanMode,
    setChallengeBanMode,
    banCharacters,
    banIndividualCharacters,
    replaceIndividualBans,
  } = useSelectionSettings();

  const {
    soundEnabled,
    setSoundEnabled,
    tickVolume,
    setTickVolume,
    resultVolume,
    setResultVolume,
  } = useSoundSettings();

  useEffect(() => {
    const baseUrl = import.meta.env.BASE_URL;

    const tickAudio = new Audio(`${baseUrl}sounds/tick.wav`);

    const resultAudio = new Audio(`${baseUrl}sounds/result.wav`);

    tickAudio.preload = "auto";
    resultAudio.preload = "auto";

    tickAudioRef.current = tickAudio;

    resultAudioRef.current = resultAudio;

    return () => {
      tickAudio.pause();
      resultAudio.pause();

      tickAudioRef.current = null;

      resultAudioRef.current = null;
    };
  }, []);

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

  const handleRemoteRoomState = useCallback(
    (state: { bannedCharacters: string[]; challengeMode: boolean }) => {
      setRemoteBannedCharacters(new Set(state.bannedCharacters));
      setRemoteChallengeMode(state.challengeMode);
    },
    [],
  );

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
    broadcastRoomState,
  } = useMultiplayerRoom({
    onDrawStart: handleRemoteDrawStart,
    onDrawFrame: handleRemoteDrawFrame,
    onDrawResult: handleRemoteDrawResult,
    onDrawClose: handleRemoteDrawClose,
    onRoomState: handleRemoteRoomState,
  });

  useEffect(() => {
    if (!isHost || !isInRoom) {
      return;
    }

    broadcastRoomState({
      bannedCharacters: Array.from(bannedCharacters),
      individualBans: {
        1: Array.from(individualBans[1]),
        2: Array.from(individualBans[2]),
        3: Array.from(individualBans[3]),
      },
      challengeMode,
      challengeBanMode,
    });
  }, [
    bannedCharacters,
    individualBans,
    challengeMode,
    challengeBanMode,
    connectedGuests,
    isHost,
    isInRoom,
    broadcastRoomState,
  ]);

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

  const handleChallengeTeamDrawn = useCallback(
    (team: CharacterType[]) => {
      if (challengeBanMode === "global") {
        banCharacters(team);
        return;
      }

      banIndividualCharacters(team);
    },
    [challengeBanMode, banCharacters, banIndividualCharacters],
  );

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
    onTeamDrawn: challengeMode ? handleChallengeTeamDrawn : undefined,
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

  useEffect(() => {
    const baseUrl = import.meta.env.BASE_URL;

    const tickAudio = new Audio(`${baseUrl}sounds/tick.wav`);
    const resultAudio = new Audio(`${baseUrl}sounds/result.wav`);

    tickAudio.preload = "auto";
    resultAudio.preload = "auto";

    tickAudio.volume = 0.35;
    resultAudio.volume = 0.6;

    tickAudioRef.current = tickAudio;
    resultAudioRef.current = resultAudio;

    return () => {
      tickAudio.pause();
      resultAudio.pause();

      tickAudioRef.current = null;
      resultAudioRef.current = null;
    };
  }, []);

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
    setRemoteBannedCharacters(new Set());
    setRemoteChallengeMode(false);
  }

  const displayedHighlightedIndexes = isGuest
    ? remoteHighlightedIndexes
    : highlightedIndexes;

  const displayedIsSelecting = isGuest ? remoteIsSelecting : isSelecting;

  const displayedTeam = isGuest ? remoteSelectedTeam : selectedTeam;

  useEffect(() => {
    if (
      !soundEnabled ||
      !displayedIsSelecting ||
      displayedHighlightedIndexes.length === 0
    ) {
      return;
    }

    const audio = tickAudioRef.current;

    if (!audio) {
      return;
    }

    audio.pause();

    audio.currentTime = 0;

    audio.volume = tickVolume;

    void audio.play().catch(() => {
      // O navegador pode bloquear
      // áudio sem interação prévia.
    });
  }, [
    displayedHighlightedIndexes,
    displayedIsSelecting,
    soundEnabled,
    tickVolume,
  ]);

  useEffect(() => {
    if (!soundEnabled || !displayedTeam) {
      return;
    }

    const audio = resultAudioRef.current;

    if (!audio) {
      return;
    }

    audio.pause();

    audio.currentTime = 0;

    audio.volume = resultVolume;

    void audio.play().catch(() => {
      // Ignora bloqueios
      // de autoplay.
    });
  }, [displayedTeam, soundEnabled, resultVolume]);

  const displayedBannedCharacters = isGuest
    ? remoteBannedCharacters
    : bannedCharacters;

  const displayedChallengeMode = isGuest ? remoteChallengeMode : challengeMode;

  const displayedAvailableCharactersCount = useMemo(
    () =>
      characters.filter(
        (character) =>
          !displayedBannedCharacters.has(getCharacterKey(character)),
      ).length,
    [characters, displayedBannedCharacters],
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
              availableCharactersCount={displayedAvailableCharactersCount}
              drawCount={drawCount}
              bannedCharactersCount={displayedBannedCharacters.size}
              challengeMode={displayedChallengeMode}
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
                  ? t("selection.page.connectedToHost")
                  : t("selection.page.connectingToHost")}
              </div>
            )}

            <div className="mx-auto mb-4 h-px w-full max-w-[1600px] bg-slate-700/50" />

            <CharacterGrid
              characters={characters}
              bannedCharacters={displayedBannedCharacters}
              highlightedIndexes={displayedHighlightedIndexes}
              isSelecting={displayedIsSelecting}
              onCharacterClick={setSelectedCharacter}
              infos={infos}
            />

            {!isGuest && (
              <DrawButton
                drawCount={drawCount}
                isSelecting={isSelecting}
                hasAvailableTeam={hasAvailableTeam}
                onClick={handleSelectCharacters}
              />
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
          challengeBanMode={challengeBanMode}
          soundEnabled={soundEnabled}
          tickVolume={tickVolume}
          resultVolume={resultVolume}
          onToggleBan={handleToggleBan}
          onToggleIndividualBan={handleToggleIndividualBan}
          onDrawCountChange={setDrawCount}
          onDrawSpeedChange={setDrawSpeed}
          onChallengeModeChange={setChallengeMode}
          onChallengeBanModeChange={setChallengeBanMode}
          onSoundEnabledChange={setSoundEnabled}
          onTickVolumeChange={setTickVolume}
          onResultVolumeChange={setResultVolume}
          onClose={() => setIsSettingsOpen(false)}
          drawLogs={drawLogs}
          onReplaceIndividualBans={replaceIndividualBans}
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
          name={infos[selectedCharacter.id]?.name ?? selectedCharacter.name}
          description={
            isLoadingDescriptions
              ? t("selection.page.loadingCharacterDescription")
              : (infos[selectedCharacter.id]?.description ??
                t("selection.page.characterDescriptionUnavailable"))
          }
          onClose={() => setSelectedCharacter(null)}
        />
      )}
    </>
  );
}
