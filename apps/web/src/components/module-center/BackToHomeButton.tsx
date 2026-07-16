import Link from "next/link";
import { ChevronLeft } from "lucide-react";

/** Tombol kembali ke beranda — selalu di bawah kiri area konten. */
export function BackToHomeButton() {
  return (
    <div className="flex">
      <Link
        href="/"
        className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
      >
        <ChevronLeft className="size-4" strokeWidth={2.5} />
        Kembali ke Beranda
      </Link>
    </div>
  );
}
