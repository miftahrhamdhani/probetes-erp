# -*- coding: utf-8 -*-
"""
Membuat laporan Word rapi dari Arsitektur Database Probetes ERP.
Output: docs/ARSITEKTUR_DATABASE_PROBETES.docx

Jalankan dari root project:
    python data_migrasi/scripts/generate_arsitektur_word.py
Butuh: pip install python-docx
"""
import os
import sys
from datetime import date

try:
    from docx import Document
    from docx.shared import Pt, RGBColor, Inches
    from docx.enum.text import WD_ALIGN_PARAGRAPH
    from docx.enum.table import WD_TABLE_ALIGNMENT
    from docx.oxml.ns import qn, nsdecls
    from docx.oxml import parse_xml, OxmlElement
except ImportError:
    sys.exit("python-docx belum terpasang. Jalankan: pip install python-docx")

# ---------------------------------------------------------------- warna Probetes
RED = RGBColor(0xC6, 0x28, 0x28)      # merah utama
DARK = RGBColor(0x22, 0x2B, 0x3A)     # navy gelap
GRAY = RGBColor(0x55, 0x5B, 0x66)     # abu teks
LINE = "C6282811"
FILL_HEAD = "C62828"                  # header tabel merah
FILL_SUB = "F3D9D9"                   # baris sub merah muda
FILL_CODE = "F4F5F7"                  # blok kode abu muda
GREEN = "C6EFCE"; YELLOW = "FFEB9C"; REDC = "FFC7CE"

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, "docs", "ARSITEKTUR_DATABASE_PROBETES.docx")

doc = Document()

# --------------------------------------------------------------- style dasar
normal = doc.styles["Normal"]
normal.font.name = "Calibri"
normal.font.size = Pt(10.5)
normal.font.color.rgb = DARK

for lvl, size, color in [(1, 16, RED), (2, 13, DARK), (3, 11, RED)]:
    st = doc.styles[f"Heading {lvl}"]
    st.font.name = "Calibri"
    st.font.size = Pt(size)
    st.font.color.rgb = color
    st.font.bold = True

# margin lebih lega
for s in doc.sections:
    s.top_margin = Inches(0.8); s.bottom_margin = Inches(0.8)
    s.left_margin = Inches(0.85); s.right_margin = Inches(0.85)


# --------------------------------------------------------------- helper
def shade(cell, fill):
    cell._tc.get_or_add_tcPr().append(
        parse_xml(r'<w:shd {} w:fill="{}"/>'.format(nsdecls("w"), fill)))


def set_widths(table, widths):
    table.autofit = False
    for row in table.rows:
        for i, w in enumerate(widths):
            row.cells[i].width = Inches(w)


def h(text, level=1, before=10, after=4):
    p = doc.add_heading(text, level=level)
    p.paragraph_format.space_before = Pt(before)
    p.paragraph_format.space_after = Pt(after)
    return p


def para(text="", bold=False, italic=False, color=None, size=None, space=4, align=None):
    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(space)
    if align:
        p.alignment = align
    if text:
        r = p.add_run(text)
        r.bold = bold; r.italic = italic
        if color:
            r.font.color.rgb = color
        if size:
            r.font.size = Pt(size)
    return p


def badge(text, color):
    """paragraf kecil sebagai label status."""
    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(2)
    r = p.add_run("  " + text + "  ")
    r.bold = True; r.font.size = Pt(9); r.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
    # tidak bisa shading run mudah -> pakai warna teks saja
    r.font.color.rgb = {"green": RGBColor(0x1E, 0x7A, 0x34),
                        "yellow": RGBColor(0x8A, 0x6D, 0x00),
                        "red": RGBColor(0xB0, 0x2A, 0x2A)}[color]
    return p


def table(headers, rows, widths=None, fills=None, header_fill=FILL_HEAD):
    t = doc.add_table(rows=1, cols=len(headers))
    t.style = "Table Grid"
    t.alignment = WD_TABLE_ALIGNMENT.CENTER
    hdr = t.rows[0].cells
    for i, htext in enumerate(headers):
        hdr[i].text = ""
        r = hdr[i].paragraphs[0].add_run(htext)
        r.bold = True; r.font.size = Pt(9.5); r.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
        shade(hdr[i], header_fill)
    for ridx, row in enumerate(rows):
        cells = t.add_row().cells
        for i, val in enumerate(row):
            cells[i].text = ""
            p = cells[i].paragraphs[0]
            p.paragraph_format.space_after = Pt(1)
            r = p.add_run(str(val))
            r.font.size = Pt(9.5)
        # pewarnaan status opsional per baris (kolom terakhir)
        if fills and fills[ridx]:
            shade(cells[-1], fills[ridx])
    if widths:
        set_widths(t, widths)
    doc.add_paragraph().paragraph_format.space_after = Pt(2)
    return t


