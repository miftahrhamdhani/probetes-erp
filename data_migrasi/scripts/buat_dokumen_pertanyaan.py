# -*- coding: utf-8 -*-
"""
Buat dokumen Word 'Pertanyaan Keputusan Owner - Database Probetes ERP'.
Format tabel per pertanyaan: Pertanyaan | Masalah | Pilihan Jawaban (kotak centang) | Catatan.
Output: data_migrasi/output/PERTANYAAN_OWNER_DATABASE.docx
"""
import os
from docx import Document
from docx.shared import Pt, RGBColor, Cm
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

MERAH = RGBColor(0xE3, 0x06, 0x13)
GELAP = RGBColor(0x0F, 0x17, 0x2A)
ABU = RGBColor(0x66, 0x70, 0x85)
CB = "☐ "  # kotak centang kosong

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(BASE, "output", "PERTANYAAN_OWNER_DATABASE.docx")

doc = Document()
for section in doc.sections:
    section.left_margin = Cm(1.5)
    section.right_margin = Cm(1.5)

style = doc.styles["Normal"]
style.font.name = "Calibri"
style.font.size = Pt(10)


def shade(cell, hexcolor):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement("w:shd")
    shd.set(qn("w:val"), "clear")
    shd.set(qn("w:fill"), hexcolor)
    tcPr.append(shd)


def judul(text, size=16, color=MERAH):
    p = doc.add_paragraph()
    r = p.add_run(text)
    r.bold = True
    r.font.size = Pt(size)
    r.font.color.rgb = color
    return p


def sub(text):
    p = doc.add_paragraph()
    r = p.add_run(text)
    r.font.size = Pt(9.5)
    r.font.color.rgb = ABU
    return p


def tabel_pertanyaan(items):
    """items: list of dict(no, pertanyaan, masalah, pilihan[list], catatan_awal)"""
    t = doc.add_table(rows=1, cols=4)
    t.style = "Table Grid"
    t.alignment = WD_TABLE_ALIGNMENT.CENTER
    widths = [Cm(5.2), Cm(4.6), Cm(5.6), Cm(3.0)]
    hdr = t.rows[0].cells
    for i, judul_kolom in enumerate(["Pertanyaan", "Masalah / Temuan di Data", "Pilihan Jawaban", "Catatan"]):
        hdr[i].text = ""
        run = hdr[i].paragraphs[0].add_run(judul_kolom)
        run.bold = True
        run.font.size = Pt(9.5)
        run.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
        shade(hdr[i], "E30613")
        hdr[i].width = widths[i]

    for it in items:
        row = t.add_row().cells
        # kolom pertanyaan
        p = row[0].paragraphs[0]
        r = p.add_run(f"{it['no']}. {it['pertanyaan']}")
        r.bold = True
        r.font.size = Pt(9.5)
        # kolom masalah
        row[1].paragraphs[0].add_run(it["masalah"]).font.size = Pt(9)
        # kolom pilihan (kotak centang per baris)
        cell = row[2]
        cell.text = ""
        for j, pil in enumerate(it["pilihan"]):
            para = cell.paragraphs[0] if j == 0 else cell.add_paragraph()
            para.paragraph_format.space_after = Pt(2)
            rr = para.add_run(CB + pil)
            rr.font.size = Pt(9)
        # kolom catatan
        row[3].paragraphs[0].add_run(it.get("catatan", "")).font.size = Pt(9)
        for i, c in enumerate(row):
            c.width = widths[i]
    doc.add_paragraph()


# ============================ ISI DOKUMEN ============================
judul("PERTANYAAN KEPUTUSAN OWNER", 18)
judul("Database Probetes ERP", 13, GELAP)
sub("Cara mengisi: centang salah satu kotak pilihan (atau tulis jawaban di kolom Catatan). "
    "Semua contoh diambil dari data asli. Data lama tidak ada yang dihapus, jadi keputusan "
    "masih bisa dikoreksi di kemudian hari.")
doc.add_paragraph()

