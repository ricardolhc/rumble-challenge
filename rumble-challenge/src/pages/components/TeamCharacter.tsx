interface TeamCharacterProps {
  name: string;
  image: string;
  symbol: string;
  background: string;
  imageWidthTeam: number;
  imageHeightTeam: number;
  showName?: boolean;
  isNew?: boolean;
}

export function TeamCharacter({
  name,
  image,
  symbol,
  background,
  imageWidthTeam,
  imageHeightTeam,
  isNew = false,
  showName = true,
}: TeamCharacterProps) {
  return (
    <div
      className="
        relative
        h-[350px]
        w-[275px]
        shrink-0
        overflow-hidden
        rounded-2xl
        bg-repeat
        shadow-[0_15px_40px_rgba(0,0,0,0.45)]
      "
      style={{
        backgroundImage: `url(${background})`,
        backgroundSize: "100px 100px",
      }}
    >
      {/* Símbolo */}
      <img
        src={symbol}
        alt=""
        className="
          absolute
          left-2
          top-2
          z-20
          h-12
          w-12
          object-contain
          drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]
        "
      />

      {/* NEW */}
      {isNew && (
        <img
          src="https://ultrarumble.com/assets/icons/newicon.png"
          alt="New"
          draggable={false}
          className="
            pointer-events-none
            absolute
            right-3
            top-3
            z-40
            h-[26px]
            w-[62px]
            select-none
            object-contain
            animate-[isNewBounce_1s_ease-in-out_infinite]
          "
        />
      )}

      {/* Personagem */}
      <img
        src={image}
        alt={name}
        className="
          absolute
          bottom-0
          left-1/2
          max-w-none
          -translate-x-1/2
          object-contain
        "
        style={{
          width: `${imageWidthTeam}px`,
          height: `${imageHeightTeam}px`,
        }}
      />

      {/* Nome */}
      {showName && (
        <div
          className="
            absolute
            bottom-3
            left-1/2
            z-30
            -translate-x-1/2
            whitespace-nowrap
            rounded-lg
            bg-black/75
            px-4
            py-1.5
            text-center
            text-xl
            font-black
            text-white
            shadow-lg
            backdrop-blur-sm
          "
        >
          {name}
        </div>
      )}
    </div>
  );
}
