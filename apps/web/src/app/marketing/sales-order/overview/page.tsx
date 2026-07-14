import { Suspense } from "react";
import { SalesOverviewPage } from "@/features/marketing/sales-order/SalesOverviewPage";

export default function SalesOverviewRoute() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#eef2f6]/90" />}>
      <SalesOverviewPage />
    </Suspense>
  );
}