def code(sql, caption=None):
    """blok SQL monospace dengan latar abu."""
    if caption:
        cp = doc.add_paragraph()
        cp.paragraph_format.space_after = Pt(1)
        r = cp.add_run(caption)
        r.italic = True; r.font.size = Pt(9); r.font.color.rgb = GRAY
    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(6)
    p.paragraph_format.left_indent = Inches(0.08)
    pPr = p._p.get_or_add_pPr()
    pPr.append(parse_xml(r'<w:shd {} w:fill="{}"/>'.format(nsdecls("w"), FILL_CODE)))
    # border tipis
    borders = OxmlElement("w:pBdr")
    for edge in ("top", "left", "bottom", "right"):
        e = OxmlElement(f"w:{edge}")
        e.set(qn("w:val"), "single"); e.set(qn("w:sz"), "4")
        e.set(qn("w:space"), "6"); e.set(qn("w:color"), "D6A9A9")
        borders.append(e)
    pPr.append(borders)
    r = p.add_run(sql.strip("\n"))
    r.font.name = "Consolas"
    r._element.rPr.rFonts.set(qn("w:eastAsia"), "Consolas")
    r.font.size = Pt(8.5)
    r.font.color.rgb = RGBColor(0x1E, 0x29, 0x3B)


def rule():
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(2); p.paragraph_format.space_after = Pt(6)
    pPr = p._p.get_or_add_pPr()
    b = OxmlElement("w:pBdr"); bottom = OxmlElement("w:bottom")
    bottom.set(qn("w:val"), "single"); bottom.set(qn("w:sz"), "6")
    bottom.set(qn("w:space"), "1"); bottom.set(qn("w:color"), "C62828")
    b.append(bottom); pPr.append(b)


# ============================================================ HALAMAN SAMPUL
para().paragraph_format.space_after = Pt(60)
t = para("PROBETES ERP", bold=True, color=RED, size=26, align=WD_ALIGN_PARAGRAPH.CENTER, space=2)
para("ARSITEKTUR DATABASE LENGKAP", bold=True, color=DARK, size=18,
     align=WD_ALIGN_PARAGRAPH.CENTER, space=6)
para("Blueprint database untuk seluruh menu aplikasi", italic=True, color=GRAY, size=12,
     align=WD_ALIGN_PARAGRAPH.CENTER, space=40)
para("Database · Marketing · Data Tracking · Reports · Finance", color=GRAY, size=11,
     align=WD_ALIGN_PARAGRAPH.CENTER, space=2)
para("Warehouse · User Management · HRIS · Setting", color=GRAY, size=11,
     align=WD_ALIGN_PARAGRAPH.CENTER, space=50)
para(f"Dokumen internal — {date.today().strftime('%d %B %Y')}", color=GRAY, size=10,
     align=WD_ALIGN_PARAGRAPH.CENTER, space=2)
para("Sifat: Cetak biru desain (belum dieksekusi ke database)", italic=True, color=GRAY,
     size=9.5, align=WD_ALIGN_PARAGRAPH.CENTER)
doc.add_page_break()

# ============================================================ RINGKASAN
h("Ringkasan Eksekutif", 1)
para("Dokumen ini adalah cetak biru (blueprint) database menyeluruh untuk Probetes ERP. "
     "Dirancang di atas struktur yang sudah aktif sekarang, lalu diperluas agar mencakup "
     "seluruh menu aplikasi termasuk modul yang belum dibuat (Gudang, Finance penuh, HRIS, "
     "dan pengaturan hak akses pengguna).")
para("Prinsip inti:", bold=True, space=2)
for b in [
    "Satu database PostgreSQL, dipisah rapi memakai schema per domain (master, orders, gudang, hris, dst).",
    "ID entitas mudah dibaca (contoh PB-CUST-000001), nilai uang disimpan sebagai bilangan bulat rupiah.",
    "Nama asli data lama tetap disimpan; data ragu diberi status 'review', tidak dihapus.",
    "Laporan dihitung otomatis dari data transaksi, bukan diinput ulang.",
    "Data baru masuk lewat penampungan (staging) dulu sebelum masuk data utama.",
]:
    p = doc.add_paragraph(style="List Bullet"); p.paragraph_format.space_after = Pt(2)
    p.add_run(b).font.size = Pt(10)
rule()
para("Catatan: seluruh definisi tabel (DDL) di dokumen ini adalah spesifikasi desain. "
     "Tidak ada tabel yang dibuat atau diubah sampai ada instruksi implementasi per fase.",
     italic=True, color=GRAY, size=9.5)
doc.add_page_break()

