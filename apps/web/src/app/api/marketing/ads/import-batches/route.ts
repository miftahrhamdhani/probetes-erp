import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

interface BatchRow {
  batch_id: string;
  file_name: string;
  file_label: string | null;
  platform: string;
  product_label: string | null;
  account_code: string | null;
  advertiser_name: string | null;
  report_month: string | null;
  report_year: number | null;
  status: string;
  total_rows: number;
  success_rows: number;
  failed_rows: number;
  imported_by: string | null;
  imported_at: string;
  processed_at: string | null;
  error_message: string | null;
}

export async function GET(req: NextRequest) {
  try {
    const limit = Math.min(Math.max(Number(req.nextUrl.searchParams.get("limit") ?? 20) || 20, 1), 100);
    const rows = await query<BatchRow>(`
      SELECT batch_id, file_name, file_label, platform, product_label, account_code,
        advertiser_name, report_month, report_year, status, total_rows, success_rows,
        failed_rows, imported_by, imported_at, processed_at, error_message
      FROM marketing.ad_import_batches
      ORDER BY imported_at DESC
      LIMIT $1
    `, [limit]);
    return NextResponse.json({ success: true, data: rows });
  } catch (err) {
    console.error("GET /api/marketing/ads/import-batches gagal:", err);
    return NextResponse.json({ error: "Gagal memuat riwayat import iklan." }, { status: 500 });
  }
}
