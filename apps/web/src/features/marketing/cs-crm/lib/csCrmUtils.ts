// Logika klasifikasi cluster & agregasi cohort/frequency untuk CS/CRM.
// Aturan cluster mengikuti definisi "BARU" dari owner (lihat memory project
// "klasifikasi-cluster-customer-probetes" untuk penjelasan lengkap tiap cluster).
// Urutan evaluasi cluster: B -> A1 -> A2 -> A3 -> A4 -> C-Prodig -> C-HP -> C-F2 ->
// D-New -> D-Old -> Dhp-New -> Dhp-Old -> E -> F (berhenti begitu cocok satu kategori).
//
// CATATAN: Sebagian rumus (AVG RETENSI, RASIO RETENSI) adalah pendekatan yang masuk
// akal untuk kebutuhan tampilan mock — belum dikonfirmasi persis ke rumus asli owner.

import { getProduct } from "../data/temporaryCsCrmMockData";
import type {
  ClusterData, ClusterKey, ClusterSummary, CsCrmFilters, CustomerRecord,
  DrillDownCustomerRow, DrillDownResult, FrequencyCohortRow, FrequencyData,
  MonthCell, Purchase, RetentionCohortRow, RetentionData,
} from "../types/csCrmTypes";

const CUTOFF_C_D = "2025-11"; // cutoff Cluster C/D/Dhp: Nov 2025 - now
const CLUSTER_E_START = "2025-03";
const CLUSTER_E_END = "2025-10";

export const CLUSTER_DEFS: Record<ClusterKey, { label: string; color: string; description: string }> = {
  B: { label: "Cluster B", color: "#7C3AED", description: "Data Yacona, F > 5" },
  A1: { label: "Cluster A1", color: "#7C3AED", description: "F2+ | Total belanja >= 1,5jt" },
  A2: { label: "Cluster A2", color: "#2563EB", description: "Tepat F2" },
  A3: { label: "Cluster A3", color: "#7C3AED", description: "Tepat F3" },
  A4: { label: "Cluster A4", color: "#2563EB", description: "F4 ke atas" },
  "C-Prodig": { label: "C-Prodig", color: "#059669", description: "F1 Ebook Nov25+ | Masuk Grup" },
  "C-HP": { label: "C-HP", color: "#0EA5E9", description: "F1 HP/Amandia Nov25+ | Masuk Grup" },
  "C-F2": { label: "C-F2", color: "#F97316", description: "F2 keduanya Ebook | Masuk Grup" },
  "D-New": { label: "D-New", color: "#F59E0B", description: "Ebook Nov25+ | Belum Grup | <=15 hari" },
  "D-Old": { label: "D-Old", color: "#F59E0B", description: "Ebook Nov25+ | Belum Grup | >15 hari" },
  "Dhp-New": { label: "Dhp-New", color: "#EF4444", description: "HP/Amandia Nov25+ | Belum Grup | Bulan ini" },
  "Dhp-Old": { label: "Dhp-Old", color: "#EF4444", description: "HP/Amandia Nov25+ | Belum Grup | Bulan lalu" },
  E: { label: "Cluster E", color: "#94A3B8", description: "Ebook-only, cohort Mar-Okt 2025" },
  F: { label: "Cluster F", color: "#E30613", description: "Data lama / lainnya" },
};

export const CLUSTER_ORDER: ClusterKey[] = ["B", "A1", "A2", "A3", "A4", "C-Prodig", "C-HP", "C-F2", "D-New", "D-Old", "Dhp-New", "Dhp-Old", "E", "F"];

function monthOfIso(iso: string): string {
  return iso.slice(0, 7);
}
function ymOf(monthKey: string): [number, number] {
  const [y, m] = monthKey.split("-").map(Number) as [number, number];
  return [y, m];
}
function monthDiff(a: string, b: string): number {
  const [ay, am] = ymOf(a);
  const [by, bm] = ymOf(b);
  return (by * 12 + bm) - (ay * 12 + am);
}
function daysBetween(a: string, b: string): number {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86_400_000);
}
function lifetimeTotal(purchases: Purchase[]): number {
  return purchases.reduce((s, p) => s + p.amount, 0);
}
function isDigital(productId: string): boolean {
  return getProduct(productId).category === "digital";
}
function isHerbalAmandia(productId: string): boolean {
  return getProduct(productId).category === "herbal_amandia";
}

