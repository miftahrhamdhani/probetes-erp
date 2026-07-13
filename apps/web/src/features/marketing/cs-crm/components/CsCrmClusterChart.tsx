"use client";

import type { ClusterSummary } from "../types/csCrmTypes";
import { formatRupiahRingkas } from "../lib/format";

/** Combo bar (revenue) + line (avg per customer) — meniru chart "Revenue per Cluster"
 * di dashboard referensi, klik bar untuk drill-down (delegasi ke onBarClick). */
export function CsCrmClusterChart({ data, onBarClick }: { data: ClusterSummary[]; onBarClick: (key: ClusterSummary["key"]) => void }) {
  if (data.length === 0) return null;
  const height = 220, padX = 20, padTop = 20, padBottom = 34;
  const slot = 80, barW = 46;
  const w = data.length * slot;
  const plotH = height - padTop - padBottom;
  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1);
  const maxAvg = Math.max(...data.map((d) => d.avgPerCustomer), 1);
  const cx = (i: number) => i * slot + slot / 2;
  const yBar = (v: number) => padTop + plotH - (v / maxRevenue) * plotH;
  const yLine = (v: number) => padTop + plotH - (v / maxAvg) * plotH;

  return (
    <div className="overflow-x-auto">
      <div className="mb-2 flex gap-4 text-xs font-bold text-slate-600">
        <span className="inline-flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-brand-red/70" />Total Belanja</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-0.5 w-4 rounded bg-amber-500" />Avg/Customer</span>
      </div>
      <svg viewBox={`0 0 ${w} ${height}`} className="w-full" style={{ minWidth: w * 0.65, maxHeight: height }}>
        {data.map((d, i) => (
          <rect
            key={d.key}
            x={cx(i) - barW / 2} y={yBar(d.revenue)} width={barW} height={padTop + plotH - yBar(d.revenue)}
            rx="5" fill={d.color} opacity="0.75" className="cursor-pointer transition hover:opacity-95"
            onClick={() => onBarClick(d.key)}
          >
            <title>{`${d.label}: ${formatRupiahRingkas(d.revenue)}`}</title>
          </rect>
        ))}
        <polyline points={data.map((d, i) => `${cx(i)},${yLine(d.avgPerCustomer)}`).join(" ")} fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {data.map((d, i) => <circle key={d.key} cx={cx(i)} cy={yLine(d.avgPerCustomer)} r="3" fill="#F59E0B" stroke="white" strokeWidth="1.5"><title>{`${d.label} avg: ${formatRupiahRingkas(d.avgPerCustomer)}`}</title></circle>)}
        {data.map((d, i) => <text key={d.key} x={cx(i)} y={height - 12} textAnchor="middle" fontSize="9.5" fontWeight="700" fill="#64748b">{d.label}</text>)}
      </svg>
    </div>
  );
}
