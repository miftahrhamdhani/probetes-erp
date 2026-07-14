import { NextRequest, NextResponse } from "next/server";
import { ImportFileError } from "@/server/modules/marketing/import/parsers";
import {
  createImportPreview,
  ImportServiceError,
  isImportPlatform,
  isMarketplaceImportType,
} from "@/server/modules/marketing/import/import.service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const form = await request.formData();
    const file = form.get("file");
    const platform = String(form.get("platform") ?? "");
    const importType = String(form.get("importType") ?? "");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "File belum dipilih." }, { status: 400 });
    }
    if (!isImportPlatform(platform)) {
      return NextResponse.json({ error: "Platform tidak valid." }, { status: 400 });
    }
    if (!isMarketplaceImportType(importType)) {
      return NextResponse.json({ error: "Jenis import tidak valid." }, { status: 400 });
    }
    const advOptionId = String(form.get("advId") ?? "").trim() || null;
    const storeOptionId = String(form.get("storeId") ?? "").trim() || null;
    if (importType === "ads" && !advOptionId) {
      return NextResponse.json({ error: "Pilih ADV sebelum upload file Spending Ads." }, { status: 400 });
    }
    if (importType === "order" && !storeOptionId) {
      return NextResponse.json({ error: "Pilih Toko sebelum upload file Data Pesanan." }, { status: 400 });
    }
    const data = await createImportPreview({
      file,
      platform,
      importType,
      advOptionId,
      storeOptionId,
      periodLabel: String(form.get("period") ?? ""),
      note: String(form.get("note") ?? ""),
      importedBy: "app",
    });
    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    if (error instanceof ImportFileError || error instanceof ImportServiceError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("POST /api/marketing/import/preview gagal:", error);
    return NextResponse.json({ error: "File gagal diproses. Silakan periksa format dan coba lagi." }, { status: 500 });
  }
}
