import { Bell, ChevronDown, Search } from "lucide-react";
import { ProbetesLogo } from "@/components/ui/ProbetesLogo";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-[#e5e7eb] bg-[#f6f7f9]/96 shadow-[0_6px_18px_rgba(15,23,42,0.035)] backdrop-blur">
      <div className="mx-auto flex h-[84px] w-full max-w-[1680px] items-center justify-between gap-4 px-5 sm:px-7 lg:px-10">
        <ProbetesLogo textSize="md" variant="header" />

        <div className="hidden flex-1 justify-center px-3 md:flex">
          <label className="relative w-full max-w-[460px]">
            <span className="sr-only">Pencarian</span>
            <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-500" />
            <input
              className="h-[52px] w-full rounded-xl border border-slate-200 bg-white/76 pl-12 pr-4 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-500 focus:border-brand-red/40 focus:bg-white focus:ring-4 focus:ring-brand-red/10"
              placeholder="Pencarian..."
              type="search"
            />
          </label>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <button
            className="relative grid size-10 place-items-center rounded-full text-slate-800 transition hover:bg-white"
            type="button"
            aria-label="Notifikasi"
          >
            <Bell className="size-5" strokeWidth={2.2} />
            <span className="absolute right-1 top-0.5 grid size-5 place-items-center rounded-full bg-brand-red text-[10px] font-bold text-white ring-2 ring-[#f6f7f9]">
              3
            </span>
          </button>

          <div className="flex items-center gap-2.5">
            <div className="grid size-10 place-items-center rounded-full bg-slate-200 text-base font-semibold text-slate-900">
              U
            </div>
            <span className="hidden text-sm font-semibold text-slate-900 sm:inline">User</span>
            <ChevronDown className="size-4 text-slate-900" />
          </div>
        </div>
      </div>

      <div className="border-t border-slate-200/70 px-5 py-2.5 md:hidden">
        <label className="relative block">
          <span className="sr-only">Pencarian</span>
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
          <input
            className="h-11 w-full rounded-xl border border-slate-200 bg-white/82 pl-11 pr-4 text-sm font-medium outline-none placeholder:text-slate-500 focus:border-brand-red/40 focus:ring-4 focus:ring-brand-red/10"
            placeholder="Pencarian..."
            type="search"
          />
        </label>
      </div>
    </header>
  );
}
