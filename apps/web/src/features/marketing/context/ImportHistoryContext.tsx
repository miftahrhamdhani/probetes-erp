"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { type ImportHistoryEntry } from "@/features/marketing/lib/importHistory";

interface ImportHistoryContextValue {
  history: ImportHistoryEntry[];
  setHistory: React.Dispatch<React.SetStateAction<ImportHistoryEntry[]>>;
}

const ImportHistoryContext = createContext<ImportHistoryContextValue | null>(null);

/** Context kompatibilitas untuk halaman Marketing lama. Flow import yang baru
 * mengambil riwayat persisten langsung dari API PostgreSQL tanpa seed dummy. */
export function ImportHistoryProvider({ children }: { children: ReactNode }) {
  const [history, setHistory] = useState<ImportHistoryEntry[]>([]);
  return (
    <ImportHistoryContext.Provider value={{ history, setHistory }}>
      {children}
    </ImportHistoryContext.Provider>
  );
}

export function useImportHistory() {
  const context = useContext(ImportHistoryContext);
  if (!context) throw new Error("useImportHistory harus dipakai di dalam ImportHistoryProvider");
  return context;
}
