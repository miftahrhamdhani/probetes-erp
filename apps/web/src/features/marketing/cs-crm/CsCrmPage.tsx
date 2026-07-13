"use client";

import { useEffect, useMemo, useState } from "react";
import { DollarSign, Layers, TrendingUp, Users } from "lucide-react";
import { DummyBanner } from "@/features/marketing/components/DummyBanner";
import { MarketingBackButton } from "@/features/marketing/components/MarketingBackButton";
import { CsCrmFilterBar } from "./components/CsCrmFilterBar";
import { CsCrmChannelPills } from "./components/CsCrmChannelPills";
import { CsCrmTabs, type CsCrmTabKey } from "./components/CsCrmTabs";
import { CsCrmKpiCard } from "./components/CsCrmKpiCard";
import { CsCrmRetentionTable } from "./components/CsCrmRetentionTable";
import { CsCrmFrequencyTable } from "./components/CsCrmFrequencyTable";
import { CsCrmClusterChart } from "./components/CsCrmClusterChart";
import { CsCrmClusterCards } from "./components/CsCrmClusterCards";
import { CsCrmDrillDownModal } from "./components/CsCrmDrillDownModal";
import { CsCrmErrorState, CsCrmKpiSkeleton, CsCrmSectionSkeleton } from "./components/CsCrmStates";
import {
  getClusterData, getClusterDrillDown, getCsCrmFilterOptions, getDataTerkini,
  getFrequencyData, getFrequencyDrillDown, getRetentionData, getRetentionDrillDown,
  type CsCrmFilterOptions,
} from "./lib/csCrmService";
import { formatNumber, formatRupiahRingkas } from "./lib/format";
import type {
  ClusterData, ClusterKey, DrillDownResult, FilterOption, FrequencyData, RetentionData,
} from "./types/csCrmTypes";

