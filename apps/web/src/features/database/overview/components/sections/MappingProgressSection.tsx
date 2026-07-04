import { mappingCategories, mappingDecisions, unmappedValues } from "../../data/overviewMockData";
import { DataPanel } from "../DataPanel";
import { ProgressBar } from "../ProgressBar";
import { StatusBadge } from "../StatusBadge";

export function MappingProgressSection() {
  return (
    <div className="grid gap-5">
      <DataPanel title="Total Overall Progress" subtitle="Target minimum sebelum publish massal: 85%.">
        <div className="rounded-3xl bg-slate-50 p-5"><ProgressBar value={78} className="max-w-3xl" /></div>
      </DataPanel>
      <DataPanel title="Kategori Mapping" subtitle="Progress mapping per domain data.">
        <div className="overflow-x-auto">
          <table className="min-w-[920px] w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.08em] text-slate-500"><tr>{["Kategori", "Progress", "Mapped", "Unmapped", "Status", "Terakhir Diperbarui"].map((head) => <th key={head} className="border-b border-slate-200 px-3 py-3 font-black">{head}</th>)}</tr></thead>
            <tbody className="divide-y divide-slate-100">{mappingCategories.map((row) => <tr key={row.kategori} className="font-semibold text-slate-700"><td className="px-3 py-4 font-black text-slate-950">{row.kategori}</td><td className="px-3 py-4"><ProgressBar value={row.progress} /></td><td className="px-3 py-4 text-emerald-700">{row.mapped}</td><td className="px-3 py-4 text-brand-red">{row.unmapped}</td><td className="px-3 py-4"><StatusBadge label={row.status} /></td><td className="px-3 py-4">{row.updated}</td></tr>)}</tbody>
          </table>
        </div>
      </DataPanel>
      <div className="grid gap-5 xl:grid-cols-2"><ListPanel title="Unmapped Top Values" items={unmappedValues} /><ListPanel title="Recent Mapping Decisions" items={mappingDecisions} /></div>
    </div>
  );
}

function ListPanel({ title, items }: { title: string; items: string[] }) {
  return <DataPanel title={title}><ul className="grid gap-3">{items.map((item) => <li key={item} className="rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-700">{item}</li>)}</ul></DataPanel>;
}