/** Klasifikasi 1 customer ke salah satu dari 14 cluster, relatif terhadap `nowMonth`. */
export function classifyCluster(customer: CustomerRecord, nowMonth: string): ClusterKey {
  if (customer.yaconaPurchases.length > 5) return "B";

  const purchases = customer.purchases;
  const freq = purchases.length;
  const total = lifetimeTotal(purchases);
  const cohortMonth = monthOfIso(purchases[0]!.date);
  const isRecentCohort = monthDiff(CUTOFF_C_D, cohortMonth) >= 0;
  const isClusterEEra = monthDiff(CLUSTER_E_START, cohortMonth) >= 0 && monthDiff(cohortMonth, CLUSTER_E_END) >= 0;

  if (freq >= 2 && total >= 1_500_000) return "A1";
  if (freq === 2) return "A2";
  if (freq === 3) return "A3";
  if (freq >= 4) return "A4";

  // Dari sini freq selalu 1 (F1) — kandidat C-Prodig/C-HP/D-New/D-Old/Dhp-New/Dhp-Old/E/F.
  const first = purchases[0]!;
  const firstIsDigital = isDigital(first.productId);
  const firstIsHerbal = isHerbalAmandia(first.productId);

  if (isRecentCohort && customer.masukGrup) {
    if (firstIsDigital) return "C-Prodig";
    if (firstIsHerbal) return "C-HP";
  }

  if (isRecentCohort && !customer.masukGrup) {
    if (firstIsDigital) {
      const daysSince = daysBetween(first.date, `${nowMonth}-28`);
      return daysSince <= 15 ? "D-New" : "D-Old";
    }
    if (firstIsHerbal) {
      return cohortMonth === nowMonth ? "Dhp-New" : "Dhp-Old";
    }
  }

  if (isClusterEEra && firstIsDigital) return "E";

  return "F";
}

/** C-F2: beli ke-1 & ke-2 keduanya digital, F2, sudah masuk grup, cohort Nov25+.
 * Dicek terpisah karena butuh freq===2 yang di classifyCluster utama sudah "diserap" A2 —
 * jadi C-F2 dievaluasi SEBELUM A2 di pipeline gabungan (lihat classifyCustomer). */
function isClusterF2(customer: CustomerRecord): boolean {
  const purchases = customer.purchases;
  if (purchases.length !== 2) return false;
  const total = lifetimeTotal(purchases);
  if (total >= 1_500_000) return false; // tetap kalah dari A1
  const cohortMonth = monthOfIso(purchases[0]!.date);
  if (monthDiff(CUTOFF_C_D, cohortMonth) < 0) return false;
  if (!customer.masukGrup) return false;
  return isDigital(purchases[0]!.productId) && isDigital(purchases[1]!.productId);
}

/** Pipeline lengkap: cek Yacona/A1 dulu, lalu C-F2 (override sebelum A2), baru sisanya. */
export function classifyCustomer(customer: CustomerRecord, nowMonth: string): ClusterKey {
  if (customer.yaconaPurchases.length > 5) return "B";
  const total = lifetimeTotal(customer.purchases);
  if (customer.purchases.length >= 2 && total >= 1_500_000) return "A1";
  if (isClusterF2(customer)) return "C-F2";
  return classifyCluster(customer, nowMonth);
}

