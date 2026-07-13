// Service layer CS/CRM — halaman memanggil fungsi di sini, bukan membaca
// temporaryCsCrmMockData.ts / csCrmUtils.ts langsung, supaya nanti tinggal ganti isi
// fungsi ini ke query database/API asli tanpa menyentuh komponen halaman.
//
// TODO (setelah database/API siap): ganti isi tiap fungsi ke endpoint
// /api/marketing/cs-crm/* yang membaca master.customers, master.customer_cohorts,
// orders.customer_transactions, plus tabel baru untuk status "masuk grup WA" dan data
// Yacona terpisah (lihat memory "klasifikasi-cluster-customer-probetes").

import { ALL_CUSTOMERS, DATA_TERKINI, FILTER_OPTIONS } from "../data/temporaryCsCrmMockData";
import {
  applyFilters, computeCluster, computeFrequency, computeRetention,
  drillDownCluster, drillDownFrequencyCell, drillDownRetentionCell,
} from "./csCrmUtils";
import type {
  ClusterData, ClusterKey, CsCrmFilters, DrillDownResult, FrequencyData, RetentionData,
} from "../types/csCrmTypes";

const simulateLatency = <T,>(value: T): Promise<T> => new Promise((resolve) => setTimeout(() => resolve(value), 180));

const NOW_MONTH = DATA_TERKINI.slice(0, 7);

export interface CsCrmFilterOptions {
  produk: typeof FILTER_OPTIONS.produk;
  cs: typeof FILTER_OPTIONS.cs;
  channelType: typeof FILTER_OPTIONS.channelType;
}

export async function getCsCrmFilterOptions(): Promise<CsCrmFilterOptions> {
  return simulateLatency(FILTER_OPTIONS);
}

export async function getRetentionData(filters: CsCrmFilters): Promise<RetentionData> {
  const filtered = applyFilters(ALL_CUSTOMERS, filters);
  return simulateLatency(computeRetention(filtered, NOW_MONTH));
}

export async function getFrequencyData(filters: CsCrmFilters): Promise<FrequencyData> {
  const filtered = applyFilters(ALL_CUSTOMERS, filters);
  return simulateLatency(computeFrequency(filtered));
}

export async function getClusterData(filters: CsCrmFilters): Promise<ClusterData> {
  const filtered = applyFilters(ALL_CUSTOMERS, filters);
  return simulateLatency(computeCluster(filtered, NOW_MONTH));
}

export async function getRetentionDrillDown(filters: CsCrmFilters, cohort: string, monthOffset: number): Promise<DrillDownResult> {
  const filtered = applyFilters(ALL_CUSTOMERS, filters);
  return simulateLatency(drillDownRetentionCell(filtered, cohort, monthOffset));
}

export async function getFrequencyDrillDown(filters: CsCrmFilters, cohort: string, threshold: number): Promise<DrillDownResult> {
  const filtered = applyFilters(ALL_CUSTOMERS, filters);
  return simulateLatency(drillDownFrequencyCell(filtered, cohort, threshold));
}

export async function getClusterDrillDown(filters: CsCrmFilters, key: ClusterKey): Promise<DrillDownResult> {
  const filtered = applyFilters(ALL_CUSTOMERS, filters);
  return simulateLatency(drillDownCluster(filtered, key, NOW_MONTH));
}

export function getDataTerkini(): string {
  return DATA_TERKINI;
}
