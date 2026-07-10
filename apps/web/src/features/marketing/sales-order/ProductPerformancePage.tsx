"use client";

import { useEffect, useState } from "react";
import { Lightbulb } from "lucide-react";
import { DummyBanner } from "@/features/marketing/components/DummyBanner";
import { SalesOrderPageHeader } from "./components/SalesOrderPageHeader";
import { SalesOrderFilterBar } from "./components/SalesOrderFilterBar";
import { SalesOrderKpiCard } from "./components/SalesOrderKpiCard";
import { SalesOrderSectionCard } from "./components/SalesOrderSectionCard";
import { SalesOrderTable, type SalesOrderTableColumn } from "./components/SalesOrderTable";
import { SalesOrderBadge } from "./components/SalesOrderBadge";
import { SalesOrderBackButton } from "./components/SalesOrderBackButton";
import { SalesOrderErrorState, SalesOrderKpiSkeleton, SalesOrderSectionSkeleton } from "./components/SalesOrderStates";
import { DonutWithCenter, HeatmapMatrix, RankedHorizontalBars, TrendLineChart, VerticalColumnChart } from "./components/charts/SalesOrderCharts";
import { getProductPerformance } from "./lib/salesOrderService";
import { formatNumber, formatPersen, formatRupiah, formatRupiahRingkas } from "./lib/format";
import type { ProductPerformanceData, ProductRow } from "./types/salesOrder.types";

const KATEGORI_COLOR: Record<string, string> = { "HP/Amandia": "#E30613", Digital: "#7C3AED", "Fisik Lain": "#059669" };

