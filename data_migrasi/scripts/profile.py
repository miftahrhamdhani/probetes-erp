"""Profil cepat file CSV sumber: jumlah baris, nilai unik kolom kunci, tingkat kosong.
Penggunaan: py profile.py <file.csv> [skip_rows]
"""
import csv, sys, io
from collections import Counter

path = sys.argv[1]
skip = int(sys.argv[2]) if len(sys.argv) > 2 else 0

with io.open(path, "r", encoding="utf-8-sig", newline="") as f:
    rows = list(csv.reader(f))

for _ in range(skip):
    if rows:
        rows.pop(0)

header = rows[0]
data = rows[1:]
print(f"FILE: {path}")
print(f"KOLOM ({len(header)}): {header}")
print(f"TOTAL BARIS DATA: {len(data)}")
print("=" * 70)

def col(name):
    try:
        i = header.index(name)
    except ValueError:
        return None
    return [r[i].strip() if i < len(r) else "" for r in data]

def summarize(name, top=15):
    vals = col(name)
    if vals is None:
        print(f"[{name}] -- kolom tidak ada")
        return
    nonempty = [v for v in vals if v != ""]
    empty = len(vals) - len(nonempty)
    c = Counter(nonempty)
    print(f"[{name}] terisi={len(nonempty)} kosong={empty} unik={len(c)}")
    for v, n in c.most_common(top):
        show = v if len(v) <= 40 else v[:40] + "..."
        print(f"    {n:>7}  {show}")
    print("-" * 70)

# kolom kunci yang mau diprofil (ambil dari argumen ke-3 dst kalau ada)
targets = sys.argv[3:] if len(sys.argv) > 3 else header
for t in targets:
    summarize(t)
