// Format angka lokal untuk Sales & Order — mandiri, tidak bergantung modul lain.

export const formatNumber = (n: number) => (Number.isFinite(n) ? n.toLocaleString("id-ID") : "0");

export const formatRupiah = (n: number) => (Number.isFinite(n) ? `Rp${n.toLocaleString("id-ID")}` : "Rp0");

/** Rp ringkas untuk kartu KPI/chart: 1.250.000 -> "Rp1,25 jt", 1.240.000.000 -> "Rp1,24 M". */
export const formatRupiahRingkas = (n: number) => {
  if (!Number.isFinite(n)) return "Rp0";
  const abs = Math.abs(n);
  if (abs >= 1_000_000_000) return `Rp${(n / 1_000_000_000).toLocaleString("id-ID", { maximumFractionDigits: 2 })} M`;
  if (abs >= 1_000_000) return `Rp${(n / 1_000_000).toLocaleString("id-ID", { maximumFractionDigits: 2 })} jt`;
  if (abs >= 1_000) return `Rp${(n / 1_000).toLocaleString("id-ID", { maximumFractionDigits: 0 })} rb`;
  return `Rp${n.toLocaleString("id-ID")}`;
};

export const formatPersen = (n: number, desimal = 1) =>
  Number.isFinite(n) ? `${n.toLocaleString("id-ID", { minimumFractionDigits: desimal, maximumFractionDigits: desimal })}%` : "-";

export const formatPersenPoin = (n: number, desimal = 1) => {
  const sign = n >= 0 ? "+" : "";
  return `${sign}${n.toLocaleString("id-ID", { minimumFractionDigits: desimal, maximumFractionDigits: desimal })} pp`;
};

/** Pembagian aman dari NaN/Infinity — 0 kalau pembagi 0. */
export const safeDiv = (numerator: number, denominator: number): number => (denominator > 0 ? numerator / denominator : 0);
export const safePct = (part: number, total: number): number => (total > 0 ? (part / total) * 100 : 0);
