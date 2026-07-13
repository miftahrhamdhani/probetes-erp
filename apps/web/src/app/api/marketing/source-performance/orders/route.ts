import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { marketingOrderFilters, pageParams, SOURCE_AVAILABILITY, validOrderWhere } from "@/lib/marketing-query";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const filters = marketingOrderFilters(req.nextUrl.searchParams);
    const { where, values } = validOrderWhere(filters);
    const { page, limit, offset } = pageParams(req.nextUrl.searchParams);
    const totalRows = await query<{ total: number }>(`SELECT COUNT(*)::int AS total FROM orders.orders o WHERE ${where}`, values);
    const rows = await query<Record<string, unknown>>(`
      SELECT o.order_id, to_char(o.order_date, 'YYYY-MM-DD') AS order_date,
        COALESCE(c.name, 'Pelanggan tidak tercatat') AS customer_name,
        COALESCE(NULLIF(ch.channel_final_name, ''), 'Belum Tercatat') AS channel_name,
        COALESCE(NULLIF(o.divisi, ''), 'Belum Tercatat') AS divisi,
        COALESCE(u.name, 'Belum Tercatat') AS cs_name, COALESCE(o.total_amount, 0)::float8 AS total_amount
      FROM orders.orders o
      LEFT JOIN master.customers c ON c.customer_id = o.customer_id
      LEFT JOIN master.channels ch ON ch.channel_id = o.channel_id
      LEFT JOIN master.users u ON u.user_id = o.cs_id
      WHERE ${where}
      ORDER BY o.order_date DESC NULLS LAST, o.order_id DESC
      LIMIT $${values.length + 1} OFFSET $${values.length + 2}
    `, [...values, limit, offset]);
    return NextResponse.json({ success: true, data: rows, pagination: { page, limit, total: totalRows[0]?.total ?? 0 }, availability: SOURCE_AVAILABILITY });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Kesalahan tidak diketahui.";
    console.error("GET /api/marketing/source-performance/orders gagal:", err);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
