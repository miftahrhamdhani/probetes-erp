// TODO: Ganti temporary mock data ini ke database asli/API backend setelah backend CRM tersedia.
import { CRM_ADS, CRM_CENTER_MOCK, CRM_CLUSTERS, CRM_CUSTOMERS, CRM_DATA_TERKINI, CRM_DETAILS, CRM_REVIEWS } from "../data/temporaryCrmMockData";
import { formatPersen, formatRatio, formatRingkas, safeRatio } from "./crmUtils";
import type { CrmAdsData, CrmCenterData, CrmCustomerDetail, CrmFilters, CrmImportSummary, CrmKpi, CrmOrdersData, CrmRfmData, CrmReviewData } from "../types/crmTypes";

const later = <T,>(data: T): Promise<T> => new Promise((resolve) => setTimeout(() => resolve(data), 160));
const filters = {
  periode: [{ value: "Semua", label: "Semua Periode" }, { value: "30hari", label: "30 Hari Terakhir" }, { value: "bulan-ini", label: "Bulan Ini" }],
  sumber: [{ value: "Semua", label: "Semua Data" }, { value: "CRM", label: "CRM" }, { value: "Marketplace", label: "Marketplace" }],
  cs: [{ value: "Semua", label: "Semua CS / CRM" }, { value: "Rista", label: "Rista" }, { value: "Nadia", label: "Nadia" }],
  produk: [{ value: "Semua", label: "Semua Produk" }, { value: "Probetes Herbal", label: "Probetes Herbal" }, { value: "Ebook 145", label: "Ebook 145" }],
  statusGrup: [{ value: "Semua", label: "Semua Status Grup" }, { value: "Sudah Masuk", label: "Sudah Masuk Grup" }, { value: "Belum Masuk", label: "Belum Masuk Grup" }],
  cluster: [{ value: "Semua", label: "Semua Cluster" }, { value: "A1", label: "A1" }, { value: "D-New", label: "D-New" }],
  status: [{ value: "Semua", label: "Semua Status" }, { value: "Selesai", label: "Selesai" }, { value: "Diproses", label: "Diproses" }],
  platform: [{ value: "Semua", label: "Semua Platform" }, { value: "Meta", label: "Meta" }, { value: "TikTok", label: "TikTok" }],
  adv: [{ value: "Semua", label: "Semua ADV" }, { value: "Irfan", label: "Irfan" }, { value: "Zidny", label: "Zidny" }],
  campaign: [{ value: "Semua", label: "Semua Campaign" }, { value: "CRM Ebook Retargeting", label: "CRM Ebook Retargeting" }],
  prioritas: [{ value: "Semua", label: "Semua Prioritas" }, { value: "Tinggi", label: "Tinggi" }, { value: "Sedang", label: "Sedang" }],
  issue: [{ value: "Semua", label: "Semua Masalah" }, { value: "Customer", label: "Customer" }, { value: "Produk", label: "Produk" }],
};
const kpi = (label: string, value: string, caption?: string): CrmKpi => ({ label, value, caption });
function match<T extends object>(rows: T[], filter: CrmFilters, keys: Record<string, keyof T>) {
  return rows.filter((row) => Object.entries(keys).every(([key, prop]) => !filter[key as keyof CrmFilters] || filter[key as keyof CrmFilters] === "Semua" || String(row[prop]) === filter[key as keyof CrmFilters]));
}

