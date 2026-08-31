const CODE_PREFIX = "RC1:";

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";

  const CHUNK_SIZE = 0x8000;

  for (let index = 0; index < bytes.length; index += CHUNK_SIZE) {
    const chunk = bytes.subarray(index, index + CHUNK_SIZE);

    binary += String.fromCharCode(...chunk);
  }

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function base64UrlToBytes(value: string): Uint8Array {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");

  const paddingLength = (4 - (normalized.length % 4)) % 4;

  const padded = normalized + "=".repeat(paddingLength);

  const binary = atob(padded);

  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index++) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const buffer = new ArrayBuffer(bytes.byteLength);

  new Uint8Array(buffer).set(bytes);

  return buffer;
}

async function compress(value: string): Promise<Uint8Array> {
  const input = new TextEncoder().encode(value);

  const stream = new Blob([toArrayBuffer(input)])
    .stream()
    .pipeThrough(new CompressionStream("gzip"));

  return new Uint8Array(await new Response(stream).arrayBuffer());
}

async function decompress(bytes: Uint8Array): Promise<string> {
  const stream = new Blob([toArrayBuffer(bytes)])
    .stream()
    .pipeThrough(new DecompressionStream("gzip"));

  const decompressed = await new Response(stream).arrayBuffer();

  return new TextDecoder().decode(decompressed);
}

export async function encodeMultiplayerCode(value: string): Promise<string> {
  const trimmed = value.trim();

  if (!trimmed) {
    return "";
  }

  if (
    typeof CompressionStream === "undefined" ||
    typeof DecompressionStream === "undefined"
  ) {
    return trimmed;
  }

  try {
    const compressed = await compress(trimmed);

    return `${CODE_PREFIX}${bytesToBase64Url(compressed)}`;
  } catch {
    return trimmed;
  }
}

export async function decodeMultiplayerCode(value: string): Promise<string> {
  const trimmed = value.trim();

  if (!trimmed) {
    return "";
  }

  if (!trimmed.startsWith(CODE_PREFIX)) {
    return trimmed;
  }

  if (typeof DecompressionStream === "undefined") {
    throw new Error(
      "Este navegador não suporta os códigos compactados do multiplayer.",
    );
  }

  try {
    const encoded = trimmed.slice(CODE_PREFIX.length);

    const bytes = base64UrlToBytes(encoded);

    return await decompress(bytes);
  } catch {
    throw new Error(
      "O código de conexão é inválido ou está incompleto. Copie o código novamente.",
    );
  }
}

export function isCompressedMultiplayerCode(value: string): boolean {
  return value.trim().startsWith(CODE_PREFIX);
}
