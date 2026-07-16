import {
  BadgeDollarSign,
  Building2,
  CalendarCheck,
  CalendarClock,
  ClipboardList,
  IdCard,
  LayoutDashboard,
  Wallet,
} from "lucide-react";
import { ModuleCenterShell } from "@/components/module-center/ModuleCenterShell";
import { ModuleHero } from "@/components/module-center/ModuleHero";
import { ModuleMenuCard, type ModuleMenuItem } from "@/components/module-center/ModuleMenuCard";
import { DummyDataBanner } from "@/components/module-center/DummyDataBanner";

const menus: ModuleMenuItem[] = [
  { id: "dashboard", title: "Dashboard HRIS", description: "KPI karyawan aktif, absensi hari ini, terlambat, izin, dan payroll.", href: "/hris/dashboard", icon: LayoutDashboard },
  { id: "data-karyawan", title: "Data Karyawan", description: "Kelola identitas karyawan, departemen, jabatan, dan status kerja.", href: "/hris/data-karyawan", icon: IdCard },
  { id: "departemen-jabatan", title: "Departemen & Jabatan", description: "Struktur departemen, jabatan, dan jumlah karyawan.", href: "/hris/departemen-jabatan", icon: Building2 },
  { id: "absensi", title: "Absensi", description: "Kehadiran, keterlambatan, izin, sakit, alpha, libur, dan jam kerja.", href: "/hris/absensi", icon: CalendarClock },
  { id: "cuti-izin", title: "Cuti & Izin", description: "Pengajuan cuti, izin, persetujuan, dan riwayat cuti.", href: "/hris/cuti-izin", icon: CalendarCheck },
  { id: "payroll", title: "Payroll", description: "Periode gaji, slip gaji, gaji pokok, tunjangan, potongan, dan net pay.", href: "/hris/payroll", icon: Wallet },
  { id: "komisi", title: "Komisi CS / CRM / ADV", description: "Komisi tim CS, CRM, dan ADV berdasarkan closing, order, atau leads.", href: "/hris/komisi", icon: BadgeDollarSign },
  { id: "laporan-hrd", title: "Laporan HRD", description: "Ringkasan karyawan, absensi, cuti, payroll, dan komisi untuk owner.", href: "/hris/laporan-hrd", icon: ClipboardList },
];

export default function HrisLauncherPage() {
  return (
    <ModuleCenterShell>
      <DummyDataBanner />
      <ModuleHero
        eyebrow="HRIS MODULE"
        titlePrefix="HRIS"
        titleHighlight="Control Center"
        description="Kelola data karyawan, absensi, cuti, payroll, komisi CS/CRM/ADV, dan laporan HRD dalam satu sistem ERP."
        monogram="H"
        highlights={[
          { icon: IdCard, title: "Data Karyawan", detail: "Identitas & kepegawaian" },
          { icon: CalendarCheck, title: "Absensi & Cuti", detail: "Kehadiran & izin tim" },
          { icon: Wallet, title: "Payroll & Komisi", detail: "Gaji & komisi CS/CRM/ADV" },
        ]}
      />

      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-[-0.03em] text-slate-900 sm:text-2xl">Pilih Menu HRIS</h2>
          <p className="mt-1.5 text-sm font-medium text-slate-600 sm:text-base">
            Klik salah satu menu untuk membuka halaman kerja khusus submenu tersebut.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {menus.map((menu) => (
            <ModuleMenuCard key={menu.id} menu={menu} />
          ))}
        </div>
      </div>
    </ModuleCenterShell>
  );
}
