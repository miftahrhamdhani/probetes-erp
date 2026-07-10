import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

interface SalesOrderSectionCardProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  iconTone?: "red" | "amber" | "blue" | "green";
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

const ICON_TONE: Record<NonNullable<SalesOrderSectionCardProps["iconTone"]>, string> = {
  red: "bg-brand-red/10 text-brand-red",
  amber: "bg-amber-50 text-amber-600",
  blue: "bg-blue-50 text-blue-600",
  green: "bg-emerald-50 text-emerald-600",
};

/** Kartu section putih untuk chart/tabel — dipakai berulang di semua halaman Sales & Order. */
export function SalesOrderSectionCard({ title, subtitle, icon: Icon, iconTone = "red", action, children, className }: SalesOrderSectionCardProps) {
  return (
    <section className={`rounded-[22px] bg-white p-5 shadow-sm sm:p-6 ${className ?? ""}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          {Icon && <span className={`mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg ${ICON_TONE[iconTone]}`}><Icon className="size-4" strokeWidth={2.4} /></span>}
          <div>
            <h2 className="text-base font-extrabold tracking-[-0.01em] text-slate-900">{title}</h2>
            {subtitle && <p className="mt-0.5 text-xs font-medium text-slate-500">{subtitle}</p>}
          </div>
        </div>
        {action}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}