export function ProductPerformancePage() {
  const [platform, setPlatform] = useState("Semua");
  const [toko, setToko] = useState("Semua");
  const [kategori, setKategori] = useState("Semua");
  const [sku, setSku] = useState("Semua");
  const [status, setStatus] = useState("Semua");

  const [data, setData] = useState<ProductPerformanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = () => {
    setLoading(true);
    setError(false);
    getProductPerformance({ platform, toko, kategori, sku, status })
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps

  const columns: SalesOrderTableColumn<ProductRow>[] = [
    { key: "sku", header: "SKU", render: (r) => <span className="font-mono text-xs text-slate-500">{r.sku}</span> },
    { key: "nama", header: "Nama Produk", render: (r) => <span className="font-bold text-slate-900">{r.nama}</span> },
    { key: "kategori", header: "Kategori", render: (r) => r.kategori },
    { key: "sales", header: "Sales (Rp)", align: "right", render: (r) => formatRupiah(r.sales) },
    { key: "share", header: "% Sales", align: "right", render: (r) => formatPersen(r.sharePct, 1) },
    { key: "qty", header: "Qty Terjual", align: "right", render: (r) => formatNumber(r.qty) },
    { key: "order", header: "Order", align: "right", render: (r) => formatNumber(r.order) },
    { key: "retur", header: "Retur", align: "right", render: (r) => formatNumber(r.retur) },
    { key: "returRate", header: "Retur Rate", align: "right", render: (r) => formatPersen(r.returRate, 2) },
    { key: "margin", header: "Margin (Rp)", align: "right", render: (r) => formatRupiah(r.margin) },
    { key: "marginPct", header: "Margin %", align: "right", render: (r) => formatPersen(r.marginPct, 0) },
    { key: "status", header: "Status", render: (r) => <SalesOrderBadge label={r.status} /> },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#eef2f6]/90 text-brand-deep">
      <main className="mx-auto flex w-full max-w-[1680px] flex-col gap-6 px-5 py-6 sm:px-7 lg:px-10">
        <DummyBanner />

        <SalesOrderPageHeader
          eyebrow="SALES MODULE" titleRed="Performa" titleDark="Produk"
          description="Pantau performa produk terlaris, kontribusi sales, SKU, return rate, dan tren penjualan produk."
        />

        {data && (
          <SalesOrderFilterBar
            periodeLabel="01 – 18 Mei 2026"
            selects={[
              { key: "platform", label: "Platform", value: platform, options: data.filters.platform },
              { key: "toko", label: "Toko", value: toko, options: data.filters.toko },
              { key: "kategori", label: "Kategori Produk", value: kategori, options: data.filters.kategori },
              { key: "sku", label: "SKU", value: sku, options: data.filters.sku },
              { key: "status", label: "Status", value: status, options: data.filters.status },
            ]}
            onSelectChange={(key, value) => {
              if (key === "platform") setPlatform(value);
              if (key === "toko") setToko(value);
              if (key === "kategori") setKategori(value);
              if (key === "sku") setSku(value);
              if (key === "status") setStatus(value);
            }}
            onApply={load}
            onReset={() => { setPlatform("Semua"); setToko("Semua"); setKategori("Semua"); setSku("Semua"); setStatus("Semua"); load(); }}
          />
        )}

        {error && <SalesOrderErrorState />}
        {loading && !data && <SalesOrderKpiSkeleton />}

        {data && (
          <>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-6">
              {data.kpi.map((item) => <SalesOrderKpiCard key={item.label} item={item} />)}
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_1fr_1.1fr]">
              {loading ? <SalesOrderSectionSkeleton /> : (
                <SalesOrderSectionCard title="Top 10 Produk by Sales" subtitle="Berdasarkan nilai penjualan.">
                  <RankedHorizontalBars data={data.topBySales.map((p, i) => ({ rank: i + 1, code: p.code, name: p.name, value: p.value }))} formatValue={formatRupiahRingkas} />
                </SalesOrderSectionCard>
              )}
              <SalesOrderSectionCard title="Top 10 Produk by Qty" subtitle="Berdasarkan jumlah terjual.">
                <VerticalColumnChart data={data.topByQty.slice(0, 6).map((p) => ({ label: p.code ?? p.name, value: p.value }))} formatValue={formatNumber} />
              </SalesOrderSectionCard>
              <SalesOrderSectionCard title="Tren Sales Produk Utama" subtitle="4 produk kontributor terbesar.">
                <TrendLineChart
                  labels={data.trendProdukUtama.points.map((p) => p.label)}
                  series={Object.entries(data.trendProdukUtama.colors).map(([name, color]) => ({ name, color, points: data.trendProdukUtama.points.map((p) => p.values[name] ?? 0) }))}
                  formatValue={formatRupiahRingkas}
                />
              </SalesOrderSectionCard>
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.9fr_1.1fr_0.85fr]">
              <SalesOrderSectionCard title="Kontribusi Sales per Kategori" subtitle="Digital, HP/Amandia, dan Fisik Lain.">
                <DonutWithCenter data={data.kategoriDonut.map((k) => ({ label: k.label, value: k.sales, color: KATEGORI_COLOR[k.label] ?? k.color }))} centerTop={formatRupiahRingkas(data.totalSalesKategori)} centerBottom="Total Sales" formatValue={(v, pct) => `${formatPersen(pct * 100, 1)} · ${formatRupiahRingkas(v)}`} />
              </SalesOrderSectionCard>
              <SalesOrderSectionCard title="Produk dengan Retur Tertinggi" subtitle="Perlu dicek kualitas atau pengiriman.">
                <SalesOrderTable
                  columns={[
                    { key: "sku", header: "SKU", render: (r) => r.sku },
                    { key: "nama", header: "Nama Produk", render: (r) => r.nama },
                    { key: "retur", header: "Retur", align: "right", render: (r) => r.retur },
                    { key: "rate", header: "Retur Rate", align: "right", render: (r) => formatPersen(r.returRate, 2) },
                  ]}
                  rows={data.returTertinggi}
                  rowKey={(r) => r.sku}
                />
              </SalesOrderSectionCard>
              <SalesOrderSectionCard title="Fast Moving vs Slow Moving" subtitle="Matrix qty terjual berdasarkan nilai sales.">
                <HeatmapMatrix rows={data.movingMatrix.rows} columns={data.movingMatrix.columns} />
                <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs font-bold text-slate-500">
                  <div className="rounded-xl bg-slate-50 p-2"><p className="text-lg font-black text-slate-900">{data.movingMatrix.totals.skuTotal}</p>Total SKU</div>
                  <div className="rounded-xl bg-slate-50 p-2"><p className="text-lg font-black text-slate-900">{data.movingMatrix.totals.sedang}</p>Qty Sedang</div>
                  <div className="rounded-xl bg-slate-50 p-2"><p className="text-lg font-black text-slate-900">{data.movingMatrix.totals.rendah}</p>Qty Rendah</div>
                </div>
              </SalesOrderSectionCard>
            </div>

            <SalesOrderSectionCard title="Ringkasan Insight" subtitle="Insight otomatis dari data produk periode ini." icon={Lightbulb} iconTone="amber">
              <ul className="space-y-2">
                {data.insights.map((insight) => (
                  <li key={insight} className="flex items-start gap-2 text-sm font-medium text-slate-700">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand-red" />
                    {insight}
                  </li>
                ))}
              </ul>
            </SalesOrderSectionCard>

            <SalesOrderSectionCard title="Daftar Produk" subtitle="Detail seluruh produk pada periode & filter ini.">
              <SalesOrderTable columns={columns} rows={data.table} rowKey={(r) => r.sku} />
            </SalesOrderSectionCard>
          </>
        )}

        <div className="flex"><SalesOrderBackButton /></div>
      </main>
      <footer className="pb-7 pt-3 text-center text-xs font-medium text-slate-500 sm:text-sm">© 2026 Probetes ERP. All rights reserved.</footer>
    </div>
  );
}
