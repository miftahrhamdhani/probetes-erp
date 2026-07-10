// Service layer Sales & Order — semua halaman memanggil fungsi di sini, bukan membaca
// temporarySalesOrderMockData.ts langsung, supaya nanti tinggal ganti isi fungsi ini ke
// query database/API asli tanpa menyentuh komponen halaman.
//
// TODO (setelah database/API siap):
// - getSalesOrderCenterSummary() -> GET /api/marketing/sales-order/summary
// - getSalesOverview(filters)    -> GET /api/marketing/sales-order/overview
// - getProductPerformance(filters) -> GET /api/marketing/sales-order/products
// - getStoreChannelPerformance(filters) -> GET /api/marketing/sales-order/stores-channels
// - getCsCrmPerformance(filters) -> GET /api/marketing/sales-order/cs-crm
// - getOrderStatusCod(filters)   -> GET /api/marketing/sales-order/order-status
// - getReturnDataReview(filters) -> GET /api/marketing/sales-order/returns-review
// Sumber tabel nanti: orders.orders, orders.order_items, master.products/channels/users,
// tracking.shipments/returns/cod_payments (lihat data_migrasi/db/schema.sql).

import {
  getSalesOrderCenterMock,
  getSalesOverviewMock,
  getProductPerformanceMock,
  getStoreChannelPerformanceMock,
  getCsCrmPerformanceMock,
  getOrderStatusCodMock,
  getReturnDataReviewMock,
} from "../data/temporarySalesOrderMockData";
import type {
  CsCrmData,
  OrderStatusData,
  ProductPerformanceData,
  ReturnDataReviewData,
  SalesOrderCenterData,
  SalesOverviewData,
  StoreChannelData,
} from "../types/salesOrder.types";

export interface SalesOrderFilters {
  from?: string;
  to?: string;
  platform?: string;
  toko?: string;
  produk?: string;
  kategori?: string;
  sku?: string;
  status?: string;
  metodeBayar?: string;
  ekspedisi?: string;
  divisi?: string;
  cs?: string;
  segmen?: string;
  issueType?: string;
}

// Simulasi latensi jaringan supaya loading-state komponen bisa dicoba, sesuai
// perilaku fetch API asli nanti — dihapus otomatis begitu diganti fetch() sungguhan.
const simulateLatency = <T,>(value: T): Promise<T> => new Promise((resolve) => setTimeout(() => resolve(value), 180));

export async function getSalesOrderCenterSummary(): Promise<SalesOrderCenterData> {
  return simulateLatency(getSalesOrderCenterMock());
}

export async function getSalesOverview(_filters: SalesOrderFilters): Promise<SalesOverviewData> {
  return simulateLatency(getSalesOverviewMock());
}

export async function getProductPerformance(_filters: SalesOrderFilters): Promise<ProductPerformanceData> {
  return simulateLatency(getProductPerformanceMock());
}

export async function getStoreChannelPerformance(_filters: SalesOrderFilters): Promise<StoreChannelData> {
  return simulateLatency(getStoreChannelPerformanceMock());
}

export async function getCsCrmPerformance(_filters: SalesOrderFilters): Promise<CsCrmData> {
  return simulateLatency(getCsCrmPerformanceMock());
}

export async function getOrderStatusCod(_filters: SalesOrderFilters): Promise<OrderStatusData> {
  return simulateLatency(getOrderStatusCodMock());
}

export async function getReturnDataReview(_filters: SalesOrderFilters): Promise<ReturnDataReviewData> {
  return simulateLatency(getReturnDataReviewMock());
}
