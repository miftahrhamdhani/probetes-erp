import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { HP_TIDAK_NORMAL_WHERE, KOTA_KOSONG_WHERE, NAMA_BERMASALAH_WHERE } from "@/lib/quality-sql";

export const dynamic = "force-dynamic";

// Ringkasan Data — hanya angka yang bisa dipertanggungjawabkan dari database asli.
// Sengaja TIDAK menampilkan nilai uang pesanan-vs-penjualan berdampingan (beda
// definisi -> menyesatkan). Fokus: jumlah pasti, segmen pelanggan, kesehatan data.

const CORE_SQL = `
  SELECT
    (SELECT count(*) FROM master.customers)                                   AS pelanggan,
    (SELECT count(*) FROM master.customers WHERE is_crm_target)               AS target_crm,
    (SELECT count(*) FROM orders.orders)                                      AS pesanan,
    (SELECT count(*) FROM orders.customer_transactions)                       AS transaksi_cohort,
    (SELECT count(*) FROM master.products)                                    AS produk,
    to_char((SELECT min(order_date) FROM orders.orders), 'YYYY-MM-DD')        AS data_awal,
    to_char((SELECT max(order_date) FROM orders.orders), 'YYYY-MM-DD')        AS data_akhir
`;

const CLUSTER_SQL = `
  SELECT
    count(*) FILTER (WHERE cluster = 'baru')       AS baru,
    count(*) FILTER (WHERE cluster = 'repeat')     AS repeat,
    count(*) FILTER (WHERE cluster = 'high_value') AS high_value
  FROM master.customer_cohorts
`;

const RFM_SQL = `
  SELECT rfm_segment AS segment, count(*)::int AS jumlah, sum(total_spent)::bigint AS nilai
  FROM master.customer_cohorts
  WHERE rfm_segment <> 'Non-CRM'
  GROUP BY rfm_segment
  ORDER BY jumlah DESC
`;

const HEALTH_SQL = `
  SELECT
    (SELECT count(*) FROM master.products WHERE NULLIF(category,'') IS NULL) AS produk_tanpa_kategori,
    (SELECT count(*) FROM master.products WHERE status = 'review')           AS produk_nama_review,
    (SELECT count(*) FROM master.customers WHERE ${NAMA_BERMASALAH_WHERE})    AS nama_bermasalah,
    (SELECT count(*) FROM master.customers WHERE ${KOTA_KOSONG_WHERE})        AS kota_kosong,
    (SELECT count(*) FROM master.customers WHERE ${HP_TIDAK_NORMAL_WHERE})    AS hp_tidak_normal,
    (SELECT count(*) FROM master.customers cu
       WHERE NOT EXISTS (
         SELECT 1 FROM orders.orders o WHERE o.customer_id = cu.customer_id AND o.channel_id IS NOT NULL
       )) AS channel_belum_tercatat
`;

export async function GET() {
  try {
    const [core, cluster, rfm, health] = await Promise.all([
      query<Record<string, string | number | null>>(CORE_SQL),
      query<Record<string, number>>(CLUSTER_SQL),
      query<{ segment: string; jumlah: number; nilai: number }>(RFM_SQL),
      query<Record<string, number>>(HEALTH_SQL),
    ]);
    return NextResponse.json({
      core: core[0] ?? {},
      cluster: cluster[0] ?? {},
      rfm,
      health: health[0] ?? {},
    });
  } catch (err) {
    console.error("GET /api/database/summary gagal:", err);
    return NextResponse.json({ error: "Gagal memuat ringkasan data." }, { status: 500 });
  }
}
