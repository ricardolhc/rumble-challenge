import type { CharacterType } from "../../selection.types";
import type { DrawLog } from "../settings/settings.types";

const DRAW_LOGS_STORAGE_KEY = "rumble-challenge-draw-logs";

const MAX_DRAW_LOGS = 5;

export function getDrawLogs(): DrawLog[] {
  try {
    const storedLogs = sessionStorage.getItem(DRAW_LOGS_STORAGE_KEY);

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
    sessionStorage.setItem(DRAW_LOGS_STORAGE_KEY, JSON.stringify(updatedLogs));
  } catch {
    // Se o sessionStorage não estiver disponível,
    // ainda retornamos os logs atualizados para a UI.
  }

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
