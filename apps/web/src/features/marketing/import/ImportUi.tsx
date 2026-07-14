"use client";

import { useState, type ReactNode } from "react";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import type { ImportSourceOption, ImportValidationStatus } from "@/server/modules/marketing/import/import.types";

export function PlatformCard({
  onClick,
  logo,
  title,
  badge,
}: {
  onClick: () => void;
  logo: ReactNode;
  title: string;
  badge: string;
}) {
  return (
    <button onClick={onClick} className="group relative flex w-full items-center gap-4 overflow-hidden rounded-2xl border border-transparent bg-[#e30613] p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:bg-[#c90510]">
      <div className="flex size-[60px] shrink-0 items-center justify-center rounded-xl bg-white shadow-sm transition-transform group-hover:scale-105">{logo}</div>
      <div className="min-w-0 flex-1">
        <h3 className="text-lg font-bold tracking-[-0.02em] text-white">{title}</h3>
        <span className="mt-1.5 inline-block rounded-full bg-white px-2.5 py-0.5 text-xs font-bold text-[#e30613]">{badge}</span>
      </div>
      <ChevronRight className="size-6 text-white/70 transition group-hover:translate-x-1 group-hover:text-white" />
    </button>
  );
}

export function ImportTypeCard({
  onClick,
  icon,
  title,
  description,
}: {
  onClick: () => void;
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <button onClick={onClick} className="group flex flex-col items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-6 text-left transition hover:-translate-y-0.5 hover:border-brand-red hover:bg-brand-red/5">
      <div className="flex size-12 items-center justify-center rounded-xl bg-brand-red/10 text-brand-red transition group-hover:bg-brand-red group-hover:text-white">{icon}</div>
      <div>
        <h3 className="text-base font-bold text-slate-900">{title}</h3>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
      <span className="mt-auto inline-flex items-center gap-1 pt-2 text-sm font-bold text-brand-red">Pilih <ChevronRight className="size-4" /></span>
    </button>
  );
}

export function PanelHeader({
  onBack,
  title,
  subtitle,
}: {
  onBack: () => void;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mb-6 flex items-center gap-4 border-b border-slate-100 pb-4">
      <button onClick={onBack} aria-label="Kembali" className="flex size-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200">
        <ArrowLeft className="size-4" />
      </button>
      <div>
        <h2 className="text-xl font-bold tracking-[-0.02em] text-slate-900">{title}</h2>
        <p className="text-sm font-medium text-slate-500">{subtitle}</p>
      </div>
    </div>
  );
}

export function ChipSelector({
  options,
  selectedId,
  onSelect,
  onAdd,
  onDelete,
  onEdit,
  icon,
  addLabel,
  placeholder,
  disabled,
}: {
  options: ImportSourceOption[];
  selectedId: string | null;
  onSelect: (option: ImportSourceOption) => void;
  onAdd: (label: string) => Promise<void>;
  onDelete: (option: ImportSourceOption) => Promise<void>;
  onEdit: (option: ImportSourceOption, label: string) => Promise<void>;
  icon: ReactNode;
  addLabel: string;
  placeholder: string;
  disabled?: boolean;
}) {
  const [adding, setAdding] = useState(false);
  const [value, setValue] = useState("");
  const [editing, setEditing] = useState<ImportSourceOption | null>(null);
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);

  const submitAdd = async () => {
    if (!value.trim() || saving) return;
    setSaving(true);
    try {
      await onAdd(value.trim());
      setValue("");
      setAdding(false);
    } finally {
      setSaving(false);
    }
  };
  const submitEdit = async () => {
    if (!editing || !editValue.trim() || saving) return;
    setSaving(true);
    try {
      await onEdit(editing, editValue.trim());
      setEditing(null);
      setEditValue("");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {options.map((option) => {
        if (editing?.id === option.id) {
          return (
            <span key={option.id} className="inline-flex items-center gap-1 rounded-xl border border-brand-red/30 bg-white px-2 py-1.5">
              <input
                autoFocus
                value={editValue}
                disabled={saving}
                onChange={(event) => setEditValue(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") void submitEdit();
                  if (event.key === "Escape") setEditing(null);
                }}
                className="w-36 text-sm outline-none"
              />
              <button disabled={saving} onClick={() => void submitEdit()} className="rounded-lg bg-brand-red p-1 text-white disabled:opacity-50"><Check className="size-4" /></button>
              <button disabled={saving} onClick={() => setEditing(null)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"><X className="size-4" /></button>
            </span>
          );
        }
        const active = selectedId === option.id;
        return (
          <span key={option.id} className={`group inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-bold transition ${active ? "border-brand-red bg-brand-red/5 text-brand-red" : "border-slate-200 bg-white text-slate-700 hover:border-brand-red/40"}`}>
            <button disabled={disabled} onClick={() => onSelect(option)} className="inline-flex items-center gap-2 disabled:opacity-50">{icon}{option.label}</button>
            <button
              disabled={disabled}
              onClick={() => { setEditing(option); setEditValue(option.label); }}
              title="Edit nama"
              className="text-slate-300 hover:text-brand-red disabled:opacity-50"
            ><Pencil className="size-3.5" /></button>
            <button
              disabled={disabled}
              onClick={() => void onDelete(option)}
              title="Hapus"
              className="text-slate-300 hover:text-red-500 disabled:opacity-50"
            ><Trash2 className="size-3.5" /></button>
          </span>
        );
      })}
      {adding ? (
        <span className="inline-flex items-center gap-1 rounded-xl border border-brand-red/30 bg-white px-2 py-1.5">
          <input
            autoFocus
            value={value}
            disabled={saving}
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") void submitAdd();
              if (event.key === "Escape") setAdding(false);
            }}
            placeholder={placeholder}
            className="w-36 text-sm outline-none"
          />
          <button disabled={saving} onClick={() => void submitAdd()} className="rounded-lg bg-brand-red p-1 text-white disabled:opacity-50"><Check className="size-4" /></button>
          <button disabled={saving} onClick={() => setAdding(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"><X className="size-4" /></button>
        </span>
      ) : (
        <button disabled={disabled} onClick={() => setAdding(true)} className="inline-flex items-center gap-1.5 rounded-xl border-2 border-dashed border-slate-300 px-3 py-2 text-sm font-bold text-slate-500 transition hover:border-brand-red hover:text-brand-red disabled:opacity-50">
          <Plus className="size-4" /> {addLabel}
        </button>
      )}
    </div>
  );
}

export function ValidationBadge({ status }: { status: ImportValidationStatus }) {
  const style = status === "valid"
    ? "bg-emerald-100 text-emerald-800"
    : status === "review"
      ? "bg-amber-100 text-amber-800"
      : status === "duplicate"
        ? "bg-violet-100 text-violet-800"
        : "bg-red-100 text-red-800";
  const label = status === "valid" ? "Valid" : status === "review" ? "Perlu Dicek" : status === "duplicate" ? "Duplikat" : "Error";
  return <span className={`inline-flex rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${style}`}>{label}</span>;
}
