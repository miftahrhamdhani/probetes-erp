# -*- coding: utf-8 -*-
"""
Terapkan koreksi produk (keputusan owner ronde-2) ke database live + patch CSV output.
Non-destruktif: hapus = arsip, gabung = simpan nama asli. Default DRY-RUN.

Cara pakai (dari root project):
    python data_migrasi/scripts/apply_koreksi_produk.py            # dry-run (lihat rencana)
    python data_migrasi/scripts/apply_koreksi_produk.py --apply    # terapkan

Sumber koreksi: data_migrasi/koreksi/koreksi_produk.csv (boleh diedit owner).
"""
import argparse
import csv
import io
import os
import sys

try:
    import psycopg2
except ImportError:
    sys.exit("psycopg2 belum terpasang: pip install psycopg2-binary")

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
KOREKSI = os.path.join(ROOT, "data_migrasi", "koreksi", "koreksi_produk.csv")
PRODUK_CSV = os.path.join(ROOT, "data_migrasi", "output", "master", "products.csv")
ENV_PATH = os.path.join(ROOT, "apps", "web", ".env.local")

VALID_KAT = {"Herbal", "Makanan", "Minyak Balur", "Edukasi", "Device", "Event", "Jasa"}


def read_database_url():
    with io.open(ENV_PATH, encoding="utf-8") as fh:
        for line in fh:
            if line.strip().startswith("DATABASE_URL="):
                return line.split("=", 1)[1].strip()
    sys.exit("DATABASE_URL tidak ditemukan di apps/web/.env.local")


def load_koreksi():
    with io.open(KOREKSI, encoding="utf-8-sig", newline="") as fh:
        return list(csv.DictReader(fh))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--apply", action="store_true", help="terapkan (default dry-run)")
    args = ap.parse_args()

    rows = load_koreksi()
    plan = {"set_kategori": [], "hapus": [], "gabung": [], "keluar_sales": []}
    warns = []
    for r in rows:
        aksi = (r.get("aksi") or "set_kategori").strip()
        pid = r["product_id"].strip()
        kat = (r.get("kategori_baru") or "").strip()
        if aksi == "set_kategori":
            if not kat:
                warns.append(f"{pid} ({r['nama_produk']}): kategori_baru kosong -> dilewati")
                continue
            if kat not in VALID_KAT:
                warns.append(f"{pid}: kategori '{kat}' tidak dikenal -> dilewati")
                continue
            plan["set_kategori"].append((pid, kat))
        elif aksi == "hapus":
            plan["hapus"].append((pid, r["nama_produk"]))
        elif aksi == "keluar_sales":
            plan["keluar_sales"].append((pid, kat, r["nama_produk"]))
        elif aksi == "gabung":
            tgt = (r.get("target_gabung") or "").strip()
            if not tgt:
                warns.append(f"{pid}: aksi gabung tanpa target_gabung -> dilewati")
                continue
            plan["gabung"].append((pid, tgt, r["nama_produk"]))
        else:
            warns.append(f"{pid}: aksi '{aksi}' tidak dikenal -> dilewati")

    print("RENCANA PERUBAHAN")
    print(f"  set_kategori : {len(plan['set_kategori'])} produk")
    print(f"  hapus (arsip): {len(plan['hapus'])}  -> {[p for p,_ in plan['hapus']]}")
    print(f"  keluar_sales : {len(plan['keluar_sales'])} -> {[p for p,_,_ in plan['keluar_sales']]}")
    print(f"  gabung       : {len(plan['gabung'])} -> {[(p,t) for p,t,_ in plan['gabung']]}")
    if warns:
        print("\nPERINGATAN (dilewati):")
        for w in warns:
            print("  -", w)

    if not args.apply:
        print("\n(DRY-RUN) Tidak ada yang diubah. Tambah --apply untuk menerapkan.")
        return

    con = psycopg2.connect(read_database_url())
    con.autocommit = False
    try:
        with con.cursor() as cur:
            # kolom penanda barang non-sales (mis. Pro Herbal Dummy)
            cur.execute("ALTER TABLE master.products ADD COLUMN IF NOT EXISTS is_sales_item BOOLEAN DEFAULT true")
            # 1) kategori
            for pid, kat in plan["set_kategori"]:
                cur.execute("UPDATE master.products SET category=%s WHERE product_id=%s", (kat, pid))
            # 2) hapus -> arsip
            for pid, _ in plan["hapus"]:
                cur.execute("UPDATE master.products SET status='archived' WHERE product_id=%s", (pid,))
            # 3) keluar_sales -> tandai bukan barang jual
            for pid, kat, _ in plan["keluar_sales"]:
                if kat in VALID_KAT:
                    cur.execute("UPDATE master.products SET category=%s WHERE product_id=%s", (kat, pid))
                cur.execute("UPDATE master.products SET is_sales_item=false WHERE product_id=%s", (pid,))
            # 4) gabung -> pindah order_items ke target, arsipkan sumber (nama asli tetap tersimpan)
            moved = 0
            for pid, tgt, _ in plan["gabung"]:
                cur.execute("UPDATE orders.order_items SET product_id=%s WHERE product_id=%s", (tgt, pid))
                moved += cur.rowcount
                cur.execute("UPDATE master.products SET status='archived' WHERE product_id=%s", (pid,))
        con.commit()
        print(f"\nDB: kategori {len(plan['set_kategori'])}, arsip {len(plan['hapus'])}, "
              f"keluar_sales {len(plan['keluar_sales'])}, order_items dipindah {moved}.")
    except Exception:
        con.rollback()
        raise
    finally:
        con.close()

    # patch products.csv (kolom category & status) agar sinkron
    with io.open(PRODUK_CSV, encoding="utf-8-sig", newline="") as fh:
        data = list(csv.reader(fh))
    hdr = data[0]
    i_id, i_cat, i_stat = hdr.index("product_id"), hdr.index("category"), hdr.index("status")
    kat_map = {p: k for p, k in plan["set_kategori"]}
    kat_map.update({p: k for p, k, _ in plan["keluar_sales"] if k in VALID_KAT})
    arsip = {p for p, _ in plan["hapus"]} | {p for p, _, _ in plan["gabung"]}
    n = 0
    for row in data[1:]:
        pid = row[i_id]
        if pid in kat_map:
            row[i_cat] = kat_map[pid]; n += 1
        if pid in arsip:
            row[i_stat] = "archived"
    with io.open(PRODUK_CSV, "w", encoding="utf-8-sig", newline="") as fh:
        csv.writer(fh).writerows(data)
    print(f"CSV: {n} kategori diperbarui di {os.path.relpath(PRODUK_CSV, ROOT)}.")


if __name__ == "__main__":
    main()
