"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { FileUp, LoaderCircle, RefreshCw, Upload } from "lucide-react";
import { MarketingBackButton } from "@/features/marketing/components/MarketingBackButton";
import { DisabledMetricCard } from "@/features/marketing/components/availability/DisabledMetricCard";
import { DataUnavailableNotice } from "@/features/marketing/components/availability/DataUnavailableNotice";
import { MetricAvailabilityBadge } from "@/features/marketing/components/availability/MetricAvailabilityBadge";
import { DateRangePicker } from "@/features/marketing/components/daterange/DateRangePicker";
import { useDateRangeQuery } from "@/features/marketing/components/daterange/useDateRangeQuery";
import { SourcePerformanceTab } from "./SourcePerformanceTab";
import type { AvailabilityMap } from "@/lib/availability";

interface AdsSummary {
  spend: number; impressions: number; reach: number; link_clicks: number; landing_page_views: number;
  checkout_started: number; purchases: number; purchase_value: number; leads: number; add_to_cart: number;
  ctr_link: number | null; cpc_link: number | null; cpm: number | null; cost_per_landing_page_view: number | null;
  cost_per_checkout: number | null; cost_per_purchase: number | null; platform_roas: number | null;
  cost_per_lead: number | null; checkout_to_purchase_rate: number | null; click_to_purchase_rate: number | null;
  landing_page_view_rate: number | null;
}
interface Campaign {
  campaign_name: string; product_label: string | null; advertiser_name: string | null; account_code: string | null;
  campaign_delivery_status: string | null; spend: number; impressions: number; reach: number; link_clicks: number;
  ctr_link: number | null; cpc_link: number | null; cpm: number | null; landing_page_views: number;
  checkout_started: number; purchases: number; cost_per_purchase: number | null; purchase_value: number;
  platform_roas: number | null; leads: number; cost_per_lead: number | null;
}
interface TrendPoint { date: string; spend: number; purchase_value: number; link_clicks: number; purchases: number; platform_roas: number | null }
interface FunnelPoint { label: string; value: number }
interface ImportBatch { batch_id: string; file_name: string; product_label: string | null; advertiser_name: string | null; report_month: string | null; report_year: number | null; status: string; total_rows: number; success_rows: number; imported_at: string }
interface SourceSummary { total_order: number; revenue: number; product_sold: number; unique_customer: number; aov: number | null; top_products: SourceProduct[] }
interface SourceChannel { channel_id: string; channel_name: string; platform: string; total_order: number; revenue: number; product_sold: number; unique_customer: number; aov: number | null }
interface SourceDivision { divisi: string; total_order: number; revenue: number; product_sold: number; unique_customer: number; aov: number | null }
interface SourceProduct { product_id: string | null; product_name: string; product_sold: number; revenue: number }
interface SourceTrend { date: string; total_order: number; revenue: number; unique_customer: number }
interface SourceOrder { order_id: string; order_date: string; customer_name: string; channel_name: string; divisi: string; cs_name: string; total_amount: number }

const rupiah = (value: number | null | undefined) => value === null || value === undefined || !Number.isFinite(value) ? "—" : new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);
const number = (value: number | null | undefined) => value === null || value === undefined || !Number.isFinite(value) ? "—" : new Intl.NumberFormat("id-ID", { maximumFractionDigits: 1 }).format(value);
const percent = (value: number | null | undefined) => value === null || value === undefined || !Number.isFinite(value) ? "—" : `${value.toLocaleString("id-ID", { maximumFractionDigits: 2 })}%`;
const roas = (value: number | null | undefined) => value === null || value === undefined || !Number.isFinite(value) ? "—" : `${value.toLocaleString("id-ID", { maximumFractionDigits: 2 })}x`;

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { cache: "no-store" });
  const body = await response.json() as T & { error?: string };
  if (!response.ok) throw new Error(body.error ?? "Gagal memuat data.");
  return body;
}

