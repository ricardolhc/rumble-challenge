import type { ChangeEvent } from "react";
import { useTranslation } from "react-i18next";

import type { DrawCount, DrawSpeed } from "./settings.types";

interface DrawSettingsProps {
  drawCount: DrawCount;
  drawSpeed: DrawSpeed;
  onDrawCountChange: (count: DrawCount) => void;
  onDrawSpeedChange: (speed: DrawSpeed) => void;
}

export function DrawSettings({
  drawCount,
  drawSpeed,
  onDrawCountChange,
  onDrawSpeedChange,
}: DrawSettingsProps) {
  const { t } = useTranslation();

  return (
    <div className="p-6">
      <div className="max-w-[500px] rounded-2xl border border-slate-700 bg-slate-800/30 p-5">
        <label
          htmlFor="draw-count"
          className="mb-2 block text-sm font-semibold text-slate-200"
        >
          {t("selection.components.settings.drawSettings.drawCount")}
        </label>

        <p className="mb-4 text-xs text-slate-500">
          {t("selection.components.settings.drawSettings.drawCountDescription")}
        </p>

        <select
          id="draw-count"
          value={drawCount}
          onChange={(event: ChangeEvent<HTMLSelectElement>) =>
            onDrawCountChange(Number(event.target.value) as DrawCount)
          }
          className="w-full cursor-pointer rounded-xl border border-slate-700 bg-[#11151d] px-4 py-3 text-sm font-medium text-white outline-none transition-colors focus:border-emerald-500"
        >
          <option value={1}>
            {t(
              "selection.components.settings.drawSettings.oneCharacterPerDraw",
            )}
          </option>
          <option value={2}>
            {t(
              "selection.components.settings.drawSettings.twoCharactersPerDraw",
            )}
          </option>
          <option value={3}>
            {t(
              "selection.components.settings.drawSettings.threeCharactersPerDraw",
            )}
          </option>
        </select>

        <div className="my-5 h-px bg-slate-700/70" />

        <label
          htmlFor="draw-speed"
          className="mb-2 block text-sm font-semibold text-slate-200"
        >
          {t("selection.components.settings.drawSettings.drawSpeed")}
        </label>

        <p className="mb-4 text-xs text-slate-500">
          {t("selection.components.settings.drawSettings.drawSpeedDescription")}
        </p>

        <select
          id="draw-speed"
          value={drawSpeed}
          onChange={(event: ChangeEvent<HTMLSelectElement>) =>
            onDrawSpeedChange(event.target.value as DrawSpeed)
          }
          className="w-full cursor-pointer rounded-xl border border-slate-700 bg-[#11151d] px-4 py-3 text-sm font-medium text-white outline-none transition-colors focus:border-emerald-500"
        >
          <option value="fast">
            {t("selection.components.settings.drawSettings.fast")}
          </option>
          <option value="medium">
            {t("selection.components.settings.drawSettings.normal")}
          </option>
          <option value="slow">
            {t("selection.components.settings.drawSettings.slow")}
          </option>
        </select>

        <div className="mt-5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
          <p className="text-xs text-slate-400">
            {t("selection.components.settings.drawSettings.currentDraw")}{" "}
            <span className="font-bold text-emerald-400">{drawCount}</span>{" "}
            {drawCount === 1 ? "personagem" : "personagens"}{" "}
            {t("selection.components.settings.drawSettings.inSpeed")}{" "}
            <span className="font-bold text-emerald-400">
              {drawSpeed === "fast"
                ? t("selection.components.settings.drawSettings.fastSpeed")
                : drawSpeed === "medium"
                  ? t("selection.components.settings.drawSettings.normalSpeed")
                  : t("selection.components.settings.drawSettings.slowSpeed")}
            </span>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
