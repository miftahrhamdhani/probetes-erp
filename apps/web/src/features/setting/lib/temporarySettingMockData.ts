// TODO: Data dummy ini nanti diganti ke API/database asli setelah backend modul tersedia.
// Struktur mengikuti tabel system.backup_settings/backup_history (sudah ada di DB)
// serta rencana system.app_settings + id_sequences (lihat docs/ARSITEKTUR_DATABASE.md
// bagian 12 dan docs/PRD.md bagian 5.11 Setting/System).

import type { PreviewKpiItem } from "@/components/module-center/PreviewKpiCard";

export type SettingStatus = "Aktif" | "Belum Diatur" | "Perlu Dicek" | "Siap";

// --- Pengaturan Umum -----------------------------------------------------------
export interface GeneralSettingRow {
  namaSetting: string;
  nilai: string;
  modul: string;
  status: SettingStatus;
}
const generalSettings: GeneralSettingRow[] = [
  { namaSetting: "Nama Perusahaan", nilai: "Probetes ERP", modul: "Profil Perusahaan", status: "Aktif" },
  { namaSetting: "Zona Waktu", nilai: "WIB (GMT+7)", modul: "Pengaturan Aplikasi", status: "Aktif" },
  { namaSetting: "Bahasa Default", nilai: "Bahasa Indonesia", modul: "Pengaturan Aplikasi", status: "Aktif" },
  { namaSetting: "Logo Perusahaan", nilai: "Logo Probetes ERP", modul: "Profil Perusahaan", status: "Siap" },
];

// --- Penomoran ID --------------------------------------------------------------
export interface IdSequenceRow {
  entity: string;
  prefix: string;
  nomorTerakhir: string;
  format: string;
  status: SettingStatus;
}
const idSequences: IdSequenceRow[] = [
  { entity: "Customer", prefix: "PB-CUST-", nomorTerakhir: "021603", format: "PB-CUST-000000", status: "Aktif" },
  { entity: "Order", prefix: "ORD-", nomorTerakhir: "018821", format: "ORD-000000", status: "Aktif" },
  { entity: "Produk", prefix: "PRD-", nomorTerakhir: "000094", format: "PRD-000", status: "Aktif" },
  { entity: "Karyawan", prefix: "EMP-", nomorTerakhir: "000006", format: "EMP-0000", status: "Belum Diatur" },
];

// --- Template Import -------------------------------------------------------
export interface ImportTemplateRow {
  namaTemplate: string;
  modul: string;
  formatFile: "CSV" | "XLSX";
  kolomWajib: string;
  status: SettingStatus;
}
const importTemplates: ImportTemplateRow[] = [
  { namaTemplate: "Template Spending Ads TikTok", modul: "Marketing", formatFile: "XLSX", kolomWajib: "Tanggal, Campaign, Spending", status: "Aktif" },
  { namaTemplate: "Template Data Pesanan Scalev", modul: "Marketing", formatFile: "CSV", kolomWajib: "Tanggal Pesanan, Invoice, Customer, Produk", status: "Aktif" },
  { namaTemplate: "Template Import Karyawan", modul: "HRIS", formatFile: "XLSX", kolomWajib: "Nama, Departemen, Jabatan", status: "Belum Diatur" },
];

// --- Backup / Cadangan -------------------------------------------------------
export interface BackupRow {
  tanggal: string;
  jenisBackup: "Manual" | "Terjadwal";
  lokasi: string;
  ukuran: string;
  status: "Berhasil" | "Gagal" | "Sedang Berjalan";
}
const backups: BackupRow[] = [
  { tanggal: "2026-07-08", jenisBackup: "Manual", lokasi: "D:\\PROBETES\\CADANGAN DATABASE", ukuran: "482 MB", status: "Berhasil" },
  { tanggal: "2026-06-30", jenisBackup: "Manual", lokasi: "D:\\PROBETES\\CADANGAN DATABASE", ukuran: "460 MB", status: "Berhasil" },
];

// --- Security Setting -------------------------------------------------------
export interface SecuritySettingRow {
  aturanKeamanan: string;
  nilai: string;
  status: SettingStatus;
  catatan: string;
}
const securitySettings: SecuritySettingRow[] = [
  { aturanKeamanan: "Panjang Password Minimum", nilai: "8 karakter", status: "Belum Diatur", catatan: "Menunggu modul IAM (Fase 10)" },
  { aturanKeamanan: "Sesi Login Maksimal", nilai: "8 jam", status: "Belum Diatur", catatan: "Menunggu modul IAM (Fase 10)" },
  { aturanKeamanan: "Two-Factor Authentication", nilai: "Nonaktif", status: "Belum Diatur", catatan: "Belum ada rencana jangka pendek" },
];

export function getSettingPreviewData() {
  const kpi: PreviewKpiItem[] = [
    { label: "Status Sistem", value: "Normal", detail: "Semua modul jalan", tone: "green" },
    { label: "Jadwal Backup", value: "Manual", detail: "Belum terjadwal", tone: "amber" },
    { label: "Backup Terakhir", value: "8 Jul 2026", detail: "6 hari lalu", tone: "amber" },
    { label: "Format ID Aktif", value: "3 / 4", detail: "Customer, Order, Produk", tone: "slate" },
    { label: "Integrasi Disiapkan", value: "1 / 4", detail: "Marketplace resmi", tone: "purple" },
  ];

  return { kpi, generalSettings, idSequences, importTemplates, backups, securitySettings };
}
