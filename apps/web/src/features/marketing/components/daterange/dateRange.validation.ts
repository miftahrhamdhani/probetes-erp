import type { DateRangePresetKey, DateRangeValue } from "./dateRange.types";

const TZ = "Asia/Jakarta";
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Tanggal hari ini di Asia/Jakarta sebagai YYYY-MM-DD, lepas dari timezone browser/server. */
export function todayJakarta(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

function shiftDays(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function monthBounds(iso: string, monthOffset: number): DateRangeValue {
  const [y, m] = iso.split("-").map(Number);
  const first = new Date(Date.UTC(y!, m! - 1 + monthOffset, 1));
  const last = new Date(Date.UTC(y!, m! + monthOffset, 0));
  return { startDate: first.toISOString().slice(0, 10), endDate: last.toISOString().slice(0, 10) };
}

/** Hitung start/end untuk preset non-custom. Untuk "custom" kembalikan fallback (30 hari terakhir). */
export function resolvePreset(preset: DateRangePresetKey, fallback?: DateRangeValue): DateRangeValue {
  const today = todayJakarta();
  switch (preset) {
    case "today": return { startDate: today, endDate: today };
    case "yesterday": { const y = shiftDays(today, -1); return { startDate: y, endDate: y }; }
    case "last7": return { startDate: shiftDays(today, -6), endDate: today };
    case "last30": return { startDate: shiftDays(today, -29), endDate: today };
    case "thisMonth": return monthBounds(today, 0);
    case "lastMonth": return monthBounds(today, -1);
    case "thisYear": return { startDate: `${today.slice(0, 4)}-01-01`, endDate: today };
    case "custom":
    default:
      return fallback ?? { startDate: shiftDays(today, -29), endDate: today };
  }
}

export function isValidIsoDate(value: string | null | undefined): value is string {
  if (!value || !ISO_DATE.test(value)) return false;
  const d = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.getTime());
}

export interface DateRangeValidationResult {
  valid: boolean;
  error: string | null;
}

/** Validasi start_date/end_date wajib ada, format benar, dan start <= end. */
export function validateDateRange(startDate: string | null | undefined, endDate: string | null | undefined): DateRangeValidationResult {
  if (!isValidIsoDate(startDate)) return { valid: false, error: "Tanggal mulai wajib diisi dengan format YYYY-MM-DD." };
  if (!isValidIsoDate(endDate)) return { valid: false, error: "Tanggal selesai wajib diisi dengan format YYYY-MM-DD." };
  if (startDate > endDate) return { valid: false, error: "Tanggal mulai tidak boleh lebih besar dari tanggal selesai." };
  return { valid: true, error: null };
}

export function defaultDateRange(): DateRangeValue {
  return resolvePreset("last30");
}
