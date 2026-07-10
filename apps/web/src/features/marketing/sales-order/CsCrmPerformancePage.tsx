"use client";

import { useEffect, useState } from "react";
import { Award, RefreshCw, TriangleAlert } from "lucide-react";
import { DummyBanner } from "@/features/marketing/components/DummyBanner";
import { SalesOrderPageHeader } from "./components/SalesOrderPageHeader";
import { SalesOrderFilterBar } from "./components/SalesOrderFilterBar";
import { SalesOrderKpiCard } from "./components/SalesOrderKpiCard";
import { SalesOrderSectionCard } from "./components/SalesOrderSectionCard";
import { SalesOrderTable, type SalesOrderTableColumn } from "./components/SalesOrderTable";
import { SalesOrderBadge } from "./components/SalesOrderBadge";
import { SalesOrderBackButton } from "./components/SalesOrderBackButton";
import { SalesOrderErrorState, SalesOrderKpiSkeleton, SalesOrderSectionSkeleton } from "./components/SalesOrderStates";
import { DonutWithCenter, RankedHorizontalBars, TrendLineChart, VerticalColumnChart } from "./components/charts/SalesOrderCharts";
import { getCsCrmPerformance } from "./lib/salesOrderService";
import { formatNumber, formatPersen, formatRupiah, formatRupiahRingkas } from "./lib/format";
import type { CsCrmData, CsCrmRow } from "./types/salesOrder.types";

