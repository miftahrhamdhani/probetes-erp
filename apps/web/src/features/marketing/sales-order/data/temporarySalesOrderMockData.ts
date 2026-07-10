// Data dummy sementara untuk Sales & Order (pengganti tampilan lama "Laporan Penjualan
// & Pesanan" di Marketing). SEMUA ANGKA DI FILE INI FIKTIF — dipakai supaya tampilan bisa
// dicoba sebelum data asli tersambung.
//
// TODO: Ganti isi fungsi-fungsi di ../lib/salesOrderService.ts supaya membaca dari
// database/API asli (orders.orders, orders.order_items, master.products/channels/users,
// tracking.shipments/returns) — JANGAN hapus bentuk tipe di salesOrder.types.ts saat itu,
// cukup ganti sumber datanya.
//
// Channel & produk sengaja memakai nama nyata Probetes (TikTok Shop, Shopee, Meta/CRM,
// Probetes Herbal, Amandia, Ebook 90) — bukan produk generik dari gambar mockup — karena
// mockup di D:\PROBETES\mockup sales & order hanya referensi TAMPILAN, bukan sumber data.

import type {
  CenterMenuCard,
  CsCrmData,
  CsCrmRow,
  DataReviewIssue,
  KpiItem,
  OrderStatusData,
  OrderStatusRow,
  PlatformSummaryRow,
  ProductPerformanceData,
  ProductRow,
  ReturnDataReviewData,
  SalesOrderCenterData,
  SalesOverviewData,
  StoreChannelData,
  StoreChannelRow,
  TopChannelRow,
} from "../types/salesOrder.types";

const DAYS = ["12 Mei", "13 Mei", "14 Mei", "15 Mei", "16 Mei", "17 Mei", "18 Mei", "19 Mei", "20 Mei"];
const PLATFORMS = ["TikTok Shop", "Shopee", "Meta / CRM"];
const PLATFORM_COLOR: Record<string, string> = { "TikTok Shop": "#2563EB", Shopee: "#F59E0B", "Meta / CRM": "#E30613" };

const kpi = (label: string, value: string, icon: string, tone: KpiItem["tone"], pct?: number, goodWhenUp = true, caption?: string): KpiItem => ({
  label, value, icon, tone,
  delta: pct !== undefined ? { pct, goodWhenUp } : undefined,
  caption,
});

// =============================================================================
// SALES & ORDER CENTER
// =============================================================================
const centerMenuCards: CenterMenuCard[] = [
  {
    id: "overview",
    href: "/marketing/sales-order/overview",
    title: "Overview Penjualan",
    miniTitle: "Sales 7 Hari Terakhir",
    description: "Ringkasan sales, order, AOV, repeat customer, dan tren harian.",
    stats: [
      { label: "Sales Hari Ini", value: "Rp8,6 jt", deltaPct: 14.6 },
      { label: "Order", value: "1.248", deltaPct: 9.2 },
      { label: "AOV", value: "Rp103.450", deltaPct: 7.1 },
      { label: "Repeat Cust.", value: "37,6%", deltaPct: 3.4 },
    ],
  },
  {
    id: "products",
    href: "/marketing/sales-order/products",
    title: "Performa Produk",
    miniTitle: "Top 5 Produk",
    description: "Produk terlaris, kontribusi sales, tren SKU, dan retur produk.",
    stats: [
      { label: "Produk Terlaris", value: "Probetes Herbal 24" },
      { label: "Kontribusi Sales", value: "28,4%" },
      { label: "SKU Aktif", value: "1.238" },
      { label: "Retur Produk", value: "2,71%" },
    ],
  },
  {
    id: "stores-channels",
    href: "/marketing/sales-order/stores-channels",
    title: "Performa Toko & Channel",
    miniTitle: "Sales per Channel",
    description: "Bandingkan TikTok, Shopee, Meta/CRM, dan performa per toko.",
    stats: [
      { label: "Channel Teratas", value: "TikTok Shop" },
      { label: "Sales", value: "Rp57,8 jt" },
      { label: "Order", value: "632" },
      { label: "Toko Aktif", value: "18" },
    ],
  },
  {
    id: "cs-crm",
    href: "/marketing/sales-order/cs-crm",
    title: "Performa CS / CRM",
    miniTitle: "Sales per Tim",
    description: "Sales per tim, repeat order, customer baru, dan AOV per user.",
    stats: [
      { label: "Total CS Aktif", value: "26" },
      { label: "Sales per CS", value: "Rp4,95 jt" },
      { label: "Repeat Order", value: "41,2%" },
      { label: "Customer Baru", value: "1.027" },
    ],
  },
  {
    id: "order-status",
    href: "/marketing/sales-order/order-status",
    title: "Status Pesanan & COD",
    miniTitle: "Status Order",
    description: "Pantau order sukses, pending, COD belum cair, dan status pengiriman.",
    stats: [
      { label: "Order Sukses", value: "1.248" },
      { label: "Pending", value: "208" },
      { label: "COD Belum Cair", value: "Rp18,4 jt" },
      { label: "On Delivery", value: "312" },
    ],
  },
  {
    id: "returns-review",
    href: "/marketing/sales-order/returns-review",
    title: "Retur & Data Review",
    miniTitle: "Retur per Hari (7 Hari)",
    description: "Retur, gagal kirim, data kosong, dan issue yang perlu ditindak.",
    stats: [
      { label: "Total Retur", value: "42" },
      { label: "Retur Rate", value: "1,92%" },
      { label: "Gagal Kirim", value: "18" },
      { label: "Data Kosong", value: "7" },
    ],
  },
];

