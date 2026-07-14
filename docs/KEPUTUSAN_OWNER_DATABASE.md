# Keputusan Owner — Database Probetes ERP (Ronde 2)

Dicatat: 14 Juli 2026. Sumber: jawaban owner atas 50 pertanyaan keputusan database.
Melengkapi ronde-1 di `data_migrasi/output/KEPUTUSAN_OWNER.md` (17 item).
**Prinsip owner tetap: data lama tidak dihapus, keputusan bisa dikoreksi kemudian.**

**Legenda status:**
- ✅ **Diputuskan** — jelas, bisa diterapkan (saat mekanismenya siap).
- 🔶 **Tanya [nama]** — menunggu konfirmasi orang tertentu.
- ⬜ **Belum dijawab** — owner belum mengisi, perlu dilengkapi.
- 📌 **Info** — penjelasan/konteks, bukan aksi langsung.

---

## RINGKAS: yang harus ditanyakan ke orang lain

| Ke | Soal | No |
|---|---|---|
| **Puspita** | Transaksi dobel 11x (salah input vs beli banyak); arti kode ID pesan 2026; rumus Total Bayar; Fee COD dipotong/ditagih; 28 trx tanpa identitas | 14, 31, 38, 39, 49 |
| **Icha** | Metode pembuatan Customer ID (khususnya marketplace tanpa HP) | 30 |
| **Upi (SPV Sales)** | Definisi cluster pelanggan lengkap | 8 |
| **Dimas** | Algoritma RFM 3-digit (segmentasi 001–999) yang pernah dibuat owner+Dimas | 9 |

---

## Bagian 1 — Data di Menu Database

| No | Keputusan Owner | Status | Dampak untuk ERP |
|---|---|---|---|
| 1 | RFM & Cohort **dipindah ke bagian Marketing/CRM** (bukan di Database) | ✅ | Sesuai PRD: RFM & Cohort di menu CRM. Database fokus data acuan. |
| 2 | Kolom tanggal beli di tabel Pelanggan | ⬜ Belum dijawab | — |
| 3 | Aturan tampil No HP | ⬜ Belum dijawab (catatan: keputusan lama = **tampil penuh tanpa masking**) | Ikuti keputusan lama sampai ada perubahan. |
| 4 | Alamat lengkap di tabel Pelanggan | ⬜ Belum dijawab | Sementara: kota di tabel, alamat di detail. |
| 5 | Nilai uang boleh dilihat semua karyawan | ⬜ Belum dijawab | Terkait IAM (Fase 10). |
| 6 | **Angka resmi = Data Pesanan** (bukan Cohort). Syarat: **merging harus benar — satukan transaksi dengan No HP sama dalam 1 hari walau SKU beda.** | ✅ **Penting** | Aturan migrasi inti. Selaras dengan bundling (no.15) & round-1 #15. |

## Bagian 2 — Database Cohort

| No | Keputusan Owner | Status | Dampak |
|---|---|---|---|
| 7 | Cara hitung cohort | 📌 "sudah dijelaskan lisan tadi siang" | Rujuk penjelasan cohort owner (lihat memory cluster). |
| 8 | **Cluster: pakai versi LENGKAP** — definisinya dari **Upi (SPV Sales)** | 🔶 Tanya Upi | Jangan pakai 3-cluster sementara; tunggu definisi lengkap Upi. |
| 9 | **High Value bukan sekadar ≥Rp5jt.** Pakai **RFM 3-digit**: skor R,F,M masing-masing 1 digit (001–999), tiap kombinasi punya segmen. Pernah dibuat owner + **Dimas** (algoritma rumit). | 🔶 Tanya Dimas | Ganti pendekatan segmentasi ke RFM 3-digit. Ambil algoritma dari Dimas. |
| 10 | Batas "Lama Tidak Beli" | ⬜ Belum dijawab | — |
| 11 | **WA Grup: dilisting manual oleh CS.** Perlu mekanisme: **impor spreadsheet nomor grup → cocokkan dengan DB by No HP → nomor yang beririsan diberi tag grup WA.** | ✅ **Fitur baru** | Butuh fitur matching spreadsheet↔DB (mirip strategi kontak QR). |
| 12 | Riwayat 2024 dipakai di cohort | ⬜ Belum dijawab | — |