# ============================================================ 1. PRINSIP
h("1. Prinsip & Konvensi Global", 1)
para("Aturan ini berlaku untuk semua tabel di semua domain.")
table(
    ["Aturan", "Keputusan", "Alasan"],
    [
        ["Satu database", "Semua modul dalam 1 database probetes_erp, dipisah dengan schema per domain.",
         "Data terpusat, join mudah, tetap rapi per area."],
        ["ID entity", "TEXT dengan prefiks (PB-CUST-000001, ORD-000001, EMP-0001).",
         "ID stabil & terbaca; tidak bergantung nama/alamat yang bisa berubah."],
        ["Uang", "Selalu BIGINT (rupiah bulat). Metrik iklan/rasio boleh desimal.",
         "Presisi; hindari error pembulatan."],
        ["Nama asli", "Kolom original_names disimpan saat mapping produk/channel/kurir.",
         "Bisa diaudit; data lama tidak hilang."],
        ["Status data", "valid / review / active / inactive / duplicate / archived. Ragu = review.",
         "Data kotor tetap tercatat sampai dikonfirmasi."],
        ["Kolom waktu", "Tabel baru wajib created_at & updated_at; opsional created_by/updated_by.",
         "Jejak perubahan & audit."],
        ["Soft delete", "Data penting tidak dihapus fisik (deleted_at / status archived).",
         "Data bisnis tidak boleh hilang permanen."],
        ["Penampungan", "Import baru masuk schema staging dulu, dicek, baru masuk data utama.",
         "Cegah data kotor langsung masuk."],
        ["Reports", "Laporan berupa VIEW yang dihitung, bukan tabel input terpisah.",
         "Laporan selalu sinkron; tidak ada data beda versi."],
    ],
    widths=[1.3, 3.1, 2.6],
)

h("Konvensi Prefiks ID", 2)
table(
    ["Entity", "Format", "Entity", "Format"],
    [
        ["Customer", "PB-CUST-000001", "Karyawan (HRIS)", "EMP-0001"],
        ["Order", "ORD-000001", "Departemen", "DEP-001"],
        ["Produk", "PRD-001", "Jabatan", "POS-001"],
        ["Channel", "CH-001", "Gudang", "WH-01"],
        ["User/CS (data)", "USR-001", "Akun login", "ACC-0001"],
        ["Kurir", "EXP-001", "Peran (role)", "ROLE-001"],
        ["Mitra", "MIT-001", "Invoice", "INV-YYYYMM-001"],
    ],
    widths=[1.6, 1.9, 1.6, 1.9],
)
doc.add_page_break()

# ============================================================ 2. PETA DOMAIN
h("2. Peta Domain & Status", 1)
para("Setiap menu di aplikasi dipetakan ke satu schema database. Satu database, banyak schema.")

h("Menu → Schema", 2)
table(
    ["Menu di aplikasi", "Schema database", "Keterangan"],
    [
        ["Database (Data Utama)", "master (+ audit, staging)", "Data acuan pelanggan, produk, dll"],
        ["Marketing", "marketing (+ orders, master)", "Import channel, iklan, leads"],
        ["Data Tracking", "tracking (+ orders)", "Resi, COD, retur, pengiriman"],
        ["Reports", "reports (VIEW semua domain)", "Laporan final owner"],
        ["Finance", "finance", "Uang, HPP, rekonsiliasi, biaya"],
        ["Warehouse / Gudang", "warehouse", "Stok, mutasi, opname"],
        ["User Management", "iam", "Akun login, peran, hak akses"],
        ["HRIS (baru)", "hris", "Karyawan, absensi, gaji, cuti"],
        ["Setting", "system", "Pengaturan aplikasi, cadangan"],
    ],
    widths=[2.2, 2.4, 2.4],
)

h("Status Tiap Schema", 2)
table(
    ["Schema", "Status", "Isi utama"],
    [
        ["master", "Live", "customers, products, channels, couriers, users, mitra, cohorts"],
        ["orders", "Live", "orders, order_items, customer_transactions"],
        ["tracking", "Live", "shipments, cod_payments, returns"],
        ["audit", "Live", "data_quality_checks"],
        ["system", "Live", "backup_settings, backup_history"],
        ["finance", "Sebagian", "order_finance (perlu diperluas)"],
        ["marketing", "Sebagian", "ad_import_batches, ad_campaign_metrics (perlu leads)"],
        ["warehouse", "Belum", "PERLU DIBUAT — stok, mutasi, opname"],
        ["hris", "Belum", "PERLU DIBUAT — karyawan, absensi, gaji"],
        ["iam", "Belum", "PERLU DIBUAT — akun login, peran, hak akses"],
        ["staging", "Belum", "PERLU DIBUAT — penampungan import"],
        ["reports", "Belum", "PERLU DIBUAT — kumpulan VIEW laporan"],
    ],
    widths=[1.6, 1.4, 4.0],
    fills=[GREEN, GREEN, GREEN, GREEN, GREEN, YELLOW, YELLOW, REDC, REDC, REDC, REDC, REDC],
)
para("Keterangan warna: hijau = sudah live · kuning = sebagian · merah = belum dibuat.",
     italic=True, color=GRAY, size=9)

