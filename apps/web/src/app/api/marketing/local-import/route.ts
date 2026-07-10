import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Tidak dipakai oleh dashboard Iklan & ROAS. Disisakan aman sebagai no-op supaya tidak
// mengunci sistem ke folder lokal; data contoh dashboard sekarang ada langsung di frontend.
export async function GET() {
  return NextResponse.json([]);
}
