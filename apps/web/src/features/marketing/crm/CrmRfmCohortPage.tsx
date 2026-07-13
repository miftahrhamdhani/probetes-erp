"use client";

import { useEffect, useState } from "react";
import { CalendarDays, Download, Search, X } from "lucide-react";
import { MarketingBackButton } from "@/features/marketing/components/MarketingBackButton";
import { CrmClusterDashboard } from "./components/CrmClusterDashboard";
import { CrmDetailDrawer, CrmKpis, CrmPageShell } from "./components/CrmUi";
import { CrmFrequencyMatrix, CrmRetentionMatrix } from "./components/CrmRfmMatrices";
import { getCrmCluster, getCrmDataTerkini, getCrmFrequency, getCrmRetention } from "./lib/crmService";
import type { CrmRfmData, CrmTab } from "./types/crmTypes";

export function CrmRfmCohortPage() {
  const [tab, setTab] = useState<CrmTab>("retention");
  const [data, setData] = useState<CrmRfmData | null>(null);
  const [values, setValues] = useState<Record<string, string>>({ produk: "Semua", cs: "Semua", search: "" });
  const [mode, setMode] = useState<"users" | "revenue">("users");
  const [active, setActive] = useState("");
  const [customerId, setCustomerId] = useState<string | null>(null);
  const load = () => (tab === "retention" ? getCrmRetention(values) : tab === "frequency" ? getCrmFrequency(values) : getCrmCluster(values)).then((result) => { setData(result); setActive(""); });
  useEffect(() => { load(); }, [tab]); // eslint-disable-line react-hooks/exhaustive-deps
  const selectCohort = (cohort: string) => setActive(cohort);
  const rows = active && tab !== "cluster" ? data?.rows.filter((row) => row.cohort === active) ?? [] : data?.rows ?? [];

  return <CrmPageShell>
    <RfmToolbar tab={tab} onTabChange={setTab} values={values} onChange={(key, value) => setValues((current) => ({ ...current, [key]: value }))} onUpdate={load} />
    {data && <>
      {tab === "cluster" && <CrmKpis items={data.kpi.slice(0, 4)} />}
      {tab === "retention" && data.retention && <CrmRetentionMatrix rows={data.retention} mode={mode} onModeChange={setMode} onSelect={selectCohort} />}
      {tab === "frequency" && data.frequency && <CrmFrequencyMatrix rows={data.frequency} onSelect={selectCohort} />}
      {tab === "cluster" && data.cluster && <CrmClusterDashboard clusters={data.cluster} rows={data.rows} active={active} onSelect={setActive} onCustomer={setCustomerId} />}
      {tab !== "cluster" && <CustomerDetailTable rows={rows} active={active} onDetail={setCustomerId} />}
      <div><MarketingBackButton href="/marketing/crm" label="Kembali ke CRM" /></div>
    </>}
    <CrmDetailDrawer customerId={customerId} onClose={() => setCustomerId(null)} />
  </CrmPageShell>;
}

