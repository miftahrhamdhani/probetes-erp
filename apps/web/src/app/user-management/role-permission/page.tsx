"use client";

import { ModuleDetailShell } from "@/components/module-center/ModuleDetailShell";
import { ModulePreviewActions } from "@/components/module-center/ModulePreviewActions"
import { ModuleDetailHeader } from "@/components/module-center/ModuleDetailHeader";
import { DummyDataBanner } from "@/components/module-center/DummyDataBanner";
import { DataPanel } from "@/components/module-center/DataPanel";
import { PreviewDataTable, type PreviewColumn } from "@/components/module-center/PreviewDataTable";
import { StatusPill, type StatusPillTone } from "@/components/module-center/StatusPill";
import { getUserManagementPreviewData, type RolePermissionRow } from "@/features/user-management/lib/temporaryUserMockData";

const statusTone: Record<RolePermissionRow["status"], StatusPillTone> = {
  Aktif: "green",
  Nonaktif: "slate",
};

const columns: PreviewColumn<RolePermissionRow>[] = [
  { key: "role", label: "Role", render: (r) => r.role },
  { key: "modul", label: "Modul", render: (r) => r.modul },
  { key: "permission", label: "Permission", render: (r) => r.permission },
  { key: "status", label: "Status", render: (r) => <StatusPill label={r.status} tone={statusTone[r.status]} /> },
];

export default function RolePermissionPage() {
  const { rolePermissions } = getUserManagementPreviewData();
  return (
    <ModuleDetailShell parentHref="/user-management" parentLabel="Kembali ke User Management">
      <DummyDataBanner />
      <ModuleDetailHeader eyebrow="USER MANAGEMENT — ROLE PERMISSION" title="Role Permission" description="Permission yang dimiliki tiap role." />
      <DataPanel title="Role Permission" subtitle="Pemetaan role ke permission modul.">
        <ModulePreviewActions initialRows={rolePermissions} addManualLabel="Tambah Role Permission Preview" manualTitle="Tambah Role Permission Preview" manualFields={[{ key: "role", label: "Role" }, { key: "modul", label: "Modul" }, { key: "permission", label: "Permission" }]} createManualRow={(v) => ({ role: "CS" as const, modul: v.modul || "Modul Preview", permission: v.permission || "PERMISSION_PREVIEW", status: "Aktif" as const })}>{(rows) => <PreviewDataTable columns={columns} rows={rows} rowKey={(r) => `${r.role}-${r.permission}`} />}</ModulePreviewActions>
      </DataPanel>
    </ModuleDetailShell>
  );
}
