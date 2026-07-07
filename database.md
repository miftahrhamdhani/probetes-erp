# LAPORAN GAMBARAN DATABASE FINAL PROBETES ERP

Versi ringkas dengan contoh tabel agar mudah dipahami.

> **Catatan:** tabel di dokumen ini adalah gambaran awal. Data contoh masih dummy, tetapi mengikuti
> pola data Probetes seperti pelanggan, pesanan, produk, channel, CS, resi, COD, ongkir, dan cohort.
> Setelah database asli aktif, angka dan isi tabel bisa diganti dari data sebenarnya.
> Untuk kondisi data migrasi yang sudah dibuat, lihat **Lampiran B**.

---

## 1. Prinsip Besar Database Probetes ERP

**Yang ditampilkan di menu**
- Satu database ERP menjadi tempat penyimpanan semua data.
- Menu aplikasi tetap dipisah agar user tidak bingung.
- Master Data berisi data acuan: pelanggan, cohort, produk, channel, CS, ekspedisi.
- Data Tracking berisi pengecekan harian: resi, status kirim, COD, ongkir, retur.
- Finance cukup disiapkan dulu, belum perlu dibuat penuh sekarang.

**Alasan sederhana**
- Data tidak tercecer di banyak file.
- Tim kantor melihat menu sesuai pekerjaan masing-masing.
- Pelanggan lama tidak salah dianggap customer baru.
- Nomor resi dan COD tidak membuat Master Data terlalu penuh.
- Database masih bisa diedit dan ditambah saat modul berikutnya dibuat.

---

## 2. Peta Menu dan Tabel yang Akan Ditampilkan

| Area | Isi Utama | Contoh Data | Keterangan |
|---|---|---|---|
| Master Data | Pelanggan, Cohort, Produk, Channel, CS, Ekspedisi | 2.055 pelanggan, 41 produk perlu dirapikan | Data acuan utama |
| Pesanan | Order induk + item pesanan | ORD-000982, 42.390 order | Penghubung semua data |
| Data Tracking | Resi, status kirim, COD, ongkir, retur | JX123456789ID, COD belum cair | Untuk kerja harian |
| Gudang / Stok | Stok per produk per gudang, barang keluar/masuk | Gudang Jakarta & Makassar, kode PRB-xx | Data stok harian |
| Marketing | Import CSV marketplace dan performa channel | TikTok, Shopee, Meta, CRM | Untuk closing dan campaign |
| Finance | HPP, rekonsiliasi, uang masuk, margin | HPP, nilai rekonsiliasi | Dibuat setelah migrasi dasar |
| Reports | Laporan final owner/management | Sales, retur, COD, performa | Dihitung otomatis dari pesanan, tidak diinput ulang |

---

## 3. Master Data - Contoh Tabel

### 3.1 Tabel Pelanggan
| ID Cust | Nama | HP | Alamat Ringkas | Kota | Asal | Channel | CS | Transaksi | Status |
|---|---|---|---|---|---|---|---|---|---|
| PB-CUST-0001 | Siti A. | 0812****1234 | Jl. Melati | Bandung | Marketplace | TikTok | Rina | 3 | Repeat |
| PB-CUST-0002 | Budi S. | 0857****8821 | Jl. Kenanga | Jakarta | CS | WhatsApp | Dini | 1 | Baru |
| PB-CUST-0003 | Mira K. | 0821****1190 | Perum Griya | Surabaya | CRM | CRM | Fajar | 5 | Lama |

### 3.2 Tabel Database Cohort - Ringkasan Customer
| ID Cust | Nama | Cohort | Beli Awal | Beli Akhir | Qty | Total Beli | Produk Akhir | CS Akhir | Cluster |
|---|---|---|---|---|---|---|---|---|---|
| PB-CUST-0018 | Ani R. | Jan 2026 | 03 Jan | 18 Jun | 7 | Rp2.450.000 | Probetes | Nia | Repeat |
| PB-CUST-0074 | Rudi H. | Mar 2026 | 12 Mar | 12 Mar | 1 | Rp350.000 | Ebook 145 | Fajar | Baru |
| PB-CUST-0112 | Lina P. | Nov 2025 | 02 Nov | 07 Jun | 12 | Rp4.850.000 | Amandia | Rina | High Value |

