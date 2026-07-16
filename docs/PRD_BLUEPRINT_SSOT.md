# PROBETES ERP — PRD & Blueprint Arsitektur SSOT

**Software Architecture + Product Requirements Document — acuan utama project**
Stack: Next.js (App Router) · TypeScript · React · Tailwind CSS · PostgreSQL via `pg` (node-postgres), tanpa ORM
Prinsip inti: **Single Source of Truth (SSOT)** — meniru logika Odoo & ERPNext, disederhanakan.

> Dokumen ini adalah acuan arsitektur. Sudah diselaraskan dengan skema PostgreSQL yang **sudah ada** di `data_migrasi/db/*.sql` (schema `master`, `orders`, `tracking`, `finance`, `marketing`, `staging`, `audit`). Yang belum ada (Warehouse ledger, Finance GL, HRIS, IAM) ditandai sebagai **BARU**.
>
> **Aturan implementasi:** seluruh akses database memakai SQL terparameterisasi melalui `pg` mentah. Contoh model di dokumen ini hanyalah notasi konseptual untuk menjelaskan tabel dan relasi; contoh tersebut bukan instruksi memasang atau menggunakan Prisma.

---

## Bagian 1 — Konsep Open-Source yang Diadaptasi

Kita **tidak menyalin** Odoo/ERPNext. Kita mengambil 6 pola arsitektur intinya dan menyederhanakannya.

### 1.1 Partner Tunggal (dari Odoo `res.partner`)

**Masalah Probetes:** customer lama terbaca sebagai customer baru; nama toko, CS, dan mitra tercampur di satu kolom "channel".

**Adaptasi:** satu tabel `Customer` sebagai identitas tunggal, di-*dedup* dengan kunci **nomor HP ternormalisasi** (`62xxx`). Semua modul (Order, Tracking, Finance, CRM) menunjuk ke `customer_id` yang sama. Sudah diterapkan di `master.customers` + logika merge di `audit.customer_merges`.

```
Odoo res.partner  →  Probetes master.customers (+ customer_cohorts)
```

### 1.2 General Ledger Terpusat (dari Odoo/ERPNext `account.move`)

**Masalah:** uang dicatat berkali-kali di Sheet berbeda (COD, settlement, biaya iklan) sehingga laba rugi tidak pernah cocok.

**Adaptasi:** setiap kejadian uang menghasilkan **Journal Entry** di satu buku besar (`finance.ledger_entries` — **BARU**). Laba Rugi = query agregasi buku besar, bukan input ulang. Ini yang membuat menu Finance tidak "kerja dua kali".

```
account.move / GL Entry  →  Probetes finance.ledger_entries (double-entry ringan)
```

### 1.3 Stock Move sebagai Sumber Kebenaran Stok (dari Odoo `stock.move`)

**Masalah:** stok hanya angka yang diketik manual; tidak ada jejak kenapa stok berkurang.

**Adaptasi:** stok **tidak pernah** disimpan sebagai angka statis yang diedit. Stok = `SUM(stock_moves)`. Setiap barang masuk/keluar/mutasi/opname adalah satu baris *move*. On-hand dihitung, bukan diketik. (Ini "double-entry inventory" versi ringan.)

```
stock.move / Stock Ledger Entry  →  Probetes warehouse.stock_moves (BARU)
```

### 1.4 Dokumen Berstatus + State Machine (dari kedua sistem)

Setiap dokumen operasional (Order, Shipment, Payroll Run, Import Batch) punya `status` dengan transisi yang jelas: `draft → confirmed → done → cancelled`. Import batch sudah memakai ini (`preview → completed → cancelled`).

### 1.5 Staging Sebelum Commit (pola ETL Data Import ERPNext)

Data mentah masuk `staging.import_rows` dulu, divalidasi, baru **promote** ke tabel utama. Sudah jalan penuh di modul Marketing Import. Pola yang sama dipakai ulang untuk Tracking (Everpro) dan Warehouse.

### 1.6 RBAC + Audit Log (dari Frappe Role Permission)

Role → Permission (per modul + aksi), dicek di server. Semua perubahan penting ditulis ke `audit.change_log` (sudah ada). Aktor default `"app"` sampai IAM aktif.

### Yang **TIDAK** kita ambil (sengaja disederhanakan)

- Chart of Accounts penuh bergaya akuntansi → cukup buku besar kategori + akun ringkas.
- Modul MRP/Manufacturing, multi-company, multi-currency → tidak relevan.
- e-Faktur/Coretax bawaan Odoo → nanti sebagai integrasi terpisah bila diperlukan.

---

## Bagian 2 — Logika SSOT: Siklus Hidup Satu Data

Prinsip: **data diinput/diimpor SATU KALI di modul "pemiliknya", modul lain hanya membaca (read) atau menambah dokumen turunan (derive), tidak mengetik ulang.**

### 2.1 Peta Kepemilikan Data (siapa boleh menulis)

| Entitas | Modul Pemilik (WRITE) | Modul Pembaca (READ/DERIVE) |
|---|---|---|
| Customer | Database (Master) / Marketing Import | CRM, Tracking, Finance, Reports |
| Order + Order Item | Marketing (Import/Sales) | Tracking, Finance, Warehouse, Reports |
| Shipment / Resi / COD | Data Tracking | Finance (settlement), Reports |
| Stock Move | Warehouse | Reports, Finance (HPP) |
| Ledger Entry (uang) | Finance | Reports |
| Ad Spend | Marketing (Import Iklan) | Reports (ROAS) |
| Employee / Attendance / Payroll | HRIS | Finance (biaya gaji), Reports |
| Account / Role | User Management | semua modul (authz) |

### 2.2 Alur Konkret: "Ibu Ani beli 2 produk lewat TikTok, bayar COD, lalu retur 1"

Ini contoh nyata yang menyentuh 6 modul TANPA input ulang:

```
[1] MARKETING → Import Data Channel
    File TikTok diupload → staging → validasi → COMMIT
    ├─ Customer "Ibu Ani" dicari via HP 62812xxx
    │  └─ Belum ada → dibuat 1x (customer_id = PB-CUST-XXXX)   [SSOT identitas]
    ├─ Order ORD-123 dibuat (1 header)                          [SSOT transaksi]
    └─ 2 Order Item (Herbal x2, Ebook x1)                       [grain benar]

[2] DATA TRACKING → Import Everpro / Cek Resi
    Baris resi dicocokkan ke ORD-123 (BUKAN buat order baru)
    ├─ Shipment dibuat: resi, kurir, status "in_transit"        [SSOT logistik]
    └─ COD Payment: nominal, fee, status "belum_cair"

[3] Kurir kirim → status jadi "delivered" → COD cair
    DATA TRACKING update Shipment + COD Payment
    └─ Trigger: Finance otomatis buat Ledger Entry
       ├─ (D) Kas COD masuk        Rp X
       ├─ (K) Penjualan            Rp Y
       └─ (D) Fee COD (biaya)      Rp Z                          [SSOT uang]

[4] Ibu Ani retur 1 Ebook
    DATA TRACKING → Retur & Gagal Kirim: buat Return doc
    ├─ WAREHOUSE otomatis: Stock Move (+1 masuk gudang retur)   [SSOT stok]
    └─ FINANCE otomatis: Ledger Entry balik (kurangi penjualan) [SSOT uang]

[5] REPORTS (read-only)
    Semua laporan = QUERY dari data di atas. Tidak ada angka diketik.
    ├─ Laporan Penjualan   = SUM(orders)
    ├─ Laporan Tracking    = COUNT(shipments by status)
    ├─ Laporan Finance     = SUM(ledger_entries)
    └─ Laporan Marketing   = ad_spend vs orders → ROAS

[6] AI ASSISTANT (read-only)
    "Berapa COD belum cair minggu ini?" → query ledger + tracking → jawab.
```

**Inti SSOT:** angka "Rp Y penjualan" hanya hidup di `orders`. Finance & Reports **menghitungnya**, tidak menyimpannya ulang. Jika order dikoreksi, semua laporan ikut benar otomatis.

### 2.3 Aturan Teknis SSOT (wajib dipatuhi tiap fitur)

