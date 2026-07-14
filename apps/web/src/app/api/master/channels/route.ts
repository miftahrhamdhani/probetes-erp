import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

const SQL = `
  SELECT
    channel_id AS id,
    CASE WHEN channel_final_name = 'Unknown' THEN 'Belum Tercatat'
         ELSE COALESCE(channel_final_name, '') END AS name,
    CASE WHEN type = 'Belum tercatat' THEN '-' ELSE COALESCE(type, '-') END AS type,
    COALESCE(NULLIF(original_names, ''), '(kosong di data lama)') AS original,
    order_count AS orders,
    value_total AS value,
    CASE WHEN status IN ('Aktif', 'active', 'valid') THEN 'Aktif' ELSE 'Perlu review' END AS status
  FROM master.channels
  WHERE status IS DISTINCT FROM 'archived'
  ORDER BY channel_id
`;

export async function GET() {
  try {
    return NextResponse.json(await query(SQL));
  } catch (err) {
    console.error("GET /api/master/channels gagal:", err);
    return NextResponse.json({ error: "Gagal memuat data channel." }, { status: 500 });
  }
}
