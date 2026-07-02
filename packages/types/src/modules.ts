export type ModuleBadgeTone = "green" | "blue" | "neutral";

export interface ErpModuleItem {
  id: string;
  name: string;
  description: string;
  badge: string;
  badgeTone: ModuleBadgeTone;
  isActive?: boolean;
}
