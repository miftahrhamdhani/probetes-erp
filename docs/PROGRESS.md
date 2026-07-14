# PROBETES ERP — Papan Status Pengerjaan

Papan status hidup untuk melacak progres pembangunan sesuai **[PRD.md](PRD.md)** dan roadmap fase.
Dicentang tiap fitur selesai **dan sudah diverifikasi** (bukan sekadar kodenya ditulis).

**Cara baca status:** ⬜ Belum · 🟡 Proses · ✅ Selesai · ⏸️ Ditunda
**Estimasi ukuran:** S (kecil, <1 hari) · M (sedang, 1–3 hari) · L (besar, 3–7 hari) · XL (>1 minggu)
**Aturan centang:** boleh ✅ hanya jika **Syarat Selesai** terpenuhi & sudah dicek jalan.
**Tanggal:** diambil dari tanggal commit fitur terkait (bukan diketik manual).

_Terakhir diperbarui: 14 Juli 2026 — diverifikasi ulang ke database live + git. Lihat bagian **Kekurangan & Saran** di bawah._

---

## Ringkasan Progres per Fase

| Fase | Fokus | Status | Progres |
|---|---|---|---|
| 0 | Fondasi UI & struktur | ✅ Selesai | 3/3 |
| 1 | Database Core (baca) | ✅ Selesai | 8/8 |
| 2 | API tulis & edit data utama | 🟡 Proses | 1/4 (pilot Pelanggan) |
| 3 | Staging & import aman | ⬜ Belum | 0/3 |
| 4 | Marketing import marketplace | 🟡 Proses | 1/4 |
| 5 | Sales & Order + Iklan & ROAS | 🟡 Proses | 0/4 |
| 6 | CRM + RFM & Cohort | 🟡 Proses | 1/6 |
| 7 | Data Tracking | ⬜ Belum | 0/4 |
| 8 | Warehouse / Gudang | ⬜ Belum | 0/4 |
| 9 | Finance | ⬜ Belum | 0/4 |
| 10 | IAM / User Management | ⬜ Belum | 0/3 |
| 11 | HRIS | ⬜ Belum | 0/7 |
| 12 | Reports Owner & Automasi | ⬜ Belum | 0/3 |
| 13 | AI Assistant & Insight | ⬜ Belum | 0/4 |

> Catatan lintas-fase yang masih terbuka (dari audit): **SKU produk 0%** (tunggu Fase 8 gudang),
> **cohort ↔ order belum tersambung** (`customer_transactions.order_id` 0% — lihat F1-08).

---

## Fase 0 — Fondasi UI & Struktur Project ✅

| ID | Item | Syarat Selesai | Est | Status | Tgl | Catatan |
|---|---|---|---|---|---|---|
| F0-01 | Monorepo + Home Launcher | Project jalan, launcher tampil, style Probetes (merah, card) | M | ✅ | 2026-07-03 | commit init + launcher |
| F0-02 | Route & layout modul | Semua route modul ada (walau placeholder), header konsisten | S | ✅ | 2026-07-04 | organize launcher & module routes |
| F0-03 | Komponen reusable | MasterTable & komponen berbagi dipakai lintas halaman | M | ✅ | 2026-07-09 | refactor shared MasterTable |

## Fase 1 — Database Core (baca dari DB asli) ✅

| ID | Item | Syarat Selesai | Est | Status | Tgl | Catatan |
|---|---|---|---|---|---|---|
| F1-01 | Migrasi data lama → PostgreSQL | DB `probetes_erp` terisi (21.603 pelanggan, 31.831 order), schema per domain | L | ✅ | 2026-07-07 | pipeline python + load_to_postgres |
| F1-02 | Customer ID otomatis + dedup HP | ID `PB-CUST-xxxxxx`, dedup by HP ternormalisasi | M | ✅ | 2026-07-07 | aturan dedup diterapkan |
| F1-03 | Ringkasan Data | KPI live dari `/api/database/summary`, tidak ada angka hardcode | M | ✅ | 2026-07-08 | summary API |
| F1-04 | Data Utama — Pelanggan | Tabel baca live, No HP penuh, status validasi | M | ✅ | 2026-07-08 | PelangganSection |
| F1-05 | Data Utama — Cohort & Ekspedisi | Tabel cohort & kurir baca live | M | ✅ | 2026-07-07 | master data cohort & ekspedisi |
| F1-06 | Data Utama — Produk/Channel/CS | Tabel baca live, status mapping tampil | M | ✅ | 2026-07-06 | master data module |
| F1-07 | Kualitas Data | Rumus di `quality-sql.ts`, isu tampil dari `/api/data-quality` | M | ✅ | 2026-07-08 | data-quality API |
| F1-08 | Status Cadangan | Baca `system.backup_*`, riwayat + jadwal tampil | M | ✅ | 2026-07-08 | backup API + page |

