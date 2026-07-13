import { MarketingHero } from "@/features/marketing/components/MarketingHero";
import { MarketingMenuCard } from "@/features/marketing/components/MarketingMenuCard";
import { DummyBanner } from "@/features/marketing/components/DummyBanner";
import type { MarketingMenu } from "@/features/marketing/types";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

const menus: MarketingMenu[] = [
  {
    id: "import",
    title: "Import Data Channel",
    description: "Upload file pesanan Skalev, TikTok, Shopee, dan data ads Meta.",
    href: "/marketing/import",
    icon: "upload",
  },
  {
    id: "sales",
    title: "Sales & Order Center",
    description: "Overview penjualan, performa produk/toko/CS, status pesanan, dan retur.",
    href: "/marketing/sales-order",
    icon: "receipt",
  },
  {
    id: "ads",
    title: "Iklan & ROAS",
    description: "Spending, sales, ROAS, ADV, campaign, dan toko untuk strategi iklan.",
    href: "/marketing/ads-roas",
    icon: "megaphone",
  },
  {
    id: "crm",
    title: "CRM",
    description: "Pusat kerja CS/CRM: closingan, iklan CRM, RFM & cohort, cluster, dan follow-up.",
    href: "/marketing/crm",
    icon: "users",
  },
];

export default function MarketingLauncherPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#eef2f6]/90 text-brand-deep">
      <main className="mx-auto flex w-full max-w-[1680px] flex-col gap-6 px-5 py-6 sm:px-7 lg:px-10">
        <DummyBanner />
        <MarketingHero />

        <div className="flex flex-col gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-[-0.03em] text-slate-900 sm:text-2xl">
              Pilih Menu Marketing
            </h2>
            <p className="mt-1.5 text-sm font-medium text-slate-600 sm:text-base">
              Akses import data, laporan penjualan, analitik iklan, dan manajemen pelanggan.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {menus.map((m) => (
              <MarketingMenuCard key={m.id} menu={m} />
            ))}
          </div>
        </div>

        <div className="flex">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <ChevronLeft className="size-4" strokeWidth={2.5} />
            Kembali ke Beranda
          </Link>
        </div>
      </main>
      <footer className="pb-7 pt-3 text-center text-xs font-medium text-slate-500 sm:text-sm">
        © 2026 Probetes ERP. All rights reserved.
      </footer>
    </div>
  );
}
