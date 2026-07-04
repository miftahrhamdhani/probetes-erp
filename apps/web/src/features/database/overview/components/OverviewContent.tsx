import type { OverviewSectionId } from "../types/databaseOverview.types";
import { AuditActivitySection } from "./sections/AuditActivitySection";
import { DataQualitySection } from "./sections/DataQualitySection";
import { ImportBatchesSection } from "./sections/ImportBatchesSection";
import { MappingProgressSection } from "./sections/MappingProgressSection";
import { PipelineStatusSection } from "./sections/PipelineStatusSection";
import { ProblemQueueSection } from "./sections/ProblemQueueSection";
import { PublishReadinessSection } from "./sections/PublishReadinessSection";
import { SourceCoverageSection } from "./sections/SourceCoverageSection";
import { SummaryKpiSection } from "./sections/SummaryKpiSection";
import { ValidationIssuesSection } from "./sections/ValidationIssuesSection";

export function OverviewContent({ activeId }: { activeId: OverviewSectionId }) {
  switch (activeId) {
    case "source-coverage":
      return <SourceCoverageSection />;
    case "pipeline-status":
      return <PipelineStatusSection />;
    case "data-quality":
      return <DataQualitySection />;
    case "validation-issues":
      return <ValidationIssuesSection />;
    case "mapping-progress":
      return <MappingProgressSection />;
    case "import-batches":
      return <ImportBatchesSection />;
    case "problem-queue":
      return <ProblemQueueSection />;
    case "publish-readiness":
      return <PublishReadinessSection />;
    case "audit-activity":
      return <AuditActivitySection />;
    case "summary-kpi":
    default:
      return <SummaryKpiSection />;
  }
}
