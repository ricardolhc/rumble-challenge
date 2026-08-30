export type SupportedLanguage = "pt" | "en" | "es" | "fr" | "de" | "ja";

export interface CharacterDescription {
  description: string;
}

export type CharacterDescriptions = Record<string, CharacterDescription>;

const DESCRIPTION_URLS: Record<SupportedLanguage, string> = {
  de: "https://api.npoint.io/fa0fc3129e805ce1ec47",
  en: "https://api.npoint.io/4474d74f4bc619a7a802",
  es: "https://api.npoint.io/4016f7cc58160feddf14",
  fr: "https://api.npoint.io/7b6fb2b407a278b007b7",
  ja: "https://api.npoint.io/eae8fc6bacc4a33fb7ba",
  pt: "https://api.npoint.io/b147b576476d9d3f6244",
};

const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  "pt",
  "en",
  "es",
  "fr",
  "de",
  "ja",
];

/**
 * Cache em memória.
 *
 * Enquanto o usuário permanecer na aplicação, cada idioma será
 * solicitado apenas uma vez.
 */
const descriptionsCache = new Map<SupportedLanguage, CharacterDescriptions>();

/**
 * Guarda requisições que já estão em andamento.
 *
 * Isso evita duas chamadas simultâneas ao mesmo endpoint caso
 * vários componentes solicitem o mesmo idioma ao mesmo tempo.
 */
const pendingRequests = new Map<
  SupportedLanguage,
  Promise<CharacterDescriptions>
>();

function normalizeLanguage(language: string): SupportedLanguage {
  const normalized = language.toLowerCase().split("-")[0];

  if (SUPPORTED_LANGUAGES.includes(normalized as SupportedLanguage)) {
    return normalized as SupportedLanguage;
  }

  return "pt";
}

async function fetchDescriptions(
  language: SupportedLanguage,
): Promise<CharacterDescriptions> {
  const cached = descriptionsCache.get(language);

  if (cached) {
    return cached;
  }

  const pendingRequest = pendingRequests.get(language);

  if (pendingRequest) {
    return pendingRequest;
  }

  const request = fetch(DESCRIPTION_URLS[language])
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(
          `Erro ao carregar descrições (${language}): ${response.status}`,
        );
      }

      const data = (await response.json()) as CharacterDescriptions;

      descriptionsCache.set(language, data);

      return data;
    })
    .finally(() => {
      pendingRequests.delete(language);
    });

  pendingRequests.set(language, request);

  return request;
}

export async function loadCharacterDescriptions(
  language: string,
): Promise<CharacterDescriptions> {
  const selectedLanguage = normalizeLanguage(language);

  try {
    return await fetchDescriptions(selectedLanguage);
  } catch (error) {
    console.error(
      `Não foi possível carregar as descrições em "${selectedLanguage}".`,
      error,
    );

    /*
     * Se o idioma solicitado já for português,
     * não existe outro fallback.
     */
    if (selectedLanguage === "pt") {
      return {};
    }

    try {
      console.warn(`Utilizando descrições em português como fallback.`);

      return await fetchDescriptions("pt");
    } catch (fallbackError) {
      console.error(
        "Também não foi possível carregar o fallback em português.",
        fallbackError,
      );

      return {};
    }
  }
}

/**
 * Retorna uma descrição específica.
 */
export async function loadCharacterDescription(
  characterId: string,
  language: string,
): Promise<string | null> {
  const descriptions = await loadCharacterDescriptions(language);

  return descriptions[characterId]?.description ?? null;
}

/**
 * Permite limpar o cache manualmente.
 *
 * Pode ser útil futuramente se você atualizar os JSONs no npoint
 * e quiser recarregar os dados sem atualizar a página.
 */
export function clearCharacterDescriptionsCache(language?: SupportedLanguage) {
  if (language) {
    descriptionsCache.delete(language);
    pendingRequests.delete(language);

    return;
  }

  descriptionsCache.clear();
  pendingRequests.clear();
}
