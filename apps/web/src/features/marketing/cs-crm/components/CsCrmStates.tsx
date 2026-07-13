import { AlertTriangle } from "lucide-react";

export function CsCrmErrorState({ message = "Gagal memuat data. Coba muat ulang halaman." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-red-100 bg-red-50 px-6 py-10 text-center">
      <AlertTriangle className="size-6 text-red-400" strokeWidth={1.75} />
      <p className="text-sm font-semibold text-red-600">{message}</p>
    </div>
  );
}

export function CsCrmKpiSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-[112px] animate-pulse rounded-[18px] border border-slate-100 bg-slate-100" />
      ))}
    </div>
  );
}

export function CsCrmSectionSkeleton() {
  return <div className="h-[320px] animate-pulse rounded-[20px] bg-slate-100" />;
}
