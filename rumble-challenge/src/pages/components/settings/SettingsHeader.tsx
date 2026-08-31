import { useTranslation } from "react-i18next";

import type { SettingsSection } from "./settings.types";

interface SettingsHeaderProps {
  selectedSection: SettingsSection;

  onClose: () => void;
}

export function SettingsHeader({
  selectedSection,
  onClose,
}: SettingsHeaderProps) {
  const { t } = useTranslation();

  const titles: Record<SettingsSection, string> = {
    bans: t("selection.components.settings.settingsHeader.bans.title"),

    "individual-bans": t(
      "selection.components.settings.settingsHeader.individualBans.title",
    ),

    draws: t("selection.components.settings.settingsHeader.draws.title"),

    "challenge-mode": t(
      "selection.components.settings.settingsHeader.challengeMode.title",
    ),

    logs: t("selection.components.settings.settingsHeader.logs.title"),
  };

  const descriptions: Record<SettingsSection, string> = {
    bans: t("selection.components.settings.settingsHeader.bans.description"),

    "individual-bans": t(
      "selection.components.settings.settingsHeader.individualBans.description",
    ),

    draws: t("selection.components.settings.settingsHeader.draws.description"),

    "challenge-mode": t(
      "selection.components.settings.settingsHeader.challengeMode.description",
    ),

    logs: t("selection.components.settings.settingsHeader.logs.description"),
  };

  return (
    <header className="flex items-center justify-between border-b border-slate-700 px-6 py-4">
      <div>
        <h3 className="text-lg font-bold text-white">
          {titles[selectedSection]}
        </h3>

        <p className="mt-1 text-sm text-slate-400">
          {descriptions[selectedSection]}
        </p>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="
          flex
          h-9
          w-9
          cursor-pointer
          items-center
          justify-center
          rounded-lg
          text-slate-400
          transition-colors
          hover:bg-slate-800
          hover:text-white
        "
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="h-5 w-5"
        >
          <path d="M18 6 6 18" />

          <path d="m6 6 12 12" />
        </svg>
      </button>
    </header>
  );
}