# ---------- BAGIAN 1 ----------
judul("Bagian 1 — Data yang Ditampilkan di Menu Database", 12, GELAP)
tabel_pertanyaan([
    dict(no=1, pertanyaan="Susunan menu Database sudah sesuai?",
         masalah="Menu sekarang: Ringkasan Data, Data Utama (Pelanggan, Cohort, Produk, Channel, CS/Tim, Ekspedisi), Kualitas Data, Status Cadangan.",
         pilihan=["a. Sudah sesuai", "b. Perlu ditambah (tulis di catatan)"]),
    dict(no=2, pertanyaan="Tabel Pelanggan perlu kolom tanggal beli?",
         masalah="Sekarang tabel Pelanggan belum menampilkan tanggal transaksi.",
         pilihan=["a. Tambah 'Terakhir Beli' saja", "b. Tambah 'Pertama Beli' dan 'Terakhir Beli'", "c. Tidak perlu"]),
    dict(no=3, pertanyaan="Aturan tampilan nomor HP sudah benar?",
         masalah="Di Pelanggan nomor disamarkan (0812****1234), di Cohort No. WA tampil penuh untuk kerja CS.",
         pilihan=["a. Ya, sudah benar", "b. Semua disamarkan", "c. Semua tampil penuh"]),
    dict(no=4, pertanyaan="Alamat lengkap perlu tampil di tabel pelanggan?",
         masalah="Alamat panjang membuat tabel penuh.",
         pilihan=["a. Kota saja di tabel, alamat lengkap di detail", "b. Alamat lengkap ikut tampil"]),
    dict(no=5, pertanyaan="Nilai uang boleh dilihat semua karyawan?",
         masalah="Total belanja pelanggan dan nilai order tampil di menu Database.",
         pilihan=["a. Semua boleh lihat", "b. Nanti dibatasi per jabatan"]),
    dict(no=6, pertanyaan="Angka resmi laporan pakai sumber mana?",
         masalah="Ada 2 sumber angka: Data Pesanan (42.390 order) dan Data Cohort (20.332 transaksi penjualan). Angkanya tidak sama.",
         pilihan=["a. Data Pesanan", "b. Data Cohort", "c. Keduanya tampil dengan label beda"]),
])

# ---------- BAGIAN 2 ----------
judul("Bagian 2 — Database Cohort", 12, GELAP)
tabel_pertanyaan([
    dict(no=7, pertanyaan="Cohort dihitung dari apa?",
         masalah="Kolom 'Cohort' di data lama banyak yang kosong.",
         pilihan=["a. Hitung otomatis dari bulan pertama customer beli", "b. Ikut kolom lama saja, yang kosong dibiarkan"]),
    dict(no=8, pertanyaan="Cluster pelanggan pakai yang mana?",
         masalah="Rencana awal 6 cluster (Baru, Repeat, Lama Tidak Beli, High Value, Perlu Follow-up, Konsultasi WA Grup). Yang jalan baru 3.",
         pilihan=["a. 6 cluster lengkap", "b. 3 dulu (Baru/Repeat/High Value), sisanya nanti"]),
    dict(no=9, pertanyaan="Batas High Value berapa?",
         masalah="Sekarang: total belanja >= Rp5.000.000.",
         pilihan=["a. Setuju Rp5 juta", "b. Ganti (tulis di catatan)"]),
    dict(no=10, pertanyaan="'Lama Tidak Beli' itu berapa lama?",
         masalah="Perlu batas waktu untuk menandai customer tidak aktif.",
         pilihan=["a. 3 bulan", "b. 6 bulan", "c. 12 bulan"]),
    dict(no=11, pertanyaan="Kriteria masuk Konsultasi WA Grup?",
         masalah="Belum ada aturan siapa yang diarahkan ke konsultasi WA grup.",
         pilihan=["a. Ditandai manual oleh CS", "b. Otomatis (tulis kriterianya di catatan)"]),
    dict(no=12, pertanyaan="Riwayat 2024 dipakai di cohort?",
         masalah="Data cohort mulai Juli 2024, data pesanan mulai Januari 2025.",
         pilihan=["a. Pakai semua riwayat sejak 2024", "b. Mulai 2025 saja"]),
])

