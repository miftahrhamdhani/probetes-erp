# ARSITEKTUR DATABASE PROBETES ERP (LENGKAP)

Blueprint database untuk **seluruh menu** Probetes ERP — modul yang sudah jalan
maupun yang belum dibuat (Warehouse, Finance penuh, HRIS, User Management/hak akses,
penampungan import, Reports). Dokumen ini **cetak biru desain**, bukan perintah eksekusi.
Dibuat konsisten dengan schema yang sudah live di database `probetes_erp`.

> Hubungan dengan dokumen lain:
> - [database.md](../database.md) = gambaran tabel data bisnis + kondisi migrasi saat ini.
> - [ARSITEKTUR_DATABASE.md](ARSITEKTUR_DATABASE.md) (ini) = arsitektur menyeluruh semua domain + roadmap.
> - `data_migrasi/db/schema*.sql` = DDL yang benar-benar sudah dijalankan ke DB live.

---

## 0. Prinsip & Konvensi Global

Aturan ini berlaku untuk **semua** tabel di semua domain.

| Aturan | Keputusan | Alasan |
|---|---|---|
| **Satu database** | Semua modul dalam 1 database `probetes_erp`, dipisah pakai **schema per domain** (`master`, `orders`, `warehouse`, `hris`, dst). | Data terpusat, join mudah, tapi tetap rapi per area. |
| **ID entity** | `TEXT` dengan prefiks, contoh `PB-CUST-000001`, `ORD-000001`, `EMP-0001`. Nomor internal boleh `BIGSERIAL` (mis. baris log). | ID stabil & terbaca manusia; tidak bergantung nama/alamat yang bisa berubah. |
| **Uang** | Selalu `BIGINT` (rupiah bulat, tanpa desimal). Metrik iklan/rasio boleh `NUMERIC`. | Presisi; hindari error pembulatan float. |
| **Nama asli** | Kolom `original_names` disimpan saat mapping (produk, channel, kurir). | Bisa diaudit; data lama tidak hilang. |
| **Status data** | Label baku: `valid`, `review`, `active`/`inactive`, `duplicate`, `archived`. Data ragu = `review`, **tidak dihapus**. | Data kotor tetap tercatat sampai dikonfirmasi. |
| **Kolom waktu (baru)** | Tabel bisnis baru **wajib** punya `created_at`, `updated_at` (`TIMESTAMPTZ`). Opsional `created_by`, `updated_by` (id user login). | Jejak perubahan & audit. |
| **Soft delete** | Data penting tidak dihapus fisik — pakai `deleted_at TIMESTAMPTZ NULL` atau `status='archived'`. | Data bisnis tidak boleh hilang permanen. |
| **Penampungan (staging)** | Import baru masuk schema `staging` dulu → dicek → baru promote ke tabel utama. | Cegah data kotor langsung masuk (Opsi 3 migrasi). |
| **Reports** | Laporan **dihitung** dari tabel transaksi (VIEW / materialized view), **tidak** disimpan sebagai tabel input terpisah. | Laporan selalu sinkron; tidak ada "data beda versi". |

**Konvensi prefiks ID (ringkas):**

| Entity | Format | Entity | Format |
|---|---|---|---|
| Customer | `PB-CUST-000001` | Karyawan (HRIS) | `EMP-0001` |
| Order | `ORD-000001` | Departemen | `DEP-001` |
| Produk | `PRD-001` | Jabatan | `POS-001` |
| Channel | `CH-001` | Gudang | `WH-01` |
| User/CS (data) | `USR-001` | Akun login | `ACC-0001` |
| Kurir | `EXP-001` | Peran (role) | `ROLE-001` |
| Mitra | `MIT-001` | Invoice | `INV-YYYYMM-001` |

---

## 1. Peta Domain → Menu

Setiap **menu di UI** dipetakan ke **schema database**. Satu database, banyak schema.

