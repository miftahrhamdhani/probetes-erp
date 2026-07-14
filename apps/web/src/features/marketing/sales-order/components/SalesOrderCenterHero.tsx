import { CheckCircle2, ShieldCheck, ShoppingCart, Target, TrendingUp } from "lucide-react";

interface SalesOrderCenterHeroProps {
  stats: { label: string; value: string; deltaPct?: number }[];
}

/** Hero Sales & Order Center — mengikuti mockup: pill "SALES MODULE", judul besar
 * (merah + navy), 3 fitur singkat, dan visual kanan: lingkaran konsentris + keranjang
 * merah + 3 kartu KPI melayang + kurva merah naik di kanan bawah. */
export function SalesOrderCenterHero({ stats }: SalesOrderCenterHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-[28px] bg-white shadow-sm">
      <div className="relative z-10 flex flex-col gap-8 p-8 md:p-12 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
        <div className="flex max-w-xl flex-col items-start">
          <span className="mb-4 inline-flex rounded-md bg-brand-red/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-red">
            SALES MODULE
          </span>
          <h1 className="text-4xl font-extrabold tracking-[-0.03em] text-slate-900 sm:text-5xl">
            <span className="text-brand-red">Sales &amp; Order</span> Center
          </h1>
          <p className="mt-4 text-base font-medium leading-relaxed text-slate-600 sm:text-lg">
            Pantau penjualan, pesanan, produk, toko, customer, retur, dan COD dalam satu dashboard terintegrasi.
          </p>

          <div className="mt-8 flex flex-col gap-5 sm:flex-row sm:gap-6">
            <div className="flex items-start gap-3">
              <TrendingUp className="mt-0.5 size-6 shrink-0 text-brand-red" strokeWidth={2} />
              <div>
                <h4 className="font-bold text-slate-900">Insight Real-Time</h4>
                <p className="mt-0.5 text-sm font-medium leading-tight text-slate-500">Data penjualan &amp; order terupdate setiap hari.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Target className="mt-0.5 size-6 shrink-0 text-brand-red" strokeWidth={2} />
              <div>
                <h4 className="font-bold text-slate-900">Analitik Mendalam</h4>
                <p className="mt-0.5 text-sm font-medium leading-tight text-slate-500">Drill-down per produk, channel, dan tim.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 size-6 shrink-0 text-brand-red" strokeWidth={2} />
              <div>
                <h4 className="font-bold text-slate-900">Keputusan Lebih Cepat</h4>
                <p className="mt-0.5 text-sm font-medium leading-tight text-slate-500">Dukung pertumbuhan bisnis berbasis data.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative hidden flex-1 items-center justify-center lg:flex">
          <div className="relative flex h-[220px] w-[220px] items-center justify-center">
            <div className="absolute size-[220px] rounded-full border-2 border-brand-red/10" />
            <div className="absolute size-[160px] rounded-full border-2 border-brand-red/15" />
            <div className="absolute size-[100px] rounded-full border-2 border-brand-red/20" />
            <div className="flex size-[76px] items-center justify-center rounded-2xl bg-brand-red shadow-lg shadow-brand-red/30">
              <ShoppingCart className="size-9 text-white" strokeWidth={1.8} />
            </div>
            <div className="absolute right-5 top-2 size-2.5 rounded-full bg-[#2563EB]" />
            <div className="absolute right-14 top-16 size-2.5 rounded-full bg-brand-red" />
            <div className="absolute bottom-10 left-2 size-2.5 rounded-full bg-[#F59E0B]" />
          </div>

          <div className="absolute -left-8 top-0 flex w-[168px] flex-col gap-1 rounded-2xl border border-slate-100 bg-white p-3.5 shadow-lg shadow-slate-200/60">
            <p className="text-[11px] font-semibold text-slate-500">{stats[0]?.label}</p>
            <p className="text-lg font-black text-slate-900">{stats[0]?.value}</p>
          </div>

          <div className="absolute -right-6 top-10 flex w-[132px] flex-col gap-1 rounded-2xl border border-slate-100 bg-white p-3.5 shadow-lg shadow-slate-200/60">
            <p className="text-[11px] font-semibold text-slate-500">{stats[2]?.label}</p>
            <p className="text-lg font-black text-slate-900">{stats[2]?.value}</p>
          </div>

          <div className="absolute -left-12 bottom-2 flex w-[150px] flex-col gap-1 rounded-2xl border border-slate-100 bg-white p-3.5 shadow-lg shadow-slate-200/60">
            <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-500"><CheckCircle2 className="size-3.5 text-emerald-500" />{stats[1]?.label}</p>
            <p className="text-lg font-black text-slate-900">{stats[1]?.value}</p>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 right-0 z-0 h-[210px] w-[640px]">
        <svg viewBox="0 0 640 210" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
          <path d="M0,210 C220,210 260,60 640,0 L640,210 Z" fill="rgba(214, 5, 17, 0.95)" />
          <path d="M0,210 C320,190 370,110 640,60 L640,210 Z" fill="#E60000" />
        </svg>
      </div>
      <div className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
    </section>
  );
}