> **Sisa pekerjaan data (bukan blokir Fase 1, tapi dicatat):**
> - Sambung `orders.customer_transactions.order_id` (kini 0%) → syarat Reports repeat akurat.
> - Enrichment sudah jalan (channel_id 99%, kategori 90%, kota/provinsi 46%).
> - **Pembersihan kualitas data batch-1 (14 Jul):** detektor nama dirapikan (35→3 masalah nyata);
>   54 kota dipulihkan (310→256 kosong). Sisa keputusan owner di `docs/KEPUTUSAN_KUALITAS_DATA.md`
>   (9 produk kategori, 12 HP, 3 nama, 1 produk dummy). Perbaikan manual penuh menunggu Fase 2.

## Fase 2 — API Tulis & Edit Data Utama ⬜

| ID | Item | Syarat Selesai | Est | Status | Tgl | Catatan |
|---|---|---|---|---|---|---|
| F2-01 | API tulis master (edit/hapus) | Edit/hapus benar tersimpan ke DB (bukan mock); banner "sementara" dihapus | L | 🟡 | 2026-07-14 | **Pelanggan SELESAI & teruji** (PUT/DELETE arsip, GET sembunyikan arsip). Sisa: Produk/Channel/CS/Ekspedisi |
| F2-02 | Merge customer duplikat | Aksi gabung 2 customer → riwayat menyatu, ID lama diarsip | L | ⬜ | — | status `duplicate` → merge |
| F2-03 | Mapping produk/channel | Ubah mapping alias → produk/channel final tersimpan | M | ⬜ | — | dari status review → valid |
| F2-04 | Activity log dasar | Setiap edit tercatat (siapa, kapan, before/after) | M | 🟡 | 2026-07-14 | Tabel `audit.change_log` + rekam edit/arsip Pelanggan. `changed_by='app'` (identitas user menunggu IAM/Fase 10) |

## Fase 3 — Staging & Import Aman ⬜

| ID | Item | Syarat Selesai | Est | Status | Tgl | Catatan |
|---|---|---|---|---|---|---|
| F3-01 | Schema staging | `staging.import_rows` ada, menampung baris mentah + parsed | M | ⬜ | — | penampungan sementara |
| F3-02 | Preview & validasi import | Upload → preview tabel → validasi field wajib/HP/tanggal/duplikat | L | ⬜ | — | sebelum promote |
| F3-03 | Promote ke data utama | Data valid masuk master/orders; ragu → `review` | L | ⬜ | — | fondasi migrasi 2-bulanan |

## Fase 4 — Marketing Import Marketplace 🟡

| ID | Item | Syarat Selesai | Est | Status | Tgl | Catatan |
|---|---|---|---|---|---|---|
| F4-01 | Import Spending Ads (Meta) | Schema `marketing.ad_*` + upload + parse; batch tercatat | L | ✅ | 2026-07-09 | schema & API ada (data belum diimport) |
| F4-02 | Import Data Pesanan (Scalev) | Upload file order → preview → tersimpan | M | 🟡 | 2026-07-09 | import page handle Scalev — WIP |
| F4-03 | Edit/hapus toko di import | Kelola daftar toko sumber import | S | ✅ | 2026-07-09 | edit/delete store |
| F4-04 | Import TikTok/Shopee | Upload + mapping kolom kedua platform | M | ⬜ | — | belum |

## Fase 5 — Sales & Order + Iklan & ROAS 🟡

