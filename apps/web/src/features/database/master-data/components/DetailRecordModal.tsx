"use client";

import type { ReactNode } from "react";
import { X } from "lucide-react";

export interface DetailField {
  label: string;
  value: string | number | null | undefined;
}

interface DetailRecordModalProps {
  title: string;
  subtitle?: string;
  fields: DetailField[];
  actions?: ReactNode;
  onClose: () => void;
}

export function DetailRecordModal({ title, subtitle, fields, actions, onClose }: DetailRecordModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-6">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-auto rounded-3xl bg-white p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-xl font-black tracking-[-0.03em] text-slate-950">{title}</h2>
            {subtitle && <p className="mt-1 text-sm font-medium text-slate-500">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid size-9 shrink-0 place-items-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-brand-red/40 hover:text-brand-red"
            aria-label="Tutup"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {fields.map((field) => (
            <div key={field.label} className="flex flex-col gap-1.5 rounded-2xl border border-slate-100 bg-slate-50/70 p-3">
              <span className="text-xs font-black uppercase tracking-[0.08em] text-slate-500">{field.label}</span>
              <span className="break-words text-sm font-semibold leading-6 text-slate-800">
                {field.value === null || field.value === undefined || field.value === "" ? "-" : String(field.value)}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4">
          {actions}
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
