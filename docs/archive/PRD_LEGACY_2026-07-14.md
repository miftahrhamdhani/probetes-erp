# ARSIP — PROBETES ERP PRD (14 Juli 2026)

> **Status:** dokumen historis, bukan acuan implementasi aktif.
> Gunakan **[PRD_BLUEPRINT_SSOT.md](../PRD_BLUEPRINT_SSOT.md)** sebagai PRD utama dan Single Source of Truth project.

# PROBETES ERP — PRD (Product Requirements Document)

**Blueprint Detail Menu, Arsitektur, Workflow, Database, dan Roadmap Pengembangan**
Versi Revisi Detail — 14 Juli 2026

> **Tujuan dokumen:** menjelaskan secara detail fungsi setiap menu & submenu ERP Probetes,
> alur kerja data, struktur PostgreSQL, konsep analitik internal, serta prioritas pengembangan
> per fase termasuk HRIS dan AI Assistant.
>
> **Sifat dokumen:** blueprint/acuan. Eksekusi dilakukan bertahap per fase. Progres nyata
> pengerjaan dilacak terpisah di **[PROGRESS.md](../PROGRESS.md)** (papan status yang dicentang
> tiap fitur selesai). Detail teknis tabel ada di **[ARSITEKTUR_DATABASE.md](../ARSITEKTUR_DATABASE.md)**.

| Informasi | Keterangan |
|---|---|
| Nama sistem | Probetes ERP |
| Database utama | PostgreSQL dengan schema per domain |
| Tujuan besar | Data terpusat, terintegrasi, mudah dianalisis, tanpa bolak-balik antar file/dashboard |
| Catatan implementasi | Dokumen ini blueprint. Eksekusi bertahap per fase. |

---

## Daftar Isi
1. Ringkasan Eksekutif
2. Visi Sistem dan Prinsip Utama
3. Tech Stack dan Arsitektur Aplikasi
4. Workflow Data Terpusat dan Analitik ERP
5. Penjelasan Detail Per Menu dan Submenu
   - 5.1 Home Launcher · 5.2 Database · 5.3 Marketing · 5.4 CRM · 5.5 Data Tracking
   - 5.6 Reports · 5.7 Finance · 5.8 Warehouse · 5.9 HRIS · 5.10 User Management
   - 5.11 Setting/System · **5.12 AI Assistant**
6. Struktur Database PostgreSQL
7. Roadmap Prioritas Pengerjaan per Fase
8. Keputusan Owner yang Perlu Dikonfirmasi
9. Kesimpulan

---

## 1. Ringkasan Eksekutif

Probetes ERP adalah aplikasi internal sebagai **pusat operasional, database, analitik, dan laporan
bisnis** Probetes. Data yang sebelumnya tersebar (marketplace, CSV/Excel, Google Sheet, Looker,
BigQuery lama, CS/CRM, pengiriman, pembayaran, laporan internal) dibaca dari satu aplikasi.

Tujuannya bukan sekadar dashboard, melainkan sistem kerja yang menyatukan customer, pesanan,
produk, marketing, CRM, tracking, finance, warehouse, user management, HRIS, dan reports dalam
satu database PostgreSQL terstruktur.

| Tujuan | Penjelasan |
|---|---|
| Tersentralisasi | Semua data penting dalam satu database utama; tidak ada banyak versi data. |
| Terintegrasi | Pesanan, customer, produk, iklan, tracking, finance, gudang, HRIS saling terhubung. |
| Mudah dianalisis | ERP punya layer analytics sendiri di PostgreSQL; dashboard tidak selalu bergantung BigQuery. |
| Aman untuk migrasi | Data baru masuk staging dulu, divalidasi, baru masuk data utama. |
| Mudah dipakai user kantor | UI Bahasa Indonesia, menu jelas, tanpa istilah teknis database. |

---

## 2. Visi Sistem dan Prinsip Utama

**Visi:** Probetes ERP menjadi aplikasi satu pintu untuk tim kantor & owner. User cukup membuka
ERP untuk bekerja dan membaca laporan; sistem di belakang layar mengatur sumber data, validasi,
integrasi, dan analitik.

- Satu aplikasi untuk kerja harian: import, cek pesanan, tracking, follow-up CRM, laporan marketing/finance/gudang/HRIS.
- Satu database PostgreSQL sebagai pusat data, dipisah rapi memakai schema per domain.
- Data ragu tidak dihapus, diberi status `review` agar bisa dicek & diperbaiki.
- Laporan dihitung dari transaksi, bukan diinput ulang → tidak ada selisih versi.
- Analitik dibangun di layer PostgreSQL: view, summary table, materialized view, scheduled refresh.
- BigQuery **tidak wajib** — bisa jadi sumber historis/legacy atau opsional bila data sangat besar.

