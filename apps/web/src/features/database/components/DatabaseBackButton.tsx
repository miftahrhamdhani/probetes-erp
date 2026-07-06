import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function DatabaseBackButton({
  href = "/database",
  label = "Kembali ke Database",
}: {
  href?: string;
  label?: string;
}) {
  return (
    <Link
      href={href}
      className="inline-flex w-fit items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-brand-red shadow-sm transition hover:border-brand-red/40 hover:text-brand-red hover:shadow-md"
    >
      <ArrowLeft className="h-4 w-4" aria-hidden="true" />
      {label}
    </Link>
  );
}
