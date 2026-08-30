interface TeamCharacterProps {
  name: string;
  image: string;
  symbol: string;
  background: string;
  imageWidthTeam: number;
  imageHeightTeam: number;
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
        draggable={false}
        className="
          absolute
          top-1
          left-1
          z-30
          h-[50px]
          w-[50px]
          object-contain
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
        draggable={false}
        className="
          absolute
          bottom-0
          left-1/2
          z-10
          max-w-none
          -translate-x-1/2
          object-contain
        "
        style={{
          width: `${imageWidthTeam}px`,
          height: `${imageHeightTeam}px`,
        }}
      />

      {/* Gradiente */}
      <div
        className="
          pointer-events-none
          absolute
          inset-x-0
          bottom-0
          z-20
          h-[80px]
          bg-gradient-to-t
          from-black/75
          via-black/20
          to-transparent
        "
      />

      {/* Nome */}
      <div
        className="
          absolute
          right-0
          bottom-0
          left-0
          z-30
          flex
          justify-center
          px-3
          pb-3
        "
      >
        <h3
          className="
            text-center
            text-xl
            font-black
            tracking-tight
            text-white
          "
          style={{
            textShadow: `
              -1px -1px 0 #000,
              1px -1px 0 #000,
              -1px 1px 0 #000,
              1px 1px 0 #000,
              0 2px 3px rgba(0,0,0,1)
            `,
          }}
        >
          {name}
        </h3>
      </div>
    </div>
  );
}
