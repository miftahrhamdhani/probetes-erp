# Audit Data Marketing — Probetes ERP

Tanggal audit: 13 Juli 2026
Prinsip: **DATA FIRST, FEATURE SECOND.** Semua status di dokumen ini diambil dari schema aktual (`data_migrasi/db/schema.sql`), export data aktual (`data_migrasi/output/*.csv`), dan API yang sudah berjalan (`apps/web/src/app/api/*`). Tidak ada asumsi ideal.

---

## 1. Database Aktual

Database: PostgreSQL `probetes_erp` (koneksi via `DATABASE_URL` di `apps/web/.env.local`).
Schema: `master`, `orders`, `tracking`, `finance`, `audit`, `system`.
**Tidak ada tabel Prisma** — schema didefinisikan di `data_migrasi/db/schema.sql`, dimuat oleh `data_migrasi/db/load_to_postgres.py`.

Rentang data aktual:
- `orders.orders`: 2025-01-01 s/d 2026-07-06 (31.831 baris)
- `orders.customer_transactions`: 2024-07-31 s/d 2026-07-05 (20.332 baris) → historis ±24 bulan, cukup untuk cohort/retention.

### Tabel: master.customers (21.603 baris)

**Kolom tersedia:** customer_id (PK), name, phone, phone_normalized, address, city, province, source_origin, channel_id, cs_id, transaction_count, status, is_crm_target, in_wa_group.

**Kelengkapan aktual:**
- phone_normalized terisi: 19.420 / 21.603 (89,9%) — 2.183 pelanggan tanpa HP.
- is_crm_target = true: 19.410.
- **in_wa_group terisi: 0 dari 21.603 (kosong total).**

**Bisa digunakan untuk:** unique customer (customer_id), CRM target list, fallback key phone_normalized, segmentasi kota/provinsi, kepemilikan CS.

**Tidak bisa digunakan untuk:** status masuk grup WA (kolom ada tapi belum pernah diisi), email marketing (tidak ada kolom email), lead pipeline (tidak ada tabel leads).

**Catatan masalah:** 2.183 customer tanpa HP tidak bisa jadi kunci dedup/broadcast; `in_wa_group` kosong memblokir aturan cluster C/D (semua bergantung "sudah/belum masuk grup").

### Tabel: master.customer_cohorts (21.603 baris, 1:1 dengan customers)

**Kolom tersedia:** customer_id (PK/FK), cohort_month, first_purchase_date, last_purchase_date, frequency, total_qty, total_spent, last_product_id, last_cs_id, cluster, recency_days, r_score, f_score, m_score, rfm_segment.

**Kelengkapan aktual:** cohort_month terisi 100%. cluster hanya berisi `baru | repeat | high_value` (BUKAN 14 cluster custom). rfm_segment berisi 8 nilai: Champions, Loyal, Big Spender, Berpotensi, Pelanggan Baru, Berisiko Hilang, Tidak Aktif, Non-CRM.

**Bisa digunakan untuk:** RFM (R/F/M score sudah dihitung), cohort month per customer, frequency, monetary (total_spent), recency (recency_days), produk/CS terakhir.

**Tidak bisa digunakan untuk:** 14 cluster custom Probetes (A1–F) — belum dihitung; butuh in_wa_group (kosong) + aturan kategori produk.

### Tabel: master.products (94), master.channels (6), master.users (62), master.couriers (22), master.mitra (6), master.sumber_lain (30)

- products punya `category` (digital/hp_amandia/fisik_lain) dan `product_line` (probetes/ksb) → dibutuhkan aturan cluster; tersedia.
- channels final: Unknown, TikTok Shop, Marketplace Lain, Meta, Shopee, Stokis. Semua order punya channel_id (100%).
- users punya role/division → basis performa CS/ADV, tetapi tidak ada relasi ads.

### Tabel: orders.orders (31.831 baris)

