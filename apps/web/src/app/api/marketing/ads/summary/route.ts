import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { ADS_AVAILABILITY, adsWhere, buildAdsFilters } from "@/lib/marketing-ads";

export const dynamic = "force-dynamic";

interface SummaryRow {
  spend: number; impressions: number; reach: number; link_clicks: number; landing_page_views: number;
  checkout_started: number; purchases: number; purchase_value: number; leads: number; add_to_cart: number;
}

export async function GET(req: NextRequest) {
  try {
    const { where, params } = adsWhere(buildAdsFilters(req.nextUrl.searchParams));
    const rows = await query<SummaryRow>(`
      SELECT
        COALESCE(SUM(m.spend), 0)::float8 AS spend,
        COALESCE(SUM(m.impressions), 0)::float8 AS impressions,
        COALESCE(SUM(m.reach), 0)::float8 AS reach,
        COALESCE(SUM(m.link_clicks), 0)::float8 AS link_clicks,
        COALESCE(SUM(m.landing_page_views), 0)::float8 AS landing_page_views,
        COALESCE(SUM(m.checkout_started), 0)::float8 AS checkout_started,
        COALESCE(SUM(m.purchases), 0)::float8 AS purchases,
        COALESCE(SUM(m.purchase_value), 0)::float8 AS purchase_value,
        COALESCE(SUM(m.leads), 0)::float8 AS leads,
        COALESCE(SUM(m.add_to_cart), 0)::float8 AS add_to_cart
      FROM marketing.ad_campaign_metrics m WHERE ${where}
    `, params);
    const base = rows[0] ?? { spend: 0, impressions: 0, reach: 0, link_clicks: 0, landing_page_views: 0, checkout_started: 0, purchases: 0, purchase_value: 0, leads: 0, add_to_cart: 0 };
    const divide = (a: number, b: number, multiplier = 1) => b > 0 ? (a / b) * multiplier : null;
    return NextResponse.json({
      success: true,
      data: {
        ...base,
        ctr_link: divide(base.link_clicks, base.impressions, 100),
        cpc_link: divide(base.spend, base.link_clicks),
        cpm: divide(base.spend, base.impressions, 1000),
        cost_per_landing_page_view: divide(base.spend, base.landing_page_views),
        cost_per_checkout: divide(base.spend, base.checkout_started),
        cost_per_purchase: divide(base.spend, base.purchases),
        platform_roas: divide(base.purchase_value, base.spend),
        cost_per_lead: divide(base.spend, base.leads),
        checkout_to_purchase_rate: divide(base.purchases, base.checkout_started, 100),
        click_to_purchase_rate: divide(base.purchases, base.link_clicks, 100),
        landing_page_view_rate: divide(base.landing_page_views, base.link_clicks, 100),
      },
      availability: ADS_AVAILABILITY,
    });
  } catch (err) {
    console.error("GET /api/marketing/ads/summary gagal:", err);
    return NextResponse.json({ error: "Gagal memuat ringkasan iklan." }, { status: 500 });
  }
}
