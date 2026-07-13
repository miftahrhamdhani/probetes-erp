import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { marketingOrderFilters, SOURCE_AVAILABILITY, validOrderWhere } from "@/lib/marketing-query";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const filters = marketingOrderFilters(req.nextUrl.searchParams);
    const { where, values } = validOrderWhere(filters);
    const rows = await query<Record<string, unknown>>(`
      WITH valid_orders AS (
        SELECT o.order_id, o.customer_id, o.divisi, o.total_amount FROM orders.orders o WHERE ${where}
      ), item_totals AS (
        SELECT oi.order_id, SUM(COALESCE(oi.qty, 0)) AS qty FROM orders.order_items oi
        JOIN valid_orders vo ON vo.order_id = oi.order_id GROUP BY oi.order_id
      )
      SELECT COALESCE(NULLIF(vo.divisi, ''), 'Belum Tercatat') AS divisi,
        COUNT(*)::int AS total_order, COALESCE(SUM(vo.total_amount), 0)::float8 AS revenue,
        COALESCE(SUM(it.qty), 0)::float8 AS product_sold, COUNT(DISTINCT vo.customer_id)::int AS unique_customer,
        CASE WHEN COUNT(*) > 0 THEN SUM(vo.total_amount)::float8 / COUNT(*) END AS aov
      FROM valid_orders vo LEFT JOIN item_totals it ON it.order_id = vo.order_id
      GROUP BY vo.divisi ORDER BY SUM(vo.total_amount) DESC, divisi
    `, values);
    return NextResponse.json({ success: true, data: rows, availability: SOURCE_AVAILABILITY });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Kesalahan tidak diketahui.";
    console.error("GET /api/marketing/source-performance/by-divisi gagal:", err);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
