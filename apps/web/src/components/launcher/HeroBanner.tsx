import { BarChart3, ShieldCheck, Target, TrendingUp } from "lucide-react";
import { ProbetesLogo } from "./ProbetesLogo";

const highlights = [
  {
    title: "Data Terintegrasi",
    description: "Satu sumber kebenaran",
    icon: BarChart3
  },
  {
    title: "Akurat & Andal",
    description: "Validasi dan kontrol data",
    icon: ShieldCheck
  },
  {
    title: "Insight Cepat",
    description: "Keputusan lebih tepat",
    icon: Target
  }
];

const bars = [54, 76, 44, 67, 58, 84];

export function HeroBanner() {
  return (
    <section className="relative min-h-[300px] overflow-hidden rounded-2xl border border-slate-200 bg-white/84 shadow-soft">
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.98)_0%,rgba(255,255,255,0.94)_42%,rgba(255,255,255,0.68)_65%,rgba(255,255,255,0.42)_100%)]" />
      <div className="absolute right-0 top-0 hidden h-full w-[48%] bg-[radial-gradient(circle_at_42%_40%,rgba(15,23,42,0.09),transparent_15rem)] lg:block" />
      <div className="absolute right-0 top-0 hidden h-full w-[48%] opacity-70 lg:block">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0),rgba(241,245,249,0.88))]" />
        <div className="absolute left-5 top-0 h-full w-px bg-slate-200/80" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.13)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.13)_1px,transparent_1px)] bg-[size:66px_34px]" />
      </div>

      <div className="relative z-10 grid gap-6 px-6 py-7 sm:px-9 lg:grid-cols-[1.05fr_0.95fr] lg:px-14 lg:py-10">
        <div className="flex flex-col justify-center">
          <h1 className="max-w-3xl text-4xl font-black leading-[0.98] tracking-[-0.055em] text-slate-950 sm:text-5xl lg:text-6xl">
            Gambaran ERP
          </h1>
          <p className="mt-3 text-2xl font-extrabold tracking-[-0.035em] text-brand-red sm:text-3xl">
            Marketing Command Center
          </p>
          <p className="mt-4 max-w-2xl text-base font-medium leading-7 text-slate-600 sm:text-lg">
            Satu sistem terintegrasi untuk mengelola data penjualan, marketing, dan performa
            bisnis secara akurat.
          </p>

          <div className="mt-7 grid gap-4 md:grid-cols-3">
            {highlights.map((item, index) => {
              const Icon = item.icon;

              return (
                <div
                  className="flex items-center gap-3.5 md:border-r md:border-slate-200 md:pr-4 last:md:border-r-0"
                  key={item.title}
                >
                  <Icon className="size-9 shrink-0 text-brand-red" strokeWidth={2.4} />
                  <div>
                    <p className="font-bold text-slate-950">{item.title}</p>
                    <p className="mt-1 text-xs font-medium text-slate-600 sm:text-sm">
                      {item.description}
                    </p>
                  </div>
                  {index < highlights.length - 1 ? null : null}
                </div>
              );
            })}
          </div>
        </div>

        <div className="relative hidden min-h-[245px] items-center justify-center lg:flex">
          <div className="absolute bottom-[-86px] right-[-78px] h-48 w-[380px] rotate-[-12deg] rounded-tl-[100%] bg-gradient-to-r from-[#ef1b27] to-[#c9000b]" />
          <div className="absolute bottom-[-52px] right-[-30px] h-28 w-[326px] rotate-[-12deg] rounded-tl-[100%] bg-white/24" />

          <div className="absolute right-4 top-7 w-72 rounded-2xl border border-slate-200/90 bg-white/42 p-4 shadow-[0_16px_38px_rgba(15,23,42,0.075)] backdrop-blur-sm">
            <div className="mb-3 flex items-center gap-2 text-brand-red">
              <TrendingUp className="size-4" />
              <span className="text-xs font-bold sm:text-sm">Performance trend</span>
            </div>
            <div className="relative h-28">
              <div className="absolute inset-0 flex items-end justify-between gap-2.5 px-2">
                {bars.map((height, index) => (
                  <div
                    className="w-7 rounded-t bg-slate-300/72"
                    key={`${height}-${index}`}
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>
              <svg className="absolute inset-0 h-full w-full" viewBox="0 0 320 128" role="img">
                <title>Ilustrasi tren performa ERP</title>
                <polyline
                  fill="none"
                  points="12,96 62,70 112,88 162,58 212,42 262,30 308,10"
                  stroke="#e30613"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="4"
                />
                {["12,96", "62,70", "112,88", "162,58", "212,42", "262,30", "308,10"].map(
                  (point) => {
                    const [cx, cy] = point.split(",");
                    return <circle cx={cx} cy={cy} fill="#e30613" key={point} r="5" />;
                  }
                )}
              </svg>
            </div>
          </div>

          <div className="relative mt-10 grid h-56 w-56 place-items-center rounded-full bg-white/84 shadow-[0_22px_52px_rgba(15,23,42,0.13)] ring-1 ring-slate-200/80">
            <div className="absolute -bottom-6 h-12 w-64 rounded-[50%] bg-slate-300/42 blur-sm" />
            <ProbetesLogo
              showText={false}
              variant="hero"
              markClassName="drop-shadow-[0_22px_52px_rgba(227,6,19,0.26)]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
