"""
Satukan stok gudang Jakarta + Makassar jadi satu tabel bersih (grain: produk per gudang).
Cocokkan produk ke master products (via nama) untuk membuktikan integrasi lewat kunci produk.
Output: output/GABUNGAN/gudang_stok_gabungan.csv
"""
import csv, io, os, re

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.path.join(BASE, "raw")
OUT = os.path.join(BASE, "output")

def norm(s):
    s = (s or "").replace("�", " ").replace("\xa0", " ")
    return re.sub(r"\s+", " ", s).strip().upper()

# master produk untuk pencocokan
prod = {}
with io.open(os.path.join(OUT, "master/products.csv"), "r", encoding="utf-8-sig", newline="") as f:
    for p in csv.DictReader(f):
        prod[norm(p["product_final_name"])] = p["product_id"]

def extract(path, gudang):
    rows = list(csv.reader(io.open(path, encoding="utf-8-sig", newline="")))
    header = rows[1]
    stock_col = header.index("STOCK LEVEL")
    MARK, TOTAL, SKU, PROD = 4, 5, 1, 0
    out, cur = [], None
    for r in rows[3:]:
        def g(i): return r[i].strip() if i < len(r) else ""
        mark = g(MARK)
        if mark == "RESI":
            produk = g(PROD)
            if not produk:
                cur = None
                continue
            cur = {"gudang": gudang, "produk": produk, "sku_gudang": g(SKU),
                   "stock_level": g(stock_col), "total_resi": g(TOTAL), "total_pcs": ""}
        elif mark == "PCS" and cur:
            cur["total_pcs"] = g(TOTAL)
            pid = prod.get(norm(cur["produk"]), "")
            out.append([cur["gudang"], cur["produk"], cur["sku_gudang"],
                        cur["stock_level"], cur["total_resi"], cur["total_pcs"],
                        pid, "cocok" if pid else "tidak_ketemu"])
            cur = None
    return out

rows = extract(os.path.join(RAW, "05_gudang_jakarta.csv"), "Jakarta") \
     + extract(os.path.join(RAW, "06_gudang_makasar.csv"), "Makassar")

dst = os.path.join(OUT, "GABUNGAN", "gudang_stok_gabungan.csv")
os.makedirs(os.path.dirname(dst), exist_ok=True)
with io.open(dst, "w", encoding="utf-8-sig", newline="") as f:
    w = csv.writer(f)
    w.writerow(["gudang", "produk", "sku_gudang", "stock_level",
                "total_resi_keluar", "total_pcs_keluar", "product_id_master", "status_cocok"])
    w.writerows(rows)

from collections import Counter
print(f"Total baris stok: {len(rows)}")
print("Per gudang:", dict(Counter(r[0] for r in rows)))
print("Cocok ke master produk:", dict(Counter(r[7] for r in rows)))
print("File:", dst)
