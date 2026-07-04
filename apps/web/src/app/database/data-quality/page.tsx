import { AppHeader } from "@/components/layout/AppHeader";

export default function DataQualityPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#eef2f6]/90 text-brand-deep">
      <AppHeader />
      <main className="mx-auto flex w-full max-w-[1680px] flex-col gap-6 px-5 py-6 sm:px-7 lg:px-10">
        <div>
          <h1 className="text-3xl font-black tracking-[-0.045em] text-slate-950 sm:text-4xl">
            Data Quality
          </h1>
          <p className="mt-2 max-w-3xl text-sm font-medium leading-6 text-slate-600 sm:text-base">
            Pantau data duplikat, kosong, tidak valid, atau belum termapping.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Halaman ini akan dikembangkan pada tahap berikutnya.
          </p>
        </div>
      </main>
      <footer className="pb-7 pt-3 text-center text-xs font-medium text-slate-500 sm:text-sm">
        © 2026 Probetes ERP. All rights reserved.
      </footer>
    </div>
  );
}
