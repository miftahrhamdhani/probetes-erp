"use client";

import { useRowVirtualizer } from "@/features/database/master-data/hooks/useRowVirtualizer";
import type { ImportPreviewRow } from "@/server/modules/marketing/import/import.types";
import { ValidationBadge } from "../ImportUi";

interface NormalizedPreviewTableProps {
  caption: string;
  columns: string[];
  emptyMessage: string;
  maxHeightClassName?: string;
  rows: ImportPreviewRow[];
}

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "short",
  timeZone: "UTC",
  year: "numeric",
});
const numberFormatter = new Intl.NumberFormat("id-ID");
const decimalFormatter = new Intl.NumberFormat("id-ID", {
  maximumFractionDigits: 2,
  minimumFractionDigits: 0,
});
const currencyFormatter = new Intl.NumberFormat("id-ID", {
  currency: "IDR",
  maximumFractionDigits: 0,
  style: "currency",
});

function isDateColumn(column: string): boolean {
  return /tanggal/i.test(column);
}

function isCurrencyColumn(column: string): boolean {
  return /spending|harga|subtotal|total bayar|nilai konversi|omzet|biaya/i.test(column);
}

function isPercentColumn(column: string): boolean {
  return /ctr|persentase|\(%\)/i.test(column);
}

function isRatioColumn(column: string): boolean {
  return /roas|roi/i.test(column);
}

function isNumericColumn(column: string): boolean {
  return /^(?:impression|tayangan|click|klik|konversi|qty|jumlah)/i.test(column)
    || isPercentColumn(column)
    || isRatioColumn(column);
}

function formatCell(column: string, value: unknown): string {
  if (value === null || value === undefined || value === "") return "-";
  if (isDateColumn(column) && typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return dateFormatter.format(new Date(`${value}T00:00:00.000Z`));
  }
  if (typeof value === "number") {
    if (isPercentColumn(column)) return `${decimalFormatter.format(value)}%`;
    if (isRatioColumn(column)) return `${decimalFormatter.format(value)}x`;
    return isCurrencyColumn(column)
      ? currencyFormatter.format(Math.round(value))
      : numberFormatter.format(value);
  }
  return String(value);
}

function headerClassName(column: string, index: number): string {
  const alignment = isCurrencyColumn(column) || isNumericColumn(column) ? "text-right" : "text-left";
  const width = isDateColumn(column)
    ? "min-w-[138px]"
    : column === "Status Validasi"
      ? "min-w-[128px] text-center"
      : column === "Catatan Validasi"
        ? "min-w-[280px]"
        : "min-w-[150px] max-w-[260px]";
  const sticky = index === 0
    ? "sticky left-0 top-0 z-30 border-r border-slate-200 bg-slate-100"
    : "sticky top-0 z-20 bg-slate-100";
  return `${sticky} ${alignment} ${width} border-b border-slate-200 px-4 py-3 text-[11px] font-extrabold uppercase tracking-[0.08em] text-slate-600`;
}

function PreviewCell({ column, index, row }: { column: string; index: number; row: ImportPreviewRow }) {
  const sticky = index === 0
    ? "sticky left-0 z-10 border-r border-slate-200 bg-white group-hover:bg-slate-50"
    : "bg-inherit";
  if (column === "Status Validasi") {
    return <td className={`${sticky} border-b border-slate-100 px-4 py-3 text-center`}><ValidationBadge status={row.status} /></td>;
  }

  const value = column === "Catatan Validasi"
    ? row.notes.join(" ") || "Data siap disimpan."
    : row.data[column];
  const formatted = formatCell(column, value);
  const alignment = isCurrencyColumn(column) || isNumericColumn(column) ? "text-right tabular-nums" : "text-left";
  const wrapping = column === "Catatan Validasi"
    ? "max-w-[360px] whitespace-normal leading-5"
    : "max-w-[260px] truncate";

  return (
    <td
      className={`${sticky} ${alignment} ${wrapping} border-b border-slate-100 px-4 py-3 font-medium text-slate-700`}
      title={formatted}
    >
      {formatted}
    </td>
  );
}

export function NormalizedPreviewTable({
  caption,
  columns,
  emptyMessage,
  maxHeightClassName = "max-h-[460px]",
  rows,
}: NormalizedPreviewTableProps) {
  const virtualizer = useRowVirtualizer<HTMLDivElement>({ count: rows.length, rowHeight: 52 });
  const visibleRows = rows.slice(virtualizer.start, virtualizer.end);

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div ref={virtualizer.containerRef} className={`${maxHeightClassName} overflow-auto`}>
        <table className="w-full min-w-max border-separate border-spacing-0 text-sm">
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr>
              {columns.map((column, index) => (
                <th className={headerClassName(column, index)} key={column} scope="col">{column}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {virtualizer.topSpacer > 0 && (
              <tr aria-hidden style={{ height: virtualizer.topSpacer }}><td colSpan={columns.length} /></tr>
            )}
            {visibleRows.map((row) => (
              <tr className="group border-b border-slate-100 bg-white transition-colors hover:bg-slate-50" key={row.rowId ?? row.rowNumber}>
                {columns.map((column, index) => (
                  <PreviewCell column={column} index={index} key={column} row={row} />
                ))}
              </tr>
            ))}
            {virtualizer.bottomSpacer > 0 && (
              <tr aria-hidden style={{ height: virtualizer.bottomSpacer }}><td colSpan={columns.length} /></tr>
            )}
          </tbody>
        </table>
        {rows.length === 0 && <div className="p-10 text-center text-sm font-medium text-slate-500">{emptyMessage}</div>}
      </div>
    </div>
  );
}