```
Home Launcher (menu)              Schema database (belakang layar)
──────────────────────────────   ─────────────────────────────────
Database (Data Utama)        →    master   (+ audit, staging)
Marketing                    →    marketing (+ orders, master)
Data Tracking                →    tracking  (+ orders)
Reports                      →    reports  (VIEW dari semua domain)
Finance                      →    finance
Warehouse / Gudang           →    warehouse
User Management              →    iam      (akun login, peran, hak akses)
HRIS (baru)                  →    hris     (karyawan, absensi, gaji, cuti)
Setting                      →    system   (pengaturan app, cadangan)
AI Assistant                 →    (baca-saja lintas domain, tidak simpan tabel bisnis)
```

**Status tiap schema saat ini:**

| Schema | Status | Isi |
|---|---|---|
| `master` | ✅ Live | customers, products, channels, couriers, users, mitra, sumber_lain, customer_cohorts |
| `orders` | ✅ Live | orders, order_items, customer_transactions |
| `tracking` | ✅ Live | shipments, cod_payments, returns |
| `finance` | 🟡 Sebagian | order_finance (perlu diperluas) |
| `audit` | ✅ Live | data_quality_checks |
| `marketing` | 🟡 Sebagian | ad_import_batches, ad_campaign_metrics (perlu leads/closing) |
| `system` | ✅ Live | backup_settings, backup_history (perlu settings app) |
| `warehouse` | 🔴 Belum | **perlu dibuat** — stok, mutasi, opname |
| `hris` | 🔴 Belum | **perlu dibuat** — karyawan, absensi, gaji, cuti |
| `iam` | 🔴 Belum | **perlu dibuat** — akun login, peran, hak akses, log aktivitas |
| `staging` | 🔴 Belum | **perlu dibuat** — penampungan import sebelum masuk utama |
| `reports` | 🔴 Belum | **perlu dibuat** — kumpulan VIEW laporan |

---

## 2. Relasi Antar Domain (peta hubungan)

```
                          ┌─────────────────────────────┐
                          │   master (data acuan)       │
                          │  customers · products ·     │
                          │  channels · couriers ·      │
                          │  users(CS) · mitra ·        │
                          │  customer_cohorts           │
                          └──────────────┬──────────────┘
                                         │ dirujuk oleh
        ┌───────────────┬────────────────┼────────────────┬─────────────────┐
        ▼               ▼                ▼                ▼                 ▼
 ┌────────────┐  ┌─────────────┐  ┌────────────┐  ┌────────────┐   ┌──────────────┐
 │  orders    │  │  tracking   │  │  finance   │  │ warehouse  │   │  marketing   │
 │ orders ·   │→ │ shipments · │  │ order_     │  │ stock ·    │   │ ad_metrics · │
 │ order_items│  │ cod · returns│ │ finance ·  │  │ movements ·│   │ leads ·      │
 │ cust_trx   │  └─────────────┘  │ expenses · │  │ opname     │   │ closing      │
 └─────┬──────┘        ▲          │ ap/ar      │  └─────┬──────┘   └──────────────┘
       │ order_id      │          └────────────┘        │ product_id
       └───────────────┘                                 ▼
                                                   (link ke master.products)

 ┌──────────────────────────────────────────────────────────────────────────┐
 │  iam (akun login + hak akses)  ── audit siapa mengubah apa ──►  semua      │
 │  hris (karyawan)  ── opsional link ──►  iam.accounts & master.users(CS)    │
 │  system (pengaturan app, cadangan)  ·  staging (penampungan import)        │
 │  reports (VIEW) ── membaca ──►  orders · tracking · finance · warehouse    │
 └──────────────────────────────────────────────────────────────────────────┘
```

**Tiga jenis "user" yang WAJIB dibedakan** (sumber kebingungan paling umum):

| Konsep | Schema.Tabel | Isinya | Contoh |
|---|---|---|---|
| **User data / CS** | `master.users` | Nama CS/ADV yang **muncul di data penjualan** lama. Bukan akun login. | "Rina", "Fajar" dari file laporan |
| **Akun login** | `iam.accounts` | Akun untuk **masuk ke aplikasi** ERP + password + peran. | login `rina@probetes` |
| **Karyawan (HRIS)** | `hris.employees` | Data **kepegawaian** (kontrak, gaji, absensi). | EMP-0007, NIK, tgl masuk |

Ketiganya bisa merujuk **orang yang sama**, disambung lewat FK opsional (`hris.employees.account_id`, `hris.employees.cs_user_id`). Tapi tabelnya dipisah karena tujuannya beda.

