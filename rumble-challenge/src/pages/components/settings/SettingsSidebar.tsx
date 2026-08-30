import type { DrawCount, SettingsSection } from "./settings.types";
import { useTranslation } from "react-i18next";

interface SettingsSidebarProps {
  selectedSection: SettingsSection;
  onSectionChange: (section: SettingsSection) => void;
  globalBansCount: number;
  individualBansCount: number;
  drawCount: DrawCount;
}

export function SettingsSidebar({
  selectedSection,
  onSectionChange,
  globalBansCount,
  individualBansCount,
  drawCount,
}: SettingsSidebarProps) {
  const { t } = useTranslation();

  const itemClass = (section: SettingsSection) =>
    `flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${
      selectedSection === section
        ? "bg-emerald-500/10 text-emerald-400"
        : "text-slate-400 hover:bg-slate-800 hover:text-white"
    }`;

  return (
    <aside className="flex w-[250px] shrink-0 flex-col border-r border-slate-700 bg-[#11151d] p-4">
      <div className="mb-5">
        <h2 className="text-lg font-bold text-white">
          {t("selection.components.settings.settingsSidebar.configuration")}
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          {t(
            "selection.components.settings.settingsSidebar.configurationDescription",
          )}
          .
        </p>
      </div>

      <nav className="flex flex-col gap-2">
        <button
          type="button"
          onClick={() => onSectionChange("bans")}
          className={itemClass("bans")}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-4 w-4"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="m6 6 12 12" />
          </svg>
          {t("selection.components.settings.settingsSidebar.bans")}
          {globalBansCount > 0 && (
            <span className="ml-auto rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] font-bold text-red-400">
              {globalBansCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => onSectionChange("individual-bans")}
          className={itemClass("individual-bans")}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-4 w-4"
          >
            <circle cx="9" cy="7" r="4" />
            <path d="M3 21v-2a6 6 0 0 1 12 0v2" />
            <path d="M19 8v6" />
            <path d="M16 11h6" />
          </svg>
          {t("selection.components.settings.settingsSidebar.individualBans")}
          {individualBansCount > 0 && (
            <span className="ml-auto rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] font-bold text-red-400">
              {individualBansCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => onSectionChange("draws")}
          className={itemClass("draws")}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
          >
            <path d="M3 3h18v18H3z" />
            <path d="m8 8 .01 0" />
            <path d="m16 8 .01 0" />
            <path d="m8 16 .01 0" />
            <path d="m16 16 .01 0" />
            <path d="m12 12 .01 0" />
          </svg>
          {t("selection.components.settings.settingsSidebar.draws")}
          <span className="ml-auto rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
            {drawCount}
          </span>
        </button>
      </nav>
    </aside>
  );
}
