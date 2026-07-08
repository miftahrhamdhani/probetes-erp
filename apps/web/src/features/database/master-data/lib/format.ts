export const formatNumber = (n: number) => n.toLocaleString("id-ID");

export const formatRupiah = (n: number) => `Rp${n.toLocaleString("id-ID")}`;

const BULAN_ID = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

/** "2025-01-01" -> "1 Januari 2025". Nilai tak dikenal dikembalikan apa adanya. */
export const formatTanggalId = (isoDate: string) => {
  const parts = isoDate.split("-");
  if (parts.length !== 3) return isoDate;
  const [y, m, d] = parts;
  const bulan = BULAN_ID[Number(m) - 1];
  if (!bulan) return isoDate;
  return `${Number(d)} ${bulan} ${y}`;
};