---

## 3. DOMAIN: `master` — Data Acuan (✅ live, + usulan penambahan)

Sudah ada (lihat `data_migrasi/db/schema.sql`): `customers`, `products`, `channels`,
`couriers`, `users`, `mitra`, `sumber_lain`, `customer_cohorts`.

**Usulan penambahan agar lengkap:**

```sql
-- Kategori/wilayah acuan agar konsisten (opsional tapi disarankan)
CREATE TABLE master.regions (
    region_id     TEXT PRIMARY KEY,   -- REG-xxxx
    province      TEXT,
    city          TEXT,
    district      TEXT,               -- kecamatan (untuk ongkir/wilayah)
    postal_code   TEXT
);

-- SKU gudang (kode lokal PRB-xx) -> produk final. Menutup gap products.sku 0%.
CREATE TABLE master.product_sku_map (
    sku_map_id    TEXT PRIMARY KEY,   -- SKUMAP-xxxx
    product_id    TEXT REFERENCES master.products(product_id),
    warehouse_id  TEXT,               -- SKU bisa beda per gudang (PRB-14 vs PRB-01)
    local_sku     TEXT,               -- kode gudang
    status        TEXT DEFAULT 'review'
);
```

Kolom audit yang disarankan ditambahkan ke tabel master lama secara bertahap:
`created_at`, `updated_at`, `updated_by`.

---

## 4. DOMAIN: `orders` — Transaksi Inti (✅ live)

Sudah ada: `orders`, `order_items`, `customer_transactions`.
**Pekerjaan yang belum selesai (dari audit):** `customer_transactions.order_id` masih 0% —
cohort belum tersambung ke order. Perlu proses matching (HP + tanggal + nilai) agar
Reports repeat-order akurat. Tidak butuh tabel baru, hanya pengisian kolom.

---

## 5. DOMAIN: `tracking` — Pengiriman Harian (✅ live)

Sudah ada: `shipments`, `cod_payments`, `returns`. Struktur sudah memadai.
Pengembangan berikutnya = **UI** (data sudah ada di DB), bukan tabel baru.
Opsional untuk masa depan (integrasi API resi otomatis):

```sql
CREATE TABLE tracking.tracking_events (   -- histori scan resi (kalau nanti tarik API)
    event_id        BIGSERIAL PRIMARY KEY,
    shipment_id     TEXT REFERENCES tracking.shipments(shipment_id),
    event_time      TIMESTAMPTZ,
    status          TEXT,
    location        TEXT,
    raw             JSONB
);
```

---

## 6. DOMAIN: `warehouse` — Gudang / Stok (🔴 BARU)

Data gudang sudah ada di `data_migrasi/output/GABUNGAN/gudang_stok_gabungan.csv`
tapi **belum masuk DB**. Temuan penting: **SKU beda per gudang** untuk produk yang sama.