1. **Derived field = computed, bukan stored.** Contoh: `on_hand`, `transaction_count`, `total_spent`, `ROAS`, `laba` dihitung via query/agregasi SQL. Kalau di-*cache* (untuk performa), harus ada job re-compute + tandai `computed_at`.
2. **Foreign key, bukan copy string.** Order menyimpan `customer_id`, bukan menyalin nama+alamat (kecuali snapshot alamat kirim yang memang berbeda per order).
3. **Import = staging → validate → promote.** Tidak ada tulis langsung ke tabel utama dari file.
4. **Uang hanya lewat Ledger.** Modul lain tidak menulis saldo; mereka memicu pembuatan Ledger Entry.
5. **Semua mutasi tercatat di audit.**

---

## Bagian 3 — Detail Per Menu & Sub-Menu

Notasi model konseptual di bawah memakai bentuk mirip Prisma agar relasi ringkas dan mudah dibaca. Implementasi fisiknya tetap berupa migration SQL per schema dan query `pg`; uang memakai `BIGINT` (rupiah bulat), sedangkan ID memakai tipe PostgreSQL yang sesuai dengan schema aktual.

---

## MENU 1 — DATABASE

**Fungsi:** pusat master data & kualitas data. Ini "kamus" ERP: identitas customer, produk, channel, kurir, tim. Modul lain **membaca** dari sini.

### 1a. Master Data

**Deskripsi:** kelola entitas acuan yang stabil (jarang berubah): Pelanggan, Produk, Channel, CS/Tim, Ekspedisi, Database Cohort.

**Struktur Database (sudah ada di `schema.sql`):**

```prisma
model Customer {
  customerId       String   @id @map("customer_id")
  name             String?
  phone            String?
  phoneNormalized  String?  @map("phone_normalized")   // KUNCI DEDUP
  address          String?
  city             String?
  province         String?
  status           String?  // Baru | Repeat | Potensi Duplikat | Review
  isCrmTarget      Boolean? @map("is_crm_target")
  channelId        String?  @map("channel_id")
  csId             String?  @map("cs_id")
  orders           Order[]
  cohort           CustomerCohort?
  @@index([phoneNormalized])
  @@schema("master")
  @@map("customers")
}

model Product {
  productId        String  @id @map("product_id")
  productFinalName String? @map("product_final_name")
  sku              String?
  category         String? // digital | fisik | hp_amandia
  productLine      String? @map("product_line")
  items            OrderItem[]
  @@schema("master")
  @@map("products")
}
```

Relasi: `Customer 1—1 CustomerCohort`, `Customer 1—N Order`, `Product 1—N OrderItem`, `Channel 1—N Order`.

**Workflow:** buka tab (mis. Pelanggan) → tabel dengan search/filter/sort/pagination → klik baris = Detail → tombol Edit (khusus field identitas, tercatat audit) → Simpan (API + `audit.change_log`). Deteksi duplikat menampilkan badge "Potensi Duplikat" + aksi **Gabung** (reversible via `audit.customer_merges`).

**Wireframe/UI:**
```
┌──────────────────────────────────────────────┐
│ Master Data                    [Kembali]     │
│ [Pelanggan][Cohort][Produk][Channel][CS][Eksp]│  ← tab
├──────────────────────────────────────────────┤
│ 🔍 Cari…   [Filter status ▾]   [Export]      │
│ ┌──────────────────────────────────────────┐ │
│ │ ID │ Nama │ HP │ Kota │ Trx │ Status │ ⋮ │ │  ← tabel
│ └──────────────────────────────────────────┘ │
│ ‹ 1 2 3 › (server-side paging)               │
└──────────────────────────────────────────────┘
```
UX: aksi destruktif (gabung/hapus) selalu ada modal konfirmasi. Nomor HP tampil penuh (keputusan owner), tanpa masking.

### 1b. Kualitas Data

**Deskripsi:** dashboard "kesehatan data" — persen customer tanpa HP, produk belum ter-mapping, order tanpa channel, dll. Rumus terpusat di `apps/web/src/lib/quality-sql.ts`.

**DB:** tidak ada tabel baru; ini **view/agregasi** atas master + orders. Boleh materialized view `audit.data_quality_checks` (sudah ada) untuk snapshot harian.

**Workflow:** buka → lihat KPI kartu (mis. "1.240 customer perlu dicek") → klik kartu = drill-down ke daftar baris bermasalah → tombol menuju Master Data untuk perbaiki.

**UI:** grid kartu KPI (angka besar + tren) → klik → tabel isu. Read-first, aksi mengarah ke Master Data (tidak menulis di sini).

### 1c. Backup & Cadangan

**Deskripsi:** status jadwal backup DB + riwayat. Tahap awal: read-only/status.

**DB (`system` schema, sebagian ada):**
```prisma
model BackupHistory {
  id         BigInt   @id @default(autoincrement())
  runAt      DateTime @map("run_at")
  type       String   // manual | terjadwal
  location   String?
  sizeBytes  BigInt?  @map("size_bytes")
  status     String   // Berhasil | Gagal | Berjalan
  @@schema("system")
  @@map("backup_history")
}
```

**Workflow:** lihat tabel riwayat (terbaru di atas), badge status. Tombol "Backup Sekarang" tahap awal *disabled/preview*.

**UI:** tabel sederhana + kartu status "Backup terakhir: 2 hari lalu".

### 1d. Overview (Ringkasan Data)

**Deskripsi:** halaman ringkasan bisnis dari database asli (KPI pelanggan, pesanan, produk, segmen RFM). **Semua angka dari query, tidak ada hardcode.**

**DB:** agregasi `master.customers`, `orders`, `customer_cohorts`.

**Workflow:** buka → 3 baris KPI (angka inti → kondisi pelanggan/donut RFM → kesehatan data yang link ke 1b).

**UI:** kartu KPI + donut segmen + rentang tanggal data.

---

## MENU 2 — MARKETING

**Fungsi:** pintu masuk utama data penjualan & iklan (SSOT untuk Order & Ad Spend). Ini modul paling matang.

**Keputusan struktur produk:** TikTok, Shopee, Meta/Akuisisi, CRM, dan Konsulen adalah **submenu sekaligus workspace kerja yang terpisah secara tampilan, navigasi, hak akses, dan scope data**. Pemisahan ini bukan pemisahan parser, business logic, database, atau sumber kebenaran. Khusus TikTok, Shopee, dan Meta/Akuisisi, seluruh file tetap mengerucut ke **satu Marketing Import Engine**, satu staging pipeline, satu kontrak normalisasi, dan tabel final yang sama.

> **Invariant SSOT:** banyak pintu masuk, satu corong data. Dilarang membuat salinan importer, parser orchestration, validator, commit service, repository, rumus KPI, riwayat, atau tabel final khusus platform seperti `tiktok_orders`, `shopee_orders`, dan `meta_ads_metrics`. Perbedaan format file ditangani oleh shared parser entrypoint serta adapter/alias sumber yang sudah ada.

### 2a. Struktur Menu & Workspace Marketing

**Tujuan UX:** karyawan langsung masuk ke area kerja sesuai tanggung jawabnya sehingga tidak perlu memilih platform secara manual dan tidak dapat salah mengunggah file ke platform lain.

**Navigasi utama:** submenu berikut tampil langsung di bawah menu Marketing, mengikuti permission pengguna.

```text
Marketing
├── TikTok
├── Shopee
├── Meta / Akuisisi
├── CRM
└── Konsulen
```

Klik salah satu submenu membuka **workspace khusus** dengan sidebar internal. Saat berada di workspace TikTok, sidebar internal hanya menampilkan fitur TikTok; nama dan fitur Shopee, Meta, CRM, atau Konsulen tidak ikut tampil. Perpindahan domain dilakukan melalui aksi **Kembali ke Marketing**, bukan accordion platform di dalam satu dashboard generik.

