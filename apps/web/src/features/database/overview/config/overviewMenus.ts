import type { OverviewMenu } from "../types/databaseOverview.types";

export const overviewMenus = [
  { id: "summary-kpi", title: "Summary KPI", badge: "Aktif", icon: "bar-chart" },
  { id: "source-coverage", title: "Source Coverage", icon: "database" },
  { id: "pipeline-status", title: "Pipeline Status", icon: "workflow" },
  { id: "data-quality", title: "Data Quality", icon: "shield" },
  { id: "validation-issues", title: "Validation Issues", badge: "1,284", icon: "alert" },
  { id: "mapping-progress", title: "Mapping Progress", badge: "78%", icon: "merge" },
  { id: "import-batches", title: "Import Batches", badge: "5", icon: "download" },
  { id: "problem-queue", title: "Problem Queue", badge: "42", icon: "list-checks" },
  { id: "publish-readiness", title: "Publish Readiness", badge: "5", icon: "check-circle" },
  { id: "audit-activity", title: "Audit Activity", icon: "clipboard" },
] satisfies OverviewMenu[];