// ---------------------------------------------------------------------------
// Filter
// ---------------------------------------------------------------------------
export function applyFilters(customers: CustomerRecord[], filters: CsCrmFilters): CustomerRecord[] {
  return customers.filter((c) => {
    const cohortMonth = monthOfIso(c.purchases[0]!.date);
    if (filters.dari && cohortMonth < filters.dari.slice(0, 7)) return false;
    if (filters.sampai && cohortMonth > filters.sampai.slice(0, 7)) return false;
    if (filters.channelType && filters.channelType !== "Semua" && c.channelType !== filters.channelType) return false;
    if (filters.cs && filters.cs !== "Semua" && !c.cs.includes(filters.cs)) return false;
    if (filters.produk && filters.produk !== "Semua") {
      const hasProduk = filters.produk === "yacona"
        ? c.yaconaPurchases.length > 0
        : c.purchases.some((p) => p.productId === filters.produk);
      if (!hasProduk) return false;
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (!c.nama.toLowerCase().includes(q) && !c.hp.includes(q)) return false;
    }
    return true;
  });
}

// ---------------------------------------------------------------------------
// Retention
// ---------------------------------------------------------------------------
export function computeRetention(customers: CustomerRecord[], nowMonth: string, monthSpan = 13): RetentionData {
  const byCohort = new Map<string, CustomerRecord[]>();
  customers.forEach((c) => {
    const m = monthOfIso(c.purchases[0]!.date);
    byCohort.set(m, [...(byCohort.get(m) ?? []), c]);
  });

  const cohortMonths = Array.from(byCohort.keys()).sort();
  const rows: RetentionCohortRow[] = cohortMonths.map((cohort) => {
    const group = byCohort.get(cohort)!;
    const cohortSize = group.length;
    const totalSales = group.reduce((s, c) => s + lifetimeTotal(c.purchases), 0);
    const newCustSales = group.reduce((s, c) => s + c.purchases[0]!.amount, 0);
    const retensiSales = Math.max(0, totalSales - newCustSales);
    const retainedCount = group.filter((c) => c.purchases.length > 1).length;
    const avgRetensi = retainedCount > 0 ? retensiSales / retainedCount : 0;

    const months: (MonthCell | null)[] = Array.from({ length: monthSpan }, (_, offset) => {
      const [y, m] = ymOf(cohort);
      const totalOffset = m - 1 + offset;
      const targetMonth = `${y + Math.floor(totalOffset / 12)}-${String((totalOffset % 12) + 1).padStart(2, "0")}`;
      if (monthDiff(targetMonth, nowMonth) < 0) return null; // belum sampai bulan itu
      const count = offset === 0 ? cohortSize : group.filter((c) => c.purchases.some((p) => monthOfIso(p.date) === targetMonth)).length;
      return { count, pct: cohortSize > 0 ? (count / cohortSize) * 100 : 0 };
    });

    const rasioRetensi = months[1]?.pct ?? 0;

    return { cohort, totalSales, newCustSales, retensiSales, avgRetensi, rasioRetensi, months };
  });

  const globalAvg: (number | null)[] = Array.from({ length: monthSpan }, (_, offset) => {
    const values = rows.map((r) => r.months[offset]).filter((m): m is MonthCell => m !== null);
    if (values.length === 0) return null;
    return values.reduce((s, m) => s + m.pct, 0) / values.length;
  });

  return { rows, globalAvg };
}

export function drillDownRetentionCell(customers: CustomerRecord[], cohort: string, monthOffset: number): DrillDownResult {
  const group = customers.filter((c) => monthOfIso(c.purchases[0]!.date) === cohort);
  const [y, m] = ymOf(cohort);
  const totalOffset = m - 1 + monthOffset;
  const targetMonth = `${y + Math.floor(totalOffset / 12)}-${String((totalOffset % 12) + 1).padStart(2, "0")}`;
  const matched = monthOffset === 0 ? group : group.filter((c) => c.purchases.some((p) => monthOfIso(p.date) === targetMonth));
  return {
    title: `Cohort ${cohort} - Month ${monthOffset}`,
    subtitle: `${matched.length} customer bertransaksi pada ${targetMonth}`,
    rows: matched.map(toDrillDownRow),
  };
}

// ---------------------------------------------------------------------------
// Frequency
// ---------------------------------------------------------------------------
export const FREQUENCY_BUCKETS = 19; // 1x..18x lalu 19x+

