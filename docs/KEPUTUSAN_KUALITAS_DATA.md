# Kualitas Data — Yang Butuh Keputusan Owner

Dibuat: 14 Juli 2026. Hasil pembersihan kualitas data batch pertama.

Dokumen ini mencatat sisa isu kualitas data yang **tidak bisa diperbaiki otomatis**
karena butuh keputusan manusia. Yang sudah bisa dibereskan otomatis sudah dikerjakan
(lihat bagian "Sudah Dibereskan").

> **Update 14 Jul (ronde-2):** sebagian sudah dijawab owner di `docs/KEPUTUSAN_OWNER_DATABASE.md`:
> - Kategori produk resmi: **Herbal · Makanan · Minyak Balur · Edukasi · Device · Event · Jasa** (no.25).
> - **GM, GMB, NEU20 → hapus** (no.22).
> - **Pro Herbal Dummy → keluarkan dari sales** (barang kirim ke affiliator) (no.24).
> - HP COD (isu terpisah) → **gabung ke Herbal Probetes 24** + tag COD/TF (no.23).
> Sisanya (12 HP, 3 nama) belum — masih menunggu Fase 2 / cek CS.

---

## Sudah Dibereskan Otomatis (tidak perlu keputusan)

| Isu | Sebelum | Sesudah | Cara |
|---|---|---|---|
| Nama "bermasalah" (false positive) | 35 | 3 | Aturan detektor diperbaiki: nama pendek asli (tia, Ali, Lia) tidak lagi dianggap masalah. Hanya nama kosong / 1 huruf / `#ERROR!` yang dihitung. |
| Kota kosong (ada alamat) | 310 | 256 | 54 kota dipulihkan dari format alamat marketplace ("…, Bekasi City, West Java, Indonesia") + pola "Kabupaten/Kota X". Presisi tinggi (hanya isi yang kosong, tidak menimpa). |

Sisa di bawah ini **butuh Bapak/Ibu putuskan.**

---

## A. Produk Belum Berkategori (9) — perlu keputusan kategori

Kategori dipakai untuk RFM/cluster. Pilihan kategori: `digital` / `hp_amandia` / `fisik_lain`
(atau kategori baru bila perlu).

| ID | Nama Produk | Qty | Dugaan | Kategori? |
|---|---|---|---|---|
| PRD-019 | GOMILK 200 | 204 | produk lain (susu) | __________ |
| PRD-078 | NEU20 | 35 | kode belum jelas | __________ |
| PRD-079 | GM | 60 | kode belum jelas | __________ |
| PRD-090 | GMB | 3 | kode belum jelas | __________ |
| PRD-081 | Tas Probetes | 38 | merchandise/non-jualan? | __________ |
| PRD-009 | ETAWALIN | 23 | produk lain (herbal) | __________ |
| PRD-011 | ETAWAKU | 6 | produk lain (herbal) | __________ |
| PRD-092 | Paket Apresiasi Remisi | 2 | paket/bonus? | __________ |
| PRD-010 | Eka Farm | 1 | nama toko/mitra? | __________ |

> Catatan: GM, GMB, NEU20 memang sudah ditandai "tunggu owner" di keputusan sebelumnya.

## B. Produk Perlu Direview (1)

| ID | Nama | Nama Asli | Keputusan? |
|---|---|---|---|
| PRD-087 | Pro Herbal | **Pro Herbal Dummy** | Hapus (data dummy) / Gabung ke produk mana / Biarkan? |

## C. Nomor HP Tidak Normal (12) — perlu dicek/perbaiki manual

Nomor ada tapi format salah (bukan 62 + 8–13 digit). Berisiko kalau ditebak otomatis,
jadi diserahkan ke tim CS untuk cek ke sumber.

| ID | Nama | Nomor Tersimpan | Masalah | Trx |
|---|---|---|---|---|
| PB-CUST-21090 | Ibu Nur Fatmawati | 6382223643115 | prefiks 638 (bukan 628) | 1 |
| PB-CUST-2268 | Kak Anugrah Kusuma | 6387774690006 | prefiks 638 | 1 |
| PB-CUST-9256 | Ibu Adelia Safitri | 6381241528515 | prefiks 638 | 1 |
| PB-CUST-18559 | Ida Bagus | 281809824323 | tidak diawali 62 | 1 |
| PB-CUST-21257 | Ibu Anie Bakery | 638872628001 | prefiks 638 | 1 |
| PB-CUST-6280 | Ibu Yanida Gulo | 685274696376 | prefiks 685 | 1 |
| PB-CUST-6774 | Siti Nur Elisa | 682264416933 | prefiks 682 (cek) | 1 |
| PB-CUST-10885 | Ibu Nung Tirta | 64210611678 | prefiks 642 | 1 |
| PB-CUST-11618 | Kak Tony | 97433362273 | bukan nomor Indonesia | 1 |
| PB-CUST-12541 | Bpk Mardian Rico | 60193254279 | prefiks 601 (Malaysia?) | 2 |
| PB-CUST-20186 | Ibu Silvia | `Ibu Silvia` | nama masuk kolom HP | 1 |
| PB-CUST-21599 | #ERROR! | `#ERROR!` | error import | 2 |

**Keputusan yang diperlukan:** untuk tiap baris — perbaiki nomornya (cek chat/order), biarkan
tanpa HP, atau hapus? (2 baris terakhir jelas rusak: nama & #ERROR! di kolom HP.)

## D. Nama Pelanggan Rusak (3)

| ID | Nama | Trx | Keputusan? |
|---|---|---|---|
| PB-CUST-1427 | (kosong) | 1 | Isi dari order / biarkan? |
| PB-CUST-20073 | m | 1 | Nama sebenarnya? |
| PB-CUST-21599 | #ERROR! | 2 | Perbaiki / hapus (juga HP rusak — lihat C) |

## E. Kota Masih Kosong (256) — informasi, umumnya tak bisa dipaksa

256 pelanggan punya alamat tapi kotanya **tidak tertulis jelas** di teks alamat
(mis. "jl. agusalim" tanpa kota). Ini **bukan error** — sumbernya memang tidak lengkap.
Opsi: biarkan (kota tidak wajib), atau lengkapi manual saat CS follow-up (butuh Fase 2 — edit dari aplikasi).

---

## Cara Menerapkan Keputusan (nanti)

Saat ini Data Utama masih **read-only** (belum bisa edit dari aplikasi). Keputusan di atas
bisa diterapkan lewat salah satu dari:
1. **Fase 2 (API tulis)** — edit/hapus/gabung langsung dari UI. (Direkomendasikan.)
2. **File koreksi terkurasi** di pipeline (untuk perbaikan massal produk/kategori), lalu reload.

Isi keputusan di kolom kosong dokumen ini, lalu beri tahu saya untuk menerapkannya.
