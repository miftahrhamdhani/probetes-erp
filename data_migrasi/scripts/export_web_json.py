"""
Export CSV hasil migrasi -> JSON statis untuk frontend (apps/web/public/data/).
Frontend memuatnya via fetch dan melakukan pagination di browser (belum ada backend).

Aturan tampilan:
- Pelanggan: No HP DIMASKING (0822****3545).
- Cohort: No. WA ditampilkan APA ADANYA sebagai ID (permintaan owner, sesuai data asli).
"""
import csv, io, json, os

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(BASE, "output")
WEB = os.path.normpath(os.path.join(BASE, "..", "apps", "web", "public", "data"))
os.makedirs(WEB, exist_ok=True)

def load(rel):
    with io.open(os.path.join(OUT, rel), "r", encoding="utf-8-sig", newline="") as f:
        return list(csv.DictReader(f))

def dump(name, data):
    p = os.path.join(WEB, name)
    with io.open(p, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, separators=(",", ":"))
    print(f"  {name:<26} {len(data):>6} baris  {os.path.getsize(p)//1024} KB")

def to_int(s):
    try:
        return int(s)
    except (ValueError, TypeError):
        return 0

def local_phone(pn):
    """62822xxx -> 0822xxx. Kosong -> '-'."""
    if not pn:
        return "-"
    return "0" + pn[2:] if pn.startswith("62") else pn

def masked_phone(pn):
    lp = local_phone(pn)
    if lp == "-" or len(lp) < 9:
        return lp
    return lp[:4] + "****" + lp[-4:]

CUST_STATUS = {"baru": "Baru", "repeat": "Repeat", "high_value": "High Value", "review": "Perlu Dicek"}
SOURCE = {"01_database_all": "Data Pesanan", "02_probetes_non_prodig": "Data Pesanan", "04_cohort": "Data Cohort"}
JENIS = {"kategori_affiliate": "Kategori", "placeholder": "Penanda", "channel_sumber": "Sumber",
         "toko_brand": "Toko/Brand", "mitra": "Mitra", "id_nyasar": "Salah Input"}

print("Export JSON untuk frontend ->", WEB)

# ---- lookup ----
customers_raw = load("master/customers.csv")
cust_by_id = {c["customer_id"]: c for c in customers_raw}
prod_name = {p["product_id"]: p["product_final_name"] for p in load("master/products.csv")}
user_name = {u["user_id"]: u["name"] for u in load("master/users.csv")}

# ---- customers (HP dimasking; + provinsi, keputusan owner no.16) ----
dump("customers.json", [
    {
        "id": c["customer_id"],
        "name": c["name"],
        "phone": masked_phone(c["phone_normalized"]),
        "city": c["city"] or "-",
        "province": c.get("province", "") or "-",
        "source": SOURCE.get(c["source_origin"], c["source_origin"]),
        "trx": to_int(c["transaction_count"]),
        "status": CUST_STATUS.get(c["status"], c["status"]),
    }
    for c in customers_raw
])

# ---- cohort summary (No. WA tampil penuh sebagai ID; + frekuensi, owner no.17) ----
dump("cohort_summary.json", [
    {
        "wa": local_phone(cust_by_id.get(r["customer_id"], {}).get("phone_normalized", "")),
        "name": cust_by_id.get(r["customer_id"], {}).get("name", "-"),
        "cohort": r["cohort_month"] or "-",
        "first": r["first_purchase_date"] or "-",
        "last": r["last_purchase_date"] or "-",
        "freq": to_int(r["frequency"]),
        "qty": to_int(r["total_qty"]),
        "total": to_int(r["total_spent"]),
        "cluster": CUST_STATUS.get(r["cluster"], r["cluster"]),
    }
    for r in load("master/customer_cohorts.csv")
])

# ---- cohort riwayat transaksi (tanggal paling kiri, lalu TRX id, lalu No. WA) ----
# KEPUTUSAN OWNER no.12: ID Transaksi ditampilkan; baris bundling memakai TRX id sama.
dump("cohort_riwayat.json", [
    {
        "date": t["transaction_date"] or "-",
        "trx": t["transaction_id"],
        "wa": local_phone(cust_by_id.get(t["customer_id"], {}).get("phone_normalized", "")),
        "name": cust_by_id.get(t["customer_id"], {}).get("name", "-"),
        "cs": user_name.get(t["cs_id"], "-"),
        "product": prod_name.get(t["product_id"], "-"),
        "qty": to_int(t["qty"]),
        "total": to_int(t["total_price"]),
        "cohort": t["cohort_month"] or "-",
    }
    for t in load("orders/customer_transactions.csv")
])

# ---- products ----
dump("products.json", [
    {
        "id": p["product_id"],
        "name": p["product_final_name"],
        "sku": p["sku"] or "-",
        "original": p["original_names"],
        "qty": to_int(p["qty_total"]),
        "value": to_int(p["value_total"]),
        "status": "Tersedia" if p["status"] == "valid" else "Perlu dicek",
    }
    for p in load("master/products.csv")
])

# ---- channels ----
dump("channels.json", [
    {
        "id": c["channel_id"],
        "name": "Belum Tercatat" if c["channel_final_name"] == "Unknown" else c["channel_final_name"],
        "type": "-" if c["type"] == "Belum tercatat" else c["type"],
        "original": c["original_names"] or "(kosong di data lama)",
        "orders": to_int(c["order_count"]),
        "value": to_int(c["value_total"]),
        "status": "Aktif" if c["status"] == "Aktif" else "Perlu review",
    }
    for c in load("master/channels.csv")
])

# ---- mitra ----
dump("mitra.json", [
    {
        "id": m["mitra_id"],
        "name": m["mitra_final_name"],
        "original": m["original_names"],
        "orders": to_int(m["order_count"]),
        "value": to_int(m["value_total"]),
        "status": "Aktif" if m["status"] == "Aktif" else "Perlu review",
    }
    for m in load("master/mitra.csv")
])

# ---- users (CS/Tim) ----
users = [
    {
        "id": u["user_id"],
        "name": u["name"].title(),
        "role": u["role"],
        "divisi": u["division"] or "-",
        "orders": to_int(u["order_count"]),
        "status": "Perlu dicek" if "/" in u["role"] else "Aktif",
    }
    for u in load("master/users.csv")
]
users.sort(key=lambda x: -x["orders"])
dump("users.json", users)

# ---- couriers ----
couriers = [
    {
        "id": c["courier_id"],
        "name": c["courier_final_name"],
        "original": c["original_names"],
        "service": c["service_type"] or "-",
        "orders": to_int(c["order_count"]),
        "status": "Aktif" if c["status"] == "Aktif" else "Perlu dicek",
    }
    for c in load("master/couriers.csv")
]
couriers.sort(key=lambda x: -x["orders"])
dump("couriers.json", couriers)

# ---- sumber lain (bukan nama orang) ----
dump("sumber_lain.json", [
    {"name": s["nama"], "jenis": JENIS.get(s["jenis"], s["jenis"]), "orders": to_int(s["order_count"])}
    for s in load("master/sumber_lain.csv")
])

print("Selesai.")
