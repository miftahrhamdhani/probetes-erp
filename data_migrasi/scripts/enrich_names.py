"""
Tambahkan kolom nama/kota/hp (dari customers.csv) ke file yang hanya punya customer_id,
supaya gampang dibaca manusia. TIDAK mengubah data/dedup, hanya menempel nama via lookup.
Menghasilkan versi *_named.csv (file asli tidak ditimpa).
"""
import csv, io, os

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(BASE, "output")

def load(rel):
    with io.open(os.path.join(OUT, rel), "r", encoding="utf-8-sig", newline="") as f:
        return list(csv.DictReader(f))

# lookup id -> data pelanggan
cust = {c["customer_id"]: c for c in load("master/customers.csv")}
prod = {p["product_id"]: p["product_final_name"] for p in load("master/products.csv")}
user = {u["user_id"]: u["name"] for u in load("master/users.csv")}

def enrich(rel, id_col, insert_cols, out_rel):
    with io.open(os.path.join(OUT, rel), "r", encoding="utf-8-sig", newline="") as f:
        rd = csv.reader(f)
        rows = list(rd)
    header = rows[0]
    idx = header.index(id_col)
    # kolom baru disisipkan tepat setelah id_col
    new_header = header[:idx+1] + [c[0] for c in insert_cols] + header[idx+1:]
    out = [new_header]
    for r in rows[1:]:
        cid = r[idx]
        extra = [c[1](cid) for c in insert_cols]
        out.append(r[:idx+1] + extra + r[idx+1:])
    p = os.path.join(OUT, out_rel)
    with io.open(p, "w", encoding="utf-8-sig", newline="") as f:
        csv.writer(f).writerows(out)
    print(f"  {out_rel:<45} {len(out)-1} baris")

def cname(cid): return cust.get(cid, {}).get("name", "")
def ccity(cid): return cust.get(cid, {}).get("city", "")
def cphone(cid): return cust.get(cid, {}).get("phone_normalized", "")

print("Menulis versi *_named.csv (dengan nama pelanggan)...")
enrich("master/customer_cohorts.csv", "customer_id",
       [("nama", cname), ("kota", ccity), ("no_hp", cphone)],
       "master/customer_cohorts_named.csv")
enrich("orders/orders.csv", "customer_id",
       [("nama", cname)],
       "orders/orders_named.csv")
enrich("orders/customer_transactions.csv", "customer_id",
       [("nama", cname)],
       "orders/customer_transactions_named.csv")
print("Selesai. File asli tidak ditimpa; versi _named untuk dibaca manusia.")
