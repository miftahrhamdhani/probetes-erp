"use client";

import { ModuleDetailShell } from "@/components/module-center/ModuleDetailShell";
import { ModulePreviewActions } from "@/components/module-center/ModulePreviewActions";
import { ModuleDetailHeader } from "@/components/module-center/ModuleDetailHeader";
import { DummyDataBanner } from "@/components/module-center/DummyDataBanner";
import { DataPanel } from "@/components/module-center/DataPanel";
import { PreviewDataTable, type PreviewColumn } from "@/components/module-center/PreviewDataTable";
import { StatusPill, type StatusPillTone } from "@/components/module-center/StatusPill";
import { formatRupiah } from "@/components/module-center/format";
import { getFinancePreviewData, type FinanceStatus, type PengeluaranRow } from "@/features/finance/lib/temporaryFinanceMockData";

const statusTone: Record<FinanceStatus, StatusPillTone> = {
  Valid: "green",
  "Perlu Dicek": "amber",
  Selisih: "red",
  Draft: "slate",
};

const columns: PreviewColumn<PengeluaranRow>[] = [
  { key: "tanggal", label: "Tanggal", render: (r) => r.tanggal },
  { key: "kategori", label: "Kategori Biaya", render: (r) => r.kategoriBiaya },
  { key: "nominal", label: "Nominal", align: "right", render: (r) => formatRupiah(r.nominal) },
  { key: "divisi", label: "Divisi", render: (r) => r.divisi },
  { key: "status", label: "Status", render: (r) => <StatusPill label={r.status} tone={statusTone[r.status]} /> },
];

export default function PengeluaranPage() {
  const { pengeluaran } = getFinancePreviewData();
  return (
    <ModuleDetailShell parentHref="/finance" parentLabel="Kembali ke Finance">
      <DummyDataBanner />
      <ModuleDetailHeader eyebrow="FINANCE — PENGELUARAN" title="Pengeluaran" description="Biaya operasional, iklan, dan logistik." />
      <DataPanel title="Pengeluaran" subtitle="Rincian biaya per kategori & divisi.">
        <ModulePreviewActions initialRows={pengeluaran} importLabel="Import Pengeluaran" addManualLabel="Tambah Pengeluaran" importTitle="Import Pengeluaran" importColumns={["Tanggal", "Kategori Biaya", "Divisi", "Nominal", "Metode"]} manualTitle="Tambah Pengeluaran" manualFields={[{ key: "kategoriBiaya", label: "Kategori Biaya" }, { key: "divisi", label: "Divisi" }, { key: "nominal", label: "Nominal", type: "number" }]} createImportedRow={() => ({ tanggal: new Date().toISOString().slice(0, 10), kategoriBiaya: "Biaya Preview", nominal: 0, divisi: "Finance", status: "Draft" as const })} createManualRow={(v) => ({ tanggal: new Date().toISOString().slice(0, 10), kategoriBiaya: v.kategoriBiaya || "Biaya Preview", nominal: Number(v.nominal) || 0, divisi: v.divisi || "Finance", status: "Draft" as const })}>{(rows) => <PreviewDataTable columns={columns} rows={rows} rowKey={(r) => `${r.tanggal}-${r.kategoriBiaya}`} />}</ModulePreviewActions>
      </DataPanel>
    </ModuleDetailShell>
  );
}
