"use client";

import { useEffect, useMemo, useState } from "react";

/**
 * Muat data JSON + pencarian + filter + urutkan + pagination di sisi browser.
 * - `searchKeys`: kolom yang ikut dicari kotak pencarian.
 * - `sort` bernilai "kolom:asc" / "kolom:desc" ("" = urutan asli).
 * - pageSize 0 = tampilkan semua.
 */
export function usePagedData<T extends object>(
  url: string,
  searchKeys: (keyof T)[] = [],
  initialPageSize = 10,
) {
  const [allRows, setAllRows] = useState<T[] | null>(null);
  const [error, setError] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSizeState] = useState(initialPageSize);
  const [query, setQueryState] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [sort, setSortState] = useState("");

  useEffect(() => {
    let alive = true;
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
  }, [url]);

  const searchKeyId = searchKeys.join("|");

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
    if (sort) {
      const [key, dir] = sort.split(":");
      rows = [...rows].sort((a, b) => {
        const av = a[key as keyof T];
        const bv = b[key as keyof T];
        const cmp =
          typeof av === "number" && typeof bv === "number"
            ? av - bv
            : String(av ?? "").localeCompare(String(bv ?? ""), "id");
        return dir === "asc" ? cmp : -cmp;
      });
    }
    return rows;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allRows, query, filters, sort, searchKeyId]);

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
  const resetControls = () => {
    setQueryState("");
    setFilters({});
    setSortState("");
    setPage(1);
  };
  const updateRows = (updater: (rows: T[]) => T[]) => {
    setAllRows((current) => (current ? updater(current) : current));
    setPage(1);
  };
  const hasActiveControls = Boolean(query || sort || Object.values(filters).some(Boolean));

  const distinct = (key: keyof T) => {
    if (!allRows) return [] as string[];
    return Array.from(
      new Set(allRows.map((r) => String(r[key] ?? "")).filter((v) => v && v !== "-")),
    ).sort((a, b) => a.localeCompare(b, "id"));
  };

  return {
    rows,
    total,
    totalAll,
    loading: allRows === null && !error,
    error,
    page: safePage,
    setPage,
    pageSize,
    setPageSize,
    totalPages,
    query,
    setQuery,
    filters,
    setFilter,
    sort,
    setSort,
    resetControls,
    updateRows,
    hasActiveControls,
    distinct,
  };
}
