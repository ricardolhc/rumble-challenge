import { useTranslation } from "react-i18next";

interface Language {
  code: "pt" | "en" | "es" | "fr" | "de" | "ja";
  label: string;
}

interface LanguageSelectorProps {
  disabled?: boolean;
}

const languages: Language[] = [
  {
    code: "pt",
    label: "PT",
  },
  {
    code: "en",
    label: "EN",
  },
  {
    code: "es",
    label: "ES",
  },
  {
    code: "fr",
    label: "FR",
  },
  {
    code: "de",
    label: "DE",
  },
  {
    code: "ja",
    label: "JA",
  },
];

export function LanguageSelector({ disabled = false }: LanguageSelectorProps) {
  const { i18n } = useTranslation();

  const currentLanguage = i18n.resolvedLanguage?.split("-")[0] ?? "pt";

  function handleLanguageChange(language: Language["code"]) {
    if (disabled || language === currentLanguage) {
      return;
    }

    void i18n.changeLanguage(language);
  }

  return (
    <div className="absolute top-4 right-4 z-20 flex items-center gap-1 rounded-xl border border-slate-700 bg-slate-800/80 p-1 shadow-lg backdrop-blur-sm">
      {languages.map((language) => {
        const isSelected = currentLanguage === language.code;

        return (
          <button
            key={language.code}
            type="button"
            disabled={disabled}
            onClick={() => handleLanguageChange(language.code)}
            className={`
              flex h-9 min-w-10 cursor-pointer items-center justify-center rounded-lg px-2
              text-xs font-bold transition-all duration-200
              ${
                isSelected
                  ? "bg-slate-600 text-white shadow-sm"
                  : "text-slate-400 hover:bg-slate-700 hover:text-white"
              }
              disabled:cursor-not-allowed disabled:opacity-50
            `}
          >
            {language.label}
          </button>
        );
      })}
    </div>
  );
}
