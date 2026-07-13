"use client";

import { X } from "lucide-react";
import { formatRupiahRingkas } from "../lib/format";
import type { DrillDownResult } from "../types/csCrmTypes";

interface CsCrmDrillDownModalProps {
  data: DrillDownResult | null;
  loading: boolean;
  onClose: () => void;
}

/** Modal drill-down customer — dipicu klik sel Retention/Frequency atau kartu Cluster,
 * mengikuti perilaku dashboard referensi (klik kotak -> tabel detail customer). */
export function CsCrmDrillDownModal({ data, loading, onClose }: CsCrmDrillDownModalProps) {
  if (!data && !loading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4" onClick={onClose}>
      <div className="flex max-h-[85vh] w-full max-w-4xl flex-col rounded-[22px] bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-5">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900">{data?.title ?? "Memuat..."}</h3>
            <p className="mt-0.5 text-sm font-medium text-slate-500">{data?.subtitle ?? ""}</p>
          </div>
          <button onClick={onClose} className="flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200">
            <X className="size-4" />
          </button>
        </div>

        <div className="overflow-auto p-5">
          {loading && <p className="py-10 text-center text-sm font-semibold text-slate-400">Memuat data customer...</p>}
          {!loading && data && data.rows.length === 0 && <p className="py-10 text-center text-sm font-semibold text-slate-400">Tidak ada customer untuk kriteria ini.</p>}
          {!loading && data && data.rows.length > 0 && (
            <table className="w-full whitespace-nowrap text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-bold uppercase tracking-[0.02em] text-slate-400">
                  <th className="pb-2 pr-4">No HP</th>
                  <th className="pb-2 pr-4">Nama</th>
                  <th className="pb-2 pr-4 text-right">Total Belanja</th>
                  <th className="pb-2 pr-4 text-right">Total Fisik</th>
                  <th className="pb-2 pr-4 text-right">Freq</th>
                  <th className="pb-2 pr-4">Masuk Grup</th>
                  <th className="pb-2 pr-4">Produk</th>
                  <th className="pb-2">CS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 font-medium text-slate-700">
                {data.rows.map((row) => (
                  <tr key={row.hp}>
                    <td className="py-2.5 pr-4 font-mono text-xs text-blue-600">0{row.hp.slice(2)}</td>
                    <td className="py-2.5 pr-4 font-bold text-slate-900">{row.nama}</td>
                    <td className="py-2.5 pr-4 text-right">{formatRupiahRingkas(row.totalBelanja)}</td>
                    <td className="py-2.5 pr-4 text-right">{formatRupiahRingkas(row.totalFisik)}</td>
                    <td className="py-2.5 pr-4 text-right">{row.freq}x</td>
                    <td className="py-2.5 pr-4">
                      <span className={`rounded-md px-2 py-0.5 text-xs font-bold ${row.masukGrup ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                        {row.masukGrup ? "✓ Grup" : "✗ Grup"}
                      </span>
                    </td>
                    <td className="max-w-[220px] truncate py-2.5 pr-4 text-xs text-slate-500" title={row.produk.join(", ")}>{row.produk.join(", ")}</td>
                    <td className="py-2.5 text-xs text-slate-500">{row.cs.join(", ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
