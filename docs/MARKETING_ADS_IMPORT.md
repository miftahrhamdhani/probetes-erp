# Import Meta Ads CSV — Probetes ERP

## Cara Import

1. Buka **Marketing → Iklan & ROAS**.
2. Masuk tab **Riwayat Import**.
3. Klik **Import CSV** dan pilih file `.csv` export Meta Ads.
4. Sistem menyimpan riwayat file dan semua baris kampanye ke database.
5. Buka tab **Platform Ads** untuk melihat KPI, tabel kampanye, tren, dan funnel.

Tahun bawaan import saat ini adalah **2025**, karena tiga file contoh yang diberikan adalah data tahun 2025. Jika laporan baru memakai tahun lain, endpoint menerima field multipart `report_year` dan UI perlu meneruskannya dari input tahun laporan.

## Header Minimum

Importer menerima format export Meta Ads penuh maupun format file contoh yang sudah dirapikan.

Header wajib:

- `Nama Kampanye`
- salah satu dari `Jumlah yang dibelanjakan (IDR)` atau `Total Belanja (Spend)`

Tanggal:

- Jika file memuat `Awal pelaporan` + `Akhir pelaporan`, importer menggunakan tanggal tersebut.
- Jika file contoh tidak memuat tanggal, importer membaca nama bulan dari nama file dan membentuk periode bulan penuh pada `report_year`. Contoh `Juni` + `2025` menjadi `2025-06-01` sampai `2025-06-30`.

## Mapping Kolom

| Kolom Meta Ads | Kolom Database |
| --- | --- |
| Awal pelaporan | `report_start_date` |
| Akhir pelaporan | `report_end_date` |
| Nama kampanye | `campaign_name` |
| Tanggal pembuatan | `campaign_created_at` |
| Penayangan kampanye | `campaign_delivery_status` |
| Anggaran Set Iklan | `budget_value` |
| Jenis Anggaran Set Iklan | `budget_type` |
| Jumlah yang dibelanjakan (IDR) / Total Belanja (Spend) | `spend` |
| Proses pembayaran yang dimulai / Initiate Checkout (IC) | `checkout_started` |
| Pembelian / Total Pembelian (Closing) | `purchases` |
| Nilai konversi pembelian / Nilai Konversi / Omzet (IDR) | `purchase_value` |
| ROAS | `platform_roas` |
| Klik tautan / Klik Tautan (Link Clicks) | `link_clicks` |
| CPC | `cpc_link` |
| Tayangan halaman tujuan / Landing Page Views | `landing_page_views` |
| CTR | `ctr_link` |
| Jangkauan | `reach` |
| Impresi | `impressions` |
| CPM | `cpm` |
| Frekuensi | `frequency` |
| Penambahan ke keranjang belanja | `add_to_cart` |
| Prospek Penjualan | `leads` |
| Biaya per Prospek | `cost_per_lead` |
| Tayangan video / ThruPlays / Waktu Tonton / 25–95% | kolom video terkait |

Kolom `custom_derived_metrics:*` dan kolom lain yang tidak dipetakan tetap disimpan dalam `raw_data`, bukan dipakai sebagai KPI utama.

## Parsing Nama File

Contoh:

```txt
EBook 90 - 10364 - Juni - Adv Irfan.csv
```

Hasil:

```txt
product_label: EBook 90
account_code: 10364
report_month: Juni
advertiser_name: Irfan
```

Jika format nama file tidak cocok, import tidak gagal. Sistem tetap menyimpan nama file pada `file_label`.

## Parsing Angka

Importer menangani:

- angka Indonesia (`1.234,56`),
- angka internasional (`1234.56`),
- persen (`1,52%`),
- Rupiah (`Rp 1.234`),
- kosong atau strip (`-`).

Nilai kosong tidak menghasilkan `NaN` atau `Infinity`.

## Rumus Dashboard

Dashboard tidak menjumlahkan CTR, CPC, CPM, atau ROAS mentah dari file. Semua dihitung ulang dari metric dasar agregat:

```txt
CTR = link_clicks / impressions * 100
CPC = spend / link_clicks
CPM = spend / impressions * 1000
Cost per Checkout = spend / checkout_started
Cost per Purchase = spend / purchases
Platform ROAS = purchase_value / spend
```

Jika penyebut nol, metric ditampilkan sebagai `—`.

## Platform ROAS vs ERP ROAS

**Platform ROAS aktif** karena file Meta Ads memberi `purchase_value` dan `spend`.

**ERP ROAS belum aktif** karena belum ada mapping `campaign`, `utm_*`, atau `click_id` dari iklan ke `orders.orders`. Nilai konversi platform belum dapat diklaim sebagai pendapatan yang sudah terhubung ke pesanan internal.

## Mengapa Set Iklan dan Iklan Belum Aktif

File contoh hanya memuat level campaign. Tidak ada `adset_name`/`adset_id` maupun `ad_name`/`ad_id`, sehingga Performa Set Iklan dan Performa Iklan ditampilkan disabled hingga export yang lebih detail tersedia.
