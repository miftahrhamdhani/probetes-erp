// Analisis retensi tonton video/materi iklan — cuma tersedia untuk Meta & TikTok
// (Shopee tidak punya kolom video watch-through di skema ads-nya).
// Nama kolom di bawah sudah diverifikasi ke file export asli, bukan tebakan.

/** Sekelompok baris mentah milik satu sumber (satu entri riwayat import, atau dummy). */
export interface VideoRowSource {
  platform: string;
  rows: Record<string, string>[];
}

export interface VideoRow {
  entity: string; // Judul video (TikTok) atau Nama kampanye (Meta) — mana yang ada
  platform: string;
  spend: number;
  omzet: number;
  stages: { label: string; value: number }[]; // tahap retensi baris ini (25/50/75/selesai)
  hookRate: number | null; // retensi 2 detik pertama (TikTok saja), null kalau tidak ada
}

const toNumber = (v: string | undefined): number => {
  if (!v) return 0;
  const n = Number(String(v).replace(/[^0-9.-]/g, ""));
  return isNaN(n) ? 0 : n;
};

const pickField = (row: Record<string, string>, keys: string[]): string => {
  for (const k of keys) {
    const v = row[k];
    if (v !== undefined && v.trim() !== "" && v !== "-") return v;
  }
  return "";
};

const SPEND_KEYS = ["Jumlah yang dibelanjakan (IDR)", "Biaya"];
const OMZET_KEYS = ["Nilai konversi pembelian", "Omzet Penjualan", "Pendapatan kotor"];

/** Ambil semua baris (dari riwayat Spending Ads, atau dummy) yang punya data retensi video,
 * dinormalisasi ke tahap yang sama (25% / 50% / 75% / Selesai). */
export function extractVideoRows(sources: VideoRowSource[]): VideoRow[] {
  const results: VideoRow[] = [];

  sources.forEach((source) => {
    source.rows.forEach((row) => {
      // Meta: "Video Diputar hingga 25/50/75/95%". TikTok: "Rasio tayang video iklan 25/50/75/100%".
      const p25 = pickField(row, ["Video Diputar hingga 25%", "Rasio tayang video iklan 25%"]);
      const p50 = pickField(row, ["Video Diputar hingga 50%", "Rasio tayang video iklan 50%"]);
      const p75 = pickField(row, ["Video Diputar hingga 75%", "Rasio tayang video iklan 75%"]);
      const pEnd = pickField(row, ["Video Diputar hingga 95%", "Rasio tayang video iklan 100%"]);
      const hook = pickField(row, ["Rasio tayang video iklan 2 detik"]);

      // Kalau tidak ada satupun kolom retensi di baris ini, lewati (mis. baris Shopee).
      if (!p25 && !p50 && !p75 && !pEnd) return;

      const entity = pickField(row, ["Judul video", "Nama kampanye", "Nama Iklan"]) || "-";

      results.push({
        entity,
        platform: source.platform,
        spend: toNumber(pickField(row, SPEND_KEYS)),
        omzet: toNumber(pickField(row, OMZET_KEYS)),
        stages: [
          { label: "Mulai", value: 100 },
          { label: "25%", value: toNumber(p25) },
          { label: "50%", value: toNumber(p50) },
          { label: "75%", value: toNumber(p75) },
          { label: "Selesai", value: toNumber(pEnd) },
        ],
        hookRate: hook ? toNumber(hook) : null,
      });
    });
  });

  return results;
}

/** Rata-ratakan retensi semua video/campaign jadi satu funnel keseluruhan. */
export function averageFunnel(rows: VideoRow[]): { label: string; value: number }[] {
  if (rows.length === 0) return [];
  const stageLabels = rows[0]!.stages.map((s) => s.label);
  return stageLabels.map((label, i) => ({
    label,
    value: rows.reduce((sum, r) => sum + (r.stages[i]?.value ?? 0), 0) / rows.length,
  }));
}
