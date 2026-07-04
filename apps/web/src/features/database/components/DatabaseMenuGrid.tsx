import type { DatabaseMenu } from "../types/database.types";
import { DatabaseMenuCard } from "./DatabaseMenuCard";

interface DatabaseMenuGridProps {
  menus: DatabaseMenu[];
}

export function DatabaseMenuGrid({ menus }: DatabaseMenuGridProps) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-bold tracking-[-0.03em] text-slate-900 sm:text-2xl">
          Pilih Menu Database
        </h2>
        <p className="mt-1.5 text-sm font-medium text-slate-600 sm:text-base">
          Pantau data utama ERP, kualitas data, dan status backup sistem.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {menus.map((menu) => (
          <DatabaseMenuCard key={menu.id} menu={menu} />
        ))}
      </div>
    </div>
  );
}
