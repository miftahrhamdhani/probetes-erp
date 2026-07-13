# Audit Modul Marketing — Probetes ERP

Tanggal: 13 Juli 2026. Pendamping detail data: [MARKETING_DATA_AUDIT.md](MARKETING_DATA_AUDIT.md).

Ringkasan satu kalimat: **database asli sudah kaya untuk order/customer/cohort/RFM, tetapi seluruh frontend Marketing masih membaca mock; data iklan (spend/impressions/clicks) dan status grup WA belum ada sama sekali, jadi ROAS/CTR dan cluster berbasis grup tidak boleh ditampilkan sebagai angka nyata.**

---

## 1. Audit Import

**Kondisi:**
- Import web (`/marketing/import` dan `/marketing/crm/import`) mem-parse CSV/XLSX di browser, menampilkan preview, lalu "menyimpan" hanya ke React context — hilang saat refresh. `/api/marketing/local-import` adalah no-op.
- Import nyata ke database dilakukan sekali lewat pipeline `data_migrasi` (Python), bukan lewat UI.

**Masalah:**
- Tidak ada staging table; klaim UI "Simpan ke Database" menyesatkan (ada modal yang jujur menyebut simulasi — dipertahankan).
- `03_laporan_karyawan.csv` (leads & closing per campaign-block) belum pernah diimport.

**Yang harus dibangun bila lanjut ke backend:** tabel `staging.import_batches` + `staging.import_rows`, endpoint upload yang menulis ke staging dan mem-publish ke tabel utama setelah validasi.

## 2. Audit Sales & Order

- Frontend Sales & Order Center = mock (`temporarySalesOrderMockData.ts`).
- Database sanggup mendukung hampir semua KPI: order, revenue, qty, AOV, channel (100% terisi), divisi, CS (90%), produk, tren harian, retur rate.
- Tidak bisa: cancel rate (tidak ada nilai cancelled), paid rate pasti (tidak ada payment_status), net revenue (finance kosong 67–98%).
- Definisi order valid yang benar: `flag='valid'` — bukan order_status (terisi 21%, ejaan campur `Success/Sukses/Succeess`).

## 3. Audit Iklan / Source Performance

- Frontend Iklan & ROAS menampilkan spending/ROAS/CPC dsb dari mock — **tidak ada satu pun kolom spend/impressions/clicks/campaign_id/utm di database**.
- Keputusan: jalankan **MODE 2 — Source/Channel Performance** (order & revenue per channel dari `orders.orders`, 100% siap), dengan kartu ROAS/CTR/CPC/CPM/MER dinonaktifkan berlabel "Data belum tersedia. Import data iklan untuk mengaktifkan metrik ini."
- Jalur membuka MODE penuh: import export Meta/TikTok Ads (spend, impressions, clicks, conversion value) ke tabel baru `marketing.ad_spending`.

## 4. Audit CRM

- Bisa nyata sekarang: daftar customer (21.603), detail + riwayat transaksi, nilai belanja, repeat, target CRM (19.410 punya HP valid).
- Tidak bisa nyata: status masuk grup WA (`in_wa_group` kosong 100%), lead pipeline, follow-up log, CS conversion, WhatsApp tracking — tabel/logdata tidak ada.
- Konsekuensi UI: KPI "Belum Masuk Grup" dan aksi "Tandai Masuk Grup" di halaman CRM saat ini murni mock; kalau dibuat live harus disertai tabel penyimpanan status grup + import daftar grup WA.

## 5. Audit RFM

- `master.customer_cohorts` sudah menyimpan r_score/f_score/m_score/rfm_segment (8 segmen) untuk seluruh 21.603 customer → dashboard RFM live bisa dibuat tanpa perhitungan baru.
- RFM dengan custom date range = hitung ulang dari `orders.customer_transactions` (DERIVABLE).
- Keterbatasan yang wajib dicantumkan: tidak ada status refund/cancel per transaksi → RFM memakai semua transaksi `status='valid'`.

