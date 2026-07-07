"""
Ekstrak SEMUA data bermasalah dari hasil migrasi ke output/masalah/*.csv
Read-only dari output/ (tidak mengubah raw/ maupun mapping utama).
"""
import csv, io, os, re
from collections import Counter

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(BASE, "output")
MASALAH = os.path.join(OUT, "masalah")
os.makedirs(MASALAH, exist_ok=True)

def load(rel):
    with io.open(os.path.join(OUT, rel), "r", encoding="utf-8-sig", newline="") as f:
        return list(csv.DictReader(f))

def save(name, header, rows):
    with io.open(os.path.join(MASALAH, name), "w", encoding="utf-8-sig", newline="") as f:
        w = csv.writer(f)
        w.writerow(header)
        w.writerows(rows)
    print(f"  {name:<42} {len(rows)} baris")

customers = load("master/customers.csv")
products  = load("master/products.csv")
channels  = load("master/channels.csv")
couriers  = load("master/couriers.csv")
orders    = load("orders/orders.csv")
mp_cs     = load("staging/mapping_cs.csv")

print("Menulis output/masalah/ ...")

# ---------------------------------------------------------------------------
# 1. PELANGGAN TANPA NO HP (risiko customer lama dianggap baru)
#    diurut per nama supaya kemungkinan duplikat berdekatan
# ---------------------------------------------------------------------------
no_phone = [c for c in customers if not c["phone_normalized"].strip()]
name_norm = lambda s: re.sub(r"\s+", " ", s).strip().upper()
name_count = Counter(name_norm(c["name"]) for c in no_phone)
rows = []
for c in sorted(no_phone, key=lambda c: name_norm(c["name"])):
    nc = name_count[name_norm(c["name"])]
    rows.append([
        c["customer_id"], c["name"], c["address"], c["city"],
        c["source_origin"], c["transaction_count"], c["status"],
        nc, "kemungkinan duplikat (nama sama muncul >1x)" if nc > 1 else "",
    ])
save("01_pelanggan_tanpa_hp.csv",
     ["customer_id", "nama", "alamat", "kota", "sumber", "jumlah_transaksi",
      "status", "jumlah_nama_sama", "catatan"], rows)

# ---------------------------------------------------------------------------
# 2. PELANGGAN NO HP ANEH (kependekan / kepanjangan / format salah)
# ---------------------------------------------------------------------------
rows = []
for c in customers:
    pn = c["phone_normalized"].strip()
    if not pn:
        continue
    masalah = ""
    if not pn.startswith("62"):
        masalah = "tidak diawali 62"
    elif len(pn) > 15:
        masalah = "terlalu panjang (kemungkinan 2 nomor)"
    elif len(pn) < 10:
        masalah = "terlalu pendek"
    if masalah:
        rows.append([c["customer_id"], c["name"], c["phone"], pn, len(pn), masalah])
save("02_pelanggan_hp_aneh.csv",
     ["customer_id", "nama", "hp_asli", "hp_normalisasi", "panjang", "masalah"], rows)

# ---------------------------------------------------------------------------
# 3. PRODUK BERMASALAH / TIDAK SINKRON
# ---------------------------------------------------------------------------
AMBIGU = {"Amandia", "Beras", "MINYAK", "Minyak", "Probetes Herbal"}
KODE   = {"GM", "GMB", "NEU20", "HP", "HP COD"}
# pasangan yang kemungkinan sama tapi masih terpisah (dari analisis manual)
KEMUNGKINAN_SAMA = {
    "Amandia10": "Amandia 10", "Amandia Museli": "Amandia Muesli",
    "Ebook Fatloss": "Ebook Fat Loss", "Ebook Hiperteni": "Ebook Hipertensi",
    "Ebook Hipertrnsi": "Ebook Hipertensi", "Pro Herbal 24": "Probetes Herbal 24",
    "Yacona": "Yacona 60", "Minyak VCO": "Minyak Kelapa VCO",
    "Minyak CCO": "Minyak Kelapa CCO",
}
rows = []
for p in products:
    final = p["product_final_name"]
    orig = p["original_names"]
    val = p["value_total"]
    kat, rek, prio = "", "", ""
    if re.search(r"\bDummy\b", orig, re.IGNORECASE):
        kat, rek, prio = "Data test (Dummy)", "Keluarkan dari penjualan", "Tinggi"
    elif final in AMBIGU:
        kat, rek, prio = "Nama polos ambigu", "Jangan digabung dulu, tanya owner produk mana", "Tinggi"
    elif final in KODE:
        kat, rek, prio = "Kode tidak jelas", "Konfirmasi: produk / promo / salah input", "Sedang"
    elif re.search(r"(^|/ )(S|Tk) ", orig):
        kat, rek, prio = "Prefiks S/Tk", "Gabung ke produk inti + simpan atribut (konfirmasi arti S/Tk)", "Tinggi"
    elif re.search(r"\bBonus\b", orig, re.IGNORECASE):
        kat, rek, prio = "Ada varian Bonus", "Gabung ke produk inti + flag bonus", "Sedang"
    elif val == "0" or val == "":
        kat, rek, prio = "Nilai jual Rp 0", "Cek: bonus/promo/salah input", "Rendah"
    sama = KEMUNGKINAN_SAMA.get(final, "")
    if sama:
        kat = (kat + " + kemungkinan duplikat") if kat else "Kemungkinan duplikat produk"
        rek = rek or "Konfirmasi lalu gabung"
        prio = prio or "Sedang"
    if kat:
        rows.append([p["product_id"], final, orig, p["qty_total"], val, kat, sama, rek, prio])
