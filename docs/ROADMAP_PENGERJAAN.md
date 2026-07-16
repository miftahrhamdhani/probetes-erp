# PROBETES ERP — Roadmap Pengerjaan (Urutan Eksekusi)

**Aturan main:**
- Tetap pakai **`pg` mentah** (bukan Prisma).
- Tiap baris = 1 task yang dikerjakan **Frontend + Backend sekaligus**, lalu **langsung testing**.
- Kerjakan **berurutan dari atas ke bawah**. Selesai 1 baris → tandai ✅ → lanjut.
- Tampilan tetap seperti sekarang, **kecuali Warehouse** (pakai sidebar).
- Kolom untuk spreadsheet: `No | Fase | Menu | Task | Sisi (FE/BE/Both) | Prioritas | Est. | Status | Catatan`

> **Legenda Status:** ⬜ Belum · 🟡 Proses · ✅ Selesai · ⏭️ Skip

---

## FASE 0 — BEBENAH (fondasi bersih dulu)

| No | Task | Sisi | Prioritas | Status |
|---|---|---|---|---|
| 0.1 | Audit folder `docs/` → buat daftar file usang untuk dihapus (tampilkan dulu, hapus setelah ACC) | — | Tinggi | ⬜ |
| 0.2 | Audit dead code (fungsi/komponen/mock tak terpakai) → buat daftar | — | Tinggi | ⬜ |
| 0.3 | Hapus file & kode yang sudah di-ACC | Both | Tinggi | ⬜ |
| 0.4 | Jadikan `PRD_BLUEPRINT_SSOT.md` sebagai PRD utama; arsipkan/hapus `PRD.md` lama | — | Sedang | ⬜ |
| 0.5 | Update `CLAUDE.md` + `PROGRESS.md` agar menunjuk ke PRD baru | — | Sedang | ⬜ |
| 0.6 | Pastikan `pnpm typecheck` & `pnpm build` bersih setelah bebenah | Both | Tinggi | ⬜ |

**Output Fase 0:** repo bersih, satu PRD acuan, tidak ada dead code, build lulus.

---

## FASE 1 — MARKETING (lanjutkan yang setengah jadi)

> Sudah 60-70% jadi. Fokus: sambungkan & rapikan.

| No | Sub-menu | Task | Sisi | Status |
|---|---|---|---|---|
| 1.1 | Import Data Channel | Uji ulang parser TikTok/Shopee/Meta (file asli) + perbaiki alias yang masih meleset | BE | ⬜ |
| 1.2 | Import Data Channel | Commit multi-produk atomik (1 order, banyak item) — pastikan omzet tidak ganda | BE | ⬜ |
| 1.3 | Admin Inputer | Uji end-to-end cari order → edit identitas → simpan + audit | Both | ⬜ |
| 1.4 | Sales & Order Center | Detail order (items, customer, shipment, finance) read | Both | ⬜ |
| 1.5 | CRM | Job re-compute cohort/RFM dari `orders` (bukan hardcode) | BE | ⬜ |
| 1.6 | Iklan & ROAS | Sambungkan chart ke data asli `ad_campaign_metrics` (ganti mock) | Both | ⬜ |
| 1.7 | Iklan & ROAS | Label tegas "ROAS Platform" + filter periode benar | FE | ⬜ |

**Testing Fase 1:** upload file nyata → cek preview → commit → cek Sales Center → cek ROAS.

---

## FASE 2 — DATA TRACKING (nempel ke Order yang sudah SSOT)

| No | Sub-menu | Task | Sisi | Status |
|---|---|---|---|---|
| 2.1 | Import Data Everpro | Parser Everpro (reuse pola normalisasi Marketing) → staging | BE | ⬜ |
| 2.2 | Import Data Everpro | Cocokkan resi/ID ke Order (tidak buat order baru) → promote Shipment/COD | BE | ⬜ |
| 2.3 | Cek Resi | Search 1 resi/order → kartu detail (join shipment+order+customer) | Both | ⬜ |
| 2.4 | Status Pengiriman | Tabel by status + umur paket + follow-up | Both | ⬜ |
| 2.5 | COD & Pembayaran | Status pencairan COD; tandai cair | Both | ⬜ |
| 2.6 | Retur & Gagal Kirim | Buat retur → simpan (siapkan hook ke Warehouse+Finance di fase berikut) | Both | ⬜ |

