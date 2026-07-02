import { AppHeader } from "@/components/launcher/AppHeader";
import { HeroBanner } from "@/components/launcher/HeroBanner";
import { ModuleGrid } from "@/components/launcher/ModuleGrid";
import { erpModules } from "@/config/modules";

export default function Home() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#eef2f6]/90 text-brand-deep">
      <AppHeader />
      <main className="mx-auto flex w-full max-w-[1680px] flex-col gap-5 px-5 py-5 sm:px-7 lg:px-10">
        <HeroBanner />
        <ModuleGrid modules={erpModules} />
      </main>
      <footer className="pb-7 pt-3 text-center text-xs font-medium text-slate-500 sm:text-sm">
        © 2026 Probetes ERP. All rights reserved.
      </footer>
    </div>
  );
}
