import { ModuleDetailShell } from "@/components/module-center/ModuleDetailShell";
import { ModuleDetailHeader } from "@/components/module-center/ModuleDetailHeader";
import { DummyDataBanner } from "@/components/module-center/DummyDataBanner";
import { DataPanel } from "@/components/module-center/DataPanel";
import { PreviewKpiCard } from "@/components/module-center/PreviewKpiCard";
import { PreviewDataTable, type PreviewColumn } from "@/components/module-center/PreviewDataTable";
import { StatusPill, type StatusPillTone } from "@/components/module-center/StatusPill";
import { formatRupiah } from "@/components/module-center/format";
import { getFinancePreviewData, type CodSettlementRow, type FinanceStatus } from "@/features/finance/lib/temporaryFinanceMockData";

const statusTone: Record<FinanceStatus, StatusPillTone> = {
  Valid: "green",
  "Perlu Dicek": "amber",
  Selisih: "red",
  Draft: "slate",
};

const columns: PreviewColumn<CodSettlementRow>[] = [
  { key: "tanggal", label: "Tanggal", render: (r) => r.tanggal },
  { key: "order", label: "Order", render: (r) => r.order },
  { key: "ekspedisi", label: "Ekspedisi", render: (r) => r.ekspedisi },
  { key: "nominal", label: "Nominal COD", align: "right", render: (r) => formatRupiah(r.nominalCod) },
  { key: "cair", label: "Tanggal Cair", render: (r) => r.tanggalCair ?? "-" },
  { key: "status", label: "Status", render: (r) => <StatusPill label={r.status} tone={statusTone[r.status]} /> },
];

export default function FinanceDashboardPage() {
  const { kpi, codSettlement } = getFinancePreviewData();
  return (
    <ModuleDetailShell parentHref="/finance" parentLabel="Kembali ke Finance">
      <DummyDataBanner />
      <ModuleDetailHeader eyebrow="FINANCE — RINGKASAN" title="Ringkasan Finance" description="KPI pemasukan, pengeluaran, margin, dan COD belum cair." />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {kpi.map((item) => <PreviewKpiCard key={item.label} item={item} />)}
      </div>
      <DataPanel title="Snapshot COD & Settlement" subtitle="Data COD terbaru yang perlu dipantau.">
        <PreviewDataTable columns={columns} rows={codSettlement} rowKey={(r) => `${r.tanggal}-${r.order}`} />
      </DataPanel>
    </ModuleDetailShell>
  );
}
