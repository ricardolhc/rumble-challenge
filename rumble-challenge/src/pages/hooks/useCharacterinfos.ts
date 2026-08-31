import { useEffect, useState } from "react";

import { useTranslation } from "react-i18next";

import {
  loadCharacterDescriptions,
  type CharacterDescriptions,
} from "../services/characterDescriptions.service";

interface CharacterDescriptionInfos {
  name: string;
  description: string;
}

interface UseCharacterDescriptionsResult {
  infos: Record<string, CharacterDescriptionInfos>;
  isLoading: boolean;
  error: boolean;
}

export function useCharacterInfos(): UseCharacterDescriptionsResult {
  const { i18n } = useTranslation();

  const [infos, setInfos] = useState<CharacterDescriptions>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadInfos() {
      setIsLoading(true);
      setError(false);

      try {
        const result = await loadCharacterDescriptions(
          i18n.resolvedLanguage ?? i18n.language ?? "pt",
        );

        if (cancelled) {
          return;
        }

        setInfos(result);
        setError(Object.keys(result).length === 0);
      } catch (error) {
        console.error(
          "Erro inesperado ao carregar informações dos personagens:",
          error,
        );

        if (!cancelled) {
          setInfos({});
          setError(true);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadInfos();

    return () => {
      cancelled = true;
    };
  }, [i18n.resolvedLanguage, i18n.language]);

  return {
    infos,
    isLoading,
    error,
  };
}
