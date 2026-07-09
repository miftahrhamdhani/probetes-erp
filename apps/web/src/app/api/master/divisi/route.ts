import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

// Jumlah pesanan per divisi tim, dihitung langsung dari orders.orders.
const SQL = `
  SELECT
    COALESCE(NULLIF(divisi, ''), 'Belum Tercatat') AS name,
    count(*)::int AS orders
  FROM orders.orders
  GROUP BY 1
  ORDER BY orders DESC
`;

export async function GET() {
  try {
    return NextResponse.json(await query(SQL));
  } catch (err) {
    console.error("GET /api/master/divisi gagal:", err);
    return NextResponse.json({ error: "Gagal memuat data divisi." }, { status: 500 });
  }
}
