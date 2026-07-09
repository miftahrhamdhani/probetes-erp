import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

// wa = No. WA ditampilkan penuh (di-lokalkan 62->0), bukan dimasking.
// id = customer_id, dipakai frontend sebagai kunci edit/hapus — WA tidak unik
// (2.183 pelanggan tanpa HP tampil sebagai "-"). Urutan pakai length+id agar
// PB-CUST-2 tampil sebelum PB-CUST-10 (ID tidak di-padding).
// Tanggal diformat YYYY-MM-DD agar sama dengan JSON lama.
const SQL = `
  SELECT
    co.customer_id AS id,
    CASE
      WHEN cu.phone_normalized IS NULL OR cu.phone_normalized = '' THEN '-'
      WHEN cu.phone_normalized LIKE '62%' THEN '0' || substring(cu.phone_normalized from 3)
      ELSE cu.phone_normalized
    END AS wa,
    COALESCE(cu.name, '') AS name,
    COALESCE(NULLIF(co.cohort_month, ''), '-') AS cohort,
    COALESCE(to_char(co.first_purchase_date, 'YYYY-MM-DD'), '-') AS first,
    COALESCE(to_char(co.last_purchase_date, 'YYYY-MM-DD'), '-') AS last,
    co.frequency AS freq,
    co.total_qty AS qty,
    co.total_spent AS total,
    CASE co.cluster
      WHEN 'baru' THEN 'Baru'
      WHEN 'repeat' THEN 'Repeat'
      WHEN 'high_value' THEN 'High Value'
      WHEN 'review' THEN 'Perlu Dicek'
      ELSE co.cluster
    END AS cluster
  FROM master.customer_cohorts co
  JOIN master.customers cu ON cu.customer_id = co.customer_id
  ORDER BY length(co.customer_id), co.customer_id
`;

export async function GET() {
  try {
    return NextResponse.json(await query(SQL));
  } catch (err) {
    console.error("GET /api/master/cohort-summary gagal:", err);
    return NextResponse.json({ error: "Gagal memuat ringkasan cohort." }, { status: 500 });
  }
}
