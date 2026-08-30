import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import type { DrawCount } from "../settings/settings.types";

interface SelectionHeaderProps {
  availableCharactersCount: number;
  drawCount: DrawCount;
  bannedCharactersCount: number;
  challengeMode: boolean;
}

function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full border border-slate-700 bg-slate-800/70 px-3 py-1 text-xs font-medium text-slate-300">
      {children}
    </span>
  );
}

export function SelectionHeader({
  availableCharactersCount,
  drawCount,
  bannedCharactersCount,
  challengeMode,
}: SelectionHeaderProps) {
  const { t } = useTranslation();

  return (
    <header className="mx-auto mb-4 flex w-full max-w-[1600px] flex-col items-center text-center">
      <h1 className="text-3xl font-extrabold tracking-tight text-white">
        {t("selection.components.selection.selectionHeader.title")}
      </h1>

      <p className="mt-1 max-w-2xl text-sm text-slate-400">
        {t("selection.components.selection.selectionHeader.subtitle")}
      </p>

      <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
        <Badge>
          {availableCharactersCount}{" "}
          {t(
            "selection.components.selection.selectionHeader.availableCharacters",
          )}
        </Badge>

        <Badge>
          {drawCount}{" "}
          {drawCount === 1
            ? t(
                "selection.components.selection.selectionHeader.oneCharacterPerDraw",
              )
            : t(
                "selection.components.selection.selectionHeader.multipleCharactersPerDraw",
              )}
        </Badge>

        {drawCount > 1 && (
          <Badge>
            {t(
              "selection.components.selection.selectionHeader.noRepeatedCharacters",
            )}
          </Badge>
        )}

        {bannedCharactersCount > 0 && (
          <span className="rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs font-medium text-red-400">
            {bannedCharactersCount}{" "}
            {bannedCharactersCount === 1
              ? t(
                  "selection.components.selection.selectionHeader.oneCharacterBanned",
                )
              : t(
                  "selection.components.selection.selectionHeader.multipleCharactersBanned",
                )}
          </span>
        )}

        {challengeMode && (
          <>
            <span className="text-slate-600">•</span>

            <span
              className="
                inline-flex
                items-center
                gap-1.5
                rounded-full
                border
                border-amber-400/30
                bg-amber-500/10
                px-2.5
                py-1
                text-xs
                font-bold
                tracking-wide
                text-amber-400
                shadow-[0_0_15px_rgba(245,158,11,0.08)]
              "
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-3.5 w-3.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 21h8M12 17v4M7 4h10v4a5 5 0 0 1-10 0V4Z"
                />

                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M7 6H4v2a4 4 0 0 0 4 4M17 6h3v2a4 4 0 0 1-4 4"
                />
              </svg>

              {t(
                "selection.components.selection.selectionHeader.challengeModeEnabled",
              )}
            </span>
          </>
        )}
      </div>
    </header>
  );
}
