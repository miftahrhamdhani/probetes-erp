export interface DatabaseMenu {
  id: string;
  name: string;
  description: string;
  badge: string;
  badgeTone: "green" | "blue" | "neutral" | "active";
  href: string;
  isActive?: boolean;
}
