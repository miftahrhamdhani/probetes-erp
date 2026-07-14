"use client";

import type { ReactNode } from "react";
import type { PagedData } from "../hooks/usePagedData";
import { useRowVirtualizer } from "../hooks/useRowVirtualizer";
import { TablePagination } from "./TablePagination";
import { TableToolbar } from "./TableToolbar";

/**
 * Satu kolom tabel Data Utama.
 * - `render` untuk sel khusus (badge, format angka/rupiah); tanpa `render`,
 *   nilai `row[key]` ditampilkan apa adanya.
 * - `tone` mengatur gaya teks sel: muted (tanggal/ID), strong (nama/nilai
 *   penting), normal (default).
 */
export interface MasterColumn<T> {
  key: string;
  label: string;
  align?: "right";
  tone?: "muted" | "normal" | "strong";
  render?: (row: T) => ReactNode;
  /** Lebar kolom tetap (px). Kolom pakai layout tetap agar tidak geser saat scroll. */
  width?: number;
}

const DEFAULT_COL_WIDTH = 150;
const ACTIONS_COL_WIDTH = 200;

interface MasterTableProps<T extends object> {
  paged: PagedData<T>;
  columns: MasterColumn<T>[];
  rowKey: (row: T, index: number) => string;
  searchPlaceholder: string;
  /** Filter tambahan (ToolbarSelect / DateRangeFilter) di sebelah kotak cari. */
  toolbar?: ReactNode;
  /** Tombol per baris (Lihat/Edit/Hapus). Kalau diisi, kolom "Aksi" ditambahkan. */
  renderActions?: (row: T) => ReactNode;
  /** Klik area data baris untuk membuka detail; area tombol Aksi dikecualikan. */
  onRowClick?: (row: T) => void;
  rowAriaLabel?: (row: T) => string;
  minWidth?: number;
  maxHeight?: number;
  /** Aktifkan virtualisasi baris untuk tabel ribuan baris (tinggi baris tetap). */
  virtualized?: boolean;
}

const ROW_HEIGHT = 45;

const toneClass: Record<NonNullable<MasterColumn<unknown>["tone"]>, string> = {
  muted: "font-medium text-slate-500",
  normal: "font-medium text-slate-600",
  strong: "font-semibold text-slate-950",
};

/**
 * Tabel Data Utama bersama: toolbar cari/filter, banner perubahan lokal,
 * tabel (opsional virtual), dan pagination. Section tinggal mendefinisikan
 * kolom, filter, dan aksi per baris.
 */
