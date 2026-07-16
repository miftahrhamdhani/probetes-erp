"use client";

import { useEffect, useState } from "react";
import { Calendar } from "lucide-react";
import { DATE_RANGE_PRESETS, type DateRangePresetKey, type DateRangeValue } from "./dateRange.types";
import { resolvePreset, validateDateRange } from "./dateRange.validation";

export function DateRangePicker({ value, onChange }: { value: DateRangeValue; onChange: (next: DateRangeValue) => void }) {
  const [draft, setDraft] = useState(value);
  const [error, setError] = useState<string | null>(null);

  // URL dapat berubah dari preset/drilldown; selaraskan input manual dengan nilai baru.
  useEffect(
    () => setDraft({ startDate: value.startDate, endDate: value.endDate }),
    [value.endDate, value.startDate]
  );

  const applyDraft = () => {
    const result = validateDateRange(draft.startDate, draft.endDate);
    if (!result.valid) { setError(result.error); return; }
    setError(null);
    onChange(draft);
  };

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white p-2.5 shadow-sm">
      <Calendar className="ml-1 size-4 text-slate-400" strokeWidth={2.5} />
      <select
        className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs font-bold text-slate-600 outline-none"
        onChange={(e) => {
          const preset = e.target.value as DateRangePresetKey;
          if (preset === "custom") return;
          const next = resolvePreset(preset);
          setDraft(next);
          setError(null);
          onChange(next);
        }}
        defaultValue=""
      >
        <option value="" disabled>Preset...</option>
        {DATE_RANGE_PRESETS.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}
      </select>

      <input
        type="date"
        value={draft.startDate}
        onChange={(e) => setDraft((d) => ({ ...d, startDate: e.target.value }))}
        className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs font-semibold text-slate-700 outline-none"
      />
      <span className="text-xs font-bold text-slate-400">s/d</span>
      <input
        type="date"
        value={draft.endDate}
        onChange={(e) => setDraft((d) => ({ ...d, endDate: e.target.value }))}
        className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs font-semibold text-slate-700 outline-none"
      />

      <button
        onClick={applyDraft}
        className="rounded-lg bg-brand-red px-3 py-1.5 text-xs font-bold text-white transition hover:opacity-90"
      >
        Terapkan
      </button>
      <button
        onClick={() => { const next = resolvePreset("last30"); setDraft(next); setError(null); onChange(next); }}
        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-500 transition hover:bg-slate-50"
      >
        Reset
      </button>

      {error && <p className="w-full text-xs font-semibold text-red-600">{error}</p>}
    </div>
  );
}