h("Tiga Jenis “User” yang Wajib Dibedakan", 2)
para("Ini sumber kebingungan paling umum. Tiga hal berbeda, tabel terpisah, boleh merujuk orang yang sama.")
table(
    ["Konsep", "Schema.Tabel", "Isinya", "Contoh"],
    [
        ["User data / CS", "master.users", "Nama CS/ADV yang muncul di data penjualan lama (bukan login).", "Rina, Fajar"],
        ["Akun login", "iam.accounts", "Akun untuk masuk aplikasi + password + peran.", "login rina@probetes"],
        ["Karyawan (HRIS)", "hris.employees", "Data kepegawaian (kontrak, gaji, absensi).", "EMP-0007, NIK"],
    ],
    widths=[1.4, 1.5, 2.9, 1.4],
)
para("Ketiganya disambung lewat FK opsional (hris.employees.account_id, hris.employees.cs_user_id), "
     "tetapi tabelnya dipisah karena tujuannya berbeda dan hak aksesnya berbeda.", size=9.5, color=GRAY)
doc.add_page_break()

# ============================================================ DOMAIN DETAIL
def domain(title, status_color, status_text, desc):
    h(title, 1)
    badge(status_text, status_color)
    if desc:
        para(desc)

# ---- master
domain("3. Domain master — Data Acuan", "green", "STATUS: LIVE (usulan penambahan)",
       "Sudah ada: customers, products, channels, couriers, users, mitra, sumber_lain, "
       "customer_cohorts. Usulan penambahan agar lengkap:")
code("""CREATE TABLE master.regions (
    region_id   TEXT PRIMARY KEY,   -- REG-xxxx
    province    TEXT,
    city        TEXT,
    district    TEXT,               -- kecamatan (untuk ongkir/wilayah)
    postal_code TEXT
);

-- SKU gudang (kode lokal PRB-xx) -> produk final. Menutup gap products.sku 0%.
CREATE TABLE master.product_sku_map (
    sku_map_id   TEXT PRIMARY KEY,  -- SKUMAP-xxxx
    product_id   TEXT REFERENCES master.products(product_id),
    warehouse_id TEXT,              -- SKU bisa beda per gudang (PRB-14 vs PRB-01)
    local_sku    TEXT,
    status       TEXT DEFAULT 'review'
);""")

# ---- orders
domain("4. Domain orders — Transaksi Inti", "green", "STATUS: LIVE",
       "Sudah ada: orders, order_items, customer_transactions. Pekerjaan tersisa: "
       "customer_transactions.order_id masih 0% (cohort belum tersambung ke order). "
       "Perlu proses pencocokan HP + tanggal + nilai, bukan tabel baru.")

# ---- tracking
domain("5. Domain tracking — Pengiriman Harian", "green", "STATUS: LIVE",
       "Sudah ada: shipments, cod_payments, returns. Struktur memadai; pengembangan berikutnya "
       "adalah UI (data sudah ada). Opsional untuk integrasi API resi otomatis:")
code("""CREATE TABLE tracking.tracking_events (   -- histori scan resi (jika tarik API)
    event_id    BIGSERIAL PRIMARY KEY,
    shipment_id TEXT REFERENCES tracking.shipments(shipment_id),
    event_time  TIMESTAMPTZ,
    status      TEXT,
    location    TEXT,
    raw         JSONB
);""")
doc.add_page_break()

# ---- warehouse
domain("6. Domain warehouse — Gudang / Stok", "red", "STATUS: BELUM DIBUAT",
       "Data gudang sudah ada di CSV hasil migrasi tapi belum masuk DB. Temuan penting: "
       "SKU berbeda per gudang untuk produk yang sama.")
