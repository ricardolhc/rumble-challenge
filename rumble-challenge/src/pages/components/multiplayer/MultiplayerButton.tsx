interface MultiplayerButtonProps {
  isInRoom: boolean;
  isHost: boolean;
  connectedGuests: number;
  disabled?: boolean;
  onClick: () => void;
}

export function MultiplayerButton({
  isInRoom,
  isHost,
  connectedGuests,
  disabled = false,
  onClick,
}: MultiplayerButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title="Multiplayer"
      className="absolute top-4 right-20 z-20 flex h-11 items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-3 text-sm font-semibold text-slate-300 shadow-lg backdrop-blur-sm transition-all duration-200 hover:border-blue-500/50 hover:bg-slate-700 hover:text-white active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <span
        className={`h-2.5 w-2.5 rounded-full ${
          isInRoom
            ? "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]"
            : "bg-slate-500"
        }`}
      />

      {isInRoom
        ? isHost
          ? `${connectedGuests} conectado${connectedGuests === 1 ? "" : "s"}`
          : "Assistindo"
        : "Multiplayer"}
    </button>
  );
}
