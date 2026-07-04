import { sourceDistribution, sourceRows } from "../../data/overviewMockData";
import { DataPanel } from "../DataPanel";
import { ProgressBar } from "../ProgressBar";
import { SimpleDonutChart } from "../SimpleDonutChart";
import { StatusBadge } from "../StatusBadge";

export function SourceCoverageSection() {
  return (
    <div className="grid gap-5">
      <DataPanel title="Source Coverage" subtitle="Semua sumber database yang masuk ke staging ERP.">
        <div className="overflow-x-auto">
          <table className="min-w-[1120px] w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.08em] text-slate-500">
              <tr>{["Source Name", "Source Type", "Total Rows", "Last Import", "Valid Rows", "Invalid Rows", "Mapping Progress", "Status", "Action"].map((head) => <th key={head} className="border-b border-slate-200 px-3 py-3 font-black">{head}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sourceRows.map((row) => (
                <tr key={row.sourceName} className="font-semibold text-slate-700">
                  <td className="px-3 py-4 font-black text-slate-950">{row.sourceName}</td>
                  <td className="px-3 py-4">{row.sourceType}</td>
                  <td className="px-3 py-4">{row.totalRows}</td>
                  <td className="px-3 py-4">{row.lastImport}</td>
                  <td className="px-3 py-4 text-emerald-700">{row.validRows}</td>
                  <td className="px-3 py-4 text-brand-red">{row.invalidRows}</td>
                  <td className="px-3 py-4"><ProgressBar value={row.mappingProgress} /></td>
                  <td className="px-3 py-4"><StatusBadge label={row.status} /></td>
                  <td className="px-3 py-4"><button className="rounded-full bg-slate-950 px-3 py-1.5 text-xs font-black text-white" type="button">{row.action}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DataPanel>
      <DataPanel title="Source Type Distribution" subtitle="Komposisi rows berdasarkan kelompok sumber.">
        <SimpleDonutChart data={sourceDistribution} />
      </DataPanel>
    </div>
  );
}