# ---------- BAGIAN 3 ----------
judul("Bagian 3 — Data Duplikat (PALING PENTING)", 12, GELAP)
tabel_pertanyaan([
    dict(no=13, pertanyaan="Pelanggan dobel digabung, riwayat & qty ikut dijumlahkan?",
         masalah="BUKTI: No HP 6285348509004 tercatat dengan 5 nama berbeda ('Ibu reaabi rejank', 'reaabi rejank', 'Kak Andi Rena toko rejank...', dll). Ada 410 nomor seperti ini.",
         pilihan=["a. Ya — gabung jadi 1 pelanggan, transaksi & qty dijumlahkan", "b. Pisah saja"]),
    dict(no=14, pertanyaan="Transaksi dobel persis dihitung 1x atau tetap?",
         masalah="BUKTI: Bpk Khoirul huda, 3 Jan 2025, Yacona 60 qty 2 Rp448.000 tercatat 11 KALI. Total ada 209 kasus (282 baris kelebihan). Kalau dihitung semua, dia dianggap beli 22 pcs.",
         pilihan=["a. Hitung 1x — yang dobel ditandai, tidak ikut hitungan", "b. Tetap dihitung semua"]),
    dict(no=15, pertanyaan="1 ID pesan berisi beberapa produk = 1 pesanan?",
         masalah="BUKTI: TRD2026041607608 Ibu Ratu Puji (resi sama) berisi Amandia 7 qty 1 + Probetes Herbal 24 qty 2. Ada 1.691 ID pesan seperti ini (3.790 baris). Kalau digabung, jumlah pesanan jadi +-40.700 (qty & nilai tidak berubah).",
         pilihan=["a. Gabung jadi 1 pesanan berisi beberapa produk", "b. Biarkan dihitung pesanan terpisah"]),
    dict(no=16, pertanyaan="Data Pesanan & Data Cohort beririsan — hitung total belanja pakai mana?",
         masalah="Transaksi yang sama bisa tercatat di dua file sekaligus, berisiko dobel hitung.",
         pilihan=["a. Data Pesanan sebagai acuan", "b. Data Cohort sebagai acuan", "c. Gabung lalu buang yang kembar (cek tanggal+WA+produk)"]),
    dict(no=17, pertanyaan="Catatan mirip tapi beda harga/qty, pakai yang mana?",
         masalah="Kemungkinan revisi order yang dicatat dua kali dengan angka beda.",
         pilihan=["a. Pakai yang terbaru", "b. Pakai yang nilainya lebih besar", "c. Tandai perlu dicek dulu"]),
])

# ---------- BAGIAN 4 ----------
judul("Bagian 4 — Arti Nama Produk", 12, GELAP)
sub("Sesuai keputusan sebelumnya produk S/Tk TETAP DIPISAH. Pertanyaan ini hanya soal ARTINYA, "
    "supaya saat SKU disamakan nanti penggabungan langsung benar.")
