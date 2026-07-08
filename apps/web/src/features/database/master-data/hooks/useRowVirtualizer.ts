"use client";

import { useEffect, useRef, useState } from "react";

interface Options {
  count: number;
  rowHeight: number;
  overscan?: number;
}

/**
 * Virtualisasi baris tabel yang sederhana: hanya baris di sekitar area terlihat
 * yang di-render ke DOM, sisanya diwakili spacer <tr>. Mengatasi lag saat
 * tabel menampilkan ribuan baris sekaligus (mis. pilihan "Tampilkan: Semua").
 */
export function useRowVirtualizer<T extends HTMLElement>({ count, rowHeight, overscan = 8 }: Options) {
  const containerRef = useRef<T>(null);
  const [range, setRange] = useState({ start: 0, end: Math.min(count, 40) });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => {
      const scrollTop = el.scrollTop;
      const viewport = el.clientHeight || 560;
      const start = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
      const visibleCount = Math.ceil(viewport / rowHeight) + overscan * 2;
      setRange({ start, end: Math.min(count, start + visibleCount) });
    };

    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [count, rowHeight, overscan]);

  // Rapikan rentang saat jumlah baris berubah (mis. hasil pencarian/filter berubah).
  useEffect(() => {
    setRange((r) => ({ start: Math.min(r.start, count), end: Math.min(Math.max(r.end, 1), count) }));
  }, [count]);

  const start = Math.min(range.start, count);
  const end = Math.min(Math.max(range.end, start), count);

  return {
    containerRef,
    start,
    end,
    topSpacer: start * rowHeight,
    bottomSpacer: Math.max(0, (count - end) * rowHeight),
  };
}
