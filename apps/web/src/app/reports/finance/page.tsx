import { ModuleDetailShell } from "@/components/module-center/ModuleDetailShell";
import { ModuleDetailHeader } from "@/components/module-center/ModuleDetailHeader";
import { DummyDataBanner } from "@/components/module-center/DummyDataBanner";
import { DataPanel } from "@/components/module-center/DataPanel";
import { PreviewDataTable, type PreviewColumn } from "@/components/module-center/PreviewDataTable";
import { StatusPill, type StatusPillTone } from "@/components/module-center/StatusPill";
import { formatRupiah } from "@/components/module-center/format";
import { getReportsPreviewData, type FinanceReportRow, type ReportStatus } from "@/features/reports/lib/temporaryReportsMockData";

const statusTone: Record<ReportStatus, StatusPillTone> = {
  "Siap Dilihat": "green",
  "Perlu Update": "amber",
  Draft: "slate",
  "Belum Final": "red",
};

const columns: PreviewColumn<FinanceReportRow>[] = [
  { key: "tanggal", label: "Tanggal", render: (r) => r.tanggal },
  { key: "kategori", label: "Kategori", render: (r) => r.kategori },
  { key: "nominal", label: "Nominal", align: "right", render: (r) => (r.nominal ? formatRupiah(r.nominal) : "-") },
  { key: "keterangan", label: "Keterangan", render: (r) => r.keterangan },
  { key: "status", label: "Status", render: (r) => <StatusPill label={r.status} tone={statusTone[r.status]} /> },
];

export default function FinanceReportPage() {
  const { financeReport } = getReportsPreviewData();
  return (
    <ModuleDetailShell parentHref="/reports" parentLabel="Kembali ke Reports">
      <DummyDataBanner />
      <ModuleDetailHeader eyebrow="REPORTS — FINANCE" title="Laporan Finance" description="Pemasukan, pengeluaran, dan margin." />
      <DataPanel title="Laporan Finance" subtitle="Ringkasan keuangan lintas kategori.">
        <PreviewDataTable columns={columns} rows={financeReport} rowKey={(r) => `${r.tanggal}-${r.kategori}`} />
      </DataPanel>
    </ModuleDetailShell>
  );
}