| ID | Item | Syarat Selesai | Est | Status | Tgl | Catatan |
|---|---|---|---|---|---|---|
| F5-01 | Sales & Order overview | KPI sales/order/AOV live dari `orders`; API `sales-summary/trend` | L | 🟡 | — | API sedang dibuat (belum commit) |
| F5-02 | Sales by channel & product | Breakdown per channel/produk live | M | 🟡 | — | API `sales-by-channel/product` WIP |
| F5-03 | Detail order & customer | Klik baris → detail pesanan | M | 🟡 | — | `sales-orders/[id]` WIP |
| F5-04 | Iklan & ROAS | ROAS/spending/leads dari data import + orders | L | 🟡 | — | AdsRoasPage WIP, tunggu data import |

## Fase 6 — CRM + RFM & Cohort 🟡

| ID | Item | Syarat Selesai | Est | Status | Tgl | Catatan |
|---|---|---|---|---|---|---|
| F6-01 | Import CRM (manual) | Form input manual closing/customer di CRM Import | M | 🟡 | 2026-07-13 | form ada — belum simpan ke DB `crm` |
| F6-02 | Schema `crm` | `crm.closings/followups/customer_groups/customer_clusters` dibuat | M | ⬜ | — | belum ada di DB |
| F6-03 | Data Pesanan CRM | Closingan CS/WA tampil + KPI CRM | L | ⬜ | — | butuh F6-02 |
| F6-04 | RFM & Cohort — Retention | Heatmap retention per cohort, klik cell → customer | L | ⬜ | — | RFM sudah dihitung di cohorts |
| F6-05 | RFM & Cohort — Frequency | Heatmap frekuensi F1..F19+ | M | ⬜ | — | |
| F6-06 | RFM & Cohort — Cluster | 14 cluster custom Probetes + rekomendasi follow-up | L | ⬜ | — | taksonomi cluster sudah disepakati |

## Fase 7 — Data Tracking ⬜

| ID | Item | Syarat Selesai | Est | Status | Tgl | Catatan |
|---|---|---|---|---|---|---|
| F7-01 | Cek Resi | Cari resi/customer → status + detail (data sudah di DB) | M | ⬜ | — | `tracking.shipments` sudah terisi |
| F7-02 | Status Pengiriman | Filter status/umur, tabel pengiriman | M | ⬜ | — | UI masih placeholder |
| F7-03 | COD & Pembayaran | Filter belum/sudah cair/selisih | M | ⬜ | — | `tracking.cod_payments` ada |
| F7-04 | Retur & Gagal Kirim | Daftar kasus + follow-up | M | ⬜ | — | `tracking.returns` ada |

## Fase 8 — Warehouse / Gudang ⬜

| ID | Item | Syarat Selesai | Est | Status | Tgl | Catatan |
|---|---|---|---|---|---|---|
| F8-01 | Schema warehouse + load gudang | `warehouse.*` dibuat, CSV gudang termuat | M | ⬜ | — | CSV sudah siap, belum di DB |
| F8-02 | Mapping SKU lokal → produk | `product_sku_map` isi; `products.sku` terisi (kini 0%) | M | ⬜ | — | tutup gap SKU |
| F8-03 | Dashboard & Stok Barang | Stok per gudang, reserved, kritis, mapping | L | ⬜ | — | |
| F8-04 | Mutasi/Opname/Retur gudang | Barang masuk/keluar/transfer/opname tercatat | L | ⬜ | — | |

## Fase 9 — Finance ⬜

| ID | Item | Syarat Selesai | Est | Status | Tgl | Catatan |
|---|---|---|---|---|---|---|
| F9-01 | Perluas schema finance | `accounts/expenses/incomes/settlements` dibuat | M | ⬜ | — | `order_finance` sudah ada |
| F9-02 | Dashboard Finance | Pemasukan/pengeluaran/margin/COD ringkas | L | ⬜ | — | |
| F9-03 | Rekonsiliasi & settlement | Cocokkan payout vs order/COD; status cocok/selisih | L | ⬜ | — | |
| F9-04 | HPP & Margin | Margin per order/produk | M | ⬜ | — | HPP sumber tipis (21%) |

## Fase 10 — IAM / User Management ⬜

