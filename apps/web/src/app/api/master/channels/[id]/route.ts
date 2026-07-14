import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { logChange } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = (await req.json()) as { name?: string; type?: string; original?: string; status?: string };
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const found = await client.query<Record<string, unknown>>(
      "SELECT * FROM master.channels WHERE channel_id=$1 FOR UPDATE",
      [id],
    );
    const before = found.rows[0];
    if (!before) throw new Error("Channel tidak ditemukan.");

    const name = body.name?.trim() || String(before.channel_final_name ?? "");
    const type = body.type?.trim() === "-" ? null : (body.type?.trim() || null);
    const beforeOriginal = String(before.original_names ?? "");
    const status = body.status === "Aktif"
      ? "active"
      : body.status === "Perlu review"
        ? "review"
        : String(before.status ?? "review");
    await client.query(
      "UPDATE master.channels SET channel_final_name=$2, type=$3, status=$4 WHERE channel_id=$1",
      [id, name, type, status],
    );

    // Nama mentah migrasi tidak diubah. Alias tambahan dari admin dipisah titik koma.
    const aliases = body.original && body.original.trim() !== beforeOriginal
      ? body.original.split(";").map((item) => item.trim()).filter(Boolean)
      : [];
    for (const alias of aliases) {
      await client.query(
        `INSERT INTO master.channel_aliases (original_name, channel_id, status, source)
         VALUES ($1,$2,$3,'admin')
         ON CONFLICT (original_name) DO UPDATE
         SET channel_id=EXCLUDED.channel_id, status=EXCLUDED.status, source='admin', updated_at=now()`,
        [alias, id, status],
      );
    }
    await logChange(client, "master.channels", id, "mapping", before, { name, type, aliases, status });
    await client.query("COMMIT");
    return NextResponse.json({ ok: true });
  } catch (err) {
    await client.query("ROLLBACK");
    return NextResponse.json({ error: err instanceof Error ? err.message : "Gagal menyimpan channel." }, { status: 400 });
  } finally {
    client.release();
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const found = await client.query<Record<string, unknown>>(
      "SELECT * FROM master.channels WHERE channel_id=$1 FOR UPDATE",
      [id],
    );
    const before = found.rows[0];
    if (!before) throw new Error("Channel tidak ditemukan.");
    await client.query("UPDATE master.channels SET status='archived' WHERE channel_id=$1", [id]);
    await logChange(client, "master.channels", id, "archive", before, { status: "archived" });
    await client.query("COMMIT");
    return NextResponse.json({ ok: true });
  } catch (err) {
    await client.query("ROLLBACK");
    return NextResponse.json({ error: err instanceof Error ? err.message : "Gagal mengarsipkan channel." }, { status: 400 });
  } finally {
    client.release();
  }
}
