"""
Migrasi CSV hasil olahan -> PostgreSQL (database probetes_erp).

Cara pakai:
    set PGPASSWORD (lewat argumen --password atau env var PGPASSWORD), lalu:
    python load_to_postgres.py --host localhost --port 5432 --user postgres \
        --password RAHASIA --dbname probetes_erp --create-db --schema

Langkah:
    1. (opsional --create-db) buat database probetes_erp bila belum ada.
    2. (opsional --schema)    jalankan schema.sql (drop+create semua tabel).
    3. Selalu: load semua CSV ke tabelnya, urut sesuai foreign key.

Aman diulang: --schema meng-drop tabel dulu, jadi load tidak menggandakan data.
"""
import argparse
import csv
import io
import os
import sys

try:
    import psycopg2
    from psycopg2.extras import execute_values
except ImportError:
    sys.exit("psycopg2 belum terpasang. Jalankan: pip install psycopg2-binary")

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # data_migrasi/
OUT = os.path.join(BASE, "output")
SCHEMA_SQL = os.path.join(os.path.dirname(os.path.abspath(__file__)), "schema.sql")

INT = "int"
BIG = "big"
DATE = "date"
TXT = "txt"
BOOL = "bool"


def col(t):
    return t


# (tabel, file, [(kolom_csv, kolom_db, tipe), ...])  -- urut sesuai FK
TABLES = [
    ("master.customers", "master/customers.csv", [
        ("customer_id", TXT), ("name", TXT), ("phone", TXT), ("phone_normalized", TXT),
        ("address", TXT), ("city", TXT), ("province", TXT), ("source_origin", TXT),
        ("channel_id", TXT), ("cs_id", TXT), ("transaction_count", INT), ("status", TXT),
        ("is_crm_target", BOOL), ("in_wa_group", BOOL),
    ]),
    ("master.products", "master/products.csv", [
        ("product_id", TXT), ("product_final_name", TXT), ("sku", TXT), ("original_names", TXT),
        ("category", TXT), ("product_line", TXT), ("qty_total", BIG), ("value_total", BIG), ("status", TXT),
    ]),
    ("master.channels", "master/channels.csv", [
        ("channel_id", TXT), ("channel_final_name", TXT), ("type", TXT), ("original_names", TXT),
        ("platform", TXT), ("order_count", INT), ("value_total", BIG), ("status", TXT),
    ]),
    ("master.couriers", "master/couriers.csv", [
        ("courier_id", TXT), ("courier_final_name", TXT), ("original_names", TXT),
        ("service_type", TXT), ("order_count", INT), ("tracking_count", INT), ("status", TXT),
    ]),
    ("master.users", "master/users.csv", [
        ("user_id", TXT), ("name", TXT), ("role", TXT), ("division", TXT), ("main_channel", TXT),
        ("customer_count", INT), ("order_count", INT), ("value_total", BIG), ("status", TXT),
    ]),
    ("master.mitra", "master/mitra.csv", [
        ("mitra_id", TXT), ("mitra_final_name", TXT), ("original_names", TXT),
        ("order_count", INT), ("value_total", BIG), ("status", TXT),
    ]),
    ("master.sumber_lain", "master/sumber_lain.csv", [
        ("source_id", TXT), ("nama", TXT), ("jenis", TXT), ("order_count", INT),
    ]),
    ("master.customer_cohorts", "master/customer_cohorts.csv", [
        ("customer_id", TXT), ("cohort_month", TXT), ("first_purchase_date", DATE),
        ("last_purchase_date", DATE), ("frequency", INT), ("total_qty", BIG),
        ("total_spent", BIG), ("last_product_id", TXT), ("last_cs_id", TXT), ("cluster", TXT),
        ("recency_days", INT), ("r_score", INT), ("f_score", INT), ("m_score", INT),
        ("rfm_segment", TXT),
    ]),
    ("orders.orders", "orders/orders.csv", [
        ("order_id", TXT), ("customer_id", TXT), ("order_date", DATE), ("channel_id", TXT),
        ("divisi", TXT), ("cs_id", TXT), ("courier_id", TXT), ("mitra_id", TXT),
        ("payment_method", TXT), ("total_amount", BIG), ("order_status", TXT),
        ("source_file_id", TXT), ("flag", TXT),
    ]),
    ("orders.order_items", "orders/order_items.csv", [
        ("order_item_id", TXT), ("order_id", TXT), ("product_id", TXT),
        ("original_product_name", TXT), ("qty", INT), ("unit_price", BIG),
        ("subtotal", BIG), ("status", TXT),
    ]),
    # customer_transactions: PK sintetis row_id (auto). product_id PRD-095 -> NULL (fix ref).
    ("orders.customer_transactions", "orders/customer_transactions.csv", [
        ("transaction_id", TXT), ("order_id", TXT), ("transaction_date", DATE),
        ("customer_id", TXT), ("cs_id", TXT), ("product_id", TXT), ("qty", INT),
        ("total_price", BIG), ("cohort_month", TXT), ("status", TXT),
    ]),
    ("tracking.shipments", "tracking/shipments.csv", [
        ("shipment_id", TXT), ("order_id", TXT), ("tracking_number", TXT), ("customer_id", TXT),
        ("ship_city", TXT), ("courier_id", TXT), ("package_status", TXT), ("payment_method", TXT),
        ("shipping_cost", BIG), ("cod_status", TXT), ("return_status", TXT), ("flag", TXT),
    ]),
    ("tracking.cod_payments", "tracking/cod_payments.csv", [
        ("cod_payment_id", TXT), ("order_id", TXT), ("payment_method", TXT), ("total_payment", BIG),
        ("shipping_cost", BIG), ("packing_fee", BIG), ("cod_fee", BIG), ("cod_status", TXT),
        ("settled_date", DATE), ("check_status", TXT),
    ]),
    ("tracking.returns", "tracking/returns.csv", [
        ("return_id", TXT), ("order_id", TXT), ("tracking_number", TXT), ("customer_id", TXT),
        ("city", TXT), ("issue_type", TXT), ("reason", TXT), ("cs_id", TXT),
        ("follow_up_action", TXT), ("status", TXT),
    ]),
    ("finance.order_finance", "finance/order_finance.csv", [
        ("finance_id", TXT), ("order_id", TXT), ("invoice_number", TXT), ("total_payment", BIG),
        ("hpp", BIG), ("shipping_cost", BIG), ("cod_fee", BIG), ("logistic_fee", BIG),
        ("settled_amount", BIG), ("reconciliation_status", TXT), ("note", TXT),
    ]),
    # audit: PK sintetis check_id (auto) -> tidak diisi dari CSV.
    ("audit.data_quality_checks", "audit/data_quality_checks.csv", [
        ("area", TXT), ("data_checked", TXT), ("issue_example", TXT),
        ("status", TXT), ("action", TXT), ("related_id", TXT),
    ]),
]

