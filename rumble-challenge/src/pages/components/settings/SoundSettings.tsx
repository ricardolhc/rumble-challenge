import { useRef } from "react";

import { useTranslation } from "react-i18next";

interface SoundSettingsProps {
  soundEnabled: boolean;
  tickVolume: number;
  resultVolume: number;

  onSoundEnabledChange: (enabled: boolean) => void;
  onTickVolumeChange: (volume: number) => void;
  onResultVolumeChange: (volume: number) => void;
}

export function SoundSettings({
  soundEnabled,
  tickVolume,
  resultVolume,
  onSoundEnabledChange,
  onTickVolumeChange,
  onResultVolumeChange,
}: SoundSettingsProps) {
  const { t } = useTranslation();

  const tickAudioRef = useRef<HTMLAudioElement | null>(null);
  const resultAudioRef = useRef<HTMLAudioElement | null>(null);

  function playSound(type: "tick" | "result", volume: number) {
    const ref = type === "tick" ? tickAudioRef : resultAudioRef;

    const file = type === "tick" ? "sounds/tick.wav" : "sounds/result.wav";

    let audio = ref.current;

    if (!audio) {
      audio = new Audio(`${import.meta.env.BASE_URL}${file}`);

      audio.preload = "auto";

      ref.current = audio;
    }

    audio.pause();
    audio.currentTime = 0;
    audio.volume = volume;

    void audio.play().catch(() => {
      // Ignora falhas de reprodução do navegador.
    });
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="mx-auto flex max-w-2xl flex-col gap-6">
        <div className="rounded-xl border border-slate-700 bg-slate-800/40 p-5">
          <div className="flex items-center justify-between gap-6">
            <div>
              <h4 className="font-semibold text-white">
                {t("selection.components.settings.sound.enabled")}
              </h4>

              <p className="mt-1 text-sm text-slate-400">
                {t("selection.components.settings.sound.enabledDescription")}
              </p>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={soundEnabled}
              onClick={() => onSoundEnabledChange(!soundEnabled)}
              className={`
                relative
                h-7
                w-12
                shrink-0
                cursor-pointer
                rounded-full
                transition-colors
                duration-200
                ${soundEnabled ? "bg-emerald-500" : "bg-slate-700"}
              `}
            >
              <span
                className={`
                  absolute
                  top-1
                  h-5
                  w-5
                  rounded-full
                  bg-white
                  shadow
                  transition-all
                  duration-200
                  ${soundEnabled ? "left-6" : "left-1"}
                `}
              />
            </button>
          </div>
        </div>

        <SoundVolumeControl
          title={t("selection.components.settings.sound.tickVolume")}
          description={t(
            "selection.components.settings.sound.tickVolumeDescription",
          )}
          volume={tickVolume}
          disabled={!soundEnabled}
          onVolumeChange={onTickVolumeChange}
          onPlay={() => playSound("tick", tickVolume)}
        />

        <SoundVolumeControl
          title={t("selection.components.settings.sound.resultVolume")}
          description={t(
            "selection.components.settings.sound.resultVolumeDescription",
          )}
          volume={resultVolume}
          disabled={!soundEnabled}
          onVolumeChange={onResultVolumeChange}
          onPlay={() => playSound("result", resultVolume)}
        />
      </div>
    </div>
  );
}

interface SoundVolumeControlProps {
  title: string;
  description: string;
  volume: number;
  disabled: boolean;

  onVolumeChange: (volume: number) => void;
  onPlay: () => void;
}

function SoundVolumeControl({
  title,
  description,
  volume,
  disabled,
  onVolumeChange,
  onPlay,
}: SoundVolumeControlProps) {
  const percentage = Math.round(volume * 100);

  return (
    <div
      className={`
        rounded-xl
        border
        border-slate-700
        bg-slate-800/40
        p-5
        transition-opacity
        ${disabled ? "opacity-50" : "opacity-100"}
      `}
    >
      <div className="mb-4">
        <h4 className="font-semibold text-white">{title}</h4>

        <p className="mt-1 text-sm text-slate-400">{description}</p>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          disabled={disabled}
          onClick={onPlay}
          aria-label={`Testar ${title}`}
          className="
            flex
            h-10
            w-10
            shrink-0
            cursor-pointer
            items-center
            justify-center
            rounded-lg
            border
            border-emerald-500/30
            bg-emerald-500/10
            text-emerald-400
            transition-all
            hover:border-emerald-400/50
            hover:bg-emerald-500/20
            hover:text-emerald-300
            active:scale-95
            disabled:cursor-not-allowed
            disabled:opacity-40
          "
        >
          <PlayIcon />
        </button>

        <input
          type="range"
          min={0}
          max={100}
          step={1}
          disabled={disabled}
          value={percentage}
          onChange={(event) => onVolumeChange(Number(event.target.value) / 100)}
          className="
            h-2
            flex-1
            cursor-pointer
            accent-emerald-500
            disabled:cursor-not-allowed
          "
        />

        <span className="w-12 text-right text-sm font-bold tabular-nums text-slate-300">
          {percentage}%
        </span>
      </div>
    </div>
  );
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M8 5v14l11-7-11-7Z" />
    </svg>
  );
}
