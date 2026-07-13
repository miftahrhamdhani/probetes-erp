import type { ReactNode } from "react";
import { AdsRoasChartCard, AdsRoasSeeAllButton } from "./AdsRoasChartCard";
import { AdsRoasEmptyState } from "./AdsRoasStates";

export interface AdsRoasTableColumn<T> {
  key: string;
  header: string;
  align?: "left" | "right" | "center";
  render: (row: T) => ReactNode;
}

interface AdsRoasTableCardProps<T> {
  title: string;
  columns: AdsRoasTableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  onSeeAll?: () => void;
  className?: string;
}

/** Kartu tabel ranking dengan tombol "Lihat Semua" — dipakai Top ADV/Campaign/Toko/Review. */
export function AdsRoasTableCard<T>({ title, columns, rows, rowKey, onSeeAll, className }: AdsRoasTableCardProps<T>) {
  return (
    <AdsRoasChartCard title={title} action={<AdsRoasSeeAllButton onClick={onSeeAll} />} className={className}>
      {rows.length === 0 ? <AdsRoasEmptyState /> : (
        <div className="overflow-x-auto">
          <table className="w-full whitespace-nowrap text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400">
                {columns.map((col) => (
                  <th key={col.key} className={`pb-2 pr-3 font-bold uppercase tracking-[0.02em] ${col.align === "right" ? "text-right" : ""}`}>{col.header}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 font-semibold text-slate-700">
              {rows.map((row) => (
                <tr key={rowKey(row)}>
                  {columns.map((col) => (
                    <td key={col.key} className={`py-2.5 pr-3 ${col.align === "right" ? "text-right" : ""}`}>{col.render(row)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdsRoasChartCard>
  );
}