export function CsCrmPage() {
  const [tab, setTab] = useState<CsCrmTabKey>("retention");
  const [search, setSearch] = useState("");
  const [dari, setDari] = useState("2025-01-01");
  const [sampai, setSampai] = useState("2026-07-13");
  const [produk, setProduk] = useState("Semua");
  const [cs, setCs] = useState("Semua");
  const [channelType, setChannelType] = useState("Semua");
  const [showMode, setShowMode] = useState<"users" | "revenue">("users");
  const [activeCluster, setActiveCluster] = useState<ClusterKey | null>(null);

  const [filterOptions, setFilterOptions] = useState<CsCrmFilterOptions | null>(null);
  const [retention, setRetention] = useState<RetentionData | null>(null);
  const [frequency, setFrequency] = useState<FrequencyData | null>(null);
  const [cluster, setCluster] = useState<ClusterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [drillDown, setDrillDown] = useState<DrillDownResult | null>(null);
  const [drillDownLoading, setDrillDownLoading] = useState(false);

  const filters = useMemo(() => ({ dari, sampai, produk, cs, channelType, search }), [dari, sampai, produk, cs, channelType, search]);

  useEffect(() => {
    getCsCrmFilterOptions().then(setFilterOptions).catch(() => setError(true));
  }, []);

  const load = () => {
    setLoading(true);
    setError(false);
    const request = tab === "retention" ? getRetentionData(filters) : tab === "frequency" ? getFrequencyData(filters) : getClusterData(filters);
    request
      .then((res) => {
        if (tab === "retention") setRetention(res as RetentionData);
        else if (tab === "frequency") setFrequency(res as FrequencyData);
        else setCluster(res as ClusterData);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(load, [tab]); // eslint-disable-line react-hooks/exhaustive-deps

  const channelOptions: FilterOption[] = filterOptions?.channelType ?? [{ value: "Semua", label: "Semua Data" }];
  const produkOptions: FilterOption[] = filterOptions?.produk ?? [{ value: "Semua", label: "Semua Produk" }];
  const csOptions: FilterOption[] = filterOptions?.cs ?? [{ value: "Semua", label: "Semua CS" }];

  const openRetentionDrillDown = (cohort: string, monthOffset: number) => {
    setDrillDownLoading(true);
    setDrillDown({ title: "", subtitle: "", rows: [] });
    getRetentionDrillDown(filters, cohort, monthOffset).then(setDrillDown).finally(() => setDrillDownLoading(false));
  };
  const openFrequencyDrillDown = (cohort: string, threshold: number) => {
    setDrillDownLoading(true);
    setDrillDown({ title: "", subtitle: "", rows: [] });
    getFrequencyDrillDown(filters, cohort, threshold).then(setDrillDown).finally(() => setDrillDownLoading(false));
  };
  const openClusterDrillDown = (key: ClusterKey) => {
    setActiveCluster(key);
    setDrillDownLoading(true);
    setDrillDown({ title: "", subtitle: "", rows: [] });
    getClusterDrillDown(filters, key).then(setDrillDown).finally(() => setDrillDownLoading(false));
  };

  const clusterKpi = cluster?.kpi;

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#eef2f6]/90 text-brand-deep">
      <main className="mx-auto flex w-full max-w-[1680px] flex-col gap-5 px-5 py-6 sm:px-7 lg:px-10">
        <DummyBanner />

        <div>
          <h1 className="text-3xl font-extrabold tracking-[-0.03em] text-slate-900 sm:text-4xl">
            <span className="text-brand-red">CS</span> / CRM
          </h1>
          <p className="mt-2 max-w-2xl text-sm font-medium leading-relaxed text-slate-600">
            Cohort &amp; klasifikasi cluster customer Probetes — retensi, frekuensi belanja, dan segmentasi untuk strategi follow-up dan konsultasi WA grup.
          </p>
          <p className="mt-1 text-xs font-semibold text-slate-400">Data Terkini: {getDataTerkini()}</p>
        </div>

        <CsCrmChannelPills value={channelType} onChange={setChannelType} options={channelOptions} />

        <CsCrmFilterBar
          search={search} onSearchChange={setSearch}
          dari={dari} sampai={sampai} onDariChange={setDari} onSampaiChange={setSampai}
          produk={produk} onProdukChange={setProduk} produkOptions={produkOptions}
          cs={cs} onCsChange={setCs} csOptions={csOptions}
          onUpdate={load}
        />

        <CsCrmTabs active={tab} onChange={setTab} />

        {error && <CsCrmErrorState />}

        {tab === "cluster" && (
          loading && !cluster ? <CsCrmKpiSkeleton /> : clusterKpi && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <CsCrmKpiCard label="Total Revenue" value={formatRupiahRingkas(clusterKpi.totalRevenue)} caption="Filtered Data" icon={DollarSign} />
              <CsCrmKpiCard label="Total Cluster" value={`${clusterKpi.totalCluster} Cluster`} caption="Semua Segmen" icon={Layers} />
              <CsCrmKpiCard label="Lifetime Value" value={formatRupiahRingkas(clusterKpi.lifetimeValue)} caption="Revenue / Unique Customer" icon={TrendingUp} />
              <CsCrmKpiCard label="Active Users" value={formatNumber(clusterKpi.activeUsers)} caption="Unique Customer" icon={Users} />
            </div>
          )
        )}

        {tab === "retention" && (
          loading && !retention ? <CsCrmSectionSkeleton /> : retention && (
            <CsCrmRetentionTable data={retention} showMode={showMode} onShowModeChange={setShowMode} onCellClick={openRetentionDrillDown} />
          )
        )}

        {tab === "frequency" && (
          loading && !frequency ? <CsCrmSectionSkeleton /> : frequency && (
            <CsCrmFrequencyTable data={frequency} onCellClick={openFrequencyDrillDown} />
          )
        )}

        {tab === "cluster" && (
          loading && !cluster ? <CsCrmSectionSkeleton /> : cluster && (
            <>
              <div className="rounded-[20px] bg-white p-4 shadow-sm sm:p-5">
                <h2 className="mb-1 text-sm font-extrabold text-slate-900">Revenue per Cluster</h2>
                <p className="mb-3 text-xs font-medium text-slate-500">Total belanja per segmen — klik bar untuk lihat detail.</p>
                <CsCrmClusterChart data={cluster.summaries} onBarClick={openClusterDrillDown} />
              </div>
              <CsCrmClusterCards data={cluster.summaries} active={activeCluster} onSelect={openClusterDrillDown} />
            </>
          )
        )}

        <div className="flex"><MarketingBackButton /></div>
      </main>
      <footer className="pb-7 pt-3 text-center text-xs font-medium text-slate-500 sm:text-sm">© 2026 Probetes ERP. All rights reserved.</footer>

      <CsCrmDrillDownModal data={drillDown} loading={drillDownLoading} onClose={() => setDrillDown(null)} />
    </div>
  );
}