export function getSalesOrderCenterMock(): SalesOrderCenterData {
  return {
    heroStats: [
      { label: "Sales Hari Ini", value: "Rp8,6 jt", deltaPct: 14.6 },
      { label: "Order Sukses", value: "1.248", deltaPct: 9.2 },
      { label: "AOV", value: "Rp103.450", deltaPct: 7.1 },
    ],
    menuCards: centerMenuCards,
  };
}

// =============================================================================
// OVERVIEW PENJUALAN
// =============================================================================
const overviewTrend = [4_950_000, 9_286_000, 10_612_750, 9_069_999, 9_181_500, 11_091_000, 6_472_750, 3_942_250, 5_206_750];
const overviewOrderTrend = [42, 78, 88, 66, 71, 92, 58, 39, 46];

const overviewPlatformTable: PlatformSummaryRow[] = [
  { platform: "TikTok Shop", sales: 57_800_000, salesDeltaPct: 15.2, order: 632, qty: 1125, aov: 91_519, repeatRate: 38.9, repeatDeltaPp: 3.2, customerBaru: 532, customerBaruDeltaPct: 13.6, customerRepeat: 246, customerRepeatDeltaPct: 7.6, status: "Baik" },
  { platform: "Shopee", sales: 34_200_000, salesDeltaPct: 12.3, order: 421, qty: 798, aov: 81_234, repeatRate: 32.2, repeatDeltaPp: 2.1, customerBaru: 322, customerBaruDeltaPct: 10.9, customerRepeat: 136, customerRepeatDeltaPct: 5.4, status: "Baik" },
  { platform: "Meta / CRM", sales: 24_100_000, salesDeltaPct: 14.9, order: 153, qty: 312, aov: 157_516, repeatRate: 28.1, repeatDeltaPp: 1.8, customerBaru: 143, customerBaruDeltaPct: 12.7, customerRepeat: 43, customerRepeatDeltaPct: 4.9, status: "Cukup" },
  { platform: "Lainnya", sales: 12_600_000, salesDeltaPct: 9.1, order: 42, qty: 121, aov: 299_048, repeatRate: 21.5, repeatDeltaPp: -0.8, customerBaru: 30, customerBaruDeltaPct: 8.3, customerRepeat: 12, customerRepeatDeltaPct: -1.2, status: "Cukup" },
];

export function getSalesOverviewMock(): SalesOverviewData {
  return {
    updateTerakhir: "20 Mei 2026 10:30",
    filters: {
      platform: [{ value: "Semua", label: "Semua Platform" }, ...PLATFORMS.map((p) => ({ value: p, label: p }))],
      toko: [{ value: "Semua", label: "Semua Toko" }],
      produk: [{ value: "Semua", label: "Semua Produk" }],
      status: [{ value: "Semua", label: "Semua Status" }],
      metodeBayar: [{ value: "Semua", label: "Semua Metode" }],
    },
    kpi: [
      kpi("Total Sales", "Rp128,7 jt", "wallet", "red", 14.6),
      kpi("Total Order", "1.248", "receipt", "slate", 9.2),
      kpi("Qty Terjual", "2.356", "box", "slate", 11.8),
      kpi("AOV (Rata-rata)", "Rp103.450", "cart", "slate", 7.1),
      kpi("Customer Baru", "1.027", "user-plus", "slate", 13.4),
      kpi("Customer Repeat", "689", "repeat", "slate", 6.7),
    ],
    trend: DAYS.map((label, i) => ({ label, sales: overviewTrend[i]!, order: overviewOrderTrend[i]! })),
    salesPerPlatform: [
      { name: "TikTok Shop", value: 57_800_000 },
      { name: "Shopee", value: 34_200_000 },
      { name: "Meta / CRM", value: 24_100_000 },
      { name: "Lainnya", value: 12_600_000 },
    ],
    orderPerPlatform: [
      { name: "TikTok Shop", value: 632 },
      { name: "Shopee", value: 421 },
      { name: "Meta / CRM", value: 153 },
      { name: "Lainnya", value: 42 },
    ],
    salesVsOrderPerPlatform: [
      { name: "TikTok Shop", sales: 57_800_000, order: 632 },
      { name: "Shopee", sales: 34_200_000, order: 421 },
      { name: "Meta / CRM", sales: 24_100_000, order: 153 },
      { name: "Lainnya", sales: 12_600_000, order: 42 },
    ],
    customerComposition: [
      { label: "Baru", value: 1027, pct: 53.4, color: "#E30613" },
      { label: "Repeat", value: 689, pct: 35.8, color: "#2563EB" },
      { label: "Loyal", value: 206, pct: 10.8, color: "#F59E0B" },
    ],
    totalCustomer: 1922,
    topProduk: [
      { rank: 1, code: "PB-001", name: "Probetes Herbal 24", sales: 18_200_000 },
      { rank: 2, code: "PB-002", name: "Amandia 7 Herbal Booster", sales: 14_600_000 },
      { rank: 3, code: "PB-003", name: "Ebook 90 Hari Remisi", sales: 11_300_000 },
      { rank: 4, code: "PB-004", name: "Paket Probetes Herbal", sales: 8_700_000 },
      { rank: 5, code: "PB-005", name: "Amandia 10 Kapsul", sales: 7_100_000 },
    ],
    table: overviewPlatformTable,
  };
}

