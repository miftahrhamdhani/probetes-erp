"use client";

import { useEffect, useMemo, useState } from "react";
import { AppHeader } from "@/components/layout/AppHeader";
import { DatabaseBackButton } from "@/features/database/components/DatabaseBackButton";
import { masterDataMenus } from "./config/masterDataMenus";
import { DataPeriodBadge } from "./components/DataPeriodBadge";
import { MasterDataContent } from "./components/MasterDataContent";
import { MasterDataMenuGrid } from "./components/MasterDataMenuGrid";
import { formatNumber } from "./lib/format";
import type { MasterDataSectionId } from "./types/masterData.types";

/** Jumlah data per menu dari /api/master/counts (badge kartu menu). */
type MenuCounts = Partial<Record<MasterDataSectionId, number>>;

export function MasterDataPage() {
  const [activeSection, setActiveSection] = useState<MasterDataSectionId>("pelanggan");
  const [counts, setCounts] = useState<MenuCounts>({});

  useEffect(() => {
    let alive = true;
    fetch("/api/master/counts")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data: Record<string, number>) => {
        if (!alive) return;
        setCounts({
          pelanggan: data.pelanggan,
          cohort: data.cohort,
          produk: data.produk,
          channel: data.channel,
          "cs-tim": data.csTim,
          ekspedisi: data.ekspedisi,
        });
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, []);

  const menus = useMemo(
    () =>
      masterDataMenus.map((menu) => ({
        ...menu,
        badge: counts[menu.id] != null ? formatNumber(counts[menu.id]!) : undefined,
      })),
    [counts],
  );

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#eef2f6]/90 text-brand-deep">
      <AppHeader />
      <main className="mx-auto flex w-full max-w-[1680px] flex-col gap-6 px-5 py-6 sm:px-7 lg:px-10">
        <div>
          <h1 className="text-3xl font-black tracking-[-0.045em] text-slate-950 sm:text-4xl">Data Utama</h1>
          <p className="mt-2 max-w-3xl text-sm font-medium leading-6 text-slate-600 sm:text-base">
            Pelanggan, cohort, produk, channel, tim, dan ekspedisi sebagai data acuan utama ERP.
          </p>
          <DataPeriodBadge />
        </div>
        <MasterDataMenuGrid menus={menus} activeId={activeSection} onSelect={setActiveSection} />
        <MasterDataContent activeId={activeSection} />
        <DatabaseBackButton />
      </main>
      <footer className="pb-7 pt-3 text-center text-xs font-medium text-slate-500 sm:text-sm">
        © 2026 Probetes ERP. All rights reserved.
      </footer>
    </div>
  );
}
