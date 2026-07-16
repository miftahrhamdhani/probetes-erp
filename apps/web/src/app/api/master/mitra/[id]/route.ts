import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    
    await query(
      'UPDATE master.mitra_data SET id_mitra = $1, name = $2, original = $3 WHERE id = $4',
      [body.id_mitra, body.name, body.original || "", id]
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("PUT /api/master/mitra/[id] gagal:", err);
    return NextResponse.json({ error: "Gagal update data Mitra." }, { status: 500 });
  }
}

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    await query('DELETE FROM master.mitra_data WHERE id = $1', [id]);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/master/mitra/[id] gagal:", err);
    return NextResponse.json({ error: "Gagal hapus data Mitra." }, { status: 500 });
  }
}
