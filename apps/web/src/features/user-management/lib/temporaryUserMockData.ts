// TODO: Data dummy ini nanti diganti ke API/database asli setelah backend modul tersedia.
// Struktur mengikuti rencana schema iam.accounts + iam.roles + iam.permissions +
// iam.role_permissions + iam.account_roles + iam.activity_log
// (lihat docs/ARSITEKTUR_DATABASE.md bagian 10 dan docs/PRD.md bagian 5.10). Login/autentikasi belum dibuat.

import type { PreviewKpiItem } from "@/components/module-center/PreviewKpiCard";

export type UserRole = "Owner" | "Admin" | "Marketing" | "CS" | "CRM" | "ADV" | "Finance" | "Gudang" | "HRD";
export type UserAccountStatus = "Aktif" | "Nonaktif" | "Perlu Review" | "Login Berhasil";

// --- Akun Login --------------------------------------------------------------
export interface AccountRow {
  user: string;
  emailUsername: string;
  roleUtama: UserRole;
  statusAkun: "Aktif" | "Nonaktif";
  lastLogin: string;
}
const accounts: AccountRow[] = [
  { user: "Owner Probetes", emailUsername: "owner@probetes.id", roleUtama: "Owner", statusAkun: "Aktif", lastLogin: "2026-07-10 09:12" },
  { user: "Rina Marlina", emailUsername: "rina.cs@probetes.id", roleUtama: "CS", statusAkun: "Aktif", lastLogin: "2026-07-10 08:05" },
  { user: "Fajar Nugroho", emailUsername: "fajar.crm@probetes.id", roleUtama: "CRM", statusAkun: "Aktif", lastLogin: "2026-07-10 08:00" },
  { user: "Dini Anggraini", emailUsername: "dini.adv@probetes.id", roleUtama: "ADV", statusAkun: "Aktif", lastLogin: "2026-07-09 17:40" },
  { user: "Admin Sistem", emailUsername: "admin@probetes.id", roleUtama: "Admin", statusAkun: "Nonaktif", lastLogin: "2026-06-20 10:00" },
];

// --- Role --------------------------------------------------------------------
export interface RoleRow {
  namaRole: UserRole;
  deskripsi: string;
  jumlahUser: number;
  status: "Aktif" | "Nonaktif";
}
const roles: RoleRow[] = [
  { namaRole: "Owner", deskripsi: "Akses penuh seluruh modul ERP.", jumlahUser: 1, status: "Aktif" },
  { namaRole: "Admin", deskripsi: "Kelola pengaturan sistem & user.", jumlahUser: 2, status: "Aktif" },
  { namaRole: "CS", deskripsi: "Akses Data Tracking & closing order.", jumlahUser: 12, status: "Aktif" },
  { namaRole: "CRM", deskripsi: "Akses Marketing CRM & follow-up.", jumlahUser: 8, status: "Aktif" },
  { namaRole: "ADV", deskripsi: "Akses Iklan & ROAS Marketing.", jumlahUser: 5, status: "Aktif" },
  { namaRole: "Finance", deskripsi: "Akses modul Finance.", jumlahUser: 3, status: "Aktif" },
  { namaRole: "Gudang", deskripsi: "Akses modul Warehouse.", jumlahUser: 6, status: "Aktif" },
  { namaRole: "HRD", deskripsi: "Akses modul HRIS.", jumlahUser: 2, status: "Aktif" },
];

// --- Permission ----------------------------------------------------------------
export interface PermissionRow {
  kodePermission: string;
  modul: string;
  aksi: "Lihat" | "Tambah" | "Ubah" | "Hapus" | "Export";
  deskripsi: string;
}
const permissions: PermissionRow[] = [
  { kodePermission: "TRACKING_VIEW", modul: "Data Tracking", aksi: "Lihat", deskripsi: "Lihat resi & status pengiriman." },
  { kodePermission: "FINANCE_VIEW", modul: "Finance", aksi: "Lihat", deskripsi: "Lihat ringkasan keuangan." },
  { kodePermission: "HRIS_EDIT", modul: "HRIS", aksi: "Ubah", deskripsi: "Ubah data karyawan & payroll." },
  { kodePermission: "WAREHOUSE_EXPORT", modul: "Warehouse", aksi: "Export", deskripsi: "Export laporan stok." },
  { kodePermission: "USER_DELETE", modul: "User Management", aksi: "Hapus", deskripsi: "Nonaktifkan akun user." },
];

