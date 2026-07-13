// Util format angka untuk modul CRM. Dipisah supaya konsisten dan gampang dites,
// mengikuti pola modul lain (cs-crm, sales-order, ads-roas).

/** 1.250.000 → "Rp1,25 jt"; 12.500 → "Rp12,5 rb". Untuk ringkasan kartu/KPI. */
export function formatRupiahRingkas(n: number): string {
  if (!Number.isFinite(n)) return "-";
  const abs = Math.abs(n);
  if (abs >= 1_000_000_000) return `Rp${(n / 1_000_000_000).toFixed(2).replace(".", ",")} M`;
  if (abs >= 1_000_000) return `Rp${(n / 1_000_000).toFixed(2).replace(".", ",")} jt`;
  if (abs >= 1_000) return `Rp${(n / 1_000).toFixed(1).replace(".", ",")} rb`;
  return `Rp${n}`;
}

/** 21603 → "21.603" (pemisah ribuan lokal). */
export function formatNumber(n: number): string {
  if (!Number.isFinite(n)) return "-";
  return n.toLocaleString("id-ID");
}

/** 12.34 → "12,3%". Nilai sudah dalam persen (0–100). */
export function formatPersen(n: number): string {
  if (!Number.isFinite(n)) return "-";
  return `${n.toFixed(1).replace(".", ",")}%`;
}

/** Bagi aman: kalau pembagi 0 → null (komponen menampilkan "-", bukan NaN/Infinity). */
export function safeDivide(a: number, b: number): number | null {
  if (!b) return null;
  const r = a / b;
  return Number.isFinite(r) ? r : null;
}
