// TODO: Data dummy ini nanti diganti ke API/database asli setelah backend modul tersedia.
// Struktur mengikuti rencana schema hris.employees + hris.attendance + hris.payslip_components
// (lihat docs/ARSITEKTUR_DATABASE.md bagian 9 dan docs/PRD.md bagian 5.9 HRIS). Komisi
// mencakup CS, CRM, dan ADV.

import type { PreviewKpiItem } from "@/components/module-center/PreviewKpiCard";

export type AttendanceStatus = "Hadir" | "Terlambat" | "Izin" | "Sakit" | "Alpha" | "Libur";
export type CommissionTeam = "CS" | "CRM" | "ADV";
export type EmployeeWorkStatus = "Aktif" | "Cuti" | "Resign" | "Nonaktif";
export type HrisRowStatus = "Aktif" | "Perlu Review" | "Draft";

// --- Data Karyawan ------------------------------------------------------------
export interface EmployeeRow {
  nama: string;
  nikPlaceholder: string;
  departemen: string;
  jabatan: string;
  statusKerja: EmployeeWorkStatus;
  status: HrisRowStatus;
}
const employees: EmployeeRow[] = [
  { nama: "Rina Marlina", nikPlaceholder: "EMP-0001", departemen: "CS WA", jabatan: "Staff CS", statusKerja: "Aktif", status: "Aktif" },
  { nama: "Fajar Nugroho", nikPlaceholder: "EMP-0002", departemen: "CRM", jabatan: "Staff CRM", statusKerja: "Aktif", status: "Aktif" },
  { nama: "Dini Anggraini", nikPlaceholder: "EMP-0003", departemen: "Meta Ads", jabatan: "Staff ADV", statusKerja: "Aktif", status: "Perlu Review" },
  { nama: "Budi Setiawan", nikPlaceholder: "EMP-0004", departemen: "Gudang Jakarta", jabatan: "Staff Gudang", statusKerja: "Aktif", status: "Aktif" },
  { nama: "Nia Kusuma", nikPlaceholder: "EMP-0005", departemen: "CS WA", jabatan: "Staff CS", statusKerja: "Cuti", status: "Draft" },
  { nama: "Wahyu Pratama", nikPlaceholder: "EMP-0006", departemen: "CRM", jabatan: "Supervisor CRM", statusKerja: "Aktif", status: "Aktif" },
];

// --- Departemen & Jabatan ------------------------------------------------------
export interface DepartmentRow {
  departemen: string;
  jabatan: string;
  jumlahKaryawan: number;
  level: "Staff" | "Supervisor" | "Manajer";
  status: "Aktif" | "Nonaktif";
}
const departments: DepartmentRow[] = [
  { departemen: "CS WA", jabatan: "Staff CS", jumlahKaryawan: 12, level: "Staff", status: "Aktif" },
  { departemen: "CRM", jabatan: "Staff CRM", jumlahKaryawan: 8, level: "Staff", status: "Aktif" },
  { departemen: "CRM", jabatan: "Supervisor CRM", jumlahKaryawan: 1, level: "Supervisor", status: "Aktif" },
  { departemen: "Meta Ads", jabatan: "Staff ADV", jumlahKaryawan: 5, level: "Staff", status: "Aktif" },
  { departemen: "Gudang Jakarta", jabatan: "Staff Gudang", jumlahKaryawan: 6, level: "Staff", status: "Aktif" },
];

// --- Absensi --------------------------------------------------------------
export interface AttendanceRow {
  tanggal: string;
  namaKaryawan: string;
  departemen: string;
  checkIn: string;
  checkOut: string;
  statusKehadiran: AttendanceStatus;
  jamKerja: string;
}
const attendance: AttendanceRow[] = [
  { tanggal: "2026-07-10", namaKaryawan: "Rina Marlina", departemen: "CS WA", checkIn: "08:02", checkOut: "17:05", statusKehadiran: "Hadir", jamKerja: "9j 3m" },
  { tanggal: "2026-07-10", namaKaryawan: "Fajar Nugroho", departemen: "CRM", checkIn: "08:00", checkOut: "17:00", statusKehadiran: "Hadir", jamKerja: "9j" },
  { tanggal: "2026-07-10", namaKaryawan: "Dini Anggraini", departemen: "Meta Ads", checkIn: "08:45", checkOut: "17:10", statusKehadiran: "Terlambat", jamKerja: "8j 25m" },
  { tanggal: "2026-07-09", namaKaryawan: "Budi Setiawan", departemen: "Gudang Jakarta", checkIn: "07:58", checkOut: "17:00", statusKehadiran: "Hadir", jamKerja: "9j 2m" },
  { tanggal: "2026-07-09", namaKaryawan: "Nia Kusuma", departemen: "CS WA", checkIn: "-", checkOut: "-", statusKehadiran: "Izin", jamKerja: "-" },
  { tanggal: "2026-07-08", namaKaryawan: "Wahyu Pratama", departemen: "CRM", checkIn: "-", checkOut: "-", statusKehadiran: "Sakit", jamKerja: "-" },
];

