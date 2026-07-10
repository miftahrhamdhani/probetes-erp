"use client";

import { useEffect, useState } from "react";
import { ChevronRight, Info, ShieldAlert, TriangleAlert } from "lucide-react";
import { DummyBanner } from "@/features/marketing/components/DummyBanner";
import { SalesOrderPageHeader } from "./components/SalesOrderPageHeader";
import { SalesOrderFilterBar } from "./components/SalesOrderFilterBar";
import { SalesOrderKpiCard } from "./components/SalesOrderKpiCard";
import { SalesOrderSectionCard } from "./components/SalesOrderSectionCard";
import { SalesOrderTable, type SalesOrderTableColumn } from "./components/SalesOrderTable";
import { SalesOrderBadge } from "./components/SalesOrderBadge";
import { SalesOrderBackButton } from "./components/SalesOrderBackButton";
import { SalesOrderErrorState, SalesOrderKpiSkeleton, SalesOrderSectionSkeleton } from "./components/SalesOrderStates";
import { DonutWithCenter, HorizontalValueBars, StackedPercentBarChart, TrendLineChart, VerticalColumnChart } from "./components/charts/SalesOrderCharts";
import { getOrderStatusCod } from "./lib/salesOrderService";
import { formatNumber, formatPersen, formatRupiah, formatRupiahRingkas } from "./lib/format";
import type { OrderStatusData, OrderStatusRow } from "./types/salesOrder.types";

const ALERT_ICON = { info: Info, warning: TriangleAlert, critical: ShieldAlert };
const ALERT_TONE = { info: "border-blue-100 bg-blue-50 text-blue-700", warning: "border-amber-100 bg-amber-50 text-amber-700", critical: "border-red-100 bg-red-50 text-red-700" };
const SLA_TONE: Record<string, "green" | "amber" | "red"> = { Aman: "green", Perhatian: "amber", Berisiko: "red" };