**Kelengkapan aktual:**
| Kolom | Terisi | Catatan |
|---|---|---|
| order_date | 100% | filter tanggal aman |
| channel_id | 31.831 (100%) | breakdown channel aman |
| cs_id | 28.745 (90,3%) | performa CS mostly aman |
| payment_method | 25.106 (78,9%) | COD/non-COD; BUKAN payment_status |
| order_status | **6.715 (21,1%)** | nilai tidak standar: `Success`, `Sukses`, `Succeess`, `Retur`, kosong |
| total_amount | ~100% | BIGINT rupiah |
| divisi | 100% | Akuisisi / CRM / Marketplace / CS |
| flag | 100% | valid / review |

**Bisa digunakan untuk:** total order, revenue, tren harian, breakdown channel/divisi/CS/kurir, AOV, filter tanggal.

**Tidak bisa digunakan untuk:** paid-order rate pasti (tidak ada payment_status; order_status hanya terisi 21% dan tidak punya nilai `cancelled`), net revenue (diskon tidak ada; ongkir hanya di tracking/finance parsial).

**Catatan masalah:** nilai order_status perlu normalisasi (3 ejaan "sukses" berbeda); 79% baris tanpa status → definisi "order valid" aktual = `flag='valid'`, bukan status.

### Tabel: orders.order_items (42.390 baris)

Kolom: order_item_id, order_id, product_id, original_product_name, qty, unit_price, subtotal, status.
**Bisa digunakan untuk:** product sold, qty per produk, revenue per produk, top produk per channel (join via orders).

### Tabel: orders.customer_transactions (20.332 baris) — sumber cohort

| Kolom | Terisi |
|---|---|
| transaction_date | 20.332 (100%) |
| customer_id, cs_id, product_id, qty, total_price | terisi |
| **order_id** | **0 (kosong total)** |
| **cohort_month** | **0 (kosong total — ada di customer_cohorts, bukan di sini)** |

**Bisa digunakan untuk:** retention/cohort/frequency matrix (join `customer_cohorts.cohort_month` per customer + transaction_date), riwayat transaksi per customer.
**Tidak bisa digunakan untuk:** rekonsiliasi transaksi↔order (order_id kosong), attribution iklan.

### Tabel: tracking.shipments (31.831), tracking.cod_payments (4.307), tracking.returns (237)

- shipments: package_status terisi 100% (`dalam_kirim | retur | terkirim`), cod_status 100%, tracking_number hanya 7.570 (23,8%).
- cod_payments: settled_date hanya 564 dari 4.307 (13%).
- returns: issue_type, reason, follow_up_action tersedia (khusus retur).

**Bisa digunakan untuk:** delivered rate, retur rate, proxy "COD sudah cair" (parsial).
**Tidak bisa digunakan untuk:** paid rate menyeluruh (settled_date 13%).

### Tabel: finance.order_finance (31.831 baris — mayoritas kosong)

| Kolom | Terisi |
|---|---|
| total_payment | 6.361 (20%) |
| hpp | 6.552 (20,6%) |
| shipping_cost | 10.617 (33%) |
| cod_fee | 6.810 (21%) |
| settled_amount | **569 (1,8%)** |

**Tidak bisa digunakan untuk:** margin/net revenue menyeluruh. Status: PARTIAL berat.

### Tabel iklan: **TIDAK ADA**

Tidak ada tabel/kolom `spend`, `impressions`, `clicks`, `campaign_id`, `adset`, `ad_id`, `utm_*`, `leads`, `click_id` di schema mana pun (sudah di-grep di seluruh schema.sql).

---

## 2. Data Import Aktual

### Sumber yang sudah masuk database (via data_migrasi)
1. `01_database_all.csv` → orders/customers/shipments (order harian CS/akuisisi).
2. `02_probetes_non_prodig.csv` → order non-prodig.
3. `04_cohort_pelanggan.csv` → customer_transactions + customer_cohorts.
4. `05/06_gudang_*.csv` → stok gudang (bukan marketing).

