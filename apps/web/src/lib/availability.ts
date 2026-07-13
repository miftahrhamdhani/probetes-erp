/**
 * Status ketersediaan metric API Marketing — dipakai backend (route.ts) dan
 * frontend (badge/disabled card) supaya tidak ada angka palsu untuk data yang
 * belum ada di database (mis. ERP ROAS sebelum ada mapping campaign->order).
 */
export type AvailabilityStatus = "AVAILABLE" | "DERIVABLE" | "PARTIAL" | "NOT_AVAILABLE" | "NEED_MAPPING";

export interface AvailabilityEntry {
  status: AvailabilityStatus;
  reason: string | null;
}

export type AvailabilityMap = Record<string, AvailabilityEntry>;

export function available(reason: string | null = null): AvailabilityEntry {
  return { status: "AVAILABLE", reason };
}
export function derivable(reason: string): AvailabilityEntry {
  return { status: "DERIVABLE", reason };
}
export function partial(reason: string): AvailabilityEntry {
  return { status: "PARTIAL", reason };
}
export function notAvailable(reason: string): AvailabilityEntry {
  return { status: "NOT_AVAILABLE", reason };
}
export function needMapping(reason: string): AvailabilityEntry {
  return { status: "NEED_MAPPING", reason };
}

/** Bagi aman: hasil null (bukan NaN/Infinity) jika pembagi 0/null/undefined. */
export function safeDiv(numerator: number | null | undefined, denominator: number | null | undefined): number | null {
  const n = Number(numerator);
  const d = Number(denominator);
  if (!d || !Number.isFinite(n) || !Number.isFinite(d)) return null;
  return n / d;
}
