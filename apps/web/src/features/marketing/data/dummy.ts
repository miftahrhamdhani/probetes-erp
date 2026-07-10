// ============================================================================
// DATA DUMMY MARKETING — bukan data Probetes.
// Semua angka & nama di sini fiktif (brand contoh "Glow Studio"), hanya untuk
// memperlihatkan tampilan menu Marketing yang masih dalam pengembangan.
// Nanti diganti data asli dari database/API.
// ============================================================================

// Palet channel (sudah divalidasi colorblind-safe untuk latar terang).
export const channelColor: Record<string, string> = {
  "TikTok Shop": "#2563EB",
  Shopee: "#F59E0B",
  Meta: "#E30613",
  Lainnya: "#7C3AED",
};

// --- Import Data Channel -----------------------------------------------------
export interface ImportSource {
  id: string;
  name: string;
  jenis: string;
  keterangan: string;
}

export const importSources: ImportSource[] = [
  { id: "tiktok", name: "TikTok Shop", jenis: "Marketplace", keterangan: "Export laporan pesanan TikTok Shop." },
  { id: "shopee", name: "Shopee", jenis: "Marketplace", keterangan: "Export laporan pesanan & spending iklan Shopee." },
  { id: "meta", name: "Meta Ads", jenis: "Iklan", keterangan: "Export spending iklan dari Meta Ads Manager." },
  { id: "skalev", name: "Skalev", jenis: "Closing / Pesanan", keterangan: "Export data pesanan & closingan leads Meta." },
];

export interface ImportBatch {
  id: string;
  file: string;
  source: string;
  rows: number;
  valid: number;
  perluDicek: number;
  status: "Selesai" | "Diproses" | "Perlu Dicek";
  waktu: string;
}

export const importHistory: ImportBatch[] = [
  { id: "IMP-0007", file: "skalev_order_juni.csv", source: "Skalev", rows: 1240, valid: 1216, perluDicek: 24, status: "Selesai", waktu: "01 Jul 2026 09:12" },
  { id: "IMP-0006", file: "meta_ads_juni_adit.csv", source: "Meta Ads", rows: 42, valid: 42, perluDicek: 0, status: "Selesai", waktu: "01 Jul 2026 09:03" },
  { id: "IMP-0005", file: "shopee_pesanan_juni.csv", source: "Shopee", rows: 386, valid: 372, perluDicek: 14, status: "Perlu Dicek", waktu: "30 Jun 2026 21:40" },
  { id: "IMP-0004", file: "tiktok_pesanan_juni.csv", source: "TikTok Shop", rows: 918, valid: 918, perluDicek: 0, status: "Selesai", waktu: "30 Jun 2026 20:15" },
  { id: "IMP-0003", file: "meta_ads_juni_bella.csv", source: "Meta Ads", rows: 28, valid: 28, perluDicek: 0, status: "Diproses", waktu: "30 Jun 2026 19:50" },
];

// --- Laporan Penjualan -------------------------------------------------------
export interface SalesByChannel {
  channel: string;
  orders: number;
  omzet: number;
}

export const salesByChannel: SalesByChannel[] = [
  { channel: "TikTok Shop", orders: 918, omzet: 214_300_000 },
  { channel: "Meta", orders: 1240, omzet: 331_800_000 },
  { channel: "Shopee", orders: 386, omzet: 88_450_000 },
];

export interface SalesByProduct {
  produk: string;
  channel: string;
  qty: number;
  omzet: number;
}

export const salesByProduct: SalesByProduct[] = [
  { produk: "Serum Vitamin C 20ml", channel: "Meta", qty: 742, omzet: 141_780_000 },
  { produk: "Sunscreen SPF 50", channel: "TikTok Shop", qty: 640, omzet: 118_400_000 },
  { produk: "Paket Glow Lengkap", channel: "Meta", qty: 210, omzet: 96_600_000 },
  { produk: "Facial Wash Gentle", channel: "Shopee", qty: 512, omzet: 48_640_000 },
  { produk: "Moisturizer Barrier", channel: "TikTok Shop", qty: 388, omzet: 58_200_000 },
  { produk: "Toner Exfoliating", channel: "Shopee", qty: 274, omzet: 30_140_000 },
];

// Tren omzet harian (contoh 14 hari terakhir).
export interface DailyPoint {
  tanggal: string;
  omzet: number;
}

