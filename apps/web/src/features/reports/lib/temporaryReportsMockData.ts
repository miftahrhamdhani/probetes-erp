// TODO: Data dummy ini nanti diganti ke API/database asli setelah backend modul tersedia.
// Reports membaca gabungan orders, marketing, tracking, finance, dan hris — bukan tabel
// input sendiri (lihat docs/PRD.md bagian 5.6 Reports).

import type { PreviewKpiItem } from "@/components/module-center/PreviewKpiCard";

export type ReportStatus = "Siap Dilihat" | "Perlu Update" | "Draft" | "Belum Final";

// --- Ringkasan Owner ---------------------------------------------------------
export interface OwnerSummaryRow {
  tanggal: string;
  area: string;
  ringkasan: string;
  nilai: string;
  status: ReportStatus;
}
const ownerSummary: OwnerSummaryRow[] = [
  { tanggal: "2026-07-10", area: "Sales", ringkasan: "Total sales harian naik 8% dibanding kemarin", nilai: "Rp14,2 Jt", status: "Siap Dilihat" },
  { tanggal: "2026-07-10", area: "Marketing", ringkasan: "ROAS TikTok Shop paling unggul", nilai: "4.2x", status: "Siap Dilihat" },
  { tanggal: "2026-07-09", area: "Tracking", ringkasan: "Retur & gagal kirim minggu ini", nilai: "24 paket", status: "Perlu Update" },
  { tanggal: "2026-07-09", area: "Finance", ringkasan: "Margin estimasi bulan berjalan", nilai: "22%", status: "Belum Final" },
  { tanggal: "2026-07-08", area: "HRIS", ringkasan: "Kehadiran tim bulan ini", nilai: "94%", status: "Draft" },
];

// --- Laporan Sales ------------------------------------------------------------
export interface SalesReportRow {
  tanggal: string;
  produkChannel: string;
  totalSales: number;
  totalOrder: number;
  aov: number;
  status: ReportStatus;
}
const salesReport: SalesReportRow[] = [
  { tanggal: "2026-07-10", produkChannel: "Probetes Herbal 24 — TikTok Shop", totalSales: 45_800_000, totalOrder: 128, aov: 357_812, status: "Siap Dilihat" },
  { tanggal: "2026-07-09", produkChannel: "Amandia 7 — Shopee", totalSales: 28_400_000, totalOrder: 96, aov: 295_833, status: "Siap Dilihat" },
  { tanggal: "2026-07-08", produkChannel: "Ebook 90 — Meta/Akuisisi", totalSales: 12_600_000, totalOrder: 140, aov: 90_000, status: "Perlu Update" },
  { tanggal: "2026-07-07", produkChannel: "Probetes Oil — Shopee", totalSales: 9_300_000, totalOrder: 31, aov: 300_000, status: "Draft" },
];

// --- Laporan Marketing / ROAS ---------------------------------------------------
export interface MarketingReportRow {
  tanggal: string;
  channelCampaign: string;
  spending: number;
  sales: number;
  roas: number;
  status: ReportStatus;
}
const marketingReport: MarketingReportRow[] = [
  { tanggal: "2026-07-10", channelCampaign: "TikTok Shop — Campaign Herbal A", spending: 3_600_000, sales: 15_120_000, roas: 4.2, status: "Siap Dilihat" },
  { tanggal: "2026-07-09", channelCampaign: "Meta Ads — Campaign Akuisisi Juli", spending: 8_750_000, sales: 27_100_000, roas: 3.1, status: "Perlu Update" },
  { tanggal: "2026-07-08", channelCampaign: "Shopee Ads — Amandia 7", spending: 1_900_000, sales: 6_840_000, roas: 3.6, status: "Siap Dilihat" },
];

// --- Laporan CRM & Cohort -------------------------------------------------------
export interface CrmReportRow {
  tanggal: string;
  segmen: string;
  jumlahCustomer: number;
  repeatRate: string;
  status: ReportStatus;
}
const crmReport: CrmReportRow[] = [
  { tanggal: "2026-07-10", segmen: "Champions", jumlahCustomer: 2_009, repeatRate: "88%", status: "Siap Dilihat" },
  { tanggal: "2026-07-09", segmen: "Loyal", jumlahCustomer: 2_276, repeatRate: "71%", status: "Siap Dilihat" },
  { tanggal: "2026-07-08", segmen: "Berisiko Hilang", jumlahCustomer: 212, repeatRate: "12%", status: "Perlu Update" },
  { tanggal: "2026-07-07", segmen: "Pelanggan Baru", jumlahCustomer: 4_961, repeatRate: "-", status: "Draft" },
];

