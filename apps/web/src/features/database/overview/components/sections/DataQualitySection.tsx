import { qualityInsights, qualityIssues, qualityMetrics, qualityTrend } from "../../data/overviewMockData";
import { DataPanel } from "../DataPanel";
import { KpiCard } from "../KpiCard";
import { SimpleDonutChart } from "../SimpleDonutChart";
import { SimpleLineChart } from "../SimpleLineChart";

export function DataQualitySection() {
  return (
    <div className="grid gap-5">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {qualityMetrics.map((item) => <KpiCard key={item.label} item={item} />)}
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <DataPanel title="Quality Score Trend" subtitle="Pergerakan skor kualitas data."><SimpleLineChart data={qualityTrend} /></DataPanel>
        <DataPanel title="Issues Composition" subtitle="Komposisi problem kualitas data."><SimpleDonutChart data={qualityIssues} /></DataPanel>
      </div>
      <DataPanel title="Quality Insights">
        <div className="grid gap-3 md:grid-cols-3">
          {qualityInsights.map((item) => <div key={item} className="rounded-2xl bg-slate-50 p-4 text-sm font-semibold leading-6 text-slate-700">{item}</div>)}
        </div>
      </DataPanel>
    </div>
  );
}
