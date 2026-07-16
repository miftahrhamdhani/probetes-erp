"use client";

import { ModuleDetailShell } from "@/components/module-center/ModuleDetailShell";
import { ModulePreviewActions } from "@/components/module-center/ModulePreviewActions"
import { ModuleDetailHeader } from "@/components/module-center/ModuleDetailHeader";
import { DummyDataBanner } from "@/components/module-center/DummyDataBanner";
import { DataPanel } from "@/components/module-center/DataPanel";
import { PreviewDataTable, type PreviewColumn } from "@/components/module-center/PreviewDataTable";
import { StatusPill, type StatusPillTone } from "@/components/module-center/StatusPill";
import { getSettingPreviewData, type ImportTemplateRow, type SettingStatus } from "@/features/setting/lib/temporarySettingMockData";

const statusTone: Record<SettingStatus, StatusPillTone> = {
  Aktif: "green",
  "Belum Diatur": "amber",
  "Perlu Dicek": "amber",
  Siap: "blue",
};

const columns: PreviewColumn<ImportTemplateRow>[] = [
  { key: "nama", label: "Nama Template", render: (r) => r.namaTemplate },
  { key: "modul", label: "Modul", render: (r) => r.modul },
  { key: "format", label: "Format File", render: (r) => r.formatFile },
  { key: "kolom", label: "Kolom Wajib", render: (r) => r.kolomWajib },
  { key: "status", label: "Status", render: (r) => <StatusPill label={r.status} tone={statusTone[r.status]} /> },
];

export default function TemplateImportPage() {
  const { importTemplates } = getSettingPreviewData();
  return (
    <ModuleDetailShell parentHref="/setting" parentLabel="Kembali ke Setting">
      <DummyDataBanner />
      <ModuleDetailHeader eyebrow="SETTING — TEMPLATE IMPORT" title="Template Import" description="Nama template, modul, format file, kolom wajib, status." />
      <DataPanel title="Template Import" subtitle="Template untuk upload data ke ERP.">
        <ModulePreviewActions initialRows={importTemplates} addManualLabel="Tambah Template Preview" manualTitle="Tambah Template Preview" manualFields={[{ key: "namaTemplate", label: "Nama Template" }, { key: "modul", label: "Modul" }, { key: "kolomWajib", label: "Kolom Wajib" }]} createManualRow={(v) => ({ namaTemplate: v.namaTemplate || "Template Baru", modul: v.modul || "Finance", formatFile: "CSV" as const, kolomWajib: v.kolomWajib || "Tanggal, Nilai", status: "Belum Diatur" as const })}>{(rows) => <PreviewDataTable columns={columns} rows={rows} rowKey={(r) => r.namaTemplate} />}</ModulePreviewActions>
      </DataPanel>
    </ModuleDetailShell>
  );
}
