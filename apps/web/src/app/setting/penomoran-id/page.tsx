"use client";

import { ModuleDetailShell } from "@/components/module-center/ModuleDetailShell";
import { ModulePreviewActions } from "@/components/module-center/ModulePreviewActions"
import { ModuleDetailHeader } from "@/components/module-center/ModuleDetailHeader";
import { DummyDataBanner } from "@/components/module-center/DummyDataBanner";
import { DataPanel } from "@/components/module-center/DataPanel";
import { PreviewDataTable, type PreviewColumn } from "@/components/module-center/PreviewDataTable";
import { StatusPill, type StatusPillTone } from "@/components/module-center/StatusPill";
import { getSettingPreviewData, type IdSequenceRow, type SettingStatus } from "@/features/setting/lib/temporarySettingMockData";

const statusTone: Record<SettingStatus, StatusPillTone> = {
  Aktif: "green",
  "Belum Diatur": "amber",
  "Perlu Dicek": "amber",
  Siap: "blue",
};

const columns: PreviewColumn<IdSequenceRow>[] = [
  { key: "entity", label: "Entity", render: (r) => r.entity },
  { key: "prefix", label: "Prefix", render: (r) => r.prefix },
  { key: "nomor", label: "Nomor Terakhir", render: (r) => r.nomorTerakhir },
  { key: "format", label: "Format", render: (r) => r.format },
  { key: "status", label: "Status", render: (r) => <StatusPill label={r.status} tone={statusTone[r.status]} /> },
];

export default function PenomoranIdPage() {
  const { idSequences } = getSettingPreviewData();
  return (
    <ModuleDetailShell parentHref="/setting" parentLabel="Kembali ke Setting">
      <DummyDataBanner />
      <ModuleDetailHeader eyebrow="SETTING — PENOMORAN ID" title="Penomoran ID" description="Entity, prefix, nomor terakhir, format, status." />
      <DataPanel title="Penomoran ID" subtitle="Format ID otomatis per entitas.">
        <ModulePreviewActions initialRows={idSequences} addManualLabel="Tambah/Edit Format ID Preview" manualTitle="Tambah Format ID Preview" manualFields={[{ key: "entity", label: "Entity" }, { key: "prefix", label: "Prefix" }, { key: "format", label: "Format" }]} createManualRow={(v) => ({ entity: v.entity || "Entity Baru", prefix: v.prefix || "PB-", nomorTerakhir: "000000", format: v.format || "PB-000000", status: "Belum Diatur" as const })}>{(rows) => <PreviewDataTable columns={columns} rows={rows} rowKey={(r) => r.entity} />}</ModulePreviewActions>
      </DataPanel>
    </ModuleDetailShell>
  );
}
