import type { OverviewSectionId } from "../types/databaseOverview.types";
import { AvailableDataSummarySection } from "./sections/AvailableDataSummarySection";
import { DataSecurityBackupSection } from "./sections/DataSecurityBackupSection";
import { InitialDataQualitySection } from "./sections/InitialDataQualitySection";
import { MainDataReadinessSection } from "./sections/MainDataReadinessSection";
import { OrderSalesComparisonSection } from "./sections/OrderSalesComparisonSection";
import { ProductNameReviewSection } from "./sections/ProductNameReviewSection";

export function OverviewContent({ activeId }: { activeId: OverviewSectionId }) {
  switch (activeId) {
    case "order-sales-comparison":
      return <OrderSalesComparisonSection />;
    case "main-data-readiness":
      return <MainDataReadinessSection />;
    case "product-name-review":
      return <ProductNameReviewSection />;
    case "initial-data-quality":
      return <InitialDataQualitySection />;
    case "data-security-backup":
      return <DataSecurityBackupSection />;
    case "available-data-summary":
    default:
      return <AvailableDataSummarySection />;
  }
}
