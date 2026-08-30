import { useMemo, useState } from "react";

import type {
  DrawCount,
  DrawSpeed,
  MemberSlot,
} from "../components/settings/settings.types";
import type { CharacterType, CharacterWithIndex } from "../selection.types";
import { findValidTeam, getMemberSlots } from "../utils/selection.utils";

interface UseCharacterDrawParams {
  characters: CharacterType[];
  drawCount: DrawCount;
  drawSpeed: DrawSpeed;
  bannedCharacters: Set<string>;
  individualBans: Record<MemberSlot, Set<string>>;
}

const DRAW_SPEED_CONFIG: Record<
  DrawSpeed,
  { base: number; increment: number }
> = {
  fast: { base: 80, increment: 35 },
  medium: { base: 160, increment: 70 },
  slow: { base: 280, increment: 110 },
};

const TOTAL_DRAWS = 10;
const RESULT_DELAY = 500;

function sleep(delay: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, delay));
}

export function useCharacterDraw({
  characters,
  drawCount,
  drawSpeed,
  bannedCharacters,
  individualBans,
}: UseCharacterDrawParams) {
  const [highlightedIndexes, setHighlightedIndexes] = useState<number[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<CharacterType[] | null>(null);

  const charactersWithIndex = useMemo<CharacterWithIndex[]>(
    () => characters.map((character, index) => ({ character, index })),
    [characters],
  );

  const memberSlots = useMemo(() => getMemberSlots(drawCount), [drawCount]);

  const hasAvailableTeam = useMemo(
    () =>
      findValidTeam({
        characters: charactersWithIndex,
        members: memberSlots,
        bannedCharacters,
        individualBans,
      }) !== null,
    [charactersWithIndex, memberSlots, bannedCharacters, individualBans],
  );

  function createTeam(randomize = true) {
    return findValidTeam({
      characters: charactersWithIndex,
      members: memberSlots,
      bannedCharacters,
      individualBans,
      randomize,
    });
  }

  async function selectCharacters() {
    if (isSelecting || !hasAvailableTeam) {
      return;
    }

    const initialTeam = createTeam();

    if (!initialTeam) {
      return;
    }

    setIsSelecting(true);
    setSelectedTeam(null);

    let finalTeam = initialTeam;
    const { base, increment } = DRAW_SPEED_CONFIG[drawSpeed];

    for (let index = 0; index < TOTAL_DRAWS; index++) {
      const randomTeam = createTeam();

      if (!randomTeam) {
        break;
      }

      finalTeam = randomTeam;
      setHighlightedIndexes(randomTeam.map((member) => member.index));

      const delay = base + index * increment;
      await sleep(delay);

      if (index === TOTAL_DRAWS - 2) {
        await sleep(delay);
      }
    }

    await sleep(RESULT_DELAY);

    setSelectedTeam(finalTeam.map(({ character }) => character));
    setIsSelecting(false);
    setHighlightedIndexes([]);
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
