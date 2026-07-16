import { ModuleDetailShell } from "@/components/module-center/ModuleDetailShell";
import { ModuleDetailHeader } from "@/components/module-center/ModuleDetailHeader";
import { DummyDataBanner } from "@/components/module-center/DummyDataBanner";
import { DataPanel } from "@/components/module-center/DataPanel";
import { PreviewDataTable, type PreviewColumn } from "@/components/module-center/PreviewDataTable";
import { StatusPill, type StatusPillTone } from "@/components/module-center/StatusPill";
import { getReportsPreviewData, type ReportStatus, type TrackingReportRow } from "@/features/reports/lib/temporaryReportsMockData";

const statusTone: Record<ReportStatus, StatusPillTone> = {
  "Siap Dilihat": "green",
  "Perlu Update": "amber",
  Draft: "slate",
  "Belum Final": "red",
};

const columns: PreviewColumn<TrackingReportRow>[] = [
  { key: "tanggal", label: "Tanggal", render: (r) => r.tanggal },
  { key: "area", label: "Area", render: (r) => r.area },
  { key: "jumlah", label: "Jumlah", align: "right", render: (r) => String(r.jumlah) },
  { key: "keterangan", label: "Keterangan", render: (r) => r.keterangan },
  { key: "status", label: "Status", render: (r) => <StatusPill label={r.status} tone={statusTone[r.status]} /> },
];

export default function TrackingCodReturReportPage() {
  const { trackingReport } = getReportsPreviewData();
  return (
    <ModuleDetailShell parentHref="/reports" parentLabel="Kembali ke Reports">
      <DummyDataBanner />
      <ModuleDetailHeader eyebrow="REPORTS — TRACKING/COD/RETUR" title="Laporan Tracking" description="Paket, COD, dan retur." />
      <DataPanel title="Laporan Tracking/COD/Retur" subtitle="Ringkasan status pengiriman dan retur.">
        <PreviewDataTable columns={columns} rows={trackingReport} rowKey={(r) => `${r.tanggal}-${r.area}`} />
      </DataPanel>
    </ModuleDetailShell>
  );
}
