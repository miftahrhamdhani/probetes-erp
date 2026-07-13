// Service layer Iklan & ROAS — semua halaman memanggil fungsi di sini, bukan membaca
// temporaryAdsRoasMockData.ts langsung, supaya nanti tinggal ganti isi fungsi ini ke
// query database/API asli tanpa menyentuh komponen halaman.
//
// TODO (setelah database/API siap): ganti isi tiap fungsi di bawah dengan fetch ke
// endpoint /api/marketing/ads-roas/* yang membaca marketing.ad_spending,
// marketing.ad_campaigns, marketing.ad_accounts, orders.orders, orders.order_items,
// master.platforms/stores/users_adv/products, analytics.ads_roas_daily,
// analytics.platform_ads_summary, analytics.adv_performance_summary,
// analytics.campaign_performance_summary, analytics.store_performance_summary.

import {
  advTableMock, campaignTableMock, comparisonPerPlatformMock, dataReviewMock,
  filterOptionsMock, roasPerPlatformMock, salesPerPlatformDonutMock,
  spendingDistributionMock, storeTableMock, trendMock, UPDATE_TERAKHIR,
} from "../data/temporaryAdsRoasMockData";
import { calculateClosingRate, calculateCostPerOrder, calculateRoas, getRoasStatus, median } from "./marketingAdsRoasUtils";
import type {
  AdsRoasFilters, AdsRoasKpi, AdsRoasSummary, AdvPerformanceData, AdvRow,
  CampaignPerformanceData, CampaignRow, DataReviewData, Platform, StoreRow,
  StorePerformanceData,
} from "../types/marketingAdsRoasTypes";

const simulateLatency = <T,>(value: T): Promise<T> => new Promise((resolve) => setTimeout(() => resolve(value), 180));

function buildKpi(rows: { spending: number; sales: number; order: number; leads: number }[]): AdsRoasKpi[] {
  const totalSpending = rows.reduce((s, r) => s + r.spending, 0);
  const totalSales = rows.reduce((s, r) => s + r.sales, 0);
  const totalOrder = rows.reduce((s, r) => s + r.order, 0);
  const totalLeads = rows.reduce((s, r) => s + r.leads, 0);
  const roas = calculateRoas(totalSales, totalSpending);
  const costPerOrder = calculateCostPerOrder(totalSpending, totalOrder);
  const closingRate = calculateClosingRate(totalOrder, totalLeads);

  return [
    { label: "Total Spending Ads", value: totalSpending > 0 ? formatRp(totalSpending) : "Rp0", icon: "wallet", delta: { pct: 14.6, goodWhenUp: true }, caption: "vs 7 hari sebelumnya" },
    { label: "Total Sales", value: formatRp(totalSales), icon: "cart", delta: { pct: 18.2, goodWhenUp: true }, caption: "vs 7 hari sebelumnya" },
    { label: "ROAS", value: totalSpending > 0 ? `${roas.toFixed(2)}x` : "-", icon: "target", delta: { pct: 9.3, goodWhenUp: true }, caption: "vs 7 hari sebelumnya" },
    { label: "Total Order", value: totalOrder.toLocaleString("id-ID"), icon: "receipt", delta: { pct: 9.2, goodWhenUp: true }, caption: "vs 7 hari sebelumnya" },
    { label: "Cost per Order", value: totalOrder > 0 ? formatRp(Math.round(costPerOrder)) : "-", icon: "wallet-cards", delta: { pct: -1.8, goodWhenUp: false }, caption: "vs 7 hari sebelumnya" },
    { label: "Total Leads", value: totalLeads.toLocaleString("id-ID"), icon: "users", delta: { pct: 12.5, goodWhenUp: true }, caption: "vs 7 hari sebelumnya" },
    { label: "Closing Rate", value: totalLeads > 0 ? `${closingRate.toFixed(1)}%` : "-", icon: "trending-up", delta: { pct: -2.1, goodWhenUp: true }, caption: "vs 7 hari sebelumnya" },
  ];
}

function formatRp(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1_000_000_000) return `Rp${(n / 1_000_000_000).toLocaleString("id-ID", { maximumFractionDigits: 2 })} M`;
  if (abs >= 1_000_000) return `Rp${(n / 1_000_000).toLocaleString("id-ID", { maximumFractionDigits: 1 })} jt`;
  if (abs >= 1_000) return `Rp${(n / 1_000).toLocaleString("id-ID", { maximumFractionDigits: 0 })} rb`;
  return `Rp${n.toLocaleString("id-ID")}`;
}