---

## 3. Tech Stack dan Arsitektur Aplikasi

| Layer | Teknologi / Konsep | Fungsi |
|---|---|---|
| Frontend | Next.js, React, TypeScript, Tailwind CSS, lucide-react | UI dashboard, form import, tabel, grafik, menu ERP. |
| Backend/API | NestJS / API service layer bertahap | Menghubungkan frontend ↔ database, validasi bisnis, import, analytics. |
| Database | PostgreSQL | Pusat data utama ERP + layer analitik internal. |
| Import | CSV/Excel manual, lalu API marketplace | Data TikTok, Shopee, Meta, CRM, Scalev, gudang, data lama. |
| Analytics | View, materialized view, summary table, scheduled job | Dashboard cepat tanpa hitung data mentah tiap buka halaman. |
| AI Assistant | Model Claude terbaru (read-only atas data ERP) | Tanya-jawab data, ringkasan otomatis, deteksi anomali. |
| Security | IAM: accounts, roles, permissions, activity log | Akses per modul: Owner, Admin, Marketing, Finance, HR, Gudang, CS. |

**Arsitektur besar (alur data):**

| Tahap | Alur |
|---|---|
| 1 | Data masuk dari marketplace, CSV/Excel, CRM, CS, gudang, BigQuery lama, atau Google Sheet. |
| 2 | Data disimpan ke raw/staging agar data asli tetap ada & bisa diaudit. |
| 3 | Validasi: nomor HP, produk, channel, CS, tanggal, invoice, resi, duplikasi. |
| 4 | Data valid dipromosikan ke master/orders/marketing/tracking/finance/hris sesuai domain. |
| 5 | Layer analytics menghitung summary harian/bulanan untuk dashboard. |
| 6 | Frontend ERP menampilkan menu kerja & laporan dari satu aplikasi. |

---

## 4. Workflow Data Terpusat dan Analitik ERP

### 4.1 Workflow Import Data

| Langkah | Penjelasan |
|---|---|
| Pilih sumber | User memilih platform/sumber: TikTok, Shopee, Meta, Scalev, CRM, gudang, atau data lama. |
| Upload file | Upload CSV/Excel. File tidak langsung masuk data utama. |
| Raw/staging | Data asli disimpan, lalu diparsing ke staging untuk dicek. |
| Preview | User melihat preview tabel sebelum menyimpan. |
| Validasi | Cek field wajib, format tanggal, nomor HP, produk, channel, invoice, resi, potensi duplikat. |
| Promote | Data valid masuk tabel utama. Data ragu masuk status `review`. |
| Analytics refresh | Summary & dashboard diperbarui dari data yang sudah valid. |

### 4.2 Workflow Analitik Internal

PostgreSQL menghitung analitik bila strukturnya benar (tidak wajib BigQuery).

| Sumber Transaksi | Diolah Menjadi | Dipakai Oleh |
|---|---|---|
| orders.orders + order_items | analytics.sales_daily, product_sales_summary, store_sales_summary | Sales & Order, Reports |
| marketing.ad_spending + orders | analytics.ads_roas_daily, channel_performance | Iklan & ROAS, Marketing Reports |
| crm.closings + customer_cohorts | analytics.crm_retention_monthly, crm_frequency_matrix, crm_cluster_summary | CRM, RFM & Cohort |
| tracking.shipments + returns + cod_payments | analytics.cod_summary, return_summary | Data Tracking, Finance, Reports |
| finance.order_finance + expenses + incomes | reports.finance_pnl | Finance, Reports Owner |
| hris.attendance + payslips | reports.hr_summary | HRIS, Owner |

---

## 5. Penjelasan Detail Per Menu dan Submenu

> Format tiap menu: tujuan · dipakai oleh · sumber data · submenu · data yang ditampilkan ·
> alur user · output/keputusan.

### 5.1 Home Launcher

| Aspek | Penjelasan |
|---|---|
| Tujuan | Pintu masuk utama. Navigasi besar agar user memilih area kerja tanpa melihat struktur database. |
| Dipakai oleh | Semua user sesuai hak akses. |
| Sumber data | Tidak mengambil transaksi detail; hanya status ringkas modul bila perlu. `system.app_settings`, `iam.permissions`. |
| Submenu (kartu) | Database · Marketing · CRM · Sales & Order · Data Tracking · Reports · Finance · Warehouse/Gudang · User Management · HRIS · **AI Assistant** · Setting |
| Data ditampilkan | Nama modul, icon, deskripsi singkat, status aktif/pengembangan, shortcut. |
| Alur user | Login → lihat menu sesuai role → klik kartu → buka halaman modul. |
| Output | Navigasi sederhana, user tidak bingung, hak akses mudah dikontrol. |

