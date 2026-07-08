import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

const SQL = `
  SELECT
    mitra_id AS id,
    COALESCE(mitra_final_name, '') AS name,
    COALESCE(original_names, '') AS original,
    order_count AS orders,
    value_total AS value,
    CASE WHEN status = 'Aktif' THEN 'Aktif' ELSE 'Perlu review' END AS status
  FROM master.mitra
  ORDER BY mitra_id
`;

export async function GET() {
  try {
    return NextResponse.json(await query(SQL));
  } catch (err) {
    console.error("GET /api/master/mitra gagal:", err);
    return NextResponse.json({ error: "Gagal memuat data mitra." }, { status: 500 });
  }
}