// Total KPI Overview memakai angka fix dari mockup (128,7 jt / 512,4 jt / 3,98x / 1.248 / dst)
// supaya konsisten persis dengan referensi visual, sementara tabel per-entitas tetap
// dihitung dari rumus utils agar status (Bagus/Cek/Evaluasi) selalu benar bila mock diubah.
const OVERVIEW_KPI: AdsRoasKpi[] = [
  { label: "Total Spending Ads", value: "Rp128,7 jt", icon: "wallet", delta: { pct: 14.6, goodWhenUp: true }, caption: "vs 7 hari sebelumnya" },
  { label: "Total Sales", value: "Rp512,4 jt", icon: "cart", delta: { pct: 18.2, goodWhenUp: true }, caption: "vs 7 hari sebelumnya" },
  { label: "ROAS", value: "3,98x", icon: "target", delta: { pct: 9.3, goodWhenUp: true }, caption: "vs 7 hari sebelumnya" },
  { label: "Total Order", value: "1.248", icon: "receipt", delta: { pct: 9.2, goodWhenUp: true }, caption: "vs 7 hari sebelumnya" },
  { label: "Cost per Order", value: "Rp103.450", icon: "wallet-cards", delta: { pct: -1.8, goodWhenUp: false }, caption: "vs 7 hari sebelumnya" },
  { label: "Total Leads", value: "3.521", icon: "users", delta: { pct: 12.5, goodWhenUp: true }, caption: "vs 7 hari sebelumnya" },
  { label: "Closing Rate", value: "35,5%", icon: "trending-up", delta: { pct: -2.1, goodWhenUp: true }, caption: "vs 7 hari sebelumnya" },
];

export async function getAdsRoasOverview(_filters: AdsRoasFilters): Promise<AdsRoasSummary> {
  return simulateLatency({
    filters: filterOptionsMock,
    updateTerakhir: UPDATE_TERAKHIR,
    kpi: OVERVIEW_KPI,
    trend: trendMock,
    roasPerPlatform: roasPerPlatformMock,
    spendingDistribution: spendingDistributionMock,
    salesPerPlatformDonut: salesPerPlatformDonutMock,
    comparisonPerPlatform: comparisonPerPlatformMock,
    topAdv: advTableMock,
    topCampaign: campaignTableMock,
    topStore: storeTableMock,
    dataReview: dataReviewMock,
  });
}

export async function getAdsRoasByPlatform(platform: Platform, _filters: AdsRoasFilters): Promise<AdsRoasSummary> {
  const adv = advTableMock.filter((a) => a.platform === platform);
  const campaign = campaignTableMock.filter((c) => c.platform === platform);
  const store = storeTableMock.filter((s) => s.platform === platform);
  const totalSpending = campaign.reduce((s, c) => s + c.spending, 0);
  const totalSales = campaign.reduce((s, c) => s + c.sales, 0);
  const totalOrder = campaign.reduce((s, c) => s + c.order, 0);
  const totalLeads = campaign.reduce((s, c) => s + c.leads, 0);
  const roas = calculateRoas(totalSales, totalSpending);

  return simulateLatency({
    filters: filterOptionsMock,
    updateTerakhir: UPDATE_TERAKHIR,
    kpi: buildKpi(campaign.map((c) => ({ spending: c.spending, sales: c.sales, order: c.order, leads: c.leads }))),
    trend: trendMock.map((t) => {
      const spendRatio = totalSpending / Math.max(1, campaignTableMock.reduce((s, c) => s + c.spending, 0));
      const salesRatio = totalSales / Math.max(1, campaignTableMock.reduce((s, c) => s + c.sales, 0));
      return { ...t, spending: Math.round(t.spending * spendRatio) || 0, sales: Math.round(t.sales * salesRatio) || 0 };
    }),
    roasPerPlatform: roasPerPlatformMock.filter((r) => r.platform === platform),
    spendingDistribution: spendingDistributionMock.filter((s) => s.label === platform),
    salesPerPlatformDonut: salesPerPlatformDonutMock.filter((s) => s.label === platform),
    comparisonPerPlatform: comparisonPerPlatformMock.filter((c) => c.platform === platform),
    topAdv: adv,
    topCampaign: campaign,
    topStore: store,
    dataReview: dataReviewMock.filter((d) => !d.platform || d.platform === platform),
  });
}