| Workspace | Submenu internal | Sumber baca / target tulis SSOT | Scope wajib |
|---|---|---|---|
| **TikTok** | Dashboard; Import Data → Spending Ads, Data Pesanan; Laporan Iklan; Pesanan & Penjualan; Toko & Stok; Data Review; Riwayat Import | `marketing.ad_campaign_metrics`, `orders.orders`, `orders.order_items`, master customer/produk, pipeline import bersama | source platform TikTok + toko/ADV yang ditugaskan |
| **Shopee** | Dashboard; Import Data → Spending Ads, Data Pesanan; Laporan Iklan; Pesanan & Penjualan; Toko & Stok; Data Review; Riwayat Import | tabel dan pipeline canonical yang sama dengan TikTok | source platform Shopee + toko/ADV yang ditugaskan |
| **Meta / Akuisisi** | Dashboard; Import Data → Spending Ads Meta, Data Pesanan Scalev; Laporan Iklan; Pesanan & Penjualan; Data Review; Riwayat Import | `marketing.ad_campaign_metrics`, order hasil Scalev di `orders.*`, master customer/produk, pipeline import bersama | source platform Meta/Scalev + ad account/ADV yang ditugaskan |
| **CRM** | Dashboard; Import Data → Spending Ads, Data Pesanan; Laporan Iklan; Pelanggan & Pesanan; RFM & Cohort; Follow-up; Data Review; Riwayat Import | pintu import CRM tetap memakai engine yang sama; fakta ads/order tetap masuk ke tabel canonical, sedangkan aktivitas CRM masuk ke domain CRM | source platform + `business_scope = crm` + customer/tim yang ditugaskan |
| **Konsulen** | Dashboard; Customer Remisi; Konsultasi Harian; Follow-up Harian | membaca `master.customers` dan `orders.*`; menulis aktivitas konsultasi/follow-up dengan FK ke customer dan karyawan | scope customer/tim konsulen |

**Batas domain:**

1. Dashboard TikTok/Shopee/Meta adalah query bersama yang diberi filter platform permanen di server, bukan dashboard dan rumus baru per platform.
2. Kebutuhan **Import Data → Spending Ads dan Data Pesanan** di CRM tetap dipertahankan. Secara arsitektur, CRM adalah workspace/business scope, bukan `platform_code` baru. Default sumbernya adalah campaign Meta untuk tim/tujuan CRM dan order Scalev yang ditangani CRM; keduanya melewati engine Meta/Scalev yang sama, memakai file hash/dedup key yang sama, dan tidak boleh menghasilkan fakta kedua jika file sudah pernah masuk dari workspace Meta/Akuisisi.
3. Sebelum Import CRM diaktifkan, owner bisnis wajib menyetujui classifier canonical seperti `business_scope`, `team_id`, campaign ownership/objective, serta assignment order. Jika classifier belum tersedia, menu tetap boleh terlihat sebagai **Belum Tersedia**; sistem dilarang menebak dari nama campaign atau mengaktifkan commit. Bila kelak ada file native CRM, file itu hanya boleh memuat lead, assignment, follow-up, outcome, dan aktivitas lain—bukan menyalin order/spending marketplace.
4. Konsulen tidak membuat master customer atau order kedua. Konsultasi dan follow-up selalu mereferensikan `customer_id`, `order_id` bila relevan, dan `employee/account_id` pelaksana.
5. Istilah dan aturan **Customer Remisi** wajib dipastikan bersama owner bisnis sebelum schema atau automasi dibuat.
6. Toko & Stok marketplace tidak menjadi SSOT stok fisik. Stok fisik tetap berasal dari Warehouse Stock Move; stok listing marketplace, bila diambil, disimpan sebagai snapshot berwaktu dan diberi label waktu sinkronisasi.
7. Perbandingan lintas platform untuk Owner/Admin ditempatkan sebagai laporan agregat read-only di **MENU 8 — REPORTS**, bukan mencampur jalur kerja harian semua platform dalam satu sidebar Marketing.

**Shell UI yang dipakai bersama:**

```text
┌──────────────────────────────────────────────────────────┐
│ ← Kembali ke Marketing   [Identitas Workspace + Role]    │
├────────────────┬─────────────────────────────────────────┤
│ Dashboard      │ Judul workspace + periode + data segar  │
│ Import Data *  │ KPI / chart / tabel sesuai halaman      │
│ Laporan ...    │                                         │
│ Data Review    │ Empty / Loading / Error / Success       │
│ Riwayat Import │                                         │
└────────────────┴─────────────────────────────────────────┘
```

`*` Item sidebar bersifat conditional berdasarkan konfigurasi dan permission workspace; Konsulen tidak menampilkan Import Data marketplace. Desktop memakai sidebar internal persisten. Mobile memakai drawer dengan identitas workspace tetap terlihat di header. Halaman yang bersumber dari import/sinkronisasi wajib menampilkan periode data, waktu import/sinkronisasi terakhir, serta jumlah baris perlu review. Halaman aktivitas menampilkan freshness/status aktivitasnya sendiri. Semua halaman wajib mempunyai state default, loading, empty, error, success, dan forbidden.

**Akses:** role menjelaskan kemampuan, sedangkan assignment menjelaskan platform, toko, ADV/ad account, dan tim yang boleh diakses. Navigasi yang disembunyikan hanya untuk UX; preview, commit, cancel, history, export, dan API laporan tetap memeriksa session, permission, serta scope di server. Nilai `imported_by`/aktor audit berasal dari session, bukan input browser atau teks role bebas pada data karyawan.

**Prasyarat production:** IAM minimal (account, login/session, role-permission, aktor audit nyata) dan assignment scope harus tersedia sebelum workspace ini boleh diklaim aman berdasarkan role. Kontrak assignment minimum berbentuk `account_id + domain + platform_code/source_platform + store_id/ad_account_id/team_id` sesuai kebutuhan. Selama IAM minimal belum tersedia, pemisahan halaman hanya peningkatan UX dan **bukan** kontrol keamanan; commit production berbasis role belum boleh dirilis.

**Route UI target:**

```text
/marketing/tiktok/*
/marketing/shopee/*
/marketing/meta/*
/marketing/crm/*
/marketing/konsulen/*
```

Route berbeda hanya menjadi **presentation/access boundary**. Implementasi frontend menggunakan satu `MarketingWorkspaceShell`, satu feature import reusable, dan konfigurasi workspace (`lockedPlatform`, `allowedImportTypes`, `navigation`, `permissionScope`). Service, repository, shared parser entrypoint/adapters, staging, commit transaction, dan query KPI tidak disalin.

### 2b. Shared Marketing Import Engine (Import Data Channel)

**Deskripsi:** upload CSV/XLSX TikTok/Shopee/Meta → normalisasi → preview → commit. Ada tab **Admin Inputer** (lengkapi identitas pelanggan tersensor via ID Pesanan/resi). Sudah terimplementasi.

Bagian ini adalah **kontrak canonical satu-satunya** untuk seluruh halaman import TikTok, Shopee, Meta/Akuisisi, dan pintu import CRM yang bersumber dari Meta/Scalev. Pemisahan workspace hanya mengubah shell, label, route, platform lock/source scope, pilihan sumber yang diizinkan, dan riwayat yang ditampilkan. Algoritma parsing, alias, normalisasi, deduplikasi, validasi, preview, commit atomik, audit, serta target database tidak berubah dan tidak boleh di-fork.

Jalur direct-write iklan legacy seperti `/api/marketing/ads/import` bukan write path resmi dan wajib dipensiunkan sebelum workspace baru dinyatakan selesai. Jika `marketing.ad_import_batches` masih dibutuhkan selama migrasi, fungsinya hanya compatibility/lineage; target akhirnya seluruh fakta iklan menunjuk ke `marketing.import_batches` canonical dan melewati staging yang sama.

**Struktur DB (sudah ada `marketing` + `staging`):**
```prisma
model ImportBatch {
  batchId       String   @id @default(uuid()) @map("batch_id")
  platform      String   // tiktok | shopee | meta
  importType    String   @map("import_type") // ads | order
  status        String   // preview|completed|cancelled|failed|expired
  totalRows     Int      @map("total_rows")
  validRows     Int      @map("valid_rows")
  rows          ImportRow[]
  @@schema("marketing")
  @@map("import_batches")
}

model ImportRow {
  rowId            BigInt  @id @default(autoincrement()) @map("row_id")
  batchId          String  @map("batch_id")
  rawData          Json    @map("raw_data")
  parsedData       Json    @map("parsed_data")
  displayData      Json    @map("display_data")
  validationStatus String  @map("validation_status") // valid|review|error|duplicate
  duplicateKey     String? @map("duplicate_key")
  promotedId       String? @map("promoted_id")
  batch            ImportBatch @relation(fields: [batchId], references: [batchId])
  @@schema("staging")
  @@map("import_rows")
}
```
Referensi promote: `ImportRow.promotedId` saat ini berfungsi sebagai logical audit pointer ke order atau metrik iklan, bukan satu foreign key fisik ke dua tabel. Target kontrak audit menyimpan pasangan `target_entity + target_id` agar tipe tujuan eksplisit.

