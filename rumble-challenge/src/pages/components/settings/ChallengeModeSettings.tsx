import { useTranslation } from "react-i18next";

import type { ChallengeBanMode } from "./settings.types";

interface ChallengeModeSettingsProps {
  challengeMode: boolean;
  challengeBanMode: ChallengeBanMode;
  onChallengeModeChange: (enabled: boolean) => void;
  onChallengeBanModeChange: (mode: ChallengeBanMode) => void;
}

export function ChallengeModeSettings({
  challengeMode,
  challengeBanMode,
  onChallengeModeChange,
  onChallengeBanModeChange,
}: ChallengeModeSettingsProps) {
  const { t } = useTranslation();

  return (
    <div className="p-6">
      <div className="max-w-[500px] rounded-2xl border border-slate-700 bg-slate-800/30 p-5">
        <div className="mb-5">
          <h3 className="text-base font-bold text-white">
            {t("selection.components.settings.drawSettings.challengeMode")}
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            {t(
              "selection.components.settings.drawSettings.challengeModeDescription",
            )}
          </p>
        </div>

        <label
          htmlFor="challenge-mode"
          className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-slate-700 bg-[#11151d] p-4 transition-colors hover:border-emerald-500/40"
        >
          <div className="min-w-0">
            <span className="block text-sm font-semibold text-slate-200">
              {t("selection.components.settings.drawSettings.challengeMode")}
            </span>
            <span className="mt-1 block text-xs leading-relaxed text-slate-500">
              {t(
                "selection.components.settings.drawSettings.challengeModeDescription",
              )}
            </span>
          </div>

          <div className="relative shrink-0">
            <input
              id="challenge-mode"
              type="checkbox"
              checked={challengeMode}
              onChange={(event) => onChallengeModeChange(event.target.checked)}
              className="peer sr-only"
            />
            <div className="h-6 w-11 rounded-full bg-slate-700 transition-colors duration-200 peer-checked:bg-emerald-500" />
            <div className="pointer-events-none absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 peer-checked:translate-x-5" />
          </div>
        </label>

        <div className="mt-5">
          <label
            htmlFor="challenge-ban-mode"
            className="mb-2 block text-sm font-semibold text-slate-200"
          >
            {t("selection.components.settings.challengeMode.banMode")}
          </label>

          <p className="mb-3 text-xs leading-relaxed text-slate-500">
            {t(
              "selection.components.settings.challengeMode.banModeDescription",
            )}
          </p>

          <div className="relative">
            <select
              id="challenge-ban-mode"
              value={challengeBanMode}
              onChange={(event) =>
                onChallengeBanModeChange(event.target.value as ChallengeBanMode)
              }
              className="w-full cursor-pointer appearance-none rounded-xl border border-slate-700 bg-[#11151d] px-4 py-3 pr-10 text-sm font-semibold text-slate-200 outline-none transition-colors hover:border-slate-600 focus:border-emerald-500/60"
            >
              <option value="global">
                {t("selection.components.settings.challengeMode.globalBan")}
              </option>
              <option value="individual">
                {t("selection.components.settings.challengeMode.individualBan")}
              </option>
            </select>

            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </div>

          <div className="mt-3 rounded-lg border border-slate-700 bg-slate-900/40 px-3 py-2">
            <p className="text-xs leading-relaxed text-slate-500">
              {challengeBanMode === "global"
                ? t(
                    "selection.components.settings.challengeMode.globalBanDescription",
                  )
                : t(
                    "selection.components.settings.challengeMode.individualBanDescription",
                  )}
            </p>
          </div>
        </div>

        <div
          className={`mt-5 rounded-xl border p-4 transition-colors ${
            challengeMode
              ? "border-amber-500/30 bg-amber-500/5"
              : "border-slate-700 bg-[#11151d]"
          }`}
        >
          <div className="flex items-start gap-3">
            {challengeMode ? (
              <ActiveChallengeIcon />
            ) : (
              <InactiveChallengeIcon />
            )}
            <div>
              <p
                className={`text-sm font-semibold ${
                  challengeMode ? "text-amber-400" : "text-slate-400"
                }`}
              >
                {challengeMode
                  ? t("selection.components.settings.challengeMode.active")
                  : t("selection.components.settings.challengeMode.inactive")}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                {challengeMode
                  ? t(
                      "selection.components.settings.challengeMode.activeDescription",
                    )
                  : t(
                      "selection.components.settings.challengeMode.inactiveDescription",
                    )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ActiveChallengeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5 shrink-0 text-amber-400"
    >
      <path d="M12 2 4 5v6c0 5 3.4 9.7 8 11 4.6-1.3 8-6 8-11V5l-8-3Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function InactiveChallengeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5 shrink-0 text-slate-500"
    >
      <path d="M12 2 4 5v6c0 5 3.4 9.7 8 11 4.6-1.3 8-6 8-11V5l-8-3Z" />
    </svg>
  );
}
