import { ModuleDetailShell } from "@/components/module-center/ModuleDetailShell";
import { ModuleDetailHeader } from "@/components/module-center/ModuleDetailHeader";
import { DummyDataBanner } from "@/components/module-center/DummyDataBanner";
import { DataPanel } from "@/components/module-center/DataPanel";
import { PreviewDataTable, type PreviewColumn } from "@/components/module-center/PreviewDataTable";
import { StatusPill, type StatusPillTone } from "@/components/module-center/StatusPill";
import { formatRupiah } from "@/components/module-center/format";
import { getReportsPreviewData, type MarketingReportRow, type ReportStatus } from "@/features/reports/lib/temporaryReportsMockData";

const statusTone: Record<ReportStatus, StatusPillTone> = {
  "Siap Dilihat": "green",
  "Perlu Update": "amber",
  Draft: "slate",
  "Belum Final": "red",
};

const columns: PreviewColumn<MarketingReportRow>[] = [
  { key: "tanggal", label: "Tanggal", render: (r) => r.tanggal },
  { key: "channel", label: "Channel / Campaign", render: (r) => r.channelCampaign },
  { key: "spending", label: "Spending", align: "right", render: (r) => formatRupiah(r.spending) },
  { key: "sales", label: "Sales", align: "right", render: (r) => formatRupiah(r.sales) },
  { key: "roas", label: "ROAS", align: "right", render: (r) => `${r.roas.toFixed(1)}x` },
  { key: "status", label: "Status", render: (r) => <StatusPill label={r.status} tone={statusTone[r.status]} /> },
];

export default function MarketingRoasReportPage() {
  const { marketingReport } = getReportsPreviewData();
  return (
    <ModuleDetailShell parentHref="/reports" parentLabel="Kembali ke Reports">
      <DummyDataBanner />
      <ModuleDetailHeader eyebrow="REPORTS — MARKETING/ROAS" title="Laporan Marketing" description="Spending, sales, ROAS, dan campaign/channel." />
      <DataPanel title="Laporan Marketing/ROAS" subtitle="Performa channel & campaign iklan.">
        <PreviewDataTable columns={columns} rows={marketingReport} rowKey={(r) => `${r.tanggal}-${r.channelCampaign}`} />
      </DataPanel>
    </ModuleDetailShell>
  );
}
