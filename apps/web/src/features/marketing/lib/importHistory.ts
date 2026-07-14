// Tipe & helper Riwayat Import — dipakai bersama oleh halaman Import (yang menulis riwayat)
// dan halaman lain seperti Iklan & ROAS (yang membaca riwayat lewat ImportHistoryContext).

export type Platform = "tiktok" | "shopee" | "meta";
export type ImportType = "ads" | "order";

export const platformLabel: Record<Platform, string> = {
  tiktok: "TikTok Shop",
  shopee: "Shopee",
  meta: "Meta / Akuisisi",
};

/** Satu baris riwayat import. `rows` = snapshot data yang SUDAH diformat rapi
 * (persis seperti tampilan preview yang disetujui user), bukan data mentah CSV/Excel —
 * jadi "Lihat", "Download", dan laporan Iklan & ROAS tidak perlu menebak ulang mapping kolom. */
export interface ImportHistoryEntry {
  id: string;
  waktu: string;
  platform: Platform;
  jenis: ImportType;
  adv: string | null;
  toko: string | null;
  periode: string;
  fileName: string;
  rowCount: number;
  status: "Selesai" | "Diproses" | "Perlu Dicek";
  rows: Record<string, string>[];
}

export const historyLabel = (h: ImportHistoryEntry) => {
  const plat = platformLabel[h.platform];
  const detail = h.jenis === "ads" ? `ADV: ${h.adv} • Toko: ${h.toko}` : `Toko: ${h.toko}`;
  return `${plat} • ${detail}${h.periode ? ` • ${h.periode}` : ""}`;
};

/** Unduh array-of-object sebagai file CSV (dengan BOM biar Excel baca UTF-8 dengan benar). */
export function downloadCsv(filename: string, rows: Record<string, string>[]) {
  if (rows.length === 0) return;
  const headers = Object.keys(rows[0]!);
  const escape = (v: unknown) => {
    const s = String(v ?? "");
    return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [headers.map(escape).join(","), ...rows.map((r) => headers.map((h) => escape(r[h])).join(","))];
  const csv = "﻿" + lines.join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
