// TODO: Data dummy ini nanti diganti ke API/database asli setelah backend modul tersedia.
// Struktur mengikuti tabel tracking.shipments + tracking.cod_payments + tracking.returns
// di database Probetes ERP (lihat data_migrasi/db/schema.sql).

import type { PreviewKpiItem } from "@/components/module-center/PreviewKpiCard";

export type PackageStatus = "Dalam Pengiriman" | "Terkirim" | "Gagal Kirim" | "Retur" | "Perlu Follow-up";
export type CodStatus = "COD Belum Cair" | "COD Sudah Cair" | "Non-COD";

// --- 1. Cek Resi ------------------------------------------------------------
export interface CekResiRow {
  noResi: string;
  orderId: string;
  customer: string;
  noHp: string;
  ekspedisi: string;
  layanan: string;
  status: PackageStatus;
  updateTerakhir: string;
}

const cekResi: CekResiRow[] = [
  { noResi: "JX102938471ID", orderId: "ORD-018821", customer: "Siti Aminah", noHp: "0812xxxx231", ekspedisi: "J&T", layanan: "Reguler", status: "Dalam Pengiriman", updateTerakhir: "2026-07-10 14:20" },
  { noResi: "SPX556231098ID", orderId: "ORD-018815", customer: "Budi Santoso", noHp: "0813xxxx902", ekspedisi: "Shopee Express", layanan: "Hemat", status: "Terkirim", updateTerakhir: "2026-07-10 09:05" },
  { noResi: "SICEPAT88213765", orderId: "ORD-018790", customer: "Mira Kartika", noHp: "0857xxxx114", ekspedisi: "SiCepat", layanan: "BEST", status: "Gagal Kirim", updateTerakhir: "2026-07-09 17:40" },
  { noResi: "JNE0091827364", orderId: "ORD-018776", customer: "Ahmad Fauzi", noHp: "0821xxxx550", ekspedisi: "JNE", layanan: "REG", status: "Retur", updateTerakhir: "2026-07-09 11:12" },
  { noResi: "JX209384756ID", orderId: "ORD-018760", customer: "Rina Wulandari", noHp: "0895xxxx781", ekspedisi: "J&T", layanan: "Reguler", status: "Terkirim", updateTerakhir: "2026-07-08 16:33" },
];

// --- 2. Status Pengiriman ----------------------------------------------------
export interface StatusPengirimanRow {
  tanggal: string;
  noResi: string;
  customer: string;
  statusPaket: PackageStatus;
  umurPaket: string;
  csPenanggungJawab: string;
  tindakLanjut: string;
}

const statusPengiriman: StatusPengirimanRow[] = [
  { tanggal: "2026-07-10", noResi: "JX102938471ID", customer: "Siti Aminah", statusPaket: "Dalam Pengiriman", umurPaket: "1 hari", csPenanggungJawab: "Rina Marlina", tindakLanjut: "Pantau sampai terkirim" },
  { tanggal: "2026-07-09", noResi: "SICEPAT88213765", customer: "Mira Kartika", statusPaket: "Gagal Kirim", umurPaket: "2 hari", csPenanggungJawab: "Nia Kusuma", tindakLanjut: "Hubungi customer, cek alamat" },
  { tanggal: "2026-07-09", noResi: "JNE0091827364", customer: "Ahmad Fauzi", statusPaket: "Retur", umurPaket: "3 hari", csPenanggungJawab: "Rina Marlina", tindakLanjut: "Konfirmasi alasan retur" },
  { tanggal: "2026-07-08", noResi: "SAP7712233445", customer: "Dedi Kurniawan", statusPaket: "Perlu Follow-up", umurPaket: "4 hari", csPenanggungJawab: "Nia Kusuma", tindakLanjut: "Follow-up ekspedisi SAP" },
  { tanggal: "2026-07-08", noResi: "JX209384756ID", customer: "Rina Wulandari", statusPaket: "Terkirim", umurPaket: "Selesai", csPenanggungJawab: "-", tindakLanjut: "Tidak perlu tindak lanjut" },
];