```sql
CREATE SCHEMA IF NOT EXISTS warehouse;

CREATE TABLE warehouse.warehouses (
    warehouse_id   TEXT PRIMARY KEY,          -- WH-01
    name           TEXT,                       -- Gudang Jakarta / Makassar
    city           TEXT,
    address        TEXT,
    is_active       BOOLEAN DEFAULT true
);

-- 1 baris = 1 produk per gudang (stok kini)
CREATE TABLE warehouse.stock (
    stock_id       TEXT PRIMARY KEY,          -- STK-xxxxx
    warehouse_id   TEXT REFERENCES warehouse.warehouses(warehouse_id),
    product_id     TEXT REFERENCES master.products(product_id),  -- NULL jika belum di-map
    local_sku      TEXT,                       -- kode lokal gudang (PRB-xx)
    item_name      TEXT,                       -- termasuk non-jualan (brosur, amplop)
    is_sellable     BOOLEAN DEFAULT true,
    qty_on_hand    BIGINT DEFAULT 0,
    qty_reserved   BIGINT DEFAULT 0,          -- sudah dialokasikan ke order
    reorder_point  BIGINT,                     -- batas minimum untuk restock
    status         TEXT DEFAULT 'review',
    updated_at     TIMESTAMPTZ DEFAULT now()
);

-- Setiap pergerakan stok (masuk/keluar/penyesuaian) — sumber kebenaran mutasi
CREATE TABLE warehouse.stock_movements (
    movement_id    TEXT PRIMARY KEY,          -- MOV-xxxxxx
    warehouse_id   TEXT REFERENCES warehouse.warehouses(warehouse_id),
    product_id     TEXT REFERENCES master.products(product_id),
    local_sku      TEXT,
    movement_type  TEXT,                       -- masuk | keluar | retur | opname | transfer
    ref_type       TEXT,                       -- order | pembelian | opname | manual
    ref_id         TEXT,                       -- mis. ORD-000982
    qty_change     BIGINT,                     -- + masuk, - keluar
    moved_at       TIMESTAMPTZ DEFAULT now(),
    note           TEXT,
    created_by     TEXT
);

-- Stock opname (perhitungan fisik berkala)
CREATE TABLE warehouse.stock_opname (
    opname_id      TEXT PRIMARY KEY,          -- OPN-xxxx
    warehouse_id   TEXT REFERENCES warehouse.warehouses(warehouse_id),
    opname_date    DATE,
    status         TEXT DEFAULT 'draft',      -- draft | selesai
    note           TEXT,
    created_by     TEXT,
    created_at     TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE warehouse.stock_opname_items (
    opname_item_id BIGSERIAL PRIMARY KEY,
    opname_id      TEXT REFERENCES warehouse.stock_opname(opname_id),
    stock_id       TEXT REFERENCES warehouse.stock(stock_id),
    qty_system     BIGINT,                     -- catatan sistem
    qty_physical   BIGINT,                     -- hasil hitung fisik
    diff           BIGINT                      -- selisih
);
```

---

## 7. DOMAIN: `finance` — Keuangan (🟡 perluas)

Sudah ada `finance.order_finance` (HPP, ongkir, fee COD, rekonsiliasi per order).
**Usulan agar jadi modul finance utuh** (dibuat bertahap, kolom disiapkan dulu):

```sql
-- Akun kas/bank
CREATE TABLE finance.accounts (
    account_id     TEXT PRIMARY KEY,          -- FACC-xxx
    name           TEXT,                       -- Kas, Bank BCA, dll
    type           TEXT,                       -- kas | bank | ewallet
    opening_balance BIGINT DEFAULT 0,
    is_active       BOOLEAN DEFAULT true
);

-- Pengeluaran operasional (biaya iklan, gaji, sewa, dll)
CREATE TABLE finance.expenses (
    expense_id     TEXT PRIMARY KEY,          -- EXP-xxxxxx
    expense_date   DATE,
    category       TEXT,                       -- iklan | gaji | operasional | logistik
    description    TEXT,
    amount         BIGINT,
    account_id     TEXT REFERENCES finance.accounts(account_id),
    ref_type       TEXT,                       -- payroll | ads | manual
    ref_id         TEXT,
    status         TEXT DEFAULT 'valid',
    created_by     TEXT,
    created_at     TIMESTAMPTZ DEFAULT now()
);

-- Uang masuk (settlement marketplace, COD cair, transfer)
CREATE TABLE finance.incomes (
    income_id      TEXT PRIMARY KEY,          -- INC-xxxxxx
    income_date    DATE,
    source         TEXT,                       -- cod | marketplace | transfer
    description    TEXT,
    amount         BIGINT,
    account_id     TEXT REFERENCES finance.accounts(account_id),
    ref_type       TEXT,
    ref_id         TEXT,
    status         TEXT DEFAULT 'valid'
);

-- Rekonsiliasi payout marketplace/ekspedisi (COD cair vs order)
CREATE TABLE finance.settlements (
    settlement_id  TEXT PRIMARY KEY,          -- STL-xxxx
    channel_id     TEXT REFERENCES master.channels(channel_id),
    courier_id     TEXT REFERENCES master.couriers(courier_id),
    period_from    DATE,
    period_to      DATE,
    gross_amount   BIGINT,
    fee_amount     BIGINT,
    net_amount     BIGINT,
    status         TEXT DEFAULT 'review',      -- review | cocok | selisih
    note           TEXT
);
```

