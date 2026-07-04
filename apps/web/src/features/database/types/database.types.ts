export interface DatabaseMenu {
  id: string;
  name: string;
  description: string;
  badge: string;
  badgeTone: "green" | "blue" | "neutral" | "active" | "monitoring";
  href: string;
  isActive?: boolean;
}
