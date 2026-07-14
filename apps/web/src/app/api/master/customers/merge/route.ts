import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { logChange } from "@/lib/audit";

export const dynamic = "force-dynamic";

type Customer = { customer_id: string; name: string | null; phone_normalized: string | null; status: string | null };

async function getPreview(sourceId: string, targetId: string) {
  if (!sourceId || !targetId || sourceId === targetId) throw new Error("Pilih dua pelanggan yang berbeda.");
  const client = await pool.connect();
  try {
    const customers = await client.query<Customer>(
      `SELECT customer_id, name, phone_normalized, status FROM master.customers
       WHERE customer_id = ANY($1::text[])`,
      [[sourceId, targetId]],
    );
    if (customers.rows.length !== 2) throw new Error("Pelanggan tidak ditemukan.");
    const source = customers.rows.find((row) => row.customer_id === sourceId)!;
    const target = customers.rows.find((row) => row.customer_id === targetId)!;
    if (source.status === "archived" || target.status === "archived") throw new Error("Pelanggan yang sudah diarsipkan tidak bisa digabung.");
    const samePhone = Boolean(source.phone_normalized && source.phone_normalized === target.phone_normalized);
    if (!samePhone) throw new Error("Gabung pelanggan hanya tersedia untuk kandidat dengan No. HP yang sama.");
    const impact = (await client.query<{ orders: number; transactions: number; shipments: number; returns: number }>(
      `SELECT
        (SELECT count(*)::int FROM orders.orders WHERE customer_id=$1) AS orders,
        (SELECT count(*)::int FROM orders.customer_transactions WHERE customer_id=$1) AS transactions,
        (SELECT count(*)::int FROM tracking.shipments WHERE customer_id=$1) AS shipments,
        (SELECT count(*)::int FROM tracking.returns WHERE customer_id=$1) AS returns`,
      [sourceId],
    )).rows[0];
    return { source, target, samePhone, impact };
  } finally {
    client.release();
  }
}

