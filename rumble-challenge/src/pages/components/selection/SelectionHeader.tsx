import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import type { DrawCount } from "../settings/settings.types";

interface SelectionHeaderProps {
  availableCharactersCount: number;
  drawCount: DrawCount;
  bannedCharactersCount: number;
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
      </div>
    </header>
  );
}