**Testing Fase 2:** import Everpro → cek resi muncul di order → update status → COD cair.

---

## FASE 3 — WAREHOUSE (tampilan BARU: sidebar) + Stock Move

> **Satu-satunya modul ganti layout → dashboard sidebar kiri.**

| No | Sub-menu | Task | Sisi | Status |
|---|---|---|---|---|
| 3.1 | Layout | Bikin shell Warehouse dgn sidebar navigasi kiri | FE | ⬜ |
| 3.2 | Schema | Buat schema `warehouse` (`warehouses`, `stock_items`, `stock_moves`) | BE | ⬜ |
| 3.3 | Stok Barang | On-hand = SUM(moves) per SKU/gudang | Both | ⬜ |
| 3.4 | Barang Masuk | Form → buat move `in` | Both | ⬜ |
| 3.5 | Barang Keluar | Form → move `out` (ref order) | Both | ⬜ |
| 3.6 | Mutasi | Transfer Jakarta↔Makassar (2 move, 1 transaksi) | Both | ⬜ |
| 3.7 | Stock Opname | Stok sistem vs fisik → move `opname_adjust` | Both | ⬜ |
| 3.8 | Retur Gudang | Sambung dari Tracking 2.6 → move `return_in` | BE | ⬜ |
| 3.9 | Restock Alert | on-hand < reorder_point (read-only) | Both | ⬜ |

**Testing Fase 3:** input barang masuk/keluar → cek on-hand berubah → mutasi antar gudang → opname.

---

## FASE 4 — FINANCE (SSOT uang: Ledger)

| No | Sub-menu | Task | Sisi | Status |
|---|---|---|---|---|
| 4.1 | Schema | Buat `finance.ledger_accounts`, `ledger_entries`, `money_change_requests` | BE | ⬜ |
| 4.2 | COD → Ledger | Hook: COD cair (Tracking) → auto Ledger Entry | BE | ⬜ |
| 4.3 | Retur → Ledger | Hook: retur → Ledger balik | BE | ⬜ |
| 4.4 | Pemasukan/Pengeluaran | Catat transaksi manual → Ledger | Both | ⬜ |
| 4.5 | Rekonsiliasi & Settlement | Cocokkan nominal sistem vs cair | Both | ⬜ |
| 4.6 | HPP & Margin | HPP dari Warehouse move keluar → margin | Both | ⬜ |
| 4.7 | Laba Rugi | 100% computed dari ledger + Export | Both | ⬜ |
| 4.8 | Ringkasan (Dashboard) | KPI dari SUM(ledger) | Both | ⬜ |
| 4.9 | Approval uang | MoneyChangeRequest → approve atasan | Both | ⬜ |

**Testing Fase 4:** COD cair → cek muncul di Laba Rugi otomatis → retur → cek koreksi.

---

## FASE 5 — HRIS

| No | Sub-menu | Task | Sisi | Status |
|---|---|---|---|---|
| 5.1 | Schema | `hris` (employees, attendance, payroll_runs, payslips) | BE | ⬜ |
| 5.2 | Data Karyawan | CRUD (NIK/gaji gated) | Both | ⬜ |
| 5.3 | Absensi | Import/tambah absensi | Both | ⬜ |
| 5.4 | Cuti & Izin | Ajukan → approve | Both | ⬜ |
| 5.5 | Payroll | Run → slip (netPay computed) → approve → **Ledger biaya gaji** | Both | ⬜ |
| 5.6 | Komisi Tim | Hitung komisi dari `orders` | Both | ⬜ |
| 5.7 | Dashboard + Laporan HR | KPI + read-only | Both | ⬜ |

**Testing Fase 5:** buat payroll → approve → cek biaya gaji masuk Finance.

---

## FASE 6 — USER MANAGEMENT (IAM) — kunci akses semua modul

