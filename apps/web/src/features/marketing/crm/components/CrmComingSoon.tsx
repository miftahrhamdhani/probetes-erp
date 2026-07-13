import { Hammer } from "lucide-react";
import { DummyBanner } from "@/features/marketing/components/DummyBanner";
import { MarketingBackButton } from "@/features/marketing/components/MarketingBackButton";

/** Placeholder sementara untuk submenu CRM yang belum dibangun. Jujur menandai halaman
 * masih disiapkan, bukan data mati yang menyesatkan. Diganti dengan halaman asli per tahap. */
export function CrmComingSoon({ title, description }: { title: string; description: string }) {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#eef2f6]/90 text-brand-deep">
      <main className="mx-auto flex w-full max-w-[1680px] flex-col gap-6 px-5 py-6 sm:px-7 lg:px-10">
        <DummyBanner />

        <div>
          <h1 className="text-3xl font-extrabold tracking-[-0.03em] text-slate-900 sm:text-4xl">{title}</h1>
          <p className="mt-2 max-w-2xl text-sm font-medium leading-relaxed text-slate-600">{description}</p>
        </div>

        <div className="flex flex-col items-center justify-center gap-3 rounded-[24px] border border-dashed border-slate-300 bg-white/70 px-6 py-16 text-center">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-brand-red/10">
            <Hammer className="size-7 text-brand-red" strokeWidth={2} />
          </span>
          <h2 className="text-lg font-bold text-slate-900">Halaman sedang disiapkan</h2>
          <p className="max-w-md text-sm font-medium text-slate-500">
            Tampilan &amp; data untuk bagian ini akan dibangun pada tahap berikutnya.
          </p>
        </div>

        <div className="flex">
          <MarketingBackButton href="/marketing/crm" label="Kembali ke CRM" />
        </div>
      </main>
      <footer className="pb-7 pt-3 text-center text-xs font-medium text-slate-500 sm:text-sm">
        © 2026 Probetes ERP. All rights reserved.
      </footer>
    </div>
  );
}
