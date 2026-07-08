import fs from "fs/promises";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { pool, query } from "@/lib/db";
import { workbookToXlsx } from "@/lib/xlsx";

export const dynamic = "force-dynamic";

const BACKUP_FILE = "cadangan_probetes.xls";

type SheetConfig = {
  name: string;
  sql: string;
  range?: "order" | "transaction";
  rangeColumn?: string;
};

const SHEETS: SheetConfig[] = [
  {
    name: "Semua Data",
    range: "order",
    rangeColumn: "\"Tanggal Pesanan\"",
    sql: `
      SELECT
        o.order_date AS "Tanggal Pesanan",
        o.order_id AS "ID Pesanan",
        cu.customer_id AS "ID Customer",
        cu.name AS "Nama Pelanggan",
        cu.phone AS "No HP",
        cu.city AS "Kota",
        ch.channel_final_name AS "Channel",
        u.name AS "CS",
        p.product_final_name AS "Produk",
        oi.original_product_name AS "Nama Produk Asli",
        oi.qty AS "Qty",
        oi.subtotal AS "Nilai Item",
        o.total_amount AS "Total Pesanan",
        co.cohort_month AS "Cohort",
        co.first_purchase_date AS "Beli Pertama",
        co.last_purchase_date AS "Beli Terakhir",
        co.frequency AS "Total Transaksi Customer",
        co.total_spent AS "Total Pembelian Customer",
        co.cluster AS "Cluster",
        c.courier_final_name AS "Ekspedisi",
        s.tracking_number AS "Nomor Resi",
        s.package_status AS "Status Pengiriman",
        s.cod_status AS "Status COD",
        f.reconciliation_status AS "Status Finance"
      FROM orders.orders o
      LEFT JOIN master.customers cu ON cu.customer_id = o.customer_id
      LEFT JOIN master.channels ch ON ch.channel_id = o.channel_id
      LEFT JOIN master.users u ON u.user_id = o.cs_id
      LEFT JOIN master.couriers c ON c.courier_id = o.courier_id
      LEFT JOIN orders.order_items oi ON oi.order_id = o.order_id
      LEFT JOIN master.products p ON p.product_id = oi.product_id
      LEFT JOIN master.customer_cohorts co ON co.customer_id = o.customer_id
      LEFT JOIN tracking.shipments s ON s.order_id = o.order_id
      LEFT JOIN finance.order_finance f ON f.order_id = o.order_id
    `,
  },
  { name: "Pelanggan", sql: `SELECT * FROM master.customers` },
  { name: "Produk", sql: `SELECT * FROM master.products` },
  { name: "Channel", sql: `SELECT * FROM master.channels` },
  { name: "CS Tim", sql: `SELECT * FROM master.users` },
  { name: "Ekspedisi", sql: `SELECT * FROM master.couriers` },
  {
    name: "Database Cohort",
    sql: `
      SELECT
        co.*,
        cu.name AS customer_name,
        cu.phone AS phone,
        p.product_final_name AS last_product_name,
        u.name AS last_cs_name
      FROM master.customer_cohorts co
      LEFT JOIN master.customers cu ON cu.customer_id = co.customer_id
      LEFT JOIN master.products p ON p.product_id = co.last_product_id
      LEFT JOIN master.users u ON u.user_id = co.last_cs_id
    `,
  },
  {
    name: "Riwayat Cohort",
    range: "transaction",
    sql: `
      SELECT
        ct.*,
        cu.name AS customer_name,
        u.name AS cs_name,
        p.product_final_name AS product_name
      FROM orders.customer_transactions ct
      LEFT JOIN master.customers cu ON cu.customer_id = ct.customer_id
      LEFT JOIN master.users u ON u.user_id = ct.cs_id
      LEFT JOIN master.products p ON p.product_id = ct.product_id
    `,
  },
  {
    name: "Data Tracking",
    range: "order",
    sql: `
      SELECT
        o.order_date,
        s.*,
        cu.name AS customer_name,
        c.courier_final_name AS courier_name
      FROM tracking.shipments s
      LEFT JOIN orders.orders o ON o.order_id = s.order_id
      LEFT JOIN master.customers cu ON cu.customer_id = s.customer_id
      LEFT JOIN master.couriers c ON c.courier_id = s.courier_id
    `,
  },
  {
    name: "COD Pembayaran",
    range: "order",
    sql: `
      SELECT o.order_date, cp.*
      FROM tracking.cod_payments cp
      LEFT JOIN orders.orders o ON o.order_id = cp.order_id
    `,
  },
  {
    name: "Retur Gagal Kirim",
    range: "order",
    sql: `
      SELECT
        o.order_date,
        r.*,
        cu.name AS customer_name,
        u.name AS cs_name
      FROM tracking.returns r
      LEFT JOIN orders.orders o ON o.order_id = r.order_id
      LEFT JOIN master.customers cu ON cu.customer_id = r.customer_id
      LEFT JOIN master.users u ON u.user_id = r.cs_id
    `,
  },
  {
    name: "Finance",
    range: "order",
    sql: `
      SELECT o.order_date, f.*
      FROM finance.order_finance f
      LEFT JOIN orders.orders o ON o.order_id = f.order_id
    `,
  },
  { name: "Perlu Dicek", sql: `SELECT * FROM audit.data_quality_checks` },
];

function isValidIsoDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function todayFolderName(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
}

function withRange(sheet: SheetConfig, dateFrom: string | null, dateTo: string | null): string {
  const base = sheet.sql.trim();
  if (!dateFrom && !dateTo) return base;
  if (!sheet.range) return base;

  const column = sheet.rangeColumn ?? (sheet.range === "transaction" ? "transaction_date" : "order_date");
  const conds: string[] = [];
  if (dateFrom) conds.push(`${column} >= '${dateFrom}'`);
  if (dateTo) conds.push(`${column} <= '${dateTo}'`);
  return `SELECT * FROM (${base}) backup_sheet WHERE ${conds.join(" AND ")}`;
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const triggerType = body.triggerType === "scheduled" ? "scheduled" : "manual";
  const backupMode = body.mode === "range" ? "range" : "all";
  const dateFrom: string | null = backupMode === "range" ? (body.dateFrom || null) : null;
  const dateTo: string | null = backupMode === "range" ? (body.dateTo || null) : null;

  if (backupMode === "range") {
    if (!dateFrom && !dateTo) {
      return NextResponse.json({ error: "Isi minimal salah satu tanggal (dari atau sampai)." }, { status: 400 });
    }
    if (dateFrom && !isValidIsoDate(dateFrom)) {
      return NextResponse.json({ error: "Format tanggal \"dari\" tidak valid." }, { status: 400 });
    }
    if (dateTo && !isValidIsoDate(dateTo)) {
      return NextResponse.json({ error: "Format tanggal \"sampai\" tidak valid." }, { status: 400 });
    }
    if (dateFrom && dateTo && dateFrom > dateTo) {
      return NextResponse.json({ error: "Tanggal \"dari\" tidak boleh lebih baru dari tanggal \"sampai\"." }, { status: 400 });
    }
  }

  const settingsRows = await query<{ folder_path: string }>(
    "SELECT folder_path FROM system.backup_settings WHERE id = 1",
  );
  const baseFolder = settingsRows[0]?.folder_path;
  if (!baseFolder) {
    return NextResponse.json({ error: "Folder tujuan cadangan belum diatur." }, { status: 400 });
  }

  const historyResult = await pool.query<{ id: number }>(
    `INSERT INTO system.backup_history (trigger_type, status, folder_path, backup_mode, date_from, date_to)
     VALUES ($1, 'running', $2, $3, $4, $5) RETURNING id`,
    [triggerType, baseFolder, backupMode, dateFrom, dateTo],
  );
  const historyId = historyResult.rows[0]!.id;
  const targetFolder = path.join(baseFolder, todayFolderName());

  try {
    await fs.mkdir(targetFolder, { recursive: true });

    let totalRows = 0;
    const sheets = [];
    for (const sheet of SHEETS) {
      const rows = await query(withRange(sheet, dateFrom, dateTo));
      totalRows += rows.length;
      sheets.push({
        name: sheet.name,
        subtitle: backupMode === "range" ? `${dateFrom ?? "awal"} s/d ${dateTo ?? "akhir"}` : "Semua Data",
        rows,
      });
    }

    const workbook = workbookToXlsx(sheets, "Cadangan Database Probetes ERP");
    await fs.writeFile(path.join(targetFolder, BACKUP_FILE), workbook);

    await pool.query(
      `UPDATE system.backup_history
       SET status = 'success', finished_at = now(), total_rows = $1, total_files = 1, folder_path = $2
       WHERE id = $3`,
      [totalRows, targetFolder, historyId],
    );

    return NextResponse.json({
      success: true,
      folderPath: targetFolder,
      totalRows,
      totalFiles: 1,
      fileName: BACKUP_FILE,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Kesalahan tidak diketahui.";
    await pool.query(
      `UPDATE system.backup_history
       SET status = 'failed', finished_at = now(), error_message = $1
       WHERE id = $2`,
      [message, historyId],
    );
    console.error("POST /api/backup/run gagal:", err);
    return NextResponse.json({ error: `Cadangan gagal: ${message}` }, { status: 500 });
  }
}