> Reports keuangan (laba/rugi, margin, arus kas) = **VIEW** yang menghitung dari
> `order_finance` + `expenses` + `incomes`, bukan tabel input baru.

---

## 8. DOMAIN: `marketing` — (🟡 perluas)

Sudah ada: `ad_import_batches`, `ad_campaign_metrics` (import iklan Meta/dsb — kini kosong,
menunggu import). **Usulan untuk performa marketing & CRM closing:**

```sql
-- Leads/prospek dari CS/CRM (belum tentu jadi order)
CREATE TABLE marketing.leads (
    lead_id        TEXT PRIMARY KEY,          -- LEAD-xxxxxx
    lead_date      DATE,
    name           TEXT,
    phone          TEXT,
    phone_normalized TEXT,
    channel_id     TEXT REFERENCES master.channels(channel_id),
    cs_id          TEXT REFERENCES master.users(user_id),
    product_interest TEXT,
    status         TEXT,                       -- baru | follow_up | closing | gagal
    customer_id    TEXT REFERENCES master.customers(customer_id),  -- terisi jika jadi customer
    order_id       TEXT REFERENCES orders.orders(order_id),        -- terisi jika closing
    note           TEXT,
    created_at     TIMESTAMPTZ DEFAULT now()
);

-- Import batch generik (bukan hanya iklan) untuk file marketplace/CRM
CREATE TABLE marketing.import_batches (
    batch_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source         TEXT,                       -- tiktok | shopee | meta | crm | cs | scalev
    file_name      TEXT,
    period_label   TEXT,
    total_rows     INTEGER DEFAULT 0,
    success_rows   INTEGER DEFAULT 0,
    review_rows    INTEGER DEFAULT 0,
    status         TEXT DEFAULT 'pending',     -- pending | success | failed
    imported_by    TEXT,
    imported_at    TIMESTAMPTZ DEFAULT now()
);
```

---

## 9. DOMAIN: `hris` — Kepegawaian (🔴 BARU)

Menu HRIS masa depan. Karyawan dipisah dari `master.users` (data CS) dan `iam.accounts`
(login). Bisa disambung lewat FK opsional.