| ID | Item | Syarat Selesai | Est | Status | Tgl | Catatan |
|---|---|---|---|---|---|---|
| F10-01 | Schema iam + login | `iam.accounts/roles/permissions`, login jalan, password hash | L | ⬜ | — | |
| F10-02 | Role & permission per modul | Menu/aksi dibatasi sesuai role | L | ⬜ | — | |
| F10-03 | Activity log lengkap | Semua aksi penting tercatat + halaman audit | M | ⬜ | — | dasar dari F2-04 |

## Fase 11 — HRIS ⬜

| ID | Item | Syarat Selesai | Est | Status | Tgl | Catatan |
|---|---|---|---|---|---|---|
| F11-01 | Schema hris + Data Karyawan | `hris.*` dibuat, CRUD karyawan, data sensitif dibatasi role | L | ⬜ | — | |
| F11-02 | Departemen & Jabatan | Struktur organisasi + hubungkan karyawan | M | ⬜ | — | |
| F11-03 | Absensi | Import/input absensi, hitung jam kerja | L | ⬜ | — | |
| F11-04 | Cuti/Izin | Pengajuan + persetujuan | M | ⬜ | — | |
| F11-05 | Payroll & Slip Gaji | Periode → slip → komponen; net pay | L | ⬜ | — | |
| F11-06 | Komisi CS/CRM | Komisi otomatis dari order/leads (tunggu keputusan owner) | M | ⬜ | — | keputusan owner #2 |
| F11-07 | Laporan HRD | Rangkuman karyawan/absensi/payroll | M | ⬜ | — | |

## Fase 12 — Reports Owner & Automasi ⬜

| ID | Item | Syarat Selesai | Est | Status | Tgl | Catatan |
|---|---|---|---|---|---|---|
| F12-01 | Reports VIEW lintas domain | `reports.*` (sales, channel, cohort, pnl, dll) jalan | L | ⬜ | — | |
| F12-02 | Dashboard Owner | KPI lintas modul + export | L | ⬜ | — | keputusan owner #8 |
| F12-03 | Automasi & scheduled refresh | Materialized view di-refresh terjadwal; siap API marketplace | L | ⬜ | — | |

## Fase 13 — AI Assistant & Insight ⬜

| ID | Item | Syarat Selesai | Est | Status | Tgl | Catatan |
|---|---|---|---|---|---|---|
| F13-01 | Schema ai + integrasi model | `ai.*` dibuat, koneksi model Claude terbaru | M | ⬜ | — | keputusan owner #9 |
| F13-02 | Tanya Data (chat read-only) | Jawab pertanyaan atas Reports/analytics + sertakan sumber; tidak pernah menulis data | L | ⬜ | — | dibatasi hak akses penanya |
| F13-03 | Ringkasan & deteksi anomali | Ringkasan harian/mingguan + tanda hal tidak wajar | L | ⬜ | — | |
| F13-04 | Riwayat & insight tersimpan | Simpan percakapan/insight; tercatat di activity log | M | ⬜ | — | |

---

## Kekurangan & Saran (hasil verifikasi 14 Juli 2026)

Bagian ini dicek langsung ke database live + kode, bukan asumsi. Diperbarui tiap ada temuan baru.

### A. Kekurangan fondasi (yang bikin modul di atasnya belum kokoh)

| # | Kekurangan | Dampak | Terkait |
|---|---|---|---|
| K-1 | **Data belum bisa ditulis/diedit dari aplikasi** (semua API master read-only, Edit/Hapus masih mock) | Data kotor tidak bisa dibersihkan dari app; keputusan owner kualitas data tak bisa diterapkan | Fase 2 |
| K-2 | **Cohort ↔ Order belum tersambung** (`customer_transactions.order_id` = 0%) | Laporan repeat/LTV/retention belum bisa akurat | F1-08, Fase 6/12 |
| K-3 | **SKU produk masih 0%** | Produk belum tersambung ke stok gudang | F8-02 (Fase 8) |
| K-4 | **Belum ada penampungan (staging)** — import masih drop+recreate | Migrasi bertahap 2-bulanan & validasi sebelum masuk belum ada mekanismenya | Fase 3 |
| K-5 | **Belum ada login & hak akses (IAM)** | Aplikasi belum multi-user; data sensitif (nanti HRIS/finance) belum bisa dibatasi | Fase 10 |
| K-6 | **Belum ada activity log** | Perubahan data tidak terekam siapa/kapan | F2-04, Fase 10 |