tabel_pertanyaan([
    dict(no=18, pertanyaan="Huruf 'S' di depan produk artinya apa?",
         masalah="Contoh di data: 'S Amandia 7', 'S Probetes Herbal 24', 'S Buku Remisi', 'S Minyak VCO'.",
         pilihan=["a. Shopee", "b. Sample", "c. Paket kecil", "d. Lainnya (tulis di catatan)"]),
    dict(no=19, pertanyaan="'Tk' di depan produk artinya apa?",
         masalah="Contoh di data: 'Tk Amandia 7', 'Tk Probetes Herbal 24', 'Tk Buku Remisi'.",
         pilihan=["a. TikTok", "b. Toko", "c. Lainnya (tulis di catatan)"]),
    dict(no=20, pertanyaan="Akhiran 'PB' artinya apa?",
         masalah="Contoh: 'Ebook 90 PB', 'Ebook 101 PB', 'Kelas Meal Plan PB'.",
         pilihan=["a. Probetes", "b. Paket Bundling", "c. Lainnya"]),
    dict(no=21, pertanyaan="'Ebook 90v2' produk beda atau sama dengan 'Ebook 90'?",
         masalah="Ada 160 transaksi Ebook 90v2 senilai Rp14 juta.",
         pilihan=["a. Produk beda, biarkan pisah", "b. Sama, nanti digabung"]),
    dict(no=22, pertanyaan="GM, GMB, NEU20 itu apa?",
         masalah="Kode singkat dengan nilai jual Rp0 (GM 60 qty, NEU20 35 qty).",
         pilihan=["a. Kode promo", "b. Produk bonus", "c. Salah input", "d. Lainnya"]),
    dict(no=23, pertanyaan="'HP COD' itu apa?",
         masalah="Tercatat 358 qty dengan nilai Rp34,7 juta — nilainya besar tapi namanya aneh.",
         pilihan=["a. Produk asli (tulis nama benerannya)", "b. Salah input", "c. Lainnya"]),
    dict(no=24, pertanyaan="'Pro Herbal Dummy' benar data uji coba?",
         masalah="428 qty, nilai Rp0. 'Dummy' biasanya berarti data tes, tapi jumlahnya besar.",
         pilihan=["a. Ya, data tes — keluarkan dari laporan penjualan", "b. Bukan, tetap dihitung"]),
    dict(no=25, pertanyaan="Daftar kategori produk resmi apa saja?",
         masalah="Kolom Kategori masih kosong. Usulan: Herbal / Digital-Ebook / Kelas / Buku.",
         pilihan=["a. Setuju usulan", "b. Susunan lain (tulis di catatan)"]),
])

# ---------- BAGIAN 5 ----------
judul("Bagian 5 — Produk Bonus", 12, GELAP)
tabel_pertanyaan([
    dict(no=26, pertanyaan="Semua produk 'Bonus' ikut aturan gabung?",
         masalah="Sudah disetujui: Amandia 7 Bonus & Probetes Herbal 24 Bonus digabung. Masih ada: Stevia Bonus, Beras Organik Bonus, Ebook 90 Bonus, Buku Remisi Bonus, Minyak VCO/CCO Bonus, Topping Bonus, Tas Probetes Bonus.",
         pilihan=["a. Ya, semua bonus digabung ke produk inti + diberi tanda bonus", "b. Kasus per kasus (tulis di catatan)"]),
    dict(no=27, pertanyaan="Cara hitung produk bonus?",
         masalah="Sebagian bonus nilainya Rp0, sebagian ada nilainya.",
         pilihan=["a. Menambah qty (barang keluar) tapi tidak menambah omzet", "b. Tidak dihitung sama sekali", "c. Lainnya"]),
])

