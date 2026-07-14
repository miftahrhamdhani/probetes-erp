import { NextRequest, NextResponse } from "next/server";
import {
  createImportOption,
  getImportOptions,
  ImportServiceError,
  isImportPlatform,
} from "@/server/modules/marketing/import/import.service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    return NextResponse.json({ success: true, data: await getImportOptions() });
  } catch (error) {
    console.error("GET /api/marketing/import/options gagal:", error);
    return NextResponse.json({ error: "Pilihan ADV dan toko gagal dimuat." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { platform?: string; type?: string; label?: string };
    if (!body.platform || !isImportPlatform(body.platform)) {
      return NextResponse.json({ error: "Platform tidak valid." }, { status: 400 });
    }
    if (body.type !== "adv" && body.type !== "store") {
      return NextResponse.json({ error: "Jenis pilihan tidak valid." }, { status: 400 });
    }
    const data = await createImportOption({ platform: body.platform, type: body.type, label: body.label ?? "" });
    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    if (error instanceof ImportServiceError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("POST /api/marketing/import/options gagal:", error);
    return NextResponse.json({ error: "Pilihan baru gagal disimpan." }, { status: 500 });
  }
}
