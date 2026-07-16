// TODO: Data dummy ini nanti diganti ke API/database asli setelah backend modul tersedia.
// Struktur mengikuti rencana schema warehouse.stock + product_sku_map (belum ada di DB),
// lihat docs/ARSITEKTUR_DATABASE.md bagian 6 dan docs/PRD.md bagian 5.8 Warehouse.

import type { PreviewKpiItem } from "@/components/module-center/PreviewKpiCard";

export type StockStatus = "Aman" | "Stok Kritis" | "Perlu Opname" | "Perlu Mapping SKU" | "Retur";
export type Gudang = "Gudang Jakarta" | "Gudang Makassar";

// --- Stok Barang --------------------------------------------------------------
export interface StokBarangRow {
  tanggal: string;
  sku: string;
  produk: string;
  gudang: Gudang;
  stokTersedia: number;
  reserved: number;
  reorderPoint: number;
  status: StockStatus;
}
const stokBarang: StokBarangRow[] = [
  { tanggal: "2026-07-10", sku: "PRB-14", produk: "Herbal Probetes", gudang: "Gudang Jakarta", stokTersedia: 1_679, reserved: 120, reorderPoint: 300, status: "Aman" },
  { tanggal: "2026-07-10", sku: "PRB-01", produk: "Herbal Probetes", gudang: "Gudang Makassar", stokTersedia: 420, reserved: 40, reorderPoint: 300, status: "Perlu Opname" },
  { tanggal: "2026-07-09", sku: "PRB-24", produk: "Probetes Oil", gudang: "Gudang Jakarta", stokTersedia: 94, reserved: 10, reorderPoint: 100, status: "Aman" },
  { tanggal: "2026-07-09", sku: "PRB-02", produk: "Probetes Oil", gudang: "Gudang Makassar", stokTersedia: 38, reserved: 5, reorderPoint: 100, status: "Stok Kritis" },
  { tanggal: "2026-07-08", sku: "-", produk: "Amandia 7", gudang: "Gudang Jakarta", stokTersedia: 210, reserved: 15, reorderPoint: 150, status: "Perlu Mapping SKU" },
];

// --- Barang Masuk --------------------------------------------------------------
export interface BarangMasukRow {
  tanggal: string;
  ref: string;
  supplierProduksi: string;
  produk: string;
  sku: string;
  gudang: Gudang;
  qtyMasuk: number;
  penerima: string;
}
const barangMasuk: BarangMasukRow[] = [
  { tanggal: "2026-07-10", ref: "IN-000482", supplierProduksi: "Produksi Internal", produk: "Herbal Probetes", sku: "PRB-14", gudang: "Gudang Jakarta", qtyMasuk: 500, penerima: "Budi Setiawan" },
  { tanggal: "2026-07-09", ref: "IN-000481", supplierProduksi: "Supplier Kardus Jaya", produk: "Kemasan Kardus", sku: "-", gudang: "Gudang Jakarta", qtyMasuk: 2_000, penerima: "Budi Setiawan" },
  { tanggal: "2026-07-08", ref: "IN-000475", supplierProduksi: "Produksi Internal", produk: "Probetes Oil", sku: "PRB-24", gudang: "Gudang Makassar", qtyMasuk: 150, penerima: "Andi Wijaya" },
];

// --- Barang Keluar --------------------------------------------------------------
export interface BarangKeluarRow {
  tanggal: string;
  orderRef: string;
  produk: string;
  sku: string;
  gudang: Gudang;
  qtyKeluar: number;
  status: "Terkirim" | "Diproses";
}
const barangKeluar: BarangKeluarRow[] = [
  { tanggal: "2026-07-10", orderRef: "ORD-018821", produk: "Herbal Probetes", sku: "PRB-14", gudang: "Gudang Jakarta", qtyKeluar: 2, status: "Terkirim" },
  { tanggal: "2026-07-10", orderRef: "ORD-018790", produk: "Probetes Oil", sku: "PRB-24", gudang: "Gudang Jakarta", qtyKeluar: 1, status: "Diproses" },
  { tanggal: "2026-07-09", orderRef: "ORD-018760", produk: "Herbal Probetes", sku: "PRB-01", gudang: "Gudang Makassar", qtyKeluar: 3, status: "Terkirim" },
];

