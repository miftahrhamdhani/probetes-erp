// Format angka lokal untuk Iklan & ROAS — mandiri, tidak bergantung modul lain.

export const formatNumber = (n: number) => (Number.isFinite(n) ? n.toLocaleString("id-ID") : "0");

export const formatRupiah = (n: number) => (Number.isFinite(n) ? `Rp${n.toLocaleString("id-ID")}` : "Rp0");

/** Rp ringkas untuk KPI/chart: 1.250.000 -> "Rp1,25 jt". */
export const formatRupiahRingkas = (n: number) => {
  if (!Number.isFinite(n)) return "Rp0";
  const abs = Math.abs(n);
  if (abs >= 1_000_000_000) return `Rp${(n / 1_000_000_000).toLocaleString("id-ID", { maximumFractionDigits: 2 })} M`;
  if (abs >= 1_000_000) return `Rp${(n / 1_000_000).toLocaleString("id-ID", { maximumFractionDigits: 1 })} jt`;
  if (abs >= 1_000) return `Rp${(n / 1_000).toLocaleString("id-ID", { maximumFractionDigits: 0 })} rb`;
  return `Rp${n.toLocaleString("id-ID")}`;
};

/** ROAS: 3.98 -> "3,98x". "-" kalau spending 0 (dikirim via roasOrDash). */
export const formatRoas = (n: number) => `${n.toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}x`;
export const roasOrDash = (roas: number, spending: number) => (spending > 0 ? formatRoas(roas) : "-");
export const costPerOrderOrDash = (value: number, order: number) => (order > 0 ? formatRupiah(value) : "-");
export const closingRateOrDash = (value: number, leads: number) => (leads > 0 ? `${value.toLocaleString("id-ID", { maximumFractionDigits: 1 })}%` : "-");

export const formatPersen = (n: number, desimal = 1) =>
  Number.isFinite(n) ? `${n.toLocaleString("id-ID", { minimumFractionDigits: desimal, maximumFractionDigits: desimal })}%` : "-";
