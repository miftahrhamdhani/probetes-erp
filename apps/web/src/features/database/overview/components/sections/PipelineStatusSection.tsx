import { funnelRows, pipelineBottlenecks, pipelineRecommendations, pipelineStages } from "../../data/overviewMockData";
import { DataPanel } from "../DataPanel";
import { StatusBadge } from "../StatusBadge";

export function PipelineStatusSection() {
  return (
    <div className="grid gap-5">
      <DataPanel title="Pipeline Flow" subtitle="Raw → Validation → Mapping → Ready to Publish → Published">
        <div className="grid gap-4 lg:grid-cols-5">
          {pipelineStages.map((stage, index) => (
            <div key={stage.label} className="relative rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <span className="grid size-9 place-items-center rounded-full bg-brand-red text-sm font-black text-white">{index + 1}</span>
              <h3 className="mt-4 text-base font-black text-slate-950">{stage.label}</h3>
              <p className="mt-1 text-sm font-bold text-slate-600">{stage.value}</p>
            </div>
          ))}
        </div>
      </DataPanel>
      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <DataPanel title="Funnel Conversion" subtitle="Konversi antar stage pipeline.">
          <div className="overflow-x-auto">
            <table className="min-w-[680px] w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.08em] text-slate-500"><tr>{["Stage", "Conversion", "Dropped", "Status"].map((head) => <th key={head} className="border-b border-slate-200 px-3 py-3 font-black">{head}</th>)}</tr></thead>
              <tbody className="divide-y divide-slate-100">{funnelRows.map((row) => <tr key={row.stage} className="font-semibold text-slate-700"><td className="px-3 py-4 font-black text-slate-950">{row.stage}</td><td className="px-3 py-4">{row.conversion}</td><td className="px-3 py-4">{row.dropped}</td><td className="px-3 py-4"><StatusBadge label={row.status} /></td></tr>)}</tbody>
            </table>
          </div>
        </DataPanel>
        <DataPanel title="Stage Bottlenecks & Rekomendasi">
          <div className="grid gap-4">
            <ListBlock title="Bottlenecks" items={pipelineBottlenecks} />
            <ListBlock title="Rekomendasi Issue Utama" items={pipelineRecommendations} />
          </div>
        </DataPanel>
      </div>
    </div>
  );
}

function ListBlock({ title, items }: { title: string; items: string[] }) {
  return <div><h3 className="mb-2 text-sm font-black text-slate-950">{title}</h3><ul className="grid gap-2">{items.map((item) => <li key={item} className="rounded-2xl bg-slate-50 p-3 text-sm font-semibold text-slate-700">{item}</li>)}</ul></div>;
}
