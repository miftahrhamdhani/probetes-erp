// Data dummy sementara untuk CS/CRM (Cohort & Cluster Customer Probetes). SEMUA DATA DI
// FILE INI FIKTIF — dibuat dengan generator ber-seed (bukan Math.random murni) supaya
// hasilnya SELALU SAMA setiap kali di-import (deterministik), sehingga aman untuk SSR
// tanpa hydration mismatch dan aman dipanggil ulang tanpa data "berubah-ubah sendiri".
//
// TODO: Ganti generator ini ke database/API asli setelah backend cohort tersedia.
// Sumber final idealnya: master.customers, master.customer_cohorts (frequency,
// total_spent, first/last_purchase_date), orders.customer_transactions (riwayat beli),
// plus tabel baru untuk status "masuk grup WA" dan data Yacona terpisah (lihat memory
// "klasifikasi-cluster-customer-probetes" untuk aturan cluster lengkap).

import type { ChannelType, CustomerRecord, ProductCategory, ProductDef, Purchase } from "../types/csCrmTypes";

export const PRODUCTS: ProductDef[] = [
  { id: "herbal-probetes", name: "Herbal Probetes", category: "herbal_amandia", iklanAkuisisi: true, shopee: true, tiktok: true },
  { id: "sereal-amandia", name: "Sereal Amandia", category: "herbal_amandia", iklanAkuisisi: false, shopee: true, tiktok: true },
  { id: "amandia-muesli", name: "Amandia Muesli", category: "herbal_amandia", iklanAkuisisi: false, shopee: true, tiktok: true },
  { id: "probetes-oil", name: "Probetes Oil", category: "fisik_lain", iklanAkuisisi: false, shopee: true, tiktok: true },
  { id: "beras", name: "Beras", category: "fisik_lain", iklanAkuisisi: false, shopee: true, tiktok: true },
  { id: "minyak-cco", name: "Minyak CCO", category: "fisik_lain", iklanAkuisisi: false, shopee: true, tiktok: false },
  { id: "stevia", name: "Stevia", category: "fisik_lain", iklanAkuisisi: false, shopee: true, tiktok: true },
  { id: "buku-remisi", name: "Buku Cetak Menuju Remisi", category: "digital", iklanAkuisisi: false, shopee: true, tiktok: true },
  { id: "ebook", name: "Ebook", category: "digital", iklanAkuisisi: true, shopee: true, tiktok: false },
  { id: "yacona", name: "Yacona", category: "yacona", iklanAkuisisi: false, shopee: false, tiktok: false },
];

const PRODUCT_MAP = new Map(PRODUCTS.map((p) => [p.id, p]));
export function getProduct(id: string): ProductDef {
  return PRODUCT_MAP.get(id) ?? PRODUCTS[0]!;
}

const BY_CATEGORY: Record<Exclude<ProductCategory, "yacona">, ProductDef[]> = {
  digital: PRODUCTS.filter((p) => p.category === "digital"),
  herbal_amandia: PRODUCTS.filter((p) => p.category === "herbal_amandia"),
  fisik_lain: PRODUCTS.filter((p) => p.category === "fisik_lain"),
};
const ALL_NON_YACONA = PRODUCTS.filter((p) => p.category !== "yacona");

export const CS_NAMES = ["Feni", "Manda", "Rista", "Novita", "Desti", "Anggi", "Fian"] as const;

// --- RNG deterministik (mulberry32) — supaya data mock selalu sama tiap dimuat -------------
function mulberry32(seed: number) {
  let a = seed;
  return function rand() {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20260713);
const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(rand() * arr.length)]!;
const int = (min: number, max: number) => Math.floor(min + rand() * (max - min + 1));

// --- Util tanggal (semua berbasis bulan kalender, tanpa Date.now() supaya deterministik) --
const NOW = "2026-07-13";
const [NOW_Y, NOW_M] = [2026, 7];

