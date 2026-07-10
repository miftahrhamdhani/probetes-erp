"use client";

import { useEffect, useState } from "react";
import { BarChart3, Package, RotateCcw, Store, Truck, Users } from "lucide-react";
import { DummyBanner } from "@/features/marketing/components/DummyBanner";
import { MarketingBackButton } from "@/features/marketing/components/MarketingBackButton";
import { SalesOrderCenterHero } from "./components/SalesOrderCenterHero";
import { SalesOrderCenterMenuCard } from "./components/SalesOrderCenterMenuCard";
import { MiniColumnBars, MiniDonutLegend, MiniRankedBars, MiniSparklineCallout } from "./components/charts/SalesOrderCharts";
import { SalesOrderErrorState } from "./components/SalesOrderStates";
import { getSalesOrderCenterSummary } from "./lib/salesOrderService";
import { formatRupiahRingkas } from "./lib/format";
import type { SalesOrderCenterData } from "./types/salesOrder.types";

const MENU_ICON: Record<string, typeof BarChart3> = {
  overview: BarChart3, products: Package, "stores-channels": Store, "cs-crm": Users, "order-status": Truck, "returns-review": RotateCcw,
};

export function SalesOrderCenterPage() {
  const [data, setData] = useState<SalesOrderCenterData | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    getSalesOrderCenterSummary().then(setData).catch(() => setError(true));
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#eef2f6]/90 text-brand-deep">
      <main className="mx-auto flex w-full max-w-[1680px] flex-col gap-6 px-5 py-6 sm:px-7 lg:px-10">
        <DummyBanner />

        {data && <SalesOrderCenterHero stats={data.heroStats} />}

        {error && <SalesOrderErrorState message="Ringkasan Sales & Order belum bisa dimuat." />}

        <div className="flex flex-col gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-[-0.03em] text-slate-900 sm:text-2xl">Pilih Menu Laporan Penjualan</h2>
            <p className="mt-1.5 text-sm font-medium text-slate-600 sm:text-base">
              Akses berbagai laporan untuk memantau performa sales, order, produk, toko, customer, retur, dan COD.
            </p>
          </div>

          {data && (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              {data.menuCards.map((menu) => (
                <SalesOrderCenterMenuCard
                  key={menu.id}
                  menu={menu}
                  icon={MENU_ICON[menu.id] ?? BarChart3}
                  miniVisual={<MenuMiniVisual id={menu.id} />}
                />
              ))}
            </div>
          )}
        </div>

        <div className="flex"><MarketingBackButton /></div>
      </main>
      <footer className="pb-7 pt-3 text-center text-xs font-medium text-slate-500 sm:text-sm">© 2026 Probetes ERP. All rights reserved.</footer>
    </div>
  );
}

function MenuMiniVisual({ id }: { id: string }) {
  if (id === "overview") return <MiniSparklineCallout points={[42, 78, 88, 66, 71, 92, 58]} formatValue={formatRupiahRingkas} />;
  if (id === "products") return <MiniRankedBars data={[{ code: "PRD-001", name: "A", value: 45_210_000 }, { code: "PRD-002", name: "B", value: 32_710_000 }, { code: "PRD-003", name: "C", value: 18_900_000 }]} formatValue={formatRupiahRingkas} />;
  if (id === "stores-channels") return <MiniDonutLegend segments={[{ label: "Shopee", value: 45 }, { label: "TikTok", value: 28 }, { label: "Meta/CRM", value: 15 }]} />;
  if (id === "cs-crm") return <MiniColumnBars values={[60, 42, 35, 28, 20]} />;
  if (id === "order-status") return <MiniDonutLegend segments={[{ label: "Sukses", value: 72 }, { label: "Pending", value: 12 }, { label: "Proses", value: 8 }]} />;
  return <MiniSparklineCallout points={[15, 18, 20, 22, 28, 24, 19]} />;
}
