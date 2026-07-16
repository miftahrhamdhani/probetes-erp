import Link from "next/link";
import { ChevronLeft } from "lucide-react";

/** Tombol kembali ke halaman utama modul (bukan ke beranda) — dipakai di halaman detail submenu. */
export function ModuleBackButton({ href, label }: { href: string; label: string }) {
  return (
    <div className="flex">
      <Link
        href={href}
        className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
      >
        <ChevronLeft className="size-4" strokeWidth={2.5} />
        {label}
      </Link>
    </div>
  );
}
