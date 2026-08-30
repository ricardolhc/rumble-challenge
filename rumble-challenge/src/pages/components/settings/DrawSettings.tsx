import type { ChangeEvent } from "react";

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
  return (
    <div className="p-6">
      <div className="max-w-[500px] rounded-2xl border border-slate-700 bg-slate-800/30 p-5">
        <label
          htmlFor="draw-count"
          className="mb-2 block text-sm font-semibold text-slate-200"
        >
          Quantidade de sorteios
        </label>

        <p className="mb-4 text-xs text-slate-500">
          Escolha quantos personagens serão sorteados por vez. O máximo é 3.
        </p>

        <select
          id="draw-count"
          value={drawCount}
          onChange={(event: ChangeEvent<HTMLSelectElement>) =>
            onDrawCountChange(Number(event.target.value) as DrawCount)
          }
          className="w-full cursor-pointer rounded-xl border border-slate-700 bg-[#11151d] px-4 py-3 text-sm font-medium text-white outline-none transition-colors focus:border-emerald-500"
        >
          <option value={1}>1 personagem</option>
          <option value={2}>2 personagens</option>
          <option value={3}>3 personagens</option>
        </select>

        <div className="my-5 h-px bg-slate-700/70" />

        <label
          htmlFor="draw-speed"
          className="mb-2 block text-sm font-semibold text-slate-200"
        >
          Velocidade de sorteio
        </label>

        <p className="mb-4 text-xs text-slate-500">
          Defina a velocidade da animação durante o sorteio.
        </p>

        <select
          id="draw-speed"
          value={drawSpeed}
          onChange={(event: ChangeEvent<HTMLSelectElement>) =>
            onDrawSpeedChange(event.target.value as DrawSpeed)
          }
          className="w-full cursor-pointer rounded-xl border border-slate-700 bg-[#11151d] px-4 py-3 text-sm font-medium text-white outline-none transition-colors focus:border-emerald-500"
        >
          <option value="fast">Rápida</option>
          <option value="medium">Média</option>
          <option value="slow">Lenta</option>
        </select>

        <div className="mt-5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
          <p className="text-xs text-slate-400">
            Atualmente serão sorteados{" "}
            <span className="font-bold text-emerald-400">{drawCount}</span>{" "}
            {drawCount === 1 ? "personagem" : "personagens"} em velocidade{" "}
            <span className="font-bold text-emerald-400">
              {drawSpeed === "fast"
                ? "rápida"
                : drawSpeed === "medium"
                  ? "média"
                  : "lenta"}
            </span>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
