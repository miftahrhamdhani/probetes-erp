import { ModuleDetailShell } from "@/components/module-center/ModuleDetailShell";
import { ModuleDetailHeader } from "@/components/module-center/ModuleDetailHeader";
import { DummyDataBanner } from "@/components/module-center/DummyDataBanner";
import { DataPanel } from "@/components/module-center/DataPanel";
import { PreviewDataTable, type PreviewColumn } from "@/components/module-center/PreviewDataTable";
import { StatusPill, type StatusPillTone } from "@/components/module-center/StatusPill";
import { getHrisPreviewData, type EmployeeRow, type EmployeeWorkStatus, type HrisRowStatus } from "@/features/hris/lib/temporaryHrisMockData";

const workStatusTone: Record<EmployeeWorkStatus, StatusPillTone> = {
  Aktif: "green",
  Cuti: "blue",
  Resign: "slate",
  Nonaktif: "red",
};
const rowStatusTone: Record<HrisRowStatus, StatusPillTone> = {
  Aktif: "green",
  "Perlu Review": "amber",
  Draft: "slate",
};

const columns: PreviewColumn<EmployeeRow>[] = [
  { key: "nama", label: "Nama", render: (r) => r.nama },
  { key: "nik", label: "NIK", render: (r) => r.nikPlaceholder },
  { key: "departemen", label: "Departemen", render: (r) => r.departemen },
  { key: "jabatan", label: "Jabatan", render: (r) => r.jabatan },
  { key: "statusKerja", label: "Status Kerja", render: (r) => <StatusPill label={r.statusKerja} tone={workStatusTone[r.statusKerja]} /> },
  { key: "status", label: "Status", render: (r) => <StatusPill label={r.status} tone={rowStatusTone[r.status]} /> },
];

export default function DataKaryawanPage() {
  const { employees } = getHrisPreviewData();
  return (
    <ModuleDetailShell parentHref="/hris" parentLabel="Kembali ke HRIS">
      <DummyDataBanner />
      <ModuleDetailHeader eyebrow="HRIS — DATA KARYAWAN" title="Data Karyawan" description="Kelola identitas karyawan, departemen, jabatan, status kerja, dan informasi dasar kepegawaian." />
      <DataPanel title="Data Karyawan" subtitle="Daftar karyawan aktif.">
        <PreviewDataTable columns={columns} rows={employees} rowKey={(r) => r.nikPlaceholder} />
      </DataPanel>
    </ModuleDetailShell>
  );
}
