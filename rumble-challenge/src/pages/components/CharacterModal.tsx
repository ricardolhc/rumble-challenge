import { useEffect, useRef, useState } from "react";

import type { CharacterType } from "../selection.types";

import { TeamCharacter } from "./TeamCharacter";

interface CharacterModalProps {
  character: CharacterType;
  onClose: () => void;
}

const FADE_DURATION = 250;

export function CharacterModal({ character, onClose }: CharacterModalProps) {
  const [isVisible, setIsVisible] = useState(false);

  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setIsVisible(true);
    });

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        handleClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      cancelAnimationFrame(frame);

      window.removeEventListener("keydown", handleKeyDown);

      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  function handleClose() {
    setIsVisible(false);

    closeTimeoutRef.current = setTimeout(() => {
      onClose();
    }, FADE_DURATION);
  }

  return (
    <div
      className={`
        fixed
        inset-0
        z-[100]
        flex
        items-center
        justify-center
        bg-black/80
        backdrop-blur-sm
        transition-opacity
        duration-[250ms]
        ${isVisible ? "opacity-100" : "opacity-0"}
      `}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          handleClose();
        }
      }}
    >
      <div
        className={`
          relative
          transition-all
          duration-[250ms]
          ease-out
          ${
            isVisible
              ? "translate-y-0 scale-100 opacity-100"
              : "translate-y-4 scale-95 opacity-0"
          }
        `}
      >
        {/* Fechar */}
        <button
          type="button"
          onClick={handleClose}
          title="Fechar"
          className="
            absolute
            -right-4
            -top-4
            z-[120]
            flex
            h-10
            w-10
            cursor-pointer
            items-center
            justify-center
            rounded-full
            border
            border-slate-600
            bg-slate-900
            text-slate-300
            shadow-xl
            transition-all
            duration-150
            hover:scale-110
            hover:border-red-500/70
            hover:bg-red-600
            hover:text-white
            active:scale-95
          "
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            className="h-5 w-5"
          >
            <path d="M6 6l12 12" />
            <path d="M18 6L6 18" />
          </svg>
        </button>

        <TeamCharacter
          name={character.name}
          image={character.image}
          symbol={character.symbol}
          background={character.background}
          imageWidthTeam={character.imageWidthTeam}
          imageHeightTeam={character.imageHeightTeam}
        />
      </div>
    </div>
  );
}