export function computeFrequency(customers: CustomerRecord[]): FrequencyData {
  const byCohort = new Map<string, CustomerRecord[]>();
  customers.forEach((c) => {
    const m = monthOfIso(c.purchases[0]!.date);
    byCohort.set(m, [...(byCohort.get(m) ?? []), c]);
  });
  const cohortMonths = Array.from(byCohort.keys()).sort();

  const rows: FrequencyCohortRow[] = cohortMonths.map((cohort) => {
    const group = byCohort.get(cohort)!;
    const cohortSize = group.length;
    const orders: (MonthCell | null)[] = Array.from({ length: FREQUENCY_BUCKETS }, (_, idx) => {
      const threshold = idx + 1;
      const count = group.filter((c) => c.purchases.length >= threshold).length;
      if (count === 0) return null;
      return { count, pct: cohortSize > 0 ? (count / cohortSize) * 100 : 0 };
    });
    return { cohort, orders };
  });

  const orderLabels = Array.from({ length: FREQUENCY_BUCKETS }, (_, idx) => (idx + 1 >= FREQUENCY_BUCKETS ? `${idx + 1}X+ ORDER` : `${idx + 1}X ORDER`));
  return { rows, orderLabels };
}

export function drillDownFrequencyCell(customers: CustomerRecord[], cohort: string, threshold: number): DrillDownResult {
  const group = customers.filter((c) => monthOfIso(c.purchases[0]!.date) === cohort && c.purchases.length >= threshold);
  return {
    title: `Cohort ${cohort} - ${threshold}X Order`,
    subtitle: `${group.length} customer dengan frekuensi >= ${threshold}x`,
    rows: group.map(toDrillDownRow),
  };
}

// ---------------------------------------------------------------------------
// Cluster
// ---------------------------------------------------------------------------
export function computeCluster(customers: CustomerRecord[], nowMonth: string): ClusterData {
  const buckets = new Map<ClusterKey, CustomerRecord[]>();
  CLUSTER_ORDER.forEach((k) => buckets.set(k, []));
  customers.forEach((c) => {
    const key = classifyCustomer(c, nowMonth);
    buckets.get(key)!.push(c);
  });

  const summaries: ClusterSummary[] = CLUSTER_ORDER.map((key) => {
    const group = buckets.get(key)!;
    const revenue = group.reduce((s, c) => s + lifetimeTotal(c.purchases) + (key === "B" ? c.yaconaPurchases.reduce((sy, p) => sy + p.amount, 0) : 0), 0);
    return { key, label: CLUSTER_DEFS[key].label, color: CLUSTER_DEFS[key].color, description: CLUSTER_DEFS[key].description, count: group.length, revenue, avgPerCustomer: group.length > 0 ? revenue / group.length : 0 };
  });

  const totalRevenue = summaries.reduce((s, c) => s + c.revenue, 0);
  const activeUsers = customers.length;

  return {
    kpi: { totalRevenue, totalCluster: CLUSTER_ORDER.length, lifetimeValue: activeUsers > 0 ? totalRevenue / activeUsers : 0, activeUsers },
    summaries,
  };
}

export function drillDownCluster(customers: CustomerRecord[], key: ClusterKey, nowMonth: string): DrillDownResult {
  const group = customers.filter((c) => classifyCustomer(c, nowMonth) === key);
  return {
    title: CLUSTER_DEFS[key].label,
    subtitle: `${group.length} customers - ${CLUSTER_DEFS[key].description}`,
    rows: group.map(toDrillDownRow),
  };
}

function toDrillDownRow(c: CustomerRecord): DrillDownCustomerRow {
  const totalBelanja = lifetimeTotal(c.purchases);
  const totalFisik = c.purchases.filter((p) => !isDigital(p.productId)).reduce((s, p) => s + p.amount, 0);
  const produkNames = Array.from(new Set(c.purchases.map((p) => getProduct(p.productId).name)));
  return { hp: c.hp, nama: c.nama, totalBelanja, totalFisik, freq: c.purchases.length, masukGrup: c.masukGrup, produk: produkNames, cs: c.cs };
}
