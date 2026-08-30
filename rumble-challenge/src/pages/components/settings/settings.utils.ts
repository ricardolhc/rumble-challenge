import type { CharacterType } from "../../SelectionPage";

export function getCharacterKey(character: CharacterType) {
  return `${character.name}::${character.type}`;
}
