import type { CharacterType } from "../../selection.types";

export type MemberSlot = 1 | 2 | 3;
export type DrawCount = 1 | 2 | 3;
export type DrawSpeed = "fast" | "medium" | "slow" | "instant" | "super-slow";
export type ChallengeBanMode = "global" | "individual";

export type SettingsSection =
  | "bans"
  | "individual-bans"
  | "profiles"
  | "draws"
  | "challenge-mode"
  | "sound"
  | "logs";

export interface DrawLog {
  id: string;
  createdAt: string;
  team: CharacterType[];
}

export interface BanProfile {
  id: string;
  name: string;
  bannedCharacters: string[];
}
