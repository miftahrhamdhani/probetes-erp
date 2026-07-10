"use client";

import { useEffect, useState } from "react";
import { DummyBanner } from "@/features/marketing/components/DummyBanner";
import { SalesOrderPageHeader } from "./components/SalesOrderPageHeader";
import { SalesOrderFilterBar } from "./components/SalesOrderFilterBar";
import { SalesOrderKpiCard } from "./components/SalesOrderKpiCard";
import { SalesOrderSectionCard } from "./components/SalesOrderSectionCard";
import { SalesOrderTable, type SalesOrderTableColumn } from "./components/SalesOrderTable";
import { SalesOrderBadge } from "./components/SalesOrderBadge";
import { SalesOrderBackButton } from "./components/SalesOrderBackButton";
import { SalesOrderErrorState, SalesOrderKpiSkeleton, SalesOrderSectionSkeleton } from "./components/SalesOrderStates";
import { DonutWithCenter, DualLineTrendChart, GroupedDualBarChart, HorizontalValueBars, RankedHorizontalBars, VerticalColumnChart } from "./components/charts/SalesOrderCharts";
import { getSalesOverview } from "./lib/salesOrderService";
import { formatNumber, formatPersen, formatPersenPoin, formatRupiah, formatRupiahRingkas } from "./lib/format";
import type { PlatformSummaryRow, SalesOverviewData } from "./types/salesOrder.types";

