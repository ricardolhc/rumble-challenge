import { useMemo, useRef, useState } from "react";

import { useTranslation } from "react-i18next";

import type { ChangeEvent } from "react";

import type { CharacterType } from "../../selection.types";

import { getCharacterKey } from "../../utils/selection.utils";

import { CharacterBanList } from "./CharacterBanList";

import {
  createBanProfileId,
  exportBanProfile,
  getUniqueBanProfileName,
  parseBanProfile,
  saveBanProfiles,
} from "./banProfiles.utils";

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

  const importInputRef = useRef<HTMLInputElement>(null);

  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(
    profiles[0]?.id ?? null,
  );

  const [isCreating, setIsCreating] = useState(false);

  const [newProfileName, setNewProfileName] = useState("");

  const [newProfileBans, setNewProfileBans] = useState<Set<string>>(
    () => new Set(),
  );

  const [importError, setImportError] = useState<string | null>(null);

  const selectedProfile = useMemo(
    () => profiles.find((profile) => profile.id === selectedProfileId) ?? null,
    [profiles, selectedProfileId],
  );

  function updateProfiles(updatedProfiles: BanProfile[]) {
    onProfilesChange(updatedProfiles);

    saveBanProfiles(updatedProfiles);
  }

  function handleStartCreate() {
    setIsCreating(true);
    setNewProfileName("");
    setNewProfileBans(new Set());
    setImportError(null);
  }

  function handleCancelCreate() {
    setIsCreating(false);
    setNewProfileName("");
    setNewProfileBans(new Set());
  }

  function handleToggleNewProfileBan(character: CharacterType) {
    const characterKey = getCharacterKey(character);

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

  function handleCreateProfile() {
    const name = newProfileName.trim();

    if (!name) {
      return;
    }

    const profile: BanProfile = {
      id: createBanProfileId(),

      name: getUniqueBanProfileName(name, profiles),

      bannedCharacters: Array.from(newProfileBans),
    };

    const updatedProfiles = [...profiles, profile];

    updateProfiles(updatedProfiles);

    setSelectedProfileId(profile.id);

    setIsCreating(false);

    setNewProfileName("");

    setNewProfileBans(new Set());
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

    const characterKey = getCharacterKey(character);

    const currentBans = new Set(selectedProfile.bannedCharacters);

    if (currentBans.has(characterKey)) {
      currentBans.delete(characterKey);
    } else {
      currentBans.add(characterKey);
    }

    const updatedProfiles = profiles.map((profile) =>
      profile.id === selectedProfile.id
        ? {
            ...profile,
            bannedCharacters: Array.from(currentBans),
          }
        : profile,
    );

    updateProfiles(updatedProfiles);
  }

  function handleDeleteProfile() {
    if (!selectedProfile) {
      return;
    }

    const updatedProfiles = profiles.filter(
      (profile) => profile.id !== selectedProfile.id,
    );

    updateProfiles(updatedProfiles);

    setSelectedProfileId(updatedProfiles[0]?.id ?? null);
  }

  function handleExportProfile() {
    if (!selectedProfile) {
      return;
    }

    exportBanProfile(selectedProfile);
  }

  function handleOpenImport() {
    setImportError(null);

    importInputRef.current?.click();
  }

  async function handleImportProfile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    /*
     * Permite selecionar o mesmo arquivo novamente
     * depois da importação.
     */
    event.target.value = "";

    if (!file) {
      return;
    }

    setImportError(null);

    try {
      const content = await file.text();

      const importedProfile = parseBanProfile(content);

      const profile: BanProfile = {
        id: createBanProfileId(),

        name: getUniqueBanProfileName(importedProfile.name, profiles),

        bannedCharacters: importedProfile.bannedCharacters,
      };

      const updatedProfiles = [...profiles, profile];

      updateProfiles(updatedProfiles);

      setSelectedProfileId(profile.id);

      setIsCreating(false);
    } catch (error) {
      if (error instanceof Error && error.message === "invalid-json") {
        setImportError(
          t("selection.components.settings.profilesSettings.invalidJson"),
        );

        return;
      }

      setImportError(
        t("selection.components.settings.profilesSettings.invalidProfile"),
      );
    }
  }

  return (
    <div className="flex h-full min-h-0 gap-5">
      <input
        ref={importInputRef}
        type="file"
        accept=".json,.rumble-profile.json,application/json"
        className="hidden"
        onChange={handleImportProfile}
      />

      <div
        className="
          flex
          w-[240px]
          shrink-0
          flex-col
          rounded-xl
          border
          border-slate-700
          bg-slate-900/60
        "
      >
        <div
          className="
            border-b
            border-slate-700
            p-3
          "
        >
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleStartCreate}
              className="
                flex-1
                cursor-pointer
                rounded-lg
                bg-emerald-600
                px-3
                py-2
                text-sm
                font-bold
                text-white
                transition-colors
                hover:bg-emerald-500
              "
            >
              {t("selection.components.settings.profilesSettings.newProfile")}
            </button>

            <button
              type="button"
              onClick={handleOpenImport}
              title={t("selection.components.settings.profilesSettings.import")}
              className="
                cursor-pointer
                rounded-lg
                border
                border-slate-600
                bg-slate-800
                px-3
                py-2
                text-sm
                font-bold
                text-slate-200
                transition-colors
                hover:border-slate-500
                hover:bg-slate-700
                hover:text-white
              "
            >
              ↓
            </button>
          </div>

          {importError && (
            <p
              className="
                mt-2
                text-xs
                font-medium
                text-red-400
              "
            >
              {importError}
            </p>
          )}
        </div>

        <div
          className="
            min-h-0
            flex-1
            overflow-y-auto
            p-2
          "
        >
          {profiles.length === 0 && !isCreating ? (
            <div
              className="
                px-3
                py-6
                text-center
                text-sm
                text-slate-500
              "
            >
              {t("selection.components.settings.profilesSettings.noProfiles")}
            </div>
          ) : (
            profiles.map((profile) => (
              <button
                key={profile.id}
                type="button"
                onClick={() => {
                  setSelectedProfileId(profile.id);

                  setIsCreating(false);

                  setImportError(null);
                }}
                className={`
                  mb-1
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
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }
                `}
              >
                <span className="truncate font-semibold">{profile.name}</span>

                <span
                  className="
                    ml-2
                    rounded-md
                    bg-slate-800
                    px-1.5
                    py-0.5
                    text-xs
                    text-slate-400
                  "
                >
                  {profile.bannedCharacters.length}
                </span>
              </button>
            ))
          )}
        </div>
      </div>

      <div
        className="
          min-h-0
          flex-1
          overflow-y-auto
          rounded-xl
          border
          border-slate-700
          bg-slate-900/40
          p-5
        "
      >
        {isCreating ? (
          <>
            <div className="mb-5">
              <label
                className="
                  mb-2
                  block
                  text-sm
                  font-bold
                  text-slate-300
                "
              >
                {t(
                  "selection.components.settings.profilesSettings.profileName",
                )}
              </label>

              <input
                type="text"
                value={newProfileName}
                onChange={(event) => setNewProfileName(event.target.value)}
                placeholder={t(
                  "selection.components.settings.profilesSettings.profileNamePlaceholder",
                )}
                className="
                  w-full
                  rounded-lg
                  border
                  border-slate-700
                  bg-slate-950
                  px-3
                  py-2
                  text-white
                  outline-none
                  transition-colors
                  placeholder:text-slate-600
                  focus:border-emerald-500
                "
              />
            </div>

            <CharacterBanList
              characters={characters}
              bannedCharacters={newProfileBans}
              globalBannedCharacters={EMPTY_GLOBAL_BANS}
              onToggle={handleToggleNewProfileBan}
            />

            <div
              className="
                mt-5
                flex
                justify-end
                gap-3
              "
            >
              <button
                type="button"
                onClick={handleCancelCreate}
                className="
                  cursor-pointer
                  rounded-lg
                  border
                  border-slate-600
                  px-4
                  py-2
                  text-sm
                  font-bold
                  text-slate-300
                  hover:bg-slate-800
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
                  rounded-lg
                  bg-emerald-600
                  px-4
                  py-2
                  text-sm
                  font-bold
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
          </>
        ) : selectedProfile ? (
          <>
            <div
              className="
                mb-5
                flex
                items-end
                gap-3
              "
            >
              <div className="flex-1">
                <label
                  className="
                    mb-2
                    block
                    text-sm
                    font-bold
                    text-slate-300
                  "
                >
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
                    rounded-lg
                    border
                    border-slate-700
                    bg-slate-950
                    px-3
                    py-2
                    text-white
                    outline-none
                    transition-colors
                    focus:border-emerald-500
                  "
                />
              </div>

              <button
                type="button"
                onClick={handleExportProfile}
                className="
                  cursor-pointer
                  rounded-lg
                  border
                  border-emerald-500/40
                  bg-emerald-500/10
                  px-4
                  py-2
                  text-sm
                  font-bold
                  text-emerald-400
                  transition-colors
                  hover:bg-emerald-500/20
                "
              >
                {t("selection.components.settings.profilesSettings.export")}
              </button>

              <button
                type="button"
                onClick={handleDeleteProfile}
                className="
                  cursor-pointer
                  rounded-lg
                  border
                  border-red-500/40
                  bg-red-500/10
                  px-4
                  py-2
                  text-sm
                  font-bold
                  text-red-400
                  transition-colors
                  hover:bg-red-500/20
                "
              >
                {t("selection.components.settings.profilesSettings.delete")}
              </button>
            </div>

            <div
              className="
                mb-4
                flex
                items-center
                justify-between
              "
            >
              <span
                className="
                  text-sm
                  text-slate-400
                "
              >
                {selectedProfile.bannedCharacters.length}{" "}
                {t(
                  "selection.components.settings.profilesSettings.bannedCharacters",
                )}
              </span>

              <button
                type="button"
                onClick={handleOpenImport}
                className="
                  cursor-pointer
                  text-sm
                  font-semibold
                  text-slate-400
                  transition-colors
                  hover:text-white
                "
              >
                {t("selection.components.settings.profilesSettings.import")}
              </button>
            </div>

            <CharacterBanList
              characters={characters}
              bannedCharacters={new Set(selectedProfile.bannedCharacters)}
              globalBannedCharacters={EMPTY_GLOBAL_BANS}
              onToggle={handleToggleProfileBan}
            />
          </>
        ) : (
          <div
            className="
              flex
              h-full
              items-center
              justify-center
              text-slate-500
            "
          >
            {t("selection.components.settings.profilesSettings.noProfiles")}
          </div>
        )}
      </div>
    </div>
  );
}
