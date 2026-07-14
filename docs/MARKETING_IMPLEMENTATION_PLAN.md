# Implementasi Marketing — Probetes ERP

Tanggal: 13 Juli 2026.

## Yang sudah diimplementasikan

### Database

Migrasi: `data_migrasi/db/schema_marketing_migration_01.sql`.

- Membuat schema `marketing` bila belum ada.
- `marketing.ad_import_batches`: riwayat import file Meta Ads yang persisten.
- `marketing.ad_campaign_metrics`: metrik kampanye per baris laporan.
- Kolom laporan lengkap disiapkan, tetapi semua metrik yang tidak ada pada file boleh `NULL`/`0` sesuai jenisnya.
- Indeks disiapkan untuk periode laporan, kampanye, batch, produk, ADV, dan akun.

Migrasi diterapkan ke PostgreSQL lokal pada 13 Juli 2026.

### Endpoint Meta Ads

| Endpoint | Keterangan |
| --- | --- |
| `POST /api/marketing/ads/import` | Menerima CSV Meta Ads dan menyimpan batch + baris metrik dalam satu transaksi. |
| `GET /api/marketing/ads/import-batches` | Riwayat import persisten. |
| `GET /api/marketing/ads/import-batches/:id` | Detail batch beserta kampanye. |
| `GET /api/marketing/ads/summary` | KPI platform dengan metrik turunan dihitung dari metrik dasar agregat. |
| `GET /api/marketing/ads/campaigns` | Tabel kampanye dan filter/periode/paginasi. |
| `GET /api/marketing/ads/trend` | Tren belanja, nilai konversi, klik, pembelian, dan ROAS. |
| `GET /api/marketing/ads/funnel` | Funnel impresi → klik → halaman tujuan → checkout → pembelian. |

Semua endpoint pembacaan Iklan menerima `start_date` dan `end_date` (`YYYY-MM-DD`) dengan filter overlap laporan:

```sql
report_start_date <= end_date
AND report_end_date >= start_date
```

### Availability

Format respons ringkasan:

```json
{
  "success": true,
  "data": {},
  "availability": {
    "platform_roas": { "status": "AVAILABLE", "reason": "..." },
    "erp_roas": { "status": "NOT_AVAILABLE", "reason": "..." }
  }
}
```

Status yang dipakai: `AVAILABLE`, `DERIVABLE`, `PARTIAL`, `NOT_AVAILABLE`, `NEED_MAPPING`.

Komponen frontend:

- `MetricAvailabilityBadge`
- `DisabledMetricCard`
- `DataUnavailableNotice`
- `PartialDataNotice`

### Date range

Komponen reusable di `apps/web/src/features/marketing/components/daterange/`:

- `DateRangePicker.tsx`
- `useDateRangeQuery.ts`
- `dateRange.types.ts`
- `dateRange.validation.ts`

Perilaku:

- Default 30 hari terakhir dalam timezone Asia/Jakarta.
- Preset hari ini, kemarin, 7/30 hari terakhir, bulan ini/lalu, tahun ini, dan input manual.
- `start_date`/`end_date` disimpan di URL.
- Validasi tanggal mulai tidak boleh melebihi tanggal selesai.
- Halaman Iklan & ROAS sudah memakai komponen ini.

### Iklan & ROAS

`/marketing/ads-roas` tidak lagi membaca mock sebagai laporan nyata:

- Memuat KPI, tabel kampanye, tren, funnel, dan riwayat import dari endpoint database.
- Klik baris kampanye membuka detail formula Platform ROAS.
- Kartu pembelian mengarahkan ke tabel kampanye.
- Empty/loading/error state tersedia.
- ROAS ERP, set iklan, iklan individu, dan atribusi ERP tampil disabled dengan alasan nyata.

### Sales & Order

Halaman `/marketing/sales-order/overview` sudah memakai database asli dan `DateRangePicker` URL (`start_date`/`end_date`), tanpa fallback data mock.

Endpoint:

- `GET /api/marketing/sales-summary`
- `GET /api/marketing/sales-trend`
- `GET /api/marketing/sales-by-channel`
- `GET /api/marketing/sales-by-product`
- `GET /api/marketing/sales-orders`
- `GET /api/marketing/sales-orders/:id`

