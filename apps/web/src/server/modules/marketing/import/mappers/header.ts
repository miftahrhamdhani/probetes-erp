import type { ImportPlatform } from "../import.types";
import { normalizeImportHeader, PLATFORM_LABEL } from "../utils";

/** Peta header ternormalisasi -> nama header asli dari file. */
export function buildHeaderLookup(headers: string[]): Map<string, string> {
  return new Map(headers.map((header) => [normalizeImportHeader(header), header]));
}

/** Cari header asli yang cocok dengan salah satu alias. */
export function findHeader(lookup: Map<string, string>, aliases: readonly string[]): string | null {
  for (const alias of aliases) {
    const found = lookup.get(normalizeImportHeader(alias));
    if (found) return found;
  }
  return null;
}

/** Ambil nilai sel apa adanya (trim) untuk header tertentu. */
export function field(row: Record<string, string>, header: string | null): string {
  const value = header ? String(row[header] ?? "").trim() : "";
  return /^(?:-|–|—|--|n\/?a|null)$/i.test(value) ? "" : value;
}

/** Deteksi platform dari header untuk peringatan salah-file. */
export function detectPlatformMismatch(headers: string[], selected: ImportPlatform): string | null {
  const joined = headers.map(normalizeImportHeader).join(" ");
  const detected = joined.includes("tiktok")
    ? "tiktok"
    : joined.includes("shopee")
      ? "shopee"
      : joined.includes("facebook") || joined.includes("meta ads")
        ? "meta"
        : null;
  if (detected && detected !== selected) {
    return `Header file terdeteksi sebagai ${PLATFORM_LABEL[detected]}, bukan ${PLATFORM_LABEL[selected]}.`;
  }
  return null;
}
