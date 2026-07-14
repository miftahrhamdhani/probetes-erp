"use client";

import { useCallback, useEffect, useState } from "react";
import { MarketingBackButton } from "@/features/marketing/components/MarketingBackButton";
import { DisabledMetricCard } from "@/features/marketing/components/availability/DisabledMetricCard";
import { DateRangePicker } from "@/features/marketing/components/daterange/DateRangePicker";
import { useDateRangeQuery } from "@/features/marketing/components/daterange/useDateRangeQuery";
import { SalesOrderPageHeader } from "./components/SalesOrderPageHeader";
import { SalesOrderFilterBar } from "./components/SalesOrderFilterBar";
import { SalesOrderKpiCard } from "./components/SalesOrderKpiCard";
import { SalesOrderSectionCard } from "./components/SalesOrderSectionCard";
import { SalesOrderTable, type SalesOrderTableColumn } from "./components/SalesOrderTable";
import { SalesOrderBadge } from "./components/SalesOrderBadge";
import { SalesOrderErrorState, SalesOrderKpiSkeleton, SalesOrderSectionSkeleton } from "./components/SalesOrderStates";
import { DonutWithCenter, DualLineTrendChart, GroupedDualBarChart, HorizontalValueBars, RankedHorizontalBars } from "./components/charts/SalesOrderCharts";
import { getSalesOverview } from "./lib/salesOrderService";
import { formatNumber, formatRupiah, formatRupiahRingkas } from "./lib/format";
import type { PlatformSummaryRow, SalesOverviewData } from "./types/salesOrder.types";

