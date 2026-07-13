"use client";

import { useEffect, useState } from "react";
import { DummyBanner } from "@/features/marketing/components/DummyBanner";
import { MarketingBackButton } from "@/features/marketing/components/MarketingBackButton";
import { CrmCenterHero } from "./components/CrmCenterHero";
import { CrmCenterMenuCard } from "./components/CrmCenterMenuCard";
import { getCrmCenterSummary } from "./lib/crmService";
import type { CrmCenterData } from "./types/crmTypes";

/** Halaman awal CRM (menu center). Sesuai konsep: hanya hero + 5 kartu menu besar,
 * tanpa filter. Filter & data detail muncul di halaman submenu masing-masing. */
export function CrmCenterPage() {
  const [data, setData] = useState<CrmCenterData | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    getCrmCenterSummary().then(setData).catch(() => setError(true));
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#eef2f6]/90 text-brand-deep">
      <main className="mx-auto flex w-full max-w-[1680px] flex-col gap-6 px-5 py-6 sm:px-7 lg:px-10">
        <DummyBanner />

        {data && <CrmCenterHero stats={data.heroStats} />}

        {error && (
          <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-700">
            Ringkasan CRM belum bisa dimuat. Coba muat ulang halaman.
          </div>
        )}

        <div className="flex flex-col gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-[-0.03em] text-slate-900 sm:text-2xl">Pilih Menu CRM</h2>
            <p className="mt-1.5 text-sm font-medium text-slate-600 sm:text-base">
              Import data CRM, pantau closingan, analisis iklan CRM, retention &amp; cluster customer, dan perbaiki data.
            </p>
          </div>

          {data && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {data.menuCards.map((menu) => (
                <CrmCenterMenuCard key={menu.id} menu={menu} fullWidth={menu.id === "review"} />
              ))}
            </div>
          )}

          {data && (
            <p className="text-xs font-semibold text-slate-400">Data Terkini: {data.dataTerkini}</p>
          )}
        </div>

        <div className="flex"><MarketingBackButton /></div>
      </main>
      <footer className="pb-7 pt-3 text-center text-xs font-medium text-slate-500 sm:text-sm">
        © 2026 Probetes ERP. All rights reserved.
      </footer>
    </div>
  );
}
