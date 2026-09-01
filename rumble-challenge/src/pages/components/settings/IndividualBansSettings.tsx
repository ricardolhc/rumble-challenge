import { useState } from "react";

import { useTranslation } from "react-i18next";

import type { CharacterType } from "../../selection.types";

import { CharacterBanList } from "./CharacterBanList";

import type { BanProfile, MemberSlot } from "./settings.types";

interface IndividualBansSettingsProps {
  characters: CharacterType[];
  bannedCharacters: Set<string>;
  individualBans: Record<MemberSlot, Set<string>>;
  profiles: BanProfile[];

  onToggleIndividualBan: (member: MemberSlot, character: CharacterType) => void;

  onReplaceIndividualBans: (
    member: MemberSlot,
    bannedCharacters: Set<string>,
  ) => void;
}

const members: MemberSlot[] = [1, 2, 3];

export function IndividualBansSettings({
  characters,
  bannedCharacters,
  individualBans,
  profiles,
  onToggleIndividualBan,
  onReplaceIndividualBans,
}: IndividualBansSettingsProps) {
  const [selectedMember, setSelectedMember] = useState<MemberSlot>(1);

  const { t } = useTranslation();

  function clearIndividualBans(member: MemberSlot) {
    onReplaceIndividualBans(member, new Set());
  }

  function applyProfile(profileId: string) {
    if (!profileId) {
      return;
    }

    const profile = profiles.find(
      (currentProfile) => currentProfile.id === profileId,
    );

    if (!profile) {
      return;
    }

    /*
     * SUBSTITUI os banimentos atuais.
     *
     * Não fazemos merge com os bans existentes.
     */
    onReplaceIndividualBans(selectedMember, new Set(profile.bannedCharacters));
  }

  return (
    <>
      <div className="px-6 pt-4">
        <div className="flex rounded-xl border border-slate-700 bg-slate-900/50 p-1">
          {members.map((member) => (
            <button
              key={member}
              type="button"
              onClick={() => setSelectedMember(member)}
              className={`flex-1 cursor-pointer rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
                selectedMember === member
                  ? "bg-emerald-600 text-white shadow"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              {t("selection.components.settings.individualBansSettings.member")}{" "}
              {member}
              {individualBans[member].size > 0 && (
                <span className="ml-2 rounded-full bg-black/20 px-2 py-0.5 text-[10px]">
                  {individualBans[member].size}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 pt-4">
        <div className="rounded-xl border border-slate-700 bg-slate-900/30 p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-white">
                {t(
                  "selection.components.settings.individualBansSettings.profile",
                )}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {t(
                  "selection.components.settings.individualBansSettings.profileDescription",
                )}
              </p>
            </div>

            <select
              value=""
              disabled={profiles.length === 0}
              onChange={(event) => {
                applyProfile(event.target.value);
              }}
              className="
                min-w-[220px]
                cursor-pointer
                rounded-xl
                border
                border-slate-700
                bg-slate-900
                px-3
                py-2
                text-sm
                text-white
                outline-none
                transition-colors
                focus:border-emerald-500/60
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              <option value="">
                {profiles.length === 0
                  ? t(
                      "selection.components.settings.individualBansSettings.noProfiles",
                    )
                  : t(
                      "selection.components.settings.individualBansSettings.selectProfile",
                    )}
              </option>

              {profiles.map((profile) => (
                <option key={profile.id} value={profile.id}>
                  {profile.name} ({profile.bannedCharacters.length})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <p className="text-sm font-medium text-white">
            {t("selection.components.settings.individualBansSettings.member")}{" "}
            {selectedMember}
          </p>

          <p className="text-xs text-slate-500">
            {individualBans[selectedMember].size}{" "}
            {t(
              "selection.components.settings.individualBansSettings.bannedCharacters",
            )}
          </p>
        </div>

        {individualBans[selectedMember].size > 0 && (
          <button
            type="button"
            onClick={() => clearIndividualBans(selectedMember)}
            className="cursor-pointer text-xs font-medium text-red-400 hover:text-red-300"
          >
            {t(
              "selection.components.settings.individualBansSettings.clearMember",
            )}{" "}
            {selectedMember}
          </button>
        )}
      </div>

      <CharacterBanList
        characters={characters}
        bannedCharacters={individualBans[selectedMember]}
        globalBannedCharacters={bannedCharacters}
        onToggle={(character) =>
          onToggleIndividualBan(selectedMember, character)
        }
        disableGlobalBans
      />
    </>
  );
}
