import { useState } from "react";
import type { MouseEvent } from "react";

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

const MAX_ROTATION = 8;

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
  const [rotation, setRotation] = useState({
    x: 0,
    y: 0,
  });

  const [isHovering, setIsHovering] = useState(false);

  function handleMouseMove(event: MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();

    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const normalizedX = (mouseX - centerX) / centerX;
    const normalizedY = (mouseY - centerY) / centerY;

    setRotation({
      x: -normalizedY * MAX_ROTATION,
      y: normalizedX * MAX_ROTATION,
    });
  }

  function handleMouseEnter() {
    setIsHovering(true);
  }

  function handleMouseLeave() {
    setIsHovering(false);

    setRotation({
      x: 0,
      y: 0,
    });
  }

  return (
    <div
      className="relative"
      style={{
        perspective: "1000px",
      }}
    >
      <div
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="
          relative
          h-[350px]
          w-[275px]
          shrink-0
          cursor-pointer
          overflow-hidden
          rounded-2xl
          bg-repeat
        "
        style={{
          backgroundImage: `url(${background})`,
          backgroundSize: "100px 100px",

          transform: `
            rotateX(${rotation.x}deg)
            rotateY(${rotation.y}deg)
            ${isHovering ? "scale(1.025)" : "scale(1)"}
          `,

          transition: isHovering
            ? "transform 80ms ease-out, box-shadow 200ms ease"
            : "transform 450ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 300ms ease",

          boxShadow: isHovering
            ? "0 25px 55px rgba(0,0,0,0.55)"
            : "0 15px 40px rgba(0,0,0,0.45)",

          willChange: "transform",
        }}
      >
        {/* Símbolo */}
        <img
          src={symbol}
          alt=""
          draggable={false}
          className="
            pointer-events-none
            absolute
            left-2
            top-2
            z-20
            h-12
            w-12
            select-none
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
          draggable={false}
          className="
            pointer-events-none
            absolute
            bottom-0
            left-1/2
            max-w-none
            -translate-x-1/2
            select-none
            object-contain
          "
          style={{
            width: `${imageWidthTeam}px`,
            height: `${imageHeightTeam}px`,
          }}
        />

        {/* Brilho do hover */}
        <div
          className="
            pointer-events-none
            absolute
            inset-0
            z-20
            rounded-2xl
          "
          style={{
            background: `
              linear-gradient(
                ${135 + rotation.y * 2}deg,
                rgba(255,255,255,${isHovering ? 0.1 : 0}),
                transparent 45%,
                rgba(0,0,0,${isHovering ? 0.08 : 0})
              )
            `,
            transition: "background 150ms ease",
          }}
        />

        {/* Nome */}
        {showName && (
          <div
            className="
              pointer-events-none
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
    </div>
  );
}
