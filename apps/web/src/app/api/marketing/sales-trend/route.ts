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
      SELECT to_char(o.order_date, 'YYYY-MM-DD') AS date, COUNT(*)::int AS total_order,
        COALESCE(SUM(o.total_amount), 0)::float8 AS revenue, COUNT(DISTINCT o.customer_id)::int AS unique_customer
      FROM orders.orders o WHERE ${where} GROUP BY o.order_date ORDER BY o.order_date
    `, values);
    return NextResponse.json({ success: true, data: rows, availability: { sales_trend: available() } });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Kesalahan tidak diketahui.";
    console.error("GET /api/marketing/sales-trend gagal:", err);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
