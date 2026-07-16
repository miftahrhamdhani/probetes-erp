import { NextRequest, NextResponse } from "next/server";
import type { AdminInputerUpdateInput, ImportPlatform } from "@/server/modules/marketing/import/import.types";
import { ImportServiceError, searchAdminInputerOrder, updateAdminInputerIdentity } from "@/server/modules/marketing/import/import.service";

export const dynamic = "force-dynamic";

function errorResponse(error: unknown) {
  if (error instanceof ImportServiceError) {
    const candidates = (error as ImportServiceError & { candidates?: unknown }).candidates;
    return NextResponse.json({ error: error.message, candidates }, { status: error.status });
  }
  console.error("Admin Inputer gagal:", error);
  return NextResponse.json({ error: "Permintaan Admin Inputer gagal diproses." }, { status: 500 });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { platform?: ImportPlatform; storeId?: string; orderId?: string; trackingNumber?: string };
    if (body.platform !== "tiktok" && body.platform !== "shopee") throw new ImportServiceError("Pilih platform TikTok Shop atau Shopee.");
    const data = await searchAdminInputerOrder({ platform: body.platform, storeId: String(body.storeId ?? ""), orderId: body.orderId, trackingNumber: body.trackingNumber });
    return NextResponse.json({ success: true, data });
  } catch (error) { return errorResponse(error); }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json() as Partial<AdminInputerUpdateInput> & Record<string, unknown>;
    const allowed = new Set(["orderId", "customerId", "customerVersion", "name", "phone", "address", "city", "province", "acknowledgeDuplicatePhone"]);
    const forbidden = Object.keys(body).filter((key) => !allowed.has(key));
    if (forbidden.length) throw new ImportServiceError(`Kolom tidak boleh diubah: ${forbidden.join(", ")}.`);
    const required = ["orderId", "customerId", "customerVersion", "name", "phone", "address", "city", "province"] as const;
    if (required.some((key) => typeof body[key] !== "string")) throw new ImportServiceError("Data koreksi pelanggan belum lengkap.");
    // ponytail: ganti dengan role session server-side saat IAM aktif; jangan percaya role dari browser.
    const data = await updateAdminInputerIdentity(body as unknown as AdminInputerUpdateInput);
    return NextResponse.json({ success: true, data });
  } catch (error) { return errorResponse(error); }
}
