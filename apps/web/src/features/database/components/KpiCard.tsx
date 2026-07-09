import { cn } from "@/lib/cn";
import type { KpiItem } from "../types/database.types";

const toneClass: Record<NonNullable<KpiItem["tone"]>, string> = {
  red: "bg-brand-red/10 text-brand-red ring-brand-red/15",
  green: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  blue: "bg-blue-50 text-blue-700 ring-blue-100",
  amber: "bg-amber-50 text-amber-700 ring-amber-100",
  slate: "bg-slate-100 text-slate-700 ring-slate-200",
};

export function KpiCard({ item }: { item: KpiItem }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.045)]">
      <p className="text-sm font-semibold text-slate-500">{item.label}</p>
      <div className="mt-3 flex items-end justify-between gap-3">
        <strong className="text-2xl font-black tracking-[-0.04em] text-slate-950 sm:text-3xl">{item.value}</strong>
        <span className={cn("rounded-full px-2.5 py-1 text-xs font-bold ring-1", toneClass[item.tone ?? "slate"])}>
          {item.detail}
        </span>
      </div>
    </div>
  );
}
