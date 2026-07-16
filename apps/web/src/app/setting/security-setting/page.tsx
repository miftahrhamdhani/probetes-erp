import { ModuleDetailShell } from "@/components/module-center/ModuleDetailShell";
import { ModuleDetailHeader } from "@/components/module-center/ModuleDetailHeader";
import { DummyDataBanner } from "@/components/module-center/DummyDataBanner";
import { DataPanel } from "@/components/module-center/DataPanel";
import { PreviewDataTable, type PreviewColumn } from "@/components/module-center/PreviewDataTable";
import { StatusPill, type StatusPillTone } from "@/components/module-center/StatusPill";
import { getSettingPreviewData, type SecuritySettingRow, type SettingStatus } from "@/features/setting/lib/temporarySettingMockData";

const statusTone: Record<SettingStatus, StatusPillTone> = {
  Aktif: "green",
  "Belum Diatur": "amber",
  "Perlu Dicek": "amber",
  Siap: "blue",
};

const columns: PreviewColumn<SecuritySettingRow>[] = [
  { key: "aturan", label: "Aturan Keamanan", render: (r) => r.aturanKeamanan },
  { key: "nilai", label: "Nilai", render: (r) => r.nilai },
  { key: "status", label: "Status", render: (r) => <StatusPill label={r.status} tone={statusTone[r.status]} /> },
  { key: "catatan", label: "Catatan", render: (r) => r.catatan },
];

export default function SecuritySettingPage() {
  const { securitySettings } = getSettingPreviewData();
  return (
    <ModuleDetailShell parentHref="/setting" parentLabel="Kembali ke Setting">
      <DummyDataBanner />
      <ModuleDetailHeader eyebrow="SETTING — SECURITY SETTING" title="Security Setting" description="Aturan keamanan, nilai, status, catatan." />
      <DataPanel title="Security Setting" subtitle="Kebijakan keamanan aplikasi.">
        <PreviewDataTable columns={columns} rows={securitySettings} rowKey={(r) => r.aturanKeamanan} />
      </DataPanel>
    </ModuleDetailShell>
  );
}
