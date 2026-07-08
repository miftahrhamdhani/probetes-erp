"use client";

import type { ReactNode } from "react";
import { Search, X } from "lucide-react";
import { formatNumber } from "../lib/format";

interface ToolbarOption {
  value: string;
  label: string;
}

/** Filter rentang tanggal: pilih dari tanggal, sampai tanggal, atau keduanya untuk 1 tanggal spesifik. */
export function DateRangeFilter({
  from,
  to,
  onFrom,
  onTo,
  label = "Tanggal",
}: {
  from: string;
  to: string;
  onFrom: (value: string) => void;
  onTo: (value: string) => void;
  label?: string;
}) {
  return (
    <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 h-10">
      <span className="whitespace-nowrap text-xs font-bold text-slate-500">{label}</span>
      <input
        type="date"
        value={from}
        onChange={(event) => onFrom(event.target.value)}
        aria-label={`${label} dari`}
        className="h-8 w-[132px] rounded-lg border-0 bg-transparent text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-brand-red/10"
      />
      <span className="text-xs font-medium text-slate-400">–</span>
      <input
        type="date"
        value={to}
        onChange={(event) => onTo(event.target.value)}
        aria-label={`${label} sampai`}
        className="h-8 w-[132px] rounded-lg border-0 bg-transparent text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-brand-red/10"
      />
    </div>
  );
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