# Referensi valid untuk membersihkan FK yatim (mis. PRD-095 di customer_transactions).
def load_valid_ids():
    def ids(rel, c):
        with io.open(os.path.join(OUT, rel), encoding="utf-8-sig", newline="") as fh:
            return set(r[c] for r in csv.DictReader(fh) if r[c])
    return {
        "product_id": ids("master/products.csv", "product_id"),
        "customer_id": ids("master/customers.csv", "customer_id"),
        "user_id": ids("master/users.csv", "user_id"),
        "channel_id": ids("master/channels.csv", "channel_id"),
        "courier_id": ids("master/couriers.csv", "courier_id"),
        "mitra_id": ids("master/mitra.csv", "mitra_id"),
        "order_id": ids("orders/orders.csv", "order_id"),
    }

# kolom_csv -> daftar id valid untuk dibersihkan (kalau tak cocok -> NULL)
FK_CLEAN = {
    "orders.customer_transactions": {"product_id": "product_id", "cs_id": "user_id",
                                     "customer_id": "customer_id"},
    "master.customer_cohorts": {"last_product_id": "product_id", "last_cs_id": "user_id"},
}


def conv(val, typ, valid_set):
    if val is None or val == "":
        return None
    if typ in (INT, BIG):
        try:
            return int(float(val))
        except (ValueError, TypeError):
            return None
    if typ == BOOL:
        s = str(val).strip().lower()
        if s in ("true", "1", "ya", "t"):
            return True
        if s in ("false", "0", "tidak", "f"):
            return False
        return None
    if typ == DATE:
        return val  # sudah format YYYY-MM-DD; psycopg2 cast otomatis, kosong->None
    if valid_set is not None and val not in valid_set:
        return None
    return val


