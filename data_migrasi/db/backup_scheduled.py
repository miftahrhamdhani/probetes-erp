"""
Cadangan otomatis Probetes ERP. Dipanggil harian oleh Task Scheduler Windows;
script ini sendiri yang memutuskan apakah hari ini perlu backup, berdasarkan
jadwal (manual/daily/weekly/monthly) yang tersimpan di system.backup_settings.

Cara pakai manual:
    python backup_scheduled.py

Untuk Task Scheduler, jadwalkan trigger HARIAN (setiap hari, jam berapa pun,
misal 02:00) yang menjalankan program ini. Script akan otomatis skip kalau
jadwalnya "manual" atau kalau hari ini bukan hari yang cocok (weekly=Senin,
monthly=tanggal 1).
"""
import csv
import datetime
import io
import os
import sys

try:
    import psycopg2
except ImportError:
    sys.exit("psycopg2 belum terpasang. Jalankan: pip install psycopg2-binary")

DB = dict(host="127.0.0.1", port=5432, user="postgres", password="5Mperbulan", dbname="probetes_erp")

TABLES = [
    ("master", "customers", "pelanggan.csv"),
    ("master", "products", "produk.csv"),
    ("master", "channels", "channel.csv"),
    ("master", "couriers", "ekspedisi.csv"),
    ("master", "users", "cs_tim.csv"),
    ("master", "mitra", "mitra.csv"),
    ("master", "sumber_lain", "sumber_lain.csv"),
    ("master", "customer_cohorts", "cohort_ringkasan.csv"),
    ("orders", "orders", "pesanan.csv"),
    ("orders", "order_items", "item_pesanan.csv"),
    ("orders", "customer_transactions", "cohort_riwayat_transaksi.csv"),
    ("tracking", "shipments", "tracking_pengiriman.csv"),
    ("tracking", "cod_payments", "tracking_cod.csv"),
    ("tracking", "returns", "tracking_retur.csv"),
    ("finance", "order_finance", "finance.csv"),
    ("audit", "data_quality_checks", "data_perlu_dicek.csv"),
]


def schedule_matches_today(schedule: str, today: datetime.date) -> bool:
    if schedule == "manual":
        return False
    if schedule == "daily":
        return True
    if schedule == "weekly":
        return today.weekday() == 0  # Senin
    if schedule == "monthly":
        return today.day == 1
    return False


def run_backup(conn, base_folder: str, trigger_type: str) -> None:
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO system.backup_history (trigger_type, status, folder_path) "
        "VALUES (%s, 'running', %s) RETURNING id",
        (trigger_type, base_folder),
    )
    history_id = cur.fetchone()[0]
    conn.commit()

    now = datetime.datetime.now()
    folder_name = now.strftime("%Y-%m-%d_%H%M%S")
    target_folder = os.path.join(base_folder, folder_name)

    try:
        os.makedirs(target_folder, exist_ok=True)
        total_rows = 0
        total_files = 0
        for schema, table, filename in TABLES:
            cur.execute(f"SELECT * FROM {schema}.{table}")
            cols = [d[0] for d in cur.description]
            rows = cur.fetchall()
            with io.open(os.path.join(target_folder, filename), "w", encoding="utf-8", newline="") as f:
                writer = csv.writer(f)
                writer.writerow(cols)
                writer.writerows(rows)
            total_rows += len(rows)
            total_files += 1

        cur.execute(
            "UPDATE system.backup_history SET status='success', finished_at=now(), "
            "total_rows=%s, total_files=%s, folder_path=%s WHERE id=%s",
            (total_rows, total_files, target_folder, history_id),
        )
        conn.commit()
        print(f"Backup selesai: {total_files} file, {total_rows} baris -> {target_folder}")
    except Exception as e:
        conn.rollback()
        cur.execute(
            "UPDATE system.backup_history SET status='failed', finished_at=now(), "
            "error_message=%s WHERE id=%s",
            (str(e), history_id),
        )
        conn.commit()
        print(f"Backup GAGAL: {e}")
        raise


def main():
    conn = psycopg2.connect(**DB)
    try:
        cur = conn.cursor()
        cur.execute("SELECT schedule, folder_path FROM system.backup_settings WHERE id=1")
        row = cur.fetchone()
        if not row:
            print("Pengaturan cadangan belum ada. Buka halaman Status Cadangan dulu.")
            return
        schedule, folder_path = row

        today = datetime.date.today()
        if not schedule_matches_today(schedule, today):
            print(f"Jadwal '{schedule}', hari ini ({today}) tidak cocok. Dilewati.")
            return

        print(f"Jadwal '{schedule}' cocok untuk hari ini. Menjalankan backup ke {folder_path}...")
        run_backup(conn, folder_path, "scheduled")
    finally:
        conn.close()


if __name__ == "__main__":
    main()
