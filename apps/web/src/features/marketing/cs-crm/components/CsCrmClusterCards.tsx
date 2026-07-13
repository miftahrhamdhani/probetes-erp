import { formatRupiahRingkas } from "../lib/format";
import type { ClusterKey, ClusterSummary } from "../types/csCrmTypes";

/** 14 kartu cluster clickable, warna beda tiap cluster — meniru grid kartu di dashboard
 * referensi (klik kartu -> tabel customer detail). */
export function CsCrmClusterCards({ data, active, onSelect }: { data: ClusterSummary[]; active: ClusterKey | null; onSelect: (key: ClusterKey) => void }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
      {data.map((c) => {
        const isActive = active === c.key;
        return (
          <button
            key={c.key}
            onClick={() => onSelect(c.key)}
            className={`rounded-[16px] border p-3 text-left shadow-sm transition hover:-translate-y-0.5 ${isActive ? "ring-2 ring-offset-1" : ""}`}
            style={{ borderColor: `${c.color}55`, backgroundColor: isActive ? `${c.color}12` : "white" }}
          >
            <span className="inline-flex rounded-md px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.03em]" style={{ backgroundColor: `${c.color}18`, color: c.color }}>
              {c.label}
            </span>
            <p className="mt-2 text-2xl font-black text-slate-900">{c.count}</p>
            <p className="text-xs font-bold text-slate-500">{formatRupiahRingkas(c.revenue)}</p>
            <p className="mt-1 truncate text-[10.5px] font-medium text-slate-400" title={c.description}>{c.description}</p>
          </button>
        );
      })}
    </div>
  );
}
