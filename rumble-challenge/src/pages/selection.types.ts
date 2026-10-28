export interface CharacterType {
  id: string;
  name: string;
  image: string;
  type: string;
  symbol?: string;
  background?: string;
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

export interface SlotMachineFrame {
  indexes: number[];
  previousIndexes?: number[];
  lockedCount: number;
  step: number;
  delay: number;
  elapsed?: number;
  animation?: SlotMachineAnimation;
}

export interface SlotMachineReel {
  indexes: number[];
  times: number[];
  duration: number;
  beforeIndex?: number;
  afterIndex?: number;
}

export interface SlotMachineAnimation {
  id: string;
  reels: SlotMachineReel[];
}
