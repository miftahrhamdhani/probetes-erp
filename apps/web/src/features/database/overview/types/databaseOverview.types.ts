export type OverviewSectionId =
  | "summary-kpi"
  | "source-coverage"
  | "pipeline-status"
  | "data-quality"
  | "validation-issues"
  | "mapping-progress"
  | "import-batches"
  | "problem-queue"
  | "publish-readiness"
  | "audit-activity";

export type OverviewIconKey =
  | "bar-chart"
  | "database"
  | "workflow"
  | "shield"
  | "alert"
  | "merge"
  | "download"
  | "list-checks"
  | "check-circle"
  | "clipboard";

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
