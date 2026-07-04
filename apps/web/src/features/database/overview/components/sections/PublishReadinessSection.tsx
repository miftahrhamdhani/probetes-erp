import { publishCandidates, publishChecklist, publishKpis, readyBlocked } from "../../data/overviewMockData";
import { DataPanel } from "../DataPanel";
import { KpiCard } from "../KpiCard";
import { SimpleDonutChart } from "../SimpleDonutChart";
import { StatusBadge } from "../StatusBadge";

export function PublishReadinessSection() {
  return (
    <div className="grid gap-5">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{publishKpis.map((item) => <KpiCard key={item.label} item={item} />)}</div>
      <DataPanel title="Publish Candidates" subtitle="Batch yang siap atau hampir siap dipublish ke ERP utama.">
        <div className="overflow-x-auto"><table className="min-w-[1040px] w-full text-left text-sm"><thead className="text-xs uppercase tracking-[0.08em] text-slate-500"><tr>{["Batch ID", "Source", "Valid Rows", "Mapping Coverage", "Validation Status", "Owner Approval", "Ready Score", "Action"].map((head) => <th key={head} className="border-b border-slate-200 px-3 py-3 font-black">{head}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{publishCandidates.map((row) => <tr key={String(row.batchId)} className="font-semibold text-slate-700"><td className="px-3 py-4 font-black text-slate-950">{row.batchId}</td><td className="px-3 py-4">{row.source}</td><td className="px-3 py-4">{row.validRows}</td><td className="px-3 py-4">{row.mappingCoverage}</td><td className="px-3 py-4"><StatusBadge label={String(row.validationStatus)} /></td><td className="px-3 py-4"><StatusBadge label={String(row.ownerApproval)} /></td><td className="px-3 py-4 font-black">{row.readyScore}</td><td className="px-3 py-4"><button type="button" className="rounded-full bg-brand-red px-3 py-1.5 text-xs font-black text-white">{row.action}</button></td></tr>)}</tbody></table></div>
      </DataPanel>
      <div className="grid gap-5 xl:grid-cols-2"><DataPanel title="Publish Checklist"><ul className="grid gap-3">{publishChecklist.map((item) => <li key={item} className="rounded-2xl bg-slate-50 p-4 text-sm font-black text-slate-800">✓ {item}</li>)}</ul></DataPanel><DataPanel title="Ready vs Blocked Chart"><SimpleDonutChart data={readyBlocked} /></DataPanel></div>
    </div>
  );
}
