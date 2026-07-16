import type { ReactNode } from "react";

export interface PreviewColumn<T> {
  key: string;
  label: string;
  align?: "right";
  render: (row: T) => ReactNode;
}

interface PreviewDataTableProps<T> {
  columns: PreviewColumn<T>[];
  rows: T[];
  rowKey: (row: T, index: number) => string;
  emptyMessage?: string;
}

/**
 * Tabel preview generik dipakai di semua menu center (dummy data).
 * Urutan `columns` menentukan urutan tampil — pemanggil WAJIB menaruh kolom
 * Tanggal sebagai entri pertama bila tabelnya punya tanggal.
 */
export function PreviewDataTable<T>({ columns, rows, rowKey, emptyMessage }: PreviewDataTableProps<T>) {
  if (rows.length === 0) {
    return (
      <p className="py-8 text-center text-sm font-medium text-slate-400">
        {emptyMessage ?? "Belum ada data untuk ditampilkan."}
      </p>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] text-sm">
        <thead>
          <tr className="border-b border-slate-200">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`whitespace-nowrap pb-3 pr-4 font-bold text-slate-500 ${col.align === "right" ? "text-right" : "text-left"}`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row, index) => (
            <tr key={rowKey(row, index)}>
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={`whitespace-nowrap py-3 pr-4 font-medium text-slate-700 ${col.align === "right" ? "text-right" : ""}`}
                >
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
