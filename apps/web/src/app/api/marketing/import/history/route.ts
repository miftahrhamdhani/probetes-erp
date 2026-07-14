import { NextRequest, NextResponse } from "next/server";
import { getImportHistory } from "@/server/modules/marketing/import/import.service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const limit = Number(request.nextUrl.searchParams.get("limit") ?? 20);
    return NextResponse.json({ success: true, data: await getImportHistory(limit) });
  } catch (error) {
    console.error("GET /api/marketing/import/history gagal:", error);
    return NextResponse.json({ error: "Riwayat import gagal dimuat." }, { status: 500 });
  }
}
