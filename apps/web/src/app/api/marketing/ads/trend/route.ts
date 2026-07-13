import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { ADS_AVAILABILITY, adsWhere, buildAdsFilters } from "@/lib/marketing-ads";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { where, params } = adsWhere(buildAdsFilters(req.nextUrl.searchParams));
    const rows = await query<Record<string, unknown>>(`
      SELECT
        to_char(COALESCE(m.report_date, m.report_start_date), 'YYYY-MM-DD') AS date,
        SUM(m.spend)::float8 AS spend, SUM(m.purchase_value)::float8 AS purchase_value,
        SUM(m.link_clicks)::float8 AS link_clicks, SUM(m.purchases)::float8 AS purchases,
        CASE WHEN SUM(m.spend) > 0 THEN SUM(m.purchase_value) / SUM(m.spend) END AS platform_roas
      FROM marketing.ad_campaign_metrics m
      WHERE ${where}
      GROUP BY COALESCE(m.report_date, m.report_start_date)
      ORDER BY COALESCE(m.report_date, m.report_start_date)
    `, params);
    return NextResponse.json({ success: true, data: rows, availability: ADS_AVAILABILITY });
  } catch (err) {
    console.error("GET /api/marketing/ads/trend gagal:", err);
    return NextResponse.json({ error: "Gagal memuat tren iklan." }, { status: 500 });
  }
}
