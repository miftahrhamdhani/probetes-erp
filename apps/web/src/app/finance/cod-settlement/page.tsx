"use client";

import { ModuleDetailShell } from "@/components/module-center/ModuleDetailShell";
import { ModulePreviewActions } from "@/components/module-center/ModulePreviewActions";
import { ModuleDetailHeader } from "@/components/module-center/ModuleDetailHeader";
import { DummyDataBanner } from "@/components/module-center/DummyDataBanner";
import { DataPanel } from "@/components/module-center/DataPanel";
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
  { key: "fee", label: "Fee", align: "right", render: (r) => formatRupiah(r.fee) },
  { key: "cair", label: "Tanggal Cair", render: (r) => r.tanggalCair ?? "-" },
  { key: "status", label: "Status", render: (r) => <StatusPill label={r.status} tone={statusTone[r.status]} /> },
];

export default function CodSettlementPage() {
  const { codSettlement } = getFinancePreviewData();
  return (
    <ModuleDetailShell parentHref="/finance" parentLabel="Kembali ke Finance">
      <DummyDataBanner />
      <ModuleDetailHeader eyebrow="FINANCE — COD/SETTLEMENT" title="COD / Settlement" description="Order, ekspedisi, nominal COD, fee, tanggal cair, status." />
      <DataPanel title="COD / Settlement" subtitle="Status pencairan COD per order.">
        <ModulePreviewActions initialRows={codSettlement} importLabel="Import COD / Settlement" addManualLabel="Tambah Settlement Manual" importTitle="Import COD / Settlement" importColumns={["Tanggal", "Order", "Ekspedisi", "Nominal COD", "Fee", "Tanggal Cair"]} manualTitle="Tambah Settlement Manual" manualFields={[{ key: "order", label: "Order" }, { key: "ekspedisi", label: "Ekspedisi" }, { key: "nominalCod", label: "Nominal COD", type: "number" }, { key: "fee", label: "Fee", type: "number" }]} createImportedRow={() => ({ tanggal: new Date().toISOString().slice(0, 10), order: "ORD-PREVIEW", ekspedisi: "Ekspedisi Preview", nominalCod: 0, fee: 0, tanggalCair: null, status: "Draft" as const })} createManualRow={(v) => ({ tanggal: new Date().toISOString().slice(0, 10), order: v.order || "ORD-PREVIEW", ekspedisi: v.ekspedisi || "Ekspedisi Preview", nominalCod: Number(v.nominalCod) || 0, fee: Number(v.fee) || 0, tanggalCair: null, status: "Perlu Dicek" as const })}>{(rows) => <PreviewDataTable columns={columns} rows={rows} rowKey={(r) => `${r.tanggal}-${r.order}`} />}</ModulePreviewActions>
      </DataPanel>
    </ModuleDetailShell>
  );
}
