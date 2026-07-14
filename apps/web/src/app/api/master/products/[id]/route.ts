import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { logChange } from "@/lib/audit";

export const dynamic = "force-dynamic";

// Kategori lama tetap diterima sampai koreksi produk owner diterapkan penuh.
const CATEGORIES = new Set([
  "Herbal", "Makanan", "Minyak Balur", "Edukasi", "Device", "Event", "Jasa",
  "digital", "hp_amandia", "fisik_lain",
]);

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = (await req.json()) as { name?: string; sku?: string; category?: string; original?: string; status?: string };
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const found = await client.query<Record<string, unknown>>(
      "SELECT * FROM master.products WHERE product_id=$1 FOR UPDATE",
      [id],
    );
    const before = found.rows[0];
    if (!before) throw new Error("Produk tidak ditemukan.");

    const name = body.name?.trim() || String(before.product_final_name ?? "");
    const sku = body.sku?.trim() === "-" ? null : (body.sku?.trim() || null);
    const category = body.category?.trim() === "-" ? null : (body.category?.trim() || null);
    if (category && !CATEGORIES.has(category)) throw new Error("Kategori produk tidak dikenal.");
    const beforeOriginal = String(before.original_names ?? "");
    const status = body.status === "Tersedia"
      ? "valid"
      : body.status === "Perlu dicek" || body.status === "Perlu review"
        ? "review"
        : String(before.status ?? "review");

    await client.query(
      `UPDATE master.products
       SET product_final_name=$2, sku=$3, category=$4, status=$5
       WHERE product_id=$1`,
      [id, name, sku, category, status],
    );

    // Nama asli hasil migrasi tidak diubah. Alias tambahan dari admin dipisah titik koma.
    const aliases = body.original && body.original.trim() !== beforeOriginal
      ? body.original.split(";").map((item) => item.trim()).filter(Boolean)
      : [];
    for (const alias of aliases) {
      await client.query(
        `INSERT INTO master.product_aliases (original_name, product_id, status, source)
         VALUES ($1,$2,$3,'admin')
         ON CONFLICT (original_name) DO UPDATE
         SET product_id=EXCLUDED.product_id, status=EXCLUDED.status, source='admin', updated_at=now()`,
        [alias, id, status],
      );
    }
    await logChange(client, "master.products", id, "mapping", before, { name, sku, category, aliases, status });
    await client.query("COMMIT");
    return NextResponse.json({ ok: true });
  } catch (err) {
    await client.query("ROLLBACK");
    return NextResponse.json({ error: err instanceof Error ? err.message : "Gagal menyimpan produk." }, { status: 400 });
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
      "SELECT * FROM master.products WHERE product_id=$1 FOR UPDATE",
      [id],
    );
    const before = found.rows[0];
    if (!before) throw new Error("Produk tidak ditemukan.");
    await client.query("UPDATE master.products SET status='archived' WHERE product_id=$1", [id]);
    await logChange(client, "master.products", id, "archive", before, { status: "archived" });
    await client.query("COMMIT");
    return NextResponse.json({ ok: true });
  } catch (err) {
    await client.query("ROLLBACK");
    return NextResponse.json({ error: err instanceof Error ? err.message : "Gagal mengarsipkan produk." }, { status: 400 });
  } finally {
    client.release();
  }
}
