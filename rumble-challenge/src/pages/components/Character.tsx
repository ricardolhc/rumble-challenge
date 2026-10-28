import { CharacterCardContents } from "./CharacterCardContents";
import type { CharacterAlignment } from "../selection.types";

interface CharacterProps {
  name: string;
  image: string;
  symbol?: string;
  background?: string;
  alignment?: CharacterAlignment;
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
  alignment,
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
      data-alignment={alignment}
      className={`
        character-card character-card--compact
        relative
        h-[108px]
        w-[96px]
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
    >
      <CharacterCardContents
        alignment={alignment}
        name={name}
        image={image}
        symbol={symbol}
        background={background}
        imageWidth={imageWidth}
        imageHeight={imageHeight}
        isNew={isNew}
      />
    </div>
  );
}
