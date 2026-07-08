import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

// initcap meniru .title() Python; status 'Perlu dicek' bila role mengandung '/'.
const SQL = `
  SELECT
    user_id AS id,
    initcap(COALESCE(name, '')) AS name,
    COALESCE(role, '') AS role,
    COALESCE(NULLIF(division, ''), '-') AS divisi,
    order_count AS orders,
    CASE WHEN role LIKE '%/%' THEN 'Perlu dicek' ELSE 'Aktif' END AS status
  FROM master.users
  ORDER BY order_count DESC
`;

export async function GET() {
  try {
    return NextResponse.json(await query(SQL));
  } catch (err) {
    console.error("GET /api/master/users gagal:", err);
    return NextResponse.json({ error: "Gagal memuat data CS/Tim." }, { status: 500 });
  }
}
