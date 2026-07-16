import type { ImportPlatform } from "./import.types";

export const MAX_IMPORT_FILE_SIZE = 10 * 1024 * 1024;
export const MAX_IMPORT_ROWS = 50_000;

export const PLATFORM_LABEL: Record<ImportPlatform, string> = {
  tiktok: "TikTok Shop",
  shopee: "Shopee",
  meta: "Meta / Akuisisi",
};

const INDONESIAN_MONTHS = [
  "januari", "februari", "maret", "april", "mei", "juni",
  "juli", "agustus", "september", "oktober", "november", "desember",
];

/** Ubah periode bulan Indonesia (contoh: Juni 2026) menjadi rentang tanggal penuh. */
export function parseImportMonth(value: string): { label: string; start: string; end: string } | null {
  const match = value.trim().toLocaleLowerCase("id-ID").replace(/\s+/g, " ").match(/^([a-z]+)\s+(\d{4})$/);
  if (!match) return null;
  const month = INDONESIAN_MONTHS.indexOf(match[1]!);
  const year = Number(match[2]);
  if (month < 0 || year < 2000 || year > 2100) return null;
  const start = new Date(Date.UTC(year, month, 1));
  const end = new Date(Date.UTC(year, month + 1, 0));
  return {
    label: `${INDONESIAN_MONTHS[month]![0]!.toLocaleUpperCase("id-ID")}${INDONESIAN_MONTHS[month]!.slice(1)} ${year}`,
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  };
}

/** Ambil timestamp YYYYMMDDHHmmss yang tertanam di akhir nama campaign TikTok. */
export function parseCampaignTimestamp(value: string): string | null {
  const match = value.match(/(?:^|_)(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/);
  if (!match) return null;
  const [year, month, day, hour, minute, second] = match.slice(1).map(Number);
  const date = new Date(Date.UTC(year!, month! - 1, day!, hour!, minute!, second!));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month! - 1 || date.getUTCDate() !== day) return null;
  return `${date.toISOString().slice(0, 10)} ${date.toISOString().slice(11, 19)}`;
}

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
  const numeric = Number(raw);
  if (/^\d+(?:\.\d+)?$/.test(raw) && Number.isFinite(numeric) && numeric >= 1 && numeric <= 100000) {
    const date = new Date(Date.UTC(1899, 11, 30) + Math.floor(numeric) * 86_400_000);
    return date.toISOString().slice(0, 10);
  }
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
  const normalized = digits.startsWith("0") ? `62${digits.slice(1)}` : digits.startsWith("8") ? `62${digits}` : digits;
  return normalized.length >= 10 && normalized.length <= 15 ? normalized : null;
}