### 5.2 Menu Database

| Aspek | Penjelasan |
|---|---|
| Tujuan | Pusat melihat kondisi data utama (bukan tabel mentah). Membantu owner/admin data memastikan pelanggan, produk, channel, CS, ekspedisi, cohort, cadangan, dan kualitas data aman. |
| Dipakai oleh | Owner, admin data, tim berakses database. |
| Sumber data | schema `master`, `orders`, `audit`, `system`, `staging`, `analytics`. |
| Submenu | Ringkasan Data · Data Utama (Master Data) · Status Cadangan · Kualitas Data |

**5.2.1 Ringkasan Data** — halaman pertama untuk membaca kesehatan database secara cepat (bukan edit).
Menampilkan: total pelanggan, pesanan, transaksi cohort, produk, rentang tanggal, customer baru/repeat,
segmen pelanggan, kartu kesehatan data, data perlu dicek, status koneksi DB.
Sumber: `master.customers`, `orders.orders`, `orders.customer_transactions`, `master.products`,
analytics summary, `audit.data_quality_checks`.

**5.2.2 Data Utama / Master Data** — data acuan (dasar untuk semua modul lain).

| Submenu | Fungsi | Contoh Data |
|---|---|---|
| Pelanggan | Identitas customer + status validasi, kurangi duplikat, bedakan lama vs baru. | Customer ID, nama, no HP, alamat ringkas, kota, channel, CS terakhir, jumlah transaksi, status validasi. |
| Database Cohort | Riwayat customer dari waktu ke waktu: repeat, retention, frequency, cluster. | Cohort pertama, beli pertama/terakhir, frequency, total pembelian, produk terakhir, cluster, follow-up. |
| Produk | Rapikan nama produk & SKU agar tidak dobel. | ID, nama final, SKU, kategori, alias/nama asli, jumlah data, total qty, status mapping. |
| Channel | Rapikan sumber penjualan & platform. | ID, nama final, platform, divisi, sumber asli, jumlah pesanan, total nilai. |
| Ekspedisi | Rapikan daftar kurir. Resi tidak di sini (ada di Data Tracking). | ID, nama final, layanan, sumber asli, jumlah pesanan, jumlah resi. |
| CS / Tim | Rapikan nama CS/CRM/ADV yang muncul di data (bukan akun login/karyawan HRIS). | ID user data, nama, role, divisi, channel utama, jumlah customer/pesanan, status mapping. |

Sumber utama: `master.*`, `orders.*`, `audit.data_quality_checks`, `marketing.leads`, `crm.closings`,
`master.product_aliases`, `master.product_sku_map`, `warehouse.stock`.

**5.2.3 Status Cadangan** — memantau backup DB: status/tanggal/lokasi/ukuran backup terakhir, sukses/gagal,
jadwal berikutnya, riwayat, peringatan gagal. Sumber: `system.backup_settings`, `system.backup_history`, `system.app_settings`.

**5.2.4 Kualitas Data** — menampilkan semua data bermasalah sebelum masuk laporan final: no HP kosong/tidak valid,
nama/alamat kosong, produk belum mapping, channel/CS tak dikenal, invoice/resi duplikat, potensi duplikat,
data review per sumber import. Sumber: `audit.data_quality_checks`, `staging.import_rows`, `master.*`, `orders.orders`.

### 5.3 Menu Marketing

| Aspek | Penjelasan |
|---|---|
| Tujuan | Pusat import data marketplace, spending iklan, data pesanan channel, performa iklan/ROAS, sales order, dan CRM terkait channel. |
| Dipakai oleh | Marketing, ADV, Admin Data, Owner. |
| Sumber data | `marketing`, `orders`, `master`, `staging`, `analytics`, `reports`. |
| Submenu | Import Data Channel/Marketplace · Iklan & ROAS · Sales & Order · CRM · Channel Performance/Data Review Marketing |