// --- Transfer Gudang -----------------------------------------------------------
export interface TransferGudangRow {
  tanggal: string;
  produk: string;
  dariGudang: Gudang;
  keGudang: Gudang;
  qty: number;
  status: "Selesai" | "Dalam Perjalanan";
}
const transferGudang: TransferGudangRow[] = [
  { tanggal: "2026-07-08", produk: "Herbal Probetes", dariGudang: "Gudang Jakarta", keGudang: "Gudang Makassar", qty: 200, status: "Selesai" },
  { tanggal: "2026-07-06", produk: "Probetes Oil", dariGudang: "Gudang Jakarta", keGudang: "Gudang Makassar", qty: 50, status: "Dalam Perjalanan" },
];

// --- Stock Opname --------------------------------------------------------------
export interface StockOpnameRow {
  tanggal: string;
  produk: string;
  stokSistem: number;
  stokFisik: number;
  selisih: number;
  status: StockStatus;
}
const stockOpname: StockOpnameRow[] = [
  { tanggal: "2026-07-10", produk: "Herbal Probetes (Makassar)", stokSistem: 420, stokFisik: 402, selisih: -18, status: "Perlu Opname" },
  { tanggal: "2026-07-09", produk: "Beras Organik", stokSistem: 65, stokFisik: 58, selisih: -7, status: "Retur" },
  { tanggal: "2026-07-07", produk: "Stevia", stokSistem: 152, stokFisik: 152, selisih: 0, status: "Aman" },
];

// --- Retur Gudang --------------------------------------------------------------
export interface ReturGudangRow {
  tanggal: string;
  orderRef: string;
  produk: string;
  gudang: Gudang;
  qtyRetur: number;
  alasan: string;
  status: "Diterima" | "Diproses";
}
const returGudang: ReturGudangRow[] = [
  { tanggal: "2026-07-08", orderRef: "ORD-018701", produk: "Beras Organik", gudang: "Gudang Jakarta", qtyRetur: 2, alasan: "Kemasan rusak", status: "Diterima" },
  { tanggal: "2026-07-06", orderRef: "ORD-018655", produk: "Herbal Probetes", gudang: "Gudang Jakarta", qtyRetur: 1, alasan: "Retur pengiriman gagal", status: "Diproses" },
];

// --- Restock Alert --------------------------------------------------------------
export interface RestockAlertRow {
  produk: string;
  gudang: Gudang;
  stokTersedia: number;
  reorderPoint: number;
  rekomendasi: string;
}
const restockAlert: RestockAlertRow[] = [
  { produk: "Probetes Oil", gudang: "Gudang Makassar", stokTersedia: 38, reorderPoint: 100, rekomendasi: "Segera restock, di bawah reorder point" },
  { produk: "Herbal Probetes", gudang: "Gudang Makassar", stokTersedia: 420, reorderPoint: 300, rekomendasi: "Pantau, mendekati reorder point setelah transfer" },
];

export function getWarehousePreviewData() {
  const totalProduk = new Set(stokBarang.map((r) => r.produk)).size;
  const kritis = stokBarang.filter((r) => r.status === "Stok Kritis").length;
  const retur = returGudang.length;

  const kpi: PreviewKpiItem[] = [
    { label: "Total Produk", value: String(totalProduk), detail: "SKU terdaftar", tone: "slate" },
    { label: "Stok Tersedia", value: "2.660", detail: "Unit total", tone: "green" },
    { label: "Stok Kritis", value: String(kritis), detail: "Perlu restock", tone: "red" },
    { label: "Barang Masuk", value: "142", detail: "7 hari terakhir", tone: "blue" },
    { label: "Barang Keluar", value: "318", detail: "7 hari terakhir", tone: "amber" },
    { label: "Retur Gudang", value: String(retur), detail: "Perlu dicek", tone: "purple" },
  ];

  return { kpi, stokBarang, barangMasuk, barangKeluar, transferGudang, stockOpname, returGudang, restockAlert };
}