```sql
CREATE SCHEMA IF NOT EXISTS hris;

CREATE TABLE hris.departments (
    department_id  TEXT PRIMARY KEY,          -- DEP-001
    name           TEXT,                       -- CS, Marketing, Gudang, Finance
    parent_id      TEXT REFERENCES hris.departments(department_id),  -- struktur bertingkat
    is_active       BOOLEAN DEFAULT true
);

CREATE TABLE hris.positions (
    position_id    TEXT PRIMARY KEY,          -- POS-001
    title          TEXT,                       -- Staff CS, Admin Gudang, Manajer
    department_id  TEXT REFERENCES hris.departments(department_id),
    level          TEXT                        -- staff | supervisor | manajer | owner
);

CREATE TABLE hris.employees (
    employee_id    TEXT PRIMARY KEY,          -- EMP-0001
    nik            TEXT,                       -- nomor induk karyawan / KTP (RAHASIA)
    full_name      TEXT,
    gender         TEXT,
    birth_date     DATE,
    phone          TEXT,
    email          TEXT,
    address        TEXT,
    department_id  TEXT REFERENCES hris.departments(department_id),
    position_id    TEXT REFERENCES hris.positions(position_id),
    employment_type TEXT,                      -- tetap | kontrak | harian | magang
    join_date      DATE,
    resign_date    DATE,
    status         TEXT DEFAULT 'aktif',       -- aktif | cuti | resign | nonaktif
    base_salary    BIGINT,                     -- gaji pokok (RAHASIA, hak akses ketat)
    account_id     TEXT,                       -- FK opsional -> iam.accounts
    cs_user_id     TEXT REFERENCES master.users(user_id),  -- FK opsional -> data CS
    created_at     TIMESTAMPTZ DEFAULT now(),
    updated_at     TIMESTAMPTZ DEFAULT now()
);

-- Absensi harian
CREATE TABLE hris.attendance (
    attendance_id  BIGSERIAL PRIMARY KEY,
    employee_id    TEXT REFERENCES hris.employees(employee_id),
    work_date      DATE,
    check_in       TIMESTAMPTZ,
    check_out      TIMESTAMPTZ,
    status         TEXT,                       -- hadir | terlambat | izin | sakit | alpha | libur
    work_hours     NUMERIC(5,2),
    note           TEXT,
    UNIQUE (employee_id, work_date)
);

-- Shift kerja (opsional untuk tim gudang/CS shift)
CREATE TABLE hris.shifts (
    shift_id       TEXT PRIMARY KEY,          -- SHF-01
    name           TEXT,                       -- Pagi, Siang, Malam
    start_time     TIME,
    end_time       TIME
);

-- Cuti / izin
CREATE TABLE hris.leave_requests (
    leave_id       TEXT PRIMARY KEY,          -- LV-xxxxx
    employee_id    TEXT REFERENCES hris.employees(employee_id),
    leave_type     TEXT,                       -- tahunan | sakit | melahirkan | tanpa_gaji
    date_from      DATE,
    date_to        DATE,
    total_days     INTEGER,
    reason         TEXT,
    status         TEXT DEFAULT 'diajukan',    -- diajukan | disetujui | ditolak
    approved_by    TEXT,
    created_at     TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE hris.leave_balances (
    employee_id    TEXT REFERENCES hris.employees(employee_id),
    year           INTEGER,
    quota_days     INTEGER,
    used_days      INTEGER DEFAULT 0,
    PRIMARY KEY (employee_id, year)
);

-- Penggajian: periode -> slip -> komponen
CREATE TABLE hris.payroll_periods (
    period_id      TEXT PRIMARY KEY,          -- PAY-202607
    month          INTEGER,
    year           INTEGER,
    status         TEXT DEFAULT 'draft',      -- draft | final | dibayar
    paid_at        TIMESTAMPTZ
);

CREATE TABLE hris.payslips (
    payslip_id     TEXT PRIMARY KEY,          -- SLIP-xxxxxx
    period_id      TEXT REFERENCES hris.payroll_periods(period_id),
    employee_id    TEXT REFERENCES hris.employees(employee_id),
    base_salary    BIGINT,
    total_allowance BIGINT DEFAULT 0,          -- tunjangan
    total_deduction BIGINT DEFAULT 0,          -- potongan
    total_bonus    BIGINT DEFAULT 0,           -- termasuk komisi CS/closing
    net_pay        BIGINT,                     -- gaji bersih
    status         TEXT DEFAULT 'draft'
);

CREATE TABLE hris.payslip_components (
    component_id   BIGSERIAL PRIMARY KEY,
    payslip_id     TEXT REFERENCES hris.payslips(payslip_id),
    kind           TEXT,                       -- tunjangan | potongan | bonus | komisi
    name           TEXT,                       -- transport, BPJS, komisi closing
    amount         BIGINT
);

-- Dokumen karyawan (kontrak, KTP) — simpan path/URL, bukan file di DB
CREATE TABLE hris.employee_documents (
    doc_id         BIGSERIAL PRIMARY KEY,
    employee_id    TEXT REFERENCES hris.employees(employee_id),
    doc_type       TEXT,                       -- kontrak | ktp | ijazah | npwp
    file_path      TEXT,
    uploaded_at    TIMESTAMPTZ DEFAULT now()
);
```

> **Catatan privasi HRIS:** `nik`, `base_salary`, dokumen = data sensitif. Akses dibatasi
> lewat `iam` (peran HR/Owner saja). Ini alasan HRIS jadi schema terpisah dengan hak akses ketat.
> Komisi CS/closing bisa dihitung otomatis dari `orders`/`marketing.leads` lalu masuk `payslip_components`.

---

## 10. DOMAIN: `iam` — User Management & Hak Akses (🔴 BARU)

Menu User Management. Mengatur **siapa boleh masuk & melihat apa**. Berlaku lintas semua modul.

