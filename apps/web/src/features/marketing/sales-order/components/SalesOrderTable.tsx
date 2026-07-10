import type { ReactNode } from "react";

export interface SalesOrderTableColumn<T> {
  key: string;
  header: string;
  align?: "left" | "right" | "center";
  render: (row: T) => ReactNode;
}

interface SalesOrderTableProps<T> {
  columns: SalesOrderTableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  emptyMessage?: string;
}

/** Tabel dengan header merah Probetes (seperti mockup) — horizontal scroll otomatis di mobile. */
export function SalesOrderTable<T>({ columns, rows, rowKey, emptyMessage = "Belum ada data untuk filter ini." }: SalesOrderTableProps<T>) {
  if (rows.length === 0) {
    return <p className="rounded-2xl bg-slate-50 p-8 text-center text-sm font-semibold text-slate-400">{emptyMessage}</p>;
  }
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-100">
      <table className="w-full whitespace-nowrap text-left text-sm">
        <thead>
          <tr className="bg-brand-red text-white">
            {columns.map((col) => (
              <th key={col.key} className={`px-4 py-3 text-xs font-bold uppercase tracking-[0.03em] first:rounded-tl-2xl last:rounded-tr-2xl ${col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : ""}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
          {rows.map((row) => (
            <tr key={rowKey(row)} className="transition hover:bg-slate-50">
              {columns.map((col) => (
                <td key={col.key} className={`px-4 py-3.5 ${col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : ""}`}>{col.render(row)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
