import { Search, Truck, PackageSearch, HandCoins, RotateCcw } from "lucide-react";
import { ModuleCenterShell } from "@/components/module-center/ModuleCenterShell";
import { ModuleHero } from "@/components/module-center/ModuleHero";
import { ModuleMenuCard, type ModuleMenuItem } from "@/components/module-center/ModuleMenuCard";
import { DummyDataBanner } from "@/components/module-center/DummyDataBanner";

const menus: ModuleMenuItem[] = [
  { id: "cek-resi", title: "Cek Resi", description: "Cari nomor resi, customer, ekspedisi, dan status pengiriman.", href: "/data-tracking/cek-resi", icon: Search },
  { id: "status-pengiriman", title: "Status Pengiriman", description: "Pantau paket yang sedang dikirim, terkirim, gagal kirim, retur, atau perlu follow-up.", href: "/data-tracking/status-pengiriman", icon: PackageSearch },
  { id: "cod-pembayaran", title: "COD & Pembayaran", description: "Pantau COD belum cair, COD sudah cair, non-COD, ongkir, fee COD, dan status pembayaran.", href: "/data-tracking/cod-pembayaran", icon: HandCoins },
  { id: "retur-gagal", title: "Retur & Gagal Kirim", description: "Lihat daftar paket retur, gagal kirim, alasan retur, dan follow-up CS.", href: "/data-tracking/retur-gagal-kirim", icon: RotateCcw },
];

export default function DataTrackingPage() {
  return (
    <ModuleCenterShell>
      <DummyDataBanner />
      <ModuleHero
        eyebrow="DATA TRACKING MODULE"
        titlePrefix="Data Tracking"
        titleHighlight="Center"
        description="Pantau resi, pengiriman, COD, retur, dan gagal kirim dalam satu pusat data operasional."
        monogram="T"
        highlights={[
          { icon: Truck, title: "Pengiriman Real-time", detail: "Status paket harian" },
          { icon: HandCoins, title: "COD Terpantau", detail: "Cair & belum cair" },
          { icon: RotateCcw, title: "Retur Tercatat", detail: "Alasan & follow-up" },
        ]}
      />

      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-[-0.03em] text-slate-900 sm:text-2xl">Pilih Menu Data Tracking</h2>
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
