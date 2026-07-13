"use client";

import { Calendar, Filter, MapPin, Megaphone, Package, Store, User } from "lucide-react";
import type { FilterOption } from "../types/marketingAdsRoasTypes";

export interface AdsRoasSelectFilter {
  key: string;
  label: string;
  value: string;
  icon: "calendar" | "platform" | "adv" | "toko" | "campaign" | "produk";
  options: FilterOption[];
}

interface AdsRoasFilterBarProps {
  selects: AdsRoasSelectFilter[];
  onSelectChange: (key: string, value: string) => void;
  onApply?: () => void;
}

const ICONS = { calendar: Calendar, platform: MapPin, adv: User, toko: Store, campaign: Megaphone, produk: Package };

/** Filter bar horizontal 6 field + tombol merah "Terapkan Filter" — persis layout mockup. */
export function AdsRoasFilterBar({ selects, onSelectChange, onApply }: AdsRoasFilterBarProps) {
  return (
    <div className="flex flex-wrap items-end gap-3 rounded-[20px] bg-white p-4 shadow-sm">
      {selects.map((sel) => {
        const Icon = ICONS[sel.icon];
        return (
          <label key={sel.key} className="block min-w-[150px] flex-1">
            <span className="mb-1 flex items-center gap-1.5 text-xs font-bold text-slate-500">
              <Icon className="size-3.5 text-slate-400" strokeWidth={2.2} />
              {sel.label}
            </span>
            <select
              value={sel.value}
              onChange={(e) => onSelectChange(sel.key, e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-bold text-slate-700 outline-none focus:border-brand-red"
            >
              {sel.options.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </label>
        );
      })}

      <button onClick={onApply} className="inline-flex h-[42px] shrink-0 items-center gap-2 self-end rounded-xl bg-brand-red px-4 text-sm font-bold text-white shadow-sm transition hover:bg-[#c90510]">
        <Filter className="size-4" strokeWidth={2.5} /> Terapkan Filter
      </button>
    </div>
  );
}
