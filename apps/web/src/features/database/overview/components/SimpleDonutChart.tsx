import type { DonutSegment } from "../types/databaseOverview.types";

export function SimpleDonutChart({ data }: { data: DonutSegment[] }) {
  const total = data.reduce((sum, item) => sum + item.value, 0) || 1;
  let offset = 25;

  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
      <svg className="size-40 shrink-0 -rotate-90" viewBox="0 0 44 44" role="img" aria-label="Donut chart">
        <circle cx="22" cy="22" r="16" fill="none" stroke="#e5e7eb" strokeWidth="8" />
        {data.map((segment) => {
          const length = (segment.value / total) * 100;
          const circle = <circle key={segment.label} cx="22" cy="22" r="16" fill="none" stroke={segment.color} strokeDasharray={`${length} ${100 - length}`} strokeDashoffset={offset} strokeLinecap="round" strokeWidth="8" />;
          offset -= length;
          return circle;
        })}
      </svg>
      <div className="grid flex-1 gap-3">
        {data.map((segment) => (
          <div key={segment.label} className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 px-4 py-3">
            <span className="flex items-center gap-2 text-sm font-bold text-slate-700">
              <span className="size-3 rounded-full" style={{ backgroundColor: segment.color }} />
              {segment.label}
            </span>
            <span className="text-sm font-black text-slate-950">{segment.value.toLocaleString("en-US")}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
