import { useCallback, useEffect, useMemo, useState } from "react";

import type { CharacterType } from "../selection.types";

import type {
  ChallengeBanMode,
  DrawCount,
  DrawSpeed,
  MemberSlot,
} from "../components/settings/settings.types";

import { getCharacterKey } from "../utils/selection.utils";

interface SavedSettings {
  drawCount: DrawCount;
  drawSpeed: DrawSpeed;
  bannedCharacters: string[];
  individualBans: Record<MemberSlot, string[]>;
  challengeMode: boolean;
  challengeBanMode: ChallengeBanMode;
}

const SETTINGS_STORAGE_KEY = "rumble-challenge-settings";

function loadSavedSettings(): SavedSettings | null {
  try {
    const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);

    if (!saved) {
      return null;
    }

    return JSON.parse(saved) as SavedSettings;
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

  const [challengeMode, setChallengeMode] = useState<boolean>(
    savedSettings?.challengeMode ?? false,
  );

  const [challengeBanMode, setChallengeBanMode] = useState<ChallengeBanMode>(
    savedSettings?.challengeBanMode ?? "global",
  );

  const handleToggleBan = useCallback((character: CharacterType) => {
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
  }, []);

  const handleToggleIndividualBan = useCallback(
    (member: MemberSlot, character: CharacterType) => {
      const characterKey = getCharacterKey(character);

      /*
       * O personagem já está indisponível em todas as posições
       * caso esteja banido globalmente.
       */
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
    },
    [bannedCharacters],
  );

  /**
   * Substitui completamente os banimentos individuais
   * de um membro.
   *
   * Utilizado ao aplicar um perfil.
   *
   * Exemplo:
   *
   * membro atual:
   * [A, B, C]
   *
   * perfil:
   * [D, E]
   *
   * resultado:
   * [D, E]
   */
  const replaceIndividualBans = useCallback(
    (member: MemberSlot, characterKeys: Set<string>) => {
      setIndividualBans((current) => ({
        ...current,
        [member]: new Set(characterKeys),
      }));
    },
    [],
  );

  /**
   * Adiciona todos os personagens ao banimento global.
   *
   * Utilizado pelo modo desafio quando:
   * challengeBanMode === "global"
   */
  const banCharacters = useCallback((characters: CharacterType[]) => {
    if (characters.length === 0) {
      return;
    }

    setBannedCharacters((current) => {
      const updated = new Set(current);

      for (const character of characters) {
        updated.add(getCharacterKey(character));
      }

      return updated;
    });
  }, []);

  /**
   * Bane cada personagem somente na posição
   * em que foi sorteado.
   *
   * Exemplo:
   *
   * team[0] -> individualBans[1]
   * team[1] -> individualBans[2]
   * team[2] -> individualBans[3]
   *
   * Utilizado pelo modo desafio quando:
   * challengeBanMode === "individual"
   */
  const banIndividualCharacters = useCallback(
    (characters: CharacterType[]) => {
      if (characters.length === 0) {
        return;
      }

      setIndividualBans((current) => {
        const updated: Record<MemberSlot, Set<string>> = {
          1: new Set(current[1]),
          2: new Set(current[2]),
          3: new Set(current[3]),
        };

        characters.forEach((character, index) => {
          const member = (index + 1) as MemberSlot;

          if (member < 1 || member > 3) {
            return;
          }

          const characterKey = getCharacterKey(character);

          /*
           * Se o personagem já estiver banido globalmente,
           * não precisamos duplicar o ban individualmente.
           */
          if (bannedCharacters.has(characterKey)) {
            return;
          }

          /*
           * Aqui usamos add() ao invés de toggle.
           *
           * O modo desafio sempre deve adicionar o ban.
           * Caso utilizássemos toggle, um personagem já
           * banido poderia acabar sendo desbanido.
           */
          updated[member].add(characterKey);
        });

        return updated;
      });
    },
    [bannedCharacters],
  );

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

      challengeMode,
      challengeBanMode,
    };

    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  }, [
    drawCount,
    drawSpeed,
    bannedCharacters,
    individualBans,
    challengeMode,
    challengeBanMode,
  ]);

  return {
    drawCount,
    setDrawCount,

    drawSpeed,
    setDrawSpeed,

    bannedCharacters,

    individualBans,

    handleToggleBan,
    handleToggleIndividualBan,

    replaceIndividualBans,

    challengeMode,
    setChallengeMode,

    challengeBanMode,
    setChallengeBanMode,

    banCharacters,
    banIndividualCharacters,
  };
}