# ---------- BAGIAN 6 ----------
judul("Bagian 6 — Temuan dari Analisis Data", 12, GELAP)
tabel_pertanyaan([
    dict(no=28, pertanyaan="Data tanpa No HP benar dari marketplace?",
         masalah="BUKTI: 2.497 baris tanpa No HP — 94% dari marketplace (Tiktok MP 2.339, MP 80, Shopee 363). Contoh: 'Bambang Suherdianto' muncul 22x tanpa HP di Tiktok MP.",
         pilihan=["a. Ya, marketplace tidak memberikan No HP", "b. Ada sebab lain (tulis di catatan)"]),
    dict(no=29, pertanyaan="Pelanggan marketplace tanpa HP yang jelas orang sama, boleh digabung?",
         masalah="BUKTI: 'Bambang Suherdianto' 22x beli Amandia 10 di Tiktok MP dengan tanggal beda-beda — kemungkinan besar orang yang sama.",
         pilihan=["a. Boleh gabung kalau nama + pola beli sama", "b. Tetap pisah karena tidak 100% yakin"]),
    dict(no=30, pertanyaan="Di export marketplace asli ada username pembeli?",
         masalah="Kalau ada, username bisa jadi pengganti No HP untuk membedakan pelanggan marketplace.",
         pilihan=["a. Ada, nanti disertakan", "b. Tidak ada"]),
    dict(no=31, pertanyaan="Arti kode ID pesan 2026?",
         masalah="2025 pakai angka murni (19.735 baris), 2026 pakai kode unik (6.869 baris) seperti TIKBKREM1777..., MPSHAMD71776... Dugaan: TIK=TikTok, MPSH=Marketplace Shopee, AMD7=Amandia 7, BKREM=Buku Remisi.",
         pilihan=["a. Dugaan benar", "b. Beda (jelaskan polanya di catatan)"]),
    dict(no=32, pertanyaan="ID pesan lama disimpan sebagai referensi, ERP buat ID baru yang seragam?",
         masalah="Format lama campur (angka vs kode), rawan dobel antar periode.",
         pilihan=["a. Ya (disarankan)", "b. Pakai ID pesan lama apa adanya"]),
    dict(no=33, pertanyaan="ID grup itu grup Telegram?",
         masalah="BUKTI: kolom idgrup hanya berisi 2 nilai: -1002269832980 (25.345 baris) dan -1002324324138 (1.149 baris) — format khas ID grup Telegram.",
         pilihan=["a. Ya, order dicatat via bot Telegram (jelaskan beda 2 grup di catatan)", "b. Bukan"]),
    dict(no=34, pertanyaan="Memo NC = New Customer, RO = Repeat Order?",
         masalah="BUKTI: kolom Memo berisi NC (13.561 baris) dan RO (9.983 baris) — penanda customer baru/lama dari sistem lama.",
         pilihan=["a. Benar", "b. Bukan (jelaskan di catatan)"]),
    dict(no=35, pertanyaan="Kalau hasil ERP beda dengan memo lama, mana yang dipercaya?",
         masalah="ERP menghitung Baru/Repeat dari No HP. Bisa beda dengan catatan manual NC/RO.",
         pilihan=["a. Hasil ERP (memo lama jadi pembanding)", "b. Memo lama"]),
    dict(no=36, pertanyaan="Kolom yang kosong total dibuang atau disiapkan?",
         masalah="Kolom Verifikasi, Kode Prod 1/2/3, PRODUK TERJUAL, Tgl Status Penerimaan, No. Invoice kosong total di file utama.",
         pilihan=["a. Buang", "b. Siapkan tetap (jelaskan rencananya di catatan)"]),
    dict(no=37, pertanyaan="BiayaMarketingCRM itu biaya apa?",
         masalah="Terisi 555 baris, contoh nilai: 27.000, 48.000.",
         pilihan=["a. Biaya marketing per order CRM — masuk Finance", "b. Lainnya (jelaskan)"]),
    dict(no=38, pertanyaan="Rumus resmi Total Bayar?",
         masalah="Ada kolom Nilai Produk, Ongkir, Packing (6.251 terisi), DiskonOngkir (12.459 terisi), Fee COD.",
         pilihan=["a. Nilai Produk + Ongkir + Packing - DiskonOngkir", "b. Rumus lain (tulis di catatan)"]),
    dict(no=39, pertanyaan="Fee COD dipotong dari pencairan atau ditagih ke customer?",
         masalah="Menentukan cara hitung uang yang benar-benar diterima.",
         pilihan=["a. Dipotong dari pencairan", "b. Ditagih ke customer"]),
    dict(no=40, pertanyaan="Status pesanan di ERP nanti diisi dari mana?",
         masalah="Kolom Status di data lama hampir kosong (8 terisi dari 33 ribu).",
         pilihan=["a. Otomatis dari cek resi", "b. Input CS", "c. Keduanya"]),
    dict(no=41, pertanyaan="Laporan pembayaran perlu rinci per bank?",
         masalah="Ada 30 varian (TRANSFER BCA/MANDIRI/SCALEV/ECOM, BANK_TRANSFER, dll).",
         pilihan=["a. Cukup COD vs Non-COD", "b. Rinci per bank/aplikasi"]),
    dict(no=42, pertanyaan="UP DM itu internal atau mitra luar?",
         masalah="UP DM menangani 20.928 order — hampir separuh seluruh data.",
         pilihan=["a. Tim internal", "b. Mitra eksternal — laporannya dipisah", "c. Lainnya"]),
    dict(no=43, pertanyaan="Data 2026 yang masih bertambah, ditarik ulang berkala atau cut-off?",
         masalah="Google Sheet masih dipakai input sampai ERP jalan penuh.",
         pilihan=["a. Tarik ulang berkala (misal tiap minggu)", "b. Cut-off di tanggal tertentu (tulis tanggalnya)"]),
])

