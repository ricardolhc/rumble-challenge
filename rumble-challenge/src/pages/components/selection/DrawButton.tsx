import type { DrawCount } from "../settings/settings.types";

interface DrawButtonProps {
  drawCount: DrawCount;
  isSelecting: boolean;
  hasAvailableTeam: boolean;
  onClick: () => void;
}

export function DrawButton({
  drawCount,
  isSelecting,
  hasAvailableTeam,
  onClick,
}: DrawButtonProps) {
  const isDisabled = isSelecting || !hasAvailableTeam;

  const label = isSelecting
    ? "Sorteando..."
    : !hasAvailableTeam
      ? "Configuração impossível"
      : drawCount === 1
        ? "Sortear personagem"
        : "Sortear time";

  return (
    <div className="mt-auto flex w-full justify-center pt-5 pb-2">
      <button
        type="button"
        onClick={onClick}
        disabled={isDisabled}
        className={`group relative min-w-[220px] overflow-hidden rounded-xl border px-8 py-3 text-sm font-bold uppercase tracking-wide text-white transition-all duration-200 ${
          isDisabled
            ? "cursor-not-allowed border-slate-600 bg-slate-700 text-slate-300"
            : "cursor-pointer border-emerald-400/40 bg-emerald-600 shadow-[0_8px_20px_rgba(16,185,129,0.25)] hover:-translate-y-[2px] hover:bg-emerald-500 hover:shadow-[0_10px_26px_rgba(16,185,129,0.4)] active:translate-y-0 active:scale-[0.98]"
        }`}
      >
        <span className="relative z-10">{label}</span>

        {!isDisabled && (
          <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
        )}
      </button>
    </div>
  );
}
