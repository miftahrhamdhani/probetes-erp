import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { extractCityFromAddress } from "@/lib/location";

export const dynamic = "force-dynamic";

// Bentuk output disamakan dengan public/data/customers.json, dengan perubahan
// atas permintaan owner:
// - phone ditampilkan penuh (tanpa masking), format lokal 08xx.
// - "source" (dulu nama file sumber, membingungkan) diganti channel penjualan
//   dominan pelanggan (TikTok Shop/Shopee/Meta/Stokis/dst), diambil dari channel
//   yang paling sering dipakai pelanggan tsb saat order (dominant_channel CTE).
// - firstPurchase (dari customer_cohorts) = tanggal pelanggan pertama kali
//   tercatat/transaksi, ditampilkan sebagai kolom "Tanggal" paling kiri (sama
//   seperti kolom Tanggal di data lama) dan bisa difilter per tanggal/rentang.
const SQL = `
  WITH dominant_channel AS (
    SELECT customer_id, channel_id FROM (
      SELECT
        o.customer_id,
        o.channel_id,
        ROW_NUMBER() OVER (PARTITION BY o.customer_id ORDER BY count(*) DESC) AS rn
      FROM orders.orders o
      WHERE o.channel_id IS NOT NULL
      GROUP BY o.customer_id, o.channel_id
    ) t WHERE rn = 1
  )
  SELECT
    cu.customer_id AS id,
    COALESCE(cu.name, '') AS name,
    CASE
      WHEN cu.phone_normalized IS NULL OR cu.phone_normalized = '' THEN '-'
      WHEN cu.phone_normalized LIKE '62%' THEN '0' || substring(cu.phone_normalized from 3)
      ELSE cu.phone_normalized
    END AS phone,
    COALESCE(NULLIF(cu.address, ''), '-') AS address,
    COALESCE(NULLIF(cu.city, ''), '') AS city,
    COALESCE(NULLIF(cu.province, ''), '-') AS province,
    CASE
      WHEN ch.channel_final_name IS NULL THEN '-'
      WHEN ch.channel_final_name = 'Unknown' THEN 'Belum Tercatat'
      ELSE ch.channel_final_name
    END AS source,
    cu.transaction_count AS trx,
    CASE cu.status
      WHEN 'baru' THEN 'Baru'
      WHEN 'repeat' THEN 'Repeat'
      WHEN 'high_value' THEN 'High Value'
      WHEN 'review' THEN 'Perlu Dicek'
      ELSE cu.status
    END AS status,
    to_char(cc.first_purchase_date, 'YYYY-MM-DD') AS "firstPurchase"
  FROM master.customers cu
  LEFT JOIN dominant_channel dc ON dc.customer_id = cu.customer_id
  LEFT JOIN master.channels ch ON ch.channel_id = dc.channel_id
  LEFT JOIN master.customer_cohorts cc ON cc.customer_id = cu.customer_id
  ORDER BY cu.customer_id
`;

export async function GET() {
  try {
    const rows = await query<Array<Record<string, unknown>>[number]>(SQL);
    return NextResponse.json(rows.map((row) => ({
      ...row,
      city: extractCityFromAddress(String(row.address ?? ""), String(row.city ?? "")) || "-",
    })));
  } catch (err) {
    console.error("GET /api/master/customers gagal:", err);
    return NextResponse.json({ error: "Gagal memuat data pelanggan." }, { status: 500 });
  }
}
