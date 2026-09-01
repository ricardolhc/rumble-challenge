import type { BanProfile } from "./settings.types";

const BAN_PROFILES_STORAGE_KEY = "rumble-challenge-ban-profiles";

function isBanProfile(value: unknown): value is BanProfile {
  if (!value || typeof value !== "object") {
    return false;
  }

  const profile = value as Partial<BanProfile>;

  return (
    typeof profile.id === "string" &&
    typeof profile.name === "string" &&
    Array.isArray(profile.bannedCharacters) &&
    profile.bannedCharacters.every(
      (characterKey) => typeof characterKey === "string",
    )
  );
}

export function getBanProfiles(): BanProfile[] {
  try {
    const storedProfiles = localStorage.getItem(BAN_PROFILES_STORAGE_KEY);

    if (!storedProfiles) {
      return [];
    }

    const parsedProfiles: unknown = JSON.parse(storedProfiles);

    if (!Array.isArray(parsedProfiles)) {
      return [];
    }

    return parsedProfiles.filter(isBanProfile);
  } catch {
    return [];
  }
}

export function saveBanProfiles(profiles: BanProfile[]) {
  try {
    localStorage.setItem(BAN_PROFILES_STORAGE_KEY, JSON.stringify(profiles));
  } catch {
    // Ignora erros de armazenamento.
  }
}

export function createBanProfileId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