### B. Kekurangan modul (data sudah ada, tinggal dibangun UI/logika)

- **Data Tracking (Fase 7):** data resi/COD/retur sudah di DB, tapi UI masih placeholder.
- **CRM (Fase 6):** schema `crm` (closings/followups/clusters) belum ada di DB — CRM baru sebatas form import.
- **Marketing WIP belum di-commit** (sales-summary/trend/by-channel/by-product/orders + AdsRoasPage): sudah query DB live tapi **belum di-commit & belum diverifikasi** → berisiko hilang / menumpuk. **Saran: commit + verifikasi dulu sebelum lanjut fitur baru.**

### C. Kualitas data — menunggu keputusan owner
Sudah dibersihkan: nama (35→3), kota (310→256). Sisa butuh keputusan → `docs/KEPUTUSAN_KUALITAS_DATA.md`:
9 produk kategori · 1 produk dummy · 12 HP salah format · 3 nama rusak. (Tumpukan status `review` lain sudah bersih: hanya 1 produk.)

### D. Saran cepat (quick win, risiko kecil)

1. **Aktifkan jadwal backup.** Sekarang masih `manual` dan backup terakhir 8 Juli (6 hari lalu). Data sudah 21rb+ pelanggan & kamu aktif ngoprek — set `daily`/`weekly` di menu Status Cadangan.
2. **Commit pekerjaan Marketing yang menggantung** biar tidak hilang & papan status bisa dicentang.
3. **Isi keputusan owner** di `KEPUTUSAN_KUALITAS_DATA.md` (9 produk + 12 HP) — cepat, dan menutup sisa isu kualitas data.

### E. Saran urutan (dari sisi arsitektur)

> Urutan roadmap boleh fleksibel, tapi ada ketergantungan yang sebaiknya dihormati:

1. **Selesaikan & commit Marketing** (Fase 4–5) yang sedang jalan — jangan menumpuk WIP.
2. **Fase 2 (API tulis + merge customer)** — fondasi kebersihan data; semua modul baca master yang sama.
3. **Sambung cohort↔order (K-2)** — syarat sebelum Reports & CRM retention akurat.
4. **Fase 3 (staging)** — sebelum import makin banyak sumber.
5. **Fase 10 (IAM) sebelum Fase 11 (HRIS)** — jangan simpan gaji/NIK tanpa kontrol akses.

---

## Log Perubahan Papan Status

| Tanggal | Perubahan |
|---|---|
| 2026-07-14 | Papan status dibuat. Kondisi awal diisi dari audit DB live + git history: Fase 0–1 selesai, Fase 4–6 sebagian, sisanya belum. |
| 2026-07-14 | Pembersihan kualitas data batch-1: detektor nama diperbaiki (quality-sql.ts), 54 kota di-backfill (backfill_city.py + pipeline), daftar keputusan owner dibuat. |
| 2026-07-14 | Verifikasi ulang ke DB live + git; ditambahkan bagian **Kekurangan & Saran** (K-1..K-6, saran cepat & urutan). Status Fase 0–13 dipastikan masih akurat. |
| 2026-07-14 | Keputusan owner ronde-2 dicatat (`docs/KEPUTUSAN_OWNER_DATABASE.md`). Dibuat file koreksi produk `data_migrasi/koreksi/koreksi_produk.csv` + `apply_koreksi_produk.py` (dry-run OK, BELUM di-apply — menunggu owner edit/lengkapi). |
| 2026-07-14 | **Fase 2 dimulai (F2-01 pilot Pelanggan):** API tulis `PUT/DELETE /api/master/customers/[id]` (hapus=arsip), GET sembunyikan arsip, audit `audit.change_log` (F2-04 dasar), modal Edit simpan ke DB. Teruji end-to-end (edit+arsip+404), data tes dikembalikan. Typecheck lolos. |
