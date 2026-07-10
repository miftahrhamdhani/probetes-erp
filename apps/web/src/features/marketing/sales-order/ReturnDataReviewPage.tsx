"use client";

import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { DummyBanner } from "@/features/marketing/components/DummyBanner";
import { SalesOrderPageHeader } from "./components/SalesOrderPageHeader";
import { SalesOrderFilterBar } from "./components/SalesOrderFilterBar";
import { SalesOrderKpiCard } from "./components/SalesOrderKpiCard";
import { SalesOrderSectionCard } from "./components/SalesOrderSectionCard";
import { SalesOrderTable, type SalesOrderTableColumn } from "./components/SalesOrderTable";
import { SalesOrderBadge } from "./components/SalesOrderBadge";
import { SalesOrderBackButton } from "./components/SalesOrderBackButton";
import { SalesOrderErrorState, SalesOrderKpiSkeleton, SalesOrderSectionSkeleton } from "./components/SalesOrderStates";
import { ComboBarLineChart, DonutWithCenter, HorizontalValueBars, TrendLineChart } from "./components/charts/SalesOrderCharts";
import { getReturnDataReview } from "./lib/salesOrderService";
import { formatNumber, formatPersen, formatRupiahRingkas } from "./lib/format";
import type { DataReviewIssue, ReturnDataReviewData } from "./types/salesOrder.types";

const PRIORITY_TONE: Record<DataReviewIssue["prioritas"], "red" | "amber" | "slate"> = { Tinggi: "red", Sedang: "amber", Rendah: "slate" };

