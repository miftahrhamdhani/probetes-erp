import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { ADS_AVAILABILITY, adsWhere, buildAdsFilters } from "@/lib/marketing-ads";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const filters = buildAdsFilters(req.nextUrl.searchParams);
    const { where, params } = adsWhere(filters);
    const search = req.nextUrl.searchParams.get("search")?.trim();
    const limit = Math.min(Math.max(Number(req.nextUrl.searchParams.get("limit") ?? 50) || 50, 1), 100);
    const page = Math.max(Number(req.nextUrl.searchParams.get("page") ?? 1) || 1, 1);
    const fullWhere = search ? `${where} AND m.campaign_name ILIKE $${params.length + 1}` : where;
    const fullParams = search ? [...params, `%${search}%`] : params;
    const offsetParam = fullParams.length + 1;
    const limitParam = fullParams.length + 2;

    const rows = await query<Record<string, unknown>>(`
      SELECT
        m.campaign_name, MAX(m.product_label) AS product_label, MAX(m.advertiser_name) AS advertiser_name,
        MAX(m.account_code) AS account_code, MAX(m.platform) AS platform,
        MAX(m.campaign_delivery_status) AS campaign_delivery_status,
        SUM(m.spend)::float8 AS spend, SUM(m.impressions)::float8 AS impressions,
        SUM(m.reach)::float8 AS reach, SUM(m.link_clicks)::float8 AS link_clicks,
        SUM(m.landing_page_views)::float8 AS landing_page_views,
        SUM(m.checkout_started)::float8 AS checkout_started, SUM(m.purchases)::float8 AS purchases,
        SUM(m.purchase_value)::float8 AS purchase_value, SUM(m.leads)::float8 AS leads,
        CASE WHEN SUM(m.impressions) > 0 THEN SUM(m.link_clicks) / SUM(m.impressions) * 100 END AS ctr_link,
        CASE WHEN SUM(m.link_clicks) > 0 THEN SUM(m.spend) / SUM(m.link_clicks) END AS cpc_link,
        CASE WHEN SUM(m.impressions) > 0 THEN SUM(m.spend) / SUM(m.impressions) * 1000 END AS cpm,
        CASE WHEN SUM(m.purchases) > 0 THEN SUM(m.spend) / SUM(m.purchases) END AS cost_per_purchase,
        CASE WHEN SUM(m.spend) > 0 THEN SUM(m.purchase_value) / SUM(m.spend) END AS platform_roas,
        CASE WHEN SUM(m.leads) > 0 THEN SUM(m.spend) / SUM(m.leads) END AS cost_per_lead
      FROM marketing.ad_campaign_metrics m
      WHERE ${fullWhere}
      GROUP BY m.campaign_name
      ORDER BY SUM(m.spend) DESC, m.campaign_name
      OFFSET $${offsetParam} LIMIT $${limitParam}
    `, [...fullParams, (page - 1) * limit, limit]);
    const totalRows = await query<{ total: number }>(`
      SELECT COUNT(DISTINCT m.campaign_name)::int AS total
      FROM marketing.ad_campaign_metrics m WHERE ${fullWhere}
    `, fullParams);
    return NextResponse.json({ success: true, data: rows, pagination: { page, limit, total: totalRows[0]?.total ?? 0 }, availability: ADS_AVAILABILITY });
  } catch (err) {
    console.error("GET /api/marketing/ads/campaigns gagal:", err);
    return NextResponse.json({ error: "Gagal memuat performa kampanye." }, { status: 500 });
  }
}
