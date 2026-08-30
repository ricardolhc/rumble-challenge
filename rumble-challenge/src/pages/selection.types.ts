export interface CharacterType {
  name: string;
  image: string;
  type: string;
  symbol: string;
  background: string;
  imageWidth: number;
  imageHeight: number;
  imageWidthTeam: number;
  imageHeightTeam: number;
}

export interface CharacterWithIndex {
  character: CharacterType;
  index: number;
}
