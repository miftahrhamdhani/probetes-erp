"use client";

import { useState } from "react";
import { CheckCircle2, Upload, X } from "lucide-react";

interface ModuleImportModalProps {
  title: string;
  /** Contoh: ["TikTok Shop", "Shopee", "Input Manual CS"] */
  sourceOptions: string[];
  /** Nama kolom yang akan diperiksa saat "Validasi Preview" (tampilan saja). */
  expectedColumns: string[];
  onClose: () => void;
  /** Dipanggil setelah user menekan "Simpan Preview" — hanya mengubah state lokal pemanggil. */
  onConfirm: () => void;
}

/**
 * Modal alur Import frontend-only: pilih file dummy -> pilih sumber -> preview
 * kolom -> validasi (simulasi) -> simpan ke state lokal. Tidak ada panggilan API.
 */
export function ModuleImportModal({ title, sourceOptions, expectedColumns, onClose, onConfirm }: ModuleImportModalProps) {
  const [fileName, setFileName] = useState("");
  const [source, setSource] = useState(sourceOptions[0] ?? "");
  const [validated, setValidated] = useState(false);

  const handleFilePick = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setFileName(file?.name ?? "");
    setValidated(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-6">
      <div className="w-full max-w-xl rounded-3xl bg-white p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-xl font-black tracking-[-0.03em] text-slate-950">{title}</h2>
            <p className="mt-1 text-sm font-medium text-slate-500">
              Preview alur import — file tidak diunggah ke server, hanya simulasi tampilan.
            </p>
          </div>
          <button type="button" onClick={onClose} className="grid size-9 shrink-0 place-items-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-brand-red/40 hover:text-brand-red" aria-label="Tutup">
            <X className="size-4" />
          </button>
        </div>

        <div className="mt-5 flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-black uppercase tracking-[0.08em] text-slate-500">Sumber / Tipe Data</span>
            <select
              value={source}
              onChange={(event) => { setSource(event.target.value); setValidated(false); }}
              className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 outline-none focus:border-brand-red/40 focus:ring-4 focus:ring-brand-red/10"
            >
              {sourceOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-black uppercase tracking-[0.08em] text-slate-500">File (CSV/XLSX)</span>
            <div className="flex h-11 items-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 text-sm font-semibold text-slate-600">
              <Upload className="size-4 shrink-0 text-slate-400" strokeWidth={2.2} />
              <span className="truncate">{fileName || "Pilih file dummy…"}</span>
              <input type="file" accept=".csv,.xlsx,.xls" onChange={handleFilePick} className="ml-auto max-w-[110px] cursor-pointer text-xs file:hidden" />
            </div>
          </label>

          <div className="rounded-xl bg-slate-50 p-3">
            <p className="text-xs font-black uppercase tracking-[0.08em] text-slate-500">Preview Kolom</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {expectedColumns.map((column) => (
                <span key={column} className="rounded-lg bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
                  {column}
                </span>
              ))}
            </div>
          </div>

          {validated && (
            <p className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
              <CheckCircle2 className="size-4" strokeWidth={2.2} />
              Preview valid — kolom sesuai, siap disimpan sebagai data preview.
            </p>
          )}
        </div>

        <div className="mt-6 flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50">
            Batal
          </button>
          {!validated ? (
            <button
              type="button"
              disabled={!fileName}
              onClick={() => setValidated(true)}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Validasi Preview
            </button>
          ) : (
            <button type="button" onClick={onConfirm} className="rounded-xl bg-brand-red px-4 py-2 text-sm font-bold text-white transition hover:bg-[#d60511]">
              Simpan Preview
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