// =============================================================================
// PERFORMA PRODUK
// =============================================================================
const produkList = [
  { sku: "PB-001", nama: "Probetes Herbal 24", kategori: "HP/Amandia", sales: 45_210_000, qty: 4536, order: 1238, retur: 89 },
  { sku: "PB-002", nama: "Amandia 7 Herbal Booster", kategori: "HP/Amandia", sales: 32_710_000, qty: 3287, order: 1052, retur: 62 },
  { sku: "PB-003", nama: "Ebook 90 Hari Remisi", kategori: "Digital", sales: 19_830_000, qty: 2514, order: 842, retur: 34 },
  { sku: "PB-004", nama: "Paket Probetes Herbal", kategori: "HP/Amandia", sales: 12_510_000, qty: 1928, order: 618, retur: 24 },
  { sku: "PB-005", nama: "Amandia 10 Kapsul", kategori: "HP/Amandia", sales: 10_110_000, qty: 1602, order: 501, retur: 15 },
  { sku: "PB-006", nama: "Ebook 145", kategori: "Digital", sales: 8_250_000, qty: 1347, order: 420, retur: 9 },
  { sku: "PB-007", nama: "Buku Remisi Diabetes", kategori: "Digital", sales: 7_320_000, qty: 1102, order: 388, retur: 7 },
  { sku: "PB-008", nama: "Yacona 60", kategori: "Fisik Lain", sales: 5_870_000, qty: 932, order: 301, retur: 5 },
  { sku: "PB-009", nama: "Beras Organik", kategori: "Fisik Lain", sales: 4_580_000, qty: 784, order: 260, retur: 4 },
  { sku: "PB-010", nama: "Probetes Oil", kategori: "Fisik Lain", sales: 3_960_000, qty: 608, order: 199, retur: 2 },
];

function moveStatus(qty: number, maxQty: number): ProductRow["status"] {
  const ratio = qty / maxQty;
  if (ratio >= 0.5) return "Fast Moving";
  if (ratio >= 0.15) return "Medium Moving";
  return "Slow Moving";
}

const totalSalesProduk = produkList.reduce((s, p) => s + p.sales, 0);
const maxQtyProduk = Math.max(...produkList.map((p) => p.qty));

const produkTable: ProductRow[] = produkList.map((p) => {
  const returRate = (p.retur / p.order) * 100;
  const margin = Math.round(p.sales * (0.31 + (p.sku.charCodeAt(3) % 5) * 0.01));
  return {
    sku: p.sku, nama: p.nama, kategori: p.kategori, sales: p.sales,
    sharePct: (p.sales / totalSalesProduk) * 100, qty: p.qty, order: p.order,
    retur: p.retur, returRate, margin, marginPct: (margin / p.sales) * 100,
    status: moveStatus(p.qty, maxQtyProduk),
  };
});

const kategoriTotals = produkTable.reduce<Record<string, number>>((acc, p) => { acc[p.kategori] = (acc[p.kategori] ?? 0) + p.sales; return acc; }, {});
const KATEGORI_COLOR: Record<string, string> = { "HP/Amandia": "#E30613", Digital: "#7C3AED", "Fisik Lain": "#059669" };