| No | Sub-menu | Task | Sisi | Status |
|---|---|---|---|---|
| 6.1 | Schema | `iam` (accounts, roles, permissions, role_permissions, account_roles, login_history) | BE | ⬜ |
| 6.2 | Login + Session | Auth server-side, ganti aktor audit `"app"` → user asli | BE | ⬜ |
| 6.3 | Akun & Password | CRUD akun + reset | Both | ⬜ |
| 6.4 | Role Permission | Matrix checkbox modul×aksi | Both | ⬜ |
| 6.5 | Account Role | Assign role ke akun | Both | ⬜ |
| 6.6 | `requirePermission` | Pasang guard di semua API tulis (Marketing, Finance, dll) | BE | ⬜ |
| 6.7 | Riwayat Login | Tabel read-only | Both | ⬜ |

**Testing Fase 6:** login sbg Admin Inputer → coba akses Finance approve (harus ditolak).

---

## FASE 7 — REPORTS (read-only, tinggal query)

| No | Sub-menu | Task | Sisi | Status |
|---|---|---|---|---|
| 7.1 | Ringkasan (Owner) | KPI gabungan semua modul | Both | ⬜ |
| 7.2 | Penjualan | query `orders` | Both | ⬜ |
| 7.3 | Marketing | query ad_spend + orders | Both | ⬜ |
| 7.4 | CRM | query cohort | Both | ⬜ |
| 7.5 | Finance | query ledger | Both | ⬜ |
| 7.6 | Tracking | query shipments/cod/returns | Both | ⬜ |
| 7.7 | HRIS | query attendance/payslip | Both | ⬜ |
| 7.8 | Gudang | query stock_moves | Both | ⬜ |
| 7.9 | Export | PDF/Excel semua laporan | Both | ⬜ |

**Testing Fase 7:** buka tiap laporan → cek angka cocok dgn modul sumber → export.

---

## FASE 8 — AI ASSISTANT (read-only, konsumen akhir)

| No | Task | Sisi | Status |
|---|---|---|---|
| 8.1 | Schema `ai` (conversations, messages, skills) | BE | ⬜ |
| 8.2 | Query engine read-only (whitelist tabel) | BE | ⬜ |
| 8.3 | Chat UI sambung ke backend (ganti preview) | Both | ⬜ |
| 8.4 | Skill cards → jalankan query cepat | Both | ⬜ |
| 8.5 | Simpan riwayat + insight + audit | Both | ⬜ |

**Testing Fase 8:** tanya "COD belum cair minggu ini" → jawaban dari data asli.

---

## FASE 9 — DATABASE (finishing master data)

| No | Sub-menu | Task | Sisi | Status |
|---|---|---|---|---|
| 9.1 | Master Data | API tulis (edit/hapus/gabung) — ganti edit sementara | Both | ⬜ |
| 9.2 | Kualitas Data | Drill-down isu → link ke Master | Both | ⬜ |
| 9.3 | Backup & Cadangan | Status + riwayat | Both | ⬜ |
| 9.4 | Overview | Pastikan semua angka dari query | Both | ⬜ |

---

## Ringkasan Urutan (untuk header spreadsheet)

```
Fase 0: Bebenah
Fase 1: Marketing        (lanjut, tampilan tetap)
Fase 2: Data Tracking    (tampilan tetap)
Fase 3: Warehouse        (tampilan BARU: sidebar) + Stock Move
Fase 4: Finance          (Ledger — SSOT uang)
Fase 5: HRIS
Fase 6: User Management  (IAM — kunci akses)
Fase 7: Reports          (read-only)
Fase 8: AI Assistant     (read-only)
Fase 9: Database         (finishing master)
```

**Prinsip urutan:** identitas & transaksi dulu (Marketing) → logistik (Tracking) → stok (Warehouse) → uang (Finance) → orang (HRIS) → akses (IAM) → laporan & AI terakhir (tinggal baca).

---

## Catatan Cara Kerja

1. Tiap task FE+BE digarap bareng → langsung bisa dites di browser.
2. Setelah tiap sub-menu: `pnpm typecheck` + `pnpm build` + cek di `localhost:3000`.
3. Tidak commit otomatis — nunggu perintah.
4. Perubahan besar (hapus file, ganti layout) → konfirmasi dulu.
