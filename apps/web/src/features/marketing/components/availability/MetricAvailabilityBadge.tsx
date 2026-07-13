import { CheckCircle2, HelpCircle, AlertTriangle, XCircle, Link2 } from "lucide-react";
import type { AvailabilityStatus } from "@/lib/availability";

const STYLE: Record<AvailabilityStatus, { label: string; className: string; Icon: typeof CheckCircle2 }> = {
  AVAILABLE: { label: "Data Live", className: "bg-emerald-50 text-emerald-700 border-emerald-200", Icon: CheckCircle2 },
  DERIVABLE: { label: "Dihitung dari Data", className: "bg-sky-50 text-sky-700 border-sky-200", Icon: HelpCircle },
  PARTIAL: { label: "Sebagian Data", className: "bg-amber-50 text-amber-700 border-amber-200", Icon: AlertTriangle },
  NOT_AVAILABLE: { label: "Belum Tersedia", className: "bg-slate-100 text-slate-500 border-slate-200", Icon: XCircle },
  NEED_MAPPING: { label: "Butuh Mapping", className: "bg-violet-50 text-violet-700 border-violet-200", Icon: Link2 },
};

export function MetricAvailabilityBadge({ status, reason }: { status: AvailabilityStatus; reason?: string | null }) {
  const { label, className, Icon } = STYLE[status];
  return (
    <span title={reason ?? undefined} className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-bold ${className}`}>
      <Icon className="size-3" strokeWidth={2.5} />
      {label}
    </span>
  );
}
