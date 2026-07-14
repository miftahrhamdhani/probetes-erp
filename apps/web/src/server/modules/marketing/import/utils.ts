import type { ImportPlatform } from "./import.types";

export const MAX_IMPORT_FILE_SIZE = 10 * 1024 * 1024;
export const MAX_IMPORT_ROWS = 50_000;

export const PLATFORM_LABEL: Record<ImportPlatform, string> = {
  tiktok: "TikTok Shop",
  shopee: "Shopee",
  meta: "Meta / Akuisisi",
};

/** Normalisasi header agar cocok lintas variasi ejaan platform (buang aksen/simbol). */
export function normalizeImportHeader(value: string): string {
  return value
    .replace(/^﻿/, "")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLocaleLowerCase("id-ID")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

/** Parse tanggal fleksibel (ISO / lokal dd-mm-yyyy / fallback Date.parse) -> YYYY-MM-DD. */
export function parseImportDate(value: string): string | null {
  const raw = value.trim();
  if (!raw) return null;
  const iso = raw.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  const local = raw.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
  const parts = iso
    ? { year: Number(iso[1]), month: Number(iso[2]), day: Number(iso[3]) }
    : local
      ? { year: Number(local[3]), month: Number(local[2]), day: Number(local[1]) }
      : null;
  if (parts) {
    const date = new Date(Date.UTC(parts.year, parts.month - 1, parts.day));
    if (
      date.getUTCFullYear() === parts.year
      && date.getUTCMonth() === parts.month - 1
      && date.getUTCDate() === parts.day
    ) return date.toISOString().slice(0, 10);
    return null;
  }
  const timestamp = Date.parse(raw);
  return Number.isNaN(timestamp) ? null : new Date(timestamp).toISOString().slice(0, 10);
}

/** Parse angka uang/qty dengan berbagai format ribuan/desimal (id/en). */
export function parseImportNumber(value: string): number | null {
  const raw = value.trim();
  if (!raw || raw === "-" || raw === "–") return null;
  let cleaned = raw.replace(/\s/g, "").replace(/rp/gi, "").replace(/%/g, "").replace(/[^0-9,.-]/g, "");
  if (!cleaned || cleaned === "-") return null;
  const lastComma = cleaned.lastIndexOf(",");
  const lastDot = cleaned.lastIndexOf(".");
  if (lastComma >= 0 && lastDot >= 0) {
    cleaned = lastComma > lastDot
      ? cleaned.replace(/\./g, "").replace(",", ".")
      : cleaned.replace(/,/g, "");
  } else if (lastComma >= 0) {
    const decimals = cleaned.length - lastComma - 1;
    cleaned = decimals === 3 ? cleaned.replace(/,/g, "") : cleaned.replace(",", ".");
  } else if (lastDot >= 0) {
    const decimals = cleaned.length - lastDot - 1;
    if (decimals === 3) cleaned = cleaned.replace(/\./g, "");
  }
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}

/** Normalisasi nomor HP ke 62xxxx; kembalikan null bila panjang tak wajar. */
export function normalizeImportPhone(value: string): string | null {
  const digits = value.replace(/\D/g, "");
  if (!digits) return null;
  const normalized = digits.startsWith("0") ? `62${digits.slice(1)}` : digits;
  return normalized.length >= 10 && normalized.length <= 15 ? normalized : null;
}
