"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { type ImportHistoryEntry, seedHistory } from "@/features/marketing/lib/importHistory";

interface ImportHistoryContextValue {
  history: ImportHistoryEntry[];
  setHistory: React.Dispatch<React.SetStateAction<ImportHistoryEntry[]>>;
}

const ImportHistoryContext = createContext<ImportHistoryContextValue | null>(null);

/** Menyimpan riwayat import (Data Pesanan & Spending Ads) di memori browser, dibagi
 * antar halaman di dalam /marketing (Import, Iklan & ROAS, dst) — TIDAK ke database.
 * Reset kalau halaman di-refresh penuh; itu memang sengaja sesuai keputusan project
 * (belum ada backend penyimpanan import). */
export function ImportHistoryProvider({ children }: { children: ReactNode }) {
  const [history, setHistory] = useState<ImportHistoryEntry[]>(seedHistory);
  return (
    <ImportHistoryContext.Provider value={{ history, setHistory }}>
      {children}
    </ImportHistoryContext.Provider>
  );
}

export function useImportHistory() {
  const ctx = useContext(ImportHistoryContext);
  if (!ctx) throw new Error("useImportHistory harus dipakai di dalam ImportHistoryProvider");
  return ctx;
}
