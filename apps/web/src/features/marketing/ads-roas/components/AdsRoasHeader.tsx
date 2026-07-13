"use client";

import { Calendar, RefreshCw } from "lucide-react";

interface AdsRoasHeaderProps {
  updateTerakhir: string;
  onRefresh?: () => void;
}

/** Header Iklan & ROAS — judul besar (merah+navy) kiri, card "Terakhir Update" + tombol
 * refresh kanan atas. Meniru persis layout mockup (bukan hero besar Sales & Order). */
export function AdsRoasHeader({ updateTerakhir, onRefresh }: AdsRoasHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-3xl font-extrabold tracking-[-0.03em] text-slate-900 sm:text-4xl">
          <span className="text-brand-red">Iklan</span> &amp; ROAS
        </h1>
        <p className="mt-2 max-w-2xl text-sm font-medium leading-relaxed text-slate-600">
          Analisis performa iklan, spending, sales, ROAS, ADV, campaign, dan toko untuk menentukan strategi iklan terbaik.
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <div className="flex items-center gap-2.5 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
          <Calendar className="size-4 text-slate-400" strokeWidth={2} />
          <div className="text-left">
            <p className="text-[10px] font-bold uppercase tracking-[0.04em] text-slate-400">Terakhir Update</p>
            <p className="text-sm font-bold text-slate-800">{updateTerakhir}</p>
          </div>
        </div>
        <button
          onClick={onRefresh}
          className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-brand-red/40 hover:text-brand-red"
          aria-label="Muat ulang data"
        >
          <RefreshCw className="size-4" strokeWidth={2.4} />
        </button>
      </div>
    </div>
  );
}
