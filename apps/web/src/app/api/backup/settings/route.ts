import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

interface SettingsRow {
  schedule: string;
  folder_path: string;
  updated_at: string;
}

const VALID_SCHEDULES = ["manual", "daily", "weekly", "monthly"];

export async function GET() {
  try {
    const rows = await query<SettingsRow>(
      "SELECT schedule, folder_path, updated_at FROM system.backup_settings WHERE id = 1",
    );
    return NextResponse.json(rows[0] ?? { schedule: "manual", folder_path: "", updated_at: null });
  } catch (err) {
    console.error("GET /api/backup/settings gagal:", err);
    return NextResponse.json({ error: "Gagal memuat pengaturan cadangan." }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const schedule = String(body.schedule ?? "");
    const folderPath = String(body.folderPath ?? "").trim();

    if (!VALID_SCHEDULES.includes(schedule)) {
      return NextResponse.json({ error: "Jadwal tidak valid." }, { status: 400 });
    }
    if (!folderPath) {
      return NextResponse.json({ error: "Folder tujuan tidak boleh kosong." }, { status: 400 });
    }

    await query(
      `UPDATE system.backup_settings SET schedule = $1, folder_path = $2, updated_at = now() WHERE id = 1`,
      [schedule, folderPath],
    );
    const rows = await query<SettingsRow>(
      "SELECT schedule, folder_path, updated_at FROM system.backup_settings WHERE id = 1",
    );
    return NextResponse.json(rows[0]);
  } catch (err) {
    console.error("PUT /api/backup/settings gagal:", err);
    return NextResponse.json({ error: "Gagal menyimpan pengaturan cadangan." }, { status: 500 });
  }
}
