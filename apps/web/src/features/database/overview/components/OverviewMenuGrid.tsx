import type { OverviewMenu, OverviewSectionId } from "../types/databaseOverview.types";
import { OverviewMenuCard } from "./OverviewMenuCard";

interface OverviewMenuGridProps {
  menus: OverviewMenu[];
  activeId: OverviewSectionId;
  onSelect: (id: OverviewSectionId) => void;
}

export function OverviewMenuGrid({ menus, activeId, onSelect }: OverviewMenuGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {menus.map((menu) => (
        <OverviewMenuCard key={menu.id} menu={menu} isActive={menu.id === activeId} onSelect={onSelect} />
      ))}
    </div>
  );
}
