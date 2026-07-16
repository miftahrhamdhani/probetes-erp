"use client";

import { ModuleDetailShell } from "@/components/module-center/ModuleDetailShell";
import { ModulePreviewActions } from "@/components/module-center/ModulePreviewActions";
import { ModuleDetailHeader } from "@/components/module-center/ModuleDetailHeader";
import { DummyDataBanner } from "@/components/module-center/DummyDataBanner";
import { DataPanel } from "@/components/module-center/DataPanel";
import { PreviewDataTable, type PreviewColumn } from "@/components/module-center/PreviewDataTable";
import { StatusPill, type StatusPillTone } from "@/components/module-center/StatusPill";
import { formatRupiah } from "@/components/module-center/format";
import { getFinancePreviewData, type FinanceStatus, type RekonsiliasiRow } from "@/features/finance/lib/temporaryFinanceMockData";

const statusTone: Record<FinanceStatus, StatusPillTone> = {
  Valid: "green",
  "Perlu Dicek": "amber",
  Selisih: "red",
  Draft: "slate",
};

const columns: PreviewColumn<RekonsiliasiRow>[] = [
  { key: "tanggal", label: "Tanggal", render: (r) => r.tanggal },
  { key: "order", label: "Settlement / Order", render: (r) => r.order },
  { key: "sistem", label: "Nominal Sistem", align: "right", render: (r) => formatRupiah(r.nominalSistem) },
  { key: "cair", label: "Nominal Cair", align: "right", render: (r) => formatRupiah(r.nominalCair) },
  { key: "selisih", label: "Selisih", align: "right", render: (r) => formatRupiah(r.selisih) },
  { key: "status", label: "Status", render: (r) => <StatusPill label={r.status} tone={statusTone[r.status]} /> },
];

export default function RekonsiliasiPage() {
  const { rekonsiliasi } = getFinancePreviewData();
  return (
    <ModuleDetailShell parentHref="/finance" parentLabel="Kembali ke Finance">
      <DummyDataBanner />
      <ModuleDetailHeader eyebrow="FINANCE — REKONSILIASI" title="Rekonsiliasi & Settlement" description="Cocokkan payout marketplace/ekspedisi dengan order." />
      <DataPanel title="Rekonsiliasi & Settlement" subtitle="Nominal sistem vs nominal cair.">
        <ModulePreviewActions initialRows={rekonsiliasi} importLabel="Import Settlement" addManualLabel="Tambah Rekonsiliasi Manual" importTitle="Import Settlement" importColumns={["Tanggal", "Settlement ID", "Order ID", "Nominal Sistem", "Nominal Cair", "Selisih"]} manualTitle="Tambah Rekonsiliasi Manual" manualFields={[{ key: "order", label: "Settlement / Order" }, { key: "nominalSistem", label: "Nominal Sistem", type: "number" }, { key: "nominalCair", label: "Nominal Cair", type: "number" }]} createImportedRow={() => ({ tanggal: new Date().toISOString().slice(0, 10), order: "Settlement Preview", nominalSistem: 0, nominalCair: 0, selisih: 0, status: "Draft" as const })} createManualRow={(v) => { const sistem = Number(v.nominalSistem) || 0; const cair = Number(v.nominalCair) || 0; return { tanggal: new Date().toISOString().slice(0, 10), order: v.order || "Settlement Preview", nominalSistem: sistem, nominalCair: cair, selisih: cair - sistem, status: cair === sistem ? "Valid" as const : "Selisih" as const }; }}>{(rows) => <PreviewDataTable columns={columns} rows={rows} rowKey={(r) => `${r.tanggal}-${r.order}`} />}</ModulePreviewActions>
      </DataPanel>
    </ModuleDetailShell>
  );
}
