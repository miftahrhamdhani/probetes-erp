import { NextRequest, NextResponse } from "next/server";
import { available } from "@/lib/availability";
import { query } from "@/lib/db";
import { marketingOrderFilters, validOrderWhere } from "@/lib/marketing-query";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const filters = marketingOrderFilters(req.nextUrl.searchParams);
    const { where, values } = validOrderWhere(filters);
    const rows = await query<Record<string, unknown>>(`
      SELECT COALESCE(o.channel_id, 'BELUM_TERCATAT') AS channel_id,
        COALESCE(NULLIF(c.channel_final_name, ''), 'Belum Tercatat') AS channel_name,
        COALESCE(NULLIF(c.platform, ''), 'Belum Tercatat') AS platform,
        COUNT(*)::int AS total_order, COALESCE(SUM(o.total_amount), 0)::float8 AS revenue,
        COUNT(DISTINCT o.customer_id)::int AS unique_customer,
        CASE WHEN COUNT(*) > 0 THEN SUM(o.total_amount)::float8 / COUNT(*) END AS aov
      FROM orders.orders o LEFT JOIN master.channels c ON c.channel_id = o.channel_id
      WHERE ${where}
      GROUP BY o.channel_id, c.channel_final_name, c.platform
      ORDER BY SUM(o.total_amount) DESC NULLS LAST, channel_name
    `, values);
    return NextResponse.json({ success: true, data: rows, availability: { revenue_by_channel: available(), order_by_channel: available() } });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Kesalahan tidak diketahui.";
    console.error("GET /api/marketing/sales-by-channel gagal:", err);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