export const dailySales: DailyPoint[] = [
  { tanggal: "18 Jun", omzet: 38_200_000 },
  { tanggal: "19 Jun", omzet: 41_500_000 },
  { tanggal: "20 Jun", omzet: 36_900_000 },
  { tanggal: "21 Jun", omzet: 44_800_000 },
  { tanggal: "22 Jun", omzet: 52_300_000 },
  { tanggal: "23 Jun", omzet: 48_100_000 },
  { tanggal: "24 Jun", omzet: 55_700_000 },
];

// --- Iklan & ROAS ------------------------------------------------------------
export interface AdCampaign {
  advertiser: string;
  kampanye: string;
  channel: string;
  spend: number;
  pembelian: number;
  omzet: number; // omzet closing asli (Skalev)
  roasFb: number; // ROAS versi platform (pixel)
}

// ROAS asli dihitung di UI = omzet / spend, biar konsisten.
export const adCampaigns: AdCampaign[] = [
  { advertiser: "Adit", kampanye: "PRP TOF", channel: "Meta", spend: 21_985_866, pembelian: 360, omzet: 62_400_000, roasFb: 1.72 },
  { advertiser: "Adit", kampanye: "BID CAP", channel: "Meta", spend: 25_452_481, pembelian: 467, omzet: 79_300_000, roasFb: 1.9 },
  { advertiser: "Bella", kampanye: "RETARGETING WA", channel: "Meta", spend: 10_484_921, pembelian: 191, omzet: 41_600_000, roasFb: 1.38 },
  { advertiser: "Candra", kampanye: "PRP TOF - EXC", channel: "Meta", spend: 8_450_000, pembelian: 132, omzet: 33_120_000, roasFb: 1.55 },
  { advertiser: "Dea", kampanye: "SHOPEE ADS - SERUM", channel: "Shopee", spend: 6_200_000, pembelian: 88, omzet: 18_900_000, roasFb: 2.1 },
  { advertiser: "Rian", kampanye: "GMV Max Produk Serum", channel: "TikTok Shop", spend: 9_800_000, pembelian: 210, omzet: 24_500_000, roasFb: 2.5 },
  { advertiser: "Sari", kampanye: "NetSales Commission Reduction", channel: "TikTok Shop", spend: 4_300_000, pembelian: 95, omzet: 11_200_000, roasFb: 2.6 },
];

// Contoh baris video/materi iklan dengan data retensi tonton — bentuk kolomnya meniru
// persis export asli Meta/TikTok, dipakai sebagai fallback saat belum ada Spending Ads
// sungguhan yang diimport di sesi ini.
export const videoRetentionDummy: Record<string, string>[] = [
  { "Judul video": "Bunda sudah coba ini blom?? cobain deh bun", "Nama kampanye": "PRP TOF", "Jumlah yang dibelanjakan (IDR)": "5200000", "Nilai konversi pembelian": "15600000", "Rasio tayang video iklan 2 detik": "42", "Rasio tayang video iklan 25%": "38", "Rasio tayang video iklan 50%": "22", "Rasio tayang video iklan 75%": "12", "Rasio tayang video iklan 100%": "6" },
  { "Judul video": "Siapa sih yang gak tau kapsul yacona", "Nama kampanye": "BID CAP", "Jumlah yang dibelanjakan (IDR)": "3100000", "Nilai konversi pembelian": "4200000", "Rasio tayang video iklan 2 detik": "18", "Rasio tayang video iklan 25%": "10", "Rasio tayang video iklan 50%": "4", "Rasio tayang video iklan 75%": "2", "Rasio tayang video iklan 100%": "1" },
  { "Nama kampanye": "GMV Max Produk Proherbal 001", "Jumlah yang dibelanjakan (IDR)": "6400000", "Nilai konversi pembelian": "19800000", "Video Diputar hingga 25%": "45", "Video Diputar hingga 50%": "30", "Video Diputar hingga 75%": "19", "Video Diputar hingga 95%": "11" },
];

// Spend iklan harian (contoh, single series).
export const dailySpend: DailyPoint[] = [
  { tanggal: "18 Jun", omzet: 9_200_000 },
  { tanggal: "19 Jun", omzet: 10_100_000 },
  { tanggal: "20 Jun", omzet: 8_800_000 },
  { tanggal: "21 Jun", omzet: 11_400_000 },
  { tanggal: "22 Jun", omzet: 12_600_000 },
  { tanggal: "23 Jun", omzet: 10_900_000 },
  { tanggal: "24 Jun", omzet: 13_200_000 },
];

