import { importedRowsTrend, summaryBreakdown, summaryKpis, summaryNotes } from "../../data/overviewMockData";
import { DataPanel } from "../DataPanel";
import { KpiCard } from "../KpiCard";
import { SimpleLineChart } from "../SimpleLineChart";

export function SummaryKpiSection() {
  return (
    <div className="grid gap-5">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryKpis.map((item) => <KpiCard key={item.label} item={item} />)}
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.4fr_0.8fr]">
        <DataPanel title="Imported Rows Trend" subtitle="Aktivitas import tujuh hari terakhir.">
          <SimpleLineChart data={importedRowsTrend} />
        </DataPanel>
        <DataPanel title="Notes Terbaru" subtitle="Ringkasan kondisi operasional.">
          <ul className="grid gap-3">
            {summaryNotes.map((note) => (
              <li key={note} className="rounded-2xl bg-slate-50 p-4 text-sm font-semibold leading-6 text-slate-700">{note}</li>
            ))}
          </ul>
        </DataPanel>
      </div>
      <DataPanel title="KPI Breakdown" subtitle="Indikator pendukung sebelum publish ke ERP utama.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {summaryBreakdown.map((item) => <KpiCard key={item.label} item={item} />)}
        </div>
      </DataPanel>
    </div>
  );
}
