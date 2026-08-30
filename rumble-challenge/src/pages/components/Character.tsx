interface CharacterProps {
  name: string;
  image: string;
  symbol: string;
  background: string;
  isHighlighted?: boolean;
  isFocused?: boolean;
  imageWidth: number;
  imageHeight: number;
  isNew?: boolean;
  isSelecting?: boolean;
}

export function Character({
  name,
  image,
  background,
  symbol,
  imageWidth,
  imageHeight,
  isHighlighted = false,
  isFocused = false,
  isNew = false,
  isSelecting = false,
}: CharacterProps) {
  return (
    <div
      className={`
        relative
        h-[100px]
        w-[100px]
        shrink-0
        overflow-hidden
        bg-repeat
        transition-all
        duration-300
        ease-out

        ${
          isFocused
            ? `
              z-[70]
              -translate-y-[8px]
              scale-[1.75]
              ring-2
              ring-yellow-300
              shadow-[0_12px_28px_rgba(0,0,0,0.75)]
            `
            : isHighlighted
              ? `
                z-50
                -translate-y-[5px]
                scale-[1.06]
                ring-2
                ring-yellow-300
                shadow-[0_8px_18px_rgba(0,0,0,0.65)]
              `
              : `
                z-10
                border
                border-black
              `
        }

        ${
          !isSelecting && !isHighlighted && !isFocused
            ? `
              hover:z-40
              hover:-translate-y-[4px]
              hover:scale-[1.04]
              hover:ring-2
              hover:ring-yellow-300
              hover:shadow-[0_8px_18px_rgba(0,0,0,0.65)]
            `
            : ""
        }
      `}
      style={{
        backgroundImage: `url(${background})`,
        backgroundSize: "80px 80px",
      }}
    >
      {/* Personagem */}
      <img
        src={image}
        alt={name}
        draggable={false}
        className="
          pointer-events-none
          absolute
          bottom-0
          left-1/2
          z-10
          max-w-none
          -translate-x-1/2
          select-none
          object-contain
          object-bottom
        "
        style={{
          width: `${imageWidth}px`,
          height: `${imageHeight}px`,
        }}
      />

      {/* Símbolo */}
      <img
        src={symbol}
        alt=""
        draggable={false}
        className="
          pointer-events-none
          absolute
          left-0
          top-0
          z-30
          h-[26px]
          w-[26px]
          select-none
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
            right-[2px]
            top-[2px]
            z-40
            h-[16px]
            w-[38px]
            select-none
            object-contain
            animate-[isNewBounce_1s_ease-in-out_infinite]
          "
        />
      )}

      {/* Nome */}
      <div
        className="
          absolute
          bottom-0
          left-0
          z-30
          flex
          h-[19px]
          w-full
          items-center
          justify-center
          bg-black/70
          px-[2px]
        "
      >
        <h2
          className="
            character-name
            max-w-full
            overflow-hidden
            text-ellipsis
            whitespace-nowrap
            text-center
            text-[10px]
            font-bold
            leading-none
            text-white
            drop-shadow-[0_1px_2px_rgba(0,0,0,1)]
          "
          title={name}
        >
          {name}
        </h2>
      </div>
    </div>
  );
}
