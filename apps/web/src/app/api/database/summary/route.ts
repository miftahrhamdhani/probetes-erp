import { NextResponse } from "next/server";
import { toErrorResponse } from "@/server/common/errors";
import { getDatabaseSummary } from "@/server/modules/database/summary.service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json(await getDatabaseSummary());
  } catch (err) {
    console.error("GET /api/database/summary gagal:", err);
    return toErrorResponse(err, "Gagal memuat ringkasan data.");
  }
}
