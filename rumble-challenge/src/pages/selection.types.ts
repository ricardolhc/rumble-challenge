export interface CharacterType {
  id: string;
  name: string;
  image: string;
  type: string;
  symbol: string;
  background: string;
  imageWidth: number;
  imageHeight: number;
  imageWidthTeam: number;
  imageHeightTeam: number;
  description: string;
  isNew?: boolean;
}

export interface CharacterWithIndex {
  character: CharacterType;
  index: number;
}
