"""
Satukan semua data transaksi (order 01/02 + cohort 04) menjadi SATU tabel datar bersih.
1 baris = 1 transaksi, nilai pakai nama asli (bukan kode), ada kolom sumber untuk telusur.
Output: output/GABUNGAN/probetes_tersatukan.csv
Read-only dari output/ (tidak mengubah raw/ atau mapping).
"""
import csv, io, os

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(BASE, "output")

def load(rel):
    with io.open(os.path.join(OUT, rel), "r", encoding="utf-8-sig", newline="") as f:
        return list(csv.DictReader(f))

# --- lookup master ---
cust = {c["customer_id"]: c for c in load("master/customers.csv")}
prod = {p["product_id"]: p["product_final_name"] for p in load("master/products.csv")}
chan = {c["channel_id"]: c["channel_final_name"] for c in load("master/channels.csv")}
cour = {c["courier_id"]: c["courier_final_name"] for c in load("master/couriers.csv")}
user = {u["user_id"]: u["name"] for u in load("master/users.csv")}

# --- lookup fakta per order ---
item = {i["order_id"]: i for i in load("orders/order_items.csv")}
fin  = {f["order_id"]: f for f in load("finance/order_finance.csv")}
ship = {s["order_id"]: s for s in load("tracking/shipments.csv")}
cod  = {c["order_id"]: c for c in load("tracking/cod_payments.csv")}

def cust_field(cid, field):
    return cust.get(cid, {}).get(field, "")

HEADER = [
    "sumber", "id_baris", "tanggal",
    "id_pelanggan", "nama_pelanggan", "no_hp", "kota", "alamat",
    "produk", "qty", "nilai_produk", "total_bayar", "metode_bayar",
    "channel", "cs", "kurir", "no_resi",
    "ongkir", "packing", "fee_cod", "hpp", "invoice",
    "status_order", "status_cod", "status_retur", "cohort",
    "catatan_kualitas",
]

rows = []

# ===== ORDER (01 + 02) =====
for o in load("orders/orders.csv"):
    oid = o["order_id"]
    it = item.get(oid, {})
    fi = fin.get(oid, {})
    sh = ship.get(oid, {})
    cp = cod.get(oid, {})
    cid = o["customer_id"]
    catatan = []
    if o["flag"] == "review":
        catatan.append("order_review")
    if it.get("status") == "review":
        catatan.append("produk_review")
    if not cid:
        catatan.append("tanpa_pelanggan")
    rows.append([
        o["source_file_id"], oid, o["order_date"],
        cid, cust_field(cid, "name"),
        cust_field(cid, "phone_normalized"),
        cust_field(cid, "city") or sh.get("ship_city", ""),
        cust_field(cid, "address"),
        prod.get(it.get("product_id", ""), it.get("original_product_name", "")),
        it.get("qty", ""), it.get("subtotal", ""),
        o["total_amount"], o["payment_method"],
        chan.get(o["channel_id"], ""), user.get(o["cs_id"], ""),
        cour.get(o["courier_id"], ""), sh.get("tracking_number", ""),
        fi.get("shipping_cost", ""), cp.get("packing_fee", ""),
        fi.get("cod_fee", ""), fi.get("hpp", ""), fi.get("invoice_number", ""),
        o["order_status"], sh.get("cod_status", ""), sh.get("return_status", ""),
        "",  # cohort tidak ada di order
        ";".join(catatan),
    ])

# ===== TRANSAKSI COHORT (04) =====
for t in load("orders/customer_transactions.csv"):
    cid = t["customer_id"]
    catatan = [] if cid else ["tanpa_pelanggan"]
    if t["status"] == "review":
        catatan.append("transaksi_review")
    rows.append([
        "04_cohort", t["transaction_id"], t["transaction_date"],
        cid, cust_field(cid, "name"), cust_field(cid, "phone_normalized"),
        cust_field(cid, "city"), cust_field(cid, "address"),
        prod.get(t["product_id"], ""), t["qty"], t["total_price"],
        t["total_price"], "",  # metode bayar tak ada di 04
        "", user.get(t["cs_id"], ""), "", "",   # channel/kurir/resi tak ada
        "", "", "", "", "",                       # ongkir..invoice tak ada
        "", "", "", t["cohort_month"],
        ";".join(catatan),
    ])

# urutkan: tanggal lalu id (tanggal kosong di akhir)
rows.sort(key=lambda r: (r[2] == "", r[2], r[1]))

dst = os.path.join(OUT, "GABUNGAN", "probetes_tersatukan.csv")
os.makedirs(os.path.dirname(dst), exist_ok=True)
with io.open(dst, "w", encoding="utf-8-sig", newline="") as f:
    w = csv.writer(f)
    w.writerow(HEADER)
    w.writerows(rows)

# ringkasan
from collections import Counter
src = Counter(r[0] for r in rows)
print(f"TOTAL baris tersatukan: {len(rows)}")
for s, n in src.most_common():
    print(f"  {s:<26} {n}")
print("File:", dst)