**Workflow (state machine):**
```
Masuk Workspace → Server mengunci Platform + memeriksa Permission/Assignment
→ Platform (terisi dan read-only) → Jenis (Ads/Order) → Pilih ADV/Toko + Periode → Upload
→ Shared Parser Entrypoint + adapter/alias sumber yang sesuai
→ normalisasi (alias kolom, tanggal, dedup multi-produk)
→ PREVIEW (tabel baku, badge: Valid/Perlu Dicek/Duplikat/Error)
→ [Cancel]  atau  [Simpan ke Database] (hanya baris valid di-promote)
→ Riwayat workspace (default Completed; status Preview/Failed/Cancelled tersedia lewat filter sesuai izin)
```

Halaman Import Center generik yang sudah ada dipertahankan hanya sebagai compatibility route selama migrasi dan diarahkan ke workspace yang sesuai; ia bukan jalur kerja utama dan tidak menambah pipeline kedua. Bahkan untuk Owner/Admin, server tetap mencocokkan fingerprint header file, platform batch, dan scope akun. Platform dari payload browser tidak pernah dipercaya tanpa verifikasi ulang saat preview dan commit.

**Admin Inputer:** saat ini berlaku untuk order TikTok/Shopee: cari `platform + toko + ID Pesanan` (resi = alternatif) → tampil order read-only → hanya edit nama/HP/alamat → cek kandidat HP kembar (tidak auto-merge) → simpan (optimistic lock `xmin`, audit). Dukungan order Scalev/Meta baru boleh diaktifkan setelah lookup key dan masking contract-nya tervalidasi.

**UI:** konsep wizard tetap sama: **Platform → Jenis Import → Detail & Upload → Preview** dengan step indicator merah. Di workspace platform, langkah Platform otomatis selesai dan terkunci; pengguna tidak memilih ulang. Preview tetap berupa tabel virtualized dengan kolom **Tanggal paling kiri**, filter status, pagination, ringkasan validasi, dan tombol aksi kanan-bawah (Cancel / Upload Ulang / Simpan). Halaman bukan membuat importer baru, melainkan merender feature import yang sama menggunakan konfigurasi workspace.

**Kontrak normalisasi preview/CSV:** Ads hanya menampilkan tanggal, platform, ADV, campaign, spending, tayangan, klik, CTR, pesanan, nilai konversi, CPA, dan ROAS Platform. Order menampilkan header order satu kali serta item produk per baris (subtotal item terpisah dari total order). `CTR`, `CPA`, dan `ROAS Platform` adalah nilai turunan dari metrik dasar, bukan disimpan ulang sebagai sumber kebenaran.

### 2c. Sales & Order Center

**Deskripsi:** pusat baca pesanan hasil import (overview, produk, channel, CS/CRM, status/COD, retur). Read + koreksi ringan.

Di dalam workspace platform, halaman ini selalu memakai filter platform/toko di server. TikTok, Shopee, dan Meta/Akuisisi tetap membaca `orders.orders` dan `orders.order_items` yang sama; tidak ada tabel order atau perhitungan omzet per workspace. Satu order multi-produk memiliki satu header dan banyak item, sedangkan omzet order dihitung satu kali dari header canonical.

**DB (sudah ada `orders`):**
```prisma
model Order {
  orderId      String   @id @map("order_id")
  customerId   String?  @map("customer_id")
  orderDate    DateTime? @map("order_date") @db.Date
  channelId    String?  @map("channel_id")
  csId         String?  @map("cs_id")
  courierId    String?  @map("courier_id")
  paymentMethod String? @map("payment_method")
  paymentStatus String? @map("payment_status")
  totalAmount  BigInt?  @map("total_amount")
  orderStatus  String?  @map("order_status")
  flag         String?  // valid | review
  customer     Customer? @relation(fields: [customerId], references: [customerId])
  items        OrderItem[]
  shipment     Shipment?
  @@index([orderDate]); @@index([customerId]); @@index([channelId])
  @@schema("orders")
  @@map("orders")
}

model OrderItem {
  orderItemId String  @id @map("order_item_id")
  orderId     String  @map("order_id")
  productId   String? @map("product_id")
  qty         Int?
  unitPrice   BigInt? @map("unit_price")
  subtotal    BigInt?
  order       Order   @relation(fields: [orderId], references: [orderId])
  @@schema("orders")
  @@map("order_items")
}
```

**Gap schema saat ini:** `orders.orders` baru memiliki `channel_id`; identitas source platform, toko, external order ID, dan batch lineage belum cukup eksplisit untuk menjamin filter workspace/toko serta mencegah bentrok nomor order lintas platform. Sebelum laporan per toko atau authorization scope dinyatakan production-ready, tambahkan migration additive **BARU** untuk source identity canonical, misalnya:

```text
orders.order_sources
├── order_id             → orders.orders.order_id
├── platform_code        // tiktok | shopee | meta
├── source_key           // store/ad account/source yang sudah dinormalisasi
├── external_order_id
└── import_batch_id      → marketing.import_batches.batch_id

UNIQUE (platform_code, source_key, external_order_id)
```

Selama migration tersebut belum tersedia, filter platform hanya boleh memakai mapping `channel_id` dan lineage batch yang tervalidasi; filter toko harus diberi status **Belum Tersedia**, bukan diasumsikan aman. External ID tetap dipreservasi sebagai identitas sumber, sedangkan strategi migrasi primary key order harus backward-compatible dan tidak boleh mereset data.

**Workflow:** filter periode → daftar order → klik = detail (items, customer, shipment, finance) → koreksi non-uang langsung; koreksi uang → butuh approval (lihat Finance).

**UI:** header filter periode + KPI baris (order valid, omzet, produk teratas) → tabel order → drawer/detail. **Reports = read-only turunannya.**

### 2d. CRM & Retention

**Deskripsi:** workspace customer berbasis cohort + RFM: baru/repeat/high-value/perlu follow-up/konsultasi WA. Customer, order, spending, dan omzet tidak diinput ulang. Input native CRM hanya aktivitas seperti lead, assignment, follow-up, outcome, dan catatan yang mereferensikan data canonical.

**Import CRM:** UI menggunakan wizard import yang sama. `Spending Ads` diarahkan ke adapter Meta dan `Data Pesanan` diarahkan ke adapter Scalev, lalu diberi business scope/assignment CRM; platform canonical tetap Meta/Scalev. Jika batch/file yang sama sudah pernah masuk melalui Meta/Akuisisi, CRM hanya membaca hasil yang sama dan commit ulang ditolak sebagai duplikat. Sampai classifier `business_scope/team/campaign ownership` disetujui dan tersedia, kedua submenu import CRM tampil disabled dengan penjelasan—bukan memakai data mock atau menebak berdasarkan nama file.

**DB (sudah ada `customer_cohorts`):**
```prisma
model CustomerCohort {
  customerId        String  @id @map("customer_id")
  cohortMonth       String? @map("cohort_month")
  firstPurchaseDate DateTime? @map("first_purchase_date") @db.Date
  lastPurchaseDate  DateTime? @map("last_purchase_date") @db.Date
  frequency         Int
  totalSpent        BigInt  @map("total_spent")
  cluster           String?
  rScore            Int?    @map("r_score")
  fScore            Int?    @map("f_score")
  mScore            Int?    @map("m_score")
  rfmSegment        String? @map("rfm_segment")
  customer          Customer @relation(fields: [customerId], references: [customerId])
  @@schema("master")
  @@map("customer_cohorts")
}
```
`cohort` dan `total_spent` dihitung ulang (job/materialized projection) dari `orders`, bukan diketik → SSOT. Projection wajib memiliki `computed_at`/freshness dan dapat dibangun ulang; ia bukan sumber transaksi kedua.

**Workflow:** pilih segmen (mis. "Lama Tidak Beli") → daftar customer + kontak → export daftar broadcast WA → tandai follow-up.

**UI:** panel segmen (chip) di kiri + tabel customer di kanan + donut distribusi RFM. Aksi: "Export Daftar WA", "Tandai Follow-up".

### 2e. Iklan & ROAS

**Deskripsi:** performa iklan per platform/ADV/campaign + ROAS platform. Data dari `ad_campaign_metrics`.

**DB (sudah ada):** `marketing.ad_campaign_metrics` (spend, purchases, purchase_value, impressions, clicks, dst). Simpan **metrik dasar**; ROAS/CTR/CPA **dihitung**.