// --- Role Permission ------------------------------------------------------------
export interface RolePermissionRow {
  role: UserRole;
  modul: string;
  permission: string;
  status: "Aktif" | "Nonaktif";
}
const rolePermissions: RolePermissionRow[] = [
  { role: "CS", modul: "Data Tracking", permission: "TRACKING_VIEW", status: "Aktif" },
  { role: "Finance", modul: "Finance", permission: "FINANCE_VIEW", status: "Aktif" },
  { role: "HRD", modul: "HRIS", permission: "HRIS_EDIT", status: "Aktif" },
  { role: "Gudang", modul: "Warehouse", permission: "WAREHOUSE_EXPORT", status: "Aktif" },
  { role: "Admin", modul: "User Management", permission: "USER_DELETE", status: "Aktif" },
];

// --- Account Role ------------------------------------------------------------
export interface AccountRoleRow {
  akun: string;
  role: UserRole;
  diberikanOleh: string;
  tanggal: string;
  status: "Aktif" | "Dicabut";
}
const accountRoles: AccountRoleRow[] = [
  { akun: "Rina Marlina", role: "CS", diberikanOleh: "Admin Sistem", tanggal: "2026-01-15", status: "Aktif" },
  { akun: "Fajar Nugroho", role: "CRM", diberikanOleh: "Admin Sistem", tanggal: "2026-02-01", status: "Aktif" },
  { akun: "Dini Anggraini", role: "ADV", diberikanOleh: "Admin Sistem", tanggal: "2026-03-10", status: "Aktif" },
  { akun: "Admin Lama", role: "Admin", diberikanOleh: "Owner Probetes", tanggal: "2025-11-01", status: "Dicabut" },
];

// --- Activity Log --------------------------------------------------------------
export interface UserActivityRow {
  tanggal: string;
  namaUser: string;
  role: UserRole;
  modul: string;
  aktivitas: string;
  status: UserAccountStatus;
}
const activities: UserActivityRow[] = [
  { tanggal: "2026-07-10", namaUser: "Owner Probetes", role: "Owner", modul: "Reports", aktivitas: "Membuka Ringkasan Owner", status: "Login Berhasil" },
  { tanggal: "2026-07-10", namaUser: "Rina Marlina", role: "CS", modul: "Data Tracking", aktivitas: "Cek status resi", status: "Aktif" },
  { tanggal: "2026-07-10", namaUser: "Fajar Nugroho", role: "CRM", modul: "Marketing", aktivitas: "Update status follow-up", status: "Aktif" },
  { tanggal: "2026-07-09", namaUser: "Dini Anggraini", role: "ADV", modul: "Marketing", aktivitas: "Upload spending iklan Meta", status: "Aktif" },
  { tanggal: "2026-07-09", namaUser: "Budi Setiawan", role: "Gudang", modul: "Warehouse", aktivitas: "Input barang masuk", status: "Aktif" },
  { tanggal: "2026-07-08", namaUser: "Siti Amelia", role: "Finance", modul: "Finance", aktivitas: "Review settlement TikTok", status: "Perlu Review" },
  { tanggal: "2026-07-08", namaUser: "Admin Sistem", role: "Admin", modul: "User Management", aktivitas: "Nonaktifkan akun lama", status: "Nonaktif" },
  { tanggal: "2026-07-07", namaUser: "Wahyu Pratama", role: "HRD", modul: "HRIS", aktivitas: "Approve pengajuan cuti", status: "Aktif" },
];

export function getUserManagementPreviewData() {
  const kpi: PreviewKpiItem[] = [
    { label: "Total Akun", value: "42", detail: "Terdaftar", tone: "slate" },
    { label: "Akun Aktif", value: "37", detail: "Sedang aktif", tone: "green" },
    { label: "Role Terdaftar", value: "9", detail: "Owner s/d HRD", tone: "blue" },
    { label: "Login Hari Ini", value: "18", detail: "Sesi berhasil", tone: "green" },
    { label: "Aktivitas Terakhir", value: "5 menit lalu", detail: "Rina Marlina", tone: "amber" },
  ];

  return { kpi, accounts, roles, permissions, rolePermissions, accountRoles, activities };
}
