// Tipe data untuk Marketing → CS/CRM — dashboard Cohort & Cluster customer Probetes.
// Menggantikan halaman "CRM (RFM & Cohort)" lama. Ini LAPORAN/ANALISIS, bukan tempat
// input utama — closingan tetap lewat menu tersendiri (belum dibangun, lihat memory
// "klasifikasi-cluster-customer-probetes" untuk konteks lengkap).

export type ProductCategory = "digital" | "herbal_amandia" | "fisik_lain" | "yacona";

export interface ProductDef {
  id: string;
  name: string;
  category: ProductCategory;
  iklanAkuisisi: boolean;
  shopee: boolean;
  tiktok: boolean;
}

export type ChannelType = "Akuisisi" | "Marketplace" | "Offline";

/** 14 cluster custom Probetes (BUKAN RFM Champions/Loyal generik). */
export type ClusterKey =
  | "B" | "A1" | "A2" | "A3" | "A4"
  | "C-Prodig" | "C-HP" | "C-F2"
  | "D-New" | "D-Old" | "Dhp-New" | "Dhp-Old"
  | "E" | "F";

export interface ClusterDef {
  key: ClusterKey;
  label: string;
  color: string;
  description: string;
}

export interface Purchase {
  date: string; // ISO yyyy-mm-dd
  productId: string;
  amount: number;
}

export interface CustomerRecord {
  id: string;
  hp: string;
  nama: string;
  channelType: ChannelType;
  cs: string[];
  masukGrup: boolean;
  purchases: Purchase[]; // non-Yacona, urut tanggal naik
  yaconaPurchases: Purchase[];
}

export interface FilterOption {
  value: string;
  label: string;
}

export interface CsCrmFilters {
  dari?: string;
  sampai?: string;
  produk?: string;
  cs?: string;
  channelType?: string; // "Semua" | "Akuisisi" | "Marketplace" | "Offline"
  search?: string;
}

// ---------------------------------------------------------------------------
// Tab Retention
// ---------------------------------------------------------------------------
export interface MonthCell {
  count: number;
  pct: number;
}

export interface RetentionCohortRow {
  cohort: string; // "2025-01"
  totalSales: number;
  newCustSales: number; // "NEW CUST (RP)"
  retensiSales: number; // "RETENSI (RP)"
  avgRetensi: number;
  rasioRetensi: number; // %
  months: (MonthCell | null)[]; // index 0..12 = Month 0..12
}

export interface RetentionData {
  rows: RetentionCohortRow[];
  globalAvg: (number | null)[]; // rata-rata retensi global per Month 0..12
}

// ---------------------------------------------------------------------------
// Tab Frequency
// ---------------------------------------------------------------------------
export interface FrequencyCohortRow {
  cohort: string;
  orders: (MonthCell | null)[]; // index 0 = 1x order, ... index 18 = 19x+
}

export interface FrequencyData {
  rows: FrequencyCohortRow[];
  orderLabels: string[]; // "1X ORDER" .. "19X+ ORDER"
}

// ---------------------------------------------------------------------------
// Tab Cluster
// ---------------------------------------------------------------------------
export interface ClusterSummary {
  key: ClusterKey;
  label: string;
  color: string;
  description: string;
  count: number;
  revenue: number;
  avgPerCustomer: number;
}

export interface ClusterKpi {
  totalRevenue: number;
  totalCluster: number;
  lifetimeValue: number;
  activeUsers: number;
}

export interface ClusterData {
  kpi: ClusterKpi;
  summaries: ClusterSummary[];
}

// ---------------------------------------------------------------------------
// Drill-down (klik sel retention/frequency, atau klik kartu cluster)
// ---------------------------------------------------------------------------
export interface DrillDownCustomerRow {
  hp: string;
  nama: string;
  totalBelanja: number;
  totalFisik: number;
  freq: number;
  masukGrup: boolean;
  produk: string[];
  cs: string[];
}

export interface DrillDownResult {
  title: string;
  subtitle: string;
  rows: DrillDownCustomerRow[];
}