export function getProductPerformanceMock(): ProductPerformanceData {
  const totalRetur = produkTable.reduce((s, p) => s + p.retur, 0);
  return {
    filters: {
      platform: [{ value: "Semua", label: "Semua Platform" }, ...PLATFORMS.map((p) => ({ value: p, label: p }))],
      toko: [{ value: "Semua", label: "Semua Toko" }],
      kategori: [{ value: "Semua", label: "Semua Kategori" }, ...Object.keys(KATEGORI_COLOR).map((k) => ({ value: k, label: k }))],
      sku: [{ value: "Semua", label: "Semua SKU" }],
      status: [{ value: "Semua", label: "Semua Status" }],
    },
    kpi: [
      kpi("Total SKU Aktif", "1.238", "box", "red", 8.6),
      kpi("Produk Terlaris", "Probetes Herbal 24", "award", "slate"),
      kpi("Total Qty Terjual", "27.842", "shopping-bag", "slate", 12.3),
      kpi("Kontribusi Produk Utama", "48,7%", "pie-chart", "slate", 3.9),
      kpi("Retur Produk", "312", "rotate-ccw", "amber", 2.7, false),
      kpi("Average Sales per SKU", "Rp36,61 jt", "trending-up", "slate", 9.1),
    ],
    produkTerlaris: { code: "PB-001", name: "Probetes Herbal 24", sales: 45_210_000 },
    topBySales: produkTable.slice(0, 10).map((p) => ({ code: p.sku, name: p.nama, value: p.sales })),
    topByQty: [...produkTable].sort((a, b) => b.qty - a.qty).slice(0, 10).map((p) => ({ code: p.sku, name: p.nama, value: p.qty })),
    trendProdukUtama: {
      colors: { "Probetes Herbal 24": "#E30613", "Amandia 7 Herbal Booster": "#2563EB", "Ebook 90 Hari Remisi": "#7C3AED", "Paket Probetes Herbal": "#F59E0B" },
      points: DAYS.map((label, i) => ({
        label,
        values: {
          "Probetes Herbal 24": 3_800_000 + i * 90_000 + (i % 3) * 120_000,
          "Amandia 7 Herbal Booster": 2_600_000 + i * 60_000 + (i % 4) * 90_000,
          "Ebook 90 Hari Remisi": 1_500_000 + i * 40_000 + (i % 2) * 60_000,
          "Paket Probetes Herbal": 900_000 + i * 25_000,
        },
      })),
    },
    kategoriDonut: Object.entries(kategoriTotals).map(([label, sales]) => ({ label, value: (sales / totalSalesProduk) * 100, sales, color: KATEGORI_COLOR[label] ?? "#94A3B8" })),
    totalSalesKategori: totalSalesProduk,
    returTertinggi: [...produkTable].sort((a, b) => b.retur - a.retur).slice(0, 5).map((p) => ({ sku: p.sku, nama: p.nama, retur: p.retur, returRate: p.returRate })),
    movingMatrix: {
      rows: [
        { label: "Tinggi (>= Rp10 jt)", values: [128, 62, 18] },
        { label: "Sedang (Rp5-10 jt)", values: [145, 94, 28] },
        { label: "Rendah (< Rp5 jt)", values: [86, 71, 34] },
      ],
      columns: ["Fast Moving", "Medium Moving", "Slow Moving"],
      totals: { skuTotal: 359, sedang: 227, rendah: 80 },
    },
    insights: [
      "Probetes Herbal 24 menjadi kontributor terbesar (35,1%) dengan penjualan Rp45,21 jt.",
      "Kategori HP/Amandia mendominasi kontribusi sales sebesar 58,3%.",
      "Retur tertinggi terdapat pada Probetes Herbal 24 dengan retur rate 7,19%.",
      "359 SKU termasuk fast moving dan berkontribusi 72,9% dari total sales.",
    ],
    table: produkTable,
  };
}

// =============================================================================
// PERFORMA TOKO & CHANNEL
// =============================================================================
const tokoList = [
  { toko: "Probetes Herbal Official", platform: "TikTok Shop", sales: 224_500_000, order: 268, produkTerlaris: "Probetes Herbal 24 (28%)", repeatCustomer: 38.6 },
  { toko: "Probetes Store", platform: "Shopee", sales: 187_200_000, order: 214, produkTerlaris: "Amandia 7 (26%)", repeatCustomer: 35.3 },
  { toko: "Probetes Digital", platform: "Shopee", sales: 156_700_000, order: 178, produkTerlaris: "Probetes Herbal 24 (24%)", repeatCustomer: 32.9 },
  { toko: "Probetes Amandia", platform: "TikTok Shop", sales: 121_300_000, order: 136, produkTerlaris: "Ebook 90 (22%)", repeatCustomer: 29.7 },
  { toko: "Akuisisi Skalev", platform: "Meta / CRM", sales: 98_600_000, order: 98, produkTerlaris: "Amandia 10 (23%)", repeatCustomer: 27.1 },
  { toko: "Probetes Makassar", platform: "Shopee", sales: 82_400_000, order: 82, produkTerlaris: "Amandia 7 (25%)", repeatCustomer: 25.3 },
  { toko: "CRM WA Group", platform: "Meta / CRM", sales: 61_500_000, order: 72, produkTerlaris: "Probetes Herbal 24 (27%)", repeatCustomer: 23.4 },
];

