"use client";

import { useState } from "react";
import { formatBulanRingkas, formatPersen, formatRupiahRingkas } from "../lib/format";
import type { RetentionData } from "../types/csCrmTypes";

interface CsCrmRetentionTableProps {
  data: RetentionData;
  showMode: "users" | "revenue";
  onShowModeChange: (mode: "users" | "revenue") => void;
  onCellClick: (cohort: string, monthOffset: number) => void;
}

function heatColor(pct: number): string {
  if (pct > 80) return "bg-brand-red text-white";
  if (pct > 40) return "bg-brand-red/60 text-white";
  if (pct > 30) return "bg-brand-red/40 text-brand-red";
  if (pct > 20) return "bg-brand-red/20 text-brand-red";
  if (pct > 0) return "bg-brand-red/5 text-brand-red";
  return "bg-slate-50 text-slate-400";
}

/** Tabel cohort Retention — heatmap Month 0..12, klik sel untuk drill-down customer.
 * Mengikuti struktur dashboard referensi (COHORT, TOTAL SALES, NEW CUST, RETENSI,
 * AVG RETENSI, RASIO RETENSI, lalu Month 0-12). */
export function CsCrmRetentionTable({ data, showMode, onShowModeChange, onCellClick }: CsCrmRetentionTableProps) {
  const [sortDesc, setSortDesc] = useState(true);
  const rows = [...data.rows].sort((a, b) => (sortDesc ? b.cohort.localeCompare(a.cohort) : a.cohort.localeCompare(b.cohort)));
  const monthCount = data.rows[0]?.months.length ?? 13;

  return (
    <div className="rounded-[20px] bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-sm font-extrabold text-slate-900">Cohort Retensi</h2>
        <div className="flex items-center gap-2">
          <button onClick={() => setSortDesc((s) => !s)} className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-bold text-slate-500 hover:bg-slate-50">
            {sortDesc ? "Terbaru dulu" : "Terlama dulu"}
          </button>
          <div className="inline-flex rounded-lg border border-slate-200 p-0.5">
            {(["users", "revenue"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => onShowModeChange(mode)}
                className={`rounded-md px-2.5 py-1 text-xs font-bold transition ${showMode === mode ? "bg-brand-red text-white" : "text-slate-500 hover:bg-slate-50"}`}
              >
                {mode === "users" ? "Users" : "Revenue"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-separate text-left text-xs" style={{ borderSpacing: "3px" }}>
          <thead>
            <tr className="text-slate-400">
              <th className="w-24 pb-2 px-1 font-bold uppercase tracking-[0.02em]">Cohort</th>
              <th className="w-20 pb-2 px-1 text-right font-bold uppercase tracking-[0.02em]">Total Sales</th>
              <th className="w-20 pb-2 px-1 text-right font-bold uppercase tracking-[0.02em]">New Cust</th>
              <th className="w-20 pb-2 px-1 text-right font-bold uppercase tracking-[0.02em]">Retensi</th>
              <th className="w-20 pb-2 px-1 text-right font-bold uppercase tracking-[0.02em]">Avg Retensi</th>
              <th className="w-16 pb-2 px-1 text-right font-bold uppercase tracking-[0.02em]">Rasio</th>
              {Array.from({ length: monthCount }, (_, i) => (
                <th key={i} className="w-16 pb-2 px-1 text-center font-bold uppercase tracking-[0.02em]">M{i}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.cohort}>
                <td className="whitespace-nowrap px-2 py-2 font-extrabold text-slate-800">{formatBulanRingkas(row.cohort)}</td>
                <td className="whitespace-nowrap px-2 py-2 text-right font-semibold text-slate-600">{formatRupiahRingkas(row.totalSales)}</td>
                <td className="whitespace-nowrap px-2 py-2 text-right font-semibold text-slate-600">{formatRupiahRingkas(row.newCustSales)}</td>
                <td className="whitespace-nowrap px-2 py-2 text-right font-semibold text-emerald-600">{formatRupiahRingkas(row.retensiSales)}</td>
                <td className="whitespace-nowrap px-2 py-2 text-right font-semibold text-slate-600">{formatRupiahRingkas(row.avgRetensi)}</td>
                <td className="whitespace-nowrap px-2 py-2 text-right font-bold text-slate-800">{formatPersen(row.rasioRetensi, 1)}</td>
                {row.months.map((cell, i) => (
                  <td key={i} className="p-0">
                    {cell === null ? (
                      <div className="rounded-md bg-slate-50 py-2 text-center text-slate-300">-</div>
                    ) : (
                      <button
                        onClick={() => onCellClick(row.cohort, i)}
                        className={`w-full rounded-md py-2 text-center font-bold transition hover:opacity-80 ${heatColor(cell.pct)}`}
                        title={`${cell.count} customer (${formatPersen(cell.pct, 1)})`}
                      >
                        {showMode === "users" ? cell.count : formatPersen(cell.pct, 0)}
                      </button>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-brand-red/30">
              <td colSpan={6} className="whitespace-nowrap px-2 pt-2 text-right text-xs font-extrabold text-brand-red">Rata-rata Retensi Global:</td>
              {data.globalAvg.map((v, i) => (
                <td key={i} className="px-2 pt-2 text-center text-xs font-extrabold text-brand-red">{v === null ? "-" : formatPersen(v, 1)}</td>
              ))}
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
