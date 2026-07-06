import type { LucideIcon } from "lucide-react";
import { ChevronRight, Globe, Headphones, History, Package, Truck, Users } from "lucide-react";
import { cn } from "@/lib/cn";
import type { MasterDataIconKey, MasterDataMenu } from "../types/masterData.types";

const iconMap: Record<MasterDataIconKey, LucideIcon> = {
  users: Users,
  history: History,
  package: Package,
  globe: Globe,
  headphones: Headphones,
  truck: Truck,
};

interface MasterDataMenuCardProps {
  menu: MasterDataMenu;
  isActive: boolean;
  onSelect: (id: MasterDataMenu["id"]) => void;
}

export function MasterDataMenuCard({ menu, isActive, onSelect }: MasterDataMenuCardProps) {
  const Icon = iconMap[menu.icon];

  return (
    <button
      type="button"
      aria-pressed={isActive}
      onClick={() => onSelect(menu.id)}
      className={cn(
        "group relative w-full overflow-hidden rounded-2xl border border-transparent bg-brand-red p-4 text-left shadow-card transition duration-200 hover:-translate-y-0.5 hover:bg-[#d60511] hover:shadow-soft focus:outline-none focus:ring-4 focus:ring-brand-red/20",
        isActive && "border-white ring-4 ring-slate-950/18 shadow-soft"
      )}
    >
      <div className="flex min-h-[78px] items-center gap-3">
        <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-white shadow-sm transition-transform duration-200 group-hover:scale-105">
          <Icon className="size-6 text-slate-950" strokeWidth={2.25} />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-black leading-tight tracking-[-0.02em] text-white">{menu.title}</h3>
          {menu.badge && (
            <span className="mt-2 inline-flex rounded-full bg-white px-2.5 py-1 text-xs font-black text-brand-red shadow-sm">
              {menu.badge}
            </span>
          )}
        </div>
        <ChevronRight className="size-5 shrink-0 text-white/65 transition group-hover:translate-x-1 group-hover:text-white" />
      </div>
    </button>
  );
}
