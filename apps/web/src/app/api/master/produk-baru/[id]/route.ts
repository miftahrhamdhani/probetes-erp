import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    
    await query(
      'UPDATE master.produk_baru SET id_produk = $1, name = $2, price = $3, hpp = $4 WHERE id = $5',
      [body.id_produk, body.name, Number(body.price || 0), Number(body.hpp || 0), id]
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("PUT /api/master/produk-baru/[id] gagal:", err);
    return NextResponse.json({ error: "Gagal update data Produk." }, { status: 500 });
  }
}

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    await query('DELETE FROM master.produk_baru WHERE id = $1', [id]);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/master/produk-baru/[id] gagal:", err);
    return NextResponse.json({ error: "Gagal hapus data Produk." }, { status: 500 });
  }
}
