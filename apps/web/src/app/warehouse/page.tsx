import {
  ArrowLeftRight,
  Bell,
  Boxes,
  ClipboardCheck,
  LayoutDashboard,
  PackageMinus,
  PackagePlus,
  RotateCcw,
  Warehouse,
} from "lucide-react";
import { ModuleCenterShell } from "@/components/module-center/ModuleCenterShell";
import { ModuleHero } from "@/components/module-center/ModuleHero";
import { ModuleMenuCard, type ModuleMenuItem } from "@/components/module-center/ModuleMenuCard";
import { DummyDataBanner } from "@/components/module-center/DummyDataBanner";

const menus: ModuleMenuItem[] = [
  { id: "dashboard-stok", title: "Dashboard Stok", description: "KPI stok, stok kritis, restock, dan mapping SKU.", href: "/warehouse/dashboard-stok", icon: LayoutDashboard },
  { id: "stok-barang", title: "Stok Barang", description: "Stok tersedia, reserved, dan reorder point per gudang.", href: "/warehouse/stok-barang", icon: Boxes },
  { id: "barang-masuk", title: "Barang Masuk", description: "Catat penerimaan barang dari produksi atau supplier.", href: "/warehouse/barang-masuk", icon: PackagePlus },
  { id: "barang-keluar", title: "Barang Keluar", description: "Catat pengiriman barang keluar gudang untuk order.", href: "/warehouse/barang-keluar", icon: PackageMinus },
  { id: "transfer-gudang", title: "Transfer Gudang", description: "Riwayat perpindahan stok antar gudang.", href: "/warehouse/transfer-gudang", icon: ArrowLeftRight },
  { id: "stock-opname", title: "Stock Opname", description: "Bandingkan stok sistem dengan stok fisik gudang.", href: "/warehouse/stock-opname", icon: ClipboardCheck },
  { id: "retur-gudang", title: "Retur Gudang", description: "Kelola barang retur yang kembali ke gudang.", href: "/warehouse/retur-gudang", icon: RotateCcw },
  { id: "restock-alert", title: "Restock Alert", description: "Produk yang stoknya di bawah reorder point.", href: "/warehouse/restock-alert", icon: Bell },
];

export default function WarehousePage() {
  return (
    <ModuleCenterShell>
      <DummyDataBanner />
      <ModuleHero
        eyebrow="WAREHOUSE MODULE"
        titlePrefix="Warehouse"
        titleHighlight="/ Gudang"
        description="Kelola stok, barang masuk, barang keluar, mutasi, stock opname, dan retur gudang."
        monogram="W"
        highlights={[
          { icon: Warehouse, title: "Multi Gudang", detail: "Jakarta & Makassar" },
          { icon: Boxes, title: "Stok Terpantau", detail: "Sistem vs fisik" },
          { icon: ClipboardCheck, title: "Opname Terjadwal", detail: "Cek berkala" },
        ]}
      />

      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-[-0.03em] text-slate-900 sm:text-2xl">Pilih Menu Warehouse</h2>
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