- **Import Data Channel/Marketplace** — upload CSV/Excel TikTok/Shopee/Meta/Scalev sebelum API resmi. Pilih platform, jenis (Spending Ads / Data Pesanan), ADV/toko, upload, preview, validasi, simpan/cancel, riwayat import. Sumber: file, `marketing.import_batches`, `staging.import_rows`, `orders.orders`, `marketing.ad_campaign_metrics`.
- **Iklan & ROAS** — baca efektivitas iklan per platform/ADV/campaign/toko/periode (bukan tempat upload). KPI: total spending, sales, ROAS, order, cost/order, leads, closing rate, ROAS per platform, ranking ADV/campaign, data review. Sumber: `marketing.ad_campaign_metrics`, `marketing.leads`, `orders.orders`, `analytics.ads_roas_daily`, `master.channels`, `master.users`.
- **Sales & Order** — laporan penjualan/pesanan terhubung marketplace/CRM/channel/toko/produk/COD/retur. KPI: total sales, order, AOV, qty, customer baru/repeat, produk terlaris, channel terbaik, status pesanan, COD belum cair, retur. Sumber: `orders.*`, `master.products`, `master.channels`, `tracking.cod_payments`, `tracking.returns`, `analytics.sales_daily`.
- **Channel Performance / Data Review Marketing** — performa channel + data marketing yang perlu diperbaiki (mapping platform/toko belum cocok, import error).

### 5.4 Menu CRM

| Aspek | Penjelasan |
|---|---|
| Tujuan | Pusat kerja CS/CRM: closingan, data customer, status grup, follow-up, RFM, cohort, retention, frequency, cluster custom Probetes. |
| Dipakai oleh | CRM/CS, Marketing, Owner, Admin Data. |
| Sumber data | `crm`, `master`, `orders`, `marketing`, `analytics`, `staging`. |
| Submenu | Import CRM · Data Pesanan CRM · Data Iklan CRM · RFM & Cohort (Retention/Frequency/Cluster) · Data Review CRM · Detail Customer |

- **Import CRM** — masukkan data manual CS/CRM: closingan, status masuk grup, follow-up, update customer. Preview, mapping kolom, validasi WA/customer/produk/CS. Sumber: file, `crm.crm_imports`, `crm.crm_import_rows`, `staging.import_rows`, `crm.closings`, `crm.customer_groups`, `crm.followups`.
- **Data Pesanan CRM** — closingan dari CS/CRM/WhatsApp (bukan semua marketplace). KPI: total closing, sales CRM, AOV, customer baru/repeat, belum masuk grup, tren closing, closing per CS, produk. Sumber: `crm.closings`, `orders.orders`, `master.*`, `crm.customer_groups`.
- **Data Iklan CRM** — performa iklan yang menghasilkan leads/closing CRM: spending, leads, closing, sales, cost/closing, ROAS CRM, campaign/ADV CRM. Sumber: `marketing.ad_campaign_metrics`, `marketing.leads`, `crm.closings`, `orders.orders`, `analytics.ads_roas_daily`.
- **RFM & Cohort — Retention** — heatmap retention per cohort (Month 0–12), retention rate, revenue retained, customer at risk; klik cell → tabel customer. Sumber: `master.customer_cohorts`, `orders.customer_transactions`, `orders.orders`, `analytics.crm_retention_monthly`.
- **RFM & Cohort — Frequency** — heatmap frekuensi order per cohort (F1, F2, F3, F4…F19+), jumlah/persentase per frekuensi; klik cell → daftar customer. Sumber: `master.customer_cohorts`, `orders.customer_transactions`, `analytics.crm_frequency_matrix`.
- **RFM & Cohort — Cluster** — segmentasi custom Probetes (A1, A2, A3, A4, B, C-Prodig, C-HP, C-F2, D-New, D-Old, Dhp-New, Dhp-Old, E, F): revenue/jumlah/komposisi per cluster, cluster card, tabel detail, rekomendasi follow-up. Sumber: `crm.customer_clusters`, `master.customer_cohorts`, `orders.customer_transactions`, `analytics.crm_cluster_summary`.
- **Data Review CRM & Detail Customer** — masalah data CRM (WA kosong, produk belum mapping, status grup/cluster tak jelas) + profil customer lengkap (riwayat transaksi, follow-up, status grup, catatan CRM). Sumber: `audit.data_quality_checks`, `crm.followups`, `crm.customer_groups`, `master.customers`, `orders.orders`.

### 5.5 Menu Data Tracking

| Aspek | Penjelasan |
|---|---|
| Tujuan | Menu kerja operasional: pengiriman, resi, COD, retur, gagal kirim. Dipisah dari Database agar Master Data tidak ramai. |
| Dipakai oleh | Operasional, CS, admin tracking, finance, owner. |
| Sumber data | `tracking`, `orders`, `master`, `finance`, `analytics`. |
| Submenu | Cek Resi · Status Pengiriman · COD & Pembayaran · Retur & Gagal Kirim |