export function MasterTable<T extends object>({
  paged,
  columns,
  rowKey,
  searchPlaceholder,
  toolbar,
  renderActions,
  onRowClick,
  rowAriaLabel,
  minWidth = 820,
  maxHeight = 560,
  virtualized = false,
}: MasterTableProps<T>) {
  const colCount = columns.length + (renderActions ? 1 : 0);
  // Lebar tabel dari jumlah lebar kolom tetap → kolom tidak pernah geser saat scroll virtual.
  const fixedWidth =
    columns.reduce((sum, col) => sum + (col.width ?? DEFAULT_COL_WIDTH), 0) +
    (renderActions ? ACTIONS_COL_WIDTH : 0);
  const tableWidth = Math.max(minWidth, fixedWidth);
  const virt = useRowVirtualizer<HTMLDivElement>({ count: paged.rows.length, rowHeight: ROW_HEIGHT });
  const start = virtualized ? virt.start : 0;
  const end = virtualized ? virt.end : paged.rows.length;
  const visibleRows = paged.rows.slice(start, end);

  if (paged.loading) {
    return <p className="py-8 text-center text-sm font-medium text-slate-400">Memuat data…</p>;
  }
  if (paged.error) {
    return (
      <p className="py-8 text-center text-sm font-medium text-amber-600">
        Data belum tersedia. Jalankan export data terlebih dahulu.
      </p>
    );
  }

  return (
    <>
      <TableToolbar
        query={paged.query}
        onQuery={paged.setQuery}
        placeholder={searchPlaceholder}
        total={paged.total}
        totalAll={paged.totalAll}
        onReset={paged.resetControls}
        hasActive={paged.hasActiveControls}
      >
        {toolbar}
      </TableToolbar>
      {paged.modified && (
        <p className="mb-4 rounded-xl bg-amber-50 px-3 py-2.5 text-xs font-semibold text-amber-800">
          Perubahan/hapus di tabel ini hanya tampilan sementara — belum tersimpan ke database.
          Muat ulang halaman untuk mengembalikan data asli.
        </p>
      )}
      {paged.total === 0 && (
        <p className="py-6 text-center text-sm font-medium text-slate-400">
          Tidak ada data yang cocok dengan pencarian/filter.
        </p>
      )}
      <div ref={virtualized ? virt.containerRef : undefined} className="overflow-auto" style={{ maxHeight }}>
        <table className="text-sm" style={{ width: tableWidth, minWidth: tableWidth, tableLayout: "fixed" }}>
          <colgroup>
            {columns.map((col) => (
              <col key={col.key} style={{ width: col.width ?? DEFAULT_COL_WIDTH }} />
            ))}
            {renderActions && <col style={{ width: ACTIONS_COL_WIDTH }} />}
          </colgroup>
          <thead className="sticky top-0 z-10 bg-white">
            <tr className="border-b border-slate-200">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`overflow-hidden text-ellipsis whitespace-nowrap pb-3 pr-4 font-bold text-slate-500 ${col.align === "right" ? "text-right" : "text-left"}`}
                >
                  {col.label}
                </th>
              ))}
              {renderActions && <th className="pb-3 text-right font-bold text-slate-500">Aksi</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {virtualized && virt.topSpacer > 0 && (
              <tr aria-hidden="true" style={{ height: virt.topSpacer }}>
                <td colSpan={colCount} />
              </tr>
            )}
            {visibleRows.map((row, index) => (
              <tr
                key={rowKey(row, start + index)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                onKeyDown={onRowClick ? (event) => {
                  if (event.currentTarget !== event.target) return;
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onRowClick(row);
                  }
                } : undefined}
                tabIndex={onRowClick ? 0 : undefined}
                aria-label={onRowClick ? rowAriaLabel?.(row) : undefined}
                className={onRowClick ? "cursor-pointer transition hover:bg-slate-50 focus:outline-none focus-visible:bg-red-50/50" : undefined}
              >
                {columns.map((col) => {
                  const plainValue = col.render ? null : String((row as Record<string, unknown>)[col.key] ?? "-");
                  return (
                    <td
                      key={col.key}
                      title={plainValue ?? undefined}
                      className={`overflow-hidden text-ellipsis whitespace-nowrap py-3 pr-4 ${col.align === "right" ? "text-right" : ""} ${toneClass[col.tone ?? "normal"]}`}
                    >
                      {col.render ? col.render(row) : plainValue}
                    </td>
                  );
                })}
                {renderActions && (
                  <td className="py-3 text-right" onClick={(event) => event.stopPropagation()}>
                    <div className="flex justify-end gap-2">{renderActions(row)}</div>
                  </td>
                )}
              </tr>
            ))}
            {virtualized && virt.bottomSpacer > 0 && (
              <tr aria-hidden="true" style={{ height: virt.bottomSpacer }}>
                <td colSpan={colCount} />
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <TablePagination
        page={paged.page}
        totalPages={paged.totalPages}
        pageSize={paged.pageSize}
        total={paged.total}
        onPage={paged.setPage}
        onPageSize={paged.setPageSize}
      />
    </>
  );
}

/** Tombol aksi baris dengan gaya seragam (Lihat/Edit netral, Hapus merah). */
export function RowActionButton({
  label,
  onClick,
  danger = false,
}: {
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        danger
          ? "rounded-lg border border-red-100 px-2.5 py-1 text-xs font-bold text-red-600 hover:bg-red-50"
          : "rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-bold text-slate-600 hover:border-brand-red/40 hover:text-brand-red"
      }
    >
      {label}
    </button>
  );
}

/** Panel catatan berpoin merah — dipakai semua section Data Utama. */
export function NotesList({ notes }: { notes: string[] }) {
  return (
    <ul className="flex flex-col gap-3">
      {notes.map((note) => (
        <li key={note} className="flex items-start gap-2.5 text-sm font-medium text-slate-600">
          <span className="mt-1 size-1.5 shrink-0 rounded-full bg-brand-red" />
          {note}
        </li>
      ))}
    </ul>
  );
}
