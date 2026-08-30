import { useEffect, useMemo, useState } from "react";

import type {
  DrawCount,
  DrawSpeed,
  MemberSlot,
} from "../components/settings/settings.types";
import type { CharacterType } from "../selection.types";
import { getCharacterKey } from "../utils/selection.utils";

interface SavedSettings {
  drawCount: DrawCount;
  drawSpeed: DrawSpeed;
  bannedCharacters: string[];
  individualBans: Record<MemberSlot, string[]>;
}

const SETTINGS_STORAGE_KEY = "rumble-challenge-settings";

function loadSavedSettings(): SavedSettings | null {
  try {
    const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
    return saved ? (JSON.parse(saved) as SavedSettings) : null;
  } catch {
    return null;
  }
}

export function useSelectionSettings() {
  const savedSettings = useMemo(() => loadSavedSettings(), []);

  const [drawCount, setDrawCount] = useState<DrawCount>(
    savedSettings?.drawCount ?? 3,
  );
  const [drawSpeed, setDrawSpeed] = useState<DrawSpeed>(
    savedSettings?.drawSpeed ?? "medium",
  );
  const [bannedCharacters, setBannedCharacters] = useState<Set<string>>(
    () => new Set(savedSettings?.bannedCharacters ?? []),
  );
  const [individualBans, setIndividualBans] = useState<
    Record<MemberSlot, Set<string>>
  >(() => ({
    1: new Set(savedSettings?.individualBans?.[1] ?? []),
    2: new Set(savedSettings?.individualBans?.[2] ?? []),
    3: new Set(savedSettings?.individualBans?.[3] ?? []),
  }));

  function toggleBan(character: CharacterType) {
    const characterKey = getCharacterKey(character);

    setBannedCharacters((current) => {
      const updated = new Set(current);

      if (updated.has(characterKey)) {
        updated.delete(characterKey);
      } else {
        updated.add(characterKey);
      }

      return updated;
    });
  }

  function toggleIndividualBan(member: MemberSlot, character: CharacterType) {
    const characterKey = getCharacterKey(character);

    if (bannedCharacters.has(characterKey)) {
      return;
    }

    setIndividualBans((current) => {
      const updatedMemberBans = new Set(current[member]);

      if (updatedMemberBans.has(characterKey)) {
        updatedMemberBans.delete(characterKey);
      } else {
        updatedMemberBans.add(characterKey);
      }

      return {
        ...current,
        [member]: updatedMemberBans,
      };
    });
  }

  useEffect(() => {
    const settings: SavedSettings = {
      drawCount,
      drawSpeed,
      bannedCharacters: Array.from(bannedCharacters),
      individualBans: {
        1: Array.from(individualBans[1]),
        2: Array.from(individualBans[2]),
        3: Array.from(individualBans[3]),
      },
    };

    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  }, [drawCount, drawSpeed, bannedCharacters, individualBans]);

  return {
    drawCount,
    drawSpeed,
    bannedCharacters,
    individualBans,
    setDrawCount,
    setDrawSpeed,
    toggleBan,
    toggleIndividualBan,
  };
}
