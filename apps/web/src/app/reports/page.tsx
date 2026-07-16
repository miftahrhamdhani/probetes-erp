import {
  BarChart3,
  ClipboardList,
  Download,
  FileText,
  LineChart,
  Megaphone,
  PackageSearch,
  Users,
  Wallet,
} from "lucide-react";
import { ModuleCenterShell } from "@/components/module-center/ModuleCenterShell";
import { ModuleHero } from "@/components/module-center/ModuleHero";
import { ModuleMenuCard, type ModuleMenuItem } from "@/components/module-center/ModuleMenuCard";
import { DummyDataBanner } from "@/components/module-center/DummyDataBanner";

const menus: ModuleMenuItem[] = [
  { id: "ringkasan-owner", title: "Ringkasan Owner", description: "KPI lintas modul untuk pengambilan keputusan cepat.", href: "/reports/dashboard-owner", icon: LineChart },
  { id: "laporan-penjualan", title: "Laporan Penjualan", description: "Sales, order, produk terlaris, dan tren penjualan.", href: "/reports/laporan-sales", icon: BarChart3 },
  { id: "laporan-marketing", title: "Laporan Marketing", description: "Performa channel, spending, dan ROAS iklan.", href: "/reports/marketing-roas", icon: Megaphone },
  { id: "laporan-crm", title: "Laporan CRM", description: "Retensi, repeat order, dan segmentasi pelanggan.", href: "/reports/crm-cohort", icon: Users },
  { id: "laporan-tracking", title: "Laporan Tracking", description: "Status pengiriman, COD, dan retur.", href: "/reports/tracking-cod-retur", icon: PackageSearch },
  { id: "laporan-finance", title: "Laporan Finance", description: "Margin, HPP, dan rekonsiliasi keuangan.", href: "/reports/finance", icon: Wallet },
  { id: "laporan-warehouse", title: "Laporan Warehouse", description: "Stok, stok kritis, dan mutasi gudang.", href: "/reports/warehouse", icon: PackageSearch },
  { id: "laporan-hris", title: "Laporan HRIS", description: "Kehadiran, cuti, payroll, dan komisi tim.", href: "/reports/hris", icon: ClipboardList },
];

export default function ReportsPage() {
  return (
    <ModuleCenterShell>
      <DummyDataBanner />
      <ModuleHero
        eyebrow="REPORTS MODULE"
        titlePrefix="Reports"
        titleHighlight="Center"
        description="Pusat laporan final untuk owner dan manajemen, membaca data dari database, marketing, CRM, tracking, finance, gudang, dan HRIS."
        monogram="R"
        highlights={[
          { icon: FileText, title: "Laporan Terpusat", detail: "Semua modul, satu tempat" },
          { icon: BarChart3, title: "Analitik Siap Pakai", detail: "Sales, marketing, CRM" },
          { icon: Download, title: "Bisa Diekspor", detail: "PDF & Excel" },
        ]}
      />

      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-[-0.03em] text-slate-900 sm:text-2xl">Pilih Menu Reports</h2>
          <p className="mt-1.5 text-sm font-medium text-slate-600 sm:text-base">
            Klik salah satu menu untuk membuka halaman laporan khusus submenu tersebut.
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
