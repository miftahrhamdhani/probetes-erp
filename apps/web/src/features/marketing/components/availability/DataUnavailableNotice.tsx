import { Info } from "lucide-react";

/** Notice full-width untuk section yang seluruhnya NOT_AVAILABLE (mis. ERP ROAS). */
export function DataUnavailableNotice({ title, reason }: { title: string; reason: string }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <Info className="mt-0.5 size-4 shrink-0 text-slate-400" strokeWidth={2.5} />
      <div>
        <p className="text-sm font-bold text-slate-500">{title}</p>
        <p className="text-xs font-medium text-slate-400">{reason}</p>
      </div>
    </div>
  );
}

/** Notice untuk section PARTIAL — angka tampil tapi ada catatan keterbatasan. */
export function PartialDataNotice({ reason }: { reason: string }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-3">
      <Info className="mt-0.5 size-4 shrink-0 text-amber-600" strokeWidth={2.5} />
      <p className="text-xs font-semibold text-amber-800">{reason}</p>
    </div>
  );
}
