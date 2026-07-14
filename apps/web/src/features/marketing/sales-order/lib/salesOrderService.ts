// Service Sales & Order live. Tidak ada fallback mock: API gagal akan diteruskan
// ke error state halaman agar angka sementara tidak tampil sebagai data nyata.

import type {
  CsCrmData, OrderStatusData, ProductPerformanceData, ReturnDataReviewData,
  SalesOrderCenterData, SalesOverviewData, StoreChannelData,
} from "../types/salesOrder.types";

export interface SalesLiveSummary {
  total_order: number; revenue: number; total_qty: number; aov: number | null; unique_customer: number; repeat_customer: number;
  retur: { total_shipment: number; retur_count: number; retur_rate: number | null };
  cs_performance: Array<{ name: string; divisi: string; total_order: number; revenue: number; aov: number | null }>;
  divisi_performance: Array<{ divisi: string; total_order: number; revenue: number; aov: number | null }>;
}
export interface SalesLiveTrend { date: string; total_order: number; revenue: number; unique_customer: number }
export interface SalesLiveChannel { channel_id: string; channel_name: string; platform: string; total_order: number; revenue: number; unique_customer: number; aov: number | null }
export interface SalesLiveProduct { product_id: string | null; product_name: string; sku: string; category: string; total_order: number; product_sold: number; revenue: number }
export interface SalesLiveOrder { order_id: string; order_date: string; customer_name: string; channel_name: string; divisi: string; cs_name: string; courier_name: string; total_amount: number }
export interface SalesLiveData { summary: SalesLiveSummary; trend: SalesLiveTrend[]; channels: SalesLiveChannel[]; products: SalesLiveProduct[] }

export interface SalesOrderFilters {
  startDate?: string; endDate?: string; channelId?: string; divisi?: string; productId?: string; csId?: string; courierId?: string; search?: string;
  platform?: string; toko?: string; produk?: string; kategori?: string; sku?: string; status?: string; metodeBayar?: string; ekspedisi?: string; cs?: string; segmen?: string; issueType?: string;
}

async function get<T>(path: string, params: URLSearchParams): Promise<T> {
  const response = await fetch(`${path}?${params.toString()}`, { cache: "no-store" });
  const body = await response.json() as T & { error?: string };
  if (!response.ok) throw new Error(body.error ?? "Gagal memuat data penjualan.");
  return body;
}

function paramsFor(filters: SalesOrderFilters) {
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  const fallbackStart = new Date(Date.now() - 29 * 86_400_000).toISOString().slice(0, 10);
  const params = new URLSearchParams({ start_date: filters.startDate ?? fallbackStart, end_date: filters.endDate ?? today });
  if (filters.channelId) params.set("channel_id", filters.channelId);
  if (filters.divisi) params.set("divisi", filters.divisi);
  if (filters.productId) params.set("product_id", filters.productId);
  if (filters.csId) params.set("cs_id", filters.csId);
  if (filters.courierId) params.set("courier_id", filters.courierId);
  if (filters.search) params.set("search", filters.search);
  return params;
}

export async function getSalesLiveData(filters: SalesOrderFilters): Promise<SalesLiveData> {
  const params = paramsFor(filters);
  const [summary, trend, channels, products] = await Promise.all([
    get<{ data: SalesLiveSummary }>("/api/marketing/sales-summary", params),
    get<{ data: SalesLiveTrend[] }>("/api/marketing/sales-trend", params),
    get<{ data: SalesLiveChannel[] }>("/api/marketing/sales-by-channel", params),
    get<{ data: SalesLiveProduct[] }>("/api/marketing/sales-by-product", params),
  ]);
  return { summary: summary.data, trend: trend.data, channels: channels.data, products: products.data };
}

