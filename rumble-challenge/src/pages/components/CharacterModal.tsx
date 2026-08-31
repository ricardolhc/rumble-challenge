import { useEffect, useRef, useState } from "react";

import type { CharacterType } from "../selection.types";

import { TeamCharacter } from "./TeamCharacter";
import { useTranslation } from "react-i18next";

interface CharacterModalProps {
  character: CharacterType;
  onClose: () => void;
  name: string;
  description: string;
}

const FADE_DURATION = 250;

export function CharacterModal({
  character,
  onClose,
  name,
  description,
}: CharacterModalProps) {
  const { t } = useTranslation();
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
        px-4
        py-8
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
          w-full
          max-w-[1000px]
          overflow-hidden
          rounded-3xl
          border
          border-slate-700/80
          bg-slate-950/95
          shadow-[0_30px_100px_rgba(0,0,0,0.65)]
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
        {/* Glow superior */}
        <div
          className="
            pointer-events-none
            absolute
            left-1/2
            top-0
            h-[180px]
            w-[600px]
            -translate-x-1/2
            rounded-full
            bg-emerald-500/10
            blur-[100px]
          "
        />

        {/* Botão fechar */}
        <button
          type="button"
          onClick={handleClose}
          title="Fechar"
          className="
            absolute
            right-5
            top-5
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

        <div className="relative z-10 px-8 pb-10 pt-8 md:px-12">
          {/* Nome */}
          <header className="mb-9 text-center">
            <h1
              className="
                text-3xl
                font-black
                uppercase
                tracking-[0.08em]
                text-white
                sm:text-4xl
                md:text-5xl
              "
            >
              {name}
            </h1>

            <div
              className="
                mx-auto
                mt-4
                h-[3px]
                w-24
                rounded-full
                bg-emerald-400
                shadow-[0_0_18px_rgba(52,211,153,0.5)]
              "
            />
          </header>

          {/* Conteúdo principal */}
          <div
            className="
              grid
              grid-cols-1
              items-start
              gap-10
              lg:grid-cols-[auto_1fr]
              lg:gap-14
            "
          >
            {/* Card */}
            <div className="flex justify-center lg:justify-start">
              <TeamCharacter
                name={character.name}
                image={character.image}
                symbol={character.symbol}
                background={character.background}
                imageWidthTeam={character.imageWidthTeam}
                imageHeightTeam={character.imageHeightTeam}
                showName={false}
                isNew={character.isNew}
              />
            </div>

            {/* Informações */}
            <section className="flex flex-col">
              {/* Título */}
              <div className="mb-5 flex items-center gap-3">
                <div className="h-8 w-1 rounded-full bg-emerald-400" />

                <h2
                  className="
                    text-xl
                    font-extrabold
                    uppercase
                    tracking-wider
                    text-emerald-400
                    sm:text-2xl
                  "
                >
                  {t("selection.components.characterModal.information")}
                </h2>
              </div>

              {/* Descrição */}
              <p
                className="
                  max-w-[600px]
                  text-base
                  font-medium
                  leading-7
                  text-slate-300
                  sm:text-lg
                  sm:leading-8
                "
              >
                {description}
              </p>

              <div className="my-7 h-px w-full bg-slate-800" />

              {/* Informações adicionais */}
              <div className="flex flex-wrap gap-3">
                <div
                  className="
                    rounded-lg
                    border
                    border-slate-700
                    bg-slate-900/80
                    px-4
                    py-2
                  "
                >
                  <span
                    className="
                      text-xs
                      font-bold
                      uppercase
                      tracking-widest
                      text-slate-500
                    "
                  >
                    {t("selection.components.characterModal.type")}
                  </span>

                  <p className="mt-0.5 font-bold capitalize text-slate-200">
                    {character.type}
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