// --- Cuti/Izin --------------------------------------------------------------
export interface LeaveRow {
  tanggalPengajuan: string;
  nama: string;
  jenis: "Cuti Tahunan" | "Sakit" | "Izin" | "Tanpa Gaji";
  tanggalCuti: string;
  totalHari: number;
  approver: string;
  status: "Diajukan" | "Disetujui" | "Ditolak";
}
const leaves: LeaveRow[] = [
  { tanggalPengajuan: "2026-07-09", nama: "Nia Kusuma", jenis: "Izin", tanggalCuti: "2026-07-09", totalHari: 1, approver: "Wahyu Pratama", status: "Disetujui" },
  { tanggalPengajuan: "2026-07-05", nama: "Budi Setiawan", jenis: "Cuti Tahunan", tanggalCuti: "2026-07-14 s/d 2026-07-16", totalHari: 3, approver: "Owner Probetes", status: "Diajukan" },
  { tanggalPengajuan: "2026-07-01", nama: "Wahyu Pratama", jenis: "Sakit", tanggalCuti: "2026-07-08", totalHari: 1, approver: "Owner Probetes", status: "Disetujui" },
];

// --- Payroll & Slip Gaji ------------------------------------------------------
export interface PayrollRow {
  periode: string;
  nama: string;
  jabatan: string;
  gajiPokok: number;
  tunjangan: number;
  potongan: number;
  netPay: number;
  status: "Draft" | "Final" | "Dibayar";
}
const payroll: PayrollRow[] = [
  { periode: "Juli 2026", nama: "Rina Marlina", jabatan: "Staff CS", gajiPokok: 3_500_000, tunjangan: 500_000, potongan: 150_000, netPay: 3_850_000, status: "Draft" },
  { periode: "Juli 2026", nama: "Fajar Nugroho", jabatan: "Staff CRM", gajiPokok: 3_800_000, tunjangan: 500_000, potongan: 150_000, netPay: 4_150_000, status: "Draft" },
  { periode: "Juni 2026", nama: "Wahyu Pratama", jabatan: "Supervisor CRM", gajiPokok: 5_500_000, tunjangan: 800_000, potongan: 200_000, netPay: 6_100_000, status: "Dibayar" },
];

// --- Komisi CS/CRM/ADV --------------------------------------------------------
export interface CommissionRow {
  periode: string;
  nama: string;
  tim: CommissionTeam;
  dasarKomisi: string;
  nominalKomisi: number;
  status: HrisRowStatus;
}
const commissions: CommissionRow[] = [
  { periode: "Juli 2026", nama: "Rina Marlina", tim: "CS", dasarKomisi: "42 closing order", nominalKomisi: 350_000, status: "Aktif" },
  { periode: "Juli 2026", nama: "Fajar Nugroho", tim: "CRM", dasarKomisi: "18 repeat order follow-up", nominalKomisi: 420_000, status: "Aktif" },
  { periode: "Juli 2026", nama: "Dini Anggraini", tim: "ADV", dasarKomisi: "Campaign Meta Ads Juli", nominalKomisi: 275_000, status: "Perlu Review" },
  { periode: "Juni 2026", nama: "Wahyu Pratama", tim: "CRM", dasarKomisi: "Supervisi tim CRM", nominalKomisi: 0, status: "Draft" },
];

// --- Laporan HRD --------------------------------------------------------------
export interface HrdReportRow {
  periode: string;
  totalKaryawan: number;
  hadir: number;
  izin: number;
  alpha: number;
  biayaGaji: number;
  statusLaporan: "Siap Dilihat" | "Draft" | "Belum Final";
}
const hrdReports: HrdReportRow[] = [
  { periode: "Juli 2026 (berjalan)", totalKaryawan: 63, hadir: 58, izin: 4, alpha: 1, biayaGaji: 186_000_000, statusLaporan: "Draft" },
  { periode: "Juni 2026", totalKaryawan: 61, hadir: 57, izin: 3, alpha: 1, biayaGaji: 179_500_000, statusLaporan: "Siap Dilihat" },
];

export function getHrisPreviewData() {
  const kpi: PreviewKpiItem[] = [
    { label: "Total Karyawan", value: "63", detail: "Aktif", tone: "slate" },
    { label: "Hadir Hari Ini", value: "58", detail: "92% kehadiran", tone: "green" },
    { label: "Terlambat", value: "3", detail: "Perlu ditegur", tone: "amber" },
    { label: "Cuti / Izin", value: "5", detail: "Sedang berjalan", tone: "blue" },
    { label: "Payroll Draft", value: "1", detail: "Periode Juli 2026", tone: "purple" },
    { label: "Komisi Perlu Review", value: "2", detail: "CS/CRM/ADV", tone: "red" },
  ];

  return { kpi, employees, departments, attendance, leaves, payroll, commissions, hrdReports };
}
