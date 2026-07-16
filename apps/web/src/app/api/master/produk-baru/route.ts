import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { randomUUID } from "crypto";

export const dynamic = "force-dynamic";

const mockData = [
  { id_produk: "PRD-001", name: "Amandia 7", price: 75000, hpp: 33750 },
  { id_produk: "PRD-002", name: "Amandia muesli", price: 54000, hpp: 32000 },
  { id_produk: "PRD-003", name: "Beras Organik", price: 42500, hpp: 30000 },
  { id_produk: "PRD-004", name: "Beras Merah", price: 42500, hpp: 30000 },
  { id_produk: "PRD-005", name: "Buku Kurus", price: 135000, hpp: 45000 },
  { id_produk: "PRD-006", name: "Buku Remisi", price: 89000, hpp: 35000 },
  { id_produk: "PRD-007", name: "Ebook 101", price: 69000, hpp: 22000 },
  { id_produk: "PRD-008", name: "Ebook 90", price: 89000, hpp: 22000 },
  { id_produk: "PRD-009", name: "Ebook 145", price: 145000, hpp: 35000 },
  { id_produk: "PRD-010", name: "Ebook 30", price: 69000, hpp: 22000 },
  { id_produk: "PRD-011", name: "Ebook 69", price: 69000, hpp: 22000 },
  { id_produk: "PRD-012", name: "Ebook fat loss", price: 69000, hpp: 22000 },
  { id_produk: "PRD-013", name: "Ebook haji", price: 69000, hpp: 22000 },
  { id_produk: "PRD-014", name: "Ebook Hipertensi", price: 69000, hpp: 22000 },
  { id_produk: "PRD-015", name: "Ebook webinar", price: 89000, hpp: 22000 },
  { id_produk: "PRD-016", name: "Konsul pak rahman", price: 125000, hpp: 62500 },
  { id_produk: "PRD-017", name: "Minyak CCO", price: 60000, hpp: 40000 },
  { id_produk: "PRD-018", name: "Minyak VCO", price: 60000, hpp: 48050 },
  { id_produk: "PRD-019", name: "Probetes Herbal 24", price: 99000, hpp: 27000 },
  { id_produk: "PRD-020", name: "Probetes Oil", price: 65000, hpp: 22000 },
  { id_produk: "PRD-021", name: "Stevia", price: 45000, hpp: 20000 },
  { id_produk: "PRD-022", name: "Yacona 60", price: 185000, hpp: 113320 },
  { id_produk: "PRD-023", name: "Teacona", price: 68000, hpp: 42850 },
];

export async function GET() {
  try {
    await query(`
      CREATE SCHEMA IF NOT EXISTS master;
      CREATE TABLE IF NOT EXISTS master.produk_baru (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        id_produk TEXT NOT NULL,
        name TEXT NOT NULL,
        price NUMERIC NOT NULL,
        hpp NUMERIC NOT NULL
      );
    `);

    const countRes = await query<{ count: number }>(`SELECT COUNT(*) FROM master.produk_baru`);
    if (Number(countRes[0].count) === 0) {
      for (const p of mockData) {
        await query(
          'INSERT INTO master.produk_baru (id, id_produk, name, price, hpp) VALUES ($1, $2, $3, $4, $5)',
          [randomUUID(), p.id_produk, p.name, p.price, p.hpp]
        );
      }
    }

    const rows = await query(`
      SELECT id, id_produk, name, price, hpp
      FROM master.produk_baru
      ORDER BY id_produk ASC
    `);
    
    return NextResponse.json(rows);
  } catch (err) {
    console.error("GET /api/master/produk-baru gagal:", err);
    return NextResponse.json({ error: "Gagal memuat data produk baru." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.id_produk || !body.name) {
      return NextResponse.json({ error: "ID Produk dan Nama wajib diisi." }, { status: 400 });
    }

    const newId = randomUUID();
    await query(
      'INSERT INTO master.produk_baru (id, id_produk, name, price, hpp) VALUES ($1, $2, $3, $4, $5)',
      [newId, body.id_produk, body.name, Number(body.price || 0), Number(body.hpp || 0)]
    );

    return NextResponse.json({ success: true, id: newId });
  } catch (err) {
    console.error("POST /api/master/produk-baru gagal:", err);
    return NextResponse.json({ error: "Gagal menyimpan data Produk." }, { status: 500 });
  }
}
