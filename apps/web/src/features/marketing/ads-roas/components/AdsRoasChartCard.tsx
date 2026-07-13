import type { ReactNode } from "react";

interface AdsRoasChartCardProps {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

/** Kartu putih rounded untuk chart/tabel — dipakai berulang di semua tab Iklan & ROAS. */
export function AdsRoasChartCard({ title, action, children, className }: AdsRoasChartCardProps) {
  return (
    <section className={`rounded-[20px] bg-white p-4 shadow-sm sm:p-5 ${className ?? ""}`}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-sm font-extrabold tracking-[-0.01em] text-slate-900">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function AdsRoasSeeAllButton({ onClick }: { onClick?: () => void }) {
  return (
    <button onClick={onClick} className="shrink-0 rounded-lg bg-brand-red/10 px-2.5 py-1 text-xs font-bold text-brand-red transition hover:bg-brand-red/15">
      Lihat Semua
    </button>
  );
}