## Bagian 3 — Data Duplikat (PALING PENTING)

| No | Keputusan Owner | Status | Dampak |
|---|---|---|---|
| 13 | Gabung pelanggan dobel (410 nomor 1 HP banyak nama) | ⬜ Belum dicentang — **tapi sangat implied "ya"** (lihat no.6, 28, 29) | Konfirmasi cepat; ini misi inti. |
| 14 | Transaksi dobel persis (Khoirul Huda 11×, 209 kasus) | 🔶 **Tanya Puspita** — "50:50 salah input vs memang beli sebanyak itu" | Jangan diputuskan sepihak; konsul Puspita. |
| 15 | 1 ID pesan multi-produk = 1 pesanan (1.691 ID) | ✅ (sudah diputuskan round-1 #15: **digabung** jadi 1 pesanan multi-item) | Sudah diterapkan di migrasi. |
| 16 | Total belanja pakai Pesanan/Cohort/gabung | ⬜ Belum dijawab (tapi no.6 → **Pesanan sebagai acuan**) | Ikuti no.6. |
| 17 | Catatan mirip beda harga/qty | ⬜ Belum dijawab | Sementara: tandai perlu dicek. |

## Bagian 4 — Arti Nama Produk (S/Tk tetap dipisah)

| No | Keputusan Owner | Status | Dampak |
|---|---|---|---|
| 18 | Arti 'S' (S Amandia dst) | ⬜ Belum dijawab | — |
| 19 | Arti 'Tk' | ⬜ Belum dijawab | Round-1: tetap dipisah. |
| 20 | **Akhiran 'PB' = Personal Branding** (link profil pribadi owner) | ✅ 📌 | Bukan Probetes/bundling. |
| 21 | Ebook 90v2 vs Ebook 90 | ⬜ Belum dijawab | — |
| 22 | **GM, GMB, NEU20 → HAPUS** ("gw aja ga tahu, delete aja") | ✅ | Keluarkan dari master produk (arsip, tak dihapus fisik). Update KEPUTUSAN_KUALITAS_DATA. |
| 23 | **'HP COD' = Herbal Probetes payment COD.** Satukan ke **Herbal Probetes 24**, TAPI tiap transaksi diberi **tag COD/TF**. | ✅ **Penting** | Merge produk + tambah penanda metode bayar per transaksi. |
| 24 | **'Pro Herbal Dummy' = barang kirim ke affiliator, BUKAN sales** — kemungkinan data pengiriman/resi | ✅ | Keluarkan dari laporan penjualan; perlakukan sebagai pengiriman. |
| 25 | **Kategori produk resmi:** Herbal · Makanan · Minyak Balur · Edukasi · Device · Event · Jasa | ✅ **Penting** | Ganti skema kategori lama (digital/hp_amandia/fisik_lain) ke daftar ini. |

## Bagian 5 — Produk Bonus

| No | Keputusan Owner | Status | Dampak |
|---|---|---|---|
| 26 | Semua bonus digabung ke produk inti + **mengurangi stok, TAPI tidak dihitung sebagai barang terjual** | ✅ **Penting** | Bonus: stok berkurang, omzet/qty terjual tidak bertambah. |
| 27 | Cara hitung nilai bonus | ⬜ Belum dijawab (implied no.26: nambah barang keluar, tidak nambah omzet) | Ikuti no.26. |

## Bagian 6 — Temuan Analisis Data

| No | Keputusan Owner | Status | Dampak |
|---|---|---|---|
| 28 | Tanpa No HP dari marketplace → **buat Customer ID** (metode yang sudah dibahas) | ✅ | Marketplace tanpa HP tetap dapat Customer ID. |
| 29 | Gabung pelanggan marketplace tanpa HP (nama+pola sama) | ⬜ Belum dijawab | Terkait no.28/30. |
| 30 | Metode Customer ID / username marketplace | 🔶 **Tanya Icha** | Cara bikin Customer ID marketplace ikut Icha. |
| 31 | Arti kode ID pesan 2026 (TIKBKREM…, MPSH…) | 🔶 **Tanya Puspita** | — |
| 32 | ERP bikin ID pesan baru seragam | ⬜ Belum dijawab (disarankan: ya) | — |
| 33 | idgrup = Telegram | 🔶 Tidak tahu | Perlu ditelusuri (2 grup: -100226… & -100232…). |
| 34 | Memo NC=New Customer, RO=Repeat Order | ⬜ Belum dijawab | — |
| 35 | Kalau ERP beda dengan memo lama, percaya mana | ⬜ Belum dijawab | — |
| 36 | Kolom kosong total: buang/siapkan | ⬜ "belum ngerti pertanyaan" | Perlu dijelaskan ulang ke owner. |
| 37 | **BiayaMarketingCRM** = broadcast via **Mekari Qontak** + diskon/subsidi ongkir, dll | 📌 Info | Masuk Finance (biaya). |
| 38 | Rumus Total Bayar | 🔶 **Tanya Puspita** | — |
| 39 | Fee COD dipotong/ditagih | 🔶 **Tanya Puspita** | — |
| 40 | **Status pesanan = otomatis dari sistem tracking** (cek resi), CS jangan diganggu lagi | ✅ | Status dari tracking, bukan input CS. |
| 41 | **Pembayaran cukup: COD & TF** (transfer) | ✅ | Tidak perlu rinci 30 varian bank. |
| 42 | **UP DM = nama perusahaan sebelum Probetes** (20.928 order) | 📌 Info | Perlakukan sebagai internal/pendahulu, bukan mitra luar. |
| 43 | Data 2026: tarik ulang berkala / cut-off | ⬜ Belum dijawab | Terkait staging (Fase 3). |

## Bagian 7 — Pertanyaan Rancu Lainnya

| No | Keputusan Owner | Status | Dampak |
|---|---|---|---|
| 44 | Channel 'MP' marketplace apa | ⬜ Belum dijawab | Sementara: "Marketplace Lain". |
| 45 | Nama CS mirip (FIA/FIAN, Elin/Erlin, dll) | ⬜ Belum dijawab | Sementara: tetap terpisah/review. |
| 46 | Wahyu CS + ADV | ⬜ Belum dijawab | — |
| 47 | HUB JKT/MKS/JOG = gudang | ⬜ Belum dijawab (indikasi: ya, + Yogya gudang aktif) | Relevan Fase 8 (warehouse). |
| 48 | SKU final ikut gudang mana | ⬜ Belum dijawab | Relevan Fase 8 (F8-02). |
| 49 | 28 order tanpa nama & HP | 🔶 **Tanya Puspita** | Konfirmasi dulu. |
| 50 | Kolom HP berisi 2 nomor | ⬜ Belum dijawab | Sementara: pakai nomor pertama, kedua cadangan. |

---

## Yang SUDAH bisa diterapkan (begitu diminta)

Keputusan jelas yang tinggal dieksekusi (lewat pipeline / Fase 2):
1. **Kategori produk baru** (no.25): Herbal, Makanan, Minyak Balur, Edukasi, Device, Event, Jasa.
2. **Hapus GM/GMB/NEU20** dari master produk (no.22).
3. **HP COD → merge ke Herbal Probetes 24** + tag COD/TF per transaksi (no.23).
4. **Pro Herbal Dummy → keluarkan dari sales** (data pengiriman ke affiliator) (no.24).
5. **Pembayaran → COD & TF saja** (no.41).
6. **Status pesanan → dari tracking**, bukan input CS (no.40).
7. **Bonus → kurangi stok, tidak dihitung terjual** (no.26).
8. **Angka resmi = Data Pesanan**, dengan merge No HP sama + 1 hari walau SKU beda (no.6).

## Yang menunggu orang lain (blokir)

Tanya **Puspita** (14, 31, 38, 39, 49), **Icha** (30), **Upi** (8), **Dimas** (9). Bagian 3 (duplikat) —
prioritas owner — sebagian besar **menunggu Puspita**, jadi belum bisa difinalkan.

## Yang perlu owner lengkapi (belum dijawab)

2, 4, 5, 10, 12, 13*, 16*, 17, 18, 19, 21, 27*, 29, 32, 34, 35, 36, 43, 44, 45, 46, 47, 48, 50.
(*ada arah kuat dari jawaban lain.)
