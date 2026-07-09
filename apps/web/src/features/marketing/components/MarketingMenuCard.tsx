import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Upload, ReceiptText, Megaphone, Users, ChevronRight } from "lucide-react";
import type { MarketingMenu } from "../types";

const iconMap: Record<string, LucideIcon> = {
  upload: Upload,
  receipt: ReceiptText,
  megaphone: Megaphone,
  users: Users,
};

export function MarketingMenuCard({ menu }: { menu: MarketingMenu }) {
  const Icon = iconMap[menu.icon] ?? Upload;
  return (
    <Link
      href={menu.href}
      className="group relative block overflow-hidden rounded-2xl border border-transparent bg-brand-red p-4 shadow-card transition duration-200 hover:-translate-y-0.5 hover:bg-[#d60511] hover:shadow-soft"
    >
      <div className="flex min-h-[94px] items-center gap-4">
        <div className="flex size-[68px] shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm transition-transform duration-200 group-hover:scale-105">
          <Icon className="size-7 text-slate-900" strokeWidth={2.2} />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-bold tracking-[-0.02em] text-white">{menu.title}</h3>
          <p className="mt-1.5 max-w-[250px] text-sm font-medium leading-5 text-white/80">{menu.description}</p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {menu.badge && (
            <span className="hidden rounded-xl bg-white px-3 py-1.5 text-xs font-semibold text-brand-red shadow-sm sm:inline-flex">
              {menu.badge}
            </span>
          )}
          <ChevronRight className="size-5 text-white/60 transition group-hover:translate-x-1 group-hover:text-white" />
        </div>
      </div>
      {menu.badge && (
        <div className="mt-3 sm:hidden">
          <span className="inline-flex rounded-xl bg-white px-3 py-1.5 text-xs font-semibold text-brand-red shadow-sm">
            {menu.badge}
          </span>
        </div>
      )}
    </Link>
  );
}
