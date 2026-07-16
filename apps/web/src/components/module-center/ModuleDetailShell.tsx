import type { ReactNode } from "react";
import { AppHeader } from "@/components/layout/AppHeader";
import { ModuleBackButton } from "./ModuleBackButton";

interface ModuleDetailShellProps {
  children: ReactNode;
  /** Route halaman utama modul, contoh: /finance */
  parentHref: string;
  /** Contoh: "Kembali ke Finance" */
  parentLabel: string;
}

/**
 * Wrapper halaman detail submenu: header global, lebar konten konsisten, footer,
 * dan tombol kembali ke halaman utama modul (bukan ke beranda). Dipakai oleh
 * semua halaman detail submenu (mis. /finance/pemasukan, /hris/absensi).
 */
export function ModuleDetailShell({ children, parentHref, parentLabel }: ModuleDetailShellProps) {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#eef2f6]/90 text-brand-deep">
      <AppHeader />
      <main className="mx-auto flex w-full max-w-[1680px] flex-col gap-6 px-5 py-6 sm:px-7 lg:px-10">
        {children}
        <ModuleBackButton href={parentHref} label={parentLabel} />
      </main>
      <footer className="pb-7 pt-3 text-center text-xs font-medium text-slate-500 sm:text-sm">
        © 2026 Probetes ERP. All rights reserved.
      </footer>
    </div>
  );
}
