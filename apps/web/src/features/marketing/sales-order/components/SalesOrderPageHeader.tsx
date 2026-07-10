import { ChevronRight } from "lucide-react";

interface SalesOrderPageHeaderProps {
  eyebrow: string;
  titleRed: string;
  titleDark: string;
  description: string;
  breadcrumb?: string;
  updateInfo?: string;
}

/** Header halaman detail Sales & Order: eyebrow pill, judul besar (kata pertama merah,
 * sisanya navy), deskripsi. Meniru layout mockup (SALES MODULE / Performa Produk, dst). */
export function SalesOrderPageHeader({ eyebrow, titleRed, titleDark, description, breadcrumb, updateInfo }: SalesOrderPageHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        {breadcrumb && (
          <p className="mb-2 inline-flex items-center gap-1.5 text-xs font-bold text-slate-400">
            <span>Sales &amp; Order Center</span>
            <ChevronRight className="size-3.5" strokeWidth={2.5} />
            <span className="text-slate-600">{breadcrumb}</span>
          </p>
        )}
        <span className="inline-flex rounded-md bg-brand-red/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-red">{eyebrow}</span>
        <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.03em] text-slate-900 sm:text-4xl">
          <span className="text-brand-red">{titleRed}</span> {titleDark}
        </h1>
        <p className="mt-2 max-w-2xl text-sm font-medium leading-relaxed text-slate-600">{description}</p>
      </div>
      {updateInfo && (
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700">
          <span className="size-1.5 rounded-full bg-emerald-500" /> {updateInfo}
        </span>
      )}
    </div>
  );
}
