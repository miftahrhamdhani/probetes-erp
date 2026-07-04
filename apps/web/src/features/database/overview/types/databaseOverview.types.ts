export type OverviewSectionId =
  | "available-data-summary"
  | "order-sales-comparison"
  | "main-data-readiness"
  | "product-name-review"
  | "initial-data-quality"
  | "data-security-backup";

export type OverviewIconKey =
  | "bar-chart"
  | "shopping-cart"
  | "database"
  | "tag"
  | "shield"
  | "lock";

export interface OverviewMenu {
  id: OverviewSectionId;
  title: string;
  badge?: string;
  icon: OverviewIconKey;
}

export interface KpiItem {
  label: string;
  value: string;
  detail: string;
  tone?: "red" | "green" | "blue" | "amber" | "slate";
}

export interface ChartPoint {
  label: string;
  value: number;
}

export interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

export interface TableRow {
  [key: string]: string | number;
}

export type StatusTone = "green" | "blue" | "amber" | "red" | "slate" | "purple";

export interface StatusItem {
  label: string;
  tone: StatusTone;
}