export function getStoreChannelPerformanceMock(): StoreChannelData {
  const totalSales = tokoList.reduce((s, t) => s + t.sales, 0);
  const totalOrder = tokoList.reduce((s, t) => s + t.order, 0);
  const channelSales = PLATFORMS.map((platform) => ({ platform, sales: tokoList.filter((t) => t.platform === platform).reduce((s, t) => s + t.sales, 0) }));
  const table: StoreChannelRow[] = tokoList.map((t) => ({
    toko: t.toko, platform: t.platform, sales: t.sales, order: t.order,
    aov: Math.round(t.sales / t.order), produkTerlaris: t.produkTerlaris,
    repeatCustomer: t.repeatCustomer, status: "Aktif",
  }));
  const topChannel: TopChannelRow[] = channelSales
    .sort((a, b) => b.sales - a.sales)
    .map((c, i) => ({ rank: i + 1, channel: c.platform, sales: c.sales, order: tokoList.filter((t) => t.platform === c.platform).reduce((s, t) => s + t.order, 0), marketSharePct: (c.sales / totalSales) * 100 }));

  return {
    filters: {
      platform: [{ value: "Semua", label: "Semua Platform" }, ...PLATFORMS.map((p) => ({ value: p, label: p }))],
      toko: [{ value: "Semua", label: "Semua Toko" }],
      channel: [{ value: "Semua", label: "Semua Channel" }],
      produk: [{ value: "Semua", label: "Semua Produk" }],
      status: [{ value: "Semua", label: "Semua Status" }],
    },
    kpi: [
      kpi("Total Sales Channel", "Rp1,25 M", "wallet", "red", 14.6),
      kpi("Total Order Channel", "1.248", "receipt", "slate", 9.2),
      kpi("Toko Aktif", "26", "store", "slate", 8.3),
      kpi("Channel Terbaik", "TikTok Shop", "award", "slate"),
      kpi("AOV Channel", "Rp103.450", "cart", "slate", 7.1),
      kpi("Conversion Ringkas", "2,71%", "target", "slate", 0.28),
    ],
    channelTerbaik: { name: topChannel[0]!.channel, sales: topChannel[0]!.sales, sharePct: topChannel[0]!.marketSharePct },
    channelDonut: channelSales.map((c) => ({ label: c.platform, value: c.sales, color: PLATFORM_COLOR[c.platform] ?? "#94A3B8" })),
    totalChannelSales: totalSales,
    salesPerToko: tokoList.map((t) => ({ name: t.toko, value: t.sales })),
    orderPerToko: tokoList.map((t) => ({ name: t.toko, value: t.order })),
    trendPerChannel: {
      colors: { "TikTok Shop": PLATFORM_COLOR["TikTok Shop"]!, Shopee: PLATFORM_COLOR.Shopee!, "Meta / CRM": PLATFORM_COLOR["Meta / CRM"]! },
      points: DAYS.map((label, i) => ({
        label,
        values: {
          "TikTok Shop": 22_000_000 + i * 1_500_000 + (i % 3) * 2_000_000,
          Shopee: 15_000_000 + i * 900_000 + (i % 4) * 1_400_000,
          "Meta / CRM": 9_000_000 + i * 500_000 + (i % 2) * 900_000,
        },
      })),
    },
    distribusiOrderPerChannel: {
      colors: { "TikTok Shop": PLATFORM_COLOR["TikTok Shop"]!, Shopee: PLATFORM_COLOR.Shopee!, "Meta / CRM": PLATFORM_COLOR["Meta / CRM"]! },
      points: DAYS.map((label) => ({ label, values: { "TikTok Shop": 45, Shopee: 33, "Meta / CRM": 22 } })),
    },
    salesVsOrderPerToko: tokoList.map((t) => ({ name: t.toko, sales: t.sales, order: t.order })),
    table,
    topChannel: topChannel.slice(0, 5),
  };
}

// =============================================================================
// PERFORMA CS / CRM
// =============================================================================
const csList = [
  { nama: "Rina Wulandari", divisi: "CRM", sales: 428_450_000, order: 612, customerBaru: 198, repeatOrder: 63.9, followUp: 38.2 },
  { nama: "Fajar Nopriangga", divisi: "CRM", sales: 389_230_000, order: 552, customerBaru: 176, repeatOrder: 57.2, followUp: 37.6 },
  { nama: "Rizky Ananda", divisi: "Marketplace", sales: 364_870_000, order: 501, customerBaru: 164, repeatOrder: 59.5, followUp: 34.1 },
  { nama: "Siti Nurhaliza", divisi: "Retail", sales: 317_850_000, order: 428, customerBaru: 142, repeatOrder: 58.2, followUp: 32.8 },
  { nama: "Dini Puspita", divisi: "CS", sales: 276_400_000, order: 401, customerBaru: 130, repeatOrder: 41.6, followUp: 29.4 },
  { nama: "Budi Santoso", divisi: "Marketplace", sales: 244_100_000, order: 355, customerBaru: 112, repeatOrder: 38.9, followUp: 25.1 },
  { nama: "Agus Setiawan", divisi: "Marketplace", sales: 42_180_000, order: 58, customerBaru: 18, repeatOrder: 27.6, followUp: 12.1 },
];

const csTable: CsCrmRow[] = csList.map((c) => ({
  nama: c.nama, divisi: c.divisi, sales: c.sales, order: c.order,
  customerBaru: c.customerBaru, repeatOrder: Math.round((c.repeatOrder / 100) * c.order),
  aov: Math.round(c.sales / c.order), followUpSuccessRate: c.followUp,
  status: c.followUp >= 30 ? "Aktif" : c.followUp >= 15 ? "Aktif" : "Perlu Evaluasi",
}));

