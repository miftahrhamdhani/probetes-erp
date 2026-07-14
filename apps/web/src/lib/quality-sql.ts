// Rumus kualitas data pelanggan — SATU definisi untuk semua halaman.
// Dipakai oleh /api/database/summary dan /api/data-quality supaya angka
// "No HP tidak normal", "Nama bermasalah", dan "Kota belum terbaca" selalu
// sama antara halaman Ringkasan Data dan halaman Kualitas Data.
// Semua fragmen mengacu ke kolom tabel master.customers (tanpa alias).

/** Nomor telepon terbaik yang tersedia: phone_normalized, fallback ke phone mentah. */
export const HP_RAW = `COALESCE(NULLIF(phone_normalized, ''), NULLIF(phone, ''), '')`;

/** Nomor telepon setelah dibuang semua karakter selain angka. */
export const HP_DIGITS = `regexp_replace(${HP_RAW}, '[^0-9]', '', 'g')`;

/** Pelanggan yang punya nomor telepon (apa pun bentuknya). */
export const HP_ADA = `${HP_RAW} <> ''`;

/** Nomor ada tapi formatnya salah (bukan 62 + 8..13 digit). */
export const HP_TIDAK_NORMAL_WHERE = `${HP_ADA} AND ${HP_DIGITS} !~ '^62[0-9]{8,13}$'`;

/** Nama pelanggan yang BENAR bermasalah: kosong, satu huruf, hasil error import,
 *  atau tidak mengandung huruf sama sekali (mis. hanya angka/simbol).
 *  Nama pendek yang wajar (tia, Ali, Lia, Amy) TIDAK dihitung masalah. */
export const NAMA_BERMASALAH_WHERE = `name IS NULL OR trim(name) = '' OR length(trim(name)) <= 1 OR upper(name) LIKE '%ERROR%' OR trim(name) !~ '[A-Za-z]'`;

/** Punya alamat tapi kolom kota belum terisi. */
export const KOTA_KOSONG_WHERE = `NULLIF(address, '') IS NOT NULL AND NULLIF(city, '') IS NULL`;
