import { ModuleDetailShell } from "@/components/module-center/ModuleDetailShell";
import { ModuleDetailHeader } from "@/components/module-center/ModuleDetailHeader";
import { DummyDataBanner } from "@/components/module-center/DummyDataBanner";
import { DataPanel } from "@/components/module-center/DataPanel";
import { PreviewDataTable, type PreviewColumn } from "@/components/module-center/PreviewDataTable";
import { StatusPill, type StatusPillTone } from "@/components/module-center/StatusPill";
import { getUserManagementPreviewData, type UserActivityRow, type UserAccountStatus } from "@/features/user-management/lib/temporaryUserMockData";

const statusTone: Record<UserAccountStatus, StatusPillTone> = {
  Aktif: "green",
  Nonaktif: "slate",
  "Perlu Review": "amber",
  "Login Berhasil": "blue",
};

const columns: PreviewColumn<UserActivityRow>[] = [
  { key: "tanggal", label: "Tanggal", render: (r) => r.tanggal },
  { key: "user", label: "User", render: (r) => r.namaUser },
  { key: "role", label: "Role", render: (r) => r.role },
  { key: "aktivitas", label: "Aktivitas", render: (r) => r.aktivitas },
  { key: "modul", label: "Modul", render: (r) => r.modul },
  { key: "status", label: "Status", render: (r) => <StatusPill label={r.status} tone={statusTone[r.status]} /> },
];

export default function ActivityLogPage() {
  const { activities } = getUserManagementPreviewData();
  return (
    <ModuleDetailShell parentHref="/user-management" parentLabel="Kembali ke User Management">
      <DummyDataBanner />
      <ModuleDetailHeader eyebrow="USER MANAGEMENT — ACTIVITY LOG" title="Activity Log" description="Pantau riwayat aktivitas penting pengguna di aplikasi." />
      <DataPanel title="Activity Log" subtitle="Aktivitas terbaru lintas modul.">
        <PreviewDataTable columns={columns} rows={activities} rowKey={(r) => `${r.tanggal}-${r.namaUser}-${r.aktivitas}`} />
      </DataPanel>
    </ModuleDetailShell>
  );
}