export async function getAdvPerformance(_filters: AdsRoasFilters): Promise<AdvPerformanceData> {
  const table = advTableMock;
  const best = [...table].sort((a, b) => b.roas - a.roas)[0];
  return simulateLatency({
    filters: filterOptionsMock,
    kpi: buildKpi(table),
    bestAdv: best ? { name: best.adv, roas: best.roas } : { name: "-", roas: 0 },
    roasPerAdv: table.map((a) => ({ name: a.adv, value: a.roas })),
    spendingPerAdv: table.map((a) => ({ name: a.adv, value: a.spending })),
    salesPerAdv: table.map((a) => ({ name: a.adv, value: a.sales })),
    table,
  });
}

export async function getCampaignPerformance(_filters: AdsRoasFilters): Promise<CampaignPerformanceData> {
  const table = campaignTableMock;
  return simulateLatency({
    filters: filterOptionsMock,
    kpi: buildKpi(table),
    topByRoas: [...table].sort((a, b) => b.roas - a.roas).map((c) => ({ name: c.campaign, value: c.roas })),
    topBySales: [...table].sort((a, b) => b.sales - a.sales).map((c) => ({ name: c.campaign, value: c.sales })),
    topBySpending: [...table].sort((a, b) => b.spending - a.spending).map((c) => ({ name: c.campaign, value: c.spending })),
    lowRoas: [...table].sort((a, b) => a.roas - b.roas).slice(0, 3),
    table,
  });
}

export async function getStorePerformance(_filters: AdsRoasFilters): Promise<StorePerformanceData> {
  const table = storeTableMock;
  const totalSales = table.reduce((s, r) => s + r.sales, 0);
  const donutColors = ["#E30613", "#2563EB", "#7C3AED", "#F59E0B", "#059669"];
  return simulateLatency({
    filters: filterOptionsMock,
    kpi: buildKpi(table.map((s) => ({ spending: s.sales / Math.max(0.1, s.roas), sales: s.sales, order: s.order, leads: 0 }))),
    salesPerStore: table.map((s) => ({ name: s.toko, value: s.sales })),
    orderPerStore: table.map((s) => ({ name: s.toko, value: s.order })),
    salesContributionDonut: table.map((s, i) => ({ label: s.toko, value: s.sales, color: donutColors[i % donutColors.length]! })),
    table,
  });
}

export async function getAdsRoasDataReview(_filters: AdsRoasFilters): Promise<DataReviewData> {
  const table = dataReviewMock;
  const totalIssue = table.reduce((s, r) => s + r.jumlah, 0);
  const issueColors = ["#E30613", "#2563EB", "#7C3AED", "#F59E0B", "#059669"];
  return simulateLatency({
    filters: filterOptionsMock,
    kpi: [
      { label: "Total Issue", value: totalIssue.toLocaleString("id-ID"), icon: "alert-triangle" },
      { label: "Prioritas Tinggi", value: table.filter((r) => r.prioritas === "Tinggi").reduce((s, r) => s + r.jumlah, 0).toLocaleString("id-ID"), icon: "alert-octagon" },
      { label: "Prioritas Sedang", value: table.filter((r) => r.prioritas === "Sedang").reduce((s, r) => s + r.jumlah, 0).toLocaleString("id-ID"), icon: "alert-circle" },
      { label: "Prioritas Rendah", value: table.filter((r) => r.prioritas === "Rendah").reduce((s, r) => s + r.jumlah, 0).toLocaleString("id-ID"), icon: "info" },
    ],
    issueTypeDonut: table.map((r, i) => ({ label: r.masalah, value: r.jumlah, color: issueColors[i % issueColors.length]! })),
    issuePerType: table.map((r) => ({ name: r.tipeData, value: r.jumlah })),
    table,
  });
}

// Re-export util yang dibutuhkan modul lain agar tidak perlu import langsung dari utils
// (mempersempit permukaan API service layer).
export { getRoasStatus, median };
