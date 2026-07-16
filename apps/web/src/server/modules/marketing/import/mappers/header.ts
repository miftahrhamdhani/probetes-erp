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
  const normalized = new Set(headers.map(normalizeImportHeader));
  const signatures: Record<ImportPlatform, readonly string[]> = {
    tiktok: [
      "order id", "order amount", "seller sku", "created time", "recipient",
      "phone", "purchase channel",
    ],
    shopee: [
      "no pesanan", "waktu pesanan dibuat", "total pembayaran", "username pembeli",
      "nama penerima", "efektifitas iklan", "kode produk",
    ],
    meta: [
      "business name", "gross revenue", "confirmed time", "is from form", "utm campaign",
      "awal pelaporan", "akhir pelaporan", "nama kampanye", "jumlah yang dibelanjakan idr",
    ],
  };
  const scores = (Object.keys(signatures) as ImportPlatform[]).map((platform) => ({
    platform,
    score: signatures[platform].filter((header) => normalized.has(header)).length,
  })).sort((left, right) => right.score - left.score);
  const detected = scores[0]!.score >= 3 && scores[0]!.score > scores[1]!.score
    ? scores[0]!.platform
    : null;
  if (detected && detected !== selected) {
    return `Header file terdeteksi sebagai ${PLATFORM_LABEL[detected]}, bukan ${PLATFORM_LABEL[selected]}.`;
  }
  return null;
}
