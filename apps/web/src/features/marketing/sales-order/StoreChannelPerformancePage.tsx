"use client";

import { useEffect, useState } from "react";
import { Store } from "lucide-react";
import { DummyBanner } from "@/features/marketing/components/DummyBanner";
import { SalesOrderPageHeader } from "./components/SalesOrderPageHeader";
import { SalesOrderFilterBar } from "./components/SalesOrderFilterBar";
import { SalesOrderKpiCard } from "./components/SalesOrderKpiCard";
import { SalesOrderSectionCard } from "./components/SalesOrderSectionCard";
import { SalesOrderTable, type SalesOrderTableColumn } from "./components/SalesOrderTable";
import { SalesOrderBadge } from "./components/SalesOrderBadge";
import { SalesOrderBackButton } from "./components/SalesOrderBackButton";
import { SalesOrderErrorState, SalesOrderKpiSkeleton, SalesOrderSectionSkeleton } from "./components/SalesOrderStates";
import { ComboBarLineChart, DonutWithCenter, HorizontalValueBars, TrendLineChart, VerticalColumnChart } from "./components/charts/SalesOrderCharts";
import { getStoreChannelPerformance } from "./lib/salesOrderService";
import { formatNumber, formatPersen, formatRupiah, formatRupiahRingkas } from "./lib/format";
import type { StoreChannelData, StoreChannelRow } from "./types/salesOrder.types";

