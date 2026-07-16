import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    
    let storesArr = [];
    if (typeof body.stores === "string") {
      storesArr = body.stores.split(',').map((s: string) => s.trim()).filter(Boolean);
    } else if (Array.isArray(body.stores)) {
      storesArr = body.stores;
    }

    await query(
      'UPDATE master.channel_stores SET name = $1, type = $2, stores = $3 WHERE id = $4',
      [body.name, body.type, JSON.stringify(storesArr), id]
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("PUT /api/master/channel-stores/[id] gagal:", err);
    return NextResponse.json({ error: "Gagal update data Channel." }, { status: 500 });
  }
}

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    await query('DELETE FROM master.channel_stores WHERE id = $1', [id]);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/master/channel-stores/[id] gagal:", err);
    return NextResponse.json({ error: "Gagal hapus data Channel." }, { status: 500 });
  }
}
