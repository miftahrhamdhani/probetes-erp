import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { logChange } from "@/lib/audit";

export const dynamic = "force-dynamic";

type Affected = {
  orders?: string[];
  transactions?: number[];
  shipments?: string[];
  returns?: string[];
  targetCohort?: Record<string, unknown> | null;
  targetCustomer?: Record<string, unknown> | null;
};

export async function POST(_req: Request, { params }: { params: Promise<{ mergeId: string }> }) {
  const { mergeId } = await params;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await client.query<{
      source_customer_id: string;
      target_customer_id: string;
      status: string;
      source_customer: Record<string, unknown>;
      source_cohort: Record<string, unknown> | null;
      affected_records: Affected;
    }>("SELECT * FROM audit.customer_merges WHERE merge_id=$1 FOR UPDATE", [mergeId]);
    const merge = result.rows[0];
    if (!merge) throw new Error("Riwayat gabung pelanggan tidak ditemukan.");
    if (merge.status !== "merged") throw new Error("Gabung pelanggan ini sudah dipulihkan atau tidak aktif.");
    const affected = merge.affected_records ?? {};

    if (affected.orders?.length) await client.query("UPDATE orders.orders SET customer_id=$1 WHERE order_id = ANY($2::text[])", [merge.source_customer_id, affected.orders]);
    if (affected.transactions?.length) await client.query("UPDATE orders.customer_transactions SET customer_id=$1 WHERE row_id = ANY($2::bigint[])", [merge.source_customer_id, affected.transactions]);
    if (affected.shipments?.length) await client.query("UPDATE tracking.shipments SET customer_id=$1 WHERE shipment_id = ANY($2::text[])", [merge.source_customer_id, affected.shipments]);
    if (affected.returns?.length) await client.query("UPDATE tracking.returns SET customer_id=$1 WHERE return_id = ANY($2::text[])", [merge.source_customer_id, affected.returns]);

    const source = merge.source_customer;
    await client.query(
      `UPDATE master.customers SET name=$2, phone=$3, phone_normalized=$4, address=$5, city=$6,
       province=$7, source_origin=$8, channel_id=$9, cs_id=$10, transaction_count=$11, status=$12,
       is_crm_target=$13, in_wa_group=$14 WHERE customer_id=$1`,
      [
        merge.source_customer_id, source.name, source.phone, source.phone_normalized, source.address,
        source.city, source.province, source.source_origin, source.channel_id, source.cs_id,
        source.transaction_count, source.status, source.is_crm_target, source.in_wa_group,
      ],
    );
    // Jika cohort sumber dulu dipindahkan karena target belum punya cohort, hapus
    // salinan target hasil merge sebelum mengembalikan snapshot cohort sumber.
    if (merge.source_cohort && !affected.targetCohort) {
      await client.query("DELETE FROM master.customer_cohorts WHERE customer_id=$1", [merge.target_customer_id]);
    }
    if (merge.source_cohort) {
      const c = merge.source_cohort;
      await client.query(
        `INSERT INTO master.customer_cohorts (customer_id, cohort_month, first_purchase_date, last_purchase_date,
          frequency, total_qty, total_spent, last_product_id, last_cs_id, cluster, recency_days, r_score, f_score, m_score, rfm_segment)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
         ON CONFLICT (customer_id) DO UPDATE SET cohort_month=EXCLUDED.cohort_month, first_purchase_date=EXCLUDED.first_purchase_date,
         last_purchase_date=EXCLUDED.last_purchase_date, frequency=EXCLUDED.frequency, total_qty=EXCLUDED.total_qty,
         total_spent=EXCLUDED.total_spent, last_product_id=EXCLUDED.last_product_id, last_cs_id=EXCLUDED.last_cs_id,
         cluster=EXCLUDED.cluster, recency_days=EXCLUDED.recency_days, r_score=EXCLUDED.r_score, f_score=EXCLUDED.f_score,
         m_score=EXCLUDED.m_score, rfm_segment=EXCLUDED.rfm_segment`,
        [
          c.customer_id, c.cohort_month, c.first_purchase_date, c.last_purchase_date, c.frequency, c.total_qty,
          c.total_spent, c.last_product_id, c.last_cs_id, c.cluster, c.recency_days, c.r_score, c.f_score, c.m_score, c.rfm_segment,
        ],
      );
    }
    if (affected.targetCohort) {
      const c = affected.targetCohort;
      await client.query(
        `UPDATE master.customer_cohorts SET cohort_month=$2, first_purchase_date=$3, last_purchase_date=$4,
         frequency=$5, total_qty=$6, total_spent=$7, last_product_id=$8, last_cs_id=$9, cluster=$10,
         recency_days=$11, r_score=$12, f_score=$13, m_score=$14, rfm_segment=$15 WHERE customer_id=$1`,
        [merge.target_customer_id, c.cohort_month, c.first_purchase_date, c.last_purchase_date, c.frequency, c.total_qty,
         c.total_spent, c.last_product_id, c.last_cs_id, c.cluster, c.recency_days, c.r_score, c.f_score, c.m_score, c.rfm_segment],
      );
    }
    if (affected.targetCustomer) {
      const c = affected.targetCustomer;
      await client.query("UPDATE master.customers SET transaction_count=$2 WHERE customer_id=$1", [merge.target_customer_id, c.transaction_count]);
    }
    await client.query("UPDATE audit.customer_merges SET status='restored', restored_at=now() WHERE merge_id=$1", [mergeId]);
    await logChange(client, "master.customers", merge.source_customer_id, "restore", { mergeId }, { targetCustomerId: merge.target_customer_id });
    await client.query("COMMIT");
    return NextResponse.json({ ok: true });
  } catch (err) {
    await client.query("ROLLBACK");
    const message = err instanceof Error ? err.message : "Gagal memulihkan gabung pelanggan.";
    return NextResponse.json({ error: message }, { status: 400 });
  } finally {
    client.release();
  }
}
