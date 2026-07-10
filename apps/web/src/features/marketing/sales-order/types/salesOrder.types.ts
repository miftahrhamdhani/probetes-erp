// Tipe data untuk Sales & Order — pengganti tampilan "Laporan Penjualan & Pesanan" lama
// di dalam modul Marketing. Field-field di sini merepresentasikan bentuk data yang SUDAH
// diringkas (siap tampil), supaya nanti gampang diganti dari temporarySalesOrderMockData.ts
// ke query database/API asli tanpa mengubah halaman.

export interface FilterOption {
  value: string;
  label: string;
}

export interface DeltaValue {
  /** Persentase perubahan vs periode sebelumnya. Positif = naik. */
  pct: number;
  /** true kalau naik dianggap baik (sales, order). false kalau naik dianggap masalah (retur, COD belum cair). */
  goodWhenUp: boolean;
}

export interface KpiItem {
  label: string;
  value: string;
  delta?: DeltaValue;
  caption?: string;
  icon: string;
  tone?: "red" | "green" | "amber" | "blue" | "purple" | "slate";
}

export interface TrendPoint {
  label: string;
  sales: number;
  order: number;
}

export interface RankedBarItem {
  code?: string;
  name: string;
  value: number;
}

export interface SeriesPoint {
  label: string;
  values: Record<string, number>;
}

export interface DonutSlice {
  label: string;
  value: number;
  color: string;
}

// ---------------------------------------------------------------------------
// Sales & Order Center (landing)
// ---------------------------------------------------------------------------
export interface CenterMenuStat {
  label: string;
  value: string;
  deltaPct?: number;
}

export interface CenterMenuCard {
  id: string;
  href: string;
  title: string;
  description: string;
  miniTitle: string;
  stats: CenterMenuStat[];
}

export interface SalesOrderCenterData {
  heroStats: { label: string; value: string; deltaPct: number }[];
  menuCards: CenterMenuCard[];
}

// ---------------------------------------------------------------------------
// Overview Penjualan
// ---------------------------------------------------------------------------
export interface PlatformSummaryRow {
  platform: string;
  sales: number;
  salesDeltaPct: number;
  order: number;
  qty: number;
  aov: number;
  repeatRate: number;
  repeatDeltaPp: number;
  customerBaru: number;
  customerBaruDeltaPct: number;
  customerRepeat: number;
  customerRepeatDeltaPct: number;
  status: "Baik" | "Cukup";
}

export interface SalesOverviewData {
  updateTerakhir: string;
  filters: {
    platform: FilterOption[];
    toko: FilterOption[];
    produk: FilterOption[];
    status: FilterOption[];
    metodeBayar: FilterOption[];
  };
  kpi: KpiItem[];
  trend: TrendPoint[];
  salesPerPlatform: RankedBarItem[];
  orderPerPlatform: RankedBarItem[];
  salesVsOrderPerPlatform: { name: string; sales: number; order: number }[];
  customerComposition: { label: string; value: number; pct: number; color: string }[];
  totalCustomer: number;
  topProduk: { rank: number; code: string; name: string; sales: number }[];
  table: PlatformSummaryRow[];
}

// ---------------------------------------------------------------------------
// Performa Produk
// ---------------------------------------------------------------------------
export interface ProductRow {
  sku: string;
  nama: string;
  kategori: string;
  sales: number;
  sharePct: number;
  qty: number;
  order: number;
  retur: number;
  returRate: number;
  margin: number;
  marginPct: number;
  status: "Fast Moving" | "Medium Moving" | "Slow Moving";
}

export interface ProductPerformanceData {
  filters: {
    platform: FilterOption[];
    toko: FilterOption[];
    kategori: FilterOption[];
    sku: FilterOption[];
    status: FilterOption[];
  };
  kpi: KpiItem[];
  produkTerlaris: { code: string; name: string; sales: number };
  topBySales: RankedBarItem[];
  topByQty: RankedBarItem[];
  trendProdukUtama: { colors: Record<string, string>; points: SeriesPoint[] };
  kategoriDonut: { label: string; value: number; sales: number; color: string }[];
  totalSalesKategori: number;
  returTertinggi: { sku: string; nama: string; retur: number; returRate: number }[];
  movingMatrix: {
    rows: { label: string; values: number[] }[];
    columns: string[];
    totals: { skuTotal: number; sedang: number; rendah: number };
  };
  insights: string[];
  table: ProductRow[];
}

// ---------------------------------------------------------------------------
// Performa Toko & Channel
// ---------------------------------------------------------------------------
export interface StoreChannelRow {
  toko: string;
  platform: string;
  sales: number;
  order: number;
  aov: number;
  produkTerlaris: string;
  repeatCustomer: number;
  status: "Aktif" | "Nonaktif";
}

