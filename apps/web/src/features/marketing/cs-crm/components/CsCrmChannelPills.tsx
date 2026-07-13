"use client";

import type { FilterOption } from "../types/csCrmTypes";

interface CsCrmChannelPillsProps {
  value: string;
  onChange: (v: string) => void;
  options: FilterOption[];
}

/** Pemisah "Semua Data / Akuisisi (Meta/CRM) / Marketplace" sesuai permintaan owner —
 * dipetakan ke master.channels.type saat data asli tersambung nanti. */
export function CsCrmChannelPills({ value, onChange, options }: CsCrmChannelPillsProps) {
  return (
    <div className="inline-flex flex-wrap gap-1.5 rounded-2xl bg-white p-1.5 shadow-sm">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`rounded-xl px-4 py-2 text-sm font-bold transition ${active ? "bg-brand-red text-white shadow-sm" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"}`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
