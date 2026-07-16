"use client";

import { useState } from "react";
import { ModuleDetailShell } from "@/components/module-center/ModuleDetailShell";
import { ModuleDetailHeader } from "@/components/module-center/ModuleDetailHeader";
import { DummyDataBanner } from "@/components/module-center/DummyDataBanner";
import { DataPanel } from "@/components/module-center/DataPanel";
import { PreviewDataTable, type PreviewColumn } from "@/components/module-center/PreviewDataTable";
import { StatusPill, type StatusPillTone } from "@/components/module-center/StatusPill";
import { formatRupiah } from "@/components/module-center/format";
import { ModuleActionToolbar } from "@/components/module-center/ModuleActionToolbar";
import { ModulePreviewNote } from "@/components/module-center/ModulePreviewNote";
import { ModuleImportModal } from "@/components/module-center/ModuleImportModal";
import { ModuleManualFormModal, type ManualFormField } from "@/components/module-center/ModuleManualFormModal";
import { getFinancePreviewData, type FinanceStatus, type PemasukanRow } from "@/features/finance/lib/temporaryFinanceMockData";

const statusTone: Record<FinanceStatus, StatusPillTone> = {
  Valid: "green",
  "Perlu Dicek": "amber",
  Selisih: "red",
  Draft: "slate",
};

const columns: PreviewColumn<PemasukanRow>[] = [
  { key: "tanggal", label: "Tanggal", render: (r) => r.tanggal },
  { key: "sumber", label: "Sumber", render: (r) => r.sumber },
  { key: "kategori", label: "Kategori", render: (r) => r.kategori },
  { key: "nominal", label: "Nominal", align: "right", render: (r) => formatRupiah(r.nominal) },
  { key: "status", label: "Status", render: (r) => <StatusPill label={r.status} tone={statusTone[r.status]} /> },
];

const manualFields: ManualFormField[] = [
  { key: "tanggal", label: "Tanggal", type: "date" },
  { key: "sumber", label: "Sumber", type: "text" },
  { key: "kategori", label: "Kategori", type: "select", options: ["Settlement Marketplace", "Pencairan COD", "Transfer Non-COD", "Lainnya"] },
  { key: "nominal", label: "Nominal (Rp)", type: "number" },
];

export default function PemasukanPage() {
  const { pemasukan: initialRows } = getFinancePreviewData();
  const [rows, setRows] = useState(initialRows);
  const [showImport, setShowImport] = useState(false);
  const [showManual, setShowManual] = useState(false);

  return (
    <ModuleDetailShell parentHref="/finance" parentLabel="Kembali ke Finance">
      <DummyDataBanner />
      <ModuleDetailHeader eyebrow="FINANCE — PEMASUKAN" title="Pemasukan" description="Uang masuk dari settlement, transfer, dan COD cair." />

      <DataPanel title="Pemasukan" subtitle="Rincian uang masuk per sumber.">
        <div className="mb-4 flex flex-col gap-2">
          <ModuleActionToolbar
            importLabel="Import Pemasukan"
            onImport={() => setShowImport(true)}
            addManualLabel="Tambah Pemasukan"
            onAddManual={() => setShowManual(true)}
          />
          <ModulePreviewNote />
        </div>
        <PreviewDataTable columns={columns} rows={rows} rowKey={(r) => `${r.tanggal}-${r.sumber}`} />
      </DataPanel>

      {showImport && (
        <ModuleImportModal
          title="Import Pemasukan"
          sourceOptions={["Settlement Shopee", "Settlement TikTok Shop", "Transfer Bank", "Pencairan COD Ekspedisi"]}
          expectedColumns={["Tanggal", "Sumber", "Kategori", "Nominal"]}
          onClose={() => setShowImport(false)}
          onConfirm={() => {
            setRows((current) => [
              { tanggal: new Date().toISOString().slice(0, 10), sumber: "Import Preview", kategori: "Settlement Marketplace", nominal: 0, status: "Draft" },
              ...current,
            ]);
            setShowImport(false);
          }}
        />
      )}

      {showManual && (
        <ModuleManualFormModal
          title="Tambah Pemasukan"
          fields={manualFields}
          onClose={() => setShowManual(false)}
          onSubmit={(values) => {
            setRows((current) => [
              {
                tanggal: values.tanggal || new Date().toISOString().slice(0, 10),
                sumber: values.sumber || "-",
                kategori: values.kategori || "Lainnya",
                nominal: Number(values.nominal) || 0,
                status: "Draft",
              },
              ...current,
            ]);
            setShowManual(false);
          }}
        />
      )}
    </ModuleDetailShell>
  );
}