### 3.3 Tabel Database Cohort - Riwayat Transaksi
| Tanggal | ID Cust | Nama | CS CRM | Produk | Qty | Total Harga | Cohort | Status |
|---|---|---|---|---|---|---|---|---|
| 18 Jun 2026 | PB-CUST-0018 | Ani R. | Nia | Probetes Herbal | 2 | Rp700.000 | Jan 2026 | Valid |
| 12 Mar 2026 | PB-CUST-0074 | Rudi H. | Fajar | Ebook 145 | 1 | Rp350.000 | Mar 2026 | Valid |
| 07 Jun 2026 | PB-CUST-0112 | Lina P. | Rina | Amandia | 3 | Rp1.050.000 | Nov 2025 | Valid |

### 3.4 Tabel Produk
| ID Produk | Produk Final | SKU | Nama Asli dari Data | Kategori | Qty | Nilai | Status |
|---|---|---|---|---|---|---|---|
| PRD-001 | Probetes Herbal | SKU-PH | Probetes / S Probetes / TK Probetes | Herbal | 145 | Rp15.250.000 | Review |
| PRD-002 | Ebook 145 | SKU-EB145 | Ebook 145 | Digital | 78 | Rp6.880.000 | Valid |
| PRD-003 | Amandia | SKU-AMD | Amandia / S Amandia | Herbal | 70 | Rp5.320.000 | Review |

### 3.5 Tabel Channel
| ID Channel | Channel Final | Jenis | Nama Asli | Platform | Pesanan | Nilai | Status |
|---|---|---|---|---|---|---|---|
| CH-001 | TikTok Shop | Marketplace | Tiktok / TIKTOK / Tiktok MP | TikTok | 820 | Rp98.500.000 | Review |
| CH-002 | Shopee | Marketplace | Shopee / S | Shopee | 640 | Rp76.200.000 | Aktif |
| CH-003 | Meta | Iklan/CS | Meta / META / Facebook | Meta | 540 | Rp65.700.000 | Review |

### 3.6 Tabel CS / Tim
| ID User | Nama | Role | Divisi | Channel | Customer | Pesanan | Nilai | Status |
|---|---|---|---|---|---|---|---|---|
| USR-001 | Rina | CS | CS WA | WhatsApp | 120 | 180 | Rp24.500.000 | Aktif |
| USR-002 | Fajar | CRM | CRM | WhatsApp | 95 | 140 | Rp19.800.000 | Aktif |
| USR-003 | Dini | ADV | Meta Ads | Meta | 80 | 115 | Rp17.250.000 | Review |

### 3.7 Tabel Ekspedisi
| ID Eksp | Ekspedisi Final | Nama Asli | Layanan | Pesanan | Resi | Status |
|---|---|---|---|---|---|---|
| EXP-001 | J&T | JNT / J&T | Reguler | 320 | 280 | Aktif |
| EXP-002 | SiCepat | Sicepat / SiCepat | Reguler | 210 | 190 | Aktif |
| EXP-003 | SAP Logistic | SAP / SAP Logistic | COD | 160 | 120 | Review |

### 3.8 Tabel Pesanan (Order)

Pesanan adalah **penghubung utama** semua data: pelanggan, produk, tracking, dan finance semuanya
tersambung lewat ID Order. Tanpa tabel ini, resi/COD/finance tidak punya induk.

| ID Order | Tanggal | ID Cust | Nama | Channel | CS | Kurir | Metode | Total Bayar | Status |
|---|---|---|---|---|---|---|---|---|---|
| ORD-000982 | 03 Jun 2026 | PB-CUST-0001 | Siti A. | TikTok Shop | Rina | J&T | COD | Rp368.000 | Dikirim |
| ORD-001104 | 05 Jun 2026 | PB-CUST-0002 | Budi S. | Shopee | Dini | Shopee Xpress | Non-COD | Rp350.000 | Selesai |
| ORD-001188 | 06 Jun 2026 | PB-CUST-0003 | Mira K. | Meta | Fajar | SAP | COD | Rp372.000 | Gagal kirim |

### 3.9 Tabel Item Pesanan

Menyimpan produk di dalam tiap pesanan. Nama asli produk dari file lama **tetap disimpan** agar bisa
diaudit dan tidak hilang saat mapping ke produk final.

| ID Item | ID Order | Produk Final | Nama Asli dari Data | Qty | Harga Satuan | Subtotal | Status |
|---|---|---|---|---|---|---|---|
| ORD-000982-1 | ORD-000982 | Probetes Herbal | S Probetes | 2 | Rp175.000 | Rp350.000 | Review |
| ORD-001104-1 | ORD-001104 | Ebook 145 | Ebook 145 | 1 | Rp350.000 | Rp350.000 | Valid |
| ORD-001188-1 | ORD-001188 | Amandia | Amandia 7 | 3 | Rp116.000 | Rp348.000 | Review |

