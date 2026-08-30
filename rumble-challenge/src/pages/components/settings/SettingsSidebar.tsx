import { useTranslation } from "react-i18next";

import type { DrawCount, SettingsSection } from "./settings.types";

interface SettingsSidebarProps {
  selectedSection: SettingsSection;
  onSectionChange: (section: SettingsSection) => void;
  globalBansCount: number;
  individualBansCount: number;
  drawCount: DrawCount;
}

const REPOSITORY_URL = "https://github.com/ricardolhc/rumble-challenge";
const ISSUES_URL = `${REPOSITORY_URL}/issues`;

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

  const externalItemClass =
    "group flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-500 transition-colors hover:bg-slate-800 hover:text-white";

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

      <div className="mt-auto border-t border-slate-800 pt-4">
        <div className="mb-2 flex items-center gap-2 px-3 text-[10px] font-bold uppercase tracking-widest text-slate-600">
          <BranchIcon />

          <span>
            {t("selection.components.settings.settingsSidebar.development")}
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <a
            href={REPOSITORY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={externalItemClass}
          >
            <GitHubIcon />

            <span>
              {t("selection.components.settings.settingsSidebar.repository")}
            </span>

            <ExternalLinkIcon />
          </a>

          <a
            href={ISSUES_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={externalItemClass}
          >
            <IssueIcon />

            <span>
              {t("selection.components.settings.settingsSidebar.issues")}
            </span>

            <ExternalLinkIcon />
          </a>
        </div>
      </div>
    </aside>
  );
}

function BranchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <line x1="6" y1="3" x2="6" y2="15" />
      <circle cx="18" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <path d="M18 9a9 9 0 0 1-9 9" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 shrink-0">
      <path d="M12 .7C5.73.7.65 5.78.65 12.05c0 5.01 3.25 9.26 7.76 10.76.57.1.77-.25.77-.55v-2.17c-3.16.69-3.83-1.34-3.83-1.34-.51-1.31-1.26-1.66-1.26-1.66-1.03-.7.08-.69.08-.69 1.14.08 1.74 1.17 1.74 1.17 1.01 1.74 2.66 1.24 3.31.95.1-.73.4-1.24.72-1.52-2.52-.29-5.17-1.26-5.17-5.61 0-1.24.44-2.25 1.17-3.05-.12-.29-.51-1.44.11-3 0 0 .95-.3 3.12 1.16a10.9 10.9 0 0 1 5.68 0c2.17-1.47 3.12-1.16 3.12-1.16.62 1.56.23 2.71.11 3 .73.8 1.17 1.81 1.17 3.05 0 4.36-2.65 5.32-5.18 5.6.41.35.77 1.04.77 2.1v3.12c0 .3.21.66.78.55a11.36 11.36 0 0 0 7.75-10.76C23.35 5.78 18.27.7 12 .7Z" />
    </svg>
  );
}

function IssueIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 shrink-0"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v4" />
      <path d="M12 16h.01" />
    </svg>
  );
}

function ExternalLinkIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="ml-auto h-3.5 w-3.5 shrink-0 opacity-0 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100"
    >
      <path d="M15 3h6v6" />
      <path d="M10 14 21 3" />
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    </svg>
  );
}
