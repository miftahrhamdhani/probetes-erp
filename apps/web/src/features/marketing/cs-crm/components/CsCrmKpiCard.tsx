import type { LucideIcon } from "lucide-react";

interface CsCrmKpiCardProps {
  label: string;
  value: string;
  caption?: string;
  icon: LucideIcon;
}

export function CsCrmKpiCard({ label, value, caption, icon: Icon }: CsCrmKpiCardProps) {
  return (
    <div className="rounded-[18px] border border-slate-100 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-red/10 text-brand-red">
          <Icon className="size-4.5" strokeWidth={2.2} />
        </span>
      </div>
      <p className="mt-3 text-xs font-bold uppercase tracking-[0.03em] text-slate-400">{label}</p>
      <p className="mt-1 truncate text-xl font-extrabold tracking-tight text-slate-900" title={value}>{value}</p>
      {caption && <p className="mt-1 text-[11px] font-semibold text-slate-400">{caption}</p>}
    </div>
  );
}