**Workflow:** platform dikunci oleh workspace → filter periode/ADV/campaign → KPI (spend, sales platform, ROAS) → tabel per campaign → drill ADV/toko. TikTok bulanan: tanggal dari periode input (bukan waktu posting).

**UI:** filter bar + KPI + chart tren spend-vs-sales + tabel campaign. Workspace TikTok/Shopee/Meta tidak memakai tab untuk berpindah platform. Tab lintas platform hanya boleh ada pada laporan agregat Owner/Admin di MENU 8; rumus dan sumber datanya tetap sama.

> **Catatan SSOT ROAS:** ROAS Platform = `purchase_value / spend` (dari file iklan). ROAS ERP (attributed) BELUM tersedia sampai ada kunci hubung campaign→order. Beri label eksplisit "ROAS Platform".

### 2f. Toko & Stok Marketplace

**Deskripsi:** ringkasan performa toko, produk terjual, dan—jika integrasi tersedia—snapshot stok listing TikTok/Shopee. Halaman ini tidak menulis stok fisik dan tidak menggantikan Warehouse.

**Workflow:** platform/toko terkunci sesuai assignment → pilih periode → lihat omzet/pesanan/top product → bandingkan snapshot listing terakhir dengan stok gudang → tandai selisih untuk ditinjau.

**UI:** identitas toko + data freshness → KPI toko → tabel produk → label jelas **Stok Listing Marketplace** dan **Stok Fisik Gudang**. Jika ledger/snapshot belum tersedia, tampilkan state unavailable yang jujur, bukan angka mock tanpa label.

### 2g. Konsulen

**Deskripsi:** workspace operasional untuk customer remisi, konsultasi harian, dan follow-up harian. Workspace membaca customer/order canonical dan hanya menulis aktivitas konsultasi; tidak membuat customer, order, atau omzet kedua.

**Kontrak minimum data baru (BARU, setelah definisi bisnis disetujui):** activity/consultation memiliki `customer_id`, `employee/account_id`, waktu aktivitas, jenis, outcome/status, `order_id` opsional, catatan, dan audit fields. Detail schema ditetapkan melalui migration additive setelah aturan Customer Remisi, ownership customer, dan workflow follow-up disetujui owner bisnis.

**UI:** daftar kerja harian → filter customer/status/konsulen → detail riwayat customer → catat konsultasi/follow-up → status sukses/gagal/jadwal ulang. Wajib memiliki loading, empty, error, success, forbidden, dan conflict state.

### 2h. Acceptance Criteria Workspace Marketing

1. Menu Marketing menampilkan TikTok, Shopee, Meta/Akuisisi, CRM, dan Konsulen sebagai submenu langsung sesuai permission.
2. Setelah masuk suatu workspace, sidebar internal hanya memuat fitur workspace tersebut; tersedia aksi **Kembali ke Marketing**.
3. TikTok, Shopee, dan Meta memakai satu komponen import, satu orchestration flow `parse → map → validate → stage → commit`, satu commit transaction, serta tabel staging/final yang sama.
4. Platform dikunci oleh route + session scope. File Shopee di workspace TikTok atau file TikTok di workspace Meta ditolak sebelum promote dengan pesan mismatch yang jelas.
5. Setelah prasyarat IAM minimal terpenuhi, akses di luar permission/scope menghasilkan `403`; payload client tidak dapat mengubah platform, toko, ADV, atau batch menjadi milik scope lain. Sebelum itu, UI split tidak boleh dianggap sebagai security control.
6. Preview tetap memakai kontrak normalisasi baku, kolom tanggal paling kiri, ringkasan valid/review/duplicate/error, raw data untuk audit, dan CTA simpan hanya untuk data yang lolos aturan.
7. Upload ulang, retry, atau dua commit paralel tidak menggandakan spending, order, maupun item. Satu order multi-produk tetap satu order, banyak item, dan omzet dihitung satu kali.
8. Dashboard platform tidak membocorkan data workspace lain. Angka laporan lintas platform harus dapat direkonsiliasi dengan agregasi dashboard platform pada periode/filter yang sama.
9. `CTR`, `CPA`, `ROAS Platform`, omzet, dan KPI turunan memakai satu implementasi/query canonical; tidak dihitung dengan rumus berbeda di setiap page.
10. Riwayat, preview detail, cancel, commit, export, dan Data Review difilter serta diotorisasi server-side.
11. Menu Import CRM tetap tersedia sesuai requirement, tetapi menggunakan adapter Meta/Scalev dan dedup key canonical; file/batch yang sama tidak menghasilkan order atau spending kedua. Konsulen tidak membuat customer/order kedua.
12. Implementasi dianggap selesai setelah fixture file asli tiap sumber, mismatch platform, authorization, atomic multi-produk, idempotency/concurrency, responsive UI, `pnpm typecheck`, dan `pnpm build` lulus.

---

## MENU 3 — DATA TRACKING

**Fungsi:** SSOT logistik. Semua resi/COD/retur dicatat & dicocokkan ke Order yang sudah ada.

### 3a. Import Data Everpro

**Deskripsi:** upload export Everpro (agregator resi) → staging → cocokkan ke Order via **ID Pesanan/Resi** → promote ke Shipment/COD.

**DB (reuse pola staging + tabel `tracking` yang sudah ada):**
```prisma
model Shipment {
  shipmentId     String  @id @map("shipment_id")
  orderId        String? @map("order_id")
  trackingNumber String? @map("tracking_number")
  customerId     String? @map("customer_id")
  courierId      String? @map("courier_id")
  packageStatus  String? @map("package_status") // menunggu|in_transit|delivered|gagal|retur
  codStatus      String? @map("cod_status")
  order          Order?  @relation(fields: [orderId], references: [orderId])
  @@schema("tracking")
  @@map("shipments")
}

model CodPayment {
  codPaymentId String  @id @map("cod_payment_id")
  orderId      String? @map("order_id")
  totalPayment BigInt? @map("total_payment")
  codFee       BigInt? @map("cod_fee")
  settledDate  DateTime? @map("settled_date") @db.Date
  codStatus    String? @map("cod_status") // belum_cair|cair
  @@schema("tracking")
  @@map("cod_payments")
}
```

**Workflow:** upload → preview (baris resi + status match ke order) → baris tanpa order = "Perlu Dicek" → commit yang match. **Tidak buat order baru dari sini** (order milik Marketing).

**UI:** wizard mirip Import Marketing (reuse komponen). Preview menandai "Resi cocok ke ORD-xxx" / "Order tidak ditemukan".

### 3b. Cek Resi

**Deskripsi:** cari 1 resi/order → tampil detail pengiriman lengkap.

**DB:** query join `shipments + orders + customers + couriers`.

**Workflow:** input resi/ID → kartu detail (customer, kurir, status, timeline, alamat ringkas).

**UI:** search bar besar → kartu hasil + timeline status vertikal.

### 3c. Status Pengiriman

**Deskripsi:** monitoring operasional harian by status & umur paket.

**Workflow:** filter status/umur → tabel (tanggal, resi, customer, status, umur, CS PJ, tindak lanjut) → tombol "Tambah Follow-up".

**UI:** kartu ringkasan per status (Menunggu Pickup / In Transit / Delivered / Gagal / Retur) → klik = tabel terfilter. Tanggal kolom pertama, terbaru di atas.

### 3d. COD & Pembayaran

**Deskripsi:** status pencairan COD per order + selisih ongkir.

**Workflow:** import "COD cair" atau tambah manual → sistem update `cod_payments` → **trigger Finance Ledger** saat cair.

**UI:** tabel COD (nominal, ongkir, fee, tgl cair, status) + KPI "COD belum cair".

### 3e. Retur & Gagal Kirim

**Deskripsi:** catat retur/gagal → **auto Stock Move (masuk gudang retur)** + **auto Ledger balik**.

**DB (sudah ada `tracking.returns`):** `returns(return_id, order_id, tracking_number, issue_type, reason, cs_id, follow_up_action, status)`.

**Workflow:** buat Return → pilih order → alasan → simpan → sistem: (1) Warehouse move +qty retur, (2) Finance kurangi penjualan.

**UI:** tabel retur + form "Tambah Retur" (cari order dulu, lalu alasan/status).

---

## MENU 4 — WAREHOUSE

