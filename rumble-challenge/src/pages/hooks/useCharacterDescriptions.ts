import { useEffect, useState } from "react";

import { useTranslation } from "react-i18next";
import {
  loadCharacterDescriptions,
  type CharacterDescriptions,
} from "../services/characterDescriptions.service";

interface UseCharacterDescriptionsResult {
  descriptions: CharacterDescriptions;
  isLoading: boolean;
  error: boolean;
}

export function useCharacterDescriptions(): UseCharacterDescriptionsResult {
  const { i18n } = useTranslation();

  const [descriptions, setDescriptions] = useState<CharacterDescriptions>({});

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadDescriptions() {
      setIsLoading(true);
      setError(false);

      try {
        const result = await loadCharacterDescriptions(
          i18n.resolvedLanguage ?? i18n.language ?? "pt",
        );

        if (cancelled) {
          return;
        }

        setDescriptions(result);

        /*
         * Se o serviço retornou {}, significa que tanto
         * o idioma quanto o fallback falharam.
         */
        setError(Object.keys(result).length === 0);
      } catch (error) {
        console.error("Erro inesperado ao carregar descrições:", error);

        if (!cancelled) {
          setDescriptions({});
          setError(true);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadDescriptions();

    return () => {
      cancelled = true;
    };
  }, [i18n.resolvedLanguage, i18n.language]);

  return {
    descriptions,
    isLoading,
    error,
  };
}