export function SalesOverviewPage() {
  const { range, setRange } = useDateRangeQuery();
  const [platform, setPlatform] = useState("Semua");
  const [toko, setToko] = useState("Semua");
  const [produk, setProduk] = useState("Semua");
  const [status, setStatus] = useState("Semua");
  const [metodeBayar, setMetodeBayar] = useState("Semua");
  const [data, setData] = useState<SalesOverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true); setError(null);
    getSalesOverview({ startDate: range.startDate, endDate: range.endDate, channelId: platform === "Semua" ? undefined : platform, productId: produk === "Semua" ? undefined : produk })
      .then(setData).catch((cause) => setError(cause instanceof Error ? cause.message : "Gagal memuat data penjualan."))
      .finally(() => setLoading(false));
  }, [platform, produk, range.endDate, range.startDate]);

  useEffect(() => { void load(); }, [load]);

  const columns: SalesOrderTableColumn<PlatformSummaryRow>[] = [
    { key: "platform", header: "Channel", render: (row) => <span className="font-bold text-slate-900">{row.platform}</span> },
    { key: "sales", header: "Pendapatan", align: "right", render: (row) => formatRupiahRingkas(row.sales) },
    { key: "order", header: "Pesanan", align: "right", render: (row) => formatNumber(row.order) },
    { key: "qty", header: "Qty Terjual", align: "right", render: (row) => formatNumber(row.qty) },
    { key: "aov", header: "Rata-rata", align: "right", render: (row) => formatRupiah(row.aov) },
    { key: "repeatRate", header: "Repeat Rate", align: "right", render: () => "—" },
    { key: "customerBaru", header: "Customer Baru", align: "right", render: () => "—" },
    { key: "customerRepeat", header: "Customer Repeat", align: "right", render: () => "—" },
    { key: "status", header: "Status", render: (row) => <SalesOrderBadge label={row.status} /> },
  ];

  return <div className="min-h-screen overflow-x-hidden bg-[#eef2f6]/90 text-brand-deep"><main className="mx-auto flex w-full max-w-[1680px] flex-col gap-6 px-5 py-6 sm:px-7 lg:px-10">
    <SalesOrderPageHeader eyebrow="OVERVIEW PENJUALAN" titleRed="Overview" titleDark="Penjualan" description="Ringkasan sales, order, customer, AOV, dan tren harian untuk seluruh channel." updateInfo={data ? "Data database ERP" : undefined} />
    <DateRangePicker value={range} onChange={setRange} />
    {data && <SalesOrderFilterBar periodeLabel={`${range.startDate} – ${range.endDate}`} selects={[
      { key: "platform", label: "Channel", value: platform, options: data.filters.platform }, { key: "toko", label: "Toko", value: toko, options: data.filters.toko },
      { key: "produk", label: "Produk", value: produk, options: data.filters.produk }, { key: "status", label: "Status Pesanan", value: status, options: data.filters.status }, { key: "metodeBayar", label: "Metode Bayar", value: metodeBayar, options: data.filters.metodeBayar },
    ]} onSelectChange={(key, value) => { if (key === "platform") setPlatform(value); if (key === "toko") setToko(value); if (key === "produk") setProduk(value); if (key === "status") setStatus(value); if (key === "metodeBayar") setMetodeBayar(value); }} onApply={load} />}
    {error && <SalesOrderErrorState message={error} />}
    {loading && !data && <SalesOrderKpiSkeleton />}
    {data && <>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-6">{data.kpi.map((item) => <SalesOrderKpiCard key={item.label} item={item} />)}</div>
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-4"><DisabledMetricCard label="Pesanan Dibayar" reason="payment_status belum tersedia." /><DisabledMetricCard label="Cancel Rate" reason="Nilai cancelled tidak tersedia konsisten." /><DisabledMetricCard label="Net Revenue" reason="Finance masih parsial." /><DisabledMetricCard label="Margin" reason="Finance masih parsial." /></div>
      {loading ? <SalesOrderSectionSkeleton /> : <SalesOrderSectionCard title="Tren Penjualan Harian" subtitle="Total pendapatan vs total pesanan."><DualLineTrendChart labels={data.trend.map((row) => row.label)} seriesA={{ name: "Total Pendapatan", color: "#E30613", points: data.trend.map((row) => row.sales) }} seriesB={{ name: "Total Pesanan", color: "#2563EB", points: data.trend.map((row) => row.order) }} formatA={formatRupiahRingkas} formatB={formatNumber} calloutA /></SalesOrderSectionCard>}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2"><SalesOrderSectionCard title="Pendapatan per Channel" subtitle="Pendapatan pesanan valid."><HorizontalValueBars data={data.salesPerPlatform.map((row) => ({ label: row.name, value: row.value }))} formatValue={formatRupiahRingkas} /></SalesOrderSectionCard><SalesOrderSectionCard title="Pesanan per Channel" subtitle="Jumlah pesanan valid."><HorizontalValueBars data={data.orderPerPlatform.map((row) => ({ label: row.name, value: row.value }))} formatValue={formatNumber} color="#2563EB" /></SalesOrderSectionCard></div>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.3fr_0.85fr_1fr]"><SalesOrderSectionCard title="Pendapatan vs Pesanan per Channel" subtitle="Perbandingan nilai dan jumlah pesanan."><GroupedDualBarChart data={data.salesVsOrderPerPlatform.map((row) => ({ label: row.name, a: row.sales, b: row.order }))} nameA="Pendapatan" nameB="Pesanan" formatA={formatRupiahRingkas} formatB={formatNumber} /></SalesOrderSectionCard><SalesOrderSectionCard title="Komposisi Customer" subtitle="Pelanggan unik pada periode ini."><DonutWithCenter data={data.customerComposition.map((row) => ({ label: row.label, value: row.value, color: row.color }))} centerTop={formatNumber(data.totalCustomer)} centerBottom="Pelanggan" /></SalesOrderSectionCard><SalesOrderSectionCard title="Top Produk Singkat" subtitle="Berdasarkan pendapatan item pesanan."><RankedHorizontalBars data={data.topProduk.map((row) => ({ rank: row.rank, code: row.code, name: row.name, value: row.sales }))} formatValue={formatRupiahRingkas} /></SalesOrderSectionCard></div>
      <SalesOrderSectionCard title="Ringkasan Penjualan per Channel" subtitle="Detail channel pada periode ini."><SalesOrderTable columns={columns} rows={data.table} rowKey={(row) => row.platform} /></SalesOrderSectionCard>
    </>}
    <div className="flex"><MarketingBackButton /></div>
  </main><footer className="pb-7 pt-3 text-center text-xs font-medium text-slate-500 sm:text-sm">© 2026 Probetes ERP. All rights reserved.</footer></div>;
}