**Fungsi:** SSOT stok berbasis **Stock Move** (bukan angka statis). On-hand = SUM(moves).

**Struktur DB (BARU — inti modul ini):**
```prisma
model Warehouse {
  warehouseId String @id @map("warehouse_id") // WH-JKT, WH-MKS
  name        String
  moves       StockMove[]
  @@schema("warehouse")
  @@map("warehouses")
}

model WarehouseStockItem {          // SKU LOKAL per gudang (aturan Probetes)
  stockItemId String @id @map("stock_item_id")
  warehouseId String @map("warehouse_id")
  productId   String @map("product_id")   // link ke master.products (SSOT produk)
  localSku    String @map("local_sku")    // beda per gudang, boleh beda dgn SKU global
  reorderPoint Int   @default(0) @map("reorder_point")
  @@unique([warehouseId, productId])
  @@schema("warehouse")
  @@map("stock_items")
}

model StockMove {                    // SATU-SATUNYA sumber perubahan stok
  moveId      String   @id @map("move_id")
  warehouseId String   @map("warehouse_id")
  productId   String   @map("product_id")
  moveType    String   @map("move_type") // in|out|transfer_in|transfer_out|opname_adjust|return_in
  qtyChange   Int      @map("qty_change") // + masuk, - keluar
  refType     String?  @map("ref_type")   // order|purchase|opname|return|manual
  refId       String?  @map("ref_id")     // orderId / returnId / opnameId
  moveDate    DateTime @map("move_date")
  note        String?
  @@index([warehouseId, productId])
  @@schema("warehouse")
  @@map("stock_moves")
}
```
**On-hand (computed, bukan stored):**
```sql
SELECT product_id, SUM(qty_change) AS on_hand
FROM warehouse.stock_moves
WHERE warehouse_id = $1 GROUP BY product_id;
```

**Sub-fitur & workflow:**

| Sub-menu | Aksi | Efek Stock Move |
|---|---|---|
| Stok Barang | lihat on-hand per SKU/gudang | (read: SUM moves) |
| Barang Masuk | catat penerimaan | +qty (`in`) |
| Barang Keluar | keluar utk order | −qty (`out`, ref=order) |
| Mutasi | Jakarta↔Makassar | −qty `transfer_out` di asal, +qty `transfer_in` di tujuan (1 transaksi) |
| Stock Opname | hitung fisik | selisih → `opname_adjust` |
| Retur Gudang | terima retur | +qty `return_in` (dipicu Tracking 3e) |
| Restock Alert | on-hand < reorder_point | (read-only alert) |

**UI:** dashboard stok (kartu total SKU, nilai stok, alert) → tabel per gudang. Form Barang Masuk/Keluar = pilih gudang+produk+qty → simpan (buat move). Mutasi = form 2 sisi (dari/ke). Opname = tabel "stok sistem vs fisik → selisih → simpan adjust".

---

## MENU 5 — FINANCE

**Fungsi:** SSOT uang. Buku besar terpusat (`ledger_entries`). **Laba Rugi = query, bukan input.**

**Struktur DB (BARU — inti):**
```prisma
model LedgerAccount {
  accountId String @id @map("account_id") // AKUN-PENJUALAN, AKUN-KAS-COD, AKUN-BIAYA-IKLAN
  name      String
  type      String // pendapatan | biaya | aset | kewajiban
  entries   LedgerEntry[]
  @@schema("finance")
  @@map("ledger_accounts")
}

model LedgerEntry {                  // double-entry ringan
  entryId    String   @id @map("entry_id")
  entryDate  DateTime @map("entry_date") @db.Date
  accountId  String   @map("account_id")
  debit      BigInt   @default(0)
  credit     BigInt   @default(0)
  refType    String?  @map("ref_type") // order|cod|return|expense|payroll|ad_spend
  refId      String?  @map("ref_id")
  note       String?
  createdBy  String   @default("app") @map("created_by")
  account    LedgerAccount @relation(fields: [accountId], references: [accountId])
  @@index([entryDate]); @@index([refType, refId])
  @@schema("finance")
  @@map("ledger_entries")
}

model MoneyChangeRequest {           // approval khusus perubahan UANG
  requestId  String @id @map("request_id")
  refType    String @map("ref_type")
  refId      String @map("ref_id")
  field      String
  oldValue   BigInt @map("old_value")
  newValue   BigInt @map("new_value")
  reason     String
  status     String // pending|approved|rejected
  requestedBy String @map("requested_by")
  approvedBy  String? @map("approved_by")
  @@schema("finance")
  @@map("money_change_requests")
}
```

**Sub-fitur:**

- **5a Ringkasan (Dashboard):** KPI pemasukan, pengeluaran, margin, COD pending, ad spend — semua `SUM(ledger_entries)` per kategori.
- **5b Pemasukan / 5c Pengeluaran:** catat transaksi → buat Ledger Entry. Import atau manual.
- **5d Rekonsiliasi & Settlement:** cocokkan nominal sistem vs cair (dari Tracking COD) → tandai match/selisih.
- **5e HPP & Margin:** HPP dari Warehouse (nilai stok keluar) → margin = penjualan − HPP.
- **5f COD & Settlement:** ringkasan pencairan COD (baca `tracking.cod_payments`, catat ke ledger saat cair).
- **5g Laba Rugi:** `SUM(pendapatan) − SUM(biaya)` per periode. **100% computed.**

**Workflow perubahan uang (SSOT + kontrol):**
```
User usul ubah nominal → MoneyChangeRequest(pending)
→ Atasan (role) approve → Ledger Entry koreksi dibuat → nilai efektif
(perubahan nama/alamat/resi TIDAK butuh approval, cukup audit)
```

**UI:** Ringkasan = grid KPI + chart. Laba Rugi = tabel periode (Pemasukan/Pengeluaran/HPP/Laba Kotor/Laba Bersih), read-only + Export. Rekonsiliasi = tabel 2 kolom nominal + badge selisih.

---

## MENU 6 — HRIS

**Fungsi:** data karyawan sensitif, terpisah dari `master.users` (yang dipakai untuk CS/ADV mapping). Feed biaya gaji ke Finance.

**Struktur DB (BARU):**
```prisma
model Employee {
  employeeId   String   @id @map("employee_id")
  fullName     String   @map("full_name")
  nik          String?  // sensitif, gated by permission
  departmentId String?  @map("department_id")
  position     String?
  joinDate     DateTime? @map("join_date") @db.Date
  workStatus   String?  @map("work_status") // aktif|kontrak|resign
  userId       String?  @map("user_id")      // link ke master.users (opsional)
  attendances  Attendance[]
  payslips     Payslip[]
  @@schema("hris")
  @@map("employees")
}

model Attendance {
  attendanceId String @id @map("attendance_id")
  employeeId   String @map("employee_id")
  date         DateTime @db.Date
  checkIn      String? @map("check_in")
  checkOut     String? @map("check_out")
  status       String  // hadir|telat|izin|sakit|alpha|cuti
  employee     Employee @relation(fields: [employeeId], references: [employeeId])
  @@unique([employeeId, date])
  @@schema("hris")
  @@map("attendance")
}

model PayrollRun {
  runId   String @id @map("run_id")
  period  String  // 2026-06
  status  String  // draft|approved|paid
  payslips Payslip[]
  @@schema("hris")
  @@map("payroll_runs")
}

model Payslip {
  payslipId  String @id @map("payslip_id")
  runId      String @map("run_id")
  employeeId String @map("employee_id")
  basicSalary BigInt @map("basic_salary")
  allowance   BigInt @default(0)
  deduction   BigInt @default(0)
  netPay      BigInt @map("net_pay")   // computed: basic+allowance-deduction
  employee   Employee   @relation(fields: [employeeId], references: [employeeId])
  run        PayrollRun @relation(fields: [runId], references: [runId])
  @@schema("hris")
  @@map("payslips")
}
```

**Sub-fitur & workflow:**

- **6a Dashboard:** headcount, hadir hari ini, telat, izin, periode payroll.
- **6b Data Karyawan:** CRUD karyawan (NIK/gaji gated permission).
- **6c Absensi:** import/tambah → `attendance`.
- **6d Cuti & Izin:** ajukan → approve → status.
- **6e Payroll:** buat PayrollRun (draft) → generate slip (netPay computed) → approve → **kirim total gaji ke Finance sebagai Ledger Entry (biaya)**.
- **6f Komisi Tim:** hitung komisi CS/CRM/ADV dari `orders` (closing) → preview → simpan.
- **6g Laporan HR:** ringkasan absensi/payroll/komisi (read-only).