## 6. Audit Cohort

- Sumber benar: `customer_transactions.transaction_date` + `customer_cohorts.cohort_month/first_purchase_date`. Histori 2024-07 s/d 2026-07 (±24 bulan) — cukup untuk matrix M0–M12.
- Jebakan ditemukan: kolom `customer_transactions.cohort_month` kosong 100% dan `order_id` kosong 100% — cohort wajib join ke customer_cohorts, dan revenue transaksi tidak boleh dicampur dengan revenue orders.

## 7. Audit Frequency

- `customer_cohorts.frequency` tersedia langsung (lifetime); frequency per rentang tanggal dihitung dari transaksi. Keduanya feasible; matrix 1x..19x+ per cohort DERIVABLE.

## 8. Audit Retention

- Returning vs new customer per periode dapat dihitung penuh dari transaksi + first_purchase_date. Status: DERIVABLE, akurasi baik (customer_id konsisten hasil dedup migrasi).

## 9. Audit Source Coverage

- `master.customers.source_origin`, `orders.orders.channel_id` (100%), `master.channels` (6 channel final) → coverage per sumber AVAILABLE. API kualitas data sudah ada (`/api/data-quality`, `quality-sql.ts`).

## 10. Bug / Temuan

1. **Frontend Marketing seluruhnya mock** namun beberapa halaman tidak memberi tanda cukup jelas (DummyBanner dihapus di RFM baru — perlu dikembalikan atau diganti data live).
2. `orders.order_status` ejaan tidak konsisten (3 varian "sukses").
3. `customer_transactions.order_id` & `.cohort_month` kosong total — schema menjanjikan lebih dari isi.
4. `in_wa_group` kosong total padahal jadi dasar 7 dari 14 cluster custom.
5. `pnpm build` gagal di `/api/backup/run` (module resolution, di luar Marketing) — perlu diperiksa terpisah.
6. Import history web tidak persist (hilang saat refresh).

## 11. Solusi Diterapkan (audit ini)

- Dokumentasi availability lengkap per metric dibuat (`MARKETING_DATA_AUDIT.md`).
- Ditetapkan definisi order valid = `flag='valid'`.
- Ditetapkan mode dashboard iklan = MODE 2 (source performance) sampai data ads diimport.
- Tidak ada backend baru yang dibuat pada tahap ini — sesuai prinsip audit dulu; backend menyusul setelah keputusan owner atas rekomendasi di bawah.

## 12. Backend yang Direkomendasikan (belum dibuat)

Semua endpoint menerima `start_date` & `end_date` dan mengembalikan blok `availability` per metric (AVAILABLE/PARTIAL/NOT_AVAILABLE + reason):

1. `GET /api/marketing/sales-summary` — KPI + tren dari orders/order_items.
2. `GET /api/marketing/source-performance` — order/revenue/AOV per channel & divisi.
3. `GET /api/marketing/crm/customers` — list + filter (reuse pola /api/master/customers).
4. `GET /api/marketing/rfm` — distribusi segmen + drilldown customer.
5. `GET /api/marketing/cohort/retention` dan `/cohort/frequency` — matrix dari customer_transactions.
6. (Setelah data ada) `POST /api/marketing/import` + tabel staging; `marketing.ad_spending`; kolom in_wa_group loader.

## 13. Sisa Pekerjaan

1. Keputusan owner: import spend ads? import daftar grup WA? (menentukan MODE iklan & cluster penuh)
2. Bangun endpoint di §12 lalu alihkan service layer frontend dari mock ke API (struktur service sudah disiapkan untuk swap ini).
3. Tambah date-range picker manual (start/end) di semua halaman Marketing + simpan di URL query params.
4. Ganti angka mock dengan empty/disabled state untuk metric NOT_AVAILABLE.
5. Normalisasi order_status + perbaiki bug build `/api/backup/run`.
6. Persist import history + staging import.
