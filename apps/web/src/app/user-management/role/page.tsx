"use client";

import { ModuleDetailShell } from "@/components/module-center/ModuleDetailShell";
import { ModulePreviewActions } from "@/components/module-center/ModulePreviewActions";
import { ModuleDetailHeader } from "@/components/module-center/ModuleDetailHeader";
import { DummyDataBanner } from "@/components/module-center/DummyDataBanner";
import { DataPanel } from "@/components/module-center/DataPanel";
import { PreviewDataTable, type PreviewColumn } from "@/components/module-center/PreviewDataTable";
import { StatusPill, type StatusPillTone } from "@/components/module-center/StatusPill";
import { getUserManagementPreviewData, type RoleRow } from "@/features/user-management/lib/temporaryUserMockData";

const statusTone: Record<RoleRow["status"], StatusPillTone> = {
  Aktif: "green",
  Nonaktif: "slate",
};

const columns: PreviewColumn<RoleRow>[] = [
  { key: "nama", label: "Nama Role", render: (r) => r.namaRole },
  { key: "deskripsi", label: "Deskripsi", render: (r) => r.deskripsi },
  { key: "jumlah", label: "Jumlah User", align: "right", render: (r) => String(r.jumlahUser) },
  { key: "status", label: "Status", render: (r) => <StatusPill label={r.status} tone={statusTone[r.status]} /> },
];

export default function RolePage() {
  const { roles } = getUserManagementPreviewData();
  return (
    <ModuleDetailShell parentHref="/user-management" parentLabel="Kembali ke User Management">
      <DummyDataBanner />
      <ModuleDetailHeader eyebrow="USER MANAGEMENT — ROLE" title="Role" description="Atur role Owner, Admin, Marketing, CS, CRM, ADV, Finance, Gudang, HRD." />
      <DataPanel title="Role" subtitle="Daftar role dan jumlah user.">
        <ModulePreviewActions initialRows={roles} addManualLabel="Tambah Role Preview" manualTitle="Tambah Role Preview" manualFields={[{ key: "namaRole", label: "Nama Role" }, { key: "deskripsi", label: "Deskripsi" }]} createManualRow={(v) => ({ namaRole: (v.namaRole || "Role Baru") as RoleRow["namaRole"], deskripsi: v.deskripsi || "Role preview frontend", jumlahUser: 0, status: "Aktif" as const })}>{(rows) => <PreviewDataTable columns={columns} rows={rows} rowKey={(r) => r.namaRole} />}</ModulePreviewActions>
      </DataPanel>
    </ModuleDetailShell>
  );
}