code("""CREATE SCHEMA IF NOT EXISTS warehouse;

CREATE TABLE warehouse.warehouses (
    warehouse_id TEXT PRIMARY KEY,   -- WH-01
    name         TEXT,               -- Gudang Jakarta / Makassar
    city         TEXT,
    address      TEXT,
    is_active    BOOLEAN DEFAULT true
);

-- 1 baris = 1 produk per gudang (stok kini)
CREATE TABLE warehouse.stock (
    stock_id      TEXT PRIMARY KEY,   -- STK-xxxxx
    warehouse_id  TEXT REFERENCES warehouse.warehouses(warehouse_id),
    product_id    TEXT REFERENCES master.products(product_id),  -- NULL bila belum di-map
    local_sku     TEXT,               -- kode lokal gudang (PRB-xx)
    item_name     TEXT,               -- termasuk non-jualan (brosur, amplop)
    is_sellable   BOOLEAN DEFAULT true,
    qty_on_hand   BIGINT DEFAULT 0,
    qty_reserved  BIGINT DEFAULT 0,   -- sudah dialokasikan ke order
    reorder_point BIGINT,             -- batas minimum untuk restock
    status        TEXT DEFAULT 'review',
    updated_at    TIMESTAMPTZ DEFAULT now()
);

-- Setiap pergerakan stok (sumber kebenaran mutasi)
CREATE TABLE warehouse.stock_movements (
    movement_id   TEXT PRIMARY KEY,   -- MOV-xxxxxx
    warehouse_id  TEXT REFERENCES warehouse.warehouses(warehouse_id),
    product_id    TEXT REFERENCES master.products(product_id),
    local_sku     TEXT,
    movement_type TEXT,               -- masuk | keluar | retur | opname | transfer
    ref_type      TEXT,               -- order | pembelian | opname | manual
    ref_id        TEXT,               -- mis. ORD-000982
    qty_change    BIGINT,             -- + masuk, - keluar
    moved_at      TIMESTAMPTZ DEFAULT now(),
    note          TEXT,
    created_by    TEXT
);

-- Stock opname (perhitungan fisik berkala)
CREATE TABLE warehouse.stock_opname (
    opname_id    TEXT PRIMARY KEY,    -- OPN-xxxx
    warehouse_id TEXT REFERENCES warehouse.warehouses(warehouse_id),
    opname_date  DATE,
    status       TEXT DEFAULT 'draft',
    note         TEXT,
    created_by   TEXT,
    created_at   TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE warehouse.stock_opname_items (
    opname_item_id BIGSERIAL PRIMARY KEY,
    opname_id      TEXT REFERENCES warehouse.stock_opname(opname_id),
    stock_id       TEXT REFERENCES warehouse.stock(stock_id),
    qty_system     BIGINT,            -- catatan sistem
    qty_physical   BIGINT,            -- hasil hitung fisik
    diff           BIGINT             -- selisih
);""")
doc.add_page_break()

# ---- finance
domain("7. Domain finance — Keuangan", "yellow", "STATUS: SEBAGIAN (perluas)",
       "Sudah ada order_finance (HPP, ongkir, fee COD, rekonsiliasi per order). "
       "Usulan agar menjadi modul finance utuh (kolom disiapkan dulu):")
code("""CREATE TABLE finance.accounts (         -- akun kas/bank
    account_id      TEXT PRIMARY KEY,  -- FACC-xxx
    name            TEXT,              -- Kas, Bank BCA
    type            TEXT,              -- kas | bank | ewallet
    opening_balance BIGINT DEFAULT 0,
    is_active       BOOLEAN DEFAULT true
);

CREATE TABLE finance.expenses (         -- pengeluaran operasional
    expense_id   TEXT PRIMARY KEY,      -- EXP-xxxxxx
    expense_date DATE,
    category     TEXT,                  -- iklan | gaji | operasional | logistik
    description  TEXT,
    amount       BIGINT,
    account_id   TEXT REFERENCES finance.accounts(account_id),
    ref_type     TEXT, ref_id TEXT,
    status       TEXT DEFAULT 'valid',
    created_by   TEXT, created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE finance.incomes (          -- uang masuk (COD cair, settlement)
    income_id   TEXT PRIMARY KEY,       -- INC-xxxxxx
    income_date DATE, source TEXT,      -- cod | marketplace | transfer
    description TEXT, amount BIGINT,
    account_id  TEXT REFERENCES finance.accounts(account_id),
    ref_type    TEXT, ref_id TEXT, status TEXT DEFAULT 'valid'
);

CREATE TABLE finance.settlements (      -- rekonsiliasi payout marketplace/ekspedisi
    settlement_id TEXT PRIMARY KEY,     -- STL-xxxx
    channel_id  TEXT REFERENCES master.channels(channel_id),
    courier_id  TEXT REFERENCES master.couriers(courier_id),
    period_from DATE, period_to DATE,
    gross_amount BIGINT, fee_amount BIGINT, net_amount BIGINT,
    status TEXT DEFAULT 'review', note TEXT   -- review | cocok | selisih
);""")
para("Laporan keuangan (laba/rugi, margin, arus kas) adalah VIEW yang menghitung dari "
     "order_finance + expenses + incomes, bukan tabel input baru.", italic=True, color=GRAY, size=9.5)

