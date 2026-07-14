"use client";

import { useEffect, useMemo, useState } from "react";

interface PagedDataOptions<T extends object> {
  initialPageSize?: number;
  initialSort?: string;
  dateKeys?: (keyof T)[];
  tieBreakerKey?: keyof T;
}

/** Baca tanggal tanpa mengandalkan urutan alfabet atau locale browser. */
function parseSortableDate(value: unknown): number | null {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value.getTime();
  const text = String(value ?? "").trim();
  if (!text || text === "-") return null;

  const iso = /^(\d{4})-(\d{2})-(\d{2})(?:[T\s].*)?$/.exec(text);
  if (iso) return Date.UTC(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));

  const dayFirst = /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/.exec(text);
  if (dayFirst) return Date.UTC(Number(dayFirst[3]), Number(dayFirst[2]) - 1, Number(dayFirst[1]));

  return null;
}

function comparePrimitive(a: unknown, b: unknown) {
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a ?? "").localeCompare(String(b ?? ""), "id", { numeric: true });
}

/**
 * Muat data JSON + pencarian + filter + urutkan + pagination di sisi browser.
 * - `searchKeys`: kolom yang ikut dicari kotak pencarian.
 * - `sort` bernilai "kolom:asc" / "kolom:desc" ("" = urutan asli).
 * - `options.initialSort` menetapkan urutan default dan saat tombol Reset ditekan.
 * - `options.dateKeys` memastikan tanggal dibandingkan sebagai kalender lengkap.
 */
