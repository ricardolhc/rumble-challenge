import { useEffect, useRef, useState } from "react";
import type { MouseEvent } from "react";

import type { CharacterType } from "../../selection.types";

import { LogsSettings } from "../LogsSettings";
import { DrawSettings } from "./DrawSettings";
import { GlobalBansSettings } from "./GlobalBansSettings";
import { IndividualBansSettings } from "./IndividualBansSettings";
import { SettingsHeader } from "./SettingsHeader";
import { SettingsSidebar } from "./SettingsSidebar";

import type {
  DrawCount,
  DrawLog,
  DrawSpeed,
  MemberSlot,
  SettingsSection,
} from "./settings.types";
import { ChallengeModeSettings } from "./ChallengeModeSettings";

export type { DrawCount, DrawSpeed, MemberSlot } from "./settings.types";

interface SettingsModalProps {
  characters: CharacterType[];

  bannedCharacters: Set<string>;

  individualBans: Record<MemberSlot, Set<string>>;

  drawCount: DrawCount;

  drawSpeed: DrawSpeed;

  challengeMode: boolean;

  onDrawCountChange: (count: DrawCount) => void;

  onDrawSpeedChange: (speed: DrawSpeed) => void;

  onChallengeModeChange: (enabled: boolean) => void;

  onClose: () => void;

  onToggleBan: (character: CharacterType) => void;

  onToggleIndividualBan: (member: MemberSlot, character: CharacterType) => void;

  drawLogs: DrawLog[];
}

const FADE_DURATION = 250;

export function SettingsModal({
  characters,
  bannedCharacters,
  individualBans,
  drawCount,
  drawSpeed,
  challengeMode,
  onDrawCountChange,
  onDrawSpeedChange,
  onChallengeModeChange,
  onToggleBan,
  onToggleIndividualBan,
  onClose,
  drawLogs,
}: SettingsModalProps) {
  const [selectedSection, setSelectedSection] =
    useState<SettingsSection>("bans");

  const [isVisible, setIsVisible] = useState(false);

  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const totalIndividualBans =
    individualBans[1].size + individualBans[2].size + individualBans[3].size;

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setIsVisible(true);
    });

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        handleClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      cancelAnimationFrame(frame);

      document.removeEventListener("keydown", handleKeyDown);

      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  function handleClose() {
    if (!isVisible) {
      return;
    }

    setIsVisible(false);

    closeTimeoutRef.current = setTimeout(() => {
      onClose();
    }, FADE_DURATION);
  }

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm transition-opacity duration-[250ms] ease-out ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      onMouseDown={handleClose}
    >
      <div
        className={`flex h-[650px] w-full max-w-[1100px] overflow-hidden rounded-2xl border border-slate-700 bg-[#161b25] shadow-2xl transition-all duration-[250ms] ease-out ${
          isVisible
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-3 scale-[0.98] opacity-0"
        }`}
        onMouseDown={(event: MouseEvent<HTMLDivElement>) =>
          event.stopPropagation()
        }
      >
        <SettingsSidebar
          selectedSection={selectedSection}
          onSectionChange={setSelectedSection}
          globalBansCount={bannedCharacters.size}
          individualBansCount={totalIndividualBans}
          drawCount={drawCount}
          logsCount={drawLogs.length}
          challengeMode={challengeMode}
        />

        <section className="flex min-w-0 flex-1 flex-col">
          <SettingsHeader
            selectedSection={selectedSection}
            onClose={handleClose}
          />

          {selectedSection === "bans" && (
            <GlobalBansSettings
              characters={characters}
              bannedCharacters={bannedCharacters}
              onToggleBan={onToggleBan}
            />
          )}

          {selectedSection === "individual-bans" && (
            <IndividualBansSettings
              characters={characters}
              bannedCharacters={bannedCharacters}
              individualBans={individualBans}
              onToggleIndividualBan={onToggleIndividualBan}
            />
          )}

          {selectedSection === "draws" && (
            <DrawSettings
              drawCount={drawCount}
              drawSpeed={drawSpeed}
              onDrawCountChange={onDrawCountChange}
              onDrawSpeedChange={onDrawSpeedChange}
            />
          )}

          {selectedSection === "challenge-mode" && (
            <ChallengeModeSettings
              challengeMode={challengeMode}
              onChallengeModeChange={onChallengeModeChange}
            />
          )}

          {selectedSection === "logs" && <LogsSettings logs={drawLogs} />}
        </section>
      </div>
    </div>
  );
}
