// Data dummy sementara untuk Iklan & ROAS. SEMUA ANGKA DI FILE INI FIKTIF — dipakai
// supaya tampilan bisa dicoba sebelum data Spending Ads/Order asli tersambung.
//
// TODO: Ganti temporary mock data ini ke database asli/API backend setelah backend
// tersedia. Sumber final idealnya:
// - marketing.ad_spending, marketing.ad_campaigns, marketing.ad_accounts
// - orders.orders, orders.order_items
// - master.platforms, master.stores, master.users_adv, master.products
// - analytics.ads_roas_daily, analytics.platform_ads_summary,
//   analytics.adv_performance_summary, analytics.campaign_performance_summary,
//   analytics.store_performance_summary
// JANGAN hapus bentuk tipe di marketingAdsRoasTypes.ts saat mengganti — cukup ganti
// sumber datanya di marketingAdsRoasService.ts.

import type {
  AdvRow, CampaignRow, DataReviewItem, DonutSlice, FilterOption, PlatformComparisonItem,
  PlatformRoasItem, Platform, StoreRow, TrendPoint,
} from "../types/marketingAdsRoasTypes";

export const PLATFORM_COLOR: Record<Platform, string> = { TikTok: "#E30613", Shopee: "#2563EB", "Meta Ads": "#7C3AED" };

const DAYS = ["12 Mei", "13 Mei", "14 Mei", "15 Mei", "16 Mei", "17 Mei", "18 Mei"];

export const trendMock: TrendPoint[] = [
  { label: DAYS[0]!, spending: 4_200_000, sales: 6_800_000 },
  { label: DAYS[1]!, spending: 8_100_000, sales: 9_400_000 },
  { label: DAYS[2]!, spending: 14_600_000, sales: 22_100_000 },
  { label: DAYS[3]!, spending: 24_300_000, sales: 33_200_000 },
  { label: DAYS[4]!, spending: 19_800_000, sales: 27_500_000 },
  { label: DAYS[5]!, spending: 22_400_000, sales: 30_900_000 },
  { label: DAYS[6]!, spending: 24_100_000, sales: 32_400_000 },
];

export const roasPerPlatformMock: PlatformRoasItem[] = [
  { platform: "TikTok", roas: 4.56, color: PLATFORM_COLOR.TikTok },
  { platform: "Shopee", roas: 3.21, color: PLATFORM_COLOR.Shopee },
  { platform: "Meta Ads", roas: 2.14, color: PLATFORM_COLOR["Meta Ads"] },
];

export const spendingDistributionMock: DonutSlice[] = [
  { label: "TikTok", value: 62_800_000, color: PLATFORM_COLOR.TikTok },
  { label: "Shopee", value: 38_500_000, color: PLATFORM_COLOR.Shopee },
  { label: "Meta Ads", value: 27_400_000, color: PLATFORM_COLOR["Meta Ads"] },
];

export const salesPerPlatformDonutMock: DonutSlice[] = [
  { label: "TikTok", value: 285_900_000, color: PLATFORM_COLOR.TikTok },
  { label: "Shopee", value: 146_200_000, color: PLATFORM_COLOR.Shopee },
  { label: "Meta Ads", value: 80_300_000, color: PLATFORM_COLOR["Meta Ads"] },
];

export const comparisonPerPlatformMock: PlatformComparisonItem[] = [
  { platform: "TikTok", spending: 62_800_000, sales: 285_900_000 },
  { platform: "Shopee", spending: 38_500_000, sales: 146_200_000 },
  { platform: "Meta Ads", spending: 27_400_000, sales: 80_300_000 },
];

export const advTableMock: AdvRow[] = [
  { rank: 1, adv: "Wahyu", platform: "TikTok", spending: 22_400_000, sales: 112_600_000, order: 398, leads: 620, roas: 5.02, costPerOrder: 56_281, closingRate: 64.2, status: "Bagus" },
  { rank: 2, adv: "Fian", platform: "Shopee", spending: 18_700_000, sales: 63_200_000, order: 214, leads: 402, roas: 3.38, costPerOrder: 87_383, closingRate: 53.2, status: "Cek" },
  { rank: 3, adv: "Bagas", platform: "Meta Ads", spending: 15_200_000, sales: 28_700_000, order: 96, leads: 288, roas: 1.89, costPerOrder: 158_333, closingRate: 33.3, status: "Evaluasi" },
  { rank: 4, adv: "Dinda", platform: "TikTok", spending: 12_800_000, sales: 45_100_000, order: 156, leads: 260, roas: 3.52, costPerOrder: 82_051, closingRate: 60.0, status: "Cek" },
  { rank: 5, adv: "Yoga", platform: "Shopee", spending: 9_600_000, sales: 18_900_000, order: 61, leads: 210, roas: 1.97, costPerOrder: 157_377, closingRate: 29.0, status: "Evaluasi" },
];