export async function GET(req: NextRequest) {
  try {
    return NextResponse.json(await getPreview(
      req.nextUrl.searchParams.get("sourceId") ?? "",
      req.nextUrl.searchParams.get("targetId") ?? "",
    ));
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Gagal membuat pratinjau gabung pelanggan." }, { status: 400 });
  }
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as { sourceId?: string; targetId?: string; confirmed?: boolean };
  if (!body.confirmed) return NextResponse.json({ error: "Konfirmasi gabung pelanggan diperlukan." }, { status: 400 });
  const sourceId = body.sourceId ?? "";
  const targetId = body.targetId ?? "";
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const customers = await client.query<Record<string, unknown>>(
      "SELECT * FROM master.customers WHERE customer_id = ANY($1::text[]) FOR UPDATE",
      [[sourceId, targetId]],
    );
    if (customers.rows.length !== 2) throw new Error("Pelanggan tidak ditemukan.");
    const source = customers.rows.find((row) => row.customer_id === sourceId)!;
    const target = customers.rows.find((row) => row.customer_id === targetId)!;
    if (source.status === "archived" || target.status === "archived") throw new Error("Pelanggan yang sudah diarsipkan tidak bisa digabung.");
    if (!source.phone_normalized || source.phone_normalized !== target.phone_normalized) throw new Error("Gabung pelanggan hanya tersedia untuk kandidat dengan No. HP yang sama.");

    const [orders, transactions, shipments, returns, sourceCohort, targetCohort] = await Promise.all([
      client.query<{ order_id: string }>("SELECT order_id FROM orders.orders WHERE customer_id=$1", [sourceId]),
      client.query<{ row_id: number }>("SELECT row_id FROM orders.customer_transactions WHERE customer_id=$1", [sourceId]),
      client.query<{ shipment_id: string }>("SELECT shipment_id FROM tracking.shipments WHERE customer_id=$1", [sourceId]),
      client.query<{ return_id: string }>("SELECT return_id FROM tracking.returns WHERE customer_id=$1", [sourceId]),
      client.query<Record<string, unknown>>("SELECT * FROM master.customer_cohorts WHERE customer_id=$1", [sourceId]),
      client.query<Record<string, unknown>>("SELECT * FROM master.customer_cohorts WHERE customer_id=$1", [targetId]),
    ]);

    const affected = {
      orders: orders.rows.map((row) => row.order_id),
      transactions: transactions.rows.map((row) => row.row_id),
      shipments: shipments.rows.map((row) => row.shipment_id),
      returns: returns.rows.map((row) => row.return_id),
      targetCohort: targetCohort.rows[0] ?? null,
      targetCustomer: target,
    };

    await client.query("UPDATE orders.orders SET customer_id=$1 WHERE customer_id=$2", [targetId, sourceId]);
    await client.query("UPDATE orders.customer_transactions SET customer_id=$1 WHERE customer_id=$2", [targetId, sourceId]);
    await client.query("UPDATE tracking.shipments SET customer_id=$1 WHERE customer_id=$2", [targetId, sourceId]);
    await client.query("UPDATE tracking.returns SET customer_id=$1 WHERE customer_id=$2", [targetId, sourceId]);
    await client.query("UPDATE master.customers SET status='archived' WHERE customer_id=$1", [sourceId]);

    if (sourceCohort.rows[0] && !targetCohort.rows[0]) {
      await client.query("UPDATE master.customer_cohorts SET customer_id=$1 WHERE customer_id=$2", [targetId, sourceId]);
    } else if (sourceCohort.rows[0] && targetCohort.rows[0]) {
      await client.query("DELETE FROM master.customer_cohorts WHERE customer_id=$1", [sourceId]);
    }
    if (sourceCohort.rows[0] || targetCohort.rows[0]) {
      await client.query(
        `UPDATE master.customer_cohorts SET
          first_purchase_date=(SELECT min(transaction_date) FROM orders.customer_transactions WHERE customer_id=$1),
          last_purchase_date=(SELECT max(transaction_date) FROM orders.customer_transactions WHERE customer_id=$1),
          frequency=(SELECT count(DISTINCT COALESCE(transaction_id, row_id::text)) FROM orders.customer_transactions WHERE customer_id=$1),
          total_qty=(SELECT COALESCE(sum(qty),0) FROM orders.customer_transactions WHERE customer_id=$1),
          total_spent=(SELECT COALESCE(sum(total_price),0) FROM orders.customer_transactions WHERE customer_id=$1)
         WHERE customer_id=$1`,
        [targetId],
      );
    }
    await client.query(
      "UPDATE master.customers SET transaction_count=(SELECT count(*) FROM orders.orders WHERE customer_id=$1) WHERE customer_id=$1",
      [targetId],
    );

    const merge = await client.query<{ merge_id: string }>(
      `INSERT INTO audit.customer_merges (source_customer_id, target_customer_id, source_customer, source_cohort, affected_records)
       VALUES ($1,$2,$3,$4,$5) RETURNING merge_id`,
      [sourceId, targetId, JSON.stringify(source), JSON.stringify(sourceCohort.rows[0] ?? null), JSON.stringify(affected)],
    );
    const mergeRow = merge.rows[0];
    if (!mergeRow) throw new Error("Riwayat penggabungan pelanggan gagal dibuat.");
    await logChange(client, "master.customers", sourceId, "merge", source, { targetCustomerId: targetId, mergeId: mergeRow.merge_id, affected });
    await client.query("COMMIT");
    return NextResponse.json({ ok: true, mergeId: mergeRow.merge_id, affected });
  } catch (err) {
    await client.query("ROLLBACK");
    return NextResponse.json({ error: err instanceof Error ? err.message : "Gagal menggabungkan pelanggan." }, { status: 400 });
  } finally {
    client.release();
  }
}
