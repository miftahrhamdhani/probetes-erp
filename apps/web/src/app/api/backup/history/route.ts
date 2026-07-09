import fs from "fs/promises";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { workbookToExcelXml, type Sheet } from "@/lib/excel";

export const dynamic = "force-dynamic";

const BACKUP_FILE = "cadangan_probetes.xls";

const LEGACY_CSV_FILES = [
  ["Semua Data", "pesanan.csv"],
  ["Pelanggan", "pelanggan.csv"],
  ["Produk", "produk.csv"],
  ["Channel", "channel.csv"],
  ["CS Tim", "cs_tim.csv"],
  ["Ekspedisi", "ekspedisi.csv"],
  ["Database Cohort", "cohort_ringkasan.csv"],
  ["Riwayat Cohort", "cohort_riwayat_transaksi.csv"],
  ["Data Tracking", "tracking_pengiriman.csv"],
  ["COD Pembayaran", "tracking_cod.csv"],
  ["Retur Gagal Kirim", "tracking_retur.csv"],
  ["Finance", "finance.csv"],
  ["Perlu Dicek", "data_perlu_dicek.csv"],
] as const;

const SQL = `
  SELECT
    id,
    to_char(started_at, 'YYYY-MM-DD HH24:MI') AS "startedAt",
    to_char(finished_at, 'YYYY-MM-DD HH24:MI') AS "finishedAt",
    trigger_type AS "triggerType",
    status,
    folder_path AS "folderPath",
    total_rows AS "totalRows",
    total_files AS "totalFiles",
    error_message AS "errorMessage",
    backup_mode AS "backupMode",
    to_char(date_from, 'YYYY-MM-DD') AS "dateFrom",
    to_char(date_to, 'YYYY-MM-DD') AS "dateTo"
  FROM system.backup_history
  ORDER BY started_at DESC
  LIMIT 15
`;

function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;

  for (let i = 0; i < text.length; i += 1) {
    const ch = text.charAt(i);
    const next = text.charAt(i + 1);
    if (quoted) {
      if (ch === '"' && next === '"') {
        cell += '"';
        i += 1;
      } else if (ch === '"') {
        quoted = false;
      } else {
        cell += ch;
      }
    } else if (ch === '"') {
      quoted = true;
    } else if (ch === ",") {
      row.push(cell);
      cell = "";
    } else if (ch === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else if (ch !== "\r") {
      cell += ch;
    }
  }
  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }

  const headers = rows.shift()?.map((h) => h || "Kolom") ?? ["Catatan"];
  return rows.map((values) => Object.fromEntries(headers.map((header, i) => [header, values[i] ?? ""])));
}

async function buildExcelFromLegacyCsv(folderPath: string): Promise<Buffer> {
  const sheets: Sheet[] = [];
  for (const [name, file] of LEGACY_CSV_FILES) {
    const csv = await fs.readFile(path.join(folderPath, file), "utf-8").catch(() => "");
    sheets.push({
      name,
      subtitle: "Dibuat ulang dari cadangan CSV lama",
      rows: csv ? parseCsv(csv) : [],
    });
  }
  const workbook = workbookToExcelXml(sheets, "Cadangan Database Probetes ERP");
  await fs.writeFile(path.join(folderPath, BACKUP_FILE), workbook).catch(() => undefined);
  return workbook;
}

async function downloadBackupFile(req: NextRequest) {
  const id = Number(req.nextUrl.searchParams.get("id"));
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: "Cadangan tidak valid." }, { status: 400 });
  }

  const rows = await query<{ folderPath: string | null; status: string }>(
    `SELECT folder_path AS "folderPath", status FROM system.backup_history WHERE id = $1`,
    [id],
  );
  const history = rows[0];
  if (!history || history.status !== "success" || !history.folderPath) {
    return NextResponse.json({ error: "Cadangan belum tersedia." }, { status: 404 });
  }

  try {
    const bytes = await fs.readFile(path.join(history.folderPath, BACKUP_FILE));
    return new NextResponse(new Uint8Array(bytes), {
      headers: {
        "Content-Type": "application/vnd.ms-excel",
        "Content-Disposition": `attachment; filename="${BACKUP_FILE}"`,
      },
    });
  } catch {
    const workbook = await buildExcelFromLegacyCsv(history.folderPath);
    return new NextResponse(new Uint8Array(workbook), {
      headers: {
        "Content-Type": "application/vnd.ms-excel",
        "Content-Disposition": `attachment; filename="${BACKUP_FILE}"`,
      },
    });
  }
}

export async function GET(req: NextRequest) {
  try {
    if (req.nextUrl.searchParams.get("download") === "excel") return downloadBackupFile(req);
    return NextResponse.json(await query(SQL));
  } catch (err) {
    console.error("GET /api/backup/history gagal:", err);
    return NextResponse.json({ error: "Gagal memuat riwayat cadangan." }, { status: 500 });
  }
}
