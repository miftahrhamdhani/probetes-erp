"use client";

import { useState } from "react";
import { AppHeader } from "@/components/layout/AppHeader";
import { overviewMenus } from "./config/overviewMenus";
import { OverviewContent } from "./components/OverviewContent";
import { OverviewMenuGrid } from "./components/OverviewMenuGrid";
import type { OverviewSectionId } from "./types/databaseOverview.types";

export function DatabaseOverviewPage() {
  const [activeOverviewSection, setActiveOverviewSection] = useState<OverviewSectionId>("summary-kpi");

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#eef2f6]/90 text-brand-deep">
      <AppHeader />
      <main className="mx-auto flex w-full max-w-[1680px] flex-col gap-6 px-5 py-6 sm:px-7 lg:px-10">
        <div>
          <h1 className="text-3xl font-black tracking-[-0.045em] text-slate-950 sm:text-4xl">Database Overview</h1>
          <p className="mt-2 max-w-3xl text-sm font-medium leading-6 text-slate-600 sm:text-base">
            Pantau kesehatan, kualitas, dan kesiapan data ERP dalam satu halaman.
          </p>
        </div>
        <OverviewMenuGrid menus={overviewMenus} activeId={activeOverviewSection} onSelect={setActiveOverviewSection} />
        <OverviewContent activeId={activeOverviewSection} />
      </main>
      <footer className="pb-7 pt-3 text-center text-xs font-medium text-slate-500 sm:text-sm">
        © 2026 Probetes ERP. All rights reserved.
      </footer>
    </div>
  );
}