// --- 3. COD & Pembayaran -----------------------------------------------------
export interface CodPembayaranRow {
  tanggal: string;
  orderId: string;
  customer: string;
  nominalCod: number;
  ongkir: number;
  feeCod: number;
  tanggalCair: string | null;
  status: CodStatus;
}

const codPembayaran: CodPembayaranRow[] = [
  { tanggal: "2026-07-10", orderId: "ORD-018821", customer: "Siti Aminah", nominalCod: 285_000, ongkir: 18_000, feeCod: 4_500, tanggalCair: null, status: "COD Belum Cair" },
  { tanggal: "2026-07-09", orderId: "ORD-018790", customer: "Mira Kartika", nominalCod: 412_000, ongkir: 22_000, feeCod: 6_200, tanggalCair: null, status: "COD Belum Cair" },
  { tanggal: "2026-07-08", orderId: "ORD-018760", customer: "Rina Wulandari", nominalCod: 198_000, ongkir: 15_000, feeCod: 3_000, tanggalCair: "2026-07-11", status: "COD Sudah Cair" },
  { tanggal: "2026-07-08", orderId: "ORD-018742", customer: "Dedi Kurniawan", nominalCod: 0, ongkir: 20_000, feeCod: 0, tanggalCair: "2026-07-09", status: "Non-COD" },
  { tanggal: "2026-07-07", orderId: "ORD-018730", customer: "Lina Marlina", nominalCod: 356_000, ongkir: 17_000, feeCod: 5_400, tanggalCair: "2026-07-10", status: "COD Sudah Cair" },
];

// --- 4. Retur & Gagal Kirim ---------------------------------------------------
export interface ReturGagalRow {
  tanggal: string;
  orderId: string;
  noResi: string;
  customer: string;
  ekspedisi: string;
  alasan: string;
  statusFollowUp: "Perlu Follow-up" | "Sedang Diproses" | "Selesai";
}

const returGagal: ReturGagalRow[] = [
  { tanggal: "2026-07-09", orderId: "ORD-018790", noResi: "SICEPAT88213765", customer: "Mira Kartika", ekspedisi: "SiCepat", alasan: "Customer tidak bisa dihubungi", statusFollowUp: "Perlu Follow-up" },
  { tanggal: "2026-07-09", orderId: "ORD-018776", noResi: "JNE0091827364", customer: "Ahmad Fauzi", ekspedisi: "JNE", alasan: "Alamat tidak lengkap", statusFollowUp: "Sedang Diproses" },
  { tanggal: "2026-07-08", orderId: "ORD-018701", noResi: "SAP7712233210", customer: "Dedi Kurniawan", ekspedisi: "SAP Logistic", alasan: "Paket ditolak penerima", statusFollowUp: "Perlu Follow-up" },
  { tanggal: "2026-07-06", orderId: "ORD-018655", noResi: "JX998877001ID", customer: "Wati Suryani", ekspedisi: "J&T", alasan: "Rumah kosong 3x kunjungan", statusFollowUp: "Selesai" },
];

export function getTrackingPreviewData() {
  const dalamPengiriman = statusPengiriman.filter((r) => r.statusPaket === "Dalam Pengiriman").length + cekResi.filter((r) => r.status === "Dalam Pengiriman").length;
  const terkirim = cekResi.filter((r) => r.status === "Terkirim").length;
  const codBelumCair = codPembayaran.filter((r) => r.status === "COD Belum Cair").length;
  const returGagalCount = returGagal.length;

  const kpi: PreviewKpiItem[] = [
    { label: "Total Pengiriman", value: String(cekResi.length + 3), detail: "Semua resi", tone: "slate" },
    { label: "Dalam Pengiriman", value: String(dalamPengiriman), detail: "Proses kirim", tone: "blue" },
    { label: "Terkirim", value: String(terkirim), detail: "Selesai", tone: "green" },
    { label: "COD Belum Cair", value: String(codBelumCair), detail: "Perlu dicek", tone: "amber" },
    { label: "Retur / Gagal Kirim", value: String(returGagalCount), detail: "Perlu follow-up", tone: "red" },
  ];

  return { kpi, cekResi, statusPengiriman, codPembayaran, returGagal };
}
