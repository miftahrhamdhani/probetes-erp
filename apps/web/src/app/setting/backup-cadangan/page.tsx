import { ModuleDetailShell } from "@/components/module-center/ModuleDetailShell";
import { ModuleDetailHeader } from "@/components/module-center/ModuleDetailHeader";
import { DummyDataBanner } from "@/components/module-center/DummyDataBanner";
import { DataPanel } from "@/components/module-center/DataPanel";
import { PreviewDataTable, type PreviewColumn } from "@/components/module-center/PreviewDataTable";
import { StatusPill, type StatusPillTone } from "@/components/module-center/StatusPill";
import { getSettingPreviewData, type BackupRow } from "@/features/setting/lib/temporarySettingMockData";

const statusTone: Record<BackupRow["status"], StatusPillTone> = {
  Berhasil: "green",
  Gagal: "red",
  "Sedang Berjalan": "blue",
};

const columns: PreviewColumn<BackupRow>[] = [
  { key: "tanggal", label: "Tanggal", render: (r) => r.tanggal },
  { key: "jenis", label: "Jenis Backup", render: (r) => r.jenisBackup },
  { key: "lokasi", label: "Lokasi", render: (r) => r.lokasi },
  { key: "ukuran", label: "Ukuran", render: (r) => r.ukuran },
  { key: "status", label: "Status", render: (r) => <StatusPill label={r.status} tone={statusTone[r.status]} /> },
];

export default function BackupCadanganPage() {
  const { backups } = getSettingPreviewData();
  return (
    <ModuleDetailShell parentHref="/setting" parentLabel="Kembali ke Setting">
      <DummyDataBanner />
      <ModuleDetailHeader eyebrow="SETTING — BACKUP/CADANGAN" title="Backup / Cadangan" description="Tanggal, jenis backup, lokasi/status, ukuran, status." />
      <DataPanel title="Backup / Cadangan" subtitle="Riwayat backup, terbaru di atas.">
        <PreviewDataTable columns={columns} rows={backups} rowKey={(r) => r.tanggal} />
      </DataPanel>
    </ModuleDetailShell>
  );
}
