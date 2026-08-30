import type { MemberSlot } from "../components/settings/settings.types";
import type { CharacterType, CharacterWithIndex } from "../selection.types";

interface FindValidTeamParams {
  characters: CharacterWithIndex[];
  members: MemberSlot[];
  bannedCharacters: Set<string>;
  individualBans: Record<MemberSlot, Set<string>>;
  randomize?: boolean;
}

export function getCharacterKey(character: CharacterType) {
  return `${character.name}::${character.type}`;
}

export function shuffle<T>(items: readonly T[]) {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index--) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [
      shuffled[randomIndex],
      shuffled[index],
    ];
  }

  return shuffled;
}

export function getMemberSlots(drawCount: number): MemberSlot[] {
  return Array.from(
    { length: drawCount },
    (_, index) => (index + 1) as MemberSlot,
  );
}

export function findValidTeam({
  characters,
  members,
  bannedCharacters,
  individualBans,
  randomize = false,
}: FindValidTeamParams): CharacterWithIndex[] | null {
  const candidatesByMember = members.map((member) => {
    const candidates = characters.filter(({ character }) => {
      const characterKey = getCharacterKey(character);

      return (
        !bannedCharacters.has(characterKey) &&
        !individualBans[member].has(characterKey)
      );
    });

    return randomize ? shuffle(candidates) : candidates;
  });

  const selected: CharacterWithIndex[] = [];
  const usedIndexes = new Set<number>();
  const usedNames = new Set<string>();

  function selectMember(position: number): boolean {
    if (position === members.length) {
      return true;
    }

    for (const candidate of candidatesByMember[position]) {
      if (
        usedIndexes.has(candidate.index) ||
        usedNames.has(candidate.character.name)
      ) {
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

  return selectMember(0) ? selected : null;
}
