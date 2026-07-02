import type { ErpModuleItem } from "@probetes/types";
import { ModuleCard } from "./ModuleCard";

interface ModuleGridProps {
  modules: ErpModuleItem[];
}

export function ModuleGrid({ modules }: ModuleGridProps) {
  return (
    <section aria-labelledby="module-title" className="px-1">
      <div className="mb-3">
        <h2 id="module-title" className="text-2xl font-extrabold tracking-[-0.04em] text-slate-950">
          Pilih Modul
        </h2>
        <p className="mt-1.5 text-sm font-medium text-slate-600 sm:text-base">
          Fase pertama fokus migrasi database dan Marketing ERP
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {modules.map((module) => (
          <ModuleCard key={module.id} module={module} />
        ))}
      </div>
    </section>
  );
}
