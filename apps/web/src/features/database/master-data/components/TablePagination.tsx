"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatNumber } from "../lib/format";

const PAGE_SIZES = [10, 20, 50, 100, 0]; // 0 = Semua

interface TablePaginationProps {
  page: number;
  totalPages: number;
  pageSize: number;
  total: number;
  onPage: (page: number) => void;
  onPageSize: (size: number) => void;
}

export function TablePagination({ page, totalPages, pageSize, total, onPage, onPageSize }: TablePaginationProps) {
  return (
    <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
        <span>Tampilkan</span>
        <select
          value={pageSize}
          onChange={(event) => onPageSize(Number(event.target.value))}
          className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-bold text-slate-700 focus:border-brand-red/40 focus:outline-none focus:ring-2 focus:ring-brand-red/10"
        >
          {PAGE_SIZES.map((size) => (
            <option key={size} value={size}>
              {size === 0 ? "Semua" : size}
            </option>
          ))}
        </select>
        <span>dari {formatNumber(total)} data</span>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPage(page - 1)}
          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:border-brand-red/40 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft className="size-3.5" />
          Sebelumnya
        </button>
        <span className="whitespace-nowrap text-xs font-bold text-slate-600">
          Hal {formatNumber(page)} / {formatNumber(totalPages)}
        </span>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPage(page + 1)}
          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:border-brand-red/40 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Berikutnya
          <ChevronRight className="size-3.5" />
        </button>
      </div>
    </div>
  );
}