def run_sql_file(cur, path):
    with io.open(path, encoding="utf-8") as fh:
        cur.execute(fh.read())


def drop_all(cur):
    cur.execute("""
        DROP SCHEMA IF EXISTS audit CASCADE;
        DROP SCHEMA IF EXISTS finance CASCADE;
        DROP SCHEMA IF EXISTS tracking CASCADE;
        DROP SCHEMA IF EXISTS orders CASCADE;
        DROP SCHEMA IF EXISTS master CASCADE;
    """)


def load_table(cur, table, rel, cols, valids):
    path = os.path.join(OUT, rel)
    fk_map = FK_CLEAN.get(table, {})
    db_cols = [c for c, _ in cols]
    rows = []
    with io.open(path, encoding="utf-8-sig", newline="") as fh:
        for r in csv.DictReader(fh):
            out = []
            for c, typ in cols:
                vs = valids.get(fk_map[c]) if c in fk_map else None
                out.append(conv(r.get(c), typ, vs))
            rows.append(out)
    collist = ", ".join(db_cols)
    sql = f"INSERT INTO {table} ({collist}) VALUES %s"
    execute_values(cur, sql, rows, page_size=1000)
    return len(rows)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--host", default="localhost")
    ap.add_argument("--port", default="5432")
    ap.add_argument("--user", default="postgres")
    ap.add_argument("--password", default=os.environ.get("PGPASSWORD", ""))
    ap.add_argument("--dbname", default="probetes_erp")
    ap.add_argument("--create-db", action="store_true", help="buat database bila belum ada")
    ap.add_argument("--schema", action="store_true", help="drop + create semua tabel dulu")
    args = ap.parse_args()

    if args.create_db:
        con = psycopg2.connect(host=args.host, port=args.port, user=args.user,
                               password=args.password, dbname="postgres")
        con.autocommit = True
        with con.cursor() as cur:
            cur.execute("SELECT 1 FROM pg_database WHERE datname=%s", (args.dbname,))
            if cur.fetchone():
                print(f"Database {args.dbname} sudah ada.")
            else:
                cur.execute(f'CREATE DATABASE "{args.dbname}"')
                print(f"Database {args.dbname} dibuat.")
        con.close()

    con = psycopg2.connect(host=args.host, port=args.port, user=args.user,
                           password=args.password, dbname=args.dbname)
    con.autocommit = False
    valids = load_valid_ids()
    try:
        with con.cursor() as cur:
            if args.schema:
                print("Menyiapkan skema (drop + create)...")
                drop_all(cur)
                run_sql_file(cur, SCHEMA_SQL)
            print("Memuat data:")
            total = 0
            for table, rel, cols in TABLES:
                n = load_table(cur, table, rel, cols, valids)
                total += n
                print(f"  {table:<32} {n:>7} baris")
        con.commit()
        print(f"Selesai. Total {total} baris masuk ke {args.dbname}.")
    except Exception:
        con.rollback()
        raise
    finally:
        con.close()


if __name__ == "__main__":
    main()
