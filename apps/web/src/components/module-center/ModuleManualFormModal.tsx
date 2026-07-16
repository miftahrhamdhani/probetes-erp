"use client";

import { useState } from "react";
import { X } from "lucide-react";

export interface ManualFormField {
  key: string;
  label: string;
  type?: "text" | "number" | "date" | "select";
  options?: string[];
  defaultValue?: string;
}

interface ModuleManualFormModalProps {
  title: string;
  fields: ManualFormField[];
  onClose: () => void;
  /** Dipanggil dengan nilai form saat "Tambah Preview" ditekan — hanya update state lokal pemanggil. */
  onSubmit: (values: Record<string, string>) => void;
  submitLabel?: string;
}

/**
 * Modal form generik untuk aksi "Tambah Manual" di halaman detail submenu.
 * Data hasil submit hanya masuk ke state lokal pemanggil (belum ke backend).
 */
export function ModuleManualFormModal({ title, fields, onClose, onSubmit, submitLabel = "Tambah Preview" }: ModuleManualFormModalProps) {
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(fields.map((f) => [f.key, f.defaultValue ?? (f.type === "select" ? f.options?.[0] ?? "" : "")])),
  );

  const setValue = (key: string, value: string) => setValues((current) => ({ ...current, [key]: value }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-6">
      <div className="w-full max-w-2xl rounded-3xl bg-white p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-xl font-black tracking-[-0.03em] text-slate-950">{title}</h2>
            <p className="mt-1 text-sm font-medium text-slate-500">Data ini hanya tersimpan sementara di tampilan, belum ke database.</p>
          </div>
          <button type="button" onClick={onClose} className="grid size-9 shrink-0 place-items-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-brand-red/40 hover:text-brand-red" aria-label="Tutup">
            <X className="size-4" />
          </button>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {fields.map((field) => (
            <label key={field.key} className="flex flex-col gap-1.5">
              <span className="text-xs font-black uppercase tracking-[0.08em] text-slate-500">{field.label}</span>
              {field.type === "select" ? (
                <select
                  value={values[field.key]}
                  onChange={(event) => setValue(field.key, event.target.value)}
                  className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 outline-none focus:border-brand-red/40 focus:ring-4 focus:ring-brand-red/10"
                >
                  {field.options?.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              ) : (
                <input
                  value={values[field.key]}
                  type={field.type === "date" ? "date" : field.type === "number" ? "number" : "text"}
                  onChange={(event) => setValue(field.key, event.target.value)}
                  className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 outline-none focus:border-brand-red/40 focus:ring-4 focus:ring-brand-red/10"
                />
              )}
            </label>
          ))}
        </div>

        <div className="mt-6 flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50">
            Batal
          </button>
          <button type="button" onClick={() => onSubmit(values)} className="rounded-xl bg-brand-red px-4 py-2 text-sm font-bold text-white transition hover:bg-[#d60511]">
            {submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
