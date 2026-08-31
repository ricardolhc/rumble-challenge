import { useEffect, useState } from "react";

interface SavedSoundSettings {
  enabled: boolean;
  tickVolume: number;
  resultVolume: number;
}

const SOUND_SETTINGS_STORAGE_KEY = "rumble-challenge-sound-settings";

const DEFAULT_SETTINGS: SavedSoundSettings = {
  enabled: true,
  tickVolume: 0.35,
  resultVolume: 0.6,
};

function clampVolume(value: number) {
  return Math.min(1, Math.max(0, value));
}

function loadSoundSettings(): SavedSoundSettings {
  try {
    const saved = localStorage.getItem(SOUND_SETTINGS_STORAGE_KEY);

    if (!saved) {
      return DEFAULT_SETTINGS;
    }

    const parsed = JSON.parse(saved) as Partial<SavedSoundSettings>;

    return {
      enabled:
        typeof parsed.enabled === "boolean"
          ? parsed.enabled
          : DEFAULT_SETTINGS.enabled,

      tickVolume:
        typeof parsed.tickVolume === "number"
          ? clampVolume(parsed.tickVolume)
          : DEFAULT_SETTINGS.tickVolume,

      resultVolume:
        typeof parsed.resultVolume === "number"
          ? clampVolume(parsed.resultVolume)
          : DEFAULT_SETTINGS.resultVolume,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function useSoundSettings() {
  const [initialSettings] = useState(loadSoundSettings);

  const [soundEnabled, setSoundEnabled] = useState(initialSettings.enabled);

  const [tickVolume, setTickVolumeState] = useState(initialSettings.tickVolume);

  const [resultVolume, setResultVolumeState] = useState(
    initialSettings.resultVolume,
  );

  function setTickVolume(volume: number) {
    setTickVolumeState(clampVolume(volume));
  }

  function setResultVolume(volume: number) {
    setResultVolumeState(clampVolume(volume));
  }

  useEffect(() => {
    const settings: SavedSoundSettings = {
      enabled: soundEnabled,
      tickVolume,
      resultVolume,
    };

    localStorage.setItem(SOUND_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  }, [soundEnabled, tickVolume, resultVolume]);

  return {
    soundEnabled,
    setSoundEnabled,

    tickVolume,
    setTickVolume,

    resultVolume,
    setResultVolume,
  };
}
