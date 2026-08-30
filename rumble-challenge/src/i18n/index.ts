import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import ptBR from "./locales/pt-BR.json";
import en from "./locales/en.json";
import es from "./locales/es.json";

const LANGUAGE_STORAGE_KEY = "rumble-challenge-language";

const DEFAULT_LANGUAGE = "pt-BR";

const savedLanguage =
  localStorage.getItem(LANGUAGE_STORAGE_KEY) ?? DEFAULT_LANGUAGE;

void i18n.use(initReactI18next).init({
  resources: {
    "pt-BR": {
      translation: ptBR,
    },
    en: {
      translation: en,
    },
    es: {
      translation: es,
    },
  },

  lng: savedLanguage,
  fallbackLng: DEFAULT_LANGUAGE,

  defaultNS: "translation",
  ns: ["translation"],

  interpolation: {
    escapeValue: false,
  },
});

i18n.on("languageChanged", (language) => {
  localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
});

export default i18n;
