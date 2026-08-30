import { useEffect, useRef, useState } from "react";

import { TeamCharacter } from "./TeamCharacter";
import type { CharacterType } from "../selection.types";
import { useTranslation } from "react-i18next";

interface TeamModalProps {
  team: CharacterType[];
  onClose: () => void;
}

const FADE_DURATION = 250;

export function TeamModal({ team, onClose }: TeamModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const { t } = useTranslation();

  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setIsVisible(true);
    });

    return () => {
      cancelAnimationFrame(frame);

      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  function handleClose() {
    if (!isVisible) {
      return;
    }

    setIsVisible(false);

    closeTimeoutRef.current = setTimeout(() => {
      onClose();
    }, FADE_DURATION);
  }

  const isSolo = team.length === 1;

  return (
    <div
      className={`
        fixed
        inset-0
        z-[100]
        flex
        items-center
        justify-center
        p-6
        backdrop-blur-[3px]
        transition-all
        duration-[250ms]
        ease-out
        ${
          isVisible
            ? `
              bg-black/85
              opacity-100
            `
            : `
              bg-black/0
              opacity-0
            `
        }
      `}
      onClick={handleClose}
    >
      <div
        className={`
          relative
          max-h-[95vh]
          w-full
          overflow-y-auto
          rounded-3xl
          border
          border-slate-700/60
          bg-[#151922]
          px-8
          py-7
          shadow-[0_30px_100px_rgba(0,0,0,0.8)]
          transition-all
          duration-[250ms]
          ease-out

          ${
            team.length === 1
              ? "max-w-[420px]"
              : team.length === 2
                ? "max-w-[700px]"
                : "max-w-[1000px]"
          }

          ${
            isVisible
              ? `
                translate-y-0
                scale-100
                opacity-100
              `
              : `
                translate-y-2
                scale-[0.98]
                opacity-0
              `
          }
        `}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={handleClose}
          className="
            absolute
            top-5
            right-5
            z-50
            flex
            h-10
            w-10
            cursor-pointer
            items-center
            justify-center
            rounded-xl
            border
            border-slate-700
            bg-slate-800
            text-xl
            font-bold
            text-slate-400
            transition-all
            hover:border-slate-500
            hover:bg-slate-700
            hover:text-white
          "
        >
          ×
        </button>

        <header className="mb-7 text-center">
          <h2
            className="
              text-3xl
              font-black
              uppercase
              tracking-tight
              text-white
            "
          >
            {isSolo
              ? t("selection.components.teamModal.oneCharacterDrawn")
              : t("selection.components.teamModal.multipleCharactersDrawn")}
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            {isSolo
              ? t("selection.components.teamModal.oneCharacterDefined")
              : t("selection.components.teamModal.multipleCharactersDefined")}
          </p>
        </header>

        <div
          className="
            flex
            flex-wrap
            items-start
            justify-center
            gap-6
          "
        >
          {team.map((personagem, index) => (
            <div
              key={`${personagem.name}-${index}`}
              className="
                  flex
                  flex-col
                  items-center
                "
            >
              {!isSolo && (
                <span
                  className="
                      mb-3
                      text-sm
                      font-black
                      uppercase
                      tracking-[0.18em]
                      text-slate-300
                    "
                >
                  {t("selection.components.teamModal.member")} {index + 1}
                </span>
              )}

              <TeamCharacter
                name={personagem.name}
                image={personagem.image}
                symbol={personagem.symbol}
                background={personagem.background}
                imageWidthTeam={personagem.imageWidthTeam}
                imageHeightTeam={personagem.imageHeightTeam}
                isNew={personagem.isNew}
              />
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={handleClose}
            className="
              min-w-[180px]
              cursor-pointer
              rounded-xl
              border
              border-emerald-400/40
              bg-emerald-600
              px-7
              py-3
              text-sm
              font-bold
              uppercase
              tracking-wide
              text-white
              shadow-[0_8px_25px_rgba(16,185,129,0.25)]
              transition-all
              duration-200
              hover:-translate-y-[2px]
              hover:bg-emerald-500
              hover:shadow-[0_12px_30px_rgba(16,185,129,0.4)]
              active:translate-y-0
              active:scale-[0.98]
            "
          >
            {t("selection.components.teamModal.close")}
          </button>
        </div>
      </div>
    </div>
  );
}