# ---- marketing
domain("8. Domain marketing — Performa & Leads", "yellow", "STATUS: SEBAGIAN (perluas)",
       "Sudah ada ad_import_batches, ad_campaign_metrics (import iklan). Usulan untuk "
       "performa marketing & closing CRM:")
code("""CREATE TABLE marketing.leads (          -- prospek dari CS/CRM
    lead_id    TEXT PRIMARY KEY,        -- LEAD-xxxxxx
    lead_date  DATE, name TEXT, phone TEXT, phone_normalized TEXT,
    channel_id TEXT REFERENCES master.channels(channel_id),
    cs_id      TEXT REFERENCES master.users(user_id),
    product_interest TEXT,
    status     TEXT,                     -- baru | follow_up | closing | gagal
    customer_id TEXT REFERENCES master.customers(customer_id),
    order_id    TEXT REFERENCES orders.orders(order_id),
    note TEXT, created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE marketing.import_batches (  -- import file marketplace/CRM generik
    batch_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source       TEXT,                    -- tiktok | shopee | meta | crm | scalev
    file_name    TEXT, period_label TEXT,
    total_rows   INTEGER DEFAULT 0, success_rows INTEGER DEFAULT 0,
    review_rows  INTEGER DEFAULT 0, status TEXT DEFAULT 'pending',
    imported_by  TEXT, imported_at TIMESTAMPTZ DEFAULT now()
);""")
doc.add_page_break()

# ---- hris
domain("9. Domain hris — Kepegawaian", "red", "STATUS: BELUM DIBUAT",
       "Menu HRIS masa depan. Karyawan dipisah dari master.users (data CS) dan iam.accounts "
       "(login), disambung lewat FK opsional.")
code("""CREATE SCHEMA IF NOT EXISTS hris;

CREATE TABLE hris.departments (
    department_id TEXT PRIMARY KEY,   -- DEP-001
    name TEXT, parent_id TEXT REFERENCES hris.departments(department_id),
    is_active BOOLEAN DEFAULT true
);

CREATE TABLE hris.positions (
    position_id TEXT PRIMARY KEY,     -- POS-001
    title TEXT, department_id TEXT REFERENCES hris.departments(department_id),
    level TEXT                        -- staff | supervisor | manajer | owner
);

CREATE TABLE hris.employees (
    employee_id TEXT PRIMARY KEY,     -- EMP-0001
    nik TEXT,                         -- nomor induk / KTP (RAHASIA)
    full_name TEXT, gender TEXT, birth_date DATE,
    phone TEXT, email TEXT, address TEXT,
    department_id TEXT REFERENCES hris.departments(department_id),
    position_id   TEXT REFERENCES hris.positions(position_id),
    employment_type TEXT,             -- tetap | kontrak | harian | magang
    join_date DATE, resign_date DATE,
    status TEXT DEFAULT 'aktif',      -- aktif | cuti | resign | nonaktif
    base_salary BIGINT,               -- gaji pokok (RAHASIA)
    account_id  TEXT,                 -- FK opsional -> iam.accounts
    cs_user_id  TEXT REFERENCES master.users(user_id),  -- FK opsional -> data CS
    created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE hris.attendance (         -- absensi harian
    attendance_id BIGSERIAL PRIMARY KEY,
    employee_id TEXT REFERENCES hris.employees(employee_id),
    work_date DATE, check_in TIMESTAMPTZ, check_out TIMESTAMPTZ,
    status TEXT,                       -- hadir | terlambat | izin | sakit | alpha | libur
    work_hours NUMERIC(5,2), note TEXT,
    UNIQUE (employee_id, work_date)
);

CREATE TABLE hris.leave_requests (     -- cuti / izin
    leave_id TEXT PRIMARY KEY,         -- LV-xxxxx
    employee_id TEXT REFERENCES hris.employees(employee_id),
    leave_type TEXT,                   -- tahunan | sakit | melahirkan | tanpa_gaji
    date_from DATE, date_to DATE, total_days INTEGER, reason TEXT,
    status TEXT DEFAULT 'diajukan',    -- diajukan | disetujui | ditolak
    approved_by TEXT, created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE hris.payroll_periods (    -- penggajian: periode
    period_id TEXT PRIMARY KEY,        -- PAY-202607
    month INTEGER, year INTEGER,
    status TEXT DEFAULT 'draft',       -- draft | final | dibayar
    paid_at TIMESTAMPTZ
);

CREATE TABLE hris.payslips (           -- slip gaji per karyawan
    payslip_id TEXT PRIMARY KEY,       -- SLIP-xxxxxx
    period_id TEXT REFERENCES hris.payroll_periods(period_id),
    employee_id TEXT REFERENCES hris.employees(employee_id),
    base_salary BIGINT, total_allowance BIGINT DEFAULT 0,
    total_deduction BIGINT DEFAULT 0, total_bonus BIGINT DEFAULT 0,
    net_pay BIGINT, status TEXT DEFAULT 'draft'
);

CREATE TABLE hris.payslip_components ( -- rincian tunjangan/potongan/komisi
    component_id BIGSERIAL PRIMARY KEY,
    payslip_id TEXT REFERENCES hris.payslips(payslip_id),
    kind TEXT,                         -- tunjangan | potongan | bonus | komisi
    name TEXT, amount BIGINT
);""")
para("Catatan privasi HRIS: NIK, gaji, dokumen adalah data sensitif. Akses dibatasi lewat iam "
     "(peran HR/Owner). Komisi CS/closing bisa dihitung otomatis dari orders/leads.",
     italic=True, color=GRAY, size=9.5)