**UI:** dashboard kartu → tabel per sub-menu. Payroll = wizard: pilih periode → tabel slip (editable komponen) → "Generate Slip Preview" → Approve. Data sensitif (NIK/gaji) tampil hanya jika permission.

**SSOT:** total gaji **tidak diketik ulang** di Finance; Payroll approve → 1 Ledger Entry otomatis. Komisi dihitung dari orders, bukan input manual.

---

## MENU 7 — USER MANAGEMENT (IAM)

**Fungsi:** akun login, role, permission, audit login. Ini yang mengaktifkan RBAC + aktor audit nyata (ganti default `"app"`).

**Struktur DB (BARU — `iam` schema):**
```prisma
model Account {
  accountId    String @id @map("account_id")
  email        String @unique
  passwordHash String @map("password_hash")
  employeeId   String? @map("employee_id") // link HRIS opsional
  status       String  // aktif|nonaktif
  accountRoles AccountRole[]
  logins       LoginHistory[]
  @@schema("iam")
  @@map("accounts")
}

model Role {
  roleId      String @id @map("role_id")
  name        String @unique // Owner|Admin|Marketing|CS|CRM|Gudang|Finance|HR|Admin Inputer
  permissions RolePermission[]
  @@schema("iam")
  @@map("roles")
}

model Permission {
  permissionId String @id @map("permission_id")
  code         String @unique // marketing.import.write, finance.money.approve
  module       String
  action       String // view|create|edit|delete|approve|export
  @@schema("iam")
  @@map("permissions")
}

model RolePermission {
  roleId       String @map("role_id")
  permissionId String @map("permission_id")
  @@id([roleId, permissionId])
  role         Role       @relation(fields: [roleId], references: [roleId])
  @@schema("iam")
  @@map("role_permissions")
}

model AccountRole {
  accountId String @map("account_id")
  roleId    String @map("role_id")
  grantedBy String @map("granted_by")
  @@id([accountId, roleId])
  account   Account @relation(fields: [accountId], references: [accountId])
  @@schema("iam")
  @@map("account_roles")
}

model LoginHistory {
  id        BigInt @id @default(autoincrement())
  accountId String @map("account_id")
  at        DateTime @default(now())
  ip        String?
  status    String  // sukses|gagal
  account   Account @relation(fields: [accountId], references: [accountId])
  @@schema("iam")
  @@map("login_history")
}
```

**Sub-fitur:** 7a Akun & Password (CRUD akun, reset) · 7b Role Permission (centang matrix modul×aksi) · 7c Account Role (assign role ke akun) · 7d Riwayat Login (read-only audit).

**Workflow authz:** setiap API server memanggil `requirePermission(session, "finance.money.approve")`. Middleware Next.js verifikasi session → cek `account_roles → role_permissions`.

**UI:** 7b = matrix checkbox (baris permission, kolom role). 7d = tabel login (tanggal, user, IP, status).

---

## MENU 8 — REPORTS

**Fungsi:** laporan final owner/manajemen. **READ-ONLY MURNI.** Setiap laporan = query agregasi dari modul sumber. Tidak ada tabel input.

**DB:** tidak ada tabel baru. Opsional: `reports.report_snapshots` untuk cache laporan berat + Export.

**Sub-menu → sumber query:**

| Sub-menu | Sumber (SSOT) | Contoh metrik |
|---|---|---|
| 8a Ringkasan | semua | KPI owner: omzet, order, ROAS, repeat, retur, COD pending, margin, stok kritis, absensi |
| 8b Penjualan | `orders` | total sales, per channel, produk terlaris |
| 8c Marketing | `ad_campaign_metrics` + `orders` | spend, ROAS, closing rate |
| 8d CRM | `customer_cohorts` | cohort, repeat, segmen RFM |
| 8e Finance | `ledger_entries` | laba rugi, pengeluaran |
| 8f Tracking | `shipments`, `cod_payments`, `returns` | on-time, retur rate, COD pending |
| 8g HRIS | `attendance`, `payslips` | kehadiran, biaya HR |
| 8h Gudang | `stock_moves` | stok, mutasi, opname, restock |

**Workflow:** pilih laporan → filter periode → tampil KPI+tabel → **Export (PDF/Excel)**. Owner Dashboard (8a) = ringkasan semua area.

**UI:** setiap halaman = filter periode + KPI + tabel/chart + tombol Export. Tidak ada tombol Import/Tambah (read-only).

---

## MENU 9 — AI ASSISTANT

**Fungsi:** chat internal ERP (seperti ChatGPT khusus Probetes) — tanya data pakai bahasa sehari-hari, jawab dengan ringkasan+KPI+tabel+sumber. **READ-ONLY**, tidak pernah menulis data bisnis.

**Struktur DB (BARU — `ai` schema):**
```prisma
model AiConversation {
  conversationId String @id @map("conversation_id")
  accountId      String @map("account_id")
  title          String?
  createdAt      DateTime @default(now())
  messages       AiMessage[]
  @@schema("ai")
  @@map("conversations")
}

model AiMessage {
  messageId      String @id @map("message_id")
  conversationId String @map("conversation_id")
  role           String // user|assistant
  content        String
  sourceMeta     Json?  @map("source_meta") // periode + tabel sumber
  conversation   AiConversation @relation(fields: [conversationId], references: [conversationId])
  @@schema("ai")
  @@map("messages")
}

model AiSkill {                       // shortcut prompt (Laporan Hari Ini, COD Pending, dll)
  skillId    String @id @map("skill_id")
  name       String
  prompt     String
  category   String  // sales|marketing|tracking|finance|hris
  outputType String  @map("output_type")
  @@schema("ai")
  @@map("skills")
}
```

**Workflow (aman/SSOT):**
```
User tanya → AI ubah ke query READ-ONLY (whitelist tabel/view)
→ eksekusi → format jawaban (ringkasan+KPI+tabel+periode/sumber)
→ simpan ke ai.messages + audit (iam)
Skill = prompt tersimpan; klik = jalankan cepat.
Batas: tidak akses NIK/gaji tanpa izin; tidak menulis data bisnis.
```

**UI:** layout chat (area percakapan + input bawah) + panel Skill Cards kanan + tombol "Buat Skill". Jawaban laporan tampil dalam panel rapi (KPI+tabel). Ada Riwayat Percakapan & Insight Tersimpan.

---

## Bagian 4 — Ringkasan Relasi Antar-Modul (peta FK SSOT)

```
                    ┌─────────────┐
                    │  Customer   │◄──────── CRM (read cohort)
                    │ (master,    │◄──────── Marketing Import (dedup/write)
                    │  SSOT ident)│
                    └──────┬──────┘
                           │ 1—N
                    ┌──────▼──────┐
      Marketing ───►│    Order    │───► Reports (read)
      (SSOT trx)    │  + Items    │
                    └──┬───┬───┬──┘
              1—1 │    │   │   │ N—1
        ┌─────────▼─┐  │   │   └──► Channel/CS (master)
        │ Shipment  │  │   │
        │ + COD     │  │   └──────► Warehouse StockMove (out) ─► HPP
        │ (Tracking)│  │              (SSOT stok)
        └─────┬─────┘  │
              │ trigger│ trigger
              ▼        ▼
        ┌──────────────────┐
        │  LedgerEntry     │◄── HRIS Payroll (biaya gaji)
        │  (Finance SSOT $)│◄── Ad Spend (biaya iklan)
        └────────┬─────────┘
                 ▼
            Reports 8e / Laba Rugi (computed)
```

---

## Bagian 5 — Aturan Implementasi Teknis (`pg`/Next.js)

1. **PostgreSQL multi-schema:** kelola schema `master`, `orders`, `tracking`, `finance`, `warehouse`, `hris`, `iam`, `marketing`, `staging`, `audit`, `ai`, dan `system` melalui migration SQL yang versioned.
2. **Uang = `BIGINT`** (rupiah bulat) di seluruh tabel — konsisten dengan `schema.sql`.
3. **Transaksi database:** gunakan satu koneksi `pg` dengan `BEGIN`/`COMMIT`/`ROLLBACK` untuk operasi lintas tabel (commit import, promote order+items+shipment, payroll→ledger, retur→stock+ledger).
4. **Server-only writes:** semua mutasi lewat Route Handler `app/api/.../route.ts` dengan `requirePermission`. Tidak ada tulis dari client.
5. **Derived fields computed** melalui agregasi SQL/view; jika di-cache, sertakan job re-compute.
6. **Audit wajib** di setiap write penting → `audit.change_log` (helper `logChange` sudah ada).
7. **Import selalu staging→validate→promote**, idempotent, dedup key stabil.
8. **State machine** eksplisit untuk dokumen berstatus; transisi ilegal ditolak server.