- **Cek Resi** — cari/lihat status resi per pesanan/customer (nomor resi, ID pesanan, customer, HP, alamat ringkas, ekspedisi, layanan, status, update terakhir). Sumber: `tracking.shipments`, `orders.orders`, `master.customers`, `master.couriers`.
- **Status Pengiriman** — pantau paket per status/umur/follow-up (menunggu pickup, dalam pengiriman, terkirim, gagal kirim, retur, umur, CS PJ). Sumber: `tracking.shipments`, `tracking.tracking_events`, `orders.orders`.
- **COD & Pembayaran** — status COD/non-COD operasional (belum/sudah cair, nominal, ongkir, fee COD, tanggal cair, selisih, status cek). Sumber: `tracking.cod_payments`, `finance.order_finance`, `orders.orders`.
- **Retur & Gagal Kirim** — pantau retur/gagal kirim/alamat bermasalah (ID pesanan, resi, customer, ekspedisi, alasan, tanggal gagal, status follow-up, CS PJ). Sumber: `tracking.returns`, `tracking.shipments`, `orders.orders`, `master.customers`.

### 5.6 Menu Reports

| Aspek | Penjelasan |
|---|---|
| Tujuan | Laporan final untuk owner/manajemen. Bukan tempat input; membaca data dari semua domain (VIEW). |
| Dipakai oleh | Owner, manajemen, kepala divisi sesuai hak akses. |
| Sumber data | `reports` VIEW dari orders, marketing, crm, tracking, finance, warehouse, hris. |
| Submenu | Dashboard Owner · Laporan Sales · Marketing/ROAS · CRM & Cohort · Tracking/COD/Retur · Finance · Warehouse · HRIS |

- **Dashboard Owner** — ringkasan lintas divisi: sales, order, ROAS, customer repeat, retur, COD pending, margin, stok kritis, absensi/biaya HR. Sumber: `reports.sales_monthly`, `channel_performance`, `customer_cohort`, `finance_pnl`, `hr_summary`.
- **Laporan Per Area** — sales monthly, channel performance, CS performance, customer cohort, COD settlement, stock status, finance P&L, HR summary. Bisa export.

### 5.7 Menu Finance

| Aspek | Penjelasan |
|---|---|
| Tujuan | Laporan uang final: HPP, margin, pemasukan, pengeluaran, rekonsiliasi, COD, settlement, laba/rugi. |
| Dipakai oleh | Finance, Owner, Admin sesuai hak akses. |
| Sumber data | `finance`, `orders`, `tracking`, `marketing`, `reports`. |
| Submenu | Dashboard Finance · Rekonsiliasi · Pemasukan · Pengeluaran · HPP & Margin · COD/Settlement · Laba Rugi |

- **Dashboard Finance** — total pemasukan/pengeluaran, margin, COD belum cair, settlement review, biaya iklan, HPP, laba/rugi ringkas. Sumber: `finance.order_finance`, `finance.incomes`, `finance.expenses`, `finance.settlements`, `tracking.cod_payments`.
- **Rekonsiliasi / Pemasukan / Pengeluaran / HPP & Margin** — cocokkan uang masuk, catat biaya, hitung margin per order/produk; status cocok/selisih/review. Sumber: `finance.settlements`, `finance.incomes`, `finance.expenses`, `finance.order_finance`, `orders.orders`.

### 5.8 Menu Warehouse / Gudang

| Aspek | Penjelasan |
|---|---|
| Tujuan | Menu stok & pergerakan barang. Data gudang sudah ada tapi belum masuk DB penuh. Mendukung SKU per gudang yang bisa berbeda untuk produk sama. |
| Dipakai oleh | Gudang, operasional, admin data, owner. |
| Sumber data | `warehouse`, `master.products`, `orders`, `tracking`, `reports`. |
| Submenu | Dashboard Stok · Stok Barang · Barang Masuk · Barang Keluar · Transfer Gudang · Stock Opname · Retur Gudang · Restock Alert |

- **Dashboard Stok & Stok Barang** — kondisi stok per gudang, tersedia, reserved, kritis, mapping SKU lokal → produk final (gudang Jakarta/Makassar, produk, SKU lokal, nama item, qty on hand/reserved, reorder point, status). Sumber: `warehouse.warehouses`, `warehouse.stock`, `master.products`, `master.product_sku_map`.
- **Barang Masuk/Keluar/Transfer/Opname/Retur Gudang** — catat semua mutasi (sumber kebenaran): tipe, ref order/pembelian/opname/manual, qty change, tanggal, selisih opname, catatan. Sumber: `warehouse.stock_movements`, `warehouse.stock_opname(_items)`, `orders.orders`, `tracking.returns`.

