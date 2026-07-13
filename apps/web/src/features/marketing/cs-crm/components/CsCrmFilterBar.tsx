"use client";

import { Calendar, Package, RefreshCw, Search, Users } from "lucide-react";
import type { FilterOption } from "../types/csCrmTypes";

interface CsCrmFilterBarProps {
  search: string;
  onSearchChange: (v: string) => void;
  dari: string;
  sampai: string;
  onDariChange: (v: string) => void;
  onSampaiChange: (v: string) => void;
  produk: string;
  onProdukChange: (v: string) => void;
  cs: string;
  onCsChange: (v: string) => void;
  produkOptions: FilterOption[];
  csOptions: FilterOption[];
  onUpdate?: () => void;
}

/** Filter bar horizontal mengikuti dashboard referensi: search, rentang tanggal, produk,
 * CS, tombol Update — style card putih & tombol merah Probetes. */
export function CsCrmFilterBar({
  search, onSearchChange, dari, sampai, onDariChange, onSampaiChange,
  produk, onProdukChange, cs, onCsChange, produkOptions, csOptions, onUpdate,
}: CsCrmFilterBarProps) {
  return (
    <div className="flex flex-wrap items-end gap-3 rounded-[20px] bg-white p-4 shadow-sm">
      <label className="block min-w-[220px] flex-[2]">
        <span className="mb-1 flex items-center gap-1.5 text-xs font-bold text-slate-500">
          <Search className="size-3.5 text-slate-400" strokeWidth={2.2} /> Cari Customer / ID
        </span>
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Nama, No HP, atau ID..."
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-bold text-slate-700 outline-none focus:border-brand-red"
        />
      </label>

      <label className="block min-w-[130px]">
        <span className="mb-1 flex items-center gap-1.5 text-xs font-bold text-slate-500"><Calendar className="size-3.5 text-slate-400" strokeWidth={2.2} /> Dari</span>
        <input type="date" value={dari} onChange={(e) => onDariChange(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-bold text-slate-700 outline-none focus:border-brand-red" />
      </label>
      <label className="block min-w-[130px]">
        <span className="mb-1 flex items-center gap-1.5 text-xs font-bold text-slate-500"><Calendar className="size-3.5 text-slate-400" strokeWidth={2.2} /> Sampai</span>
        <input type="date" value={sampai} onChange={(e) => onSampaiChange(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-bold text-slate-700 outline-none focus:border-brand-red" />
      </label>

      <label className="block min-w-[160px] flex-1">
        <span className="mb-1 flex items-center gap-1.5 text-xs font-bold text-slate-500"><Package className="size-3.5 text-slate-400" strokeWidth={2.2} /> Produk</span>
        <select value={produk} onChange={(e) => onProdukChange(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-bold text-slate-700 outline-none focus:border-brand-red">
          {produkOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      </label>

      <label className="block min-w-[140px] flex-1">
        <span className="mb-1 flex items-center gap-1.5 text-xs font-bold text-slate-500"><Users className="size-3.5 text-slate-400" strokeWidth={2.2} /> CS</span>
        <select value={cs} onChange={(e) => onCsChange(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-bold text-slate-700 outline-none focus:border-brand-red">
          {csOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      </label>

      <button onClick={onUpdate} className="inline-flex h-[42px] shrink-0 items-center gap-2 self-end rounded-xl bg-brand-red px-4 text-sm font-bold text-white shadow-sm transition hover:bg-[#c90510]">
        <RefreshCw className="size-4" strokeWidth={2.5} /> Update
      </button>
    </div>
  );
}
