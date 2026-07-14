"use client";

import { useState } from "react";
import { BarChart3, Package, RotateCcw, Store, Truck, Users } from "lucide-react";
import { MarketingBackButton } from "@/features/marketing/components/MarketingBackButton";
import { SalesOrderCenterHero } from "./components/SalesOrderCenterHero";
import { SalesOrderCenterMenuCard } from "./components/SalesOrderCenterMenuCard";
import { MiniColumnBars, MiniDonutLegend, MiniRankedBars, MiniSparklineCallout } from "./components/charts/SalesOrderCharts";
import { formatRupiahRingkas } from "./lib/format";
import type { CenterMenuCard } from "./types/salesOrder.types";

const MENU_ICON: Record<string, typeof BarChart3> = { overview: BarChart3, products: Package, "stores-channels": Store, "cs-crm": Users, "order-status": Truck, "returns-review": RotateCcw };

// Menu lama dipertahankan. Ini launcher, jadi tidak bergantung pada endpoint ringkasan.
const MENU_CARDS: CenterMenuCard[] = [
  { id: "overview", href: "/marketing/sales-order/overview", title: "Overview Penjualan", description: "Ringkasan pesanan valid, pendapatan, produk, dan channel.", miniTitle: "Lihat Laporan", stats: [] },
  { id: "products", href: "/marketing/sales-order/products", title: "Produk", description: "Pantau performa produk dan kontribusi penjualan.", miniTitle: "Lihat Laporan", stats: [] },
  { id: "stores-channels", href: "/marketing/sales-order/stores-channels", title: "Channel", description: "Pantau performa channel dan sumber pesanan.", miniTitle: "Lihat Laporan", stats: [] },
  { id: "cs-crm", href: "/marketing/sales-order/cs-crm", title: "CS / CRM", description: "Pantau performa penjualan tim dan penanggung jawab.", miniTitle: "Lihat Laporan", stats: [] },
  { id: "order-status", href: "/marketing/sales-order/order-status", title: "Status / COD", description: "Pantau status pesanan, pengiriman, dan COD.", miniTitle: "Lihat Laporan", stats: [] },
  { id: "returns-review", href: "/marketing/sales-order/returns-review", title: "Retur / Review", description: "Tinjau retur dan data yang perlu diperiksa.", miniTitle: "Lihat Laporan", stats: [] },
];

export function SalesOrderCenterPage() {
  const [menuCards] = useState(MENU_CARDS);
  return <div className="min-h-screen overflow-x-hidden bg-[#eef2f6]/90 text-brand-deep"><main className="mx-auto flex w-full max-w-[1680px] flex-col gap-6 px-5 py-6 sm:px-7 lg:px-10">
    <SalesOrderCenterHero stats={[{ label: "Data Penjualan", value: "Lihat Laporan" }, { label: "Pesanan Valid", value: "Live" }, { label: "Periode", value: "Pilih di Overview" }]} />
    <div className="flex flex-col gap-4"><div><h2 className="text-xl font-bold tracking-[-0.03em] text-slate-900 sm:text-2xl">Pilih Menu Laporan Penjualan</h2><p className="mt-1.5 text-sm font-medium text-slate-600 sm:text-base">Akses laporan untuk memantau penjualan, pesanan, produk, channel, customer, retur, dan COD.</p></div><div className="grid grid-cols-1 gap-4 lg:grid-cols-3">{menuCards.map((menu) => <SalesOrderCenterMenuCard key={menu.id} menu={menu} icon={MENU_ICON[menu.id] ?? BarChart3} miniVisual={<MenuMiniVisual id={menu.id} />} />)}</div></div>
    <div className="flex"><MarketingBackButton /></div>
  </main><footer className="pb-7 pt-3 text-center text-xs font-medium text-slate-500 sm:text-sm">© 2026 Probetes ERP. All rights reserved.</footer></div>;
}

function MenuMiniVisual({ id }: { id: string }) {
  if (id === "overview") return <MiniSparklineCallout points={[]} formatValue={formatRupiahRingkas} />;
  if (id === "products") return <MiniRankedBars data={[]} formatValue={formatRupiahRingkas} />;
  if (id === "stores-channels") return <MiniDonutLegend segments={[]} />;
  if (id === "cs-crm") return <MiniColumnBars values={[]} />;
  if (id === "order-status") return <MiniDonutLegend segments={[]} />;
  return <MiniSparklineCallout points={[]} />;
}
