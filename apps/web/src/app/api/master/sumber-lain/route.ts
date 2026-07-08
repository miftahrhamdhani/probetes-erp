import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

const SQL = `
  SELECT
    nama AS name,
    CASE jenis
      WHEN 'kategori_affiliate' THEN 'Kategori'
      WHEN 'placeholder' THEN 'Penanda'
      WHEN 'channel_sumber' THEN 'Sumber'
      WHEN 'toko_brand' THEN 'Toko/Brand'
      WHEN 'mitra' THEN 'Mitra'
      WHEN 'id_nyasar' THEN 'Salah Input'
      ELSE jenis
    END AS jenis,
    order_count AS orders
  FROM master.sumber_lain
  ORDER BY source_id
`;

export async function GET() {
  try {
    return NextResponse.json(await query(SQL));
  } catch (err) {
    console.error("GET /api/master/sumber-lain gagal:", err);
    return NextResponse.json({ error: "Gagal memuat data sumber lain." }, { status: 500 });
  }
}
