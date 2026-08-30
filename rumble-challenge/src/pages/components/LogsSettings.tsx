import { useTranslation } from "react-i18next";
import type { DrawLog } from "./settings/settings.types";

interface LogsSettingsProps {
  logs: DrawLog[];
}

export function LogsSettings({ logs }: LogsSettingsProps) {
  const { t, i18n } = useTranslation();

  function formatDate(date: string) {
    const parsedDate = new Date(date);

    return new Intl.DateTimeFormat(i18n.language, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(parsedDate);
  }

  if (logs.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="flex max-w-[420px] flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-700 bg-slate-800/50 text-slate-500">
            <HistoryIcon />
          </div>

          <h4 className="text-base font-semibold text-slate-200">
            {t("selection.components.settings.logsSettings.emptyTitle")}
          </h4>

          <p className="mt-2 text-sm text-slate-500">
            {t("selection.components.settings.logsSettings.emptyDescription")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="mx-auto flex max-w-[720px] flex-col gap-3">
        {logs.map((log, index) => (
          <article
            key={log.id}
            className="
              overflow-hidden
              rounded-xl
              border
              border-slate-700
              bg-slate-800/30
            "
          >
            <div
              className="
                flex
                items-center
                justify-between
                border-b
                border-slate-700/70
                bg-slate-900/30
                px-4
                py-3
              "
            >
              <div className="flex items-center gap-3">
                <div
                  className="
                    flex
                    h-8
                    w-8
                    items-center
                    justify-center
                    rounded-lg
                    bg-emerald-500/10
                    text-emerald-400
                  "
                >
                  <HistoryIcon />
                </div>

                <div>
                  <p className="text-sm font-semibold text-white">
                    {t("selection.components.settings.logsSettings.draw")} #
                    {logs.length - index}
                  </p>

                  <p className="text-[11px] text-slate-500">
                    {formatDate(log.createdAt)}
                  </p>
                </div>
              </div>

              <span
                className="
                  rounded-full
                  bg-emerald-500/10
                  px-2.5
                  py-1
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-wide
                  text-emerald-400
                "
              >
                {log.team.length}{" "}
                {log.team.length === 1
                  ? t("selection.components.settings.logsSettings.character")
                  : t("selection.components.settings.logsSettings.characters")}
              </span>
            </div>

            <div className="grid gap-2 p-3 sm:grid-cols-2 lg:grid-cols-3">
              {log.team.map((character, characterIndex) => (
                <div
                  key={`${log.id}-${character.name}-${character.type}-${characterIndex}`}
                  className="
                    flex
                    min-w-0
                    items-center
                    gap-3
                    rounded-lg
                    border
                    border-slate-700/70
                    bg-slate-900/40
                    p-2.5
                  "
                >
                  <div
                    className="
                      relative
                      h-11
                      w-11
                      shrink-0
                      overflow-hidden
                      rounded-lg
                      border
                      border-slate-700
                      bg-slate-800
                    "
                    style={{
                      backgroundImage: `url(${character.background})`,
                      backgroundSize: "45px 45px",
                    }}
                  >
                    <img
                      src={character.image}
                      alt={character.name}
                      className="
                        absolute
                        inset-0
                        h-full
                        w-full
                        object-contain
                        object-bottom
                      "
                    />

                    <img
                      src={character.symbol}
                      alt=""
                      className="
                        absolute
                        top-0.5
                        left-0.5
                        h-3.5
                        w-3.5
                        object-contain
                      "
                    />
                  </div>

                  <div className="min-w-0">
                    <p
                      className="
                        truncate
                        text-sm
                        font-semibold
                        text-slate-200
                      "
                      title={character.name}
                    >
                      {character.name}
                    </p>

                    <p
                      className="
                        mt-0.5
                        text-[10px]
                        font-semibold
                        uppercase
                        tracking-wider
                        text-slate-500
                      "
                    >
                      {character.type}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function HistoryIcon() {
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
      <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
      <path d="M3 3v5h5" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}