function monthKey(y: number, m: number): string {
  return `${y}-${String(m).padStart(2, "0")}`;
}
function addMonths(y: number, m: number, delta: number): [number, number] {
  const total = y * 12 + (m - 1) + delta;
  return [Math.floor(total / 12), (total % 12) + 1];
}
function monthsBetween(fromY: number, fromM: number, toY: number, toM: number): number {
  return (toY * 12 + toM) - (fromY * 12 + fromM);
}
function isoDate(y: number, m: number, d: number): string {
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}
function monthOfIso(iso: string): string {
  return iso.slice(0, 7);
}

/** Semua bulan cohort yang dipakai mock: Mar 2025 s/d bulan berjalan (Jul 2026) —
 * rentang ini sengaja mencakup periode Cluster E (Mar-Okt 2025) dan cutoff Cluster C/D/Dhp
 * (Nov 2025-now), sesuai aturan di memory "klasifikasi-cluster-customer-probetes". */
export const COHORT_MONTHS: string[] = (() => {
  const months: string[] = [];
  let [y, m] = [2025, 3];
  while (y < NOW_Y || (y === NOW_Y && m <= NOW_M)) {
    months.push(monthKey(y, m));
    [y, m] = addMonths(y, m, 1);
  }
  return months;
})();

const NAMES_FIRST = ["Ayu", "Bimo", "Citra", "Dani", "Eka", "Fajar", "Gita", "Hendra", "Indah", "Joko", "Kirana", "Lestari", "Mega", "Nadia", "Omar", "Putri", "Rian", "Sinta", "Tono", "Umi", "Vina", "Wawan", "Yuni", "Zaki"];
const NAMES_LAST = ["Saputra", "Wijaya", "Pratama", "Kusuma", "Ramadhan", "Utami", "Santoso", "Handayani", "Firmansyah", "Nugroho"];

function priceFor(category: ProductCategory): number {
  if (category === "digital") return int(89, 145) * 1000;
  if (category === "herbal_amandia") return int(150, 420) * 1000;
  if (category === "yacona") return int(65, 145) * 1000;
  return int(42, 120) * 1000;
}

type PathType = "ebook_only" | "herbal_first" | "mixed" | "other_fisik";

function pickPathType(): PathType {
  const r = rand();
  if (r < 0.22) return "ebook_only";
  if (r < 0.6) return "herbal_first";
  if (r < 0.85) return "mixed";
  return "other_fisik";
}

function pickProductForPath(path: PathType, isFirst: boolean): ProductDef {
  if (path === "ebook_only") return pick(BY_CATEGORY.digital);
  if (path === "herbal_first" && isFirst) return pick(BY_CATEGORY.herbal_amandia);
  if (path === "other_fisik" && isFirst) return pick(BY_CATEGORY.fisik_lain);
  return pick(ALL_NON_YACONA);
}

function pickFrequency(): number {
  const r = rand();
  if (r < 0.55) return 1;
  if (r < 0.75) return 2;
  if (r < 0.85) return 3;
  if (r < 0.92) return 4;
  return int(5, 9);
}

