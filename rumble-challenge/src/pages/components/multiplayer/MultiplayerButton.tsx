interface MultiplayerButtonProps {
  isInRoom: boolean;
  isHost: boolean;
  connectedGuests: number;
  disabled?: boolean;
  onClick: () => void;
}

function UsersIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
      />

      <circle cx="9" cy="7" r="4" />

      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
      />
    </svg>
  );
}

export function MultiplayerButton({
  isInRoom,
  isHost,
  connectedGuests,
  disabled = false,
  onClick,
}: MultiplayerButtonProps) {
  const label = !isInRoom ? "Multiplayer" : isHost ? "Host" : "Participante";

  const title = !isInRoom
    ? "Abrir multiplayer"
    : isHost
      ? `${connectedGuests} participante${
          connectedGuests === 1 ? "" : "s"
        } conectado${connectedGuests === 1 ? "" : "s"}`
      : "Você está conectado como participante";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`
        group
        absolute
        top-4
        right-20
        z-20
        flex
        h-11
        items-center
        gap-2.5
        rounded-xl
        border
        px-3.5
        text-sm
        font-semibold
        shadow-lg
        backdrop-blur-sm
        transition-all
        duration-200
        active:scale-95
        disabled:cursor-not-allowed
        disabled:opacity-50

        ${
          isInRoom
            ? `
              border-emerald-500/30
              bg-emerald-500/10
              text-emerald-100
              hover:border-emerald-400/50
              hover:bg-emerald-500/15
            `
            : `
              border-slate-700
              bg-slate-800/80
              text-slate-300
              hover:border-blue-500/40
              hover:bg-slate-700
              hover:text-white
            `
        }
      `}
    >
      <span
        className={`
          flex
          h-7
          w-7
          items-center
          justify-center
          rounded-lg
          transition-colors

          ${
            isInRoom
              ? "bg-emerald-500/15 text-emerald-400"
              : "bg-slate-700/70 text-slate-400 group-hover:text-blue-400"
          }
        `}
      >
        <UsersIcon />
      </span>

      <span>{label}</span>

      {isInRoom && isHost && (
        <>
          <span className="h-4 w-px bg-emerald-500/20" />

          <span
            className="
              flex
              min-w-5
              items-center
              justify-center
              rounded-md
              bg-emerald-400/15
              px-1.5
              py-0.5
              text-xs
              font-bold
              text-emerald-300
            "
          >
            {connectedGuests}
          </span>
        </>
      )}

      {isInRoom && !isHost && (
        <span className="relative flex h-2.5 w-2.5">
          <span
            className="
              absolute
              inline-flex
              h-full
              w-full
              animate-ping
              rounded-full
              bg-emerald-400
              opacity-30
            "
          />

          <span
            className="
              relative
              inline-flex
              h-2.5
              w-2.5
              rounded-full
              bg-emerald-400
            "
          />
        </span>
      )}
    </button>
  );
}
