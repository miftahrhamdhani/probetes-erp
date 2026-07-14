import { NextRequest, NextResponse } from "next/server";
import {
  deleteImportOption,
  ImportServiceError,
  updateImportOption,
} from "@/server/modules/marketing/import/import.service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = await request.json() as { label?: string };
    return NextResponse.json({ success: true, data: await updateImportOption(id, body.label ?? "") });
  } catch (error) {
    if (error instanceof ImportServiceError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("PATCH /api/marketing/import/options/:id gagal:", error);
    return NextResponse.json({ error: "Nama pilihan gagal diperbarui." }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    await deleteImportOption(id);
    return NextResponse.json({ success: true, message: "Pilihan berhasil dihapus." });
  } catch (error) {
    if (error instanceof ImportServiceError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("DELETE /api/marketing/import/options/:id gagal:", error);
    return NextResponse.json({ error: "Pilihan gagal dihapus." }, { status: 500 });
  }
}
