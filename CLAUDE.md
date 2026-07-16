CLAUDE.md

0. Dokumen Acuan Utama
PRD utama dan Single Source of Truth (SSOT) project adalah:
```txt
docs/PRD_BLUEPRINT_SSOT.md
```
Urutan eksekusi dan status task mengikuti:
```txt
docs/ROADMAP_PENGERJAAN.md
docs/PROGRESS.md
```
Dokumen lama sudah diarsipkan di `docs/archive/` dan tidak boleh dijadikan acuan implementasi.
Jika ada contoh model konseptual di PRD, implementasi database tetap wajib memakai SQL terparameterisasi melalui `pg` mentah (bukan Prisma/ORM).
---

1. Tentang Project
Project ini adalah Probetes ERP, yaitu aplikasi ERP internal untuk membantu operasional Probetes.
Aplikasi ini dibuat untuk menyatukan data dan pekerjaan yang sebelumnya tersebar di banyak tempat, seperti Google Sheet, Looker Studio, marketplace, CS, CRM, data cohort, data order, data pengiriman, pembayaran, dan laporan internal.
Tujuan utama Probetes ERP:
Membuat data Probetes lebih rapi dan terpusat.
Mengurangi data duplikat, terutama customer lama yang terbaca sebagai customer baru.
Membantu tim melihat data penting tanpa membuka banyak file.
Membantu owner dan tim membaca performa bisnis secara lebih jelas.
Menyiapkan sistem yang nantinya bisa terhubung ke marketplace, CRM, finance, warehouse, dan laporan.
Aplikasi ini bukan hanya dashboard biasa. Probetes ERP adalah sistem internal jangka panjang yang akan berkembang bertahap.
---
2. Teknologi Project
Struktur project menggunakan monorepo.
Root project:
```txt
D:\APP DEVELOPER\ERP PROBETES
```
Frontend utama berada di:
```txt
apps/web
```
Stack frontend:
```txt
Next.js
React
TypeScript
Tailwind CSS
lucide-react
```
Backend NestJS sudah ada sebagai skeleton, tetapi prioritas saat ini adalah frontend dan konsep UI terlebih dahulu.
Jangan membuat backend, API, database, atau integrasi baru kecuali diminta secara eksplisit.
---
3. Cara Menjalankan Project
Dari root project:
```bash
cd /d "D:\APP DEVELOPER\ERP PROBETES"
pnpm dev:web
```
Buka browser:
```txt
http://localhost:3000
```
Jika browser menampilkan `ERR_CONNECTION_REFUSED`, biasanya dev server belum berjalan.
Jika muncul error `EADDRINUSE`, berarti port 3000 sedang dipakai dev server lain.
Untuk cek port:
```bash
netstat -ano | findstr :3000
```
Untuk mematikan proses lama, pastikan prosesnya adalah `node.exe`, lalu:
```bash
taskkill /PID <PID> /F
```
---
4. Perintah Wajib Setelah Coding
Setelah mengubah kode, jalankan:
```bash
pnpm typecheck
pnpm build
```
Jika diminta menjalankan dev server:
```bash
pnpm dev:web
```
Setelah selesai, selalu tampilkan:
```bash
git status --short
```
Jangan commit otomatis kecuali user meminta.
---
5. Aturan Penting Saat Bekerja
Ikuti aturan ini dengan ketat:
Jangan mengubah desain besar tanpa instruksi.
Jangan mengarang fitur baru di luar permintaan.
Jangan membuat backend/API/database kecuali diminta.
Jangan mengubah Home Launcher kecuali diminta.
Jangan mengubah module lain yang tidak berkaitan.
Jangan membuat istilah UI terlalu teknis.
Jangan memakai istilah migration, staging, raw, import center, publish center di UI umum.
Jangan menampilkan istilah teknis database ke user kantor.
Jangan commit otomatis.
Jangan install package baru kecuali benar-benar perlu dan diminta.
Jika ada gambar referensi:
Jangan `Read` file PNG/JPG/JPEG/WebP.
Jangan OCR gambar.
Jangan inspect gambar dengan lines.
Jangan memasukkan isi gambar ke context.
Cukup gunakan gambar sebagai acuan visual jika user menjelaskan desainnya.
Kalau perlu melihat daftar file gambar, cukup gunakan `dir`.
---
6. Style Desain Probetes ERP
Aplikasi harus memakai gaya visual Probetes ERP:
Warna utama merah Probetes.
Background abu-abu muda / soft.
Card putih dengan rounded besar.
Card menu merah dengan icon box putih.
Icon gelap/navy.
Shadow lembut.
Typography bersih dan mudah dibaca.
Tampilan harus terasa seperti aplikasi ERP internal, bukan landing page marketing.
Desain harus sederhana dan mudah dipahami orang kantor.
Jangan terlalu banyak elemen yang membuat tampilan ramai.
Header/logo harus menampilkan:
```txt
PROBETES ERP
```
Bukan CRM.
---
7. Bahasa UI
Semua teks yang terlihat user harus menggunakan Bahasa Indonesia.
Gunakan istilah seperti:
```txt
Ringkasan Data
Data Utama
Kualitas Data
Status Cadangan
Pelanggan
Pesanan
Produk
Channel
CS / Tim
Ekspedisi
Database Cohort
Data Tracking
Cek Resi
Status Pengiriman
COD & Pembayaran
Retur & Gagal Kirim
Perlu Dicek
Tersedia
Aktif
Aman
Terjamin
```
Hindari istilah seperti:
```txt
Summary KPI
Source Coverage
Pipeline Status
Data Quality
Validation Issues
Import Batches
Problem Queue
Publish Readiness
Audit Activity
Backup Status
Master Data
Migration
Staging
PostgreSQL
Import Center
Publish Center
Raw Data
```
Jika istilah Inggris memang umum, boleh dipakai secukupnya, misalnya:
```txt
CRM
COD
ERP
SKU
```
Tapi tetap jelaskan dengan konteks sederhana.
---
8. Struktur Modul Besar Probetes ERP
Konsep modul Probetes ERP:
```txt
Home Launcher
├── Database
├── Marketing
├── Data Tracking
├── Reports
├── Finance
├── Warehouse / Gudang
├── User Management
└── Modul lain bertahap
```
Saat ini fokus utama masih pada:
```txt
Database
```
Modul lain belum perlu dikerjakan kecuali diminta.
---
9. Konsep Database di UI
Menu Database bukan tempat user melihat semua tabel mentah.
Database di UI adalah tempat untuk melihat:
Ringkasan data.
Data utama.
Kualitas data.
Status cadangan.
Struktur menu Database:
```txt
Database
├── Ringkasan Data
├── Data Utama
├── Kualitas Data
└── Status Cadangan
```
Jangan membuat Database UI terlalu teknis.
Database fisik di backend nantinya menyimpan semua data, tetapi menu UI harus dipisahkan sesuai kebutuhan kerja.
Contoh:
```txt
Database backend
= menyimpan data customer, order, produk, tracking, pembayaran, finance, dan lain-lain.

Menu Database di UI
= melihat data utama, kualitas data, dan kondisi data.

Menu Data Tracking di UI
= mengecek resi, status pengiriman, COD, retur, dan gagal kirim.

Menu Marketing di UI
= melihat closing, channel, campaign, leads, dan performa marketing.

Menu Reports di UI
= laporan final untuk owner/manajemen.
```
---
10. Halaman /database
Halaman `/database` adalah launcher kecil untuk Database.
Di bagian atas tetap ada hero/banner penjelasan Database Control Center.
Di bawahnya ada 4 card menu:
```txt
1. Ringkasan Data
2. Data Utama
3. Kualitas Data
4. Status Cadangan
```
Jangan menghapus hero/banner di atas.
User pernah menegaskan bahwa saat klik menu Database, harus ada kotak penjelasan di atas, lalu menu 4 card di bawah.
---
11. Halaman /database/overview
Halaman `/database/overview` adalah halaman Ringkasan Data.
UPDATE Juli 2026: halaman ini SUDAH membaca database PostgreSQL asli lewat `/api/database/summary` — bukan mock lagi. Desain 6 card selector lama sudah diganti.
Desain sekarang:
Header global tetap sama.
Background abu-abu muda.
Judul halaman: `Ringkasan Data`.
Baris 1: KPI Angka Inti Bisnis (pelanggan, target CRM, pesanan, transaksi cohort, produk) + rentang tanggal data.
Baris 2: Kondisi Pelanggan (baru/repeat/high value) dan donut Segmen Pelanggan (RFM, tanpa Non-CRM).
Baris 3: Kesehatan Data — tiap kartu klik menuju /database/data-quality.
Semua angka dari database; jangan menulis angka mati (hardcode) di halaman ini.
Nilai uang pesanan-vs-penjualan sengaja tidak ditampilkan berdampingan (beda definisi, menyesatkan) — laporan nilai masuk menu Reports nanti.
Angka patokan lama (Pelanggan 2.055 dst) hanyalah snapshot export Juni 2026 — lihat bagian 32; database sekarang berisi ±21.603 pelanggan.
---
12. Tombol Kembali
Untuk halaman turunan module, tombol kembali ditempatkan di bawah kiri area konten.
Contoh:
```txt
← Kembali ke Database
```
Aturan tombol kembali:
Jangan taruh di header paling atas.
Jangan menutupi logo.
Jangan floating di bawah kanan.
Jangan sticky/fixed.
Letakkan di bawah kiri setelah konten utama.
Tombol bersifat navigasi sekunder.
Gunakan background putih, border halus, rounded besar, shadow soft ringan.
Untuk `/database/overview`, tombol kembali menuju:
```txt
/database
```
---
13. Konsep Master Data
Halaman `/database/master-data` adalah bagian Data Utama.
Master Data tidak boleh terlalu ramai.
Struktur Master Data final yang disarankan:
```txt
Master Data
├── Pelanggan
├── Database Cohort
├── Produk
├── Channel
├── CS / Tim
└── Ekspedisi
```
Masing-masing menu menampilkan:
KPI ringkas.
Contoh tabel utama.
Status data.
Catatan validasi.
Tombol kembali di bawah kiri.
---
14. Master Data > Pelanggan
Tujuan:
```txt
Melihat identitas customer utama, asal datanya, status customer, dan validasi duplikat.
```
Data penting:
```txt
ID Customer
Nama Pelanggan
Nomor HP
Alamat Ringkas
Kota/Kabupaten
Asal Data
Channel
CS Terakhir
Jumlah Transaksi
Transaksi Terakhir
Status Customer
Status Validasi
```
Nomor HP: keputusan owner (tercatat di komentar API customers) — tampilkan PENUH tanpa masking, format lokal 08xx. Jangan kembalikan masking tanpa persetujuan owner.
Alamat lengkap tidak perlu tampil di tabel utama. Tampilkan alamat ringkas saja.
Alamat lengkap bisa muncul di detail jika nanti dibuat.
Status customer:
```txt
Baru
Lama
Repeat
Potensi Duplikat
Perlu Dicek
```
Status validasi:
```txt
Valid
Perlu Dicek
Nomor HP Tidak Valid
Alamat Kurang Lengkap
Potensi Duplikat
```
---
15. Customer ID Otomatis
Masalah utama Probetes:
```txt
Customer lama bisa dianggap customer baru jika membeli lagi setelah waktu lama atau data ditulis berbeda.
```
Karena itu perlu Customer ID otomatis.
Format ID yang disarankan:
```txt
PB-CUST-000001
PB-CUST-000002
PB-CUST-000003
```
Jangan membuat ID yang terlalu bergantung pada nama/alamat karena nama dan alamat bisa berubah atau salah ketik.
Pencocokan customer sebaiknya berdasarkan prioritas:
```txt
1. Nomor HP yang sudah dinormalisasi.
2. Nomor HP + nama.
3. Nama + alamat.
4. Nama + kota/kabupaten + pola pembelian.
5. Jika ragu, beri status Perlu Dicek.
```
Tujuan Customer ID:
Mengurangi customer duplikat.
Membantu CS membedakan customer lama dan baru.
Menyatukan riwayat pembelian customer.
Menjadi dasar Database Cohort.
Membantu follow-up CS dan konsultasi WA grup.
---
16. Master Data > Database Cohort
Database Cohort sangat penting untuk Probetes.
Tujuan:
```txt
Melihat riwayat customer, repeat order, total pembelian, produk yang pernah dibeli, dan status follow-up.
```
Database Cohort bukan hanya daftar customer, tetapi membaca perilaku customer dari waktu ke waktu.
Database Cohort harus membantu menjawab:
```txt
Customer ini customer baru atau lama?
Pertama beli kapan?
Terakhir beli kapan?
Sudah transaksi berapa kali?
Total qty pembelian berapa?
Total uang yang sudah dikeluarkan berapa?
Produk apa saja yang pernah dibeli?
CS terakhir siapa?
Customer perlu follow-up atau tidak?
Cocok masuk konsultasi WA grup atau tidak?
```
Tampilan Database Cohort sebaiknya memiliki 2 bagian:
```txt
1. Ringkasan Customer Cohort
2. Riwayat Transaksi Cohort
```
Kolom Ringkasan Customer Cohort:
```txt
ID Customer
Nama Customer
Nomor HP
Alamat Ringkas
Kota/Kabupaten
Cohort Pertama
Beli Pertama
Beli Terakhir
Total Transaksi
Total Qty
Total Pembelian
Rata-rata Pembelian
Produk Terakhir
CS Terakhir
Cluster
Status Follow-up
```
Kolom Riwayat Transaksi Cohort:
```txt
Tanggal Transaksi
ID Customer
Nama Customer
Nama CS CRM
User ID
Nama Produk
Qty
Total Harga
Cohort
Status Data
```
Kolom penting dari data asli cohort:
```txt
Tanggal Transaksi
Nama CS CRM
User ID
Nama Produk
Qty
Total Harga
NamaCustomer
Cohort
```
Cluster customer:
```txt
Customer Baru
Repeat Customer
Lama Tidak Beli
High Value
Perlu Follow-up
Konsultasi WA Grup
```
---
17. Total Pembelian di Database Cohort
Database Cohort wajib menampilkan angka total pembelian.
Data yang harus ada:
```txt
Total Transaksi
Total Qty
Total Pembelian
Rata-rata Pembelian
Produk Terakhir
Riwayat Produk
Total Pembelian per Produk
```
Contoh:
```txt
Customer A
Total Transaksi: 4
Total Qty: 7
Total Pembelian: Rp2.450.000
Rata-rata Pembelian: Rp612.500
Produk Terakhir: Probetes Herbal
Cluster: Repeat Customer
```
Alasan:
CS bisa tahu nilai customer.
Owner bisa melihat customer high value.
Customer lama tidak hanya dilihat dari nama/nomor HP.
Customer bisa diarahkan ke follow-up, repeat order, atau konsultasi WA grup.
Data cohort menjadi lebih berguna untuk strategi CRM.
---
18. Master Data > Produk
Tujuan:
```txt
Merapikan nama produk agar tidak dobel.
```
Data asli Probetes memiliki kandidat mapping nama produk yang perlu dirapikan.
Kolom Produk:
```txt
ID Produk
Nama Produk Final
SKU
Kategori
Nama Produk Asli
Jumlah Data
Total Qty
Total Nilai
Status Mapping
```
Contoh produk Probetes:
```txt
Probetes Herbal
S Probetes Herbal
TK Probetes Herbal
Ebook
Ebook 145
Amandia
Yacona
```
Status mapping:
```txt
Cocok
Perlu Review
Perlu Dicek
```
Catatan:
```txt
SKU candidate belum dianggap final sebelum direview.
```
---
19. Master Data > Channel
Tujuan:
```txt
Merapikan asal data dan channel penjualan.
```
Channel Probetes bisa berasal dari:
```txt
TikTok Shop
Shopee
Meta
WhatsApp / CS
CRM
Akuisisi
Marketplace lain
Web
```
Kolom Channel:
```txt
ID Channel
Nama Channel Final
Jenis Channel
Nama Sumber Asli
Platform
Divisi
Jumlah Pesanan
Total Nilai
Status Mapping
```
Contoh variasi yang perlu dirapikan:
```txt
Tiktok
TIKTOK
Tiktok MP
Meta
META
Shopee
CRM
Akuisisi
```
---
20. Master Data > CS / Tim
Tujuan:
```txt
Merapikan nama user, role, divisi, dan kepemilikan customer/order.
```
Kolom CS / Tim:
```txt
ID User
Nama User
Role
Divisi
Channel Utama
Jumlah Customer
Jumlah Pesanan
Total Nilai
Status Mapping
```
Role yang mungkin:
```txt
CS
CRM
ADV
Marketing
Admin
Owner
```
Catatan:
```txt
Data CS, ADV, divisi, dan platform penting untuk laporan performa tim.
```
---
21. Master Data > Ekspedisi
Tujuan:
```txt
Merapikan daftar ekspedisi sebagai data acuan.
```
Kolom Ekspedisi:
```txt
ID Ekspedisi
Nama Ekspedisi Final
Nama Sumber Asli
Layanan
Jumlah Pesanan
Jumlah Resi
Status Mapping
```
Contoh ekspedisi:
```txt
J&T
JNE
SiCepat
SAP Logistic
POS
Shopee Express
TikTok Logistics
```
Catatan penting:
```txt
Nomor resi tidak ditampilkan di Master Data > Ekspedisi.
Nomor resi masuk ke Data Tracking.
```
---
22. Data Tracking
Data Tracking perlu dibuat sebagai modul terpisah dari Database UI.
Data Tracking adalah tempat kerja harian untuk:
```txt
Cek resi
Status pengiriman
COD / Non-COD
Ongkir
Retur
Gagal kirim
Follow-up paket
```
Data Tracking tetap disimpan di database ERP yang sama, tetapi menu UI-nya dipisah.
Alasan dipisahkan:
Master Data berisi data acuan yang relatif stabil.
Data Tracking berisi data operasional harian yang terus berubah.
Jika resi, COD, retur, dan status paket dimasukkan ke Master Data, tampilan Database akan terlalu ramai.
Tim operasional butuh menu kerja khusus untuk cek pengiriman.
Reports nanti membaca hasil tracking untuk laporan final.
Struktur Data Tracking:
```txt
Data Tracking
├── Cek Resi
├── Status Pengiriman
├── COD & Pembayaran
└── Retur & Gagal Kirim
```
---
23. Data Tracking > Cek Resi
Kolom:
```txt
ID Pesanan
Nomor Resi
Nama Customer
Nomor HP
Alamat Kirim Ringkas
Kota/Kabupaten
Ekspedisi
Layanan
Status Pengiriman
Tanggal Kirim
Update Terakhir
```
---
24. Data Tracking > Status Pengiriman
Kolom:
```txt
ID Pesanan
Nomor Resi
Customer
Ekspedisi
Status Paket
Tanggal Kirim
Tanggal Penerimaan
Umur Pengiriman
Catatan Follow-up
```
Status paket:
```txt
Menunggu Pickup
Dalam Pengiriman
Terkirim
Gagal Kirim
Retur
Perlu Follow-up
```
---
25. Data Tracking > COD & Pembayaran
Kolom:
```txt
ID Pesanan
Nomor Resi
Customer
Metode Bayar
COD / Non-COD
Nominal Pesanan
Ongkir
Packing
Diskon Ongkir
Fee COD
Total Bayar
Status Pembayaran
Tanggal Cair
Status Cek
```
Status:
```txt
COD Belum Cair
COD Sudah Cair
Non-COD Sudah Bayar
Belum Dibayar
Selisih Ongkir
Perlu Dicek
```
Catatan:
```txt
Data Tracking boleh menampilkan pembayaran operasional.
Finance tetap menjadi tempat laporan uang final.
```
---
26. Data Tracking > Retur & Gagal Kirim
Kolom:
```txt
ID Pesanan
Nomor Resi
Customer
Alamat Kirim Ringkas
Ekspedisi
Status Masalah
Alasan Retur
Tanggal Gagal
Status Follow-up
CS Penanggung Jawab
```
Contoh status:
```txt
Gagal Kirim
Alamat Tidak Lengkap
Customer Tidak Bisa Dihubungi
Retur Proses
Retur Diterima
Follow-up CS
```
---
27. Finance
Finance tidak perlu dibuat penuh di tahap awal.
Namun data finance harus disiapkan dari awal agar nanti mudah dikembangkan.
Data finance yang perlu disiapkan:
```txt
HPP
Ongkir
Fee COD
Diskon Ongkir
Total Bayar
Nilai Rekonsiliasi
Tanggal Rekonsiliasi
Status Verifikasi
Biaya Admin
Biaya Marketing
Margin
```
Alasan Finance dibuat nanti:
Laporan finance sangat bergantung pada data customer, order, produk, tracking, dan pembayaran.
Jika data dasar belum rapi, laporan finance bisa salah.
Untuk tahap awal, fokus dulu pada data utama, customer ID, cohort, produk, channel, dan tracking.
Setelah data stabil, Finance bisa dibuat lebih lengkap.
Database masih bisa ditambah dan diedit nanti.
---
28. Marketing dan Import CSV
Sebelum API marketplace resmi tersedia, import file CSV/XLSX marketplace masuk lewat menu Marketing, bukan Database.
Menu yang disarankan:
```txt
Marketing > Import Data Channel
```
Sumber file:
```txt
TikTok Shop
Shopee
Meta
CRM
CS
Akuisisi
Marketplace lain
```
Alur:
```txt
User upload file di Marketing
↓
Data masuk ke penampungan sementara
↓
Sistem cek data
↓
Data valid masuk ke database utama
↓
Data bermasalah masuk status Perlu Dicek
↓
Hasil tampil di Marketing, Database, Data Tracking, dan Reports sesuai kebutuhan
```
Database tetap menyimpan data di belakang layar, tetapi user marketing tidak perlu membuka Database untuk import file.
---
29. Reports
Reports adalah tempat laporan final untuk owner/manajemen.
Reports membaca data dari:
```txt
Database
Marketing
Data Tracking
Finance
Warehouse
```
Reports bukan tempat input data.
Reports bisa menampilkan:
```txt
Total sales
Closing
Channel performance
Customer repeat
Cohort
Produk terlaris
COD
Retur
Pengiriman
Finance summary
```
---
30. Warehouse / Gudang
Gudang belum menjadi prioritas sekarang.
Nanti gudang bisa menjadi modul sendiri:
```txt
Warehouse
├── Stok
├── Barang Masuk
├── Barang Keluar
├── Retur Gudang
├── Stock Opname
└── Gudang Jakarta / Makassar
```
Data gudang tidak perlu dicampur ke Master Data Database.
---
31. Opsi Migrasi Database
Migrasi database Probetes ERP harus dilakukan bertahap.
Jangan langsung memasukkan semua data lama ke database utama.
Opsi 1 — Migrasi Langsung Semua Data
Semua data lama langsung masuk ke database utama.
Kelebihan:
```txt
Cepat
Data langsung terlihat
```
Kekurangan:
```txt
Data kotor bisa ikut masuk
Customer duplikat bisa ikut masuk
Customer lama bisa terbaca customer baru
Produk bisa dobel
Alamat/nomor HP/channel/pembayaran bisa salah dianggap valid
```
Catatan:
```txt
Tidak disarankan untuk tahap awal Probetes.
```
Opsi 2 — Migrasi Bertahap per Bagian
Data dimasukkan bertahap.
Urutan:
```txt
Customer
Pesanan
Produk
Channel
CS / Tim
Database Cohort
Data Tracking
Pembayaran
Finance
Reports
```
Catatan:
```txt
Disarankan untuk Probetes.
```
Opsi 3 — Tempat Penampungan Data Sementara
Data lama tidak langsung masuk database utama.
Alur:
```txt
Data masuk
↓
Dicek
↓
Data valid masuk database utama
↓
Data ragu masuk Perlu Dicek
```
Catatan:
```txt
Sangat disarankan untuk Probetes.
```
Opsi 4 — Upload CSV/Excel
Data dari TikTok, Shopee, Meta, CS, CRM, atau cohort diunggah manual.
Catatan:
```txt
Disarankan untuk tahap awal sebelum API resmi tersedia.
```
Opsi 5 — API Marketplace
Data masuk otomatis dari marketplace menggunakan API resmi.
Catatan:
```txt
Dilakukan nanti setelah database utama sudah rapi.
```
Rekomendasi final:
```txt
Gunakan gabungan:
1. Migrasi bertahap per bagian.
2. Tempat penampungan data sementara.
3. Upload CSV/Excel untuk tahap awal.
```
---
32. Data Awal yang Sudah Tersedia
Data export yang paling siap adalah periode Juni 2026.
Angka patokan Juni 2026:
```txt
Pelanggan hasil dedup awal: 2.055
Pesanan operasional: 2.962
Item pesanan: 2.962
Transaksi penjualan/cohort: 2.229
Kandidat nama produk perlu dirapikan: 41
Nilai pesanan operasional: 388.824.144
Total penjualan/cohort: 332.951.417
```
Catatan:
```txt
Data ini berasal dari export awal dan digunakan sebagai patokan mock frontend serta validasi migrasi awal.
```
Jangan menyebut data ini sebagai live database.
---
33. Strategi Migrasi 2 Bulan
User ingin migrasi data bertahap per 2 bulan.
Strategi:
```txt
1. Pakai Juni 2026 sebagai bulan uji validasi.
2. Pastikan angka Juni cocok dengan summary.
3. Perbaiki aturan Customer ID, dedup, produk, channel, dan cohort.
4. Setelah Juni aman, siapkan Mei 2026.
5. Gabungkan Mei + Juni 2026 sebagai batch migrasi 2 bulan pertama.
6. Setelah aman, lanjut mundur per 2 bulan.
```
Urutan batch:
```txt
Batch 1: Mei 2026 + Juni 2026
Batch 2: Maret 2026 + April 2026
Batch 3: Januari 2026 + Februari 2026
Batch 4: November 2025 + Desember 2025
```
Jangan langsung migrasi semua periode.
---
34. Validasi Data
Setiap data yang masuk harus punya status validasi.
Contoh data bermasalah:
```txt
Nomor HP kosong
Nomor HP tidak valid
Nama customer kosong
Alamat kosong
Kota kosong
Nama produk belum rapi
Channel tidak dikenal
CS belum termapping
Invoice duplikat
Resi duplikat
Status order tidak dikenal
Payment tidak dikenal
Customer lama terdeteksi sebagai customer baru
Nama sama tapi nomor berbeda
Nomor sama tapi nama berbeda
Alamat sama tapi nama berbeda
```
Status validasi:
```txt
Valid
Perlu Dicek
Potensi Duplikat
Butuh Gabung Customer
Butuh Konfirmasi CS
```
---
35. Prioritas Development Saat Ini
Fokus saat ini:
```txt
Database UI
/database
/database/overview
/database/master-data
```
Urutan kerja:
```txt
1. Rapikan Database menu utama.
2. Selesaikan Ringkasan Data.
3. Buat Data Utama / Master Data.
4. Masukkan konsep Pelanggan, Database Cohort, Produk, Channel, CS/Tim, Ekspedisi.
5. Tambahkan tombol kembali bawah kiri.
```
UPDATE Juli 2026 — kondisi sekarang:
```txt
Database PostgreSQL lokal (probetes_erp) sudah aktif; koneksi via DATABASE_URL di apps/web/.env.local.
Menu Database (Ringkasan, Data Utama, Kualitas Data, Status Cadangan) sudah membaca API /api/* dari database asli.
Jangan menambah angka mati (hardcode) di UI — KPI/badge harus dari API.
Rumus kualitas data pelanggan ada di apps/web/src/lib/quality-sql.ts — pakai itu, jangan menulis rumus duplikat.
Edit/Hapus di Data Utama masih tampilan sementara (belum ada API tulis) — banner peringatannya jangan dihapus.
```
---
36. Aturan Saat Membuat UI Baru
Saat membuat halaman baru:
Gunakan style Probetes yang sudah ada.
Jangan membuat desain baru yang jauh berbeda.
Pakai card merah untuk selector/menu.
Pakai konten putih di bawah.
Pakai Bahasa Indonesia.
Jangan terlalu banyak tab.
Jangan tampilkan data mentah.
Tabel cukup contoh ringkas dulu.
Gunakan data dummy yang realistis dari Probetes.
Tulis catatan bahwa data masih mock/static jika belum dari API.
---
37. Hal yang Tidak Boleh Dilakukan
Jangan lakukan ini kecuali user meminta:
```txt
Membuat backend baru
Membuat API baru
Membuat database production
Mengubah Home Launcher
Mengubah module yang tidak diminta
Menghapus struktur yang masih dipakai
Commit otomatis
Push otomatis
Install package baru
Mengganti desain besar tanpa izin
Menggunakan istilah teknis di UI user umum
```
---
38. Jika Terjadi Error
Jika halaman error 500:
```txt
Minta stack error dari terminal.
Jangan hanya melihat screenshot browser.
```
Jika error karena cache Next.js:
```bash
rmdir /s /q apps\web\.next
pnpm dev:web
```
Jika route tidak tampil:
```txt
Cek file page.tsx.
Cek import.
Cek client component jika memakai useState.
```
Jika TypeScript error:
```txt
Perbaiki typing, jangan pakai any sembarangan jika bisa dihindari.
```
---
39. Format Jawaban Setelah Coding
Setelah selesai coding, jawab dengan format:
```txt
Selesai.

File yang diubah:
- ...

File yang dibuat:
- ...

Hasil pengecekan:
- pnpm typecheck: ...
- pnpm build: ...

Halaman yang dicek:
- ...

Catatan:
- ...

git status --short:
...
```
Jika ada yang gagal, jelaskan jujur.
---
40. Prinsip Utama
Prinsip paling penting:
```txt
Probetes ERP harus sederhana untuk user kantor,
tetapi tetap kuat untuk menyimpan dan membaca data bisnis yang kompleks.
```
Jangan membuat UI yang terlalu teknis.
Database boleh kompleks di belakang layar, tetapi tampilan user harus mudah dipahami.
Selalu bedakan:
```txt
Database backend
= tempat semua data disimpan.

Menu Database
= tempat melihat data utama dan kualitas data.

Marketing
= tempat import dan melihat performa channel.

Data Tracking
= tempat cek resi, COD, ongkir, retur, dan pengiriman.

Finance
= tempat laporan uang final.

Reports
= tempat laporan final untuk owner/manajemen.
```
