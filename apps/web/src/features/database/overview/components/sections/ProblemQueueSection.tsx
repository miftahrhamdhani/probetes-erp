import { priorityFocus, problemCategories, problemKpis, problemRows } from "../../data/overviewMockData";
import { DataPanel } from "../DataPanel";
import { KpiCard } from "../KpiCard";
import { SimpleDonutChart } from "../SimpleDonutChart";
import { StatusBadge } from "../StatusBadge";

export function ProblemQueueSection() {
  return (
    <div className="grid gap-5">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{problemKpis.map((item) => <KpiCard key={item.label} item={item} />)}</div>
      <DataPanel title="Work Queue" subtitle="Problem aktif yang perlu diselesaikan tim data.">
        <div className="overflow-x-auto"><table className="min-w-[1120px] w-full text-left text-sm"><thead className="text-xs uppercase tracking-[0.08em] text-slate-500"><tr>{["Problem", "Category", "Source", "Impacted Rows", "Priority", "Assignee", "Due Date", "Status", "Action"].map((head) => <th key={head} className="border-b border-slate-200 px-3 py-3 font-black">{head}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{problemRows.map((row) => <tr key={String(row.problem)} className="font-semibold text-slate-700"><td className="px-3 py-4 font-black text-slate-950">{row.problem}</td><td className="px-3 py-4">{row.category}</td><td className="px-3 py-4">{row.source}</td><td className="px-3 py-4">{row.impactedRows}</td><td className="px-3 py-4"><StatusBadge label={String(row.priority)} /></td><td className="px-3 py-4">{row.assignee}</td><td className="px-3 py-4">{row.dueDate}</td><td className="px-3 py-4"><StatusBadge label={String(row.status)} /></td><td className="px-3 py-4"><button type="button" className="rounded-full bg-slate-950 px-3 py-1.5 text-xs font-black text-white">{row.action}</button></td></tr>)}</tbody></table></div>
      </DataPanel>
      <div className="grid gap-5 xl:grid-cols-2"><DataPanel title="Problem Categories Chart"><SimpleDonutChart data={problemCategories} /></DataPanel><DataPanel title="Priority Focus Panel"><ul className="grid gap-3">{priorityFocus.map((item) => <li key={item} className="rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-700">{item}</li>)}</ul></DataPanel></div>
    </div>
  );
}
