import { issueSeverityDonut, validationActions, validationIssues, validationSummary } from "../../data/overviewMockData";
import { DataPanel } from "../DataPanel";
import { KpiCard } from "../KpiCard";
import { SimpleDonutChart } from "../SimpleDonutChart";
import { StatusBadge } from "../StatusBadge";

export function ValidationIssuesSection() {
  return (
    <div className="grid gap-5">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{validationSummary.map((item) => <KpiCard key={item.label} item={item} />)}</div>
      <DataPanel title="Validation Issues" subtitle="Filter sederhana dan daftar isu validasi aktif.">
        <div className="mb-4 flex flex-wrap gap-2">{["All", "Critical", "Warning", "Info", "Resolved"].map((filter) => <button key={filter} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-black text-slate-700 hover:border-brand-red hover:text-brand-red" type="button">{filter}</button>)}</div>
        <div className="overflow-x-auto">
          <table className="min-w-[980px] w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.08em] text-slate-500"><tr>{["Issue Type", "Source", "Batch ID", "Rows Affected", "Severity", "Last Detected", "Owner", "Status"].map((head) => <th key={head} className="border-b border-slate-200 px-3 py-3 font-black">{head}</th>)}</tr></thead>
            <tbody className="divide-y divide-slate-100">{validationIssues.map((row) => <tr key={`${row.batchId}-${row.issueType}`} className="font-semibold text-slate-700"><td className="px-3 py-4 font-black text-slate-950">{row.issueType}</td><td className="px-3 py-4">{row.source}</td><td className="px-3 py-4">{row.batchId}</td><td className="px-3 py-4">{row.rowsAffected}</td><td className="px-3 py-4"><StatusBadge label={String(row.severity)} /></td><td className="px-3 py-4">{row.lastDetected}</td><td className="px-3 py-4">{row.owner}</td><td className="px-3 py-4"><StatusBadge label={String(row.status)} /></td></tr>)}</tbody>
          </table>
        </div>
      </DataPanel>
      <div className="grid gap-5 xl:grid-cols-2">
        <DataPanel title="Issue by Severity"><SimpleDonutChart data={issueSeverityDonut} /></DataPanel>
        <DataPanel title="Recent Actions"><ul className="grid gap-3">{validationActions.map((item) => <li key={item} className="rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-700">{item}</li>)}</ul></DataPanel>
      </div>
    </div>
  );
}
