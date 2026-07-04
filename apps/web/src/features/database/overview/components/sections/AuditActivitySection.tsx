import { activityDistribution, activityRows, auditKpis, recentApprovals } from "../../data/overviewMockData";
import { DataPanel } from "../DataPanel";
import { KpiCard } from "../KpiCard";
import { SimpleDonutChart } from "../SimpleDonutChart";
import { StatusBadge } from "../StatusBadge";

export function AuditActivitySection() {
  return (
    <div className="grid gap-5">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">{auditKpis.map((item) => <KpiCard key={item.label} item={item} />)}</div>
      <DataPanel title="Activity Log" subtitle="Jejak aktivitas import, mapping, publish, dan error.">
        <div className="overflow-x-auto"><table className="min-w-[1120px] w-full text-left text-sm"><thead className="text-xs uppercase tracking-[0.08em] text-slate-500"><tr>{["Timestamp", "User", "Activity Type", "Module", "Target", "Description", "Impact", "Status"].map((head) => <th key={head} className="border-b border-slate-200 px-3 py-3 font-black">{head}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{activityRows.map((row) => <tr key={`${row.timestamp}-${row.target}`} className="font-semibold text-slate-700"><td className="px-3 py-4 font-black text-slate-950">{row.timestamp}</td><td className="px-3 py-4">{row.user}</td><td className="px-3 py-4">{row.activityType}</td><td className="px-3 py-4">{row.module}</td><td className="px-3 py-4">{row.target}</td><td className="px-3 py-4">{row.description}</td><td className="px-3 py-4">{row.impact}</td><td className="px-3 py-4"><StatusBadge label={String(row.status)} /></td></tr>)}</tbody></table></div>
      </DataPanel>
      <div className="grid gap-5 xl:grid-cols-2"><DataPanel title="Activity Distribution by Type"><SimpleDonutChart data={activityDistribution} /></DataPanel><DataPanel title="Recent Approvals"><ul className="grid gap-3">{recentApprovals.map((item) => <li key={item} className="rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-700">{item}</li>)}</ul></DataPanel></div>
    </div>
  );
}
