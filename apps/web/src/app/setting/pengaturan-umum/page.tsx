"use client";

import { ModuleDetailShell } from "@/components/module-center/ModuleDetailShell";
import { ModulePreviewActions } from "@/components/module-center/ModulePreviewActions";
import { ModuleDetailHeader } from "@/components/module-center/ModuleDetailHeader";
import { DummyDataBanner } from "@/components/module-center/DummyDataBanner";
import { DataPanel } from "@/components/module-center/DataPanel";
import { PreviewDataTable, type PreviewColumn } from "@/components/module-center/PreviewDataTable";
import { StatusPill, type StatusPillTone } from "@/components/module-center/StatusPill";
import { getSettingPreviewData, type GeneralSettingRow, type SettingStatus } from "@/features/setting/lib/temporarySettingMockData";

const statusTone: Record<SettingStatus, StatusPillTone> = {
  Aktif: "green",
  "Belum Diatur": "amber",
  "Perlu Dicek": "amber",
  Siap: "blue",
};

const columns: PreviewColumn<GeneralSettingRow>[] = [
  { key: "nama", label: "Nama Setting", render: (r) => r.namaSetting },
  { key: "nilai", label: "Nilai", render: (r) => r.nilai },
  { key: "modul", label: "Modul", render: (r) => r.modul },
  { key: "status", label: "Status", render: (r) => <StatusPill label={r.status} tone={statusTone[r.status]} /> },
];

export default function PengaturanUmumPage() {
  const { generalSettings } = getSettingPreviewData();
  return (
    <ModuleDetailShell parentHref="/setting" parentLabel="Kembali ke Setting">
      <DummyDataBanner />
      <ModuleDetailHeader eyebrow="SETTING — PENGATURAN UMUM" title="Pengaturan Umum" description="Nama setting, nilai, modul, status." />
      <DataPanel title="Pengaturan Umum" subtitle="Konfigurasi umum aplikasi.">
        <ModulePreviewActions initialRows={generalSettings} addManualLabel="Edit Setting Preview" manualTitle="Edit Setting Preview" manualFields={[{ key: "namaSetting", label: "Nama Setting" }, { key: "nilai", label: "Nilai" }, { key: "modul", label: "Modul" }]} createManualRow={(v) => ({ namaSetting: v.namaSetting || "Setting Baru", nilai: v.nilai || "-", modul: v.modul || "Pengaturan Aplikasi", status: "Belum Diatur" as const })}>{(rows) => <PreviewDataTable columns={columns} rows={rows} rowKey={(r) => r.namaSetting} />}</ModulePreviewActions>
      </DataPanel>
    </ModuleDetailShell>
  );
}
