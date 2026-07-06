"use client";

import { useEffect, useMemo, useState } from "react";

/** pageSize 0 = tampilkan semua */
export function usePagedData<T>(url: string, initialPageSize = 10) {
  const [allRows, setAllRows] = useState<T[] | null>(null);
  const [error, setError] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSizeState] = useState(initialPageSize);

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

  const total = allRows?.length ?? 0;
  const totalPages = pageSize === 0 ? 1 : Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);

  const rows = useMemo(() => {
    if (!allRows) return [];
    if (pageSize === 0) return allRows;
    const start = (safePage - 1) * pageSize;
    return allRows.slice(start, start + pageSize);
  }, [allRows, safePage, pageSize]);

  const setPageSize = (size: number) => {
    setPageSizeState(size);
    setPage(1);
  };

  return {
    rows,
    total,
    loading: allRows === null && !error,
    error,
    page: safePage,
    setPage,
    pageSize,
    setPageSize,
    totalPages,
  };
}
