// Format angka lokal untuk CS/CRM — mandiri, tidak bergantung modul lain.

export const formatNumber = (n: number) => (Number.isFinite(n) ? n.toLocaleString("id-ID") : "0");

export const formatRupiah = (n: number) => (Number.isFinite(n) ? `Rp${n.toLocaleString("id-ID")}` : "Rp0");

/** Rp ringkas: 1.250.000 -> "Rp1,25 jt". */
export const formatRupiahRingkas = (n: number) => {
  if (!Number.isFinite(n)) return "Rp0";
  const abs = Math.abs(n);
  if (abs >= 1_000_000_000) return `Rp${(n / 1_000_000_000).toLocaleString("id-ID", { maximumFractionDigits: 2 })} M`;
  if (abs >= 1_000_000) return `Rp${(n / 1_000_000).toLocaleString("id-ID", { maximumFractionDigits: 1 })} jt`;
  if (abs >= 1_000) return `Rp${(n / 1_000).toLocaleString("id-ID", { maximumFractionDigits: 0 })} rb`;
  return `Rp${n.toLocaleString("id-ID")}`;
};

export const formatPersen = (n: number, desimal = 1) =>
  Number.isFinite(n) ? `${n.toLocaleString("id-ID", { minimumFractionDigits: desimal, maximumFractionDigits: desimal })}%` : "-";

const BULAN_ID = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
export const formatBulanRingkas = (monthKey: string) => {
  const [y, m] = monthKey.split("-");
  const bulan = BULAN_ID[Number(m) - 1];
  return bulan ? `${bulan} ${y}` : monthKey;
};