---

## 4. Data Tracking - Contoh Tabel

**Kenapa Data Tracking dipisah?** Karena resi, COD, ongkir, retur, dan gagal kirim adalah pekerjaan
harian. Jika dimasukkan ke Master Data, halaman database akan terlalu penuh. Datanya tetap tersimpan
di database yang sama, tetapi user membukanya lewat menu Data Tracking.

### 4.1 Tabel Cek Resi dan Status Pengiriman
| ID Order | Resi | Customer | Alamat Kirim | Ekspedisi | Status Paket | Bayar | Ongkir | COD | Retur |
|---|---|---|---|---|---|---|---|---|---|
| ORD-000982 | JX123456789ID | Siti A. | Bandung | J&T | Dalam kirim | COD | Rp18.000 | Belum cair | Tidak |
| ORD-001104 | SPX987654321ID | Budi S. | Jakarta | Shopee Xpress | Terkirim | Non-COD | Rp12.000 | - | Tidak |
| ORD-001188 | SAP556677889 | Mira K. | Surabaya | SAP | Gagal kirim | COD | Rp22.000 | Belum cair | Proses |

### 4.2 Tabel COD dan Pembayaran
| ID Order | Metode | Total Bayar | Ongkir | Packing | Fee COD | Status COD | Tgl Cair | Status Cek |
|---|---|---|---|---|---|---|---|---|
| ORD-000982 | COD | Rp368.000 | Rp18.000 | Rp2.000 | Rp5.000 | Belum cair | - | Cek |
| ORD-001104 | Non-COD | Rp350.000 | Rp12.000 | Rp2.000 | - | - | - | Valid |
| ORD-001188 | COD | Rp372.000 | Rp22.000 | Rp2.000 | Rp5.000 | Belum cair | - | Follow-up |

### 4.3 Tabel Retur dan Gagal Kirim
| ID Order | Resi | Customer | Kota | Masalah | Alasan | CS | Follow-up | Status |
|---|---|---|---|---|---|---|---|---|
| ORD-001188 | SAP556677889 | Mira K. | Surabaya | Gagal Kirim | Alamat kurang lengkap | Fajar | Hubungi customer | Proses |
| ORD-001220 | JNE99887766 | Ani R. | Bekasi | Retur | Customer tidak respon | Nia | Kirim WA | Follow-up |
| ORD-001333 | JX112233445 | Lina P. | Bandung | Retur | Paket ditolak | Rina | Cek ulang order | Proses |

---

## 5. Gudang / Stok - Contoh Tabel

Stok gudang dibuat sebagai **tabel sendiri** (1 baris = 1 produk per gudang), tersambung ke Master
Produk lewat ID Produk. Temuan penting dari data nyata: **SKU gudang berbeda per gudang** untuk
produk yang sama (contoh: Herbal Probetes = `PRB-14` di Jakarta tetapi `PRB-01` di Makassar). Karena
itu SKU gudang disimpan sebagai **kode lokal gudang**, bukan kode produk final. Barang non-jualan
(brosur, amplop, kartu ucapan) tetap tercatat di stok tetapi tidak masuk daftar produk penjualan.

| Gudang | Produk | SKU Gudang | Stok | Resi Keluar | Pcs Keluar | ID Produk Master | Status |
|---|---|---|---|---|---|---|---|
| Jakarta | Probetes Oil | PRB-24 | 94 | 59 | 86 | PRD-059 | Valid |
| Makassar | Probetes Oil | PRB-02 | 380 | 6 | 102 | PRD-059 | Valid |
| Jakarta | Herbal Probetes | PRB-14 | 1.679 | 106 | 2.031 | - | Review |

---

## 6. Finance dan Laporan Lain

Finance belum perlu dibuat penuh sekarang. Yang penting saat migrasi awal, data uang seperti HPP,
total bayar, ongkir, fee COD, dan rekonsiliasi jangan dibuang. Simpan dulu agar nanti Finance bisa
dibuat tanpa mengulang dari awal.

