import type { CharacterType } from "../../selection.types";

export type MemberSlot = 1 | 2 | 3;

export type DrawCount = 1 | 2 | 3;

export type DrawSpeed = "fast" | "medium" | "slow" | "instant";

export type SettingsSection =
  | "bans"
  | "individual-bans"
  | "draws"
  | "challenge-mode"
  | "logs";

export interface DrawLog {
  id: string;

  createdAt: string;

  team: CharacterType[];
}
