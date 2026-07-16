import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface DataPanelProps {
  title?: string;
  subtitle?: string;
  className?: string;
  children: ReactNode;
}

/** Panel kartu putih rounded — dipakai untuk membungkus KPI/tabel di menu center. */
export function DataPanel({ title, subtitle, className, children }: DataPanelProps) {
  return (
    <section className={cn("rounded-3xl border border-slate-200 bg-white p-5 shadow-card", className)}>
      {(title || subtitle) && (
        <div className="mb-5">
          {title && <h2 className="text-lg font-bold tracking-[-0.03em] text-slate-950">{title}</h2>}
          {subtitle && <p className="mt-1 text-sm font-medium text-slate-500">{subtitle}</p>}
        </div>
      )}
      {children}
    </section>
  );
}
