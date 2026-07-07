"""Validasi integritas & ringkasan output migrasi."""
import csv, io, os
from collections import Counter

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(BASE, "output")

def load(rel):
    with io.open(os.path.join(OUT, rel), "r", encoding="utf-8-sig", newline="") as f:
        r = list(csv.DictReader(f))
    return r

customers = {c["customer_id"] for c in load("master/customers.csv")}
products  = {c["product_id"] for c in load("master/products.csv")}
channels  = {c["channel_id"] for c in load("master/channels.csv")}
users     = {c["user_id"] for c in load("master/users.csv")}
couriers  = {c["courier_id"] for c in load("master/couriers.csv")}
orders    = load("orders/orders.csv")
order_ids = {o["order_id"] for o in orders}

def check_fk(rows, col, valid, label):
    bad = [r for r in rows if r[col] and r[col] not in valid]
    empty = sum(1 for r in rows if not r[col])
    status = "OK" if not bad else f"*** {len(bad)} INVALID ***"
    print(f"  {label:<40} kosong={empty:<6} {status}")
    return bad

print("=== INTEGRITAS REFERENSIAL ===")
print("orders ->")
check_fk(orders, "customer_id", customers, "orders.customer_id -> customers")
check_fk(orders, "channel_id", channels, "orders.channel_id -> channels")
check_fk(orders, "cs_id", users, "orders.cs_id -> users")
check_fk(orders, "courier_id", couriers, "orders.courier_id -> couriers")

items = load("orders/order_items.csv")
print("order_items ->")
check_fk(items, "order_id", order_ids, "order_items.order_id -> orders")
check_fk(items, "product_id", products, "order_items.product_id -> products")

for rel, col, tgt, lbl in [
    ("orders/customer_transactions.csv", "customer_id", customers, "transactions.customer_id"),
    ("tracking/shipments.csv", "order_id", order_ids, "shipments.order_id"),
    ("tracking/cod_payments.csv", "order_id", order_ids, "cod.order_id"),
    ("tracking/returns.csv", "order_id", order_ids, "returns.order_id"),
    ("finance/order_finance.csv", "order_id", order_ids, "finance.order_id"),
    ("master/customer_cohorts.csv", "customer_id", customers, "cohorts.customer_id"),
]:
    rows = load(rel)
    print(f"{rel} ->")
    check_fk(rows, col, tgt, lbl)

print("\n=== RINGKASAN KUALITAS ===")
def status_breakdown(rel, col):
    rows = load(rel)
    c = Counter(r.get(col, "") for r in rows)
    return dict(c)

print("customers.status :", status_breakdown("master/customers.csv", "status"))
print("products.status  :", status_breakdown("master/products.csv", "status"))
print("channels.status  :", status_breakdown("master/channels.csv", "status"))
print("couriers.status  :", status_breakdown("master/couriers.csv", "status"))
print("orders.flag      :", status_breakdown("orders/orders.csv", "flag"))
print("cohort.cluster   :", status_breakdown("master/customer_cohorts.csv", "cluster"))

# total nilai pesanan (validasi vs database.md overview mock)
total_order_val = sum(int(o["total_amount"]) for o in orders if o["total_amount"].lstrip("-").isdigit())
print(f"\nTotal nilai semua order  : Rp {total_order_val:,}")
print(f"Jumlah order             : {len(orders):,}")
print(f"Jumlah pelanggan unik    : {len(customers):,}")
