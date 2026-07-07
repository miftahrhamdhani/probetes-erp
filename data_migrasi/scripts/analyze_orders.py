"""Analisis khusus file order (01/02): format No HP, jumlah unik, rentang tanggal, produk.
Penggunaan: py analyze_orders.py <file.csv>
"""
import csv, sys, io, re
from collections import Counter

path = sys.argv[1]
with io.open(path, "r", encoding="utf-8-sig", newline="") as f:
    rows = list(csv.reader(f))
header = rows[0]
data = rows[1:]

def idx(name):
    return header.index(name) if name in header else -1

def cval(r, name):
    i = idx(name)
    return (r[i].strip() if 0 <= i < len(r) else "")

def normalize_phone(p):
    d = re.sub(r"\D", "", p)
    if not d:
        return ""
    if d.startswith("0"):
        d = "62" + d[1:]
    elif d.startswith("620"):
        d = "62" + d[3:]
    elif not d.startswith("62"):
        if d.startswith("8"):
            d = "62" + d
    return d

phone_col = "No. HP"
cust_col = "Customer"
date_col = "Tanggal Pesanan" if idx("Tanggal Pesanan") >= 0 else "Tanggal"
prod_col = "Produk 1"

phones_raw = [cval(r, phone_col) for r in data]
phones_norm = [normalize_phone(p) for p in phones_raw if p]
customers = [cval(r, cust_col) for r in data if cval(r, cust_col)]
dates = [cval(r, date_col) for r in data if cval(r, date_col)]
products = [cval(r, prod_col) for r in data if cval(r, prod_col)]

print(f"FILE: {path}  baris={len(data)}")
print(f"No HP terisi={len([p for p in phones_raw if p])}  kosong={len([p for p in phones_raw if not p])}")
print(f"No HP unik (normalisasi 62): {len(set(phones_norm))}")
print(f"Customer nama terisi={len(customers)}  nama unik(mentah)={len(set(customers))}")
print(f"Tanggal contoh: {dates[:3]}  ...  {dates[-3:]}")
print(f"Tanggal unik format sample: {list(set([re.sub(chr(92)+'d','9',d) for d in dates[:2000]]))[:6]}")
print("-" * 60)

# panjang nomor HP (deteksi anomali)
lens = Counter(len(p) for p in phones_norm)
print("Distribusi panjang No HP (setelah normalisasi):")
for L, n in sorted(lens.items()):
    print(f"    panjang {L}: {n}")
print("-" * 60)

# nomor HP muncul >1 kali = indikasi repeat customer / calon dedup
pc = Counter(phones_norm)
repeat = [(p, n) for p, n in pc.items() if n > 1]
print(f"No HP muncul >1x (repeat/calon merge): {len(repeat)} nomor, "
      f"total {sum(n for _, n in repeat)} baris")
print(f"Top 5 nomor paling sering: {sorted(repeat, key=lambda x: -x[1])[:5]}")
print("-" * 60)

print(f"Produk unik (mentah): {len(set(products))}")
print("Top 30 Produk 1:")
for v, n in Counter(products).most_common(30):
    print(f"    {n:>6}  {v}")
