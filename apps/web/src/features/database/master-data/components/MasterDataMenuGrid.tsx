import type { MasterDataMenu, MasterDataSectionId } from "../types/masterData.types";
import { MasterDataMenuCard } from "./MasterDataMenuCard";

interface MasterDataMenuGridProps {
  menus: MasterDataMenu[];
  activeId: MasterDataSectionId;
  onSelect: (id: MasterDataSectionId) => void;
}

export function MasterDataMenuGrid({ menus, activeId, onSelect }: MasterDataMenuGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {menus.map((menu) => (
        <MasterDataMenuCard key={menu.id} menu={menu} isActive={menu.id === activeId} onSelect={onSelect} />
      ))}
    </div>
  );
}