doc.add_page_break()

# ---- iam
domain("10. Domain iam — User Management & Hak Akses", "red", "STATUS: BELUM DIBUAT",
       "Menu User Management. Mengatur siapa boleh masuk & melihat apa. Berlaku lintas semua modul.")
code("""CREATE SCHEMA IF NOT EXISTS iam;

CREATE TABLE iam.accounts (
    account_id TEXT PRIMARY KEY,       -- ACC-0001
    username TEXT UNIQUE, email TEXT UNIQUE,
    password_hash TEXT,                -- hash (bcrypt/argon2), JANGAN plain
    full_name TEXT, is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMPTZ, created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE iam.roles (               -- Owner, Admin, CS, Marketing, Gudang, Finance, HR
    role_id TEXT PRIMARY KEY, name TEXT, description TEXT
);

CREATE TABLE iam.permissions (         -- hak akses granular per modul/aksi
    permission_id TEXT PRIMARY KEY,
    module TEXT,                       -- database | marketing | finance | hris ...
    action TEXT,                       -- lihat | tambah | ubah | hapus | export
    description TEXT
);

CREATE TABLE iam.role_permissions (
    role_id TEXT REFERENCES iam.roles(role_id),
    permission_id TEXT REFERENCES iam.permissions(permission_id),
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE iam.account_roles (
    account_id TEXT REFERENCES iam.accounts(account_id),
    role_id TEXT REFERENCES iam.roles(role_id),
    PRIMARY KEY (account_id, role_id)
);

CREATE TABLE iam.activity_log (        -- jejak audit lintas modul
    log_id BIGSERIAL PRIMARY KEY,
    account_id TEXT REFERENCES iam.accounts(account_id),
    module TEXT, action TEXT,          -- create | update | delete | login | export
    entity TEXT, entity_id TEXT,
    before_data JSONB, after_data JSONB,
    created_at TIMESTAMPTZ DEFAULT now(), ip_address TEXT
);""")

# ---- staging
domain("11. Domain staging — Penampungan Import", "red", "STATUS: BELUM DIBUAT",
       "Wujud nyata penampungan sementara. Data baru masuk sini dulu, dicek, baru dipromosikan "
       "ke tabel utama. Juga fondasi migrasi batch per-2-bulan.")
code("""CREATE SCHEMA IF NOT EXISTS staging;

CREATE TABLE staging.import_rows (
    row_id     BIGSERIAL PRIMARY KEY,
    batch_id   UUID,                   -- merujuk marketing.import_batches
    source     TEXT,                   -- tiktok | shopee | crm | cohort | gudang
    raw        JSONB,                  -- isi baris asli
    parsed     JSONB,                  -- hasil normalisasi (HP, tanggal)
    validation_status TEXT DEFAULT 'review',  -- valid | review | duplikat | ditolak
    validation_note   TEXT,
    target_entity TEXT,                -- customers | orders | shipments ...
    promoted_id   TEXT,                -- ID hasil di tabel utama
    promoted_at   TIMESTAMPTZ, created_at TIMESTAMPTZ DEFAULT now()
);""")
doc.add_page_break()

# ---- system & reports
domain("12. Domain system — Pengaturan Aplikasi", "green", "STATUS: SEBAGIAN",
       "Sudah ada backup_settings, backup_history (Setting > Status Cadangan). Usulan tambahan:")
code("""CREATE TABLE system.app_settings (      -- pengaturan umum (key-value)
    key TEXT PRIMARY KEY,              -- nama_perusahaan, logo_path, format_id
    value TEXT, updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE system.id_sequences (      -- penomoran otomatis ID
    entity TEXT PRIMARY KEY,           -- customer | order | product ...
    prefix TEXT, last_number BIGINT DEFAULT 0, padding INTEGER DEFAULT 6
);""")

