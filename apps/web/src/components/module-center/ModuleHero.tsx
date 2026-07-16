import type { LucideIcon } from "lucide-react";

export interface ModuleHeroHighlight {
  icon: LucideIcon;
  title: string;
  detail: string;
}

interface ModuleHeroProps {
  eyebrow: string;
  titlePrefix: string;
  titleHighlight: string;
  description: string;
  highlights: ModuleHeroHighlight[];
  monogram: string;
}

/** Hero/banner menu center — pola visual sama dengan Database & Marketing (versi ringkas). */
export function ModuleHero({ eyebrow, titlePrefix, titleHighlight, description, highlights, monogram }: ModuleHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-[28px] bg-white shadow-sm">
      <div className="relative z-10 flex flex-col gap-8 p-8 md:p-12 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
        <div className="flex max-w-xl flex-col items-start">
          <span className="mb-4 inline-flex rounded-md bg-brand-red/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-red">
            {eyebrow}
          </span>
          <h1 className="text-4xl font-extrabold tracking-[-0.03em] text-slate-900 sm:text-5xl">
            <span className="text-brand-red">{titlePrefix}</span> {titleHighlight}
          </h1>
          <p className="mt-4 text-base font-medium leading-relaxed text-slate-600 sm:text-lg">{description}</p>

          <div className="mt-8 flex flex-col gap-5 sm:flex-row sm:flex-wrap sm:gap-6">
            {highlights.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="flex items-start gap-3">
                  <Icon className="mt-0.5 size-6 shrink-0 text-brand-red" strokeWidth={2} />
                  <div>
                    <h4 className="font-bold text-slate-900">{item.title}</h4>
                    <p className="mt-0.5 text-sm font-medium leading-tight text-slate-500">{item.detail}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="relative hidden flex-1 items-center justify-center lg:flex">
          <div className="relative flex h-[220px] w-[220px] items-center justify-center">
            <div className="absolute size-[220px] rounded-full border-2 border-brand-red/10" />
            <div className="absolute size-[160px] rounded-full border-2 border-brand-red/20" />
            <div className="absolute size-[100px] rounded-full border-2 border-brand-red/30" />
            <div className="flex size-[68px] items-center justify-center rounded-2xl bg-brand-red shadow-lg shadow-brand-red/30">
              <span className="text-3xl font-extrabold text-white">{monogram}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 right-0 z-0 h-[200px] w-[600px]">
        <svg viewBox="0 0 600 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
          <path d="M0,200 C200,200 250,50 600,0 L600,200 Z" fill="rgba(214, 5, 17, 0.95)" />
          <path d="M0,200 C300,180 350,100 600,60 L600,200 Z" fill="#E60000" />
        </svg>
      </div>
      <div className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
    </section>
  );
}
