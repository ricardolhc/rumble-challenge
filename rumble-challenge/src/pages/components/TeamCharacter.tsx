import { useState } from "react";
import { CharacterCardContents } from "./CharacterCardContents";
import type { MouseEvent } from "react";
import type { CharacterAlignment } from "../selection.types";

interface TeamCharacterProps {
  name: string;
  image: string;
  symbol?: string;
  background?: string;
  alignment?: CharacterAlignment;
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
  alignment,
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
      className="relative w-[264px] max-w-full"
      style={{
        perspective: "1000px",
      }}
    >
      <div
        data-alignment={alignment}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="
          character-card character-card--team
          relative
          h-[350px]
          w-full
          shrink-0
          cursor-pointer
          overflow-hidden
          bg-repeat
        "
        style={{
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
        <CharacterCardContents
          alignment={alignment}
          name={name}
          image={image}
          symbol={symbol}
          background={background}
          imageWidth={imageWidthTeam}
          imageHeight={imageHeightTeam}
          isNew={isNew}
          showName={showName}
        >
          {/* Brilho do hover */}
          <div
            className="
              pointer-events-none
              absolute
              inset-0
              z-20
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
        </CharacterCardContents>
      </div>
    </div>
  );
}
