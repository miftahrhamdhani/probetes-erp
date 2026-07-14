import { NextRequest, NextResponse } from "next/server";
import { available } from "@/lib/availability";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const rows = await query<Record<string, unknown>>(`
      SELECT o.order_id, to_char(o.order_date, 'YYYY-MM-DD') AS order_date, o.total_amount::float8 AS total_amount,
        COALESCE(cu.name, 'Pelanggan tidak tercatat') AS customer_name,
        COALESCE(NULLIF(ch.channel_final_name, ''), 'Belum Tercatat') AS channel_name,
        COALESCE(u.name, 'Belum Tercatat') AS cs_name,
        COALESCE(json_agg(json_build_object(
          'product_id', oi.product_id, 'product_name', COALESCE(NULLIF(p.product_final_name, ''), 'Produk belum dipetakan'),
          'qty', oi.qty, 'subtotal', COALESCE(oi.subtotal, oi.unit_price * oi.qty)
        ) ORDER BY oi.order_item_id) FILTER (WHERE oi.order_item_id IS NOT NULL), '[]') AS items
      FROM orders.orders o
      LEFT JOIN master.customers cu ON cu.customer_id = o.customer_id
      LEFT JOIN master.channels ch ON ch.channel_id = o.channel_id
      LEFT JOIN master.users u ON u.user_id = o.cs_id
      LEFT JOIN orders.order_items oi ON oi.order_id = o.order_id
      LEFT JOIN master.products p ON p.product_id = oi.product_id
      WHERE o.order_id = $1 AND o.flag = 'valid'
      GROUP BY o.order_id, cu.name, ch.channel_final_name, u.name
    `, [id]);
    if (!rows[0]) return NextResponse.json({ error: "Pesanan valid tidak ditemukan." }, { status: 404 });
    return NextResponse.json({ success: true, data: rows[0], availability: { sales_order_detail: available() } });
  } catch (err) {
    console.error("GET /api/marketing/sales-orders/:id gagal:", err);
    return NextResponse.json({ error: "Gagal memuat detail pesanan." }, { status: 500 });
  }
}
