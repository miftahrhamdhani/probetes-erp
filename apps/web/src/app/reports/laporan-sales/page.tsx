import { ModuleDetailShell } from "@/components/module-center/ModuleDetailShell";
import { ModuleDetailHeader } from "@/components/module-center/ModuleDetailHeader";
import { DummyDataBanner } from "@/components/module-center/DummyDataBanner";
import { DataPanel } from "@/components/module-center/DataPanel";
import { PreviewDataTable, type PreviewColumn } from "@/components/module-center/PreviewDataTable";
import { StatusPill, type StatusPillTone } from "@/components/module-center/StatusPill";
import { formatRupiah } from "@/components/module-center/format";
import { getReportsPreviewData, type ReportStatus, type SalesReportRow } from "@/features/reports/lib/temporaryReportsMockData";

const statusTone: Record<ReportStatus, StatusPillTone> = {
  "Siap Dilihat": "green",
  "Perlu Update": "amber",
  Draft: "slate",
  "Belum Final": "red",
};

const columns: PreviewColumn<SalesReportRow>[] = [
  { key: "tanggal", label: "Tanggal", render: (r) => r.tanggal },
  { key: "produk", label: "Produk / Channel", render: (r) => r.produkChannel },
  { key: "sales", label: "Total Sales", align: "right", render: (r) => formatRupiah(r.totalSales) },
  { key: "order", label: "Total Order", align: "right", render: (r) => String(r.totalOrder) },
  { key: "aov", label: "AOV", align: "right", render: (r) => formatRupiah(r.aov) },
  { key: "status", label: "Status", render: (r) => <StatusPill label={r.status} tone={statusTone[r.status]} /> },
];

export default function LaporanSalesPage() {
  const { salesReport } = getReportsPreviewData();
  return (
    <ModuleDetailShell parentHref="/reports" parentLabel="Kembali ke Reports">
      <DummyDataBanner />
      <ModuleDetailHeader eyebrow="REPORTS — LAPORAN SALES" title="Laporan Penjualan" description="Sales, order, AOV, dan produk/channel." />
      <DataPanel title="Laporan Penjualan" subtitle="Rincian sales per produk/channel.">
        <PreviewDataTable columns={columns} rows={salesReport} rowKey={(r) => `${r.tanggal}-${r.produkChannel}`} />
      </DataPanel>
    </ModuleDetailShell>
  );
}