```sql
CREATE SCHEMA IF NOT EXISTS iam;

CREATE TABLE iam.accounts (
    account_id     TEXT PRIMARY KEY,          -- ACC-0001
    username       TEXT UNIQUE,
    email          TEXT UNIQUE,
    password_hash  TEXT,                       -- hash (bcrypt/argon2), JANGAN plain
    full_name      TEXT,
    is_active       BOOLEAN DEFAULT true,
    last_login_at  TIMESTAMPTZ,
    created_at     TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE iam.roles (
    role_id        TEXT PRIMARY KEY,          -- ROLE-001
    name           TEXT,                       -- Owner, Admin, CS, Marketing, Gudang, Finance, HR
    description    TEXT
);

-- Hak akses per modul/aksi (granular)
CREATE TABLE iam.permissions (
    permission_id  TEXT PRIMARY KEY,          -- PERM-xxx
    module         TEXT,                       -- database | marketing | finance | hris | ...
    action         TEXT,                       -- lihat | tambah | ubah | hapus | export
    description    TEXT
);

CREATE TABLE iam.role_permissions (
    role_id        TEXT REFERENCES iam.roles(role_id),
    permission_id  TEXT REFERENCES iam.permissions(permission_id),
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE iam.account_roles (
    account_id     TEXT REFERENCES iam.accounts(account_id),
    role_id        TEXT REFERENCES iam.roles(role_id),
    PRIMARY KEY (account_id, role_id)
);

-- Sesi login (opsional jika pakai session server-side)
CREATE TABLE iam.sessions (
    session_id     TEXT PRIMARY KEY,
    account_id     TEXT REFERENCES iam.accounts(account_id),
    created_at     TIMESTAMPTZ DEFAULT now(),
    expires_at     TIMESTAMPTZ,
    ip_address     TEXT
);

-- Jejak audit: siapa mengubah data apa (berlaku semua modul)
CREATE TABLE iam.activity_log (
    log_id         BIGSERIAL PRIMARY KEY,
    account_id     TEXT REFERENCES iam.accounts(account_id),
    module         TEXT,
    action         TEXT,                       -- create | update | delete | login | export
    entity         TEXT,                       -- mis. master.customers
    entity_id      TEXT,
    before_data    JSONB,
    after_data     JSONB,
    created_at     TIMESTAMPTZ DEFAULT now(),
    ip_address     TEXT
);
```

---

## 11. DOMAIN: `staging` — Penampungan Import (🔴 BARU)

Wujud nyata dari **Opsi 3 (penampungan sementara)** & alur import Marketing. Data baru masuk
sini dulu, dicek, baru **promote** ke tabel utama. Cegah data kotor langsung masuk.

```sql
CREATE SCHEMA IF NOT EXISTS staging;

-- Baris mentah apa adanya dari file, per batch import
CREATE TABLE staging.import_rows (
    row_id         BIGSERIAL PRIMARY KEY,
    batch_id       UUID,                       -- merujuk marketing.import_batches
    source         TEXT,                       -- tiktok | shopee | crm | cohort | gudang
    raw            JSONB,                      -- isi baris asli
    parsed         JSONB,                      -- hasil normalisasi (HP, tanggal, dll)
    validation_status TEXT DEFAULT 'review',   -- valid | review | duplikat | ditolak
    validation_note TEXT,
    target_entity  TEXT,                       -- customers | orders | shipments ...
    promoted_id    TEXT,                       -- ID hasil di tabel utama (jika sudah promote)
    promoted_at    TIMESTAMPTZ,
    created_at     TIMESTAMPTZ DEFAULT now()
);
```

Alur: `file → staging.import_rows (review) → cek/perbaiki → promote ke master/orders/…`
→ yang ragu tetap `review` (masuk menu "Perlu Dicek"). Ini juga jadi fondasi
**migrasi batch per-2-bulan** (audit menemukan sekarang masih drop+recreate sekali muat).

---

## 12. DOMAIN: `system` — Pengaturan Aplikasi (✅ sebagian)

Sudah ada: `backup_settings`, `backup_history` (Setting > Status Cadangan).
**Usulan tambahan:**

```sql
-- Pengaturan aplikasi umum (key-value)
CREATE TABLE system.app_settings (
    key            TEXT PRIMARY KEY,           -- nama_perusahaan, logo_path, format_id
    value          TEXT,
    updated_at     TIMESTAMPTZ DEFAULT now()
);

-- Penomoran otomatis (menjaga urutan ID PB-CUST, ORD, dst tetap unik)
CREATE TABLE system.id_sequences (
    entity         TEXT PRIMARY KEY,           -- customer | order | product ...
    prefix         TEXT,                       -- PB-CUST- , ORD-
    last_number    BIGINT DEFAULT 0,
    padding        INTEGER DEFAULT 6
);
```