export function AdsRoasPage() {
  const { range, setRange } = useDateRangeQuery();
  const [tab, setTab] = useState<"platform" | "source" | "history">("platform");
  const [summary, setSummary] = useState<AdsSummary | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [trend, setTrend] = useState<TrendPoint[]>([]);
  const [funnel, setFunnel] = useState<FunnelPoint[]>([]);
  const [batches, setBatches] = useState<ImportBatch[]>([]);
  const [availability, setAvailability] = useState<AvailabilityMap>({});
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [sourceSummary, setSourceSummary] = useState<SourceSummary | null>(null);
  const [sourceChannels, setSourceChannels] = useState<SourceChannel[]>([]);
  const [sourceDivisions, setSourceDivisions] = useState<SourceDivision[]>([]);
  const [sourceTrend, setSourceTrend] = useState<SourceTrend[]>([]);
  const [sourceOrders, setSourceOrders] = useState<SourceOrder[]>([]);
  const [sourceTitle, setSourceTitle] = useState<string | null>(null);
  const [sourceLoading, setSourceLoading] = useState(false);
  const [sourceError, setSourceError] = useState<string | null>(null);

  const query = new URLSearchParams({ start_date: range.startDate, end_date: range.endDate }).toString();
  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [summaryRes, campaignsRes, trendRes, funnelRes, batchesRes] = await Promise.all([
        fetchJson<{ data: AdsSummary; availability: AvailabilityMap }>(`/api/marketing/ads/summary?${query}`),
        fetchJson<{ data: Campaign[] }>(`/api/marketing/ads/campaigns?${query}&limit=100`),
        fetchJson<{ data: TrendPoint[] }>(`/api/marketing/ads/trend?${query}`),
        fetchJson<{ data: FunnelPoint[] }>(`/api/marketing/ads/funnel?${query}`),
        fetchJson<{ data: ImportBatch[] }>("/api/marketing/ads/import-batches"),
      ]);
      setSummary(summaryRes.data); setAvailability(summaryRes.availability); setCampaigns(campaignsRes.data);
      setTrend(trendRes.data); setFunnel(funnelRes.data); setBatches(batchesRes.data);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Gagal memuat data iklan."); }
    finally { setLoading(false); }
  }, [query]);

  useEffect(() => { void load(); }, [load]);

  const loadSource = useCallback(async (extra = "", title: string | null = null) => {
    setSourceLoading(true); setSourceError(null); setSourceTitle(title);
    try {
      const filter = extra ? `&${extra}` : "";
      const [summaryRes, channelRes, divisionRes, trendRes, ordersRes] = await Promise.all([
        fetchJson<{ data: SourceSummary }>(`/api/marketing/source-performance/summary?${query}${filter}`),
        fetchJson<{ data: SourceChannel[] }>(`/api/marketing/source-performance/by-channel?${query}${filter}`),
        fetchJson<{ data: SourceDivision[] }>(`/api/marketing/source-performance/by-divisi?${query}${filter}`),
        fetchJson<{ data: SourceTrend[] }>(`/api/marketing/source-performance/trend?${query}${filter}`),
        fetchJson<{ data: SourceOrder[] }>(`/api/marketing/source-performance/orders?${query}${filter}&limit=25`),
      ]);
      setSourceSummary(summaryRes.data); setSourceChannels(channelRes.data); setSourceDivisions(divisionRes.data);
      setSourceTrend(trendRes.data); setSourceOrders(ordersRes.data);
    } catch (cause) { setSourceError(cause instanceof Error ? cause.message : "Gagal memuat performa sumber."); }
    finally { setSourceLoading(false); }
  }, [query]);

  useEffect(() => { if (tab === "source") void loadSource(); }, [loadSource, tab]);

  const importFile = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true); setUploadError(null);
    const form = new FormData(); form.set("file", file); form.set("report_year", "2025");
    try {
      const response = await fetch("/api/marketing/ads/import", { method: "POST", body: form });
      const body = await response.json() as { error?: string };
      if (!response.ok) throw new Error(body.error ?? "Import gagal.");
      await load(); setTab("platform");
    } catch (cause) { setUploadError(cause instanceof Error ? cause.message : "Import gagal."); }
    finally { setUploading(false); }
  };

  const selected = campaigns.find((row) => row.campaign_name === selectedCampaign);
  const hasData = campaigns.length > 0;
  const maxTrend = Math.max(1, ...trend.flatMap((point) => [point.spend, point.purchase_value]));
  const maxFunnel = Math.max(1, ...funnel.map((point) => point.value));

  return (
    <div className="min-h-screen bg-[#eef2f6]/90 text-brand-deep">
      <main className="mx-auto flex w-full max-w-[1680px] flex-col gap-5 px-5 py-6 sm:px-7 lg:px-10">
        <header className="flex flex-col justify-between gap-4 rounded-3xl bg-brand-red px-6 py-6 text-white shadow-lg sm:flex-row sm:items-center">
          <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-white/75">Marketing</p><h1 className="mt-1 text-2xl font-black sm:text-3xl">Iklan &amp; ROAS</h1><p className="mt-1 text-sm font-medium text-white/80">Pantau hasil Meta Ads berdasarkan data import yang tersimpan.</p></div>
          <button onClick={() => void load()} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/15 px-4 py-2.5 text-sm font-bold hover:bg-white/25 disabled:opacity-50"><RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />Perbarui</button>
        </header>

        <DateRangePicker value={range} onChange={setRange} />
        <nav className="flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
          {([ ["platform", "Platform Ads"], ["source", "Source Performance"], ["history", "Riwayat Import"] ] as const).map(([key, label]) => <button key={key} onClick={() => setTab(key)} className={`rounded-xl px-4 py-2 text-sm font-bold transition ${tab === key ? "bg-brand-red text-white" : "text-slate-500 hover:bg-slate-50"}`}>{label}</button>)}
        </nav>

        {error && <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div>}
        {loading && <div className="flex items-center justify-center gap-2 rounded-2xl bg-white p-12 text-sm font-bold text-slate-400"><LoaderCircle className="size-5 animate-spin" />Memuat data iklan...</div>}

        {!loading && tab === "platform" && (!hasData ? <EmptyAdsState uploading={uploading} uploadError={uploadError} onFile={importFile} /> : <>
          <p className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-800">ROAS ini berdasarkan nilai konversi dari platform iklan. ROAS ERP akan aktif setelah campaign dapat dimapping ke order internal.</p>
          <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5"><Kpi label="Belanja Iklan" value={rupiah(summary?.spend)} /><Kpi label="Nilai Konversi" value={rupiah(summary?.purchase_value)} /><Kpi label="Platform ROAS" value={roas(summary?.platform_roas)} badge={availability.platform_roas} /><Kpi label="Pembelian" value={number(summary?.purchases)} onClick={() => document.getElementById("campaign-table")?.scrollIntoView({ behavior: "smooth" })} /><Kpi label="Klik Tautan" value={number(summary?.link_clicks)} /></section>
          <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5"><Kpi label="CTR" value={percent(summary?.ctr_link)} /><Kpi label="CPC" value={rupiah(summary?.cpc_link)} /><Kpi label="CPM" value={rupiah(summary?.cpm)} /><Kpi label="Mulai Checkout" value={number(summary?.checkout_started)} /><Kpi label="Biaya per Pembelian" value={rupiah(summary?.cost_per_purchase)} /></section>
          <section className="grid grid-cols-1 gap-3 xl:grid-cols-4">
            <DisabledMetricCard label="ROAS ERP" reason={availability.erp_roas?.reason ?? "Belum tersedia."} />
            <DisabledMetricCard label="Performa Set Iklan" reason={availability.adset_performance?.reason ?? "Belum tersedia."} />
            <DisabledMetricCard label="Performa Iklan" reason={availability.ads_performance?.reason ?? "Belum tersedia."} />
            <DisabledMetricCard label="Atribusi ke Pesanan ERP" reason={availability.attribution?.reason ?? "Belum tersedia."} />
          </section>
          <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <ChartCard title="Belanja vs Nilai Konversi"><div className="space-y-3">{trend.length ? trend.map((point) => <div key={point.date} className="grid grid-cols-[80px_1fr_1fr] items-center gap-2 text-xs"><span className="font-semibold text-slate-500">{point.date}</span><Bar value={point.spend} max={maxTrend} color="bg-brand-red" label={rupiah(point.spend)} /><Bar value={point.purchase_value} max={maxTrend} color="bg-emerald-500" label={rupiah(point.purchase_value)} /></div>) : <NoData />}</div></ChartCard>
            <ChartCard title="Funnel Iklan"><div className="space-y-3">{funnel.map((point) => <button key={point.label} onClick={() => document.getElementById("campaign-table")?.scrollIntoView({ behavior: "smooth" })} className="grid w-full grid-cols-[160px_1fr_70px] items-center gap-2 text-left text-xs"><span className="font-semibold text-slate-600">{point.label}</span><span className="h-6 overflow-hidden rounded bg-slate-100"><span className="block h-full rounded bg-brand-red" style={{ width: `${Math.max(2, point.value / maxFunnel * 100)}%` }} /></span><span className="text-right font-bold">{number(point.value)}</span></button>)}</div></ChartCard>
          </section>
          <ChartCard title="Kampanye Meta Ads" action={<span className="text-xs text-slate-400">Klik kampanye untuk detail</span>}><CampaignTable campaigns={campaigns} onSelect={setSelectedCampaign} /></ChartCard>
          {selected && <CampaignDetail campaign={selected} onClose={() => setSelectedCampaign(null)} />}
        </>)}

        {!loading && tab === "source" && <SourcePerformanceTab summary={sourceSummary} channels={sourceChannels} divisions={sourceDivisions} trend={sourceTrend} orders={sourceOrders} loading={sourceLoading} error={sourceError} title={sourceTitle} onChannel={(row) => void loadSource(`channel_id=${encodeURIComponent(row.channel_id)}`, `Pesanan Channel: ${row.channel_name}`)} onDivision={(row) => void loadSource(`divisi=${encodeURIComponent(row.divisi)}`, `Pesanan Divisi: ${row.divisi}`)} onProduct={(row) => row.product_id && void loadSource(`product_id=${encodeURIComponent(row.product_id)}`, `Pesanan Produk: ${row.product_name}`)} onReset={() => void loadSource()} />}
        {!loading && tab === "history" && <ImportHistory batches={batches} uploading={uploading} uploadError={uploadError} onFile={importFile} />}
        <div><MarketingBackButton /></div>
      </main>
    </div>
  );
}

