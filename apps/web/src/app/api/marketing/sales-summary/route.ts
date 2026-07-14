import { NextRequest, NextResponse } from "next/server";
import { notAvailable, partial, available } from "@/lib/availability";
import { query } from "@/lib/db";
import { marketingOrderFilters, validOrderWhere } from "@/lib/marketing-query";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const filters = marketingOrderFilters(req.nextUrl.searchParams);
    const { where, values } = validOrderWhere(filters);
    const [summaryRows, repeatRows, returnRows, csRows, divisionRows] = await Promise.all([
      query<Record<string, number>>(`
        WITH valid_orders AS (SELECT o.order_id, o.customer_id, o.total_amount FROM orders.orders o WHERE ${where}),
        item_totals AS (SELECT oi.order_id, SUM(COALESCE(oi.qty, 0)) AS qty FROM orders.order_items oi JOIN valid_orders vo ON vo.order_id = oi.order_id GROUP BY oi.order_id)
        SELECT COUNT(*)::int AS total_order, COALESCE(SUM(vo.total_amount), 0)::float8 AS revenue,
          COALESCE(SUM(it.qty), 0)::float8 AS total_qty, COUNT(DISTINCT vo.customer_id)::int AS unique_customer,
          CASE WHEN COUNT(*) > 0 THEN SUM(vo.total_amount)::float8 / COUNT(*) END AS aov
        FROM valid_orders vo LEFT JOIN item_totals it ON it.order_id = vo.order_id
      `, values),
      query<{ repeat_customer: number }>(`
        WITH valid_orders AS (SELECT o.customer_id FROM orders.orders o WHERE ${where})
        SELECT COUNT(*)::int AS repeat_customer FROM (SELECT customer_id FROM valid_orders WHERE customer_id IS NOT NULL GROUP BY customer_id HAVING COUNT(*) >= 2) customers
      `, values),
      query<Record<string, number>>(`
        WITH valid_orders AS (SELECT o.order_id FROM orders.orders o WHERE ${where}), shipments AS (
          SELECT DISTINCT s.shipment_id, s.order_id, lower(COALESCE(s.package_status, '')) AS package_status
          FROM tracking.shipments s JOIN valid_orders vo ON vo.order_id = s.order_id
        )
        SELECT COUNT(*)::int AS total_shipment,
          COUNT(*) FILTER (WHERE package_status = 'retur')::int AS retur_count,
          CASE WHEN COUNT(*) > 0 THEN COUNT(*) FILTER (WHERE package_status = 'retur')::float8 / COUNT(*) * 100 END AS retur_rate
        FROM shipments
      `, values),
      query<Record<string, unknown>>(`
        SELECT COALESCE(NULLIF(u.name, ''), 'Belum Tercatat') AS name, COALESCE(NULLIF(o.divisi, ''), 'Belum Tercatat') AS divisi,
          COUNT(*)::int AS total_order, COALESCE(SUM(o.total_amount), 0)::float8 AS revenue,
          CASE WHEN COUNT(*) > 0 THEN SUM(o.total_amount)::float8 / COUNT(*) END AS aov
        FROM orders.orders o LEFT JOIN master.users u ON u.user_id = o.cs_id WHERE ${where}
        GROUP BY u.name, o.divisi ORDER BY SUM(o.total_amount) DESC NULLS LAST LIMIT 10
      `, values),
      query<Record<string, unknown>>(`
        SELECT COALESCE(NULLIF(o.divisi, ''), 'Belum Tercatat') AS divisi, COUNT(*)::int AS total_order,
          COALESCE(SUM(o.total_amount), 0)::float8 AS revenue,
          CASE WHEN COUNT(*) > 0 THEN SUM(o.total_amount)::float8 / COUNT(*) END AS aov
        FROM orders.orders o WHERE ${where} GROUP BY o.divisi ORDER BY SUM(o.total_amount) DESC NULLS LAST
      `, values),
    ]);
    return NextResponse.json({
      success: true,
      data: { ...(summaryRows[0] ?? {}), repeat_customer: repeatRows[0]?.repeat_customer ?? 0, retur: returnRows[0] ?? { total_shipment: 0, retur_count: 0, retur_rate: null }, cs_performance: csRows, divisi_performance: divisionRows },
      availability: {
        total_order: available(), revenue: available(), total_qty: available(), aov: available(), unique_customer: available(), repeat_customer: available(),
        retur_rate: partial("Status retur tersedia dari pengiriman, tetapi filter memakai tanggal pesanan karena tanggal retur belum tersedia."),
        paid_order_rate: partial("payment_status belum tersedia."), cancel_rate: notAvailable("Nilai cancelled tidak tersedia konsisten."),
        net_revenue: partial("Finance masih parsial."), margin: partial("Finance masih parsial."),
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Kesalahan tidak diketahui.";
    console.error("GET /api/marketing/sales-summary gagal:", err);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