function generateCustomer(cohortIdx: number, custIdx: number, cohortMonth: string): CustomerRecord {
  const [cy, cm] = cohortMonth.split("-").map(Number) as [number, number];
  const path = pickPathType();
  const freq = pickFrequency();
  const day1 = int(1, 27);

  const purchases: Purchase[] = [];
  let curY = cy, curM = cm, curDay = day1;
  for (let i = 0; i < freq; i++) {
    if (i > 0) {
      const gapDays = int(20, 70);
      const totalDays = curDay + gapDays;
      const extraMonths = Math.floor((totalDays - 1) / 30);
      [curY, curM] = addMonths(curY, curM, extraMonths);
      curDay = ((totalDays - 1) % 30) + 1;
      if (monthsBetween(curY, curM, NOW_Y, NOW_M) < 0) break; // jangan lewati "sekarang"
    }
    const product = pickProductForPath(path, i === 0);
    purchases.push({ date: isoDate(curY, curM, Math.min(curDay, 27)), productId: product.id, amount: priceFor(product.category) });
  }
  if (purchases.length === 0) {
    const product = pickProductForPath(path, true);
    purchases.push({ date: isoDate(cy, cm, day1), productId: product.id, amount: priceFor(product.category) });
  }

  // Yacona: ~4% pelanggan jadi pembeli Yacona berulang (untuk menguji override Cluster B).
  const yaconaPurchases: Purchase[] = [];
  if (rand() < 0.04) {
    const count = int(2, 12);
    let yy = cy, ym = cm, yd = int(1, 20);
    for (let i = 0; i < count; i++) {
      if (monthsBetween(yy, ym, NOW_Y, NOW_M) < 0) break;
      yaconaPurchases.push({ date: isoDate(yy, ym, yd), productId: "yacona", amount: priceFor("yacona") });
      const gap = int(15, 45);
      const total = yd + gap;
      [yy, ym] = addMonths(yy, ym, Math.floor((total - 1) / 30));
      yd = ((total - 1) % 30) + 1;
    }
  }

  const isRecentCohort = monthsBetween(2025, 11, cy, cm) >= 0; // cohort >= Nov 2025
  const grupBase = isRecentCohort ? 0.55 : 0.2;
  const masukGrup = (path === "ebook_only" || path === "herbal_first") && rand() < grupBase;

  const firstProduct = getProduct(purchases[0]!.productId);
  let channelType: ChannelType = "Marketplace";
  if ((firstProduct.id === "ebook" || firstProduct.id === "herbal-probetes") && rand() < 0.5) channelType = "Akuisisi";
  else if (rand() < 0.05) channelType = "Offline";

  const csCount = rand() < 0.3 ? 2 : 1;
  const cs = Array.from(new Set(Array.from({ length: csCount }, () => pick(CS_NAMES))));

  return {
    id: `CUST-${String(cohortIdx).padStart(2, "0")}-${String(custIdx).padStart(4, "0")}`,
    hp: `62${int(811, 899)}${int(1000000, 9999999)}`,
    nama: `${pick(NAMES_FIRST)} ${pick(NAMES_LAST)}`,
    channelType,
    cs,
    masukGrup,
    purchases,
    yaconaPurchases,
  };
}

function newCustCountFor(cohortIdx: number, totalCohorts: number): number {
  // Pola pertumbuhan longgar mengikuti tren di dashboard referensi (kecil di awal,
  // membesar mendekati sekarang) — angka fiktif, bukan hasil observasi data asli.
  const growth = cohortIdx / Math.max(1, totalCohorts - 1);
  const base = 25 + growth * 90;
  return Math.round(base + rand() * 30);
}

/** Seluruh pelanggan mock (non-Yacona jadi basis cohort, Yacona nempel sebagai data terpisah). */
export const ALL_CUSTOMERS: CustomerRecord[] = (() => {
  const customers: CustomerRecord[] = [];
  COHORT_MONTHS.forEach((month, idx) => {
    const count = newCustCountFor(idx, COHORT_MONTHS.length);
    for (let i = 0; i < count; i++) customers.push(generateCustomer(idx, i, month));
  });
  return customers;
})();

export function firstPurchaseMonth(customer: CustomerRecord): string {
  return monthOfIso(customer.purchases[0]!.date);
}

export const FILTER_OPTIONS = {
  produk: [{ value: "Semua", label: "Semua Produk" }, ...ALL_NON_YACONA.map((p) => ({ value: p.id, label: p.name })), { value: "yacona", label: "Yacona" }],
  cs: [{ value: "Semua", label: "Semua CS" }, ...CS_NAMES.map((c) => ({ value: c, label: c }))],
  channelType: [
    { value: "Semua", label: "Semua Data" },
    { value: "Akuisisi", label: "Akuisisi (Meta/CRM)" },
    { value: "Marketplace", label: "Marketplace" },
  ],
};

export const DATA_TERKINI = NOW;
