import { NextRequest, NextResponse } from "next/server";
import { toErrorResponse } from "@/server/common/errors";
import { getQualitySection, getQualitySummary } from "@/server/modules/data-quality/data-quality.service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const section = req.nextUrl.searchParams.get("section") ?? "summary";
  try {
    const data = section === "summary" ? await getQualitySummary() : await getQualitySection(section);
    return NextResponse.json(data);
  } catch (err) {
    console.error("GET /api/data-quality gagal:", err);
    return toErrorResponse(err, "Gagal memuat kualitas data.");
  }
}
