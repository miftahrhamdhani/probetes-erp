"use client";

import { useState } from "react";
import { formatBulanRingkas, formatPersen } from "../lib/format";
import type { FrequencyData } from "../types/csCrmTypes";

interface CsCrmFrequencyTableProps {
  data: FrequencyData;
  onCellClick: (cohort: string, threshold: number) => void;
}

function heatColor(pct: number, isPeak: boolean): string {
  if (isPeak) return "bg-brand-red text-white";
  if (pct > 20) return "bg-brand-red/30 text-brand-red";
  if (pct > 5) return "bg-brand-red/15 text-brand-red";
  if (pct > 0) return "bg-brand-red/5 text-brand-red";
  return "bg-slate-50 text-slate-300";
}

/** Tabel Frequency — baris cohort, kolom 1X..19X+ ORDER, klik sel untuk drill-down. */
export function CsCrmFrequencyTable({ data, onCellClick }: CsCrmFrequencyTableProps) {
  const [sortDesc, setSortDesc] = useState(true);
  const rows = [...data.rows].sort((a, b) => (sortDesc ? b.cohort.localeCompare(a.cohort) : a.cohort.localeCompare(b.cohort)));

  return (
    <div className="rounded-[20px] bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-sm font-extrabold text-slate-900">Frequency Order per Cohort</h2>
        <button onClick={() => setSortDesc((s) => !s)} className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-bold text-slate-500 hover:bg-slate-50">
          {sortDesc ? "Terbaru dulu" : "Terlama dulu"}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-separate text-left text-xs" style={{ borderSpacing: "3px" }}>
          <thead>
            <tr className="text-slate-400">
              <th className="w-20 pb-2 px-1 font-bold uppercase tracking-[0.02em]">Cohort</th>
              {data.orderLabels.map((label) => (
                <th key={label} className="w-16 pb-2 px-1 text-center font-bold uppercase tracking-[0.02em]">{label.replace(" ORDER", "")}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const maxPct = Math.max(...row.orders.map((c) => c?.pct ?? 0));
              return (
                <tr key={row.cohort}>
                  <td className="whitespace-nowrap px-2 py-2 font-extrabold text-slate-800">{formatBulanRingkas(row.cohort)}</td>
                  {row.orders.map((cell, i) => (
                    <td key={i} className="p-0">
                      {cell === null ? (
                        <div className="rounded-md bg-slate-50 py-2 text-center text-slate-300">-</div>
                      ) : (
                        <button
                          onClick={() => onCellClick(row.cohort, i + 1)}
                          className={`w-full rounded-md py-2 text-center font-bold transition hover:opacity-80 ${heatColor(cell.pct, cell.pct === maxPct && i > 0)}`}
                          title={`${cell.count} customer (${formatPersen(cell.pct, 1)})`}
                        >
                          {cell.count}
                        </button>
                      )}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
