import { CloudUpload, ShieldCheck, GitMerge, Shield, TriangleAlert } from "lucide-react";

export function DatabaseHero() {
  return (
    <section className="relative overflow-hidden rounded-[28px] bg-white shadow-sm">
      <div className="relative z-10 flex flex-col gap-8 p-8 md:p-12 lg:flex-row lg:items-center lg:justify-between lg:gap-12">

        {/* Left Content */}
        <div className="flex max-w-xl flex-col items-start">
          <span className="mb-4 inline-flex rounded-md bg-brand-red/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-red">
            DATABASE MODULE
          </span>
          <h1 className="text-4xl font-extrabold tracking-[-0.03em] text-slate-900 sm:text-5xl">
            <span className="text-brand-red">Database</span> Control Center
          </h1>
          <p className="mt-4 text-base font-medium leading-relaxed text-slate-600 sm:text-lg">
            Kelola import, validasi, mapping, dan publish data dalam satu sistem terintegrasi.
          </p>

          <div className="mt-8 flex flex-col gap-5 sm:flex-row sm:gap-6">
            <div className="flex items-start gap-3">
              <CloudUpload className="mt-0.5 size-6 shrink-0 text-brand-red" strokeWidth={2} />
              <div>
                <h4 className="font-bold text-slate-900">Import Terkelola</h4>
                <p className="mt-0.5 text-sm font-medium leading-tight text-slate-500">
                  Proses upload dan integrasi lebih rapi
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 size-6 shrink-0 text-brand-red" strokeWidth={2} />
              <div>
                <h4 className="font-bold text-slate-900">Validasi Cepat</h4>
                <p className="mt-0.5 text-sm font-medium leading-tight text-slate-500">
                  Temukan error dan duplikasi lebih cepat
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <GitMerge className="mt-0.5 size-6 shrink-0 text-brand-red" strokeWidth={2} />
              <div>
                <h4 className="font-bold text-slate-900">Mapping Akurat</h4>
                <p className="mt-0.5 text-sm font-medium leading-tight text-slate-500">
                  Data lebih konsisten sebelum publish
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Visual (CSS/SVG Illustration) */}
        <div className="relative hidden flex-1 items-center justify-center lg:flex">
          {/* Cylinder Base */}
          <div className="relative h-[220px] w-[180px]">
            {/* Top Ellipse */}
            <div className="absolute left-0 top-0 z-20 h-[50px] w-full rounded-[50%] border-4 border-slate-100 bg-white"></div>
            {/* Middle Section 1 */}
            <div className="absolute left-0 top-[40px] z-10 h-[50px] w-full rounded-[50%] border-4 border-slate-100 bg-white"></div>
            {/* Middle Section 2 */}
            <div className="absolute left-0 top-[80px] z-10 h-[50px] w-full rounded-[50%] border-4 border-slate-100 bg-white"></div>
            {/* Body */}
            <div className="absolute left-0 top-[25px] z-0 h-[170px] w-full rounded-b-[25px] border-x-4 border-b-4 border-slate-100 bg-white shadow-xl shadow-slate-200/50"></div>

            {/* Red Accent Lines */}
            <div className="absolute left-0 top-[65px] z-30 h-1 w-full bg-brand-red"></div>
            <div className="absolute left-0 top-[105px] z-30 h-1 w-full bg-brand-red"></div>
            <div className="absolute left-0 top-[145px] z-30 h-1 w-full bg-brand-red"></div>

            {/* Shield Logo P */}
            <div className="absolute -left-6 bottom-4 z-40 flex size-[72px] items-center justify-center rounded-2xl bg-brand-red shadow-lg shadow-brand-red/30">
              <span className="text-4xl font-extrabold text-white">P</span>
            </div>
          </div>

          {/* Floating Cards */}
          <div className="absolute -left-16 top-0 flex w-[200px] flex-col gap-3 rounded-xl border border-slate-100 bg-white/90 p-4 shadow-lg shadow-slate-200/50 backdrop-blur-sm">
            <h5 className="text-xs font-bold text-slate-800">Import Summary</h5>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="grid size-6 place-items-center rounded-md bg-brand-red/10 text-brand-red">
                  <CloudUpload className="size-3.5" strokeWidth={2.5} />
                </div>
                <span className="text-xs font-medium text-slate-600">Total Import</span>
              </div>
              <span className="text-sm font-bold text-slate-900">128</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="grid size-6 place-items-center rounded-md bg-amber-500/10 text-amber-500">
                  <TriangleAlert className="size-3.5" strokeWidth={2.5} />
                </div>
                <span className="text-xs font-medium text-slate-600">Pending</span>
              </div>
              <span className="text-sm font-bold text-slate-900">24</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="grid size-6 place-items-center rounded-md bg-emerald-500/10 text-emerald-500">
                  <ShieldCheck className="size-3.5" strokeWidth={2.5} />
                </div>
                <span className="text-xs font-medium text-slate-600">Ready</span>
              </div>
              <span className="text-sm font-bold text-slate-900">36</span>
            </div>
          </div>

          <div className="absolute -right-20 top-4 flex w-[180px] flex-col gap-3 rounded-xl border border-slate-100 bg-white/90 p-4 shadow-lg shadow-slate-200/50 backdrop-blur-sm">
            <h5 className="text-xs font-bold text-slate-800">Data Quality</h5>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="size-2.5 rounded-full bg-emerald-500"></div>
                <span className="text-xs font-medium text-slate-600">Valid</span>
              </div>
              <span className="text-xs font-bold text-slate-900">76%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="size-2.5 rounded-full bg-amber-500"></div>
                <span className="text-xs font-medium text-slate-600">Warning</span>
              </div>
              <span className="text-xs font-bold text-slate-900">14%</span>
            </div>
          </div>

          <div className="absolute -right-24 bottom-10 flex w-[200px] flex-col gap-3 rounded-xl border border-slate-100 bg-white/90 p-4 shadow-lg shadow-slate-200/50 backdrop-blur-sm">
            <h5 className="text-xs font-bold text-slate-800">Publish Status</h5>
            <div className="flex items-end gap-1.5 pt-2">
              <div className="w-4 rounded-t-sm bg-brand-red/20" style={{ height: "24px" }}></div>
              <div className="w-4 rounded-t-sm bg-brand-red" style={{ height: "48px" }}></div>
              <div className="w-4 rounded-t-sm bg-brand-red/40" style={{ height: "32px" }}></div>
              <div className="ml-4 flex flex-col">
                <div className="flex justify-between gap-4">
                  <span className="text-[10px] font-medium text-slate-500">Published</span>
                  <span className="text-[10px] font-bold text-slate-900">420</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-[10px] font-medium text-slate-500">Failed</span>
                  <span className="text-[10px] font-bold text-slate-900">12</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Red Wave/Curve */}
      <div className="absolute bottom-0 right-0 z-0 h-[200px] w-[600px]">
        <svg viewBox="0 0 600 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
          <path d="M0,200 C200,200 250,50 600,0 L600,200 Z" fill="rgba(214, 5, 17, 0.95)" />
          <path d="M0,200 C300,180 350,100 600,60 L600,200 Z" fill="#E60000" />
        </svg>
      </div>

      {/* Subtle Grid Background */}
      <div className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
    </section>
  );
}
