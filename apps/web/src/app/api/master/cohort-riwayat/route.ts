import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

// Riwayat transaksi cohort: nama & WA dari customers, CS dari users, produk dari products.
// row_id menjaga urutan sesuai file asli.
const SQL = `
  SELECT
    COALESCE(to_char(t.transaction_date, 'YYYY-MM-DD'), '-') AS date,
    t.transaction_id AS trx,
    CASE
      WHEN cu.phone_normalized IS NULL OR cu.phone_normalized = '' THEN '-'
      WHEN cu.phone_normalized LIKE '62%' THEN '0' || substring(cu.phone_normalized from 3)
      ELSE cu.phone_normalized
    END AS wa,
    COALESCE(cu.name, '-') AS name,
    COALESCE(us.name, '-') AS cs,
    COALESCE(pr.product_final_name, '-') AS product,
    t.qty,
    t.total_price AS total,
    COALESCE(NULLIF(t.cohort_month, ''), '-') AS cohort
  FROM orders.customer_transactions t
  LEFT JOIN master.customers cu ON cu.customer_id = t.customer_id
  LEFT JOIN master.users us ON us.user_id = t.cs_id
  LEFT JOIN master.products pr ON pr.product_id = t.product_id
  ORDER BY t.row_id
`;

export async function GET() {
  try {
    return NextResponse.json(await query(SQL));
  } catch (err) {
    console.error("GET /api/master/cohort-riwayat gagal:", err);
    return NextResponse.json({ error: "Gagal memuat riwayat cohort." }, { status: 500 });
  }
}
