import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ChevronRight, ClipboardCheck, Layers, Megaphone, ReceiptText, Upload } from "lucide-react";
import type { CrmMenuCard } from "../types/crmTypes";

const ICON_MAP: Record<string, LucideIcon> = {
  upload: Upload,
  receipt: ReceiptText,
  megaphone: Megaphone,
  layers: Layers,
  "clipboard-check": ClipboardCheck,
};

/** Kartu menu merah besar di CRM Center — icon kotak putih kiri atas, status badge,
 * deskripsi, dan 2 angka ringkas headline di bawah. Klik → halaman submenu. */
export function CrmCenterMenuCard({ menu, fullWidth = false }: { menu: CrmMenuCard; fullWidth?: boolean }) {
  const Icon = ICON_MAP[menu.icon] ?? Layers;
  return (
    <Link
      href={menu.href}
      className={`group relative block overflow-hidden rounded-[22px] border border-transparent bg-brand-red p-5 shadow-card transition duration-200 hover:-translate-y-0.5 hover:bg-[#d60511] hover:shadow-soft ${fullWidth ? "sm:col-span-2" : ""}`}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm transition-transform duration-200 group-hover:scale-105">
          <Icon className="size-6 text-brand-red" strokeWidth={2.2} />
        </span>
        <span className="rounded-xl bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
          {menu.badge}
        </span>
      </div>

      <div className="mt-4">
        <div className="flex items-center gap-1.5">
          <h3 className="text-lg font-bold tracking-[-0.01em] text-white">{menu.title}</h3>
          <ChevronRight className="size-4 text-white/60 transition group-hover:translate-x-1 group-hover:text-white" />
        </div>
        <p className="mt-1.5 text-sm font-medium leading-5 text-white/80">{menu.description}</p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 border-t border-white/15 pt-3">
        {menu.stats.map((stat) => (
          <div key={stat.label} className="min-w-0">
            <p className="truncate text-[11px] font-semibold text-white/65">{stat.label}</p>
            <p className="truncate text-base font-extrabold text-white" title={stat.value}>{stat.value}</p>
          </div>
        ))}
      </div>
    </Link>
  );
}
