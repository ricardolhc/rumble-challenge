interface TeamCharacterProps {
  name: string;
  image: string;
  symbol: string;
  background: string;
  imageWidthTeam: number;
  imageHeightTeam: number;
}

export function TeamCharacter({
  name,
  image,
  symbol,
  background,
  imageWidthTeam,
  imageHeightTeam,
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
