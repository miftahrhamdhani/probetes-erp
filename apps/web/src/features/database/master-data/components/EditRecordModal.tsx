"use client";

import { useState } from "react";
import { X } from "lucide-react";

export interface EditField<T extends object> {
  key: keyof T;
  label: string;
  type?: "text" | "number";
  readOnly?: boolean;
}

interface EditRecordModalProps<T extends object> {
  title: string;
  record: T;
  fields: EditField<T>[];
  onClose: () => void;
  onSave: (record: T) => void | Promise<void>;
  /** Catatan di bawah judul. Default: peringatan perubahan masih mock. */
  note?: string;
}

export function EditRecordModal<T extends object>({
  title,
  record,
  fields,
  onClose,
  onSave,
  note = "Perubahan ini sementara di frontend, belum tersimpan ke database.",
}: EditRecordModalProps<T>) {
  const [draft, setDraft] = useState<T>(record);
  const [busy, setBusy] = useState(false);

  const handleSave = async () => {
    setBusy(true);
    try {
      await onSave(draft);
    } finally {
      setBusy(false);
    }
  };

  const setValue = (key: keyof T, value: string, type: EditField<T>["type"]) => {
    setDraft((current) => ({
      ...current,
      [key]: type === "number" ? Number(value) : value,
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-6">
      <div className="w-full max-w-2xl rounded-3xl bg-white p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-xl font-black tracking-[-0.03em] text-slate-950">{title}</h2>
            <p className="mt-1 text-sm font-medium text-slate-500">{note}</p>
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
            <label key={String(field.key)} className="flex flex-col gap-1.5">
              <span className="text-xs font-black uppercase tracking-[0.08em] text-slate-500">{field.label}</span>
              <input
                value={String(draft[field.key] ?? "")}
                type={field.type ?? "text"}
                readOnly={field.readOnly}
                onChange={(event) => setValue(field.key, event.target.value, field.type)}
                className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-brand-red/40 focus:ring-4 focus:ring-brand-red/10 read-only:bg-slate-50 read-only:text-slate-400"
              />
            </label>
          ))}
        </div>

        <div className="mt-6 flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={busy}
            className="rounded-xl bg-brand-red px-4 py-2 text-sm font-bold text-white transition hover:bg-[#d60511] disabled:opacity-60"
          >
            {busy ? "Menyimpan…" : "Simpan Perubahan"}
          </button>
        </div>
      </div>
    </div>
  );
}