export function CsCrmPerformancePage() {
  const [divisi, setDivisi] = useState("Semua");
  const [cs, setCs] = useState("Semua");
  const [platform, setPlatform] = useState("Semua");
  const [toko, setToko] = useState("Semua");
  const [segmen, setSegmen] = useState("Semua");

  const [data, setData] = useState<CsCrmData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = () => {
    setLoading(true);
    setError(false);
    getCsCrmPerformance({ divisi, cs, platform, toko, segmen })
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps

  const columns: SalesOrderTableColumn<CsCrmRow>[] = [
    { key: "nama", header: "Nama User", render: (r) => <span className="font-bold text-slate-900">{r.nama}</span> },
    { key: "divisi", header: "Divisi", render: (r) => r.divisi },
    { key: "sales", header: "Sales (Rp)", align: "right", render: (r) => formatRupiah(r.sales) },
    { key: "order", header: "Order", align: "right", render: (r) => formatNumber(r.order) },
    { key: "baru", header: "Customer Baru", align: "right", render: (r) => formatNumber(r.customerBaru) },
    { key: "repeat", header: "Repeat Order", align: "right", render: (r) => formatPersen((r.repeatOrder / Math.max(1, r.order)) * 100, 1) },
    { key: "aov", header: "AOV (Rp)", align: "right", render: (r) => formatRupiah(r.aov) },
    { key: "followUp", header: "Follow-up Success Rate", align: "right", render: (r) => formatPersen(r.followUpSuccessRate, 1) },
    { key: "status", header: "Status", render: (r) => <SalesOrderBadge label={r.status} /> },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#eef2f6]/90 text-brand-deep">
      <main className="mx-auto flex w-full max-w-[1680px] flex-col gap-6 px-5 py-6 sm:px-7 lg:px-10">
        <DummyBanner />

        <SalesOrderPageHeader
          eyebrow="SALES MODULE" titleRed="Performa" titleDark="CS / CRM"
          description="Pantau sales per user, repeat order, customer baru, dan aktivitas CRM."
          breadcrumb="Performa CS / CRM"
          updateInfo={data ? "Data per 18 Mei 2026 23:59 WIB" : undefined}
        />

        {data && (
          <SalesOrderFilterBar
            periodeLabel="01–18 Mei 2026"
            selects={[
              { key: "divisi", label: "Divisi", value: divisi, options: data.filters.divisi },
              { key: "cs", label: "CS / CRM", value: cs, options: data.filters.cs },
              { key: "platform", label: "Platform", value: platform, options: data.filters.platform },
              { key: "toko", label: "Toko", value: toko, options: data.filters.toko },
              { key: "segmen", label: "Segmen Customer", value: segmen, options: data.filters.segmen },
            ]}
            onSelectChange={(key, value) => {
              if (key === "divisi") setDivisi(value);
              if (key === "cs") setCs(value);
              if (key === "platform") setPlatform(value);
              if (key === "toko") setToko(value);
              if (key === "segmen") setSegmen(value);
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

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-4">
              {loading ? <SalesOrderSectionSkeleton /> : (
                <SalesOrderSectionCard title="Sales per Tim" subtitle="Rp juta.">
                  <VerticalColumnChart data={data.salesPerTim.map((t) => ({ label: t.name, value: t.value }))} formatValue={formatRupiahRingkas} />
                </SalesOrderSectionCard>
              )}
              <SalesOrderSectionCard title="Top 10 CS/CRM by Sales" subtitle="Rp juta." className="xl:col-span-2">
                <RankedHorizontalBars data={data.topCsBySales.map((c) => ({ rank: c.rank, name: c.name, value: c.sales }))} formatValue={formatRupiahRingkas} />
              </SalesOrderSectionCard>
              <SalesOrderSectionCard title="Komposisi Customer Baru vs Repeat">
                <DonutWithCenter data={data.komposisiCustomer} centerTop={formatNumber(data.totalCustomer)} centerBottom="Total Customer" formatValue={(v, pct) => `${formatPersen(pct * 100, 1)} · ${formatNumber(v)}`} />
              </SalesOrderSectionCard>
            </div>

            <SalesOrderSectionCard
              title="Tren Follow-up dan Closing" subtitle="Jumlah aktivitas harian."
              action={
                <div className="flex gap-2">
                  <span className="rounded-lg bg-red-50 px-2.5 py-1 text-xs font-bold text-brand-red">Follow-up {data.followUpBadge.followUp}</span>
                  <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">Closing {data.followUpBadge.closing}</span>
                </div>
              }
            >
              <TrendLineChart
                labels={data.followUpTrend.map((f) => f.label)}
                series={[
                  { name: "Follow-up", color: "#E30613", points: data.followUpTrend.map((f) => f.followUp) },
                  { name: "Closing", color: "#059669", points: data.followUpTrend.map((f) => f.closing) },
                ]}
              />
            </SalesOrderSectionCard>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_0.9fr_0.9fr_1.1fr]">
              <SalesOrderSectionCard title="Order Baru vs Repeat per Tim" subtitle="Perbandingan tiap divisi.">
                <VerticalColumnChart data={data.orderBaruVsRepeat.map((o) => ({ label: o.name, value: o.baru }))} formatValue={formatNumber} />
              </SalesOrderSectionCard>
              <SalesOrderSectionCard title="Top Performer" icon={Award} iconTone="green">
                <SalesOrderTable
                  columns={[
                    { key: "rank", header: "#", render: (r) => r.rank },
                    { key: "name", header: "Nama", render: (r) => <span className="font-bold">{r.name}</span> },
                    { key: "sales", header: "Sales", align: "right", render: (r) => formatRupiahRingkas(r.sales) },
                  ]}
                  rows={data.topPerformer}
                  rowKey={(r) => r.name}
                />
                <div className="mt-3 grid grid-cols-2 gap-2 rounded-xl bg-emerald-50 p-3 text-center">
                  <div><p className="text-xs font-semibold text-emerald-700">Total Sales Top 3</p><p className="text-sm font-black text-emerald-800">{formatRupiahRingkas(data.topPerformerFooter.totalSales)}</p></div>
                  <div><p className="text-xs font-semibold text-emerald-700">Kontribusi</p><p className="text-sm font-black text-emerald-800">{formatPersen(data.topPerformerFooter.kontribusiPct, 1)}</p></div>
                </div>
              </SalesOrderSectionCard>
              <SalesOrderSectionCard title="Perlu Evaluasi" icon={TriangleAlert} iconTone="amber">
                <SalesOrderTable
                  columns={[
                    { key: "rank", header: "#", render: (r) => r.rank },
                    { key: "name", header: "Nama", render: (r) => <span className="font-bold">{r.name}</span> },
                    { key: "sales", header: "Sales", align: "right", render: (r) => formatRupiahRingkas(r.sales) },
                  ]}
                  rows={data.perluEvaluasi}
                  rowKey={(r) => r.name}
                />
                <div className="mt-3 grid grid-cols-2 gap-2 rounded-xl bg-amber-50 p-3 text-center">
                  <div><p className="text-xs font-semibold text-amber-700">Total Sales Bottom 3</p><p className="text-sm font-black text-amber-800">{formatRupiahRingkas(data.perluEvaluasiFooter.totalSales)}</p></div>
                  <div><p className="text-xs font-semibold text-amber-700">Kontribusi</p><p className="text-sm font-black text-amber-800">{formatPersen(data.perluEvaluasiFooter.kontribusiPct, 1)}</p></div>
                </div>
              </SalesOrderSectionCard>
              <SalesOrderSectionCard title="Statistik Follow-up" icon={RefreshCw}>
                <div className="grid grid-cols-2 gap-3">
                  {data.followUpStats.map((s) => (
                    <div key={s.label} className="rounded-xl bg-slate-50 p-3">
                      <p className="text-[11px] font-semibold text-slate-500">{s.label}</p>
                      <p className="text-base font-black text-slate-900">{s.value}</p>
                      {s.deltaPct !== undefined && <p className={`text-[11px] font-bold ${s.deltaPct >= 0 ? "text-emerald-600" : "text-red-600"}`}>{s.deltaPct >= 0 ? "▲" : "▼"} {formatPersen(Math.abs(s.deltaPct), 1)}</p>}
                    </div>
                  ))}
                </div>
              </SalesOrderSectionCard>
            </div>

            <SalesOrderSectionCard title="Performa CS / CRM" subtitle={`Menampilkan ${Math.min(data.pageSize, data.table.length)} dari ${data.totalRows} data.`}>
              <SalesOrderTable columns={columns} rows={data.table.slice(0, data.pageSize)} rowKey={(r) => r.nama} />
            </SalesOrderSectionCard>
          </>
        )}

        <div className="flex"><SalesOrderBackButton /></div>
      </main>
      <footer className="pb-7 pt-3 text-center text-xs font-medium text-slate-500 sm:text-sm">© 2026 Probetes ERP. All rights reserved.</footer>
    </div>
  );
}