> **Catatan Reports:** laporan (sales, performa CS/channel, retur, leads/closing seperti di file
> laporan karyawan) **tidak disimpan sebagai tabel input terpisah** — semuanya **dihitung otomatis**
> dari tabel Pesanan dan Tracking. Dengan begitu laporan selalu sinkron dengan data transaksi dan
> tidak muncul sumber "data beda versi" baru.

### 6.1 Tabel Finance - Disiapkan Dulu
| ID Order | Invoice | Total Bayar | HPP | Ongkir | Fee COD | Nilai Cair | Status Rekon | Catatan |
|---|---|---|---|---|---|---|---|---|
| ORD-000982 | INV-202606-001 | Rp368.000 | Rp120.000 | Rp18.000 | Rp5.000 | Belum cair | Belum | Menunggu COD |
| ORD-001104 | INV-202606-002 | Rp350.000 | Rp115.000 | Rp12.000 | - | Rp350.000 | Cocok | Non-COD |
| ORD-001188 | INV-202606-003 | Rp372.000 | Rp120.000 | Rp22.000 | Rp5.000 | Belum cair | Cek | Gagal kirim |

### 6.2 Tabel Kualitas Data - Agar Tidak Ada yang Miss
| Area | Data Dicek | Contoh Masalah | Status | Aksi |
|---|---|---|---|---|
| Pelanggan | HP & alamat | Nomor berubah, alamat kosong | Cek | Gabung customer jika sama |
| Cohort | Customer lama | Transaksi lama dianggap baru | Cek | Pakai ID Customer otomatis |
| Produk | Nama produk | S Probetes dan Probetes terpisah | Review | Mapping ke produk final |
| Tracking | Resi & ongkir | Resi sama, ongkir beda | Cek | Validasi dengan file marketplace |
| Finance | HPP & rekonsiliasi | COD belum cair | Nanti | Disiapkan dulu |

---

## 7. Keputusan Sementara sebelum acc

- Migrasi awal sebaiknya fokus pada database dasar dulu: pelanggan, cohort, produk, channel, CS,
  ekspedisi, pesanan, dan tracking.
- Data Tracking perlu dibuat sebagai menu terpisah, tetapi datanya tetap tersimpan di database ERP
  yang sama.
- Finance belum perlu dibuat penuh sekarang. Cukup siapkan kolom datanya agar nanti bisa dikembangkan.
- Database masih bisa diedit dan ditambah setelah sistem berjalan. Jadi tidak perlu menunggu semua
  modul sempurna dari awal.
- Prioritas paling penting adalah mencegah customer lama terbaca sebagai customer baru, menjaga
  alamat/nomor HP, dan memastikan data transaksi tidak dobel.

---

## 8. Opsi Migrasi

| Opsi | Penjelasan | Status Rekomendasi |
|---|---|---|
| **Opsi 1: Migrasi langsung semua data** | Cepat, tetapi berisiko tinggi | Tidak disarankan untuk tahap awal |
| **Opsi 2: Migrasi bertahap per bagian** | Lebih aman dan mudah dikontrol | Disarankan untuk Probetes |
| **Opsi 3: Tempat penampungan data sementara** | Paling aman untuk data belum rapi | Sangat disarankan untuk Probetes |
| **Opsi 4: Upload CSV atau Excel** | Cocok untuk tahap awal sebelum ada API | Disarankan digunakan sekarang |
| **Opsi 5: API marketplace** | Cocok untuk jangka panjang | Dilakukan nanti setelah database rapi |

---

## Lampiran A. Konvensi ID, Aturan Dedup & Mapping

Bagian ini adalah pegangan teknis migrasi (tetap dipakai walau tampilan di atas sederhana).

**Konvensi ID (urut kemunculan):**

| Entity | Format | Contoh |
|---|---|---|
| Customer | `PB-CUST-0001` | `PB-CUST-0018` |
| Order | `ORD-000001` | `ORD-000982` |
| Product | `PRD-001` | `PRD-003` |
| Channel | `CH-001` | `CH-002` |
| User / CS | `USR-001` | `USR-003` |
| Ekspedisi | `EXP-001` | `EXP-003` |
| Invoice | `INV-YYYYMM-001` | `INV-202606-001` |

**Aturan wajib:**
- **Dedup pelanggan berbasis No HP ternormalisasi (`62…`), BUKAN nama.** Nama boleh beda, HP jadi kunci.
- Produk: simpan nama asli, mapping ke produk final. Prefiks `S`/`Tk` & suffix `Bonus` digabung ke
  produk inti (konfirmasi owner), nama asli tidak dihapus.
