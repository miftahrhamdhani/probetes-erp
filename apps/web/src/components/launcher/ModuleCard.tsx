import type { ErpModuleItem } from "@probetes/types";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { ProbetesLogo } from "./ProbetesLogo";

interface ModuleCardProps {
  module: ErpModuleItem;
}

const badgeToneClass: Record<ErpModuleItem["badgeTone"], string> = {
  green: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  blue: "bg-blue-50 text-blue-700 ring-blue-100",
  neutral: "bg-slate-100 text-slate-600 ring-slate-100"
};

export function ModuleCard({ module }: ModuleCardProps) {
  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-slate-200 bg-white/88 p-4 shadow-card transition duration-200 hover:-translate-y-0.5 hover:bg-white hover:shadow-soft",
        module.isActive && "border-l-4 border-l-emerald-500"
      )}
    >
      <div className="flex min-h-[94px] items-center gap-4">
        <ProbetesLogo showText={false} variant="module" markClassName="drop-shadow-none" />

        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-bold tracking-[-0.02em] text-slate-950">{module.name}</h3>
          <p className="mt-1.5 max-w-[250px] text-sm font-medium leading-5 text-slate-600">
            {module.description}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <span
            className={cn(
              "hidden rounded-xl px-3 py-1.5 text-xs font-semibold ring-1 sm:inline-flex",
              badgeToneClass[module.badgeTone]
            )}
          >
            {module.badge}
          </span>
          <ChevronRight className="size-5 text-slate-500 transition group-hover:translate-x-1 group-hover:text-brand-red" />
        </div>
      </div>

      <div className="mt-3 sm:hidden">
        <span
          className={cn(
            "inline-flex rounded-xl px-3 py-1.5 text-xs font-semibold ring-1",
            badgeToneClass[module.badgeTone]
          )}
        >
          {module.badge}
        </span>
      </div>
    </article>
  );
}
