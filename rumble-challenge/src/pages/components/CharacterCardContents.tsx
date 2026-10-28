import type { ReactNode } from "react";
import type { CharacterAlignment } from "../selection.types";
import "./CharacterCard.css";

interface CharacterCardContentsProps {
  name: string;
  image: string;
  symbol?: string;
  background?: string;
  alignment?: CharacterAlignment;
  imageWidth: number;
  imageHeight: number;
  portraitReferenceWidth?: number;
  isNew?: boolean;
  showName?: boolean;
  children?: ReactNode;
}

export function CharacterCardContents({
  name,
  image,
  symbol,
  background,
  alignment,
  imageWidth,
  imageHeight,
  portraitReferenceWidth,
  isNew = false,
  showName = true,
  children,
}: CharacterCardContentsProps) {
  // Scale both portrait dimensions together to retain the original framing.
  const portraitScale = showName ? 0.78 : 1;

  return (
    <div
      data-alignment={alignment}
      className={`character-card__contents${showName ? "" : " character-card__contents--art-only"}`}
    >
      <div
        className="character-card__art"
        style={{ backgroundImage: background ? `url(${background})` : undefined }}
      >
        <img
          src={image}
          alt={name}
          draggable={false}
          className="character-card__portrait"
          style={{
            width: portraitReferenceWidth
              ? `${(imageWidth * portraitScale / portraitReferenceWidth) * 100}cqw`
              : imageWidth * portraitScale,
            height: portraitReferenceWidth
              ? `${(imageHeight * portraitScale / portraitReferenceWidth) * 100}cqw`
              : imageHeight * portraitScale,
          }}
        />
        {alignment && <span className="character-card__alignment-effect" aria-hidden="true" />}
        {children}
        {symbol && (
          <img
            src={symbol}
            alt=""
            draggable={false}
            className="character-card__symbol"
          />
        )}
        {isNew && (
          <span className="character-card__new">
            <span>NEW!</span>
          </span>
        )}
      </div>
      {showName && (
        <div className="character-card__footer">
          <h2 className="character-card__name" title={name}>
            {name}
          </h2>
        </div>
      )}
    </div>
  );
}