/** Memetakan data live ke kontrak tampilan overview lama tanpa menampilkan angka contoh. */
export async function getSalesOverview(filters: SalesOrderFilters): Promise<SalesOverviewData> {
  const data = await getSalesLiveData(filters);
  const channelRows = data.channels.map((row) => ({
    platform: row.channel_name, sales: row.revenue, salesDeltaPct: 0, order: row.total_order,
    qty: 0, aov: row.aov ?? 0, repeatRate: 0, repeatDeltaPp: 0,
    customerBaru: 0, customerBaruDeltaPct: 0, customerRepeat: 0, customerRepeatDeltaPct: 0, status: "Baik" as const,
  }));
  return {
    updateTerakhir: "Data database ERP", filters: {
      platform: [{ value: "Semua", label: "Semua Channel" }, ...data.channels.map((row) => ({ value: row.channel_id, label: row.channel_name }))],
      toko: [{ value: "Semua", label: "Semua Toko" }], produk: [{ value: "Semua", label: "Semua Produk" }, ...data.products.map((row) => ({ value: row.product_id ?? "", label: row.product_name }))],
      status: [{ value: "Semua", label: "Pesanan Valid" }], metodeBayar: [{ value: "Semua", label: "Semua Metode" }],
    },
    kpi: [
      { label: "Total Pesanan", value: String(data.summary.total_order), icon: "receipt", tone: "red" },
      { label: "Total Pendapatan", value: `Rp${data.summary.revenue.toLocaleString("id-ID")}`, icon: "wallet", tone: "green" },
      { label: "Produk Terjual", value: String(data.summary.total_qty), icon: "boxes", tone: "blue" },
      { label: "Rata-rata Pesanan", value: `Rp${Math.round(data.summary.aov ?? 0).toLocaleString("id-ID")}`, icon: "cart", tone: "purple" },
      { label: "Pelanggan Unik", value: String(data.summary.unique_customer), icon: "users", tone: "slate" },
      { label: "Pelanggan Repeat", value: String(data.summary.repeat_customer), icon: "repeat", tone: "amber" },
    ],
    trend: data.trend.map((row) => ({ label: row.date, sales: row.revenue, order: row.total_order })),
    salesPerPlatform: data.channels.map((row) => ({ name: row.channel_name, value: row.revenue })),
    orderPerPlatform: data.channels.map((row) => ({ name: row.channel_name, value: row.total_order })),
    salesVsOrderPerPlatform: data.channels.map((row) => ({ name: row.channel_name, sales: row.revenue, order: row.total_order })),
    customerComposition: [{ label: "Pelanggan Unik", value: data.summary.unique_customer, pct: 100, color: "#E30613" }],
    totalCustomer: data.summary.unique_customer,
    topProduk: data.products.slice(0, 10).map((row, index) => ({ rank: index + 1, code: row.sku, name: row.product_name, sales: row.revenue })),
    table: channelRows,
  };
}

export async function getSalesOrders(filters: SalesOrderFilters, page = 1, limit = 25) {
  const params = paramsFor(filters); params.set("page", String(page)); params.set("limit", String(limit));
  return get<{ data: SalesLiveOrder[]; pagination: { page: number; limit: number; total: number } }>("/api/marketing/sales-orders", params);
}

export async function getSalesOrderDetail(orderId: string) {
  return get<{ data: Record<string, unknown> }>(`/api/marketing/sales-orders/${encodeURIComponent(orderId)}`, new URLSearchParams());
}

// Laporan turunan belum dipindah pada tahap Sales Overview. Jangan jatuh kembali ke mock;
// halaman terkait akan menampilkan error sampai endpoint-nya diaktifkan pada tahap berikutnya.
const unavailable = <T,>(): Promise<T> => Promise.reject(new Error("Laporan ini belum tersedia dari database."));
export const getSalesOrderCenterSummary = (): Promise<SalesOrderCenterData> => unavailable();
export const getProductPerformance = (_filters: SalesOrderFilters): Promise<ProductPerformanceData> => unavailable();
export const getStoreChannelPerformance = (_filters: SalesOrderFilters): Promise<StoreChannelData> => unavailable();
export const getCsCrmPerformance = (_filters: SalesOrderFilters): Promise<CsCrmData> => unavailable();
export const getOrderStatusCod = (_filters: SalesOrderFilters): Promise<OrderStatusData> => unavailable();
export const getReturnDataReview = (_filters: SalesOrderFilters): Promise<ReturnDataReviewData> => unavailable();