- Channel: pisahkan **platform** (TikTok/Shopee/Meta) dari **divisi** (Akuisisi/CRM/CS) dan **mitra**.
- Resi, COD, ongkir, retur masuk **Data Tracking**, bukan Master Data.
- Finance: HPP, total bayar, ongkir, fee COD, nilai cair, rekonsiliasi wajib disimpan (jangan dibuang).
- Data belum yakin → status `review`, jangan dihapus.
- Stok gudang = tabel sendiri, tersambung ke produk lewat ID Produk; SKU gudang adalah kode lokal.
- Laporan/Reports **dihitung otomatis** dari data pesanan & tracking — tidak diinput/disimpan ulang.

**Label status:** `valid`, `review`, `active`/`inactive`, `duplicate`, `archived`.
**Status customer:** `baru`, `repeat`, `lama`, `high_value`, `review`.
**Status tracking:** `dalam_kirim`, `terkirim`, `gagal_kirim`, `retur`, `proses`, `follow_up`.
**Status COD:** `belum_cair`, `cair`, `tidak_ada`, `cek`, `follow_up`.

---

## Lampiran B. Kecocokan dengan Data Migrasi Saat Ini

Data migrasi nyata sudah dibuat di `data_migrasi/output/` (42.390 order, 21.435 pelanggan, dari
2 file order + 1 file cohort). **Semua tabel di dokumen ini SUDAH ADA.** Yang perlu diperhatikan
adalah kolom yang masih kosong.

| Tabel dokumen | File hasil migrasi | Baris | Kolom kosong / catatan |
|---|---|---|---|
| 3.1 Pelanggan | `master/customers.csv` | 21.435 | `channel_id`, `cs_id` kosong (bisa di-enrich); kota terisi 8%, alamat 46% |
| 3.2 Cohort Ringkasan | `master/customer_cohorts.csv` | 21.136 | lengkap; versi `_named` sudah pakai nama |
| 3.3 Riwayat Transaksi | `orders/customer_transactions.csv` | 20.332 | `order_id` kosong (sumber cohort tak punya link order) |
| 3.4 Produk | `master/products.csv` | 81 | **`sku` & `category` kosong** — SKU ada di file gudang (PRB-xx), perlu digabung |
| 3.5 Channel | `master/channels.csv` | 7 | `platform` kosong; konsep channel vs divisi perlu dipisah |
| 3.6 CS / Tim | `master/users.csv` | 92 | `division`, `main_channel` kosong; sebagian bukan orang (toko/affiliate) |
| 3.7 Ekspedisi | `master/couriers.csv` | 22 | lengkap; 11 kurir status review (typo) |
| 4.1 Cek Resi | `tracking/shipments.csv` | 42.390 | **resi terisi 21%**, kota 17%, ongkir 39% (sumber banyak kosong) |
| 4.2 COD | `tracking/cod_payments.csv` | 5.338 | total/packing/fee terisi 8–17% |
| 4.3 Retur | `tracking/returns.csv` | 241 | `follow_up_action` kosong; kota 5% |
| 3.8–3.9 Pesanan + Item | `orders/orders.csv` + `orders/order_items.csv` | 42.390 | `order_status` terisi 18% (sumber banyak kosong) |
| 5. Gudang / Stok | `GABUNGAN/gudang_stok_gabungan.csv` | 64 | SKU beda per gudang; 20/64 cocok ke master produk — perlu mapping nama (mis. "Herbal Probetes" vs "Probetes Herbal") |
| 6.1 Finance | `finance/order_finance.csv` | 42.390 | invoice/hpp/total/nilai cair terisi 1–22% (sumber sparse) |
| 6.2 Kualitas Data | `audit/data_quality_checks.csv` | 2.054 | mayoritas pelanggan tanpa HP (2.015) |

**Ringkasan gap yang BISA diperbaiki (enrichment):**
1. `products.sku` + `category` → gabungkan daftar SKU `PRB-xx` dari file gudang Jakarta/Makassar.
2. `customers.channel_id` / `cs_id` → ambil dari order terbanyak tiap pelanggan.
3. `users.division` / `main_channel` → ambil dari kolom DIVISI + channel dominan.
4. `channels.platform` → turunkan dari nama channel final.

**Gap yang DIBATASI SUMBER (tidak bisa dipaksa penuh):** resi, kota, order_status, dan detail
finance (invoice/hpp/nilai cair) — karena di file sumber pun kolomnya banyak yang kosong.
