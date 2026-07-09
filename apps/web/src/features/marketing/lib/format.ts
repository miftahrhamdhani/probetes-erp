// Format angka lokal untuk modul Marketing (mandiri, tidak bergantung modul lain).

export const formatNumber = (n: number) => n.toLocaleString("id-ID");

export const formatRupiah = (n: number) => `Rp${n.toLocaleString("id-ID")}`;

/** Rp ringkas untuk kartu KPI: 1.250.000 -> "Rp1,25 jt", 32.000.000 -> "Rp32 jt". */
export const formatRupiahRingkas = (n: number) => {
  if (Math.abs(n) >= 1_000_000_000) return `Rp${(n / 1_000_000_000).toLocaleString("id-ID", { maximumFractionDigits: 2 })} M`;
  if (Math.abs(n) >= 1_000_000) return `Rp${(n / 1_000_000).toLocaleString("id-ID", { maximumFractionDigits: 2 })} jt`;
  if (Math.abs(n) >= 1_000) return `Rp${(n / 1_000).toLocaleString("id-ID", { maximumFractionDigits: 0 })} rb`;
  return `Rp${n.toLocaleString("id-ID")}`;
};

/** ROAS ditampilkan dengan 2 desimal + akhiran "x": 2.31 -> "2,31x". */
export const formatRoas = (n: number) => `${n.toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}x`;

export const formatPersen = (n: number, desimal = 0) =>
  `${n.toLocaleString("id-ID", { minimumFractionDigits: desimal, maximumFractionDigits: desimal })}%`;
