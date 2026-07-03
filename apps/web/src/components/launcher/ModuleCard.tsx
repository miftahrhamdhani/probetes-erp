import type { ErpModuleItem } from "@probetes/types";
import type { LucideIcon } from "lucide-react";
import {
  Bot,
  ChevronRight,
  Database,
  FileText,
  Megaphone,
  Package,
  Settings,
  Truck,
  Users,
  Wallet
} from "lucide-react";
import { cn } from "@/lib/cn";

interface ModuleCardProps {
  module: ErpModuleItem;
}

const badgeToneClass: Record<ErpModuleItem["badgeTone"], string> = {
  green: "bg-white text-brand-red shadow-sm",
  blue: "bg-white/20 text-white ring-1 ring-white/30",
  neutral: "bg-black/15 text-white/90 ring-1 ring-black/10"
};

const moduleIcon: Record<string, LucideIcon> = {
  marketing: Megaphone,
  reports: FileText,
  finance: Wallet,
  gudang: Package,
  database: Database,
  "data-tracking": Truck,
  "user-management": Users,
  "ai-assistant": Bot,
  setting: Settings
};

export function ModuleCard({ module }: ModuleCardProps) {
  const Icon = moduleIcon[module.id] ?? Package;

  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-transparent bg-brand-red p-4 shadow-card transition duration-200 hover:-translate-y-0.5 hover:bg-[#d60511] hover:shadow-soft",
        module.isActive && "border-l-4 border-l-white bg-[#d60511]"
      )}
    >
      <div className="flex min-h-[94px] items-center gap-4">
        <div className="flex size-[68px] shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm transition-transform duration-200 group-hover:scale-105">
          <Icon className="size-7 text-slate-900" strokeWidth={2.2} />
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-bold tracking-[-0.02em] text-white">{module.name}</h3>
          <p className="mt-1.5 max-w-[250px] text-sm font-medium leading-5 text-white/80">
            {module.description}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <span
            className={cn(
              "hidden rounded-xl px-3 py-1.5 text-xs font-semibold sm:inline-flex",
              badgeToneClass[module.badgeTone]
            )}
          >
            {module.badge}
          </span>
          <ChevronRight className="size-5 text-white/60 transition group-hover:translate-x-1 group-hover:text-white" />
        </div>
      </div>

      <div className="mt-3 sm:hidden">
        <span
          className={cn(
            "inline-flex rounded-xl px-3 py-1.5 text-xs font-semibold",
            badgeToneClass[module.badgeTone]
          )}
        >
          {module.badge}
        </span>
      </div>
    </article>
  );
}
