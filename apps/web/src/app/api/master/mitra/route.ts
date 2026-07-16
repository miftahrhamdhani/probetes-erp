import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { randomUUID } from "crypto";

export const dynamic = "force-dynamic";

const mockData = [
  { id_mitra: "MTR-001", name: "UP DM", original: "UP DM / UPDM / UP / UP DN / Up dm / UP DM. ." },
  { id_mitra: "MTR-002", name: "JAWARA", original: "JAWARA / Jawara / JJAWARA / JAWAERA" },
  { id_mitra: "MTR-003", name: "SETIYA", original: "SETIYA" },
  { id_mitra: "MTR-004", name: "SNS", original: "SNS" },
  { id_mitra: "MTR-005", name: "Tumbuhpedia", original: "Tumbuhpedia / TUMBUHPEDIA" },
  { id_mitra: "MTR-006", name: "Teman Diet", original: "Teman diet" },
];

export async function GET() {
  try {
    await query(`
      CREATE SCHEMA IF NOT EXISTS master;
      CREATE TABLE IF NOT EXISTS master.mitra_data (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        id_mitra TEXT NOT NULL,
        name TEXT NOT NULL,
        original TEXT NOT NULL
      );
    `);

    const countRes = await query<{ count: number }>(`SELECT COUNT(*) FROM master.mitra_data`);
    if (Number(countRes[0].count) === 0) {
      for (const m of mockData) {
        await query(
          'INSERT INTO master.mitra_data (id, id_mitra, name, original) VALUES ($1, $2, $3, $4)',
          [randomUUID(), m.id_mitra, m.name, m.original]
        );
      }
    }

    const rows = await query(`
      SELECT id, id_mitra, name, original
      FROM master.mitra_data
      ORDER BY id_mitra ASC
    `);
    
    return NextResponse.json(rows);
  } catch (err) {
    console.error("GET /api/master/mitra gagal:", err);
    return NextResponse.json({ error: "Gagal memuat data mitra." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.id_mitra || !body.name) {
      return NextResponse.json({ error: "ID Mitra dan Nama wajib diisi." }, { status: 400 });
    }

    const newId = randomUUID();
    await query(
      'INSERT INTO master.mitra_data (id, id_mitra, name, original) VALUES ($1, $2, $3, $4)',
      [newId, body.id_mitra, body.name, body.original || ""]
    );

    return NextResponse.json({ success: true, id: newId });
  } catch (err) {
    console.error("POST /api/master/mitra gagal:", err);
    return NextResponse.json({ error: "Gagal menyimpan data Mitra." }, { status: 500 });
  }
}