export function OrderStatusCodPage() {
  const [platform, setPlatform] = useState("Semua");
  const [toko, setToko] = useState("Semua");
  const [status, setStatus] = useState("Semua");
  const [ekspedisi, setEkspedisi] = useState("Semua");
  const [metodeBayar, setMetodeBayar] = useState("Semua");

  const [data, setData] = useState<OrderStatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = () => {
    setLoading(true);
    setError(false);
    getOrderStatusCod({ platform, toko, status, ekspedisi, metodeBayar })
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps

  const columns: SalesOrderTableColumn<OrderStatusRow>[] = [
    { key: "status", header: "Status", render: (r) => <span className="inline-flex items-center gap-2 font-bold text-slate-900"><span className="size-2.5 rounded-full" style={{ backgroundColor: r.color }} />{r.status}</span> },
    { key: "jumlah", header: "Jumlah Order", align: "right", render: (r) => formatNumber(r.jumlahOrder) },
    { key: "nilai", header: "Nilai Sales", align: "right", render: (r) => formatRupiah(r.nilaiSales) },
    { key: "cod", header: "COD", align: "right", render: (r) => formatRupiah(r.cod) },
    { key: "persen", header: "Persentase", align: "right", render: (r) => formatPersen(r.persentase, 1) },
    { key: "sla", header: "SLA", render: (r) => <div><SalesOrderBadge label={r.sla.label} tone={SLA_TONE[r.sla.label]} /><p className="mt-1 text-[11px] font-semibold text-slate-400">{r.sla.detail}</p></div> },
    { key: "review", header: "Status Review", render: (r) => <span className="inline-flex items-center gap-1 text-sm font-bold text-slate-700">{r.statusReview.label} <ChevronRight className="size-3.5 text-slate-300" /></span> },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#eef2f6]/90 text-brand-deep">
      <main className="mx-auto flex w-full max-w-[1680px] flex-col gap-6 px-5 py-6 sm:px-7 lg:px-10">
        <DummyBanner />

        <SalesOrderPageHeader
          eyebrow="SALES & ORDER CENTER · PAGE 6" titleRed="Status" titleDark="Pesanan & COD"
          description="Pantau status order dari sukses hingga pengiriman, COD belum cair, dan status operasional untuk memastikan performa transaksi optimal."
        />

        {data && (
          <SalesOrderFilterBar
            periodeLabel="12 – 18 Mei 2026"
            selects={[
              { key: "platform", label: "Platform", value: platform, options: data.filters.platform },
              { key: "toko", label: "Toko", value: toko, options: data.filters.toko },
              { key: "status", label: "Status Pesanan", value: status, options: data.filters.status },
              { key: "ekspedisi", label: "Ekspedisi", value: ekspedisi, options: data.filters.ekspedisi },
              { key: "metodeBayar", label: "Metode Bayar", value: metodeBayar, options: data.filters.metodeBayar },
            ]}
            onSelectChange={(key, value) => {
              if (key === "platform") setPlatform(value);
              if (key === "toko") setToko(value);
              if (key === "status") setStatus(value);
              if (key === "ekspedisi") setEkspedisi(value);
              if (key === "metodeBayar") setMetodeBayar(value);
            }}
            onApply={load}
            onReset={() => { setPlatform("Semua"); setToko("Semua"); setStatus("Semua"); setEkspedisi("Semua"); setMetodeBayar("Semua"); load(); }}
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
                <SalesOrderSectionCard title="Komposisi Status Pesanan">
                  <DonutWithCenter data={data.statusDonut} centerTop={formatNumber(data.totalOrder)} centerBottom="Total Order" formatValue={(v, pct) => `${formatNumber(v)} (${formatPersen(pct * 100, 1)})`} />
                </SalesOrderSectionCard>
              )}
              <SalesOrderSectionCard title="Jumlah Order per Status">
                <VerticalColumnChart data={data.orderPerStatus.map((s) => ({ label: s.label, value: s.value, color: s.color }))} formatValue={formatNumber} />
              </SalesOrderSectionCard>
              <SalesOrderSectionCard title="Tren COD Belum Cair" subtitle="Jumlah order.">
                <TrendLineChart labels={data.trendCodBelumCair.map((t) => t.label)} series={[{ name: "COD Belum Cair (Jumlah Order)", color: "#7C3AED", points: data.trendCodBelumCair.map((t) => t.value) }]} formatValue={formatNumber} showCallouts />
              </SalesOrderSectionCard>
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.9fr_1.1fr_1fr]">
              <SalesOrderSectionCard title="Status per Ekspedisi" subtitle="Jumlah order tiap ekspedisi.">
                <HorizontalValueBars data={data.statusPerEkspedisi.map((e) => ({ label: e.name, value: e.value }))} formatValue={formatNumber} />
              </SalesOrderSectionCard>
              <SalesOrderSectionCard title="Progress Pengiriman Harian" subtitle="Sukses, on delivery, pending, gagal/retur.">
                <StackedPercentBarChart
                  data={data.progressHarian.map((p) => ({
                    label: p.label,
                    segments: [
                      { name: "Sukses", value: p.sukses, color: "#059669" },
                      { name: "On Delivery", value: p.onDelivery, color: "#2563EB" },
                      { name: "Pending", value: p.pending, color: "#F59E0B" },
                      { name: "Gagal / Retur", value: p.gagal, color: "#E30613" },
                    ],
                  }))}
                />
              </SalesOrderSectionCard>
              <SalesOrderSectionCard title="Status Operasional Perlu Perhatian" icon={TriangleAlert} iconTone="amber" subtitle={`Terakhir diperbarui: ${data.lastUpdated}`}>
                <div className="space-y-3">
                  {data.alerts.map((alert) => {
                    const Icon = ALERT_ICON[alert.level];
                    return (
                      <div key={alert.title} className={`flex items-start gap-3 rounded-2xl border p-3.5 ${ALERT_TONE[alert.level]}`}>
                        <Icon className="mt-0.5 size-4.5 shrink-0" strokeWidth={2} />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold">{alert.title}</p>
                          <p className="mt-0.5 text-xs font-medium opacity-90">{alert.detail}</p>
                        </div>
                        <ChevronRight className="mt-0.5 size-4 shrink-0 opacity-60" />
                      </div>
                    );
                  })}
                </div>
              </SalesOrderSectionCard>
            </div>

            <SalesOrderSectionCard title="Status Pesanan" subtitle="Detail seluruh status pesanan pada periode & filter ini.">
              <SalesOrderTable columns={columns} rows={data.table} rowKey={(r) => r.status} />
            </SalesOrderSectionCard>
          </>
        )}

        <div className="flex"><SalesOrderBackButton /></div>
      </main>
      <footer className="pb-7 pt-3 text-center text-xs font-medium text-slate-500 sm:text-sm">© 2026 Probetes ERP. All rights reserved.</footer>
    </div>
  );
}
