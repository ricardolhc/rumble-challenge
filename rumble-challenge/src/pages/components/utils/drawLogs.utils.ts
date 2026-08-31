import type { CharacterType } from "../../selection.types";
import type { DrawLog } from "../settings/settings.types";

const DRAW_LOGS_STORAGE_KEY = "rumble-challenge-draw-logs";

const MAX_DRAW_LOGS = 10;

export function getDrawLogs(): DrawLog[] {
  try {
    const storedLogs = localStorage.getItem(DRAW_LOGS_STORAGE_KEY);

    if (!storedLogs) {
      return [];
    }

    const parsedLogs = JSON.parse(storedLogs) as unknown;

    if (!Array.isArray(parsedLogs)) {
      return [];
    }

    return parsedLogs.slice(0, MAX_DRAW_LOGS) as DrawLog[];
  } catch {
    return [];
  }
}

export function addDrawLog(team: CharacterType[]): DrawLog[] {
  const currentLogs = getDrawLogs();

  const newLog: DrawLog = {
    id: createDrawLogId(),
    createdAt: new Date().toISOString(),
    team,
  };

  const updatedLogs = [newLog, ...currentLogs].slice(0, MAX_DRAW_LOGS);

  try {
    localStorage.setItem(DRAW_LOGS_STORAGE_KEY, JSON.stringify(updatedLogs));
  } catch {}

  return updatedLogs;
}

function createDrawLogId() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