export interface TopChannelRow {
  rank: number;
  channel: string;
  sales: number;
  order: number;
  marketSharePct: number;
}

export interface StoreChannelData {
  filters: {
    platform: FilterOption[];
    toko: FilterOption[];
    channel: FilterOption[];
    produk: FilterOption[];
    status: FilterOption[];
  };
  kpi: KpiItem[];
  channelTerbaik: { name: string; sales: number; sharePct: number };
  channelDonut: DonutSlice[];
  totalChannelSales: number;
  salesPerToko: RankedBarItem[];
  orderPerToko: RankedBarItem[];
  trendPerChannel: { colors: Record<string, string>; points: SeriesPoint[] };
  distribusiOrderPerChannel: { colors: Record<string, string>; points: SeriesPoint[] };
  salesVsOrderPerToko: { name: string; sales: number; order: number }[];
  table: StoreChannelRow[];
  topChannel: TopChannelRow[];
}

// ---------------------------------------------------------------------------
// Performa CS / CRM
// ---------------------------------------------------------------------------
export interface CsCrmRow {
  nama: string;
  divisi: string;
  sales: number;
  order: number;
  customerBaru: number;
  repeatOrder: number;
  aov: number;
  followUpSuccessRate: number;
  status: "Aktif" | "Perlu Evaluasi" | "Nonaktif";
}

export interface CsCrmData {
  filters: {
    divisi: FilterOption[];
    cs: FilterOption[];
    platform: FilterOption[];
    toko: FilterOption[];
    segmen: FilterOption[];
  };
  kpi: KpiItem[];
  salesPerTim: RankedBarItem[];
  topCsBySales: { rank: number; name: string; sales: number }[];
  komposisiCustomer: { label: string; value: number; pct: number; color: string }[];
  totalCustomer: number;
  followUpTrend: { label: string; followUp: number; closing: number }[];
  followUpBadge: { followUp: number; closing: number };
  orderBaruVsRepeat: { name: string; baru: number; repeat: number }[];
  topPerformer: { rank: number; name: string; sales: number; aov: number }[];
  topPerformerFooter: { totalSales: number; kontribusiPct: number };
  perluEvaluasi: { rank: number; name: string; sales: number; aov: number }[];
  perluEvaluasiFooter: { totalSales: number; kontribusiPct: number };
  followUpStats: { label: string; value: string; deltaPct?: number }[];
  table: CsCrmRow[];
  totalRows: number;
  pageSize: number;
}

// ---------------------------------------------------------------------------
// Status Pesanan & COD
// ---------------------------------------------------------------------------
export interface OrderStatusRow {
  status: string;
  color: string;
  jumlahOrder: number;
  nilaiSales: number;
  cod: number;
  persentase: number;
  sla: { label: "Aman" | "Perhatian" | "Berisiko"; detail: string };
  statusReview: { label: string; tone: "green" | "amber" | "red" };
}

export interface OrderStatusData {
  filters: {
    platform: FilterOption[];
    toko: FilterOption[];
    status: FilterOption[];
    ekspedisi: FilterOption[];
    metodeBayar: FilterOption[];
  };
  kpi: KpiItem[];
  totalOrder: number;
  statusDonut: DonutSlice[];
  orderPerStatus: { label: string; value: number; color: string }[];
  trendCodBelumCair: { label: string; value: number }[];
  statusPerEkspedisi: { name: string; value: number; pct: number }[];
  progressHarian: { label: string; sukses: number; onDelivery: number; pending: number; gagal: number }[];
  alerts: { title: string; detail: string; level: "info" | "warning" | "critical" }[];
  lastUpdated: string;
  table: OrderStatusRow[];
}

// ---------------------------------------------------------------------------
// Retur & Data Review
// ---------------------------------------------------------------------------
export interface DataReviewIssue {
  tipeData: string;
  masalah: string;
  jumlah: number;
  dampak: string;
  prioritas: "Tinggi" | "Sedang" | "Rendah";
  rekomendasiAksi: string;
}

export interface ReturnDataReviewData {
  filters: {
    platform: FilterOption[];
    toko: FilterOption[];
    produk: FilterOption[];
    ekspedisi: FilterOption[];
    issueType: FilterOption[];
  };
  kpi: KpiItem[];
  returPerHari: { label: string; value: number }[];
  returPerProduk: RankedBarItem[];
  jenisIssueDonut: DonutSlice[];
  totalIssue: number;
  returPerEkspedisi: RankedBarItem[];
  returVsOrder: { label: string; order: number; retur: number }[];
  topIssue: { rank: number; issue: string; jumlah: number; prioritas: "Tinggi" | "Sedang" | "Rendah" }[];
  table: DataReviewIssue[];
}