### 5.9 Menu HRIS

| Aspek | Penjelasan |
|---|---|
| Tujuan | Menu baru HRD: karyawan, absensi, cuti, payroll, komisi, laporan HR. Dipisah dari `master.users` & `iam.accounts` karena data HR sensitif. |
| Dipakai oleh | HRD, Owner, Finance terbatas, karyawan (bila self-service dibuat). |
| Sumber data | `hris`, `iam`, `master.users`, `orders`/`marketing` untuk komisi, `reports`. |
| Submenu | Dashboard HRIS · Data Karyawan · Departemen & Jabatan · Absensi · Cuti/Izin · Payroll & Slip Gaji · Komisi · Laporan HRD |

- **Dashboard HRIS** — total karyawan aktif, kontrak/tetap/harian, absensi hari ini, terlambat/izin/sakit/alpha, cuti berjalan, payroll periode, biaya gaji ringkas.
- **Data Karyawan** — profil kepegawaian. NIK/alamat/gaji hanya role tertentu. Link ke akun login & CS user bila orang sama. Sumber: `hris.employees`, `hris.departments`, `hris.positions`, `iam.accounts`, `master.users`.
- **Departemen & Jabatan** — struktur organisasi (Marketing, CRM, Gudang, Finance, HR) + jabatan/level.
- **Absensi** — kehadiran harian, check-in/out, status, jam kerja.
- **Cuti/Izin** — pengajuan & persetujuan (jenis, tanggal, total hari, alasan, status, approver).
- **Payroll, Slip Gaji, Komisi** — gaji per periode; komisi CS/closing bisa otomatis dari order/leads bila owner setuju rumusnya. Sumber: `hris.payroll_periods`, `hris.payslips`, `hris.payslip_components`, `orders.orders`, `marketing.leads`, `crm.closings`.
- **Laporan HRD** — rangkuman karyawan, absensi, cuti, payroll, biaya gaji, komisi CS/CRM.

### 5.10 Menu User Management

| Aspek | Penjelasan |
|---|---|
| Tujuan | Atur akun login, role, hak akses, dan jejak aktivitas. Beda dari CS/Tim (`master`) & karyawan HRIS. |
| Dipakai oleh | Admin sistem, owner. |
| Sumber data | `iam`, `hris`, `master.users`, `audit`. |
| Submenu | Akun Login · Role · Permission · Role Permission · Account Role · Activity Log |

Fungsi: mengatur siapa boleh masuk aplikasi, menu apa yang boleh dibuka, aksi apa yang boleh dilakukan
(lihat/tambah/ubah/hapus/export), dan mencatat aktivitas penting. Role: Owner/Admin/Marketing/CS/CRM/Gudang/Finance/HR.
Sumber: `iam.accounts`, `iam.roles`, `iam.permissions`, `iam.role_permissions`, `iam.account_roles`, `iam.activity_log`.

### 5.11 Menu Setting / System

| Aspek | Penjelasan |
|---|---|
| Tujuan | Pengaturan aplikasi, penomoran ID otomatis, status cadangan, template import, konfigurasi umum. |
| Dipakai oleh | Admin sistem, owner. |
| Sumber data | `system`, `iam`, `staging`. |
| Submenu | Pengaturan Umum · Penomoran ID · Template Import · Backup/Cadangan · Security Setting |

Data: nama perusahaan, logo, format ID, prefix customer/order/employee, template import, jadwal backup,
pengaturan keamanan. Sumber: `system.app_settings`, `system.id_sequences`, `system.backup_settings`, `system.backup_history`.

### 5.12 Menu AI Assistant

| Aspek | Penjelasan |
|---|---|
| Tujuan | Asisten AI internal untuk **tanya-jawab data ERP dengan bahasa sehari-hari**, ringkasan otomatis, dan deteksi anomali. Membantu owner/tim mendapat jawaban cepat tanpa membuka banyak menu. |
| Dipakai oleh | Owner, manajemen, dan divisi sesuai hak akses (jawaban dibatasi oleh permission user yang bertanya). |
| Sumber data | **Read-only** atas `reports` VIEW + `analytics` + `master` (data acuan). Data sensitif HRIS (NIK/gaji) hanya jika role berhak. Riwayat disimpan di schema `ai`. |
| Model | Model Claude terbaru (mis. keluarga Opus/Sonnet terbaru) via API. Konfigurasi & biaya diatur di Setting. |
| Submenu | Tanya Data (chat) · Ringkasan Otomatis · Insight & Anomali · Riwayat Percakapan · Insight Tersimpan |

