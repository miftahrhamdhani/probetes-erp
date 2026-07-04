import { cn } from "@/lib/cn";

export function ProgressBar({ value, className }: { value: number; className?: string }) {
  const safeValue = Math.max(0, Math.min(100, value));

  return (
    <div className={cn("flex min-w-[120px] items-center gap-3", className)}>
      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={safeValue}>
        <div className="h-full rounded-full bg-brand-red" style={{ width: `${safeValue}%` }} />
      </div>
      <span className="w-10 text-right text-xs font-bold text-slate-700">{safeValue}%</span>
    </div>
  );
}
