import type {
  ManualAnswerSignal,
  ManualOfferSignal,
  ManualSignal,
} from "../multiplayer.types";

function encodeUtf8(value: string) {
  const bytes = new TextEncoder().encode(value);
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary)
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/g, "");
}

function decodeUtf8(value: string) {
  const normalized = value.replaceAll("-", "+").replaceAll("_", "/");
  const padded = normalized.padEnd(
    normalized.length + ((4 - (normalized.length % 4)) % 4),
    "=",
  );

  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));

  return new TextDecoder().decode(bytes);
}

export function encodeSignal(signal: ManualSignal) {
  return encodeUtf8(JSON.stringify(signal));
}

export function decodeSignal(code: string): ManualSignal {
  const trimmedCode = code.trim();

  if (!trimmedCode) {
    throw new Error("O código de conexão está vazio.");
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(decodeUtf8(trimmedCode));
  } catch {
    throw new Error("O código de conexão é inválido.");
  }

  if (!parsed || typeof parsed !== "object") {
    throw new Error("O código de conexão é inválido.");
  }

  const signal = parsed as Partial<ManualSignal>;

  if (signal.version !== 1) {
    throw new Error("Versão de código de conexão não suportada.");
  }

  if (signal.kind !== "offer" && signal.kind !== "answer") {
    throw new Error("Tipo de código de conexão inválido.");
  }

  if (!signal.peerId || typeof signal.peerId !== "string") {
    throw new Error("Código sem identificador do participante.");
  }

  if (!signal.description || typeof signal.description !== "object") {
    throw new Error("Código sem descrição WebRTC.");
  }

  return signal as ManualSignal;
}

export function decodeOfferSignal(code: string): ManualOfferSignal {
  const signal = decodeSignal(code);

  if (signal.kind !== "offer") {
    throw new Error("Esse código não é uma oferta de participante.");
  }

  return signal;
}

export function decodeAnswerSignal(code: string): ManualAnswerSignal {
  const signal = decodeSignal(code);

  if (signal.kind !== "answer") {
    throw new Error("Esse código não é uma resposta do host.");
  }

  return signal;
}
