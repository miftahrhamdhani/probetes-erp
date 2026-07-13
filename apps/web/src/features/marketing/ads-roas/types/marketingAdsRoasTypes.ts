// Tipe data untuk Iklan & ROAS (Marketing → Iklan & ROAS). Halaman ini hanya untuk
// LAPORAN/ANALISIS iklan — input data tetap lewat menu Import Data Channel.

export type Platform = "TikTok" | "Shopee" | "Meta Ads";

export interface FilterOption {
  value: string;
  label: string;
}

export interface AdsRoasFilters {
  periode?: string;
  platform?: string;
  adv?: string;
  toko?: string;
  campaign?: string;
  produk?: string;
}

export interface Adv {
  name: string;
  platform: Platform;
}

export interface Store {
  name: string;
  platform: Platform;
}

export interface Campaign {
  name: string;
  platform: Platform;
  adv: string;
}

/** Satu baris data spending ads (dari Import Data Channel — bentuk sudah diringkas). */
export interface SpendingAdsRow {
  date: string; // ISO
  platform: Platform;
  adv: string;
  campaign: string;
  spending: number;
}

/** Satu baris data order/sales (dari Import Data Channel — bentuk sudah diringkas). */
export interface OrderSalesRow {
  date: string; // ISO
  platform: Platform;
  toko: string;
  produk: string;
  sales: number;
  order: number;
  leads: number;
}

export type RoasStatus = "Scale" | "Bagus" | "Cek" | "Evaluasi";

export interface DeltaValue {
  pct: number;
  goodWhenUp: boolean;
}

export interface AdsRoasKpi {
  label: string;
  value: string;
  icon: string;
  delta?: DeltaValue;
  caption?: string;
}

export interface TrendPoint {
  label: string;
  spending: number;
  sales: number;
}

export interface PlatformRoasItem {
  platform: Platform;
  roas: number;
  color: string;
}

export interface DonutSlice {
  label: string;
  value: number;
  color: string;
}

export interface PlatformComparisonItem {
  platform: Platform;
  spending: number;
  sales: number;
}

export interface AdvRow {
  rank: number;
  adv: string;
  platform: Platform;
  spending: number;
  sales: number;
  order: number;
  leads: number;
  roas: number;
  costPerOrder: number;
  closingRate: number;
  status: RoasStatus;
}

export interface CampaignRow {
  rank: number;
  campaign: string;
  platform: Platform;
  adv: string;
  spending: number;
  sales: number;
  order: number;
  leads: number;
  roas: number;
  costPerOrder: number;
  status: RoasStatus;
}

export interface StoreRow {
  rank: number;
  toko: string;
  // String (bukan Platform) karena toko bisa berasal dari channel di luar 3 platform iklan
  // utama (mis. Website, Reseller) — tetap tampil di Overview & Performa Toko, tapi tidak
  // ikut terfilter di tab TikTok/Shopee/Meta Ads.
  platform: string;
  sales: number;
  order: number;
  roas: number;
  produkTerlaris: string;
  status: RoasStatus;
}

export type ReviewPriority = "Tinggi" | "Sedang" | "Rendah";

export interface DataReviewItem {
  tipeData: string;
  platform?: Platform;
  jumlah: number;
  masalah: string;
  dampak: string;
  rekomendasiAksi: string;
  prioritas: ReviewPriority;
}

/** Ringkasan gabungan yang dipakai halaman Overview & per-platform. */
export interface AdsRoasSummary {
  filters: {
    periode: FilterOption[];
    platform: FilterOption[];
    adv: FilterOption[];
    toko: FilterOption[];
    campaign: FilterOption[];
    produk: FilterOption[];
  };
  updateTerakhir: string;
  kpi: AdsRoasKpi[];
  trend: TrendPoint[];
  roasPerPlatform: PlatformRoasItem[];
  spendingDistribution: DonutSlice[];
  salesPerPlatformDonut: DonutSlice[];
  comparisonPerPlatform: PlatformComparisonItem[];
  topAdv: AdvRow[];
  topCampaign: CampaignRow[];
  topStore: StoreRow[];
  dataReview: DataReviewItem[];
}

export interface AdvPerformanceData {
  filters: AdsRoasSummary["filters"];
  kpi: AdsRoasKpi[];
  bestAdv: { name: string; roas: number };
  roasPerAdv: { name: string; value: number }[];
  spendingPerAdv: { name: string; value: number }[];
  salesPerAdv: { name: string; value: number }[];
  table: AdvRow[];
}

export interface CampaignPerformanceData {
  filters: AdsRoasSummary["filters"];
  kpi: AdsRoasKpi[];
  topByRoas: { name: string; value: number }[];
  topBySales: { name: string; value: number }[];
  topBySpending: { name: string; value: number }[];
  lowRoas: CampaignRow[];
  table: CampaignRow[];
}

export interface StorePerformanceData {
  filters: AdsRoasSummary["filters"];
  kpi: AdsRoasKpi[];
  salesPerStore: { name: string; value: number }[];
  orderPerStore: { name: string; value: number }[];
  salesContributionDonut: DonutSlice[];
  table: StoreRow[];
}

export interface DataReviewData {
  filters: AdsRoasSummary["filters"];
  kpi: AdsRoasKpi[];
  issueTypeDonut: DonutSlice[];
  issuePerType: { name: string; value: number }[];
  table: DataReviewItem[];
}