const divisiTotals = Object.entries(
  csList.reduce<Record<string, number>>((acc, c) => { acc[c.divisi] = (acc[c.divisi] ?? 0) + c.sales; return acc; }, {}),
).map(([name, value]) => ({ name, value }));

export function getCsCrmPerformanceMock(): CsCrmData {
  const totalSales = csList.reduce((s, c) => s + c.sales, 0);
  const totalBaru = csList.reduce((s, c) => s + c.customerBaru, 0);
  const totalRepeatOrder = csTable.reduce((s, c) => s + c.repeatOrder, 0);
  const totalCustomer = totalBaru + totalRepeatOrder;
  const sortedBySales = [...csTable].sort((a, b) => b.sales - a.sales);
  const top3 = sortedBySales.slice(0, 3);
  const bottom3 = [...sortedBySales].reverse().slice(0, 3);

  return {
    filters: {
      divisi: [{ value: "Semua", label: "Semua Divisi" }, ...Array.from(new Set(csList.map((c) => c.divisi))).map((d) => ({ value: d, label: d }))],
      cs: [{ value: "Semua", label: "Semua CS/CRM" }, ...csList.map((c) => ({ value: c.nama, label: c.nama }))],
      platform: [{ value: "Semua", label: "Semua Platform" }, ...PLATFORMS.map((p) => ({ value: p, label: p }))],
      toko: [{ value: "Semua", label: "Semua Toko" }],
      segmen: [{ value: "Semua", label: "Semua Segmen" }],
    },
    kpi: [
      kpi("Total CS Aktif", "26", "users", "red", 8.3, true, "vs 01-18 Apr 2026: 24"),
      kpi("Total Sales per Tim", "Rp4,95 jt", "wallet", "slate", 9.2),
      kpi("Customer Baru", "1.027", "user-plus", "slate", 14.1),
      kpi("Repeat Order", "41,2%", "repeat", "slate", 3.6),
      kpi("AOV per User", "Rp191,2 rb", "cart", "slate", 4.7),
      kpi("Follow-up Success Rate", "31,4%", "target", "slate", 5.1),
    ],
    salesPerTim: divisiTotals.sort((a, b) => b.value - a.value).map((d) => ({ name: d.name, value: d.value })),
    topCsBySales: sortedBySales.slice(0, 10).map((c, i) => ({ rank: i + 1, name: c.nama, sales: c.sales })),
    komposisiCustomer: [
      { label: "Repeat Order", value: totalRepeatOrder, pct: (totalRepeatOrder / totalCustomer) * 100, color: "#E30613" },
      { label: "Customer Baru", value: totalBaru, pct: (totalBaru / totalCustomer) * 100, color: "#F59E0B" },
    ],
    totalCustomer,
    followUpTrend: DAYS.map((label, i) => ({ label, followUp: 90 + i * 8 + (i % 3) * 10, closing: 30 + i * 2 + (i % 4) * 4 })),
    followUpBadge: { followUp: 146, closing: 46 },
    orderBaruVsRepeat: csTable.slice(0, 5).map((c) => ({ name: c.divisi, baru: c.customerBaru, repeat: c.repeatOrder })),
    topPerformer: top3.map((c, i) => ({ rank: i + 1, name: c.nama, sales: c.sales, aov: c.aov })),
    topPerformerFooter: { totalSales: top3.reduce((s, c) => s + c.sales, 0), kontribusiPct: (top3.reduce((s, c) => s + c.sales, 0) / totalSales) * 100 },
    perluEvaluasi: bottom3.map((c, i) => ({ rank: i + 1, name: c.nama, sales: c.sales, aov: c.aov })),
    perluEvaluasiFooter: { totalSales: bottom3.reduce((s, c) => s + c.sales, 0), kontribusiPct: (bottom3.reduce((s, c) => s + c.sales, 0) / totalSales) * 100 },
    followUpStats: [
      { label: "Total Follow-up", value: "1.024", deltaPct: 12.6 },
      { label: "Total Closing", value: "322", deltaPct: 18.9 },
      { label: "Follow-up Success Rate", value: "31,4%", deltaPct: 5.1 },
      { label: "Avg Response Time", value: "2j 34m", deltaPct: -0.18 },
      { label: "Conversion to Order", value: "21,8%", deltaPct: 3.4 },
    ],
    table: csTable,
    totalRows: 26,
    pageSize: 5,
  };
}

// =============================================================================
// STATUS PESANAN & COD
// =============================================================================
const STATUS_COLOR: Record<string, string> = {
  "Order Sukses": "#059669",
  Pending: "#F59E0B",
  "Proses / On Delivery": "#2563EB",
  "COD Belum Cair": "#7C3AED",
  Dibatalkan: "#E30613",
  Dikembalikan: "#94A3B8",
};