export function usePagedData<T extends object>(
  url: string,
  searchKeys: (keyof T)[] = [],
  options: number | PagedDataOptions<T> = 10,
) {
  const resolvedOptions = typeof options === "number" ? { initialPageSize: options } : options;
  const initialPageSize = resolvedOptions.initialPageSize ?? 10;
  const initialSort = resolvedOptions.initialSort ?? "";
  const dateKeys = resolvedOptions.dateKeys ?? [];
  const tieBreakerKey = resolvedOptions.tieBreakerKey;
  const [allRows, setAllRows] = useState<T[] | null>(null);
  const [error, setError] = useState(false);
  // true setelah user mengubah/menghapus baris lewat updateRows — dipakai UI
  // untuk mengingatkan bahwa perubahan hanya tampilan, belum ke database.
  const [modified, setModified] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSizeState] = useState(initialPageSize);
  const [query, setQueryState] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [sort, setSortState] = useState(initialSort);
  // Filter rentang tanggal: { kolom: "YYYY-MM-DD" } untuk batas dari/sampai.
  // Kosong = tidak dibatasi. dateTo diperlakukan inklusif (sampai akhir hari itu).
  const [dateFrom, setDateFromState] = useState<Record<string, string>>({});
  const [dateTo, setDateToState] = useState<Record<string, string>>({});

  const [reloadToken, setReloadToken] = useState(0);
  useEffect(() => {
    let alive = true;
    setError(false);
    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(String(res.status));
        return res.json() as Promise<T[]>;
      })
      .then((data) => {
        if (alive) setAllRows(data);
      })
      .catch(() => {
        if (alive) setError(true);
      });
    return () => {
      alive = false;
    };
  }, [url, reloadToken]);
  const reload = () => setReloadToken((value) => value + 1);

  const searchKeyId = searchKeys.join("|");
  const dateKeyId = dateKeys.join("|");

  const filtered = useMemo(() => {
    if (!allRows) return [];
    let rows = allRows;
    const q = query.trim().toLowerCase();
    if (q) {
      rows = rows.filter((r) =>
        searchKeys.some((k) => String(r[k] ?? "").toLowerCase().includes(q)),
      );
    }
    for (const [key, val] of Object.entries(filters)) {
      if (val) rows = rows.filter((r) => String(r[key as keyof T] ?? "") === val);
    }
    // Kolom tanggal boleh berupa 1 string ("2025-06-07") atau array tanggal
    // (mis. semua tanggal transaksi seorang pelanggan). Untuk array, baris lolos
    // jika ADA SATU tanggal di dalamnya yang masuk rentang — bukan hanya kolom
    // tunggal seperti "pertama beli" saja.
    const filterDateKeys = new Set([...Object.keys(dateFrom), ...Object.keys(dateTo)]);
    for (const key of filterDateKeys) {
      const from = dateFrom[key];
      const to = dateTo[key];
      if (!from && !to) continue;
      rows = rows.filter((r) => {
        const raw = r[key as keyof T];
        const dates = Array.isArray(raw) ? (raw as unknown[]).map(String) : [String(raw ?? "")];
        return dates.some((v) => v && v !== "-" && (!from || v >= from) && (!to || v <= to));
      });
    }
    if (sort) {
      const [key, dir] = sort.split(":");
      const isDateKey = dateKeys.some((dateKey) => String(dateKey) === key);
      rows = rows.map((row, originalIndex) => ({ row, originalIndex })).sort((a, b) => {
        const av = a.row[key as keyof T];
        const bv = b.row[key as keyof T];
        let cmp: number;
        if (isDateKey) {
          const aDate = parseSortableDate(av);
          const bDate = parseSortableDate(bv);
          // Tanggal kosong selalu di bawah, baik arah terbaru maupun terlama.
          if (aDate === null && bDate === null) cmp = 0;
          else if (aDate === null) return 1;
          else if (bDate === null) return -1;
          else cmp = aDate - bDate;
        } else {
          cmp = comparePrimitive(av, bv);
        }

        if (cmp !== 0) return dir === "asc" ? cmp : -cmp;
        if (tieBreakerKey) {
          const tie = comparePrimitive(a.row[tieBreakerKey], b.row[tieBreakerKey]);
          if (tie !== 0) return tie;
        }
        return a.originalIndex - b.originalIndex;
      }).map(({ row }) => row);
    }
    return rows;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allRows, query, filters, dateFrom, dateTo, sort, searchKeyId, dateKeyId, tieBreakerKey]);

  const total = filtered.length;
  const totalAll = allRows?.length ?? 0;
  const totalPages = pageSize === 0 ? 1 : Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);

  const rows = useMemo(() => {
    if (pageSize === 0) return filtered;
    const start = (safePage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, safePage, pageSize]);

  const setPageSize = (size: number) => {
    setPageSizeState(size);
    setPage(1);
  };
  const setQuery = (q: string) => {
    setQueryState(q);
    setPage(1);
  };
  const setFilter = (key: string, value: string) => {
    setFilters((f) => ({ ...f, [key]: value }));
    setPage(1);
  };
  const setSort = (value: string) => {
    setSortState(value);
    setPage(1);
  };
  const setDateFrom = (key: string, value: string) => {
    setDateFromState((f) => ({ ...f, [key]: value }));
    setPage(1);
  };
  const setDateTo = (key: string, value: string) => {
    setDateToState((f) => ({ ...f, [key]: value }));
    setPage(1);
  };
  const resetControls = () => {
    setQueryState("");
    setFilters({});
    setDateFromState({});
    setDateToState({});
    setSortState(initialSort);
    setPage(1);
  };
  // persisted=true → perubahan sudah tersimpan ke database (lewat API), jadi
  // banner "hanya tampilan sementara" TIDAK dimunculkan. Default (mock lokal)
  // tetap memunculkan banner.
  const updateRows = (updater: (rows: T[]) => T[], opts?: { persisted?: boolean }) => {
    setAllRows((current) => (current ? updater(current) : current));
    if (!opts?.persisted) setModified(true);
    setPage(1);
  };
  const hasActiveControls = Boolean(
    query || sort !== initialSort || Object.values(filters).some(Boolean) ||
    Object.values(dateFrom).some(Boolean) || Object.values(dateTo).some(Boolean),
  );

  const distinct = (key: keyof T) => {
    if (!allRows) return [] as string[];
    return Array.from(
      new Set(allRows.map((r) => String(r[key] ?? "")).filter((v) => v && v !== "-")),
    ).sort((a, b) => a.localeCompare(b, "id"));
  };

  return {
    rows,
    allRows: allRows ?? [],
    total,
    totalAll,
    loading: allRows === null && !error,
    error,
    modified,
    page: safePage,
    setPage,
    pageSize,
    setPageSize,
    totalPages,
    query,
    setQuery,
    filters,
    setFilter,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    sort,
    setSort,
    resetControls,
    updateRows,
    reload,
    hasActiveControls,
    distinct,
  };
}

/** Bentuk hasil usePagedData — dipakai komponen tabel bersama (MasterTable). */
export type PagedData<T extends object> = ReturnType<typeof usePagedData<T>>;
