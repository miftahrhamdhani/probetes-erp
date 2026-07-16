import { ModuleDetailShell } from "@/components/module-center/ModuleDetailShell";
import { ModuleDetailHeader } from "@/components/module-center/ModuleDetailHeader";
import { DummyDataBanner } from "@/components/module-center/DummyDataBanner";
import { DataPanel } from "@/components/module-center/DataPanel";
import { PreviewDataTable, type PreviewColumn } from "@/components/module-center/PreviewDataTable";
import { StatusPill, type StatusPillTone } from "@/components/module-center/StatusPill";
import { getReportsPreviewData, type CrmReportRow, type ReportStatus } from "@/features/reports/lib/temporaryReportsMockData";

const statusTone: Record<ReportStatus, StatusPillTone> = {
  "Siap Dilihat": "green",
  "Perlu Update": "amber",
  Draft: "slate",
  "Belum Final": "red",
};

const columns: PreviewColumn<CrmReportRow>[] = [
  { key: "tanggal", label: "Tanggal", render: (r) => r.tanggal },
  { key: "segmen", label: "Segmen", render: (r) => r.segmen },
  { key: "jumlah", label: "Jumlah Customer", align: "right", render: (r) => r.jumlahCustomer.toLocaleString("id-ID") },
  { key: "repeat", label: "Repeat Rate", align: "right", render: (r) => r.repeatRate },
  { key: "status", label: "Status", render: (r) => <StatusPill label={r.status} tone={statusTone[r.status]} /> },
];

export default function CrmCohortReportPage() {
  const { crmReport } = getReportsPreviewData();
  return (
    <ModuleDetailShell parentHref="/reports" parentLabel="Kembali ke Reports">
      <DummyDataBanner />
      <ModuleDetailHeader eyebrow="REPORTS — CRM & COHORT" title="Laporan CRM" description="Repeat, retention, cohort, dan segment." />
      <DataPanel title="Laporan CRM & Cohort" subtitle="Segmentasi pelanggan dan repeat rate.">
        <PreviewDataTable columns={columns} rows={crmReport} rowKey={(r) => `${r.tanggal}-${r.segmen}`} />
      </DataPanel>
    </ModuleDetailShell>
  );
}
