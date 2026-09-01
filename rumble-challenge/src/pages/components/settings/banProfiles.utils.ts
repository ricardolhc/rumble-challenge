import type { BanProfile } from "./settings.types";

const BAN_PROFILES_STORAGE_KEY = "rumble-challenge-ban-profiles";

const BAN_PROFILE_EXPORT_VERSION = 1;

interface ExportedBanProfile {
  version: number;
  name: string;
  bannedCharacters: string[];
}

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

function isExportedBanProfile(value: unknown): value is ExportedBanProfile {
  if (!value || typeof value !== "object") {
    return false;
  }

  const profile = value as Partial<ExportedBanProfile>;

  return (
    profile.version === BAN_PROFILE_EXPORT_VERSION &&
    typeof profile.name === "string" &&
    profile.name.trim().length > 0 &&
    Array.isArray(profile.bannedCharacters) &&
    profile.bannedCharacters.every(
      (characterKey) =>
        typeof characterKey === "string" && characterKey.trim().length > 0,
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

/**
 * Retorna um nome único para um perfil.
 *
 * Exemplos:
 *
 * Ricardo
 * Ricardo (2)
 * Ricardo (3)
 */
export function getUniqueBanProfileName(
  requestedName: string,
  profiles: BanProfile[],
): string {
  const trimmedName = requestedName.trim();

  const existingNames = new Set(
    profiles.map((profile) => profile.name.trim().toLocaleLowerCase()),
  );

  if (!existingNames.has(trimmedName.toLocaleLowerCase())) {
    return trimmedName;
  }

  let suffix = 2;

  while (existingNames.has(`${trimmedName} (${suffix})`.toLocaleLowerCase())) {
    suffix += 1;
  }

  return `${trimmedName} (${suffix})`;
}

/**
 * Converte um perfil interno para o formato de exportação.
 *
 * O ID não é exportado propositalmente.
 */
export function serializeBanProfile(profile: BanProfile): string {
  const exportedProfile: ExportedBanProfile = {
    version: BAN_PROFILE_EXPORT_VERSION,
    name: profile.name,
    bannedCharacters: Array.from(new Set(profile.bannedCharacters)),
  };

  return JSON.stringify(exportedProfile, null, 2);
}

/**
 * Lê e valida o JSON importado.
 */
export function parseBanProfile(content: string): Omit<BanProfile, "id"> {
  let parsed: unknown;

  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error("invalid-json");
  }

  if (!isExportedBanProfile(parsed)) {
    throw new Error("invalid-profile");
  }

  return {
    name: parsed.name.trim(),
    bannedCharacters: Array.from(new Set(parsed.bannedCharacters)),
  };
}

/**
 * Faz o download do perfil como JSON.
 */
export function exportBanProfile(profile: BanProfile) {
  const content = serializeBanProfile(profile);

  const blob = new Blob([content], {
    type: "application/json;charset=utf-8",
  });

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");

  link.href = url;
  link.download = `${createProfileFilename(profile.name)}.rumble-profile.json`;

  document.body.appendChild(link);

  link.click();

  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

function createProfileFilename(name: string): string {
  const normalized = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9-_ ]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .toLowerCase();

  return normalized || "perfil";
}