// --- Laporan Tracking/COD/Retur --------------------------------------------------
export interface TrackingReportRow {
  tanggal: string;
  area: string;
  jumlah: number;
  keterangan: string;
  status: ReportStatus;
}
const trackingReport: TrackingReportRow[] = [
  { tanggal: "2026-07-10", area: "Dalam Pengiriman", jumlah: 214, keterangan: "Rata-rata 1,4 hari", status: "Siap Dilihat" },
  { tanggal: "2026-07-09", area: "COD Belum Cair", jumlah: 38, keterangan: "Total Rp18,9 Jt", status: "Perlu Update" },
  { tanggal: "2026-07-08", area: "Retur", jumlah: 24, keterangan: "Alasan terbanyak: alamat tidak lengkap", status: "Draft" },
];

// --- Laporan Finance --------------------------------------------------------
export interface FinanceReportRow {
  tanggal: string;
  kategori: string;
  nominal: number;
  keterangan: string;
  status: ReportStatus;
}
const financeReport: FinanceReportRow[] = [
  { tanggal: "2026-07-10", kategori: "Pemasukan", nominal: 45_800_000, keterangan: "Settlement Shopee mingguan", status: "Siap Dilihat" },
  { tanggal: "2026-07-09", kategori: "Pengeluaran", nominal: 12_050_000, keterangan: "Biaya iklan + operasional", status: "Perlu Update" },
  { tanggal: "2026-07-08", kategori: "Margin", nominal: 0, keterangan: "Estimasi 22%, belum final", status: "Belum Final" },
];

// --- Laporan Warehouse --------------------------------------------------------
export interface WarehouseReportRow {
  tanggal: string;
  gudang: string;
  stokKritis: number;
  mutasi: number;
  status: ReportStatus;
}
const warehouseReport: WarehouseReportRow[] = [
  { tanggal: "2026-07-10", gudang: "Gudang Jakarta", stokKritis: 1, mutasi: 142, status: "Siap Dilihat" },
  { tanggal: "2026-07-09", gudang: "Gudang Makassar", stokKritis: 1, mutasi: 58, status: "Perlu Update" },
];

// --- Laporan HRIS --------------------------------------------------------------
export interface HrisReportRow {
  tanggal: string;
  area: string;
  nilai: string;
  keterangan: string;
  status: ReportStatus;
}
const hrisReport: HrisReportRow[] = [
  { tanggal: "2026-07-10", area: "Absensi", nilai: "94%", keterangan: "58 dari 63 karyawan hadir", status: "Siap Dilihat" },
  { tanggal: "2026-07-09", area: "Payroll", nilai: "Rp186 Jt", keterangan: "Estimasi periode Juli 2026", status: "Draft" },
  { tanggal: "2026-07-08", area: "Biaya HR", nilai: "Rp8,4 Jt", keterangan: "Termasuk komisi CS/CRM/ADV", status: "Belum Final" },
];

export function getReportsPreviewData() {
  const kpi: PreviewKpiItem[] = [
    { label: "Total Sales", value: "Rp142,5 Jt", detail: "Bulan berjalan", tone: "green" },
    { label: "Total Order", value: "312", detail: "Pesanan", tone: "blue" },
    { label: "Customer Aktif", value: "1.284", detail: "Repeat & baru", tone: "slate" },
    { label: "ROAS", value: "3.8x", detail: "Rata-rata channel", tone: "green" },
    { label: "Retur", value: "24", detail: "Perlu dicek", tone: "amber" },
    { label: "Margin Estimasi", value: "22%", detail: "Belum final", tone: "purple" },
  ];

  return {
    kpi,
    ownerSummary,
    salesReport,
    marketingReport,
    crmReport,
    trackingReport,
    financeReport,
    warehouseReport,
    hrisReport,
  };
}
