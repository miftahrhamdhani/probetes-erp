// Utilitas perhitungan bersama untuk Sales & Order — dipakai halaman & (nanti) API route
// supaya rumus AOV, repeat rate, retur rate, dsb, satu definisi saja.

export const averageOrderValue = (sales: number, order: number): number => (order > 0 ? sales / order : 0);
export const repeatRate = (repeatCount: number, totalCustomer: number): number => (totalCustomer > 0 ? (repeatCount / totalCustomer) * 100 : 0);
export const returRate = (returCount: number, order: number): number => (order > 0 ? (returCount / order) * 100 : 0);
export const netSales = (sales: number, retur = 0, diskon = 0, refund = 0): number => sales - retur - diskon - refund;
export const grossMargin = (sales: number, hpp: number): number => sales - hpp;
export const grossMarginPct = (sales: number, hpp: number): number => (sales > 0 ? (grossMargin(sales, hpp) / sales) * 100 : 0);
export const deliverySuccessRate = (sukses: number, totalOrderCount: number): number => (totalOrderCount > 0 ? (sukses / totalOrderCount) * 100 : 0);
export const codOutstanding = (codBelumCairValue: number): number => Math.max(0, codBelumCairValue);

/** Delta % antara periode sekarang vs sebelumnya — null kalau periode sebelumnya 0. */
export function trendPercentage(current: number, previous: number): number | null {
  if (previous <= 0) return current > 0 ? 100 : null;
  return ((current - previous) / previous) * 100;
}

export type SimpleTone = "green" | "blue" | "amber" | "red" | "slate";

export function statusBadgeFromRate(value: number, thresholds: { good: number; ok: number } = { good: 70, ok: 40 }): { label: string; tone: SimpleTone } {
  if (value >= thresholds.good) return { label: "Baik", tone: "green" };
  if (value >= thresholds.ok) return { label: "Cukup", tone: "blue" };
  return { label: "Perlu Evaluasi", tone: "amber" };
}
