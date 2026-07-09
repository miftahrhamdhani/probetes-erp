import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

// Jumlah data per menu Data Utama — dipakai badge kartu menu supaya angkanya
// selalu ikut database, bukan ditulis mati di frontend.
const SQL = `
  SELECT
    (SELECT count(*) FROM master.customers)::int                              AS pelanggan,
    (SELECT count(DISTINCT transaction_id) FROM orders.customer_transactions)::int AS cohort,
    (SELECT count(*) FROM master.products)::int                               AS produk,
    (SELECT count(*) FROM master.channels)::int                               AS channel,
    (SELECT count(*) FROM master.users)::int                                  AS "csTim",
    (SELECT count(*) FROM master.couriers)::int                               AS ekspedisi
`;

export async function GET() {
  try {
    const rows = await query(SQL);
    return NextResponse.json(rows[0] ?? {});
  } catch (err) {
    console.error("GET /api/master/counts gagal:", err);
    return NextResponse.json({ error: "Gagal memuat jumlah data." }, { status: 500 });
  }
}