export const campaignTableMock: CampaignRow[] = [
  { rank: 1, campaign: "Amandia Diabetes", platform: "TikTok", adv: "Wahyu", spending: 6_200_000, sales: 37_800_000, order: 132, leads: 205, roas: 6.10, costPerOrder: 46_970, status: "Scale" },
  { rank: 2, campaign: "Probetes Herbal", platform: "TikTok", adv: "Dinda", spending: 8_500_000, sales: 39_600_000, order: 128, leads: 218, roas: 4.66, costPerOrder: 66_406, status: "Bagus" },
  { rank: 3, campaign: "Retargeting CRM", platform: "Meta Ads", adv: "Bagas", spending: 4_300_000, sales: 10_200_000, order: 34, leads: 96, roas: 2.37, costPerOrder: 126_471, status: "Cek" },
  { rank: 4, campaign: "Lookalike 1%", platform: "Shopee", adv: "Fian", spending: 5_100_000, sales: 16_900_000, order: 58, leads: 130, roas: 3.31, costPerOrder: 87_931, status: "Cek" },
  { rank: 5, campaign: "Amandia Shopee", platform: "Shopee", adv: "Yoga", spending: 4_000_000, sales: 9_800_000, order: 33, leads: 88, roas: 2.45, costPerOrder: 121_212, status: "Cek" },
];

export const storeTableMock: StoreRow[] = [
  { rank: 1, toko: "Probetes Official", platform: "TikTok", sales: 185_600_000, order: 452, roas: 4.21, produkTerlaris: "Probetes Herbal 24", status: "Bagus" },
  { rank: 2, toko: "Amandia Store", platform: "Shopee", sales: 110_400_000, order: 318, roas: 3.12, produkTerlaris: "Amandia 7", status: "Cek" },
  { rank: 3, toko: "Probetes CRM", platform: "Meta Ads", sales: 68_500_000, order: 178, roas: 2.02, produkTerlaris: "Ebook 90 Hari Remisi", status: "Evaluasi" },
  { rank: 4, toko: "Probetes Website", platform: "Website", sales: 42_300_000, order: 126, roas: 3.80, produkTerlaris: "Amandia 10", status: "Cek" },
  { rank: 5, toko: "Reseller Center", platform: "TikTok", sales: 35_600_000, order: 98, roas: 2.95, produkTerlaris: "Paket Probetes Herbal", status: "Cek" },
];

export const dataReviewMock: DataReviewItem[] = [
  { tipeData: "Spending Ads", platform: undefined, jumlah: 24, masalah: "ADV kosong", dampak: "Leaderboard ADV bisa tidak lengkap", rekomendasiAksi: "Lengkapi ADV di data Spending Ads", prioritas: "Tinggi" },
  { tipeData: "Order", platform: undefined, jumlah: 18, masalah: "Toko kosong", dampak: "Laporan toko bisa tidak akurat", rekomendasiAksi: "Lengkapi kolom toko saat import", prioritas: "Tinggi" },
  { tipeData: "Campaign", platform: undefined, jumlah: 12, masalah: "Spending kosong", dampak: "ROAS campaign tidak bisa dihitung", rekomendasiAksi: "Cek ulang file sumber Spending Ads", prioritas: "Sedang" },
  { tipeData: "Order", platform: undefined, jumlah: 9, masalah: "Platform kosong", dampak: "Order tidak masuk laporan per platform", rekomendasiAksi: "Review mapping platform saat import", prioritas: "Sedang" },
  { tipeData: "Spending Ads", platform: undefined, jumlah: 7, masalah: "Tanggal tidak valid", dampak: "Tren harian bisa meleset", rekomendasiAksi: "Validasi format tanggal sebelum import", prioritas: "Rendah" },
];

export const filterOptionsMock = {
  periode: [
    { value: "7hari", label: "7 Hari Terakhir" },
    { value: "30hari", label: "30 Hari Terakhir" },
    { value: "bulanini", label: "Bulan Ini" },
  ] satisfies FilterOption[],
  platform: [
    { value: "Semua", label: "Semua Platform" },
    { value: "TikTok", label: "TikTok" },
    { value: "Shopee", label: "Shopee" },
    { value: "Meta Ads", label: "Meta Ads" },
  ] satisfies FilterOption[],
  adv: [{ value: "Semua", label: "Semua ADV" }, ...advTableMock.map((a) => ({ value: a.adv, label: a.adv }))] satisfies FilterOption[],
  toko: [{ value: "Semua", label: "Semua Toko" }, ...storeTableMock.map((s) => ({ value: s.toko, label: s.toko }))] satisfies FilterOption[],
  campaign: [{ value: "Semua", label: "Semua Campaign" }, ...campaignTableMock.map((c) => ({ value: c.campaign, label: c.campaign }))] satisfies FilterOption[],
  produk: [
    { value: "Semua", label: "Semua Produk" },
    { value: "Probetes Herbal 24", label: "Probetes Herbal 24" },
    { value: "Amandia 7", label: "Amandia 7" },
    { value: "Ebook 90 Hari Remisi", label: "Ebook 90 Hari Remisi" },
  ] satisfies FilterOption[],
};

export const UPDATE_TERAKHIR = "18 Mei 2026 10:30 WIB";
