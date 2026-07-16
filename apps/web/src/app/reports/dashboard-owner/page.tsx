import { ModuleDetailShell } from "@/components/module-center/ModuleDetailShell";
import { ModuleDetailHeader } from "@/components/module-center/ModuleDetailHeader";
import { DummyDataBanner } from "@/components/module-center/DummyDataBanner";
import { DataPanel } from "@/components/module-center/DataPanel";
import { PreviewKpiCard } from "@/components/module-center/PreviewKpiCard";
import { PreviewDataTable, type PreviewColumn } from "@/components/module-center/PreviewDataTable";
import { StatusPill, type StatusPillTone } from "@/components/module-center/StatusPill";
import { getReportsPreviewData, type OwnerSummaryRow, type ReportStatus } from "@/features/reports/lib/temporaryReportsMockData";

const statusTone: Record<ReportStatus, StatusPillTone> = {
  "Siap Dilihat": "green",
  "Perlu Update": "amber",
  Draft: "slate",
  "Belum Final": "red",
};

const columns: PreviewColumn<OwnerSummaryRow>[] = [
  { key: "tanggal", label: "Tanggal", render: (r) => r.tanggal },
  { key: "area", label: "Area", render: (r) => r.area },
  { key: "ringkasan", label: "Ringkasan", render: (r) => r.ringkasan },
  { key: "nilai", label: "Nilai", render: (r) => r.nilai },
  { key: "status", label: "Status", render: (r) => <StatusPill label={r.status} tone={statusTone[r.status]} /> },
];

export default function DashboardOwnerPage() {
  const { kpi, ownerSummary } = getReportsPreviewData();
  return (
    <ModuleDetailShell parentHref="/reports" parentLabel="Kembali ke Reports">
      <DummyDataBanner />
      <ModuleDetailHeader eyebrow="REPORTS — RINGKASAN OWNER" title="Ringkasan Owner" description="KPI lintas divisi untuk pengambilan keputusan cepat." />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {kpi.map((item) => <PreviewKpiCard key={item.label} item={item} />)}
      </div>
      <DataPanel title="Ringkasan Lintas Divisi" subtitle="Sales, marketing, tracking, finance, dan HRIS.">
        <PreviewDataTable columns={columns} rows={ownerSummary} rowKey={(r) => `${r.tanggal}-${r.area}`} />
      </DataPanel>
    </ModuleDetailShell>
  );
}