- **Tanya Data (chat)** — user bertanya bahasa natural (mis. "sales bulan lalu channel TikTok berapa?", "customer high value yang belum masuk grup WA siapa saja?"). AI menerjemahkan ke query read-only atas VIEW/analytics, menjawab dengan angka + **menyertakan sumber** (tabel/periode). Tidak pernah menulis/mengubah data bisnis.
- **Ringkasan Otomatis** — ringkasan harian/mingguan lintas modul (sales, ROAS, COD pending, stok kritis, retur) dalam bahasa mudah.
- **Insight & Anomali** — menandai hal tidak wajar: spending naik tapi sales turun, retur melonjak per ekspedisi, cohort tertentu berhenti repeat.
- **Riwayat Percakapan & Insight Tersimpan** — simpan percakapan dan insight penting agar bisa dibuka lagi.

**Sumber data teknis:** `ai.conversations`, `ai.messages`, `ai.saved_insights`; membaca `reports.*`, `analytics.*`,
`master.*`. Setiap akses dibatasi `iam.permissions` dan dicatat di `iam.activity_log`.

**Aturan keamanan AI:** (1) hanya baca, tidak pernah tulis data bisnis; (2) tidak menampilkan data
sensitif di luar hak akses penanya; (3) wajib menyertakan sumber angka; (4) semua pertanyaan & jawaban
tercatat untuk audit. Alur user: buka AI Assistant → ketik pertanyaan → AI jawab + sumber → user simpan
insight bila perlu.

---

## 6. Struktur Database PostgreSQL

Satu database `probetes_erp`, dipisah dengan schema per domain.

| Schema | Menu Terkait | Fungsi Utama |
|---|---|---|
| master | Database — Data Utama | Pelanggan, produk, channel, ekspedisi, CS/tim, mitra, cohort. |
| orders | Sales & Order, Reports | Pesanan, item pesanan, transaksi customer. |
| marketing | Marketing, CRM | Import iklan, campaign metrics, leads, import batches. |
| crm | CRM | Closingan, follow-up, status grup, cluster, import CRM. |
| tracking | Data Tracking | Resi, pengiriman, COD, retur, histori status. |
| finance | Finance | Order finance, pemasukan, pengeluaran, rekonsiliasi, settlement. |
| warehouse | Warehouse/Gudang | Gudang, stok, mutasi, opname, mapping SKU gudang. |
| hris | HRIS | Karyawan, absensi, cuti, payroll, slip gaji. |
| iam | User Management | Akun login, role, permission, activity log. |
| staging | Import & Migrasi | Penampungan baris import sebelum masuk data utama. |
| reports | Reports | VIEW laporan final lintas domain. |
| analytics | Semua dashboard | Summary/materialized view untuk dashboard cepat. |
| **ai** | **AI Assistant** | **Riwayat percakapan, pesan, insight tersimpan (read-only atas data bisnis).** |
| audit | Kualitas Data | Data quality checks, perubahan mapping, log audit data. |
| system | Setting | Pengaturan aplikasi, backup, penomoran ID. |

> Definisi tabel lengkap (DDL) tiap schema ada di **[ARSITEKTUR_DATABASE.md](../ARSITEKTUR_DATABASE.md)**.

### 6.1 Prinsip Database Wajib
- Satu database PostgreSQL; tiap domain dipisah schema.
- ID entity berprefiks (PB-CUST-000001, ORD-000001, EMP-0001).
- Uang = BIGINT rupiah bulat.
- Nama asli data lama tetap disimpan (bisa diaudit).
- Data ragu = status `review`, bukan dihapus.
- Data penting = soft delete / status `archived`, bukan hapus fisik.
- Import baru masuk `staging` dulu.
- Reports = VIEW/analytics, bukan input ulang.

### 6.2 Tiga Jenis User yang Harus Dipisahkan

| Jenis | Tabel | Isi | Contoh |
|---|---|---|---|
| User data / CS | master.users | Nama CS/ADV/CRM di data penjualan lama (bukan login). | Rina, Fajar, Tim ADV |
| Akun login | iam.accounts | Akun masuk aplikasi, password hash, role, permission. | rina@probetes login Marketing |
| Karyawan HRIS | hris.employees | Kepegawaian: NIK, jabatan, gaji, absensi. | EMP-0007, Staff CRM |

Ketiganya bisa merujuk orang sama, tetapi tabel dipisah karena tujuan, hak akses, dan sensitivitas berbeda.

---

## 7. Roadmap Prioritas Pengerjaan per Fase