export function ReturnDataReviewPage() {
  const [platform, setPlatform] = useState("Semua");
  const [toko, setToko] = useState("Semua");
  const [produk, setProduk] = useState("Semua");
  const [ekspedisi, setEkspedisi] = useState("Semua");
  const [issueType, setIssueType] = useState("Semua");

  const [data, setData] = useState<ReturnDataReviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = () => {
    setLoading(true);
    setError(false);
    getReturnDataReview({ platform, toko, produk, ekspedisi, issueType })
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps

  const columns: SalesOrderTableColumn<DataReviewIssue>[] = [
    { key: "tipe", header: "Tipe Data", render: (r) => r.tipeData },
    { key: "masalah", header: "Masalah", render: (r) => <span className="font-bold text-slate-900">{r.masalah}</span> },
    { key: "jumlah", header: "Jumlah", align: "right", render: (r) => formatNumber(r.jumlah) },
    { key: "dampak", header: "Dampak", render: (r) => <span className="text-xs">{r.dampak}</span> },
    { key: "prioritas", header: "Prioritas", render: (r) => <SalesOrderBadge label={r.prioritas} tone={PRIORITY_TONE[r.prioritas]} /> },
    { key: "aksi", header: "Rekomendasi Aksi", render: (r) => <span className="text-xs">{r.rekomendasiAksi}</span> },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#eef2f6]/90 text-brand-deep">
      <main className="mx-auto flex w-full max-w-[1680px] flex-col gap-6 px-5 py-6 sm:px-7 lg:px-10">
        <DummyBanner />

        <div className="flex items-start justify-between gap-3">
          <SalesOrderPageHeader
            eyebrow="SALES MODULE" titleRed="Retur &" titleDark="Data Review"
            description="Pantau retur, gagal kirim, kualitas data, dan issue operasional yang perlu tindak lanjut."
          />
          <div className="hidden shrink-0 items-center gap-2 sm:flex">
            <SalesOrderBackButton label="Kembali ke Dashboard" />
            <button onClick={load} className="flex size-10 items-center justify-center rounded-xl bg-brand-red text-white shadow-sm transition hover:bg-[#c90510]">
              <RefreshCw className="size-4" strokeWidth={2.4} />
            </button>
          </div>
        </div>

        {data && (
          <SalesOrderFilterBar
            periodeLabel="12 Mei – 18 Mei 2026"
            selects={[
              { key: "platform", label: "Platform", value: platform, options: data.filters.platform },
              { key: "toko", label: "Toko", value: toko, options: data.filters.toko },
              { key: "produk", label: "Produk", value: produk, options: data.filters.produk },
              { key: "ekspedisi", label: "Ekspedisi", value: ekspedisi, options: data.filters.ekspedisi },
              { key: "issueType", label: "Issue Type", value: issueType, options: data.filters.issueType },
            ]}
            onSelectChange={(key, value) => {
              if (key === "platform") setPlatform(value);
              if (key === "toko") setToko(value);
              if (key === "produk") setProduk(value);
              if (key === "ekspedisi") setEkspedisi(value);
              if (key === "issueType") setIssueType(value);
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
              <SalesOrderSectionCard title="Retur per Hari" subtitle="Jumlah retur harian.">
                <TrendLineChart labels={data.returPerHari.map((r) => r.label)} series={[{ name: "Jumlah Retur", color: "#E30613", points: data.returPerHari.map((r) => r.value) }]} formatValue={formatNumber} showCallouts />
              </SalesOrderSectionCard>
            )}

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-4">
              <SalesOrderSectionCard title="Retur per Produk" subtitle="Jumlah retur.">
                <HorizontalValueBars data={data.returPerProduk.map((p) => ({ label: p.name, value: p.value }))} formatValue={formatNumber} />
              </SalesOrderSectionCard>
              <SalesOrderSectionCard title="Jenis Issue Data" className="xl:col-span-2">
                <DonutWithCenter data={data.jenisIssueDonut} centerTop={formatNumber(data.totalIssue)} centerBottom="Total Issue" formatValue={(v, pct) => `${formatNumber(v)} (${formatPersen(pct * 100, 0)})`} />
              </SalesOrderSectionCard>
              <SalesOrderSectionCard title="Retur per Ekspedisi" subtitle="Jumlah retur.">
                <HorizontalValueBars data={data.returPerEkspedisi.map((e) => ({ label: e.name, value: e.value }))} formatValue={formatNumber} color="#F59E0B" />
              </SalesOrderSectionCard>
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.3fr_0.85fr]">
              <SalesOrderSectionCard title="Retur vs Order" subtitle="Perbandingan jumlah order dan retur harian.">
                <ComboBarLineChart data={data.returVsOrder.map((r) => ({ label: r.label, bar: r.order, line: r.retur }))} barLabel="Order" lineLabel="Retur" barColor="#CBD5E1" lineColor="#E30613" formatBar={formatNumber} formatLine={formatNumber} />
              </SalesOrderSectionCard>
              <SalesOrderSectionCard title="Top Issue Prioritas" subtitle="Issue dengan prioritas tertinggi.">
                <SalesOrderTable
                  columns={[
                    { key: "rank", header: "#", render: (r) => r.rank },
                    { key: "issue", header: "Issue", render: (r) => <span className="text-xs font-bold text-slate-800">{r.issue}</span> },
                    { key: "jumlah", header: "Jumlah", align: "right", render: (r) => r.jumlah },
                    { key: "prioritas", header: "Prioritas", render: (r) => <SalesOrderBadge label={r.prioritas} tone={PRIORITY_TONE[r.prioritas]} /> },
                  ]}
                  rows={data.topIssue}
                  rowKey={(r) => r.issue}
                />
              </SalesOrderSectionCard>
            </div>

            <SalesOrderSectionCard title="Data Review & Issue Details" subtitle="Detail seluruh masalah data pada periode & filter ini.">
              <SalesOrderTable columns={columns} rows={data.table} rowKey={(r) => r.masalah} />
            </SalesOrderSectionCard>
          </>
        )}

        <div className="flex sm:hidden"><SalesOrderBackButton /></div>
      </main>
      <footer className="pb-7 pt-3 text-center text-xs font-medium text-slate-500 sm:text-sm">© 2026 Probetes ERP. All rights reserved.</footer>
    </div>
  );
}
