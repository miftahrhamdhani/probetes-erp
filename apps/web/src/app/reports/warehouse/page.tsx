import { ModuleDetailShell } from "@/components/module-center/ModuleDetailShell";
import { ModuleDetailHeader } from "@/components/module-center/ModuleDetailHeader";
import { DummyDataBanner } from "@/components/module-center/DummyDataBanner";
import { DataPanel } from "@/components/module-center/DataPanel";
import { PreviewDataTable, type PreviewColumn } from "@/components/module-center/PreviewDataTable";
import { StatusPill, type StatusPillTone } from "@/components/module-center/StatusPill";
import { getReportsPreviewData, type ReportStatus, type WarehouseReportRow } from "@/features/reports/lib/temporaryReportsMockData";

const statusTone: Record<ReportStatus, StatusPillTone> = {
  "Siap Dilihat": "green",
  "Perlu Update": "amber",
  Draft: "slate",
  "Belum Final": "red",
};

const columns: PreviewColumn<WarehouseReportRow>[] = [
  { key: "tanggal", label: "Tanggal", render: (r) => r.tanggal },
  { key: "gudang", label: "Gudang", render: (r) => r.gudang },
  { key: "kritis", label: "Stok Kritis", align: "right", render: (r) => String(r.stokKritis) },
  { key: "mutasi", label: "Mutasi", align: "right", render: (r) => String(r.mutasi) },
  { key: "status", label: "Status", render: (r) => <StatusPill label={r.status} tone={statusTone[r.status]} /> },
];

export default function WarehouseReportPage() {
  const { warehouseReport } = getReportsPreviewData();
  return (
    <ModuleDetailShell parentHref="/reports" parentLabel="Kembali ke Reports">
      <DummyDataBanner />
      <ModuleDetailHeader eyebrow="REPORTS — WAREHOUSE" title="Laporan Warehouse" description="Stok, stok kritis, dan mutasi." />
      <DataPanel title="Laporan Warehouse" subtitle="Ringkasan stok per gudang.">
        <PreviewDataTable columns={columns} rows={warehouseReport} rowKey={(r) => `${r.tanggal}-${r.gudang}`} />
      </DataPanel>
    </ModuleDetailShell>
  );
}