const statusRows: { status: string; jumlah: number; nilai: number; cod: number; sla: OrderStatusRow["sla"]; review: OrderStatusRow["statusReview"] }[] = [
  { status: "Order Sukses", jumlah: 1248, nilai: 128_700_000, cod: 111_500_000, sla: { label: "Aman", detail: "98,1% (On Time)" }, review: { label: "Baik", tone: "green" } },
  { status: "Pending", jumlah: 208, nilai: 19_600_000, cod: 2_100_000, sla: { label: "Perhatian", detail: "85,3% (On Time)" }, review: { label: "Perlu Monitoring", tone: "amber" } },
  { status: "Proses / On Delivery", jumlah: 312, nilai: 32_100_000, cod: 6_700_000, sla: { label: "Perhatian", detail: "88,6% (On Time)" }, review: { label: "Perlu Monitoring", tone: "amber" } },
  { status: "COD Belum Cair", jumlah: 208, nilai: 18_400_000, cod: 18_400_000, sla: { label: "Berisiko", detail: "–" }, review: { label: "Perlu Tindakan", tone: "red" } },
  { status: "Dibatalkan", jumlah: 42, nilai: 4_300_000, cod: 0, sla: { label: "Aman", detail: "92,9% (On Time)" }, review: { label: "Baik", tone: "green" } },
  { status: "Dikembalikan", jumlah: 30, nilai: 3_200_000, cod: 0, sla: { label: "Aman", detail: "90,0% (On Time)" }, review: { label: "Cukup Baik", tone: "green" } },
];

export function getOrderStatusCodMock(): OrderStatusData {
  const totalOrder = statusRows.reduce((s, r) => s + r.jumlah, 0);
  const table: OrderStatusRow[] = statusRows.map((r) => ({
    status: r.status, color: STATUS_COLOR[r.status] ?? "#94A3B8", jumlahOrder: r.jumlah, nilaiSales: r.nilai,
    cod: r.cod, persentase: (r.jumlah / totalOrder) * 100, sla: r.sla, statusReview: r.review,
  }));

  return {
    filters: {
      platform: [{ value: "Semua", label: "Semua Platform" }, ...PLATFORMS.map((p) => ({ value: p, label: p }))],
      toko: [{ value: "Semua", label: "Semua Toko" }],
      status: [{ value: "Semua", label: "Semua Status" }, ...statusRows.map((r) => ({ value: r.status, label: r.status }))],
      ekspedisi: [{ value: "Semua", label: "Semua Ekspedisi" }],
      metodeBayar: [{ value: "Semua", label: "Semua Metode" }],
    },
    kpi: [
      kpi("Order Sukses", "1.248", "check-circle", "green", 9.2),
      kpi("Pending", "208", "clock", "amber", 4.8, false),
      kpi("On Delivery", "312", "truck", "blue", 7.6),
      kpi("COD Belum Cair", "208", "wallet", "purple", 2.9, false),
      kpi("Cancel", "42", "x-circle", "red", -1.3, false),
      kpi("Delivery Success Rate", "95,1%", "shield-check", "red", 2.4),
    ],
    totalOrder,
    statusDonut: table.map((r) => ({ label: r.status, value: r.jumlahOrder, color: r.color })),
    orderPerStatus: table.map((r) => ({ label: r.status, value: r.jumlahOrder, color: r.color })),
    trendCodBelumCair: DAYS.slice(0, 7).map((label, i) => ({ label, value: [168, 182, 194, 210, 226, 208, 208][i]! })),
    statusPerEkspedisi: [
      { name: "J&T Express", value: 842, pct: 41.1 },
      { name: "Shopee Express", value: 548, pct: 26.8 },
      { name: "SiCepat", value: 308, pct: 15.0 },
      { name: "JNE", value: 204, pct: 10.0 },
      { name: "AnterAja", value: 106, pct: 5.2 },
      { name: "Lainnya", value: 40, pct: 2.0 },
    ],
    progressHarian: DAYS.slice(0, 7).map((label, i) => ({
      label, sukses: [50, 52, 53, 54, 55, 53, 57][i]!, onDelivery: [23, 24, 22, 23, 24, 22, 21][i]!,
      pending: [10, 9, 8, 8, 9, 8, 8][i]!, gagal: [17, 15, 17, 15, 12, 17, 14][i]!,
    })),
    alerts: [
      { title: "COD Belum Cair Tinggi", detail: "208 order senilai Rp18,4 jt belum cair.", level: "critical" },
      { title: "SLA Expired", detail: "42 order melewati SLA pengiriman.", level: "warning" },
      { title: "Cancel Rate Naik", detail: "Cancel rate naik 1,3% dibanding periode lalu.", level: "warning" },
    ],
    lastUpdated: "18 Mei 2026 10:30 WIB",
    table,
  };
}

// =============================================================================
// RETUR & DATA REVIEW
// =============================================================================
const returTrendPerHari = [15, 18, 20, 22, 28, 24, 19];
const returPerProdukList = [
  { sku: "PB-001", nama: "Probetes Herbal 24", retur: 12 },
  { sku: "PB-002", nama: "Amandia 7 Herbal Booster", retur: 8 },
  { sku: "PB-003", nama: "Ebook 90 Hari Remisi", retur: 6 },
  { sku: "PB-004", nama: "Paket Probetes Herbal", retur: 5 },
  { sku: "PB-005", nama: "Amandia 10 Kapsul", retur: 4 },
  { sku: "PB-006", nama: "Ebook 145", retur: 3 },
];

