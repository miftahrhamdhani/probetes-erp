// Rumus & util perhitungan Iklan & ROAS — satu definisi dipakai halaman & (nanti) service
// database asli, supaya ROAS/Cost per Order/Closing Rate selalu konsisten.

import type { AdvRow, CampaignRow, OrderSalesRow, Platform, RoasStatus, SpendingAdsRow, StoreRow } from "../types/marketingAdsRoasTypes";

export const calculateTotalSpending = (rows: SpendingAdsRow[]): number => rows.reduce((sum, r) => sum + r.spending, 0);
export const calculateTotalSales = (rows: OrderSalesRow[]): number => rows.reduce((sum, r) => sum + r.sales, 0);

/** ROAS = Total Sales / Total Spending Ads. 0 kalau spending 0 (bukan NaN/Infinity). */
export const calculateRoas = (sales: number, spending: number): number => (spending > 0 ? sales / spending : 0);

/** Cost per Order = Total Spending Ads / Total Order. 0 kalau order 0. */
export const calculateCostPerOrder = (spending: number, order: number): number => (order > 0 ? spending / order : 0);

/** Closing Rate = Total Order / Total Leads (dalam %). 0 kalau leads 0. */
export const calculateClosingRate = (order: number, leads: number): number => (leads > 0 ? (order / leads) * 100 : 0);

/** Tampilan aman untuk rasio yang bisa "-" kalau pembaginya 0 — dipakai di format layer. */
export const isDivisible = (denominator: number): boolean => denominator > 0;

export function getRoasStatus(roas: number): RoasStatus {
  if (roas >= 4) return "Bagus";
  if (roas >= 2) return "Cek";
  return "Evaluasi";
}

/** Status campaign: ROAS tinggi + sales tinggi (di atas median grup) = Scale, selain itu ikut ambang ROAS biasa. */
export function getCampaignStatus(roas: number, sales: number, medianSales: number): RoasStatus | "Scale" {
  if (roas >= 4 && sales >= medianSales) return "Scale";
  return getRoasStatus(roas);
}

export function getBestPlatform<T extends { platform: Platform; roas: number }>(rows: T[]): T | undefined {
  return [...rows].sort((a, b) => b.roas - a.roas)[0];
}

export function getBestAdv(rows: AdvRow[]): AdvRow | undefined {
  return [...rows].sort((a, b) => b.roas - a.roas)[0];
}

export function getBestCampaign(rows: CampaignRow[]): CampaignRow | undefined {
  return [...rows].sort((a, b) => b.roas - a.roas)[0];
}

export function groupByPlatform<T extends { platform: Platform }>(rows: T[]): Record<Platform, T[]> {
  return rows.reduce(
    (acc, row) => {
      acc[row.platform] = [...(acc[row.platform] ?? []), row];
      return acc;
    },
    { TikTok: [], Shopee: [], "Meta Ads": [] } as Record<Platform, T[]>,
  );
}

export function groupByAdv<T extends { adv: string }>(rows: T[]): Record<string, T[]> {
  return rows.reduce<Record<string, T[]>>((acc, row) => {
    acc[row.adv] = [...(acc[row.adv] ?? []), row];
    return acc;
  }, {});
}

export function groupByCampaign<T extends { campaign: string }>(rows: T[]): Record<string, T[]> {
  return rows.reduce<Record<string, T[]>>((acc, row) => {
    acc[row.campaign] = [...(acc[row.campaign] ?? []), row];
    return acc;
  }, {});
}

export function groupByStore<T extends { toko: string }>(rows: T[]): Record<string, T[]> {
  return rows.reduce<Record<string, T[]>>((acc, row) => {
    acc[row.toko] = [...(acc[row.toko] ?? []), row];
    return acc;
  }, {});
}

export function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1]! + sorted[mid]!) / 2 : sorted[mid]!;
}

export function filterStoreTable(table: StoreRow[], platform?: string): StoreRow[] {
  return platform && platform !== "Semua" ? table.filter((r) => r.platform === platform) : table;
}