Bertahap agar sistem tidak kacau: data dasar rapi dulu sebelum laporan lanjutan, finance, HRIS, AI, dan automasi.

| Fase | Fokus | Output Utama |
|---|---|---|
| Fase 0 | Fondasi UI & struktur project | Home Launcher, style Probetes, route, layout, komponen reusable. |
| Fase 1 | Database Core | Ringkasan Data, Data Utama, Kualitas Data, Status Cadangan, customer ID, produk/channel/CS/ekspedisi. |
| Fase 2 | API tulis & data utama bisa diedit | Edit data, merge customer, mapping produk/channel, activity log. |
| Fase 3 | Staging & Import Aman | Import CSV/Excel masuk staging, preview, validasi, promote. |
| Fase 4 | Marketing Import Marketplace | TikTok, Shopee, Meta/Scalev: spending ads & data pesanan. |
| Fase 5 | Sales & Order dan Iklan & ROAS | Analitik penjualan, pesanan, produk, channel, ADV, campaign, ROAS. |
| Fase 6 | CRM dan RFM & Cohort | Import CRM, closingan, status grup, retention, frequency, cluster, detail customer. |
| Fase 7 | Data Tracking | Cek resi, status pengiriman, COD, retur, gagal kirim. |
| Fase 8 | Warehouse / Gudang | Stok, SKU per gudang, mutasi, opname, retur gudang, restock alert. |
| Fase 9 | Finance | Pemasukan, pengeluaran, HPP, margin, settlement, laba/rugi. |
| Fase 10 | IAM / User Management | Login, role, permission, activity log, pembatasan data sensitif. |
| Fase 11 | HRIS | Karyawan, absensi, cuti, payroll, komisi, laporan HRD. |
| Fase 12 | Reports Owner & Automasi/API | Laporan final lintas domain, API marketplace resmi, scheduled analytics refresh. |
| **Fase 13** | **AI Assistant & Insight** | **Tanya data bahasa natural (read-only), ringkasan otomatis, deteksi anomali, insight tersimpan.** |

> Catatan: versi ringan AI Assistant (tanya-jawab read-only atas Reports) bisa dimulai lebih awal setelah
> Reports (Fase 12) siap, lalu diperkaya di Fase 13.

---

## 8. Keputusan Owner yang Perlu Dikonfirmasi

| No | Keputusan | Kenapa Penting |
|---|---|---|
| 1 | HRIS: siapa yang boleh melihat NIK & gaji? | Data HRIS sensitif, dibatasi lewat IAM. |
| 2 | Komisi CS/CRM: otomatis dari order/leads atau input manual? | Berpengaruh ke payroll & laporan performa. |
| 3 | Gudang: stok berkurang otomatis tiap order atau update berkala (opname)? | Berpengaruh ke workflow warehouse. |
| 4 | SKU final produk: kode master baru atau ikut salah satu gudang? | Berpengaruh ke mapping produk & warehouse. |
| 5 | Role awal apa saja? | Usulan: Owner, Admin, Marketing, CS/CRM, Gudang, Finance, HR. |
| 6 | Data BigQuery lama: dipindah semua atau jadi referensi historis bertahap? | Berpengaruh ke migrasi & sinkronisasi. |
| 7 | Data review boleh diperbaiki oleh siapa? | Perlu SOP agar data tidak diedit sembarangan. |
| 8 | Reports owner: perlu export PDF/Excel atau cukup dashboard? | Berpengaruh ke fitur reports. |
| 9 | **AI Assistant: boleh baca data apa saja (termasuk HRIS/finance sensitif)? Model & anggaran biaya API?** | **Menentukan batas akses AI, keamanan data, dan biaya operasional.** |

---

## 9. Kesimpulan

PRD ini menjelaskan Probetes ERP sebagai sistem terpusat: menu kerja, database PostgreSQL modular,
alur import aman, analitik internal, laporan owner, AI Assistant, dan roadmap per fase.

- **Database** = pusat data utama & kualitas data.
- **Marketing** = import & analitik channel/iklan.
- **CRM** = pusat retention, frequency, cluster, follow-up customer.
- **Tracking, Finance, Warehouse, HRIS, User Management, Reports, AI Assistant** = dibuat bertahap sesuai prioritas.
- **PostgreSQL** = pusat database + analytics layer; BigQuery tidak wajib jadi ketergantungan utama.

Setiap menu punya tujuan, submenu, data yang ditampilkan, sumber database, alur user, dan output keputusan
yang jelas — agar development membangun sistem bisnis terintegrasi, bukan sekadar tampilan.
