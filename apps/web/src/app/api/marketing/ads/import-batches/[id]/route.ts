import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const batches = await query<Record<string, unknown>>(`
      SELECT b.*, COALESCE(json_agg(json_build_object(
        'metric_id', m.metric_id, 'campaign_name', m.campaign_name,
        'report_start_date', m.report_start_date, 'report_end_date', m.report_end_date,
        'spend', m.spend, 'purchases', m.purchases, 'purchase_value', m.purchase_value
      ) ORDER BY m.campaign_name) FILTER (WHERE m.metric_id IS NOT NULL), '[]') AS campaigns
      FROM marketing.ad_import_batches b
      LEFT JOIN marketing.ad_campaign_metrics m ON m.batch_id = b.batch_id
      WHERE b.batch_id = $1
      GROUP BY b.batch_id
    `, [id]);
    if (!batches[0]) return NextResponse.json({ error: "Riwayat import tidak ditemukan." }, { status: 404 });
    return NextResponse.json({ success: true, data: batches[0] });
  } catch (err) {
    console.error("GET /api/marketing/ads/import-batches/:id gagal:", err);
    return NextResponse.json({ error: "Gagal memuat detail import iklan." }, { status: 500 });
  }
}