### Sumber yang BELUM masuk database
`03_laporan_karyawan.csv` — laporan iklan harian per campaign-block (IRFAN EBOOK REMISI, HERBAL PROBETES META ADS, HERBAL PROBETES TIKTOK ADS, dst) berisi kolom per blok: **LEADS FORM, New Customer, Closing Rate, SALES**. Format multi-header Excel-style, perlu parser khusus.
→ Ini satu-satunya sumber leads/closing per campaign. **Tidak ada kolom spend/impressions/clicks di file ini.**

### Fitur Import di aplikasi web
- `Marketing > Import Data Channel` (TikTok/Shopee/Meta-Skalev): parsing CSV/XLSX **di browser saja**; riwayat disimpan di React context → **hilang saat refresh; tidak ada staging table; tidak menulis ke database**.
- `/api/marketing/local-import` = no-op (return `[]`).
- Import CRM (baru): sama, UI-only.

**Kesimpulan import:** belum ada pipeline import → database untuk data marketing berjalan. Data di database seluruhnya hasil migrasi batch `data_migrasi`.

---

## 3. Status Metric per Fitur

Legenda: AVAILABLE / DERIVABLE / PARTIAL / NOT_AVAILABLE / NEED_MAPPING.
"Order valid" aktual = `flag = 'valid'` (order_status tidak dapat diandalkan, terisi 21%).

### 3a. Sales & Order

| Metric | Data dibutuhkan | Tersedia? | Status | Rumus final | Catatan |
|---|---|---|---|---|---|
| Total Order | order_id, order_date | Ya | AVAILABLE | `COUNT(*) WHERE flag='valid' AND order_date BETWEEN :start AND :end` | |
| Total Revenue | total_amount | Ya | AVAILABLE | `SUM(total_amount)` order valid | Nilai kotor, bukan net |
| Total Qty / Product Sold | order_items.qty | Ya | AVAILABLE | `SUM(qty)` join orders | |
| Revenue per Produk | order_items.subtotal, product_id | Ya | AVAILABLE | `SUM(subtotal) GROUP BY product_id` | |
| Order/Revenue per Channel | channel_id (100%) | Ya | AVAILABLE | `GROUP BY channel_id` | |
| Order/Revenue per Divisi | divisi (100%) | Ya | AVAILABLE | `GROUP BY divisi` | Akuisisi/CRM/Marketplace/CS |
| Sales Trend | order_date | Ya | AVAILABLE | `GROUP BY order_date` | |
| AOV | total_amount, order_id | Ya | AVAILABLE | `SUM(total_amount)/COUNT(order_id)` | |
| Unique Customer | customer_id | Ya | AVAILABLE | `COUNT(DISTINCT customer_id)` | 21.603 master |
| Repeat Order | customer_id + order_date | Ya | DERIVABLE | customer dengan ≥2 order valid dalam range | |
| Paid Order Rate | payment_status | **Tidak ada** | PARTIAL | Proxy: shipments.package_status='terkirim' + cod_status | Jangan klaim pasti |
| Cancel Rate | order_status='cancelled' | **Tidak ada nilai cancel** | NOT_AVAILABLE | Tidak dihitung | Yang ada: Retur (via shipments/returns) |
| Retur Rate | shipments.package_status | Ya | AVAILABLE | `COUNT(package_status='retur')/COUNT(*)` | |
| Net Revenue / Margin | hpp, fee, settled | 1,8–33% terisi | PARTIAL | Hanya untuk subset finance terisi, beri label | Jangan tampilkan sebagai total perusahaan |
| Performa CS | cs_id (90%) | Ya | AVAILABLE | `GROUP BY cs_id` + catatan 9,7% tanpa CS | |

### 3b. Iklan & ROAS

