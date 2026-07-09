export type MarketingSectionId = "import" | "sales" | "ads" | "crm";

export type MarketingIconKey = "upload" | "receipt" | "megaphone" | "users";

export interface MarketingMenu {
  id: MarketingSectionId;
  title: string;
  description: string;
  href: string;
  icon: MarketingIconKey;
  badge?: string;
}

export type BadgeTone = "green" | "blue" | "amber" | "red" | "slate" | "violet";

export interface StatItem {
  label: string;
  value: string;
  detail: string;
  tone?: "red" | "green" | "blue" | "amber" | "slate" | "violet";
}