export function StoreChannelPerformancePage() {
  const [platform, setPlatform] = useState("Semua");
  const [toko, setToko] = useState("Semua");
  const [channel, setChannel] = useState("Semua");
  const [produk, setProduk] = useState("Semua");
  const [status, setStatus] = useState("Semua");

  const [data, setData] = useState<StoreChannelData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = () => {
    setLoading(true);
    setError(false);
    getStoreChannelPerformance({ platform, toko, produk, status })
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps

  const columns: SalesOrderTableColumn<StoreChannelRow>[] = [
    { key: "toko", header: "Toko", render: (r) => <span className="font-bold text-slate-900">{r.toko}</span> },
    { key: "platform", header: "Platform", render: (r) => r.platform },
    { key: "sales", header: "Sales", align: "right", render: (r) => formatRupiah(r.sales) },
    { key: "order", header: "Order", align: "right", render: (r) => formatNumber(r.order) },
    { key: "aov", header: "AOV", align: "right", render: (r) => formatRupiah(r.aov) },
    { key: "produkTerlaris", header: "Produk Terlaris", render: (r) => <span className="text-xs">{r.produkTerlaris}</span> },
    { key: "repeat", header: "Repeat Customer", align: "right", render: (r) => formatPersen(r.repeatCustomer, 1) },
    { key: "status", header: "Status", render: (r) => <SalesOrderBadge label={r.status} tone={r.status === "Aktif" ? "green" : "slate"} /> },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#eef2f6]/90 text-brand-deep">
      <main className="mx-auto flex w-full max-w-[1680px] flex-col gap-6 px-5 py-6 sm:px-7 lg:px-10">
        <DummyBanner />

        <SalesOrderPageHeader
          eyebrow="SALES MODULE" titleRed="Performa" titleDark="Toko & Channel"
          description="Bandingkan performa toko, marketplace, CRM, dan channel dalam satu tampilan komprehensif."
        />

        {data && (
          <SalesOrderFilterBar
            periodeLabel="1 – 18 Mei 2026"
            selects={[
              { key: "platform", label: "Platform", value: platform, options: data.filters.platform },
              { key: "toko", label: "Toko", value: toko, options: data.filters.toko },
              { key: "channel", label: "Channel", value: channel, options: data.filters.channel },
              { key: "produk", label: "Produk", value: produk, options: data.filters.produk },
              { key: "status", label: "Status", value: status, options: data.filters.status },
            ]}
            onSelectChange={(key, value) => {
              if (key === "platform") setPlatform(value);
              if (key === "toko") setToko(value);
              if (key === "channel") setChannel(value);
              if (key === "produk") setProduk(value);
              if (key === "status") setStatus(value);
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

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
              {loading ? <SalesOrderSectionSkeleton /> : (
                <SalesOrderSectionCard title="Kontribusi Sales per Channel" subtitle="Porsi tiap channel dari total penjualan.">
                  <DonutWithCenter data={data.channelDonut} centerTop={formatRupiahRingkas(data.totalChannelSales)} centerBottom="Total" formatValue={(v, pct) => `${formatRupiahRingkas(v)} (${formatPersen(pct * 100, 1)})`} />
                </SalesOrderSectionCard>
              )}
              <SalesOrderSectionCard title="Sales per Toko" subtitle="Rp juta.">
                <VerticalColumnChart data={data.salesPerToko.slice(0, 7).map((t) => ({ label: t.name, value: t.value }))} formatValue={(v) => formatRupiahRingkas(v)} />
              </SalesOrderSectionCard>
              <SalesOrderSectionCard title="Order per Toko" subtitle="Jumlah order.">
                <VerticalColumnChart data={data.orderPerToko.slice(0, 7).map((t) => ({ label: t.name, value: t.value }))} formatValue={formatNumber} color="#2563EB" />
              </SalesOrderSectionCard>
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
              <SalesOrderSectionCard title="Tren Sales per Channel" subtitle="Rp juta, harian.">
                <TrendLineChart
                  labels={data.trendPerChannel.points.map((p) => p.label)}
                  series={Object.entries(data.trendPerChannel.colors).map(([name, color]) => ({ name, color, points: data.trendPerChannel.points.map((p) => p.values[name] ?? 0) }))}
                  formatValue={formatRupiahRingkas}
                />
              </SalesOrderSectionCard>
              <SalesOrderSectionCard title="Distribusi Order per Channel" subtitle="Persentase harian.">
                <TrendLineChart
                  labels={data.distribusiOrderPerChannel.points.map((p) => p.label)}
                  series={Object.entries(data.distribusiOrderPerChannel.colors).map(([name, color]) => ({ name, color, points: data.distribusiOrderPerChannel.points.map((p) => p.values[name] ?? 0) }))}
                  formatValue={(v) => formatPersen(v, 0)}
                />
              </SalesOrderSectionCard>
              <SalesOrderSectionCard title="Sales vs Order per Toko" subtitle="Rp juta vs jumlah order.">
                <ComboBarLineChart data={data.salesVsOrderPerToko.slice(0, 7).map((t) => ({ label: t.name, bar: t.sales, line: t.order }))} barLabel="Sales (Rp)" lineLabel="Order" formatBar={formatRupiahRingkas} formatLine={formatNumber} />
              </SalesOrderSectionCard>
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.3fr_0.9fr]">
              <SalesOrderSectionCard title="Performa Toko & Channel" subtitle="Detail seluruh toko/channel pada periode ini." icon={Store}>
                <SalesOrderTable columns={columns} rows={data.table} rowKey={(r) => r.toko} />
              </SalesOrderSectionCard>
              <SalesOrderSectionCard title="Top Channel" subtitle="Ranking berdasarkan market share.">
                <SalesOrderTable
                  columns={[
                    { key: "rank", header: "#", render: (r) => r.rank },
                    { key: "channel", header: "Channel", render: (r) => <span className="font-bold text-slate-900">{r.channel}</span> },
                    { key: "sales", header: "Sales", align: "right", render: (r) => formatRupiahRingkas(r.sales) },
                    { key: "order", header: "Order", align: "right", render: (r) => formatNumber(r.order) },
                    { key: "share", header: "Market Share", align: "right", render: (r) => formatPersen(r.marketSharePct, 1) },
                  ]}
                  rows={data.topChannel}
                  rowKey={(r) => r.channel}
                />
              </SalesOrderSectionCard>
            </div>
          </>
        )}

        <div className="flex"><SalesOrderBackButton /></div>
      </main>
      <footer className="pb-7 pt-3 text-center text-xs font-medium text-slate-500 sm:text-sm">© 2026 Probetes ERP. All rights reserved.</footer>
    </div>
  );
}