const issueRowsAll: DataReviewIssue[] = [
  { tipeData: "Retur", masalah: "Salah kirim produk / variasi tidak sesuai", jumlah: 14, dampak: "Kerugian Rp6,2 jt • Biaya retur meningkat", prioritas: "Tinggi", rekomendasiAksi: "Periksa mapping SKU & variasi, validasi sebelum kirim" },
  { tipeData: "Gagal Kirim", masalah: "Alamat tidak ditemukan / tidak lengkap", jumlah: 8, dampak: "Keterlambatan • Biaya double kirim", prioritas: "Tinggi", rekomendasiAksi: "Lengkapi alamat & validasi otomatis saat checkout" },
  { tipeData: "Data Kosong", masalah: "Data alamat kosong / tidak lengkap", jumlah: 7, dampak: "Retur meningkat • Proses manual", prioritas: "Tinggi", rekomendasiAksi: "Wajibkan field alamat & validasi input" },
  { tipeData: "No HP Kosong", masalah: "Nomor HP tidak tersedia", jumlah: 3, dampak: "Gagal kirim / sulit konfirmasi", prioritas: "Sedang", rekomendasiAksi: "Validasi No HP & notifikasi ke pelanggan" },
  { tipeData: "Toko Kosong", masalah: "Nama toko tidak terisi", jumlah: 1, dampak: "Analitik toko tidak akurat", prioritas: "Rendah", rekomendasiAksi: "Sinkronisasi master data toko" },
  { tipeData: "Platform Kosong", masalah: "Platform tidak tercatat", jumlah: 1, dampak: "Klasifikasi channel tidak akurat", prioritas: "Rendah", rekomendasiAksi: "Auto-deteksi platform dari order source" },
];

export function getReturnDataReviewMock(): ReturnDataReviewData {
  const totalIssue = issueRowsAll.reduce((s, r) => s + r.jumlah, 0);
  const priorityRank = { Tinggi: 0, Sedang: 1, Rendah: 2 } as const;
  const topIssue = [...issueRowsAll].sort((a, b) => priorityRank[a.prioritas] - priorityRank[b.prioritas] || b.jumlah - a.jumlah);

  const jenisIssueColor: Record<string, string> = { Retur: "#E30613", "Gagal Kirim": "#F59E0B", "Data Kosong": "#059669", "No HP Kosong": "#2563EB", "Toko Kosong": "#7C3AED", "Platform Kosong": "#EC4899" };

  return {
    filters: {
      platform: [{ value: "Semua", label: "Semua Platform" }, ...PLATFORMS.map((p) => ({ value: p, label: p }))],
      toko: [{ value: "Semua", label: "Semua Toko" }],
      produk: [{ value: "Semua", label: "Semua Produk" }],
      ekspedisi: [{ value: "Semua", label: "Semua Ekspedisi" }],
      issueType: [{ value: "Semua", label: "Semua Issue" }, ...issueRowsAll.map((r) => ({ value: r.tipeData, label: r.tipeData }))],
    },
    kpi: [
      kpi("Total Retur", "42", "rotate-ccw", "red", 12.0, false),
      kpi("Retur Rate", "1,92%", "percent", "slate", 0.18, false),
      kpi("Gagal Kirim", "18", "truck", "slate", 5.9, false),
      kpi("Nilai Retur", "Rp18,4 jt", "wallet", "amber", 11.7, false),
      kpi("Data Kosong", "7", "database", "amber", 16.7, false),
      kpi("Issue Terbuka", "34", "alert-triangle", "slate", 13.3, false),
    ],
    returPerHari: DAYS.slice(0, 7).map((label, i) => ({ label, value: returTrendPerHari[i]! })),
    returPerProduk: returPerProdukList.map((p) => ({ code: p.sku, name: p.nama, value: p.retur })),
    jenisIssueDonut: issueRowsAll.map((r) => ({ label: r.tipeData, value: r.jumlah, color: jenisIssueColor[r.tipeData] ?? "#94A3B8" })),
    totalIssue,
    returPerEkspedisi: [
      { name: "J&T Express", value: 15 },
      { name: "Shopee Express", value: 10 },
      { name: "JNE", value: 7 },
      { name: "SiCepat", value: 5 },
      { name: "AnterAja", value: 3 },
      { name: "Ninja Xpress", value: 2 },
    ],
    returVsOrder: DAYS.slice(0, 7).map((label, i) => ({ label, order: [1280, 1350, 1420, 1510, 1680, 1460, 1300][i]!, retur: returTrendPerHari[i]! })),
    topIssue: topIssue.slice(0, 5).map((r, i) => ({ rank: i + 1, issue: r.masalah, jumlah: r.jumlah, prioritas: r.prioritas })),
    table: issueRowsAll,
  };
}
