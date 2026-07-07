"use client";

import type { ReactNode } from "react";
import { Search, X } from "lucide-react";
import { formatNumber } from "../lib/format";

interface ToolbarOption {
  value: string;
  label: string;
}

export function ToolbarSelect({
  value,
  onChange,
  options,
  allLabel,
}: {
  value: string;
  onChange: (value: string) => void;
  options: ToolbarOption[];
  allLabel: string;
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-10 max-w-[200px] rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-brand-red/40 focus:ring-4 focus:ring-brand-red/10"
    >
      <option value="">{allLabel}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

export function TableToolbar({
  query,
  onQuery,
  placeholder,
  total,
  totalAll,
  onReset,
  hasActive,
  children,
}: {
  query: string;
  onQuery: (value: string) => void;
  placeholder: string;
  total: number;
  totalAll: number;
  onReset: () => void;
  hasActive: boolean;
  children?: ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2.5">
      <label className="relative min-w-[220px] flex-1 sm:max-w-[320px]">
        <span className="sr-only">Cari data</span>
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        <input
          value={query}
          onChange={(event) => onQuery(event.target.value)}
          placeholder={placeholder}
          type="search"
          className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-brand-red/40 focus:ring-4 focus:ring-brand-red/10"
        />
      </label>

      {children}

      {hasActive && (
        <button
          type="button"
          onClick={onReset}
          className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 transition hover:border-brand-red/40 hover:text-brand-red"
        >
          <X className="size-3.5" />
          Reset
        </button>
      )}

      <span className="ml-auto whitespace-nowrap text-xs font-semibold text-slate-500">
        {formatNumber(total)} dari {formatNumber(totalAll)} data
      </span>
    </div>
  );
}
