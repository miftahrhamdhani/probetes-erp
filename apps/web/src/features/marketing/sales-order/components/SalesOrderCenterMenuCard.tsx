import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import type { CenterMenuCard } from "../types/salesOrder.types";

interface SalesOrderCenterMenuCardProps {
  menu: CenterMenuCard;
  icon: LucideIcon;
  miniVisual: ReactNode;
}

/** Kartu menu merah besar di Sales & Order Center — icon kotak putih kiri atas, mini-visual
 * putih transparan di kanan (sparkline/bar/donut kecil), dan 4 stat mini di baris bawah,
 * sesuai layout mockup landing page. */
export function SalesOrderCenterMenuCard({ menu, icon: Icon, miniVisual }: SalesOrderCenterMenuCardProps) {
  return (
    <Link
      href={menu.href}
      className="group relative block overflow-hidden rounded-[22px] border border-transparent bg-brand-red p-5 shadow-card transition duration-200 hover:-translate-y-0.5 hover:bg-[#d60511] hover:shadow-soft"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm transition-transform duration-200 group-hover:scale-105">
            <Icon className="size-5 text-brand-red" strokeWidth={2.2} />
          </span>
          <div className="min-w-0">
            <h3 className="text-base font-bold tracking-[-0.01em] text-white">{menu.title}</h3>
            <p className="mt-1 max-w-[200px] text-xs font-medium leading-5 text-white/80">{menu.description}</p>
          </div>
        </div>
        <ChevronRight className="mt-1 size-4 shrink-0 text-white/60 transition group-hover:translate-x-1 group-hover:text-white" />
      </div>

      {miniVisual && (
        <div className="mt-4 rounded-xl bg-white/10 p-3">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.06em] text-white/70">{menu.miniTitle}</p>
          {miniVisual}
        </div>
      )}

      {menu.stats.length > 0 && (
        <div className="mt-3 grid grid-cols-2 gap-2 border-t border-white/15 pt-3 sm:grid-cols-4">
          {menu.stats.map((stat) => (
            <div key={stat.label} className="min-w-0">
              <p className="truncate text-[10px] font-semibold text-white/65">{stat.label}</p>
              <p className="truncate text-sm font-extrabold text-white" title={stat.value}>{stat.value}</p>
              {stat.deltaPct !== undefined && <p className="text-[10px] font-bold text-white/85">▲ {stat.deltaPct.toFixed(1)}%</p>}
            </div>
          ))}
        </div>
      )}
    </Link>
  );
}