// --- CRM: RFM & Cohort -------------------------------------------------------
// RFM berurutan dari paling bernilai -> paling pasif (ramp merah -> abu).
export interface RfmSegment {
  nama: string;
  jumlah: number;
  keterangan: string;
}

export const rfmSegments: RfmSegment[] = [
  { nama: "Champions", jumlah: 320, keterangan: "Baru beli, sering, nilai besar." },
  { nama: "Loyal", jumlah: 540, keterangan: "Sering beli, nilai stabil." },
  { nama: "Berpotensi", jumlah: 610, keterangan: "Baru, berpeluang jadi loyal." },
  { nama: "Perlu Perhatian", jumlah: 430, keterangan: "Mulai jarang beli." },
  { nama: "Berisiko Hilang", jumlah: 280, keterangan: "Sudah lama tidak beli." },
  { nama: "Tidak Aktif", jumlah: 510, keterangan: "Lama sekali tidak beli." },
];

// Warna sequential RFM (merah pekat = paling bernilai -> abu = pasif).
export const rfmColor: string[] = [
  "#B00610", // Champions
  "#E30613", // Loyal
  "#F0483E", // Berpotensi
  "#F59E0B", // Perlu Perhatian
  "#94A3B8", // Berisiko Hilang
  "#CBD5E1", // Tidak Aktif
];

// Cohort retention: baris = bulan pertama beli, kolom = bulan ke-0..5.
export interface CohortRow {
  cohort: string;
  ukuran: number;
  retensi: (number | null)[]; // persen; null = belum ada data bulan itu
}

export const cohortRows: CohortRow[] = [
  { cohort: "Jan 2026", ukuran: 420, retensi: [100, 38, 24, 18, 15, 12] },
  { cohort: "Feb 2026", ukuran: 512, retensi: [100, 41, 27, 20, 16, null] },
  { cohort: "Mar 2026", ukuran: 388, retensi: [100, 35, 22, 17, null, null] },
  { cohort: "Apr 2026", ukuran: 604, retensi: [100, 44, 29, null, null, null] },
  { cohort: "Mei 2026", ukuran: 556, retensi: [100, 40, null, null, null, null] },
  { cohort: "Jun 2026", ukuran: 631, retensi: [100, null, null, null, null, null] },
];

// Daftar pelanggan cohort (contoh).
export interface CrmCustomer {
  id: string;
  nama: string;
  hp: string;
  segmen: string;
  frekuensi: number;
  totalBeli: number;
  terakhir: string;
  cs: string;
  channel: string;
}

export const crmCustomers: CrmCustomer[] = [
  { id: "CUST-0001", nama: "Ayu Lestari", hp: "081200010001", segmen: "Champions", frekuensi: 6, totalBeli: 3_120_000, terakhir: "24 Jun 2026", cs: "Rina", channel: "Meta" },
  { id: "CUST-0002", nama: "Bimo Saputra", hp: "081200010002", segmen: "Loyal", frekuensi: 4, totalBeli: 1_840_000, terakhir: "22 Jun 2026", cs: "Sari", channel: "TikTok Shop" },
  { id: "CUST-0003", nama: "Citra Dewi", hp: "081200010003", segmen: "Berpotensi", frekuensi: 2, totalBeli: 560_000, terakhir: "20 Jun 2026", cs: "Rina", channel: "Meta" },
  { id: "CUST-0004", nama: "Dani Pratama", hp: "081200010004", segmen: "Berisiko Hilang", frekuensi: 3, totalBeli: 990_000, terakhir: "02 Apr 2026", cs: "Tono", channel: "Shopee" },
  { id: "CUST-0005", nama: "Eka Putri", hp: "081200010005", segmen: "Perlu Perhatian", frekuensi: 2, totalBeli: 480_000, terakhir: "18 Mei 2026", cs: "Sari", channel: "Meta" },
  { id: "CUST-0006", nama: "Fajar Nugroho", hp: "081200010006", segmen: "Tidak Aktif", frekuensi: 1, totalBeli: 190_000, terakhir: "11 Jan 2026", cs: "Tono", channel: "TikTok Shop" },
];

// Pilihan dropdown untuk form input closingan manual.
export const csOptions = ["Rina", "Sari", "Tono"];
export const channelOptions = ["Meta", "TikTok Shop", "Shopee"];
export const productOptions = [
  "Serum Vitamin C 20ml",
  "Sunscreen SPF 50",
  "Paket Glow Lengkap",
  "Facial Wash Gentle",
  "Moisturizer Barrier",
  "Toner Exfoliating",
];
