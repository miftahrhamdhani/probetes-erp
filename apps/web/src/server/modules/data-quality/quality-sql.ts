// Rumus kualitas data pelanggan — SATU definisi dipakai lintas halaman.
// Sumber tetap di src/lib/quality-sql.ts agar tidak duplikat; modul ini re-export.
export {
  HP_RAW,
  HP_DIGITS,
  HP_ADA,
  HP_TIDAK_NORMAL_WHERE,
  NAMA_BERMASALAH_WHERE,
  KOTA_KOSONG_WHERE,
} from "@/lib/quality-sql";
