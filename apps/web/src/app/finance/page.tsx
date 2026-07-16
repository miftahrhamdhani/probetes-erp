import {
  HandCoins,
  Landmark,
  PiggyBank,
  Receipt,
  RefreshCw,
  ScrollText,
  TrendingDown,
  Wallet,
} from "lucide-react";
import { ModuleCenterShell } from "@/components/module-center/ModuleCenterShell";
import { ModuleHero } from "@/components/module-center/ModuleHero";
import { ModuleMenuCard, type ModuleMenuItem } from "@/components/module-center/ModuleMenuCard";
import { DummyDataBanner } from "@/components/module-center/DummyDataBanner";

const menus: ModuleMenuItem[] = [
  { id: "dashboard-finance", title: "Ringkasan Finance", description: "KPI pemasukan, pengeluaran, margin, dan COD belum cair.", href: "/finance/dashboard", icon: Wallet },
  { id: "rekonsiliasi", title: "Rekonsiliasi & Settlement", description: "Cocokkan payout marketplace/ekspedisi dengan order.", href: "/finance/rekonsiliasi", icon: RefreshCw },
  { id: "pemasukan", title: "Pemasukan", description: "Uang masuk dari settlement, transfer, dan COD cair.", href: "/finance/pemasukan", icon: PiggyBank },
  { id: "pengeluaran", title: "Pengeluaran", description: "Biaya operasional, iklan, dan logistik.", href: "/finance/pengeluaran", icon: TrendingDown },
  { id: "hpp-margin", title: "HPP & Margin", description: "Hitung HPP dan margin per produk/order.", href: "/finance/hpp-margin", icon: Receipt },
  { id: "cod-settlement", title: "COD / Settlement", description: "Nominal COD, fee, dan status pencairan per order.", href: "/finance/cod-settlement", icon: HandCoins },
  { id: "laba-rugi", title: "Laba Rugi", description: "Ringkasan laba rugi berdasarkan data yang sudah rapi.", href: "/finance/laba-rugi", icon: ScrollText },
];

export default function FinancePage() {
  return (
    <ModuleCenterShell>
      <DummyDataBanner />
      <ModuleHero
        eyebrow="FINANCE MODULE"
        titlePrefix="Finance"
        titleHighlight="Center"
        description="Kelola ringkasan keuangan, pemasukan, pengeluaran, rekonsiliasi, HPP, margin, dan laporan finance."
        monogram="F"
        highlights={[
          { icon: Landmark, title: "Rekonsiliasi Rapi", detail: "Marketplace & ekspedisi" },
          { icon: HandCoins, title: "COD Terpantau", detail: "Cair & belum cair" },
          { icon: Receipt, title: "HPP & Margin", detail: "Per produk & order" },
        ]}
      />

      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-[-0.03em] text-slate-900 sm:text-2xl">Pilih Menu Finance</h2>
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
