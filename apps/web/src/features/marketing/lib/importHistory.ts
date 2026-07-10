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

// Contoh riwayat (data dummy) supaya tombol Lihat/Download/laporan ROAS bisa langsung dicoba
// sebelum ada import sungguhan di sesi ini.
export const seedHistory: ImportHistoryEntry[] = [
  {
    id: "IMP-0002", waktu: "01 Jul 2026 09:12", platform: "meta", jenis: "order",
    adv: null, toko: "Akuisisi (Skalev)", periode: "Juni 2026", fileName: "scalev_order_juni.csv",
    rowCount: 2, status: "Selesai",
    rows: [
      { "Tanggal Pesanan": "2026-06-01 03:33:54", Platform: "Meta / Akuisisi", Toko: "Akuisisi (Skalev)", Customer: "Fransco Tentua", "No HP": "6285243335327", Produk: "UPDM - Ebook Remisi", "Total Bayar": "Rp89.000" },
      { "Tanggal Pesanan": "2026-06-01 15:16:01", Platform: "Meta / Akuisisi", Toko: "Akuisisi (Skalev)", Customer: "Dewi Eka", "No HP": "6287878751314", Produk: "UPDM - Ebook Remisi", "Total Bayar": "Rp145.000" },
    ],
  },
  {
    id: "IMP-0001", waktu: "30 Jun 2026 19:50", platform: "shopee", jenis: "ads",
    adv: "Adv Bagas", toko: "Probetes Herbal", periode: "Juni 2026", fileName: "Data-+Semua-Iklan-Produk-01_06_2026-30_06_2026.csv",
    rowCount: 2, status: "Selesai",
    rows: [
      { Platform: "Shopee", ADV: "Adv Bagas", Toko: "Probetes Herbal", "Nama Iklan": "Shop GMV Max", Status: "Dijeda", Biaya: "278.838" },
      { Platform: "Shopee", ADV: "Adv Bagas", Toko: "Probetes Herbal", "Nama Iklan": "Probetes Herbal Diabetes U...", Status: "Berjalan", Biaya: "940.442" },
    ],
  },
];
