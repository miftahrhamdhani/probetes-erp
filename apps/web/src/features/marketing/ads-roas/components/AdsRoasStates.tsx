import { AlertTriangle } from "lucide-react";

export function AdsRoasEmptyState({ message = "Belum ada data untuk filter ini." }: { message?: string }) {
  return <p className="rounded-2xl bg-slate-50 p-6 text-center text-xs font-semibold text-slate-400">{message}</p>;
}

export function AdsRoasErrorState({ message = "Gagal memuat data. Coba muat ulang halaman." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-red-100 bg-red-50 px-6 py-10 text-center">
      <AlertTriangle className="size-6 text-red-400" strokeWidth={1.75} />
      <p className="text-sm font-semibold text-red-600">{message}</p>
    </div>
  );
}

export function AdsRoasKpiSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-7">
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="h-[112px] animate-pulse rounded-[18px] border border-slate-100 bg-slate-100" />
      ))}
    </div>
  );
}

export function AdsRoasSectionSkeleton() {
  return <div className="h-[240px] animate-pulse rounded-[20px] bg-slate-100" />;
}
