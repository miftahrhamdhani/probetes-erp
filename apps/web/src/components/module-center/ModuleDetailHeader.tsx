interface ModuleDetailHeaderProps {
  eyebrow: string;
  title: string;
  description: string;
}

/** Header ringkas untuk halaman detail submenu — tanpa hero besar, terasa seperti halaman kerja ERP. */
export function ModuleDetailHeader({ eyebrow, title, description }: ModuleDetailHeaderProps) {
  return (
    <div>
      <span className="inline-flex rounded-md bg-brand-red/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-red">
        {eyebrow}
      </span>
      <h1 className="mt-3 text-2xl font-extrabold tracking-[-0.03em] text-slate-900 sm:text-3xl">{title}</h1>
      <p className="mt-1.5 max-w-2xl text-sm font-medium text-slate-600 sm:text-base">{description}</p>
    </div>
  );
}
