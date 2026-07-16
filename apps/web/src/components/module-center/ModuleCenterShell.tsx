import type { ReactNode } from "react";
import { AppHeader } from "@/components/layout/AppHeader";
import { BackToHomeButton } from "./BackToHomeButton";

/**
 * Wrapper halaman menu center: header global, lebar konten konsisten, footer,
 * dan tombol kembali di bawah kiri. Dipakai semua menu utama non-Database/Marketing.
 */
export function ModuleCenterShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#eef2f6]/90 text-brand-deep">
      <AppHeader />
      <main className="mx-auto flex w-full max-w-[1680px] flex-col gap-6 px-5 py-6 sm:px-7 lg:px-10">
        {children}
        <BackToHomeButton />
      </main>
      <footer className="pb-7 pt-3 text-center text-xs font-medium text-slate-500 sm:text-sm">
        © 2026 Probetes ERP. All rights reserved.
      </footer>
    </div>
  );
}
