import { ModuleDetailShell } from "@/components/module-center/ModuleDetailShell";
import { ModuleDetailHeader } from "@/components/module-center/ModuleDetailHeader";
import { DummyDataBanner } from "@/components/module-center/DummyDataBanner";
import { DataPanel } from "@/components/module-center/DataPanel";
import { PreviewDataTable, type PreviewColumn } from "@/components/module-center/PreviewDataTable";
import { StatusPill, type StatusPillTone } from "@/components/module-center/StatusPill";
import { getUserManagementPreviewData, type AccountRoleRow } from "@/features/user-management/lib/temporaryUserMockData";

const statusTone: Record<AccountRoleRow["status"], StatusPillTone> = {
  Aktif: "green",
  Dicabut: "red",
};

const columns: PreviewColumn<AccountRoleRow>[] = [
  { key: "tanggal", label: "Tanggal", render: (r) => r.tanggal },
  { key: "akun", label: "Akun", render: (r) => r.akun },
  { key: "role", label: "Role", render: (r) => r.role },
  { key: "diberikan", label: "Diberikan Oleh", render: (r) => r.diberikanOleh },
  { key: "status", label: "Status", render: (r) => <StatusPill label={r.status} tone={statusTone[r.status]} /> },
];

export default function AccountRolePage() {
  const { accountRoles } = getUserManagementPreviewData();
  return (
    <ModuleDetailShell parentHref="/user-management" parentLabel="Kembali ke User Management">
      <DummyDataBanner />
      <ModuleDetailHeader eyebrow="USER MANAGEMENT — ACCOUNT ROLE" title="Account Role" description="Riwayat pemberian role ke akun pengguna." />
      <DataPanel title="Account Role" subtitle="Riwayat pemberian role, terbaru di atas.">
        <PreviewDataTable columns={columns} rows={accountRoles} rowKey={(r) => `${r.tanggal}-${r.akun}`} />
      </DataPanel>
    </ModuleDetailShell>
  );
}
