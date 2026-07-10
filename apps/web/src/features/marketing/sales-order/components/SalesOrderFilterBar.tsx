"use client";

import { Calendar, Filter, RotateCcw } from "lucide-react";
import type { FilterOption } from "../types/salesOrder.types";

export interface SalesOrderSelectFilter {
  key: string;
  label: string;
  value: string;
  options: FilterOption[];
}

interface SalesOrderFilterBarProps {
  periodeLabel: string;
  selects: SalesOrderSelectFilter[];
  onSelectChange: (key: string, value: string) => void;
  onApply?: () => void;
  onReset?: () => void;
}

/** Filter bar bergaya form seperti mockup: label kecil di atas tiap kontrol, tombol merah
 * "Terapkan Filter" di ujung kanan, wrap rapi ke bawah di layar sempit. */
export function SalesOrderFilterBar({ periodeLabel, selects, onSelectChange, onApply, onReset }: SalesOrderFilterBarProps) {
  return (
    <div className="flex flex-wrap items-end gap-4 rounded-[22px] bg-white p-4 shadow-sm sm:p-5">
      <FieldShell label="Periode">
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-bold text-slate-700">
          <Calendar className="size-4 shrink-0 text-slate-400" strokeWidth={2} />
          <span className="whitespace-nowrap">{periodeLabel}</span>
        </div>
      </FieldShell>

      {selects.map((sel) => (
        <FieldShell key={sel.key} label={sel.label}>
          <select
            value={sel.value}
            onChange={(e) => onSelectChange(sel.key, e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-bold text-slate-700 outline-none focus:border-brand-red"
          >
            {sel.options.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </FieldShell>
      ))}

      <div className="ml-auto flex items-center gap-2">
        {onReset && (
          <button onClick={onReset} className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-400 transition hover:text-brand-red">
            <RotateCcw className="size-3.5" strokeWidth={2.5} /> Reset Filter
          </button>
        )}
        <button onClick={onApply} className="inline-flex items-center gap-2 rounded-xl bg-brand-red px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#c90510]">
          <Filter className="size-4" strokeWidth={2.5} /> Terapkan Filter
        </button>
      </div>
    </div>
  );
}

function FieldShell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold uppercase tracking-[0.06em] text-slate-400">{label}</span>
      {children}
    </label>
  );
}
