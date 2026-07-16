import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { randomUUID } from "crypto";

export const dynamic = "force-dynamic";

const mockData = [
  { name: "Tiktok shop", type: "marketplace", stores: ["Tiktok 1", "Tiktok 2"] },
  { name: "shopee", type: "marketplace", stores: ["Shopee 1", "Shopee 2", "Shopee 3"] },
  { name: "Meta/skalev", type: "akuisisi", stores: ["Skalev Utama"] },
  { name: "Marketplace lain", type: "marketplace", stores: ["Tokopedia", "Lazada"] },
  { name: "stokis / offline", type: "offline", stores: ["Cabang Jakarta", "Cabang Bandung"] },
];

export async function GET() {
  try {
    await query(`
      CREATE SCHEMA IF NOT EXISTS master;
      CREATE TABLE IF NOT EXISTS master.channel_stores (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        stores JSONB NOT NULL DEFAULT '[]'::jsonb
      );
    `);

    const countRes = await query<{ count: number }>(`SELECT COUNT(*) FROM master.channel_stores`);
    if (Number(countRes[0].count) === 0) {
      for (const channel of mockData) {
        await query(
          'INSERT INTO master.channel_stores (id, name, type, stores) VALUES ($1, $2, $3, $4)',
          [randomUUID(), channel.name, channel.type, JSON.stringify(channel.stores)]
        );
      }
    }

    const rows = await query(`
      SELECT
        id,
        name,
        type,
        stores,
        jsonb_array_length(stores) as "storeCount"
      FROM master.channel_stores
      ORDER BY name ASC
    `);
    
    return NextResponse.json(rows);
  } catch (err) {
    console.error("GET /api/master/channel-stores gagal:", err);
    return NextResponse.json({ error: "Gagal memuat data Channel." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.name || !body.type) {
      return NextResponse.json({ error: "Nama dan Jenis wajib diisi." }, { status: 400 });
    }
    
    let storesArr = [];
    if (typeof body.stores === "string") {
      storesArr = body.stores.split(',').map((s: string) => s.trim()).filter(Boolean);
    } else if (Array.isArray(body.stores)) {
      storesArr = body.stores;
    }

    const newId = randomUUID();
    await query(
      'INSERT INTO master.channel_stores (id, name, type, stores) VALUES ($1, $2, $3, $4)',
      [newId, body.name, body.type, JSON.stringify(storesArr)]
    );

    return NextResponse.json({ success: true, id: newId });
  } catch (err) {
    console.error("POST /api/master/channel-stores gagal:", err);
    return NextResponse.json({ error: "Gagal menyimpan data Channel." }, { status: 500 });
  }
}
