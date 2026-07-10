// Menyatukan angka Spend/Omzet/ROAS/Pembelian dari Spending Ads TikTok, Shopee, dan Meta
// agar bisa dibandingkan di satu dashboard — walau nama kolom asli tiap platform beda-beda.
// Nama kolom di bawah sudah diverifikasi langsung ke file export asli tiap platform
// (bukan tebakan), jadi aman dipakai khusus untuk level agregasi/laporan ini.
import type { ImportHistoryEntry, Platform } from "./importHistory";

export interface CampaignMetric {
  campaign: string;
  spend: number;
  omzet: number;
  pembelian: number;
}

export interface PlatformMetrics {
  platform: Platform;
  spend: number;
  omzet: number;
  pembelian: number;
  /** ROAS dihitung dari TOTAL omzet/spend gabungan, bukan rata-rata ROAS per baris. */
  roas: number;
  campaignCount: number;
  campaigns: CampaignMetric[];
}

const SPEND_KEYS = ["Jumlah yang dibelanjakan (IDR)", "Biaya"];
const OMZET_KEYS = ["Nilai konversi pembelian", "Omzet Penjualan", "Pendapatan kotor"];
const PEMBELIAN_KEYS = ["Pembelian", "Konversi", "Pesanan SKU", "Produk Terjual"];
const CAMPAIGN_KEYS = ["Nama kampanye", "Nama Iklan"];

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

/** Jumlahkan semua baris Spending Ads (dari riwayat import) milik satu platform,
 * dikelompokkan per nama kampanye. */
export function aggregatePlatformMetrics(adsEntries: ImportHistoryEntry[], platform: Platform): PlatformMetrics {
  const campaignMap = new Map<string, CampaignMetric>();
  let spend = 0, omzet = 0, pembelian = 0;

  adsEntries
    .filter((e) => e.platform === platform)
    .forEach((entry) => {
      entry.rows.forEach((row) => {
        const s = toNumber(pickField(row, SPEND_KEYS));
        const o = toNumber(pickField(row, OMZET_KEYS));
        const p = toNumber(pickField(row, PEMBELIAN_KEYS));
        const campaign = pickField(row, CAMPAIGN_KEYS) || "-";
        spend += s;
        omzet += o;
        pembelian += p;
        const existing = campaignMap.get(campaign) ?? { campaign, spend: 0, omzet: 0, pembelian: 0 };
        existing.spend += s;
        existing.omzet += o;
        existing.pembelian += p;
        campaignMap.set(campaign, existing);
      });
    });

  return {
    platform,
    spend,
    omzet,
    pembelian,
    roas: spend > 0 ? omzet / spend : 0,
    campaignCount: campaignMap.size,
    campaigns: Array.from(campaignMap.values()).sort((a, b) => b.spend - a.spend),
  };
}

export interface AdvMetric {
  adv: string;
  spend: number;
  omzet: number;
  roas: number;
  campaignCount: number;
  platforms: Platform[]; // platform mana saja yang dipegang ADV ini
}

/** Leaderboard ADV — digabung lintas platform (1 ADV = 1 angka performa total),
 * karena tujuannya jadi bahan KPI orangnya, bukan per-platform. */
export function aggregateAdvMetrics(adsEntries: ImportHistoryEntry[]): AdvMetric[] {
  const advMap = new Map<string, { spend: number; omzet: number; campaigns: Set<string>; platforms: Set<Platform> }>();

  adsEntries.forEach((entry) => {
    if (!entry.adv) return;
    const bucket = advMap.get(entry.adv) ?? { spend: 0, omzet: 0, campaigns: new Set<string>(), platforms: new Set<Platform>() };
    bucket.platforms.add(entry.platform);
    entry.rows.forEach((row) => {
      const s = toNumber(pickField(row, SPEND_KEYS));
      const o = toNumber(pickField(row, OMZET_KEYS));
      bucket.spend += s;
      bucket.omzet += o;
      bucket.campaigns.add(pickField(row, CAMPAIGN_KEYS) || "-");
    });
    advMap.set(entry.adv, bucket);
  });

  return Array.from(advMap.entries())
    .map(([adv, b]) => ({
      adv,
      spend: b.spend,
      omzet: b.omzet,
      roas: b.spend > 0 ? b.omzet / b.spend : 0,
      campaignCount: b.campaigns.size,
      platforms: Array.from(b.platforms),
    }))
    .sort((a, b) => b.roas - a.roas);
}

export type HealthStatus = "rugi" | "perlu-dioptimasi" | "efisien";

/** Ambang batas status kesehatan campaign berdasarkan ROAS. */
export function campaignHealth(roas: number): { status: HealthStatus; label: string; tone: string } {
  if (roas < 1) return { status: "rugi", label: "Rugi", tone: "bg-red-100 text-red-800" };
  if (roas < 2) return { status: "perlu-dioptimasi", label: "Perlu Dioptimasi", tone: "bg-amber-100 text-amber-800" };
  return { status: "efisien", label: "Efisien", tone: "bg-emerald-100 text-emerald-800" };
}
