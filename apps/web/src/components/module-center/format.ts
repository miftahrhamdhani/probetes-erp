/** Format angka rupiah dasar — dipakai di menu center non-Database/Marketing. */
export const formatRupiah = (value: number) => `Rp${value.toLocaleString("id-ID")}`;
