// TODO: Data dummy ini nanti diganti ke API/database asli setelah backend modul tersedia.
// Struktur mengikuti tabel finance.order_finance + rencana finance.expenses/incomes/settlements
// (lihat docs/ARSITEKTUR_DATABASE.md bagian 7 dan docs/PRD.md bagian 5.7 Finance).

import type { PreviewKpiItem } from "@/components/module-center/PreviewKpiCard";

export type FinanceStatus = "Valid" | "Perlu Dicek" | "Selisih" | "Draft";

// --- Rekonsiliasi & Settlement ------------------------------------------------
export interface RekonsiliasiRow {
  tanggal: string;
  order: string;
  nominalSistem: number;
  nominalCair: number;
  selisih: number;
  status: FinanceStatus;
}
const rekonsiliasi: RekonsiliasiRow[] = [
  { tanggal: "2026-07-10", order: "Settlement Shopee mingguan", nominalSistem: 45_800_000, nominalCair: 45_800_000, selisih: 0, status: "Valid" },
  { tanggal: "2026-07-08", order: "Rekonsiliasi TikTok Shop", nominalSistem: 38_500_000, nominalCair: 38_150_000, selisih: -350_000, status: "Selisih" },
  { tanggal: "2026-07-06", order: "Settlement Meta Ads (refund)", nominalSistem: 1_200_000, nominalCair: 1_200_000, selisih: 0, status: "Valid" },
];

// --- Pemasukan ----------------------------------------------------------------
export interface PemasukanRow {
  tanggal: string;
  sumber: string;
  kategori: string;
  nominal: number;
  status: FinanceStatus;
}
const pemasukan: PemasukanRow[] = [
  { tanggal: "2026-07-10", sumber: "Shopee", kategori: "Settlement Marketplace", nominal: 45_800_000, status: "Valid" },
  { tanggal: "2026-07-08", sumber: "J&T", kategori: "Pencairan COD", nominal: 12_300_000, status: "Perlu Dicek" },
  { tanggal: "2026-07-07", sumber: "Bank BCA", kategori: "Transfer Non-COD", nominal: 15_600_000, status: "Valid" },
];

// --- Pengeluaran ----------------------------------------------------------------
export interface PengeluaranRow {
  tanggal: string;
  kategoriBiaya: string;
  nominal: number;
  divisi: string;
  status: FinanceStatus;
}
const pengeluaran: PengeluaranRow[] = [
  { tanggal: "2026-07-09", kategoriBiaya: "Biaya Iklan Meta Ads", nominal: 8_750_000, divisi: "Marketing", status: "Valid" },
  { tanggal: "2026-07-09", kategoriBiaya: "Operasional Gudang", nominal: 3_200_000, divisi: "Gudang Jakarta", status: "Draft" },
  { tanggal: "2026-07-07", kategoriBiaya: "Biaya Packing & Kardus", nominal: 1_450_000, divisi: "Gudang Makassar", status: "Valid" },
];

// --- HPP & Margin ------------------------------------------------------------
export interface HppMarginRow {
  tanggal: string;
  produkOrder: string;
  hpp: number;
  sales: number;
  margin: number;
  marginRate: string;
}
const hppMargin: HppMarginRow[] = [
  { tanggal: "2026-07-08", produkOrder: "Probetes Herbal 24", hpp: 21_400_000, sales: 45_800_000, margin: 24_400_000, marginRate: "53%" },
  { tanggal: "2026-07-08", produkOrder: "Amandia 7", hpp: 12_100_000, sales: 28_400_000, margin: 16_300_000, marginRate: "57%" },
  { tanggal: "2026-07-07", produkOrder: "Probetes Oil", hpp: 5_200_000, sales: 9_300_000, margin: 4_100_000, marginRate: "44%" },
];

// --- COD / Settlement (khusus tracking pembayaran COD) --------------------------
export interface CodSettlementRow {
  tanggal: string;
  order: string;
  ekspedisi: string;
  nominalCod: number;
  fee: number;
  tanggalCair: string | null;
  status: FinanceStatus;
}
const codSettlement: CodSettlementRow[] = [
  { tanggal: "2026-07-10", order: "ORD-018821", ekspedisi: "J&T", nominalCod: 285_000, fee: 4_500, tanggalCair: null, status: "Perlu Dicek" },
  { tanggal: "2026-07-09", order: "ORD-018790", ekspedisi: "SiCepat", nominalCod: 412_000, fee: 6_200, tanggalCair: null, status: "Perlu Dicek" },
  { tanggal: "2026-07-08", order: "ORD-018760", ekspedisi: "J&T", nominalCod: 198_000, fee: 3_000, tanggalCair: "2026-07-11", status: "Valid" },
];

// --- Laba Rugi ------------------------------------------------------------
export interface LabaRugiRow {
  periode: string;
  pemasukan: number;
  pengeluaran: number;
  hpp: number;
  labaKotor: number;
  labaBersih: number;
}
const labaRugi: LabaRugiRow[] = [
  { periode: "Juli 2026 (berjalan)", pemasukan: 99_600_000, pengeluaran: 33_300_000, hpp: 38_700_000, labaKotor: 60_900_000, labaBersih: 27_600_000 },
  { periode: "Juni 2026", pemasukan: 388_824_144, pengeluaran: 112_400_000, hpp: 148_900_000, labaKotor: 239_924_144, labaBersih: 127_524_144 },
];

export function getFinancePreviewData() {
  const kpi: PreviewKpiItem[] = [
    { label: "Total Pemasukan", value: "Rp99,6 Jt", detail: "Bulan berjalan", tone: "green" },
    { label: "Total Pengeluaran", value: "Rp33,3 Jt", detail: "Bulan berjalan", tone: "red" },
    { label: "Margin Estimasi", value: "22%", detail: "Belum final", tone: "purple" },
    { label: "COD Belum Cair", value: "Rp12,3 Jt", detail: "Perlu dicek", tone: "amber" },
    { label: "Settlement Perlu Dicek", value: "1", detail: "Ada selisih", tone: "amber" },
    { label: "Laba Rugi Estimasi", value: "Rp66,3 Jt", detail: "Estimasi kasar", tone: "green" },
  ];

  return { kpi, rekonsiliasi, pemasukan, pengeluaran, hppMargin, codSettlement, labaRugi };
}
