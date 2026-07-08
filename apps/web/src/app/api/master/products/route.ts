import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

const SQL = `
  SELECT
    product_id AS id,
    COALESCE(product_final_name, '') AS name,
    COALESCE(NULLIF(sku, ''), '-') AS sku,
    COALESCE(original_names, '') AS original,
    qty_total AS qty,
    value_total AS value,
    CASE WHEN status = 'valid' THEN 'Tersedia' ELSE 'Perlu dicek' END AS status
  FROM master.products
  ORDER BY product_id
`;

export async function GET() {
  try {
    return NextResponse.json(await query(SQL));
  } catch (err) {
    console.error("GET /api/master/products gagal:", err);
    return NextResponse.json({ error: "Gagal memuat data produk." }, { status: 500 });
  }
}
