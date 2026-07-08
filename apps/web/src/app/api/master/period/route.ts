import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

interface PeriodRow {
  earliest: string | null;
  latest: string | null;
}

// Rentang tanggal data ASLI dari database (bukan tanggal file diolah),
// diambil dari gabungan tanggal order dan tanggal transaksi cohort.
const SQL = `
  SELECT
    to_char(least(
      (SELECT min(order_date) FROM orders.orders),
      (SELECT min(transaction_date) FROM orders.customer_transactions)
    ), 'YYYY-MM-DD') AS earliest,
    to_char(greatest(
      (SELECT max(order_date) FROM orders.orders),
      (SELECT max(transaction_date) FROM orders.customer_transactions)
    ), 'YYYY-MM-DD') AS latest
`;

export async function GET() {
  try {
    const rows = await query<PeriodRow>(SQL);
    return NextResponse.json(rows[0] ?? { earliest: null, latest: null });
  } catch (err) {
    console.error("GET /api/master/period gagal:", err);
    return NextResponse.json({ error: "Gagal memuat periode data." }, { status: 500 });
  }
}
