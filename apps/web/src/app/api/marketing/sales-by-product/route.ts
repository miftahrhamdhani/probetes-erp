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
      SELECT oi.product_id, COALESCE(NULLIF(p.product_final_name, ''), 'Produk belum dipetakan') AS product_name,
        COALESCE(NULLIF(p.sku, ''), '-') AS sku, COALESCE(NULLIF(p.category, ''), 'Belum Tercatat') AS category,
        COUNT(DISTINCT oi.order_id)::int AS total_order, COALESCE(SUM(oi.qty), 0)::float8 AS product_sold,
        COALESCE(SUM(COALESCE(oi.subtotal, oi.unit_price * oi.qty)), 0)::float8 AS revenue
      FROM orders.order_items oi
      JOIN orders.orders o ON o.order_id = oi.order_id
      LEFT JOIN master.products p ON p.product_id = oi.product_id
      WHERE ${where}
      GROUP BY oi.product_id, p.product_final_name, p.sku, p.category
      ORDER BY SUM(COALESCE(oi.subtotal, oi.unit_price * oi.qty)) DESC NULLS LAST, product_name
    `, values);
    return NextResponse.json({ success: true, data: rows, availability: { revenue_by_product: available(), product_sold: available() } });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Kesalahan tidak diketahui.";
    console.error("GET /api/marketing/sales-by-product gagal:", err);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