# ---------- BAGIAN 7 ----------
judul("Bagian 7 — Pertanyaan Rancu Lainnya", 12, GELAP)
tabel_pertanyaan([
    dict(no=44, pertanyaan="Channel 'MP' itu marketplace apa?",
         masalah="157 order channel-nya hanya ditulis 'MP'.",
         pilihan=["a. Shopee", "b. TikTok", "c. Campuran — biarkan 'Marketplace Lain'"]),
    dict(no=45, pertanyaan="Nama CS mirip ini orang sama atau beda?",
         masalah="FIA vs FIAN, Elin vs Erlin, Anggi vs Anggit, Maruf vs MAKRUF, ZIDNI vs ZIDNY, Melinda vs Melindar.",
         pilihan=["a. Semua orang sama", "b. Semua beda", "c. Jawab per pasangan di catatan"]),
    dict(no=46, pertanyaan="Wahyu tercatat CS sekaligus ADV — satu orang dua tugas?",
         masalah="'Wahyu' muncul sebagai CS dan 'WAHYU' sebagai ADV.",
         pilihan=["a. 1 orang 2 tugas", "b. 2 orang berbeda"]),
    dict(no=47, pertanyaan="HUB JKT/MKS/JOG itu gudang pengirim?",
         masalah="Kolom HUB berisi JKT (3.484), MKS (302), JOG (221). Yogya juga gudang aktif?",
         pilihan=["a. Ya, gudang pengirim", "b. Lainnya (jelaskan)"]),
    dict(no=48, pertanyaan="SKU final ikut gudang mana?",
         masalah="Produk sama beda kode antar gudang: Herbal Probetes = PRB-14 (Jakarta) tapi PRB-01 (Makassar).",
         pilihan=["a. Ikut Jakarta", "b. Ikut Makassar", "c. Buat kode baru yang seragam, kode lama disimpan"]),
    dict(no=49, pertanyaan="28 order tanpa nama & tanpa HP ikut dihitung?",
         masalah="Tidak bisa dikaitkan ke pelanggan mana pun, tapi nilainya tetap uang masuk.",
         pilihan=["a. Tetap dihitung sebagai pelanggan 'tidak dikenal'", "b. Dipisahkan dari laporan"]),
    dict(no=50, pertanyaan="Kolom HP berisi 2 nomor sekaligus, pakai yang mana?",
         masalah="Ada baris berisi 2 nomor HP menyambung dalam satu kolom.",
         pilihan=["a. Nomor pertama (nomor kedua disimpan cadangan)", "b. Cek manual satu-satu"]),
    dict(no=51, pertanyaan="Migrasi per 2 bulan mulai dari periode mana?",
         masalah="Rencana migrasi bertahap per 2 bulan.",
         pilihan=["a. Terbaru dulu (Mei-Juni 2026)", "b. Terlama dulu"]),
])

doc.add_paragraph()
p = doc.add_paragraph()
r = p.add_run("Prioritas menjawab: Bagian 3 (duplikat & ID pesan) dulu — menentukan benar/tidaknya "
              "angka penjualan. Lalu Bagian 5 (bonus), Bagian 2 (cohort), sisanya menyusul. "
              "Semua jawaban diterapkan tanpa menghapus data asli.")
r.font.size = Pt(9)
r.font.color.rgb = ABU

doc.save(OUT)
print("Tersimpan:", OUT)
