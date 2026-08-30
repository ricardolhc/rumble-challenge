import { useMemo, useRef, useState } from "react";
import type { CharacterType } from "../selection.types";
import type {
  DrawCount,
  DrawSpeed,
  MemberSlot,
} from "../components/settings/settings.types";
import { getCharacterKey } from "../utils/selection.utils";

interface CharacterWithIndex {
  character: CharacterType;
  index: number;
}

interface UseCharacterDrawParams {
  characters: CharacterType[];
  drawCount: DrawCount;
  drawSpeed: DrawSpeed;
  bannedCharacters: Set<string>;
  individualBans: Record<MemberSlot, Set<string>>;
  onTeamDrawn?: (team: CharacterType[]) => void;
}

const DRAW_SPEED_CONFIG: Record<
  DrawSpeed,
  {
    base: number;
    increment: number;
  }
> = {
  fast: {
    base: 80,
    increment: 35,
  },

  medium: {
    base: 160,
    increment: 70,
  },

  slow: {
    base: 280,
    increment: 110,
  },
};

function shuffle<T>(items: T[]) {
  const shuffled = [...items];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const randomIndex = Math.floor(Math.random() * (i + 1));

    [shuffled[i], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[i]];
  }

  return shuffled;
}

export function useCharacterDraw({
  characters,
  drawCount,
  drawSpeed,
  bannedCharacters,
  individualBans,
  onTeamDrawn,
}: UseCharacterDrawParams) {
  const [highlightedIndexes, setHighlightedIndexes] = useState<number[]>([]);

  const [isSelecting, setIsSelecting] = useState(false);

  const [selectedTeam, setSelectedTeam] = useState<CharacterType[] | null>(
    null,
  );

  const isSelectingRef = useRef(false);

  const charactersWithIndex = useMemo<CharacterWithIndex[]>(
    () =>
      characters.map((character, index) => ({
        character,
        index,
      })),
    [characters],
  );

  function getMemberSlots(): MemberSlot[] {
    return Array.from(
      {
        length: drawCount,
      },
      (_, index) => (index + 1) as MemberSlot,
    );
  }

  function isCharacterAvailableForMember(
    character: CharacterType,
    member: MemberSlot,
  ) {
    const characterKey = getCharacterKey(character);

    if (bannedCharacters.has(characterKey)) {
      return false;
    }

    if (individualBans[member].has(characterKey)) {
      return false;
    }

    return true;
  }

  function findValidTeam(randomize: boolean): CharacterWithIndex[] | null {
    const members = getMemberSlots();

    const candidatesByMember = members.map((member) => {
      const candidates = charactersWithIndex.filter(({ character }) =>
        isCharacterAvailableForMember(character, member),
      );

      return randomize ? shuffle(candidates) : candidates;
    });

    const selected: CharacterWithIndex[] = [];

    const usedIndexes = new Set<number>();
    const usedNames = new Set<string>();

    function selectMember(position: number): boolean {
      if (position === members.length) {
        return true;
      }

      const candidates = candidatesByMember[position];

      for (const candidate of candidates) {
        if (usedIndexes.has(candidate.index)) {
          continue;
        }

        if (usedNames.has(candidate.character.name)) {
          continue;
        }

        selected.push(candidate);

        usedIndexes.add(candidate.index);
        usedNames.add(candidate.character.name);

        if (selectMember(position + 1)) {
          return true;
        }

        selected.pop();

        usedIndexes.delete(candidate.index);
        usedNames.delete(candidate.character.name);
      }

      return false;
    }

    if (!selectMember(0)) {
      return null;
    }

    return selected;
  }

  const hasAvailableTeam = useMemo(() => {
    if (characters.length === 0) {
      return false;
    }

    const members = Array.from(
      {
        length: drawCount,
      },
      (_, index) => (index + 1) as MemberSlot,
    );

    const candidatesByMember = members.map((member) =>
      charactersWithIndex.filter(({ character }) => {
        const characterKey = getCharacterKey(character);

        if (bannedCharacters.has(characterKey)) {
          return false;
        }

        if (individualBans[member].has(characterKey)) {
          return false;
        }

        return true;
      }),
    );

    const usedIndexes = new Set<number>();
    const usedNames = new Set<string>();

    function hasCombination(position: number): boolean {
      if (position === members.length) {
        return true;
      }

      for (const candidate of candidatesByMember[position]) {
        if (usedIndexes.has(candidate.index)) {
          continue;
        }

        if (usedNames.has(candidate.character.name)) {
          continue;
        }

        usedIndexes.add(candidate.index);
        usedNames.add(candidate.character.name);

        if (hasCombination(position + 1)) {
          return true;
        }

        usedIndexes.delete(candidate.index);
        usedNames.delete(candidate.character.name);
      }

      return false;
    }

    return hasCombination(0);
  }, [
    characters,
    charactersWithIndex,
    drawCount,
    bannedCharacters,
    individualBans,
  ]);

  async function selectCharacters() {
    if (isSelectingRef.current || !hasAvailableTeam) {
      return;
    }

    const initialTeam = findValidTeam(true);

    if (!initialTeam) {
      return;
    }

    isSelectingRef.current = true;

    setIsSelecting(true);
    setSelectedTeam(null);

    try {
      const totalDraws = 10;

      let finalTeam = initialTeam;

      for (let i = 0; i < totalDraws; i++) {
        const randomTeam = findValidTeam(true);

        if (!randomTeam) {
          break;
        }

        finalTeam = randomTeam;

        setHighlightedIndexes(randomTeam.map(({ index }) => index));

        const { base, increment } = DRAW_SPEED_CONFIG[drawSpeed];

        const delay = base + i * increment;

        await new Promise<void>((resolve) => {
          window.setTimeout(resolve, delay);
        });

        if (i === totalDraws - 2) {
          await new Promise<void>((resolve) => {
            window.setTimeout(resolve, delay);
          });
        }
      }

      const team = finalTeam.map(({ character }) => character);

      await new Promise<void>((resolve) => {
        window.setTimeout(resolve, 500);
      });

      onTeamDrawn?.(team);

      setSelectedTeam(team);
      setHighlightedIndexes([]);
    } finally {
      isSelectingRef.current = false;

      setIsSelecting(false);
    }
  }

  function closeTeam() {
    setSelectedTeam(null);
  }

  return {
    highlightedIndexes,
    isSelecting,
    selectedTeam,
    hasAvailableTeam,
    selectCharacters,
    closeTeam,
  };
}
