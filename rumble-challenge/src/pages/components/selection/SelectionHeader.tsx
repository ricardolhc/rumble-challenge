import type { ReactNode } from "react";

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
  return (
    <header className="mx-auto mb-4 flex w-full max-w-[1600px] flex-col items-center text-center">
      <h1 className="text-3xl font-extrabold tracking-tight text-white">
        Sorteador de Times
      </h1>

      <p className="mt-1 max-w-2xl text-sm text-slate-400">
        Sorteie de um a três personagens.
      </p>

      <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
        <Badge>{availableCharactersCount} personagens disponíveis</Badge>

        <Badge>
          {drawCount} {drawCount === 1 ? "personagem por sorteio" : "personagens por sorteio"}
        </Badge>

        {drawCount > 1 && <Badge>Sem personagens repetidos</Badge>}

        {bannedCharactersCount > 0 && (
          <span className="rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs font-medium text-red-400">
            {bannedCharactersCount} {bannedCharactersCount === 1 ? "banido" : "banidos"}
          </span>
        )}
      </div>
    </header>
  );
}
