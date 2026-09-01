import { useMemo, useState } from "react";

import { useTranslation } from "react-i18next";

import type { CharacterType } from "../../selection.types";

import { CharacterBanList } from "./CharacterBanList";

import { createBanProfileId, saveBanProfiles } from "./banProfiles.utils";

import type { BanProfile } from "./settings.types";

interface ProfilesSettingsProps {
  characters: CharacterType[];
  profiles: BanProfile[];
  onProfilesChange: (profiles: BanProfile[]) => void;
}

const EMPTY_GLOBAL_BANS = new Set<string>();

export function ProfilesSettings({
  characters,
  profiles,
  onProfilesChange,
}: ProfilesSettingsProps) {
  const { t } = useTranslation();

  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(
    profiles[0]?.id ?? null,
  );

  const [isCreating, setIsCreating] = useState(profiles.length === 0);

  const [newProfileName, setNewProfileName] = useState("");

  const [newProfileBans, setNewProfileBans] = useState<Set<string>>(new Set());

  const selectedProfile = useMemo(
    () => profiles.find((profile) => profile.id === selectedProfileId) ?? null,
    [profiles, selectedProfileId],
  );

  function updateProfiles(updatedProfiles: BanProfile[]) {
    onProfilesChange(updatedProfiles);
    saveBanProfiles(updatedProfiles);
  }

  function handleCreateProfile() {
    const normalizedName = newProfileName.trim();

    if (!normalizedName) {
      return;
    }

    const profile: BanProfile = {
      id: createBanProfileId(),
      name: normalizedName,
      bannedCharacters: Array.from(newProfileBans),
    };

    const updatedProfiles = [...profiles, profile];

    updateProfiles(updatedProfiles);

    setSelectedProfileId(profile.id);
    setNewProfileName("");
    setNewProfileBans(new Set());
    setIsCreating(false);
  }

  function handleDeleteProfile(profileId: string) {
    const updatedProfiles = profiles.filter(
      (profile) => profile.id !== profileId,
    );

    updateProfiles(updatedProfiles);

    if (selectedProfileId === profileId) {
      setSelectedProfileId(updatedProfiles[0]?.id ?? null);

      if (updatedProfiles.length === 0) {
        setIsCreating(true);
      }
    }
  }

  function handleProfileNameChange(name: string) {
    if (!selectedProfile) {
      return;
    }

    const updatedProfiles = profiles.map((profile) =>
      profile.id === selectedProfile.id
        ? {
            ...profile,
            name,
          }
        : profile,
    );

    updateProfiles(updatedProfiles);
  }

  function handleToggleProfileBan(character: CharacterType) {
    if (!selectedProfile) {
      return;
    }

    const characterKey = `${character.name}::${character.type}`;

    const updatedBans = new Set(selectedProfile.bannedCharacters);

    if (updatedBans.has(characterKey)) {
      updatedBans.delete(characterKey);
    } else {
      updatedBans.add(characterKey);
    }

    const updatedProfiles = profiles.map((profile) =>
      profile.id === selectedProfile.id
        ? {
            ...profile,
            bannedCharacters: Array.from(updatedBans),
          }
        : profile,
    );

    updateProfiles(updatedProfiles);
  }

  function handleToggleNewProfileBan(character: CharacterType) {
    const characterKey = `${character.name}::${character.type}`;

    setNewProfileBans((current) => {
      const updated = new Set(current);

      if (updated.has(characterKey)) {
        updated.delete(characterKey);
      } else {
        updated.add(characterKey);
      }

      return updated;
    });
  }

  function startCreatingProfile() {
    setIsCreating(true);
    setSelectedProfileId(null);
    setNewProfileName("");
    setNewProfileBans(new Set());
  }

  function cancelCreatingProfile() {
    setIsCreating(false);
    setNewProfileName("");
    setNewProfileBans(new Set());

    setSelectedProfileId(profiles[0]?.id ?? null);
  }

  return (
    <div className="flex min-h-0 flex-1">
      <aside className="flex w-[240px] shrink-0 flex-col border-r border-slate-700 bg-slate-900/30">
        <div className="border-b border-slate-700 p-4">
          <button
            type="button"
            onClick={startCreatingProfile}
            className="
              flex
              w-full
              cursor-pointer
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-emerald-600
              px-4
              py-2.5
              text-sm
              font-semibold
              text-white
              transition-colors
              hover:bg-emerald-500
            "
          >
            <span className="text-lg leading-none">+</span>

            {t("selection.components.settings.profilesSettings.newProfile")}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          {profiles.length === 0 && !isCreating && (
            <p className="px-3 py-4 text-center text-xs text-slate-500">
              {t("selection.components.settings.profilesSettings.noProfiles")}
            </p>
          )}

          <div className="space-y-1">
            {profiles.map((profile) => (
              <button
                key={profile.id}
                type="button"
                onClick={() => {
                  setSelectedProfileId(profile.id);
                  setIsCreating(false);
                }}
                className={`
                  flex
                  w-full
                  cursor-pointer
                  items-center
                  justify-between
                  rounded-lg
                  px-3
                  py-2.5
                  text-left
                  text-sm
                  transition-colors
                  ${
                    selectedProfileId === profile.id && !isCreating
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  }
                `}
              >
                <span className="min-w-0 truncate font-medium">
                  {profile.name}
                </span>

                {profile.bannedCharacters.length > 0 && (
                  <span className="ml-2 rounded-full bg-slate-800 px-2 py-0.5 text-[10px] text-slate-400">
                    {profile.bannedCharacters.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {isCreating ? (
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="border-b border-slate-700 px-6 py-4">
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <label className="mb-2 block text-xs font-medium text-slate-400">
                  {t(
                    "selection.components.settings.profilesSettings.profileName",
                  )}
                </label>

                <input
                  type="text"
                  value={newProfileName}
                  onChange={(event) => setNewProfileName(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      handleCreateProfile();
                    }
                  }}
                  autoFocus
                  placeholder={t(
                    "selection.components.settings.profilesSettings.profileNamePlaceholder",
                  )}
                  className="
                    w-full
                    rounded-xl
                    border
                    border-slate-700
                    bg-slate-900/50
                    px-4
                    py-2.5
                    text-sm
                    text-white
                    outline-none
                    transition-colors
                    placeholder:text-slate-600
                    focus:border-emerald-500/60
                  "
                />
              </div>

              <button
                type="button"
                onClick={cancelCreatingProfile}
                className="
                  cursor-pointer
                  rounded-xl
                  border
                  border-slate-700
                  px-4
                  py-2.5
                  text-sm
                  font-medium
                  text-slate-400
                  transition-colors
                  hover:bg-slate-800
                  hover:text-white
                "
              >
                {t("selection.components.settings.profilesSettings.cancel")}
              </button>

              <button
                type="button"
                disabled={!newProfileName.trim()}
                onClick={handleCreateProfile}
                className="
                  cursor-pointer
                  rounded-xl
                  bg-emerald-600
                  px-5
                  py-2.5
                  text-sm
                  font-semibold
                  text-white
                  transition-colors
                  hover:bg-emerald-500
                  disabled:cursor-not-allowed
                  disabled:opacity-40
                "
              >
                {t("selection.components.settings.profilesSettings.create")}
              </button>
            </div>

            <p className="mt-3 text-xs text-slate-500">
              {newProfileBans.size}{" "}
              {t(
                "selection.components.settings.profilesSettings.bannedCharacters",
              )}
            </p>
          </div>

          <CharacterBanList
            characters={characters}
            bannedCharacters={newProfileBans}
            globalBannedCharacters={EMPTY_GLOBAL_BANS}
            onToggle={handleToggleNewProfileBan}
          />
        </div>
      ) : selectedProfile ? (
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="border-b border-slate-700 px-6 py-4">
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <label className="mb-2 block text-xs font-medium text-slate-400">
                  {t(
                    "selection.components.settings.profilesSettings.profileName",
                  )}
                </label>

                <input
                  type="text"
                  value={selectedProfile.name}
                  onChange={(event) =>
                    handleProfileNameChange(event.target.value)
                  }
                  className="
                    w-full
                    rounded-xl
                    border
                    border-slate-700
                    bg-slate-900/50
                    px-4
                    py-2.5
                    text-sm
                    text-white
                    outline-none
                    transition-colors
                    focus:border-emerald-500/60
                  "
                />
              </div>

              <button
                type="button"
                onClick={() => handleDeleteProfile(selectedProfile.id)}
                className="
                  cursor-pointer
                  rounded-xl
                  border
                  border-red-500/30
                  bg-red-500/5
                  px-4
                  py-2.5
                  text-sm
                  font-medium
                  text-red-400
                  transition-colors
                  hover:bg-red-500/10
                  hover:text-red-300
                "
              >
                {t("selection.components.settings.profilesSettings.delete")}
              </button>
            </div>

            <p className="mt-3 text-xs text-slate-500">
              {selectedProfile.bannedCharacters.length}{" "}
              {t(
                "selection.components.settings.profilesSettings.bannedCharacters",
              )}
            </p>
          </div>

          <CharacterBanList
            characters={characters}
            bannedCharacters={new Set(selectedProfile.bannedCharacters)}
            globalBannedCharacters={EMPTY_GLOBAL_BANS}
            onToggle={handleToggleProfileBan}
          />
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm text-slate-500">
            {t("selection.components.settings.profilesSettings.noProfiles")}
          </p>
        </div>
      )}
    </div>
  );
}