save("03_produk_bermasalah.csv",
     ["product_id", "produk_final", "nama_asli", "qty_total", "nilai_total",
      "kategori_masalah", "kemungkinan_sama_dengan", "rekomendasi", "prioritas"], rows)

# ---------------------------------------------------------------------------
# 4. CHANNEL BERMASALAH (konsep tercampur)
# ---------------------------------------------------------------------------
DIVISI = {"Akuisisi", "Cs", "CS"}
rows = []
for ch in channels:
    final = ch["channel_final_name"]
    if ch["status"].lower() == "review" or final in DIVISI or final in ("Mp",):
        if final in DIVISI:
            jenis, rek = "Divisi internal (bukan channel)", "Pindahkan ke kolom divisi"
        elif final == "CRM":
            jenis, rek = "Divisi/funnel (bukan platform)", "Pindahkan ke kolom divisi"
        elif final == "Mp":
            jenis, rek = "Marketplace tak jelas", "Konfirmasi marketplace mana"
        else:
            jenis, rek = "Perlu review", "Konfirmasi owner"
        rows.append([ch["channel_id"], final, ch["original_names"],
                     ch["order_count"], jenis, rek])
# CRM juga dicatat walau status Aktif (konsepnya divisi)
for ch in channels:
    if ch["channel_final_name"] == "CRM":
        rows.append([ch["channel_id"], "CRM", ch["original_names"],
                     ch["order_count"], "Divisi/funnel (bukan platform)",
                     "Pindahkan ke kolom divisi"])
save("04_channel_bermasalah.csv",
     ["channel_id", "channel_final", "nama_asli", "jumlah_order",
      "jenis_sebenarnya", "rekomendasi"], rows)

# ---------------------------------------------------------------------------
# 5. KURIR BERMASALAH (typo / tidak jelas)
# ---------------------------------------------------------------------------
rows = []
for c in couriers:
    if c["status"].lower() == "review":
        final = c["courier_final_name"]
        if final.upper() in ("LIO", "LON", "SOX", "JNR", "DIET"):
            rek = "Cek: salah input? (bukan kurir dikenal)"
        elif "CARGO" in final.upper():
            rek = "Konfirmasi: layanan cargo terpisah?"
        else:
            rek = "Konfirmasi ejaan/typo"
        rows.append([c["courier_id"], final, c["original_names"],
                     c["order_count"], rek])
save("05_kurir_bermasalah.csv",
     ["courier_id", "kurir_final", "nama_asli", "jumlah_order", "rekomendasi"], rows)

# ---------------------------------------------------------------------------
# 6. CS/ADV BERMASALAH (bukan orang / nama mirip)
# ---------------------------------------------------------------------------
def classify_cs(name):
    low = name.lower()
    if re.search(r"affil", low):
        return "Kategori affiliate (bukan orang)", "Pindahkan dari master user"
    if low in ("non adv", "non iklan", "non-adv"):
        return "Placeholder 'tanpa ADV'", "Jadikan kosong/null"
    if low in ("iklan", "live", "radio", "tiktok mp"):
        return "Channel/sumber (bukan orang)", "Pindahkan ke channel/source"
    if re.search(r"amandia|yacona|herbal|official|sereal|beras organik|^probetes$", low):
        return "Nama toko/brand (bukan orang)", "Pindahkan ke tabel toko/brand"
    if re.search(r"\d{6,}", name) or low.startswith("trd"):
        return "ID transaksi nyasar", "Buang dari kolom CS"
    return None, None

# pasangan nama mirip (perlu konfirmasi orang sama/beda)
MIRIP = {
    "WAHYU": "Wahyu (CS) vs WAHYU (ADV) - 1 orang 2 peran?",
    "Wahyu": "Wahyu (CS) vs WAHYU (ADV) - 1 orang 2 peran?",
    "FIA": "FIA vs FIAN - orang sama/beda?",
    "Elin": "Elin vs Erlin - orang sama/beda?",
    "Anggi": "Anggi vs ANGGIT - orang sama/beda?",
    "ANGGIT": "Anggi vs ANGGIT - orang sama/beda?",
    "MAKRUF": "Maruf vs MAKRUF - ejaan beda",
    "ZIDNI": "ZIDNI vs ZIDNY - ejaan beda",
    "ZIDNY": "ZIDNI vs ZIDNY - ejaan beda",
    "Melindar": "Melinda vs Melindar - typo?",
    "ISNA BAGAS": "nama gabungan 2 orang?",
    "BAGAS ISNA": "nama gabungan 2 orang?",
}
rows = []
for u in mp_cs:
    nm = u["nama_asli"]
    kat, rek = classify_cs(nm)
    mirip = MIRIP.get(nm, "")
    if kat or mirip:
        rows.append([u["user_id"], nm, u["role"],
                     kat or "Nama mirip", rek or "Konfirmasi owner", mirip])
save("06_cs_adv_bermasalah.csv",
     ["user_id", "nama_asli", "role_terbaca", "dugaan_jenis", "rekomendasi", "catatan_mirip"], rows)

# ---------------------------------------------------------------------------
# 7. ORDER TANPA PELANGGAN (tak ada HP & nama)
# ---------------------------------------------------------------------------
rows = [[o["order_id"], o["order_date"], o["total_amount"], o["source_file_id"]]
        for o in orders if not o["customer_id"].strip()]
save("07_order_tanpa_pelanggan.csv",
     ["order_id", "tanggal", "total", "sumber_file"], rows)

print("\nSelesai. Semua file di:", MASALAH)
