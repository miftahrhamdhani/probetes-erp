import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { ADS_AVAILABILITY, adsWhere, buildAdsFilters } from "@/lib/marketing-ads";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { where, params } = adsWhere(buildAdsFilters(req.nextUrl.searchParams));
    const rows = await query<{ impressions: number; link_clicks: number; landing_page_views: number; checkout_started: number; purchases: number }>(`
      SELECT COALESCE(SUM(m.impressions), 0)::float8 AS impressions,
        COALESCE(SUM(m.link_clicks), 0)::float8 AS link_clicks,
        COALESCE(SUM(m.landing_page_views), 0)::float8 AS landing_page_views,
        COALESCE(SUM(m.checkout_started), 0)::float8 AS checkout_started,
        COALESCE(SUM(m.purchases), 0)::float8 AS purchases
      FROM marketing.ad_campaign_metrics m WHERE ${where}
    `, params);
    const data = rows[0] ?? { impressions: 0, link_clicks: 0, landing_page_views: 0, checkout_started: 0, purchases: 0 };
    return NextResponse.json({ success: true, data: [
      { label: "Impresi", value: data.impressions }, { label: "Klik Tautan", value: data.link_clicks },
      { label: "Tayangan Halaman", value: data.landing_page_views }, { label: "Mulai Checkout", value: data.checkout_started },
      { label: "Pembelian", value: data.purchases },
    ], availability: ADS_AVAILABILITY });
  } catch (err) {
    console.error("GET /api/marketing/ads/funnel gagal:", err);
    return NextResponse.json({ error: "Gagal memuat funnel iklan." }, { status: 500 });
  }
}