| Metric | Butuh data | Ada? | Status | Bisa ditampilkan? | Rumus |
|---|---|---|---|---|---|
| Spend | spend | Tidak | NOT_AVAILABLE | Tidak | Perlu import data spend ads |
| Impressions / Reach / Clicks | impressions, reach, clicks | Tidak | NOT_AVAILABLE | Tidak | Perlu export Meta/TikTok Ads |
| CTR | clicks, impressions | Tidak | NOT_AVAILABLE | Tidak | Tidak dihitung |
| CPC / CPM | spend + clicks/impressions | Tidak | NOT_AVAILABLE | Tidak | Tidak dihitung |
| CPL | spend, leads | spend tidak ada | NOT_AVAILABLE | Tidak | Leads ada di raw CSV, spend tidak |
| CPO | spend, orders | spend tidak ada | NOT_AVAILABLE | Tidak | Tidak dihitung |
| ROAS | spend, attributed revenue | Tidak | NOT_AVAILABLE | Tidak | Tidak dihitung |
| MER | total spend, total revenue | spend tidak ada | NOT_AVAILABLE | Tidak | Tidak dihitung |
| Leads per campaign-block | 03_laporan_karyawan.csv | Raw saja, belum di DB | NEED_MAPPING | Setelah diimport | Perlu parser multi-header + tabel baru |
| Closing rate per campaign-block | idem | Raw saja | NEED_MAPPING | Setelah diimport | |
| Order/Revenue per Source/Channel | orders.channel_id | Ya | AVAILABLE | Ya | `GROUP BY channel_id` |
| AOV per Source | idem | Ya | AVAILABLE | Ya | |
| Trend per Source | order_date + channel | Ya | AVAILABLE | Ya | |

**Keputusan mode dashboard iklan: MODE 2 — Channel/Source Performance.** Kartu CTR/CPC/CPM/ROAS/MER ditampilkan disabled: "Data belum tersedia. Import data iklan untuk mengaktifkan metrik ini."

### 3c. CRM

| Metric/Fitur | Butuh | Ada? | Status | Catatan |
|---|---|---|---|---|
| Customer list + detail + order history | customers, orders, transactions | Ya | AVAILABLE | |
| Customer value / total belanja | customer_cohorts.total_spent | Ya | AVAILABLE | |
| Repeat customer | frequency | Ya | AVAILABLE | |
| Target CRM (punya HP valid) | is_crm_target | Ya (19.410) | AVAILABLE | |
| Status Masuk Grup WA | in_wa_group | Kolom ada, **0 terisi** | NOT_AVAILABLE | Blokir aturan cluster C/D; perlu import daftar grup WA |
| Lead pipeline / follow-up status | tabel leads/followups | Tidak ada | NOT_AVAILABLE | Hanya returns.follow_up_action (khusus retur) |
| CS conversion | assigned_cs + leads | leads tidak ada | NOT_AVAILABLE | |
| WhatsApp tracking | log klik WA | Tidak ada | NOT_AVAILABLE | |

### 3d. RFM

| Komponen | Sumber | Status |
|---|---|---|
| Recency | customer_cohorts.recency_days / last_purchase_date | AVAILABLE |
| Frequency | customer_cohorts.frequency | AVAILABLE |
| Monetary | customer_cohorts.total_spent | AVAILABLE |
| R/F/M score 1–5 + segment | r_score, f_score, m_score, rfm_segment | AVAILABLE (sudah dihitung migrasi) |
| RFM dalam custom date range | customer_transactions per range | DERIVABLE (hitung ulang on-the-fly dari transaksi) |
| Validitas order | status order | PARTIAL — pakai semua transaksi `status='valid'`, beri catatan "belum memfilter refund/cancel karena status tidak tersedia" |

### 3e. Cohort / Retention / Frequency

| Metric | Sumber | Status | Rumus |
|---|---|---|---|
| Cohort month per customer | customer_cohorts.cohort_month (100%) | AVAILABLE | |
| Retention matrix M0–M12 | transactions.transaction_date + first_purchase_date | DERIVABLE | period_index = bulan(tx) − bulan(first); returned = distinct customer per index; rate = returned/cohort_size |
| Cohort size | COUNT customer per cohort_month | AVAILABLE | |
| Frequency matrix (1x..Nx) | COUNT tx valid per customer per cohort | DERIVABLE | |
| Retention rate global | riwayat ±24 bulan (2024-07 s/d 2026-07) | AVAILABLE | Data historis cukup |
| Revenue retained | total_price transaksi repeat | DERIVABLE | |
| Cluster 14 custom (A1–F) | frequency + kategori produk + **in_wa_group** + recency | **PARTIAL** | Aturan berbasis grup WA tidak bisa dihitung sampai in_wa_group diisi; sisanya (A1–A4, B, E, F) DERIVABLE dari data yang ada |

