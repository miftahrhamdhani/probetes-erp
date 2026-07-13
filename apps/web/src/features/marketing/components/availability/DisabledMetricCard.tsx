import { Lock } from "lucide-react";

/** Kartu KPI/metric yang sengaja dinonaktifkan (NOT_AVAILABLE / NEED_MAPPING). */
export function DisabledMetricCard({ label, reason }: { label: string; reason: string }) {
  return (
    <div className="flex flex-col justify-between rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.02em] text-slate-400">
        <Lock className="size-3.5" strokeWidth={2.5} />
        {label}
      </div>
      <p className="mt-2 text-2xl font-black text-slate-300">—</p>
      <p className="mt-1 text-xs font-medium text-slate-400">{reason}</p>
    </div>
  );
}
