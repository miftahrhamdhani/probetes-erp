import { NextRequest, NextResponse } from "next/server";
import { cancelImportBatch, ImportServiceError } from "@/server/modules/marketing/import/import.service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { previewId?: string; batchId?: string };
    const batchId = String(body.previewId ?? body.batchId ?? "").trim();
    if (!batchId) return NextResponse.json({ error: "Preview import tidak ditemukan." }, { status: 400 });
    await cancelImportBatch(batchId);
    return NextResponse.json({ success: true, message: "Import dibatalkan." });
  } catch (error) {
    if (error instanceof ImportServiceError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("POST /api/marketing/import/cancel gagal:", error);
    return NextResponse.json({ error: "Import gagal dibatalkan." }, { status: 500 });
  }
}