Catatan penting: jangan pakai `customer_transactions.cohort_month` (kosong 100%) — selalu join `master.customer_cohorts`.

### 3f. Source Coverage

| Metric | Status | Rumus |
|---|---|---|
| Order per source_origin/channel | AVAILABLE | `GROUP BY source_origin / channel_id` |
| Customer per source | AVAILABLE | dari master.customers.source_origin |
| Coverage kualitas (HP kosong, kota kosong) | AVAILABLE | sudah ada di /api/data-quality + quality-sql.ts |

---

## 4. Rekomendasi Data/Kolom Tambahan (urut prioritas)

1. **Import spend iklan** (Meta Ads Manager & TikTok export: date, campaign, spend, impressions, clicks, purchases, conversion value) → membuka CTR/CPC/CPM/ROAS. Tabel baru: `marketing.ad_spending`.
2. **Isi `master.customers.in_wa_group`** (import daftar anggota grup WA, match by phone_normalized) → membuka cluster C/D dan KPI "Belum Masuk Grup".
3. **Parser `03_laporan_karyawan.csv`** → tabel `marketing.daily_campaign_report(date, campaign_block, leads, new_customer, sales)` → leads & closing rate per campaign (tanpa ROAS).
4. **Normalisasi order_status** (Success/Sukses/Succeess → satu nilai; tambah nilai cancelled bila memang ada di sumber).
5. **Persist riwayat import web** ke tabel staging (sekarang hilang saat refresh).
6. Lengkapi finance (settled_amount 1,8%) sebelum fitur margin dibuat.

## 5. Fitur Bisa Dibangun SEKARANG vs DITUNDA

**Bisa sekarang (data 100% siap):**
- Sales & Order dashboard asli (order, revenue, qty, AOV, channel, divisi, CS, produk, tren, retur rate) + custom date range dari `orders.orders`.
- Source/Channel Performance (pengganti jujur "Iklan & ROAS" MODE 2).
- CRM customer list/detail/riwayat/nilai dari customers + cohorts + transactions.
- RFM dashboard dari kolom r/f/m/segment yang sudah ada.
- Cohort retention & frequency matrix dari customer_transactions (24 bulan histori).
- Source coverage & kualitas data (API sudah ada sebagian).

**Ditunda (data belum ada):**
- ROAS/CTR/CPC/CPM/MER → tunggu import spend.
- Cluster C-Prodig/C-HP/C-F2/D-New/D-Old/Dhp-New/Dhp-Old penuh → tunggu in_wa_group.
- Lead pipeline & CS conversion → tunggu tabel leads.
- Margin/net revenue perusahaan → tunggu finance terisi.
- Paid-order rate pasti → tunggu payment_status.

## 6. Risiko Akurasi

1. order_status terisi 21% dengan ejaan tidak konsisten → semua rumus pakai `flag='valid'`, bukan status.
2. 2.183 customer tanpa HP → dedup/unique customer via customer_id migrasi; broadcast WA hanya ke is_crm_target.
3. customer_transactions tidak terhubung ke orders (order_id kosong) → jangan gabungkan revenue orders dengan revenue transaksi cohort dalam satu angka (definisi berbeda; sudah jadi aturan di CLAUDE.md §11).
4. finance.settled 1,8% → angka pencairan tidak representatif.
5. Frontend Marketing saat ini (CRM, Ads-ROAS, Sales-Order, CS-CRM) seluruhnya **mock service layer** — belum membaca database. Jangan anggap angkanya nyata.
