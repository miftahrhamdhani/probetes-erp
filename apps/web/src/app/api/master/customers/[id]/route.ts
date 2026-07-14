import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { logChange } from "@/lib/audit";

export const dynamic = "force-dynamic";

// Fase 2 (F2-01): API tulis Pelanggan. Edit menyimpan ke master.customers,
// Hapus = ARSIP (status='archived', tidak dihapus fisik). Semua perubahan
// dicatat di audit.change_log (F2-04). Kolom turunan (channel/trx/status/tanggal)
// tidak diedit di sini — hanya identitas inti.
const EDITABLE = ["name", "address", "city", "province"] as const;

/** Ubah input No HP menjadi { phone (apa adanya), normalized (62…) }. */
function normalizePhone(input: string): { phone: string | null; normalized: string | null } {
  const raw = (input ?? "").trim();
  if (!raw || raw === "-") return { phone: null, normalized: null };
  let digits = raw.replace(/[^0-9]/g, "");
  if (digits.startsWith("0")) digits = "62" + digits.slice(1);
  else if (digits.startsWith("8")) digits = "62" + digits;
  return { phone: raw, normalized: digits || null };
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const client = await pool.connect();
  try {
    const body = (await req.json()) as Record<string, unknown>;
    await client.query("BEGIN");
    const before = (await client.query<Record<string, unknown>>(
      `SELECT customer_id, name, phone, phone_normalized, address, city, province
       FROM master.customers WHERE customer_id = $1 FOR UPDATE`, [id],
    )).rows[0];
    if (!before) throw new Error("Pelanggan tidak ditemukan.");

    const sets: string[] = [];
    const values: unknown[] = [];
    const after: Record<string, unknown> = {};
    let i = 1;
    if ("phone" in body) {
      const { phone, normalized } = normalizePhone(String(body.phone ?? ""));
      sets.push(`phone = $${i++}`, `phone_normalized = $${i++}`);
      values.push(phone, normalized);
      after.phone = phone;
      after.phone_normalized = normalized;
    }
    for (const key of EDITABLE) {
      if (key in body) {
        const v = String(body[key] ?? "").trim();
        const stored = v === "" || v === "-" ? null : v;
        sets.push(`${key} = $${i++}`);
        values.push(stored);
        after[key] = stored;
      }
    }
    if (sets.length === 0) throw new Error("Tidak ada perubahan untuk disimpan.");
    values.push(id);
    await client.query(`UPDATE master.customers SET ${sets.join(", ")} WHERE customer_id = $${i}`, values);
    await logChange(client, "master.customers", id, "update", before, after);
    await client.query("COMMIT");
    return NextResponse.json({ ok: true });
  } catch (err) {
    await client.query("ROLLBACK");
    const message = err instanceof Error ? err.message : "Gagal menyimpan perubahan pelanggan.";
    return NextResponse.json({ error: message }, { status: message === "Pelanggan tidak ditemukan." ? 404 : 400 });
  } finally {
    client.release();
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const before = (await client.query<Record<string, unknown>>(
      `SELECT customer_id, status FROM master.customers WHERE customer_id = $1 FOR UPDATE`, [id],
    )).rows[0];
    if (!before) throw new Error("Pelanggan tidak ditemukan.");
    await client.query("UPDATE master.customers SET status='archived' WHERE customer_id=$1", [id]);
    await logChange(client, "master.customers", id, "archive", before, { status: "archived" });
    await client.query("COMMIT");
    return NextResponse.json({ ok: true });
  } catch (err) {
    await client.query("ROLLBACK");
    const message = err instanceof Error ? err.message : "Gagal mengarsipkan pelanggan.";
    return NextResponse.json({ error: message }, { status: message === "Pelanggan tidak ditemukan." ? 404 : 400 });
  } finally {
    client.release();
  }
}
