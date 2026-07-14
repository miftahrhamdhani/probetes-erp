# Struktur Backend Probetes ERP

Panduan singkat supaya tidak bingung lagi mencari kode backend.

## 1. Backend sebenarnya ada di `apps/web`, BUKAN `apps/api`

| Lokasi | Isi | Status |
|---|---|---|
| `apps/web/src/app/api/**` | **Route/controller** API (Next.js route handler) | ✅ Dipakai |
| `apps/web/src/server/**` | **Logic backend** (service, repository, parser, mapper, validator) | ✅ Dipakai |
| `apps/api/**` | Skeleton NestJS (main, app.module, health) | ⏸️ **Belum dipakai** |

`apps/api` masih kerangka NestJS dari commit awal dan **belum berisi fitur apa pun**.
Semua backend yang berjalan sekarang ada di `apps/web`. Jangan mencari logic bisnis di `apps/api`.

> Keputusan: tetap memakai Next.js API route (sudah jalan, 48 endpoint). Pindah ke NestJS
> ditunda sampai benar-benar butuh server terpisah (mis. worker/cron/API publik) — lihat bagian 6.

## 2. Aturan lapisan (clean code)

```
Frontend  →  route.ts  →  service.ts  →  repository.ts  →  PostgreSQL  →  response
             (tipis)      (alur bisnis)   (semua SQL)
```

| Berkas | Tugas | Contoh |
|---|---|---|
| `app/api/**/route.ts` | Terima request, panggil service, kembalikan response. **Tanpa SQL / logic besar.** | `api/data-quality/route.ts` |
| `service.ts` | Alur/aturan bisnis, validasi tingkat proses, orkestrasi transaksi. | `import.service.ts` |
| `repository.ts` | **Semua query PostgreSQL.** Tidak ada aturan bisnis. | `import.repository.ts` |
| `parsers/` | Baca file CSV/XLSX menjadi baris. | `parsers/file-reader.ts` |
| `mappers/` | Petakan kolom platform (TikTok/Shopee/Meta) ke field standar. | `mappers/ads.mapper.ts` |
| `validators/` | Validasi file & baris data. | `validators/row-status.ts` |
| `*.types.ts` | Type/interface TypeScript. | `import.types.ts` |
| `utils.ts` | Helper kecil (angka, tanggal, HP, header). | `utils.ts` |

## 3. Struktur folder `apps/web/src/server`

```
server/
├── common/                      ← dipakai lintas modul
│   ├── db.ts                    (pool PostgreSQL + query helper)
│   ├── audit.ts                 (logChange → audit.change_log)
│   ├── errors.ts                (AppError + toErrorResponse)
│   └── utils/
│       └── location.ts          (ekstraksi kota dari alamat)
└── modules/
    ├── marketing/
    │   └── import/              ← Import Data Marketplace (Prioritas 1, SELESAI)
    │       ├── import.service.ts     (preview/commit/cancel/history)
    │       ├── import.repository.ts  (semua SQL batch/staging/promote)
    │       ├── import.types.ts
    │       ├── utils.ts              (parseImportNumber/Date/Phone, normalizeHeader)
    │       ├── parsers/
    │       │   ├── file-reader.ts    (baca CSV/XLSX, ImportFileError)
    │       │   └── index.ts          (parseMarketplaceImport)
    │       ├── mappers/
    │       │   ├── aliases.ts        (kamus alias kolom per platform)
    │       │   ├── header.ts         (lookup header + deteksi salah-platform)
    │       │   ├── ads.mapper.ts     (mapping+validasi baris Spending Ads)
    │       │   └── order.mapper.ts   (mapping+validasi baris Data Pesanan)
    │       └── validators/
    │           └── row-status.ts     (escalateStatus, finalizeFile)
    ├── database/
    │   └── summary.service.ts   (Ringkasan Data)
    └── data-quality/
        ├── quality-sql.ts       (rumus WHERE kualitas data — satu sumber)
        └── data-quality.service.ts
```

## 4. Contoh alur nyata: upload Import Marketplace

```
1. Frontend (MarketingImportPage) upload file
   → POST /api/marketing/import/preview
2. route.ts (preview) validasi form → panggil createImportPreview()
3. import.service.ts:
   - findSelectedOption() cek ADV/Toko  → import.repository.ts
   - parseMarketplaceImport()           → parsers/ + mappers/ + validators/
   - enrichOrderRows/AdsRows()          → repository (cek duplikat DB)
   - insertBatch() + insertStagingRows()→ repository (staging, BELUM ke tabel utama)
4. Preview tampil di frontend (belum tersimpan permanen)
5. User klik Simpan → POST /api/marketing/import/commit
6. commitImportBatch(): promote baris valid ke marketing.ad_campaign_metrics
   atau orders.orders (per-baris SAVEPOINT; yang gagal ditandai review/error)
7. Riwayat tampil dari GET /api/marketing/import/history
```

## 5. Tabel database yang dipakai modul import

DDL ada di `data_migrasi/db/schema_marketing_migration_01.sql` dan
`schema_marketing_import_migration_02.sql` (reproducible — bisa dibangun ulang):

- `marketing.import_source_options` — daftar ADV & Toko per platform
- `marketing.import_batches` — metadata tiap batch import (preview→completed/cancelled)
- `staging.import_rows` — baris mentah + hasil parse (penampungan sebelum masuk utama)
- `marketing.ad_campaign_metrics` / `ad_import_batches` — tujuan commit Spending Ads
- `orders.orders` / `order_items` / `master.customers` — tujuan commit Data Pesanan
- `audit.import_logs` — jejak preview/commit/cancel

## 6. Yang belum dirapikan (batch berikutnya)

Refactor dilakukan **bertahap** agar aman. Sudah rapi: `marketing/import`, `database/summary`,
`data-quality`. Belum dipindah ke `server/modules` (masih SQL di route, tapi berfungsi):

- `api/master/**` (customers, products, channels, couriers, users, cohort, merge)
- `api/backup/**` (run/history/settings)
- `api/marketing/ads/**`, `sales-*`, `source-performance/**` (sebagian pakai `lib/marketing-*`)

Saat dirapikan nanti, ikuti pola yang sama: route tipis → `modules/<domain>/*.service.ts` →
`*.repository.ts`. Struktur `server/modules` sengaja menyerupai module NestJS sehingga bila
kelak pindah ke `apps/api`, tinggal mengangkat folder tanpa menulis ulang logic.
