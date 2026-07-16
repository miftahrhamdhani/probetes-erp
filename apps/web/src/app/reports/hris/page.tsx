import { ModuleDetailShell } from "@/components/module-center/ModuleDetailShell";
import { ModuleDetailHeader } from "@/components/module-center/ModuleDetailHeader";
import { DummyDataBanner } from "@/components/module-center/DummyDataBanner";
import { DataPanel } from "@/components/module-center/DataPanel";
import { PreviewDataTable, type PreviewColumn } from "@/components/module-center/PreviewDataTable";
import { StatusPill, type StatusPillTone } from "@/components/module-center/StatusPill";
import { getReportsPreviewData, type HrisReportRow, type ReportStatus } from "@/features/reports/lib/temporaryReportsMockData";

const statusTone: Record<ReportStatus, StatusPillTone> = {
  "Siap Dilihat": "green",
  "Perlu Update": "amber",
  Draft: "slate",
  "Belum Final": "red",
};

const columns: PreviewColumn<HrisReportRow>[] = [
  { key: "tanggal", label: "Tanggal", render: (r) => r.tanggal },
  { key: "area", label: "Area", render: (r) => r.area },
  { key: "nilai", label: "Nilai", render: (r) => r.nilai },
  { key: "keterangan", label: "Keterangan", render: (r) => r.keterangan },
  { key: "status", label: "Status", render: (r) => <StatusPill label={r.status} tone={statusTone[r.status]} /> },
];

export default function HrisReportPage() {
  const { hrisReport } = getReportsPreviewData();
  return (
    <ModuleDetailShell parentHref="/reports" parentLabel="Kembali ke Reports">
      <DummyDataBanner />
      <ModuleDetailHeader eyebrow="REPORTS — HRIS" title="Laporan HRIS" description="Absensi, payroll, dan biaya HR." />
      <DataPanel title="Laporan HRIS" subtitle="Ringkasan kehadiran dan biaya HR.">
        <PreviewDataTable columns={columns} rows={hrisReport} rowKey={(r) => `${r.tanggal}-${r.area}`} />
      </DataPanel>
    </ModuleDetailShell>
  );
}
