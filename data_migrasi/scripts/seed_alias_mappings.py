# -*- coding: utf-8 -*-
"""Seed alias produk/channel dari output staging ke tabel alias PostgreSQL.
Aman diulang: nama alias yang sama di-update, tidak diduplikasi.
Jalankan setelah schema_master_data_migration_03.sql.
"""
import csv
import io
import os
import sys

try:
    import psycopg2
except ImportError:
    sys.exit("psycopg2 belum terpasang: pip install psycopg2-binary")

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
ENV_PATH = os.path.join(ROOT, "apps", "web", ".env.local")
MAPPINGS = (
    ("data_migrasi/output/staging/mapping_produk.csv", "master.product_aliases", "product_id"),
    ("data_migrasi/output/staging/mapping_channel.csv", "master.channel_aliases", "channel_id"),
)


def database_url():
    with io.open(ENV_PATH, encoding="utf-8") as fh:
        for line in fh:
            if line.startswith("DATABASE_URL="):
                return line.split("=", 1)[1].strip()
    raise RuntimeError("DATABASE_URL tidak ditemukan.")


def main():
    con = psycopg2.connect(database_url())
    try:
        with con.cursor() as cur:
            for relative, table, entity_col in MAPPINGS:
                path = os.path.join(ROOT, relative)
                total = 0
                with io.open(path, encoding="utf-8-sig", newline="") as fh:
                    for row in csv.DictReader(fh):
                        original = (row.get("nama_asli") or "").strip()
                        entity_id = (row.get(entity_col) or "").strip()
                        status = (row.get("status") or "review").strip()
                        if not original or not entity_id:
                            continue
                        cur.execute(
                            f"INSERT INTO {table} (original_name, {entity_col}, status, source) "
                            f"VALUES (%s,%s,%s,'migrasi_awal') "
                            f"ON CONFLICT (original_name) DO UPDATE SET {entity_col}=EXCLUDED.{entity_col}, "
                            "status=EXCLUDED.status, source=EXCLUDED.source, updated_at=now()",
                            (original, entity_id, status),
                        )
                        total += 1
                print(f"{table}: {total} alias diproses")
        con.commit()
    except Exception:
        con.rollback()
        raise
    finally:
        con.close()


if __name__ == "__main__":
    main()
