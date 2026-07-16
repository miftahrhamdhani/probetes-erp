"use client";

import { ModuleDetailShell } from "@/components/module-center/ModuleDetailShell";
import { ModulePreviewActions } from "@/components/module-center/ModulePreviewActions"
import { ModuleDetailHeader } from "@/components/module-center/ModuleDetailHeader";
import { DummyDataBanner } from "@/components/module-center/DummyDataBanner";
import { DataPanel } from "@/components/module-center/DataPanel";
import { PreviewDataTable, type PreviewColumn } from "@/components/module-center/PreviewDataTable";
import { StatusPill, type StatusPillTone } from "@/components/module-center/StatusPill";
import { getUserManagementPreviewData, type AccountRow } from "@/features/user-management/lib/temporaryUserMockData";

const statusTone: Record<AccountRow["statusAkun"], StatusPillTone> = {
  Aktif: "green",
  Nonaktif: "slate",
};

const columns: PreviewColumn<AccountRow>[] = [
  { key: "user", label: "User", render: (r) => r.user },
  { key: "email", label: "Email / Username", render: (r) => r.emailUsername },
  { key: "role", label: "Role Utama", render: (r) => r.roleUtama },
  { key: "status", label: "Status Akun", render: (r) => <StatusPill label={r.statusAkun} tone={statusTone[r.statusAkun]} /> },
  { key: "lastLogin", label: "Last Login", render: (r) => r.lastLogin },
];

export default function AkunLoginPage() {
  const { accounts } = getUserManagementPreviewData();
  return (
    <ModuleDetailShell parentHref="/user-management" parentLabel="Kembali ke User Management">
      <DummyDataBanner />
      <ModuleDetailHeader eyebrow="USER MANAGEMENT — AKUN LOGIN" title="Akun Login" description="Kelola daftar akun login pengguna aplikasi ERP." />
      <DataPanel title="Akun Login" subtitle="Daftar akun pengguna ERP.">
        <ModulePreviewActions initialRows={accounts} addManualLabel="Tambah Akun Preview" manualTitle="Tambah Akun Preview" manualFields={[{ key: "user", label: "Nama User" }, { key: "emailUsername", label: "Email / Username" }]} createManualRow={(v) => ({ user: v.user || "User Preview", emailUsername: v.emailUsername || "preview@probetes.id", roleUtama: "CS" as const, statusAkun: "Aktif" as const, lastLogin: "Belum login" })}>{(rows) => <PreviewDataTable columns={columns} rows={rows} rowKey={(r) => r.emailUsername} />}</ModulePreviewActions>
      </DataPanel>
    </ModuleDetailShell>
  );
}