export function SalesOverviewPage() {
  const [platform, setPlatform] = useState("Semua");
  const [toko, setToko] = useState("Semua");
  const [produk, setProduk] = useState("Semua");
  const [status, setStatus] = useState("Semua");
  const [metodeBayar, setMetodeBayar] = useState("Semua");

  const [data, setData] = useState<SalesOverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = () => {
    setLoading(true);
    setError(false);
    getSalesOverview({ platform, toko, produk, status, metodeBayar })
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps

  const columns: SalesOrderTableColumn<PlatformSummaryRow>[] = [
    { key: "platform", header: "Platform", render: (r) => <span className="font-bold text-slate-900">{r.platform}</span> },
    { key: "sales", header: "Sales (Rp)", align: "right", render: (r) => <span>{formatRupiahRingkas(r.sales)} <span className="text-emerald-600">▲{formatPersen(r.salesDeltaPct, 1)}</span></span> },
    { key: "order", header: "Order", align: "right", render: (r) => formatNumber(r.order) },
    { key: "qty", header: "Qty Terjual", align: "right", render: (r) => formatNumber(r.qty) },
    { key: "aov", header: "AOV (Rp)", align: "right", render: (r) => formatRupiah(r.aov) },
    { key: "repeatRate", header: "Repeat Rate", align: "right", render: (r) => <span>{formatPersen(r.repeatRate, 1)} <span className="text-emerald-600">{formatPersenPoin(r.repeatDeltaPp, 1)}</span></span> },
    { key: "customerBaru", header: "Customer Baru", align: "right", render: (r) => <span>{formatNumber(r.customerBaru)} <span className="text-emerald-600">▲{formatPersen(r.customerBaruDeltaPct, 1)}</span></span> },
    { key: "customerRepeat", header: "Customer Repeat", align: "right", render: (r) => <span>{formatNumber(r.customerRepeat)} <span className="text-emerald-600">▲{formatPersen(r.customerRepeatDeltaPct, 1)}</span></span> },
    { key: "status", header: "Status", render: (r) => <SalesOrderBadge label={r.status} /> },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#eef2f6]/90 text-brand-deep">
      <main className="mx-auto flex w-full max-w-[1680px] flex-col gap-6 px-5 py-6 sm:px-7 lg:px-10">
        <DummyBanner />

        <SalesOrderPageHeader
          eyebrow="OVERVIEW PENJUALAN" titleRed="Overview" titleDark="Penjualan"
          description="Ringkasan sales, order, customer, AOV, dan tren harian untuk seluruh platform."
          updateInfo={data ? `Update Terakhir: ${data.updateTerakhir}` : undefined}
        />

        {data && (
          <SalesOrderFilterBar
            periodeLabel="12 Mei – 20 Mei 2026"
            selects={[
              { key: "platform", label: "Platform", value: platform, options: data.filters.platform },
              { key: "toko", label: "Toko", value: toko, options: data.filters.toko },
              { key: "produk", label: "Produk", value: produk, options: data.filters.produk },
              { key: "status", label: "Status Pesanan", value: status, options: data.filters.status },
              { key: "metodeBayar", label: "Metode Bayar", value: metodeBayar, options: data.filters.metodeBayar },
            ]}
            onSelectChange={(key, value) => {
              if (key === "platform") setPlatform(value);
              if (key === "toko") setToko(value);
              if (key === "produk") setProduk(value);
              if (key === "status") setStatus(value);
              if (key === "metodeBayar") setMetodeBayar(value);
            }}
            onApply={load}
          />
        )}

        {error && <SalesOrderErrorState />}
        {loading && !data && <SalesOrderKpiSkeleton />}

        {data && (
          <>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-6">
              {data.kpi.map((item) => <SalesOrderKpiCard key={item.label} item={item} />)}
            </div>

            {loading ? <SalesOrderSectionSkeleton /> : (
              <SalesOrderSectionCard title="Tren Penjualan Harian" subtitle="Total Sales (Rp) vs Total Order.">
                <DualLineTrendChart
                  labels={data.trend.map((t) => t.label)}
                  seriesA={{ name: "Total Sales (Rp)", color: "#E30613", points: data.trend.map((t) => t.sales) }}
                  seriesB={{ name: "Total Order", color: "#2563EB", points: data.trend.map((t) => t.order) }}
                  formatA={formatRupiahRingkas} formatB={formatNumber} calloutA
                />
              </SalesOrderSectionCard>
            )}

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              <SalesOrderSectionCard title="Sales per Platform" subtitle="Sales (Rp).">
                <HorizontalValueBars data={data.salesPerPlatform.map((p) => ({ label: p.name, value: p.value }))} formatValue={formatRupiahRingkas} />
              </SalesOrderSectionCard>
              <SalesOrderSectionCard title="Order per Platform" subtitle="Jumlah order.">
                <HorizontalValueBars data={data.orderPerPlatform.map((p) => ({ label: p.name, value: p.value }))} formatValue={formatNumber} color="#2563EB" />
              </SalesOrderSectionCard>
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.3fr_0.85fr_1fr]">
              <SalesOrderSectionCard title="Sales vs Order per Platform" subtitle="Perbandingan nilai sales dan jumlah order.">
                <GroupedDualBarChart data={data.salesVsOrderPerPlatform.map((p) => ({ label: p.name, a: p.sales, b: p.order }))} nameA="Sales (Rp)" nameB="Order" formatA={formatRupiahRingkas} formatB={formatNumber} />
              </SalesOrderSectionCard>
              <SalesOrderSectionCard title="Komposisi Customer" subtitle="Baru, repeat, dan loyal.">
                <DonutWithCenter data={data.customerComposition.map((c) => ({ label: `${c.label}`, value: c.value, color: c.color }))} centerTop={formatNumber(data.totalCustomer)} centerBottom="Customer" formatValue={(v, pct) => `${formatNumber(v)} (${formatPersen(pct * 100, 1)})`} />
              </SalesOrderSectionCard>
              <SalesOrderSectionCard title="Top Produk Singkat" subtitle="Berdasarkan Total Sales (Rp).">
                <RankedHorizontalBars data={data.topProduk.map((p) => ({ rank: p.rank, code: p.code, name: p.name, value: p.sales }))} formatValue={formatRupiahRingkas} />
              </SalesOrderSectionCard>
            </div>

            <SalesOrderSectionCard title="Ringkasan Penjualan per Platform" subtitle="Detail seluruh platform pada periode ini.">
              <SalesOrderTable columns={columns} rows={data.table} rowKey={(r) => r.platform} />
            </SalesOrderSectionCard>
          </>
        )}

        <div className="flex"><SalesOrderBackButton /></div>
      </main>
      <footer className="pb-7 pt-3 text-center text-xs font-medium text-slate-500 sm:text-sm">© 2026 Probetes ERP. All rights reserved.</footer>
    </div>
  );
}
