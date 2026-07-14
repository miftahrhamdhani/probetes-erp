import { NextResponse } from "next/server";
import { getCustomersForMasterData } from "@/server/modules/master/customers/customers.service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json(await getCustomersForMasterData());
  } catch (err) {
    console.error("GET /api/master/customers gagal:", err);
    return NextResponse.json({ error: "Gagal memuat data pelanggan." }, { status: 500 });
  }
}
