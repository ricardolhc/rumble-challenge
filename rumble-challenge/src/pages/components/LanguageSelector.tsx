import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

interface Language {
  code: "pt" | "en" | "es" | "fr" | "de" | "ja";
  label: string;
  name: string;
}

interface LanguageSelectorProps {
  disabled?: boolean;
}

const languages: Language[] = [
  { code: "pt", label: "PT", name: "Português" },
  { code: "en", label: "EN", name: "English" },
  { code: "es", label: "ES", name: "Español" },
  { code: "fr", label: "FR", name: "Français" },
  { code: "de", label: "DE", name: "Deutsch" },
  { code: "ja", label: "JA", name: "日本語" },
];

export function LanguageSelector({ disabled = false }: LanguageSelectorProps) {
  const { i18n } = useTranslation();

  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentLanguage = i18n.resolvedLanguage?.split("-")[0] ?? "pt";

  function handleLanguageChange(language: Language["code"]) {
    if (disabled || language === currentLanguage) {
      return;
    }

    void i18n.changeLanguage(language);
    setIsOpen(false);
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={containerRef} className="absolute top-4 right-4 z-50">
      {/* Botão de idioma */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((current) => !current)}
        title="Selecionar idioma"
        aria-label="Selecionar idioma"
        aria-expanded={isOpen}
        className="
          flex
          h-11
          w-11
          cursor-pointer
          items-center
          justify-center
          rounded-xl
          border
          border-slate-700
          bg-slate-800/80
          text-slate-300
          shadow-lg
          backdrop-blur-sm
          transition-all
          duration-200
          hover:border-slate-600
          hover:bg-slate-700
          hover:text-white
          active:scale-95
          disabled:cursor-not-allowed
          disabled:opacity-50
        "
      >
        {/* Ícone de internacionalização / globo */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18" />
          <path d="M12 3a15 15 0 0 1 0 18" />
          <path d="M12 3a15 15 0 0 0 0 18" />
        </svg>
      </button>

      {/* Dropdown */}
      <div
        className={`
          absolute
          top-13
          right-0
          w-44
          origin-top-right
          overflow-hidden
          rounded-xl
          border
          border-slate-700
          bg-slate-800
          p-1.5
          shadow-2xl
          transition-all
          duration-150
          ${
            isOpen
              ? "visible translate-y-0 scale-100 opacity-100"
              : "invisible -translate-y-1 scale-95 opacity-0"
          }
        `}
      >
        {languages.map((language) => {
          const isSelected = currentLanguage === language.code;

          return (
            <button
              key={language.code}
              type="button"
              onClick={() => handleLanguageChange(language.code)}
              className={`
                flex
                w-full
                cursor-pointer
                items-center
                gap-3
                rounded-lg
                px-3
                py-2
                text-left
                text-sm
                transition-colors
                duration-150
                ${
                  isSelected
                    ? "bg-slate-600 text-white"
                    : "text-slate-300 hover:bg-slate-700 hover:text-white"
                }
              `}
            >
              <span className="w-6 text-xs font-bold text-slate-400">
                {language.label}
              </span>

              <span className="flex-1 font-medium">{language.name}</span>

              {isSelected && (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <path d="m5 12 4 4L19 6" />
                </svg>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
