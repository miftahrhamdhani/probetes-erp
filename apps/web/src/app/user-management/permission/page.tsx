"use client";

import { ModuleDetailShell } from "@/components/module-center/ModuleDetailShell";
import { ModulePreviewActions } from "@/components/module-center/ModulePreviewActions"
import { ModuleDetailHeader } from "@/components/module-center/ModuleDetailHeader";
import { DummyDataBanner } from "@/components/module-center/DummyDataBanner";
import { DataPanel } from "@/components/module-center/DataPanel";
import { PreviewDataTable, type PreviewColumn } from "@/components/module-center/PreviewDataTable";
import { getUserManagementPreviewData, type PermissionRow } from "@/features/user-management/lib/temporaryUserMockData";

const columns: PreviewColumn<PermissionRow>[] = [
  { key: "kode", label: "Kode Permission", render: (r) => r.kodePermission },
  { key: "modul", label: "Modul", render: (r) => r.modul },
  { key: "aksi", label: "Aksi", render: (r) => r.aksi },
  { key: "deskripsi", label: "Deskripsi", render: (r) => r.deskripsi },
];

export default function PermissionPage() {
  const { permissions } = getUserManagementPreviewData();
  return (
    <ModuleDetailShell parentHref="/user-management" parentLabel="Kembali ke User Management">
      <DummyDataBanner />
      <ModuleDetailHeader eyebrow="USER MANAGEMENT — PERMISSION" title="Permission" description="Tentukan modul dan aksi yang boleh diakses tiap role." />
      <DataPanel title="Permission" subtitle="Daftar kode permission per modul.">
        <ModulePreviewActions initialRows={permissions} addManualLabel="Tambah Permission Preview" manualTitle="Tambah Permission Preview" manualFields={[{ key: "kodePermission", label: "Kode Permission" }, { key: "modul", label: "Modul" }, { key: "deskripsi", label: "Deskripsi" }]} createManualRow={(v) => ({ kodePermission: v.kodePermission || "PREVIEW_VIEW", modul: v.modul || "Modul Preview", aksi: "Lihat" as const, deskripsi: v.deskripsi || "Permission preview frontend" })}>{(rows) => <PreviewDataTable columns={columns} rows={rows} rowKey={(r) => r.kodePermission} />}</ModulePreviewActions>
      </DataPanel>
    </ModuleDetailShell>
  );
}
