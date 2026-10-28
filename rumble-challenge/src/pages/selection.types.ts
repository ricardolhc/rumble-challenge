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

export interface RouletteBall {
  member: 1 | 2 | 3;
  targetIndex: number;
  startAngle: number;
  endAngle: number;
  dropTime: number;
  /** Time at which the ball is captured; it then follows the moving wheel. */
  duration: number;
}

export interface RouletteAnimation {
  id: string;
  entries: number[];
  wheelRotation: number;
  wheelDuration: number;
  balls: RouletteBall[];
}

export interface RouletteFrame {
  indexes: number[];
  settledCount: number;
  elapsed: number;
  delay: number;
  animation: RouletteAnimation;
}
