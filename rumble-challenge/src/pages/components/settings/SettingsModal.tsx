import { useState } from "react";
import type { MouseEvent } from "react";

import type { CharacterType } from "../../SelectionPage";
import { DrawSettings } from "./DrawSettings";
import { GlobalBansSettings } from "./GlobalBansSettings";
import { IndividualBansSettings } from "./IndividualBansSettings";
import { SettingsHeader } from "./SettingsHeader";
import { SettingsSidebar } from "./SettingsSidebar";
import type {
  DrawCount,
  DrawSpeed,
  MemberSlot,
  SettingsSection,
} from "./settings.types";

export type { DrawCount, DrawSpeed, MemberSlot } from "./settings.types";

interface SettingsModalProps {
  characters: CharacterType[];
  bannedCharacters: Set<string>;
  individualBans: Record<MemberSlot, Set<string>>;
  drawCount: DrawCount;
  drawSpeed: DrawSpeed;
  onDrawCountChange: (count: DrawCount) => void;
  onDrawSpeedChange: (speed: DrawSpeed) => void;
  onClose: () => void;
  onToggleBan: (character: CharacterType) => void;
  onToggleIndividualBan: (member: MemberSlot, character: CharacterType) => void;
}

export function SettingsModal({
  characters,
  bannedCharacters,
  onToggleBan,
  individualBans,
  onToggleIndividualBan,
  drawCount,
  drawSpeed,
  onDrawCountChange,
  onDrawSpeedChange,
  onClose,
}: SettingsModalProps) {
  const [selectedSection, setSelectedSection] =
    useState<SettingsSection>("bans");

  const totalIndividualBans =
    individualBans[1].size + individualBans[2].size + individualBans[3].size;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onMouseDown={onClose}
    >
      <div
        className="flex h-[650px] w-full max-w-[1100px] overflow-hidden rounded-2xl border border-slate-700 bg-[#161b25] shadow-2xl"
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
        />

        <section className="flex min-w-0 flex-1 flex-col">
          <SettingsHeader selectedSection={selectedSection} onClose={onClose} />

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
        </section>
      </div>
    </div>
  );
}