export async function getCrmCenterSummary(): Promise<CrmCenterData> { return later(CRM_CENTER_MOCK); }
export async function getCrmImportSummary(): Promise<CrmImportSummary> {
  return later({ templateColumns: ["Tanggal", "Nama Customer", "No WA", "Produk", "Qty", "Total Bayar", "CS/CRM", "Status Grup", "Catatan"], mapping: [{ file: "Tanggal", system: "Tanggal Pesanan", status: "Cocok" }, { file: "Nama Customer", system: "Nama Pelanggan", status: "Cocok" }, { file: "No WA", system: "Nomor WhatsApp", status: "Cocok" }, { file: "Produk", system: "Produk", status: "Perlu Review" }] });
}
export async function getCrmOrders(filter: CrmFilters): Promise<CrmOrdersData> {
  const rows = match(CRM_CUSTOMERS, filter, { cs: "cs", produk: "produk", statusGrup: "statusGrup", status: "status", cluster: "cluster" });
  const sales = rows.reduce((sum, row) => sum + row.totalBayar, 0), repeat = rows.filter((row) => row.frequency > 1);
  return later({ filters, kpi: [kpi("Total Closing", String(rows.length)), kpi("Sales CRM", formatRingkas(sales)), kpi("AOV CRM", formatRingkas(sales / Math.max(rows.length, 1))), kpi("Customer Baru", String(rows.length - repeat.length)), kpi("Customer Repeat", String(repeat.length)), kpi("Repeat Rate", formatPersen(repeat.length / Math.max(rows.length, 1) * 100)), kpi("Belum Masuk Grup", String(rows.filter((row) => row.statusGrup === "Belum Masuk").length))], trend: [9, 10, 11, 12, 13, 14, 15].map((day, index) => ({ label: `${day} Jul`, value: 2400000 + index * 330000, secondary: 12 + index * 4 })), customerSplit: [{ label: "Baru", value: rows.length - repeat.length, color: "#E30613" }, { label: "Repeat", value: repeat.length, color: "#2563EB" }], closingByCs: ["Rista", "Nadia", "Dimas"].map((label) => ({ label, value: rows.filter((row) => row.cs === label).length })), productClosing: ["Probetes Herbal", "Ebook 145", "Amandia"].map((label, index) => ({ label, value: 24 - index * 5 })), rows });
}
export async function getCrmAds(filter: CrmFilters): Promise<CrmAdsData> {
  const rows = match(CRM_ADS, filter, { platform: "platform", adv: "adv", campaign: "campaign" });
  const spending = rows.reduce((sum, row) => sum + row.spending, 0), leads = rows.reduce((sum, row) => sum + row.leads, 0), closing = rows.reduce((sum, row) => sum + row.closing, 0), sales = rows.reduce((sum, row) => sum + row.sales, 0);
  return later({ filters, kpi: [kpi("Spending CRM", formatRingkas(spending)), kpi("Leads", String(leads)), kpi("Closing", String(closing)), kpi("Sales CRM", formatRingkas(sales)), kpi("Cost per Closing", closing ? formatRingkas(spending / closing) : "-"), kpi("ROAS CRM", formatRatio(sales, spending)), kpi("Closing Rate", safeRatio(closing, leads) === null ? "-" : formatPersen(closing / leads * 100))], trend: [9, 10, 11, 12, 13, 14, 15].map((day, index) => ({ label: `${day} Jul`, value: 4200000 + index * 300000, secondary: 9400000 + index * 810000 })), campaignClosing: rows.map((row) => ({ label: row.campaign, value: row.closing })), costByAdv: ["Irfan", "Zidny", "Bagas"].map((label) => { const group = rows.filter((row) => row.adv === label), cost = group.reduce((sum, row) => sum + row.spending, 0), count = group.reduce((sum, row) => sum + row.closing, 0); return { label, value: count ? cost / count : 0 }; }), spendingDistribution: ["Meta", "TikTok"].map((label, index) => ({ label, value: rows.filter((row) => row.platform === label).reduce((sum, row) => sum + row.spending, 0), color: ["#E30613", "#2563EB"][index]! })), rows });
}
const retentionCohorts = ["2024-09", "2024-10", "2024-11", "2024-12", "2025-01", "2025-02", "2025-03", "2025-04", "2025-05", "2025-06", "2025-07", "2025-08", "2025-09"];
export async function getCrmRetention(_filter: CrmFilters): Promise<CrmRfmData> {
  const retention = retentionCohorts.map((cohort, row) => {
    const newCustomer = 144 + row * 57, totalSales = 31000000 + row * 8100000, retentionRatio = Math.max(2.2, 8.3 - row * 0.45);
    const months = Array.from({ length: 13 }, (_, month) => {
      if (month > 12 - row) return null;
      const percent = month === 0 ? 100 : Math.max(0.6, 16 - month * 1.15 - row * 0.28);
      const value = Math.max(1, Math.round(newCustomer * (month === 0 ? 1 : percent / 100)));
      return { value, percent };
    });
    return { cohort, totalSales, newCustomer, retainedSales: Math.round(totalSales * retentionRatio / 100), avgRetention: Math.round(totalSales / newCustomer), retentionRatio, months };
  });
  return later({ filters, kpi: [kpi("Total Customer", "8.420"), kpi("Retention Rate", "34,2%"), kpi("Avg Retensi", "2,8 bln"), kpi("New Customer", "1.042"), kpi("Revenue Retained", "Rp186,4 jt"), kpi("Perlu Follow-up", "1.184")], retention, retentionTrend: ["Mar", "Apr", "Mei", "Jun", "Jul"].map((label, index) => ({ label, value: 22 + index * 3 })), retentionSummary: [{ label: "Retained Users", value: 2876, color: "#E30613" }, { label: "At Risk Users", value: 1456, color: "#F59E0B" }, { label: "Lost Users", value: 990, color: "#94a3b8" }], rows: CRM_CUSTOMERS });
}
export async function getCrmFrequency(_filter: CrmFilters): Promise<CrmRfmData> {
  const frequency = retentionCohorts.map((cohort, row) => {
    const totalCustomer = 144 + row * 57;
    const orders = Array.from({ length: 19 }, (_, order) => {
      if (order > 18 - row) return null;
      const percent = order === 0 ? 100 : Math.max(0.2, 34 - order * 2.1 - row * 0.45);
      return { value: Math.max(1, Math.round(totalCustomer * (order === 0 ? 1 : percent / 100))), percent };
    });
    return { cohort, totalCustomer, revenue: 31000000 + row * 8100000, orders };
  });
  return later({ filters, kpi: [kpi("Total Customer", "8.420"), kpi("Avg Frequency", "1,8x"), kpi("Repeat Customer", "2.876"), kpi("F1 Customer", "5.544"), kpi("F2+ Customer", "2.876"), kpi("Revenue per Customer", "Rp412 rb")], frequency, frequencyDistribution: ["1x", "2x", "3x", "4x", "5x", "6x+"].map((label, index) => ({ label, value: 4200 - index * 600 })), rows: CRM_CUSTOMERS });
}
export async function getCrmCluster(_filter: CrmFilters): Promise<CrmRfmData> {
  return later({ filters, kpi: [kpi("Total Revenue", "Rp6,36 M", "Data terfilter"), kpi("Total Cluster", "14 Cluster", "Semua segmen"), kpi("Lifetime Value", "Rp417.770", "Revenue ÷ customer"), kpi("Active Users", "15.224", "Unique customer")], cluster: CRM_CLUSTERS, clusterDonut: CRM_CLUSTERS.slice(0, 5).map((cluster) => ({ label: cluster.label, value: cluster.count, color: cluster.color })), clusterInsight: { topRevenue: "Cluster B", topCustomer: "Cluster F", needReactivation: "Cluster E" }, rows: CRM_CUSTOMERS });
}
export async function getCrmDataReview(filter: CrmFilters): Promise<CrmReviewData> {
  const rows = match(CRM_REVIEWS, filter, { prioritas: "prioritas", status: "status", issue: "tipeData" });
  return later({ filters, kpi: [kpi("Total Issue", String(rows.length)), kpi("Issue Tinggi", String(rows.filter((row) => row.prioritas === "Tinggi").length)), kpi("Issue Sedang", String(rows.filter((row) => row.prioritas === "Sedang").length)), kpi("Issue Rendah", String(rows.filter((row) => row.prioritas === "Rendah").length)), kpi("Sudah Diperbaiki", String(rows.filter((row) => row.status === "Sudah Diperbaiki").length)), kpi("Belum Diperbaiki", String(rows.filter((row) => row.status === "Belum Diperbaiki").length))], issueDonut: rows.map((row, index) => ({ label: row.masalah, value: 1, color: ["#E30613", "#F59E0B", "#2563EB", "#7C3AED", "#059669"][index % 5]! })), issueBySource: ["Customer", "Pesanan", "Produk", "Cohort"].map((label, index) => ({ label, value: 38 - index * 7 })), issueTrend: ["9 Jul", "10 Jul", "11 Jul", "12 Jul", "13 Jul"].map((label, index) => ({ label, value: 14 + index * 3 })), rows });
}
export async function getCrmCustomerDetail(customerId: string): Promise<CrmCustomerDetail | null> { return later(CRM_DETAILS.find((detail) => detail.id === customerId) ?? null); }
export function getCrmDataTerkini() { return CRM_DATA_TERKINI; }
