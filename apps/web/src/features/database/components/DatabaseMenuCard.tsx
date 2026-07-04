import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import {
  BarChart3,
  Database,
  ShieldCheck,
  HardDrive,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/cn";
import type { DatabaseMenu } from "../types/database.types";

interface DatabaseMenuCardProps {
  menu: DatabaseMenu;
}

const badgeToneClass: Record<DatabaseMenu["badgeTone"], string> = {
  green: "bg-white text-brand-red shadow-sm",
  blue: "bg-white/20 text-white ring-1 ring-white/30",
  neutral: "bg-black/15 text-white/90 ring-1 ring-black/10",
  active: "bg-white text-brand-red shadow-sm",
  monitoring: "bg-white/20 text-white ring-1 ring-white/30",
};

const menuIcon: Record<string, LucideIcon> = {
  "data-overview": BarChart3,
  "master-data": Database,
  "data-quality": ShieldCheck,
  "backup-status": HardDrive,
};

export function DatabaseMenuCard({ menu }: DatabaseMenuCardProps) {
  const Icon = menuIcon[menu.id] ?? Database;

  return (
    <Link
      className={cn(
        "group relative block overflow-hidden rounded-2xl border border-transparent bg-brand-red p-4 shadow-card transition duration-200 hover:-translate-y-0.5 hover:bg-[#d60511] hover:shadow-soft",
      )}
      href={menu.href}
    >
      <div className="flex min-h-[94px] items-center gap-4">
        <div className="flex size-[68px] shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm transition-transform duration-200 group-hover:scale-105">
          <Icon className="size-7 text-slate-900" strokeWidth={2.2} />
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-bold tracking-[-0.02em] text-white">{menu.name}</h3>
          <p className="mt-1.5 max-w-[250px] text-sm font-medium leading-5 text-white/80">
            {menu.description}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <span
            className={cn(
              "hidden rounded-xl px-3 py-1.5 text-xs font-semibold sm:inline-flex",
              badgeToneClass[menu.badgeTone]
            )}
          >
            {menu.badge}
          </span>
          <ChevronRight className="size-5 text-white/60 transition group-hover:translate-x-1 group-hover:text-white" />
        </div>
      </div>

      <div className="mt-3 sm:hidden">
        <span
          className={cn(
            "inline-flex rounded-xl px-3 py-1.5 text-xs font-semibold",
            badgeToneClass[menu.badgeTone]
          )}
        >
          {menu.badge}
        </span>
      </div>
    </Link>
  );
}