function RfmToolbar({ tab, onTabChange, values, onChange, onUpdate }: { tab: CrmTab; onTabChange: (tab: CrmTab) => void; values: Record<string, string>; onChange: (key: string, value: string) => void; onUpdate: () => void }) {
  return <>
    <div className="flex flex-wrap items-center gap-2 border-b border-slate-300 bg-white px-1 pb-3 pt-1">
      <div className="mr-auto min-w-[260px]"><h1 className="flex items-center gap-2 text-xl font-black tracking-tight text-slate-900">Cohort &amp; RFM Dashboard <span className="rounded bg-brand-red px-2 py-1 text-[10px] tracking-wide text-white">PROBETES</span></h1><p className="mt-0.5 text-[11px] font-semibold text-slate-500">Data Terkini: {getCrmDataTerkini()}</p></div>
      <label className="relative"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><input value={values.search} onChange={(event) => onChange("search", event.target.value)} className="h-10 w-64 rounded-lg border border-slate-300 pl-9 pr-14 text-sm outline-none focus:border-blue-500" placeholder="Cari customer / ID..." /><button type="button" onClick={onUpdate} className="absolute right-1 top-1 rounded bg-blue-600 px-3 py-1.5 text-xs font-bold text-white">Cari</button></label>
      <div className="flex h-10 items-center gap-2 rounded-lg border border-slate-300 px-3 text-xs font-bold text-slate-700"><CalendarDays className="size-3.5" />Dari <b>01/01/2026</b><span className="text-slate-400">—</span>Sampai <b>07/13/2026</b><X className="size-4 text-slate-400" /></div>
      <select className="h-10 rounded-lg border border-slate-300 px-3 text-sm font-semibold"><option>Januari</option></select><select className="h-10 rounded-lg border border-slate-300 px-3 text-sm font-semibold"><option>2026</option></select>
      <button type="button" className="inline-flex h-10 items-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-bold text-white"><Download className="size-4" />Download</button>
      <select value={values.produk} onChange={(event) => onChange("produk", event.target.value)} className="h-10 rounded-lg border border-slate-300 px-3 text-sm font-semibold"><option value="Semua">Semua Produk</option><option>Probetes Herbal</option><option>Ebook 145</option></select><select value={values.cs} onChange={(event) => onChange("cs", event.target.value)} className="h-10 rounded-lg border border-slate-300 px-3 text-sm font-semibold"><option value="Semua">Semua CS</option><option>Rista</option><option>Nadia</option></select><button type="button" onClick={onUpdate} className="h-10 rounded-lg border border-slate-300 bg-white px-4 text-sm font-bold text-slate-700">Update</button>
    </div>
    <div className="h-16 rounded-b-xl border-x border-b border-slate-300 bg-white" />
    <div className="mt-3 flex items-center justify-between"><div className="inline-flex rounded-lg bg-slate-200 p-1"><Tab tab="retention" label="Retention" /><Tab tab="frequency" label="Frequency" /><Tab tab="cluster" label="Cluster" /></div></div>
  </>;
  function Tab({ tab: target, label }: { tab: CrmTab; label: string }) { return <button type="button" onClick={() => onTabChange(target)} className={`rounded-md px-5 py-2 text-sm font-bold transition ${tab === target ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>{label}</button>; }
}

function CustomerDetailTable({ rows, active, onDetail }: { rows: NonNullable<CrmRfmData["rows"]>; active: string; onDetail: (id: string) => void }) { return <section className="rounded-xl border border-slate-300 bg-white shadow-sm"><div className="flex items-center gap-2 border-b border-slate-200 px-4 py-3"><b className="rounded-full bg-violet-600 px-3 py-1 text-xs text-white">{active || "SEMUA CUSTOMER"}</b><span className="text-xs text-slate-500">Klik customer untuk detail</span></div><div className="max-h-[360px] overflow-auto"><table className="min-w-[1100px] w-full text-left text-xs"><thead className="sticky top-0 bg-slate-50 text-[10px] uppercase text-slate-500"><tr>{["Nama Customer", "No WA", "Cohort", "Frequency", "Total Belanja", "Produk Terakhir", "Status Grup", "Cluster", "CS/CRM", "Follow-up"].map((head) => <th key={head} className="border-b border-r border-slate-200 px-3 py-2">{head}</th>)}</tr></thead><tbody>{rows.map((row) => <tr key={row.id} onClick={() => onDetail(row.id)} className="cursor-pointer hover:bg-blue-50"><td className="border-b px-3 py-2 font-bold">{row.nama}</td><td className="border-b px-3 py-2 text-blue-600">{row.noWa}</td><td className="border-b px-3 py-2">{row.cohort}</td><td className="border-b px-3 py-2">{row.frequency}x</td><td className="border-b px-3 py-2">Rp{row.totalBayar.toLocaleString("id-ID")}</td><td className="border-b px-3 py-2">{row.produk}</td><td className="border-b px-3 py-2">{row.statusGrup}</td><td className="border-b px-3 py-2">{row.cluster}</td><td className="border-b px-3 py-2">{row.cs}</td><td className="border-b px-3 py-2">{row.followUp}</td></tr>)}</tbody></table></div></section>; }
