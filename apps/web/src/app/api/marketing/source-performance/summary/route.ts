import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { marketingOrderFilters, SOURCE_AVAILABILITY, validOrderWhere } from "@/lib/marketing-query";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const filters = marketingOrderFilters(req.nextUrl.searchParams);
    const { where, values } = validOrderWhere(filters);
    const [rows, productRows] = await Promise.all([
      query<Record<string, number>>(`
        WITH valid_orders AS (SELECT o.order_id, o.customer_id, o.total_amount FROM orders.orders o WHERE ${where}),
        item_totals AS (SELECT oi.order_id, SUM(COALESCE(oi.qty, 0)) AS qty FROM orders.order_items oi JOIN valid_orders vo ON vo.order_id = oi.order_id GROUP BY oi.order_id)
        SELECT COUNT(*)::int AS total_order, COALESCE(SUM(vo.total_amount), 0)::float8 AS revenue,
          COALESCE(SUM(it.qty), 0)::float8 AS product_sold, COUNT(DISTINCT vo.customer_id)::int AS unique_customer,
          CASE WHEN COUNT(*) > 0 THEN SUM(vo.total_amount)::float8 / COUNT(*) END AS aov
        FROM valid_orders vo LEFT JOIN item_totals it ON it.order_id = vo.order_id
      `, values),
      query<Record<string, unknown>>(`
        SELECT oi.product_id, COALESCE(NULLIF(p.product_final_name, ''), 'Produk belum dipetakan') AS product_name,
          COALESCE(SUM(oi.qty), 0)::float8 AS product_sold,
          COALESCE(SUM(COALESCE(oi.subtotal, oi.unit_price * oi.qty)), 0)::float8 AS revenue
        FROM orders.order_items oi
        JOIN orders.orders o ON o.order_id = oi.order_id
        LEFT JOIN master.products p ON p.product_id = oi.product_id
        WHERE ${where}
        GROUP BY oi.product_id, p.product_final_name
        ORDER BY SUM(COALESCE(oi.subtotal, oi.unit_price * oi.qty)) DESC NULLS LAST, product_name
        LIMIT 10
      `, values),
    ]);
    return NextResponse.json({ success: true, data: { ...(rows[0] ?? {}), top_products: productRows }, availability: SOURCE_AVAILABILITY });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Kesalahan tidak diketahui.";
    console.error("GET /api/marketing/source-performance/summary gagal:", err);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
