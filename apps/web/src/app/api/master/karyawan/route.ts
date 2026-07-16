import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { randomUUID } from "crypto";

export const dynamic = "force-dynamic";

const mockData = [
  { name: "MIFTAH WISNU RAMDANI", role: "FULLSTACK DEVELOPER", divisi: "IT" },
  { name: "FARADISYA ALIMATUL IBDA", role: "ASISTAN KONSELOR", divisi: "SALES" },
  { name: "RHESELI SWASTY", role: "INPUTER DATA", divisi: "WAREHOUSE" },
  { name: "NOVITA SARI NUGRAINI", role: "CS", divisi: "MARKETING" },
  { name: "DESTI ROHINI", role: "CS", divisi: "MARKETING" },
  { name: "SARAH RAHMA NIYAR", role: "CRM", divisi: "SALES" },
  { name: "ANGGI AYU LESTARI", role: "CRM", divisi: "SALES" },
  { name: "IRMANDA DWI PRASETYO", role: "CRM", divisi: "SALES" },
  { name: "FENY NURAINI", role: "CRM", divisi: "SALES" },
  { name: "IMARA SALSABILA", role: "CONTENT CREATOR", divisi: "MARKETING" },
  { name: "LINA RAHMAWATI", role: "CONTENT CREATOR", divisi: "MARKETING" },
  { name: "ADNAN QURUNUL BAHRI", role: "CONTENT CREATOR", divisi: "MARKETING" },
  { name: "FADHIL IKHTIAR ANDARDANTO", role: "CONTENT CREATOR", divisi: "MARKETING" },
  { name: "IRFAN FEBRIAN", role: "ADV META", divisi: "MARKETING" },
  { name: "BAGAS AJI WIBOWO", role: "SPV MARKETING", divisi: "MANAJEMEN" },
  { name: "MUHAMMAD ARFIAN LUKMAN WIJANARKO", role: "ADV TIKTOK/SHOPEE", divisi: "SALES" },
  { name: "NUR DUROH MASLAKHAH", role: "MP/TIKTOK", divisi: "SALES" },
  { name: "CHARISMA TRIXIE ALFITRA", role: "MP/TIKTOK", divisi: "SALES" },
  { name: "NI'MAH LUTHFIANINGSIH", role: "SPV SALES", divisi: "MANAJEMEN" },
  { name: "PUSPITA INDAH", role: "FINANCE", divisi: "MANAJEMEN" },
  { name: "RAHMAN ARIEF DEWANTARA", role: "DIREKTUR", divisi: "MANAJEMEN" },
];

export async function GET() {
  try {
    // 1. Pastikan tabel master.karyawan ada
    await query(`
      CREATE SCHEMA IF NOT EXISTS master;
      CREATE TABLE IF NOT EXISTS master.karyawan (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        role TEXT NOT NULL,
        divisi TEXT NOT NULL
      );
    `);

    // 2. Cek apakah masih kosong. Kalau kosong, seed data awal 21 orang
    const countRes = await query<{ count: number }>(`SELECT COUNT(*) FROM master.karyawan`);
    if (Number(countRes[0]?.count ?? 0) === 0) {
      for (const user of mockData) {
        await query(
          'INSERT INTO master.karyawan (id, name, role, divisi) VALUES ($1, $2, $3, $4)',
          [randomUUID(), user.name, user.role, user.divisi]
        );
      }
    }

    // 3. Kembalikan semua data
    const rows = await query(`
      SELECT
        id,
        name,
        role,
        divisi
      FROM master.karyawan
      ORDER BY divisi ASC, name ASC
    `);
    return NextResponse.json(rows);
  } catch (err) {
    console.error("GET /api/master/karyawan gagal:", err);
    return NextResponse.json({ error: "Gagal memuat data Karyawan." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.name || !body.role || !body.divisi) {
      return NextResponse.json({ error: "Nama, role, dan divisi wajib diisi." }, { status: 400 });
    }

    const newId = randomUUID();
    await query(
      'INSERT INTO master.karyawan (id, name, role, divisi) VALUES ($1, $2, $3, $4)',
      [newId, body.name, body.role, body.divisi]
    );

    return NextResponse.json({ success: true, id: newId });
  } catch (err) {
    console.error("POST /api/master/karyawan gagal:", err);
    return NextResponse.json({ error: "Gagal menyimpan data Karyawan." }, { status: 500 });
  }
}