Metric live: total pesanan/revenue/qty/AOV, pelanggan unik/repeat, tren, channel, produk, CS, divisi, dan retur berbasis data pengiriman. Semua pesanan valid selalu memakai `orders.orders.flag = 'valid'`; revenue pesanan tidak pernah dihitung setelah join langsung ke item.

Metric `paid_order_rate`, `net_revenue`, dan `margin` bertanda parsial karena data pembayaran/finance belum lengkap; `cancel_rate` tidak tersedia karena nilai cancel tidak konsisten. KPI total/revenue serta channel dan produk membuka daftar pesanan valid terfilter.

### Source Performance

Tab **Source Performance** pada `/marketing/ads-roas` sudah membaca pesanan ERP valid dari database (bukan atribusi iklan).

Endpoint:

- `GET /api/marketing/source-performance/summary`
- `GET /api/marketing/source-performance/by-channel`
- `GET /api/marketing/source-performance/by-divisi`
- `GET /api/marketing/source-performance/trend`
- `GET /api/marketing/source-performance/orders`

Semua endpoint wajib menerima `start_date` dan `end_date`. Order valid selalu memakai `orders.orders.flag = 'valid'`; `order_status` tidak digunakan. Revenue diagregasi dari pesanan sebelum qty `order_items` digabung sehingga nilainya tidak terdobel.

Tab menampilkan KPI pesanan, pendapatan, qty, pelanggan unik, tren, channel, divisi, produk terlaris, serta daftar pesanan. Klik channel/divisi/produk membuka daftar pesanan terfilter. Platform Ads dan import Meta Ads tidak diubah.

## Definisi Metric

Semua metric turunan dihitung ulang dari agregat metric dasar, tidak menjumlahkan kolom rasio per baris:

| Metric | Rumus |
| --- | --- |
| CTR | `link_clicks / impressions * 100` |
| CPC | `spend / link_clicks` |
| CPM | `spend / impressions * 1000` |
| Cost per Landing Page View | `spend / landing_page_views` |
| Cost per Checkout | `spend / checkout_started` |
| Cost per Purchase | `spend / purchases` |
| Platform ROAS | `purchase_value / spend` |
| CPL | `spend / leads` |

Semua pembagian aman: penyebut `0` menghasilkan `null`, bukan `NaN` atau `Infinity`.

## Availability Saat Ini

| Metric | Status | Alasan |
| --- | --- | --- |
| Platform ROAS | AVAILABLE | Menggunakan nilai konversi pembelian dari import Meta Ads. |
| ERP ROAS | NOT_AVAILABLE | Belum ada campaign/UTM/click_id yang terhubung ke `orders.orders`. |
| Performa Set Iklan | NOT_AVAILABLE | File import contoh tidak membawa adset name/ID. |
| Performa Iklan | NOT_AVAILABLE | File import contoh tidak membawa ad name/ID. |
| Atribusi Pesanan ERP | NOT_AVAILABLE | Belum ada mapping iklan ke pesanan ERP. |

## Logika Data Lain yang Harus Dipertahankan

- Order valid: `orders.orders.flag = 'valid'`.
- Jangan memakai `orders.orders.order_status` sebagai definisi valid.
- Cohort: join `orders.customer_transactions.customer_id` ke `master.customer_cohorts.customer_id`.
- Jangan memakai `customer_transactions.order_id` atau `customer_transactions.cohort_month` karena kosong.
- Status grup WA, follow-up, dan tracking WhatsApp tetap disabled sampai data/tabel tersedia.
- Net revenue dan margin tetap parsial karena data finance belum lengkap.

## Sisa Pekerjaan

1. Memigrasikan laporan Sales & Order lain (produk, channel, CS, status/COD, retur) dari mock ke endpoint live yang sesuai.
2. Membuat dan menyambungkan CRM, RFM, Cohort, Frequency, Retention, dan Source Coverage.
3. Menerapkan `DateRangePicker` pada semua halaman Marketing selain Iklan & ROAS dan Sales Overview.
4. Menambahkan mapping campaign/UTM/click_id ke order ERP untuk membuka ERP ROAS.
5. Menambah parser laporan Meta yang memuat adset/ad dan laporan harian bila file sumber tersedia.
