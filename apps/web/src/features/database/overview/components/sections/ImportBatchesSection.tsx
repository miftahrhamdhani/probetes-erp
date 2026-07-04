import { activeSources, importActivity, importBatches, importKpis } from "../../data/overviewMockData";
import { DataPanel } from "../DataPanel";
import { KpiCard } from "../KpiCard";
import { SimpleLineChart } from "../SimpleLineChart";
import { StatusBadge } from "../StatusBadge";

export function ImportBatchesSection() {
  return (
    <div className="grid gap-5">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{importKpis.map((item) => <KpiCard key={item.label} item={item} />)}</div>
      <DataPanel title="Recent Import Batches" subtitle="Batch import terakhir dari semua sumber.">
        <div className="overflow-x-auto"><table className="min-w-[1040px] w-full text-left text-sm"><thead className="text-xs uppercase tracking-[0.08em] text-slate-500"><tr>{["Batch ID", "Source", "Imported By", "Imported At", "Rows", "Valid", "Invalid", "Duration", "Status"].map((head) => <th key={head} className="border-b border-slate-200 px-3 py-3 font-black">{head}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{importBatches.map((row) => <tr key={String(row.batchId)} className="font-semibold text-slate-700"><td className="px-3 py-4 font-black text-slate-950">{row.batchId}</td><td className="px-3 py-4">{row.source}</td><td className="px-3 py-4">{row.importedBy}</td><td className="px-3 py-4">{row.importedAt}</td><td className="px-3 py-4">{row.rows}</td><td className="px-3 py-4 text-emerald-700">{row.valid}</td><td className="px-3 py-4 text-brand-red">{row.invalid}</td><td className="px-3 py-4">{row.duration}</td><td className="px-3 py-4"><StatusBadge label={String(row.status)} /></td></tr>)}</tbody></table></div>
      </DataPanel>
      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]"><DataPanel title="Import Activity Chart"><SimpleLineChart data={importActivity} /></DataPanel><DataPanel title="Top Active Sources"><ul className="grid gap-3">{activeSources.map((item) => <li key={item} className="rounded-2xl bg-slate-50 p-4 text-sm font-black text-slate-800">{item}</li>)}</ul></DataPanel></div>
    </div>
  );
}
