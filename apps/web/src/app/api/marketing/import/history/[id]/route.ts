import { NextRequest, NextResponse } from "next/server";
import { getImportHistoryDetail, ImportServiceError } from "@/server/modules/marketing/import/import.service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    return NextResponse.json({ success: true, data: await getImportHistoryDetail(id) });
  } catch (error) {
    if (error instanceof ImportServiceError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("GET /api/marketing/import/history/:id gagal:", error);
    return NextResponse.json({ error: "Detail riwayat import gagal dimuat." }, { status: 500 });
  }
}
