import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

const SQL = `
  SELECT
    courier_id AS id,
    COALESCE(courier_final_name, '') AS name,
    COALESCE(original_names, '') AS original,
    COALESCE(NULLIF(service_type, ''), '-') AS service,
    order_count AS orders,
    CASE WHEN status = 'Aktif' THEN 'Aktif' ELSE 'Perlu dicek' END AS status
  FROM master.couriers
  ORDER BY order_count DESC
`;

export async function GET() {
  try {
    return NextResponse.json(await query(SQL));
  } catch (err) {
    console.error("GET /api/master/couriers gagal:", err);
    return NextResponse.json({ error: "Gagal memuat data ekspedisi." }, { status: 500 });
  }
}