---

## 13. DOMAIN: `reports` — Laporan (🔴 BARU, hanya VIEW)

Reports **tidak menyimpan data sendiri** — semua VIEW/materialized view yang menghitung dari
domain lain. Contoh VIEW yang perlu dibuat:

| VIEW | Sumber | Untuk |
|---|---|---|
| `reports.sales_monthly` | orders + order_items | total sales per bulan/channel/produk |
| `reports.channel_performance` | orders + marketing | performa channel & ROAS |
| `reports.cs_performance` | orders + marketing.leads | closing & komisi per CS |
| `reports.customer_cohort` | customer_cohorts + orders | repeat, retensi, LTV |
| `reports.cod_settlement` | tracking.cod_payments + finance.settlements | COD cair vs belum |
| `reports.stock_status` | warehouse.stock + movements | stok menipis, perlu restock |
| `reports.finance_pnl` | order_finance + expenses + incomes | laba/rugi, margin |
| `reports.hr_summary` | hris.attendance + payslips | kehadiran & biaya gaji |

Materialized view dipakai untuk laporan berat (di-refresh berkala); VIEW biasa untuk yang ringan.

---

## 14. Ringkasan: Sudah Ada vs Perlu Dibuat

| # | Schema / area | Status | Prioritas |
|---|---|---|---|
| 1 | `master`, `orders`, `tracking` (data inti) | ✅ Live & penuh | — |
| 2 | Sambung cohort ↔ order (`customer_transactions.order_id`) | 🟡 Kolom kosong | **Tinggi** |
| 3 | `warehouse` + SKU produk (`product_sku_map`) | 🔴 Belum | **Tinggi** |
| 4 | API tulis + merge customer (Master Data masih read-only) | 🔴 Belum | **Tinggi** |
| 5 | `staging` (penampungan import) + import batch generik | 🔴 Belum | Menengah |
| 6 | `iam` (login, peran, hak akses, activity_log) | 🔴 Belum | Menengah |
| 7 | `finance` diperluas (expenses, incomes, settlements, accounts) | 🟡 Sebagian | Menengah |
| 8 | `marketing.leads` + closing/funnel | 🟡 Sebagian | Menengah |
| 9 | `reports` (VIEW lintas domain) | 🔴 Belum | Menengah |
| 10 | `hris` (karyawan, absensi, gaji, cuti) | 🔴 Belum | Bertahap (nanti) |
| 11 | `system.app_settings`, `id_sequences` | 🟡 Sebagian | Rendah |

**Urutan pengerjaan yang disarankan** (bertahap, tidak sekaligus):

```
Fase 1  Rapikan data inti      : sambung cohort↔order, load warehouse + isi SKU
Fase 2  Bikin data bisa ditulis : API tulis/edit/hapus + merge customer + activity_log
Fase 3  Alur import aman        : staging + import batch (fondasi migrasi 2-bulanan)
Fase 4  Hak akses               : iam (login + peran) — syarat sebelum multi-user
Fase 5  Laporan                 : reports VIEW (Finance PnL, channel, cohort)
Fase 6  Finance & Marketing     : perluas finance + marketing.leads
Fase 7  HRIS                    : modul kepegawaian penuh
```

---

## 15. Keputusan yang Perlu Konfirmasi Owner

Sebelum implementasi schema baru, beberapa hal butuh keputusan:

1. **HRIS gaji & komisi** — komisi CS/closing dihitung otomatis dari data order, atau input manual?
2. **Hak akses (`iam`)** — berapa peran awal? (usulan: Owner, Admin, CS, Marketing, Gudang, Finance, HR)
3. **Gudang** — apakah stok mau real-time berkurang otomatis tiap order, atau update berkala (opname)?
4. **Data sensitif** — NIK & gaji karyawan: siapa saja yang boleh lihat?
5. **SKU per gudang** — SKU final produk pakai kode Jakarta, Makassar, atau kode master baru?

> Dokumen ini blueprint. Tidak ada tabel yang dibuat sampai ada instruksi implementasi per fase.
