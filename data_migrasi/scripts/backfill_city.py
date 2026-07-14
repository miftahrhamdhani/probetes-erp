# -*- coding: utf-8 -*-
"""
Backfill kota (city) untuk pelanggan yang punya ALAMAT tapi KOTA kosong.
Hanya MENGISI sel kosong — tidak pernah menimpa kota yang sudah ada.
Fokus presisi: hanya format terstruktur (mis. "..,Bekasi City,West Java,Indonesia"
dan "Kabupaten/Kota X"). Hasil yang meragukan (arah/kata umum) ditolak stoplist.

Memperbarui: database live (master.customers) + file output/master/customers.csv
agar keduanya tetap sinkron.

Cara pakai (dari root project):
    python data_migrasi/scripts/backfill_city.py            # tampilkan usulan saja (dry-run)
    python data_migrasi/scripts/backfill_city.py --apply    # terapkan ke DB + CSV
"""
import argparse
import csv
import io
import os
import re
import sys

try:
    import psycopg2
except ImportError:
    sys.exit("psycopg2 belum terpasang: pip install psycopg2-binary")

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
CSV_PATH = os.path.join(ROOT, "data_migrasi", "output", "master", "customers.csv")
ENV_PATH = os.path.join(ROOT, "apps", "web", ".env.local")

# --- extractor kota presisi tinggi (lihat build_migration.extract_city untuk versi pipeline)
_PROV_EN = (r"(?:west |central |east |north |south |southeast )?"
            r"(?:java|sumatra|sumatera|kalimantan|sulawesi|nusa tenggara|papua)|"
            r"jakarta|banten|bali|aceh|riau|jambi|lampung|bengkulu|gorontalo|maluku|"
            r"yogyakarta|bangka belitung|riau islands|special region of yogyakarta")
_PROV_ID = (r"jawa (?:barat|tengah|timur)|sumatera (?:utara|barat|selatan)|"
            r"kalimantan \w+|sulawesi \w+|dki jakarta|di yogyakarta|nusa tenggara \w+")

# hasil yang jelas BUKAN nama kota -> tolak
_STOP = {"baru", "tengah", "selatan", "utara", "barat", "timur", "pusat", "lama",
         "raya", "indah", "permai", "diy", "dki", "kota", "kabupaten",
         "administrasi", "administrative", "jawa", "sumatera", "sumatra",
         "kalimantan", "sulawesi", "aceh", "riau", "jambi", "lampung"}


def clean(s):
    return re.sub(r"\s+", " ", (s or "").strip())


def titlecity(v):
    return " ".join(w.capitalize() for w in clean(v).split() if w)


def accept(city):
    c = titlecity(city).strip(" .,;-'")
    if not c or len(c) < 3 or c.lower() in _STOP:
        return ""
    return c


def extract_city(address):
    text = clean(address)
    if not text:
        return ""
    # A: "<City> City, <Province>[, Indonesia]"
    m = re.search(r"[,;]\s*([A-Za-z .'-]{3,35}?)\s+city\s*,\s*(?:" + _PROV_EN + r"|" + _PROV_ID + r")\b",
                  text, re.I)
    if m:
        got = accept(m.group(1))
        if got:
            return got
    # B: "<Regency> Regency, <Province>"
    m = re.search(r"[,;]\s*([A-Za-z .'-]{3,35}?)\s+regency\s*,\s*(?:" + _PROV_EN + r"|" + _PROV_ID + r")\b",
                  text, re.I)
    if m:
        got = accept(m.group(1))
        if got:
            return got
    # C: eksplisit Indonesia "Kabupaten/Kota <Nama>"
    m = re.search(r"\b(?:kabupaten|kota)\s+([A-Za-z.'-]+(?:\s+(?:selatan|utara|barat|timur|pusat))?)",
                  text, re.I)
    if m:
        got = accept(m.group(1))
        if got:
            return got
    return ""


def read_database_url():
    with io.open(ENV_PATH, encoding="utf-8") as fh:
        for line in fh:
            if line.strip().startswith("DATABASE_URL="):
                return line.split("=", 1)[1].strip()
    sys.exit("DATABASE_URL tidak ditemukan di apps/web/.env.local")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--apply", action="store_true", help="terapkan perubahan (default dry-run)")
    args = ap.parse_args()

    con = psycopg2.connect(read_database_url())
    con.autocommit = False
    updates = {}  # customer_id -> city
    with con.cursor() as cur:
        cur.execute("""
            SELECT customer_id, address FROM master.customers
            WHERE NULLIF(address,'') IS NOT NULL AND NULLIF(city,'') IS NULL
            ORDER BY customer_id
        """)
        rows = cur.fetchall()
        for cid, addr in rows:
            city = extract_city(addr)
            if city:
                updates[cid] = city

    print(f"Kota kosong (ada alamat) : {len(rows)}")
    print(f"Bisa dipulihkan (presisi): {len(updates)}")
    print(f"Masih buntu              : {len(rows) - len(updates)}")
    print("\nUsulan perubahan:")
    for cid, city in list(updates.items()):
        print(f"  {cid:<14} -> {city}")

    if not args.apply:
        print("\n(DRY-RUN) Tidak ada yang diubah. Tambah --apply untuk menerapkan.")
        con.close()
        return

    # 1) update DB — hanya isi yang masih kosong (jaga-jaga)
    with con.cursor() as cur:
        for cid, city in updates.items():
            cur.execute(
                "UPDATE master.customers SET city=%s WHERE customer_id=%s AND NULLIF(city,'') IS NULL",
                (city, cid))
    con.commit()
    con.close()
    print(f"\nDB: {len(updates)} baris diperbarui.")

    # 2) patch CSV agar sinkron
    with io.open(CSV_PATH, encoding="utf-8-sig", newline="") as fh:
        reader = list(csv.reader(fh))
    header = reader[0]
    ci_id, ci_city = header.index("customer_id"), header.index("city")
    patched = 0
    for row in reader[1:]:
        cid = row[ci_id]
        if cid in updates and not row[ci_city].strip():
            row[ci_city] = updates[cid]
            patched += 1
    with io.open(CSV_PATH, "w", encoding="utf-8-sig", newline="") as fh:
        w = csv.writer(fh)
        w.writerows(reader)
    print(f"CSV: {patched} baris diperbarui ({os.path.relpath(CSV_PATH, ROOT)}).")


if __name__ == "__main__":
    main()