domain("13. Domain reports — Laporan (hanya VIEW)", "red", "STATUS: BELUM DIBUAT",
       "Reports tidak menyimpan data sendiri. Semua berupa VIEW yang menghitung dari domain lain.")
table(
    ["VIEW", "Sumber", "Untuk"],
    [
        ["sales_monthly", "orders + order_items", "Total sales per bulan/channel/produk"],
        ["channel_performance", "orders + marketing", "Performa channel & ROAS"],
        ["cs_performance", "orders + marketing.leads", "Closing & komisi per CS"],
        ["customer_cohort", "customer_cohorts + orders", "Repeat, retensi, LTV"],
        ["cod_settlement", "cod_payments + settlements", "COD cair vs belum"],
        ["stock_status", "warehouse.stock + movements", "Stok menipis, perlu restock"],
        ["finance_pnl", "order_finance + expenses + incomes", "Laba/rugi, margin"],
        ["hr_summary", "attendance + payslips", "Kehadiran & biaya gaji"],
    ],
    widths=[1.8, 2.6, 2.6],
)
doc.add_page_break()

# ============================================================ RINGKASAN AKHIR
h("14. Ringkasan: Sudah Ada vs Perlu Dibuat", 1)
table(
    ["#", "Area", "Status", "Prioritas"],
    [
        ["1", "master, orders, tracking (data inti)", "Live & penuh", "-"],
        ["2", "Sambung cohort ke order (order_id kosong)", "Kolom kosong", "Tinggi"],
        ["3", "warehouse + SKU produk (product_sku_map)", "Belum", "Tinggi"],
        ["4", "API tulis + merge customer (kini read-only)", "Belum", "Tinggi"],
        ["5", "staging + import batch generik", "Belum", "Menengah"],
        ["6", "iam (login, peran, hak akses, log)", "Belum", "Menengah"],
        ["7", "finance diperluas (expenses, incomes, dll)", "Sebagian", "Menengah"],
        ["8", "marketing.leads + closing/funnel", "Sebagian", "Menengah"],
        ["9", "reports (VIEW lintas domain)", "Belum", "Menengah"],
        ["10", "hris (karyawan, absensi, gaji, cuti)", "Belum", "Bertahap"],
        ["11", "system.app_settings, id_sequences", "Sebagian", "Rendah"],
    ],
    widths=[0.4, 3.4, 1.4, 1.4],
    fills=[GREEN, YELLOW, REDC, REDC, REDC, REDC, YELLOW, YELLOW, REDC, REDC, YELLOW],
)

h("Urutan Pengerjaan yang Disarankan", 2)
for f in [
    ("Fase 1 — Rapikan data inti", "Sambung cohort ke order; load gudang + isi SKU produk."),
    ("Fase 2 — Bikin data bisa ditulis", "API tulis/edit/hapus + merge customer + activity log."),
    ("Fase 3 — Alur import aman", "Staging + import batch (fondasi migrasi 2-bulanan)."),
    ("Fase 4 — Hak akses", "iam (login + peran) — syarat sebelum multi-user."),
    ("Fase 5 — Laporan", "reports VIEW (Finance laba/rugi, channel, cohort)."),
    ("Fase 6 — Finance & Marketing", "Perluas finance + marketing.leads."),
    ("Fase 7 — HRIS", "Modul kepegawaian penuh."),
]:
    p = doc.add_paragraph(); p.paragraph_format.space_after = Pt(3)
    r = p.add_run(f[0] + "  "); r.bold = True; r.font.color.rgb = RED; r.font.size = Pt(10)
    r2 = p.add_run(f[1]); r2.font.size = Pt(10)

h("15. Keputusan yang Perlu Konfirmasi Owner", 1)
for i, q in enumerate([
    "HRIS gaji & komisi — komisi CS/closing dihitung otomatis dari data order, atau input manual?",
    "Hak akses (iam) — berapa peran awal? (usulan: Owner, Admin, CS, Marketing, Gudang, Finance, HR)",
    "Gudang — stok berkurang otomatis tiap order, atau update berkala lewat opname?",
    "Data sensitif — NIK & gaji karyawan: siapa saja yang boleh melihat?",
    "SKU per gudang — SKU final produk pakai kode Jakarta, Makassar, atau kode master baru?",
], 1):
    p = doc.add_paragraph(); p.paragraph_format.space_after = Pt(4)
    r = p.add_run(f"{i}. "); r.bold = True; r.font.color.rgb = RED
    p.add_run(q).font.size = Pt(10)

rule()
para("Dokumen ini adalah cetak biru. Tidak ada tabel yang dibuat sampai ada instruksi "
     "implementasi per fase.", italic=True, color=GRAY, size=9.5,
     align=WD_ALIGN_PARAGRAPH.CENTER)

doc.save(OUT)
print("Berhasil membuat:", OUT)