function Kpi({ label, value, badge, onClick }: { label: string; value: string; badge?: { status: import("@/lib/availability").AvailabilityStatus; reason: string | null }; onClick?: () => void }) {
  const content = <><div className="flex items-start justify-between gap-2"><p className="text-xs font-bold uppercase tracking-wide text-slate-400">{label}</p>{badge && <MetricAvailabilityBadge status={badge.status} reason={badge.reason} />}</div><p className="mt-3 text-2xl font-black text-slate-800">{value}</p></>;
  return onClick ? <button onClick={onClick} className="rounded-2xl bg-white p-4 text-left shadow-sm transition hover:ring-2 hover:ring-brand-red/30">{content}</button> : <div className="rounded-2xl bg-white p-4 shadow-sm">{content}</div>;
}
function ChartCard({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) { return <section className="rounded-2xl bg-white p-5 shadow-sm"><div className="mb-5 flex items-center justify-between gap-3"><h2 className="font-black text-slate-800">{title}</h2>{action}</div>{children}</section>; }
function Bar({ value, max, color, label }: { value: number; max: number; color: string; label: string }) { return <span className="relative h-5 overflow-hidden rounded bg-slate-100"><span className={`block h-full rounded ${color}`} style={{ width: `${Math.max(2, value / max * 100)}%` }} /><span className="absolute inset-y-0 left-2 flex items-center text-[10px] font-bold text-white drop-shadow">{label}</span></span>; }
function NoData() { return <p className="py-10 text-center text-sm font-semibold text-slate-400">Belum ada data pada rentang tanggal ini.</p>; }
function EmptyAdsState({ uploading, uploadError, onFile }: { uploading: boolean; uploadError: string | null; onFile: (file?: File) => Promise<void> }) { return <section className="rounded-3xl bg-white p-8 text-center shadow-sm"><FileUp className="mx-auto size-12 text-brand-red" /><h2 className="mt-4 text-xl font-black">Belum ada data iklan</h2><p className="mx-auto mt-2 max-w-xl text-sm text-slate-500">Upload file CSV Meta Ads untuk mengaktifkan laporan Platform Ads. Tahun laporan file contoh yang sedang dipakai adalah 2025.</p><label className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-brand-red px-5 py-3 text-sm font-bold text-white hover:opacity-90"><Upload className="size-4" />{uploading ? "Mengimport..." : "Upload CSV Meta Ads"}<input type="file" className="hidden" accept=".csv,text/csv" disabled={uploading} onChange={(event) => void onFile(event.target.files?.[0])} /></label>{uploadError && <p className="mt-3 text-sm font-semibold text-red-600">{uploadError}</p>}</section>; }
function CampaignTable({ campaigns, onSelect }: { campaigns: Campaign[]; onSelect: (name: string) => void }) { return <div id="campaign-table" className="overflow-x-auto"><table className="w-full min-w-[1100px] text-left text-sm"><thead><tr className="border-b text-xs uppercase tracking-wide text-slate-400"><th className="pb-3">Kampanye</th><th>Produk / ADV</th><th className="text-right">Belanja</th><th className="text-right">Klik</th><th className="text-right">Pembelian</th><th className="text-right">Nilai Konversi</th><th className="text-right">ROAS</th></tr></thead><tbody>{campaigns.map((row) => <tr key={row.campaign_name} onClick={() => onSelect(row.campaign_name)} className="cursor-pointer border-b border-slate-50 hover:bg-brand-red/5"><td className="py-3 font-bold text-slate-800">{row.campaign_name}</td><td className="text-slate-500">{row.product_label ?? "—"} · {row.advertiser_name ?? "—"}</td><td className="text-right">{rupiah(row.spend)}</td><td className="text-right">{number(row.link_clicks)}</td><td className="text-right">{number(row.purchases)}</td><td className="text-right">{rupiah(row.purchase_value)}</td><td className="text-right font-black text-brand-red">{roas(row.platform_roas)}</td></tr>)}</tbody></table></div>; }
function CampaignDetail({ campaign, onClose }: { campaign: Campaign; onClose: () => void }) { return <section className="rounded-2xl border border-brand-red/20 bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase text-brand-red">Detail Kampanye</p><h2 className="mt-1 text-lg font-black">{campaign.campaign_name}</h2></div><button onClick={onClose} className="text-sm font-bold text-slate-400">Tutup</button></div><div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4"><Kpi label="Belanja" value={rupiah(campaign.spend)} /><Kpi label="CTR" value={percent(campaign.ctr_link)} /><Kpi label="CPC" value={rupiah(campaign.cpc_link)} /><Kpi label="ROAS Platform" value={roas(campaign.platform_roas)} /></div><p className="mt-4 text-xs text-slate-500">ROAS Platform = Nilai Konversi Platform ÷ Belanja Iklan = {rupiah(campaign.purchase_value)} ÷ {rupiah(campaign.spend)}.</p></section>; }
function ImportHistory({ batches, uploading, uploadError, onFile }: { batches: ImportBatch[]; uploading: boolean; uploadError: string | null; onFile: (file?: File) => Promise<void> }) { return <section className="rounded-2xl bg-white p-5 shadow-sm"><div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-black">Riwayat Import Meta Ads</h2><p className="text-sm text-slate-500">Tersimpan di database dan tetap tersedia setelah halaman dimuat ulang.</p></div><label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-brand-red px-4 py-2.5 text-sm font-bold text-white"><Upload className="size-4" />{uploading ? "Mengimport..." : "Import CSV"}<input type="file" className="hidden" accept=".csv,text/csv" disabled={uploading} onChange={(event) => void onFile(event.target.files?.[0])} /></label></div>{uploadError && <p className="mb-3 text-sm font-semibold text-red-600">{uploadError}</p>}{!batches.length ? <NoData /> : <div className="overflow-x-auto"><table className="w-full min-w-[800px] text-left text-sm"><thead><tr className="border-b text-xs uppercase text-slate-400"><th className="pb-3">File</th><th>Produk</th><th>ADV</th><th>Periode</th><th className="text-right">Baris Berhasil</th><th>Status</th></tr></thead><tbody>{batches.map((batch) => <tr key={batch.batch_id} className="border-b border-slate-50"><td className="py-3 font-bold">{batch.file_name}</td><td>{batch.product_label ?? "—"}</td><td>{batch.advertiser_name ?? "—"}</td><td>{batch.report_month ?? "—"} {batch.report_year ?? ""}</td><td className="text-right">{number(batch.success_rows)} / {number(batch.total_rows)}</td><td><span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700">{batch.status === "success" ? "Berhasil" : batch.status}</span></td></tr>)}</tbody></table></div>}</section>; }
