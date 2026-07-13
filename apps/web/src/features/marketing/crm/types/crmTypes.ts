export type CrmMenuId = "import" | "orders" | "ads" | "rfm-cohort" | "review";
export type CrmMenuBadge = "Manual" | "Active" | "Prioritas" | "Monitoring";
export type CrmTab = "retention" | "frequency" | "cluster";
export type CrmImportType = "Closingan CRM" | "Masuk Grup" | "Follow-up" | "Status Grup";
export type CrmStatus = "Bagus" | "Cek" | "Evaluasi" | "Pause";

export interface CrmMenuStat { label: string; value: string }
export interface CrmMenuCard { id: CrmMenuId; href: string; title: string; description: string; badge: CrmMenuBadge; icon: string; stats: CrmMenuStat[] }
export interface CrmCenterHeroStat { label: string; value: string }
export interface CrmCenterData { dataTerkini: string; heroStats: CrmCenterHeroStat[]; menuCards: CrmMenuCard[] }
export interface CrmFilters { periode?: string; sumber?: string; cs?: string; produk?: string; statusGrup?: string; status?: string; cluster?: string; platform?: string; adv?: string; campaign?: string; search?: string }
export interface CrmKpi { label: string; value: string; caption?: string; tone?: "red" | "blue" | "green" | "amber" }
export interface CrmOption { value: string; label: string }
export interface CrmFilterOptions { [key: string]: CrmOption[] }
export interface CrmChartPoint { label: string; value: number; secondary?: number; color?: string }
export interface CrmDonutSlice { label: string; value: number; color: string }

export interface CrmCustomerRow {
  id: string; tanggal: string; nama: string; noWa: string; produk: string; qty: number; totalBayar: number; cs: string; channel: string; statusGrup: string; cluster: string; followUp: string; status: string; cohort: string; frequency: number;
}
export interface CrmCustomerDetail extends CrmCustomerRow {
  alamat: string; kota: string; beliPertama: string; beliTerakhir: string; totalFisik: number; totalDigital: number; produkPertama: string; produkTerakhir: string; namaGrup: string; catatan: string; riwayatTransaksi: { tanggal: string; produk: string; total: number }[]; riwayatFollowUp: { tanggal: string; catatan: string; cs: string }[];
}
export interface CrmOrdersData { filters: CrmFilterOptions; kpi: CrmKpi[]; trend: CrmChartPoint[]; customerSplit: CrmDonutSlice[]; closingByCs: CrmChartPoint[]; productClosing: CrmChartPoint[]; rows: CrmCustomerRow[] }
export interface CrmAdsRow { id: string; tanggal: string; platform: string; adv: string; campaign: string; spending: number; leads: number; closing: number; sales: number; costPerClosing: number; roas: number; status: CrmStatus }
export interface CrmAdsData { filters: CrmFilterOptions; kpi: CrmKpi[]; trend: CrmChartPoint[]; campaignClosing: CrmChartPoint[]; costByAdv: CrmChartPoint[]; spendingDistribution: CrmDonutSlice[]; rows: CrmAdsRow[] }
export interface CrmHeatCell { value: number; percent: number }
export interface CrmRetentionRow { cohort: string; totalSales: number; newCustomer: number; retainedSales: number; avgRetention: number; retentionRatio: number; months: (CrmHeatCell | null)[] }
export interface CrmFrequencyRow { cohort: string; totalCustomer: number; revenue: number; orders: (CrmHeatCell | null)[] }
export interface CrmClusterInsight { topRevenue: string; topCustomer: string; needReactivation: string }
export interface CrmCluster { key: string; label: string; action: string; count: number; revenue: number; color: string }
export interface CrmRfmData { filters: CrmFilterOptions; kpi: CrmKpi[]; rows: CrmCustomerRow[]; retention?: CrmRetentionRow[]; frequency?: CrmFrequencyRow[]; retentionTrend?: CrmChartPoint[]; retentionSummary?: CrmDonutSlice[]; frequencyDistribution?: CrmChartPoint[]; cluster?: CrmCluster[]; clusterDonut?: CrmDonutSlice[]; clusterInsight?: CrmClusterInsight }
export interface CrmReviewRow { id: string; tipeData: string; customer: string; noWa: string; masalah: string; dampak: string; prioritas: "Tinggi" | "Sedang" | "Rendah"; rekomendasi: string; status: "Belum Diperbaiki" | "Sudah Diperbaiki"; customerId: string }
export interface CrmReviewData { filters: CrmFilterOptions; kpi: CrmKpi[]; issueDonut: CrmDonutSlice[]; issueBySource: CrmChartPoint[]; issueTrend: CrmChartPoint[]; rows: CrmReviewRow[] }
export interface CrmImportSummary { templateColumns: string[]; mapping: { file: string; system: string; status: "Cocok" | "Perlu Review" }[] }