### 5.1 Standar Clean Code & Modular Architecture (wajib)

Semua fitur baru dan refactor harus mengikuti arsitektur modular yang sudah dipakai project. Tujuannya agar logic bisnis dapat diuji, SQL tetap terkontrol, UI tidak menjadi *God Component*, dan perubahan pada satu modul tidak merusak modul lain.

**Alur dependency backend:**

```text
Route Handler / Controller
        ↓
Service / Use Case
        ↓
Repository / Query Layer
        ↓
PostgreSQL melalui pg

Parser → Mapper → Validator → Service
```

**Tanggung jawab tiap layer:**

1. **Route Handler / Controller harus tipis.** Hanya menangani autentikasi/otorisasi, membaca input, memanggil service, dan membentuk response HTTP. Route tidak boleh berisi SQL atau business rule panjang.
2. **Service menyimpan business logic.** Orkestrasi workflow, transaksi lintas tabel, aturan status, idempotency, dan keputusan bisnis berada di service/use case.
3. **Repository khusus akses data.** Seluruh SQL berada di repository/query layer, selalu terparameterisasi, tidak membangun query dari input mentah, dan tidak membawa detail HTTP/UI.
4. **Parser, mapper, dan validator dipisahkan.** Parser membaca bentuk file/sumber; mapper menerjemahkan ke bentuk baku; validator menentukan valid/review/error/duplicate. Kamus alias dan aturan normalisasi tidak boleh tersebar di route atau komponen UI.
5. **Type dan kontrak eksplisit.** Gunakan TypeScript type/interface untuk input, output, entity, dan response. Hindari `any`; jika tidak dapat dihindari pada boundary library, isolasi dan validasi sebelum masuk domain.
6. **Satu file, satu tanggung jawab utama.** Pecah file ketika menangani lebih dari satu domain, UI dan data access bercampur, atau sudah sulit dibaca/diuji. Dilarang membuat God Component, God Service, God Controller, atau helper serba guna tanpa batas domain.
7. **Tidak ada duplicate business logic.** Rumus omzet, ROAS, normalisasi nomor HP, status order, dedup key, dan aturan validasi harus mempunyai satu sumber implementasi. UI hanya menampilkan hasil, bukan menghitung ulang aturan backend secara berbeda.
8. **Error handling konsisten.** Error domain memiliki kode/pesan yang jelas; detail internal dan SQL tidak dikirim ke client. Semua kegagalan transaksi melakukan rollback dan aktivitas penting dicatat untuk audit.
9. **Konfigurasi dan secret terpisah.** Gunakan environment variable/config module. Tidak ada credential, URL sensitif, nama akun, atau nilai bisnis yang di-hardcode di source code.
10. **Migration additive dan backward-compatible.** Jangan reset database atau menghapus kolom/data tanpa persetujuan dan rencana migrasi. Constraint, index, serta unique key harus mengikuti aturan domain dan pertumbuhan data.

**Struktur backend yang menjadi acuan:**

```text
apps/web/src/server/modules/<domain>/<feature>/
├── <feature>.types.ts
├── <feature>.service.ts
├── <feature>.repository.ts
├── parsers/
├── mappers/
├── validators/
└── self-check.ts atau tests/
```

Tidak semua folder wajib dibuat jika fiturnya kecil. Buat hanya layer yang memiliki tanggung jawab nyata; jangan menambah abstraksi kosong.

### 5.2 Standar Clean Frontend

1. **Page sebagai composition layer.** Page menyusun feature dan layout; fetching kompleks, transformasi data, serta business rule tidak ditumpuk di `page.tsx`.
2. **Pisahkan UI dan logic.** Gunakan `components/`, `hooks/`, `services` atau API client, `types/`, `utils/`, dan `constants/` sesuai kebutuhan feature.
3. **Komponen kecil dan reusable secara wajar.** Reuse hanya untuk pola yang benar-benar sama; hindari komponen generik besar dengan terlalu banyak props dan kondisi.
4. **State wajib lengkap:** default, loading, empty, error, success, disabled, dan partial/review jika relevan.
5. **Server sebagai sumber kebenaran.** Validasi frontend membantu UX, tetapi validasi final, otorisasi, transaksi, dan perhitungan bisnis tetap dilakukan backend.
6. **Accessibility dan responsive wajib.** Elemen interaktif memakai semantic HTML, label, keyboard/focus state, dan layout mobile-first tanpa mengorbankan tabel operasional desktop.
7. **Performa proporsional.** Gunakan pagination/virtualization untuk tabel besar, debounce untuk pencarian, lazy loading bila bermanfaat, dan hindari fetch atau re-render berulang tanpa alasan.

**Struktur frontend yang menjadi acuan:**

```text
apps/web/src/features/<domain>/<feature>/
├── components/
├── hooks/
├── services/ atau <feature>Api.ts
├── types/
├── utils/
└── <Feature>Page.tsx
```

### 5.3 Testing dan Definition of Done

Sebuah task belum boleh ditandai selesai hanya karena UI tampil atau kode berhasil dikompilasi. Minimum Definition of Done:

1. Alur utama dan edge case penting diuji, termasuk data kosong, input rusak, duplikat, retry, dan kegagalan transaksi.
2. Parser/import diuji dengan fixture yang mewakili file asli setiap sumber; data sensitif harus disamarkan.
3. Operasi multi-record yang harus atomik memiliki test rollback dan idempotency.
4. Query diperiksa dari risiko N+1, full scan yang tidak perlu, serta kebutuhan index.
5. Tidak ada hardcoded mock pada alur production tanpa label dan pemisahan yang jelas.
6. `pnpm typecheck` dan `pnpm build` lulus tanpa error maupun warning baru.
7. UI diverifikasi untuk desktop dan mobile pada state default, loading, empty, error, dan success.
8. Perubahan schema memakai migration dan mencantumkan dampak serta strategi rollback.
9. File yang diubah tetap mengikuti boundary domain; refactor di luar scope harus dipisahkan dari task fitur.
10. Roadmap/progress diperbarui hanya setelah implementasi dan verifikasi selesai.

---

## Bagian 6 — Roadmap Bertahap (menjaga SSOT sejak awal)

| Fase | Fokus | Alasan urutan |
|---|---|---|
| 1 | Master (Customer/Product) + Order (Marketing Import) | fondasi identitas & transaksi — sudah berjalan |
| 2 | Data Tracking (Shipment/COD/Retur) | menempel ke Order yang sudah SSOT |
| 3 | Warehouse StockMove + Retur→Stock | stok berbasis move |
| 4 | Finance Ledger + Laba Rugi + approval uang | uang terpusat setelah order/stok stabil |
| 5 | HRIS + Payroll→Ledger | biaya gaji masuk ledger |
| 6 | User Management (IAM) → aktor audit nyata + RBAC | mengunci akses semua modul |
| 7 | Reports (read-only) | tinggal query karena semua SSOT |
| 8 | AI Assistant (read-only) | konsumen akhir data |

> **Gate khusus Marketing Workspace:** meskipun full User Management tetap Fase 6, subset IAM minimal (account, session, permission, platform/source assignment, dan aktor audit nyata) wajib dimajukan sebagai prerequisite sebelum import berbasis role dirilis ke production. Tanpa gate ini, pemisahan TikTok/Shopee/Meta/CRM hanya dianggap perubahan UI.
>
> Reports & AI sengaja terakhir: begitu semua data SSOT, keduanya cukup **membaca**, tidak perlu logika bisnis baru.

---

**Penutup.** Kunci "tidak kerja dua kali" ada di tiga hal: (1) identitas customer tunggal, (2) uang hanya lewat Ledger, (3) stok hanya lewat Stock Move. Selama tiga aturan ini dipegang, setiap modul lain cukup membaca — persis prinsip Odoo/ERPNext, tapi jauh lebih ringan.
