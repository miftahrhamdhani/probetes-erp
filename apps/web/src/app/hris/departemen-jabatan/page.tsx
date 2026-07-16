import { ModuleDetailShell } from "@/components/module-center/ModuleDetailShell";
import { ModuleDetailHeader } from "@/components/module-center/ModuleDetailHeader";
import { DummyDataBanner } from "@/components/module-center/DummyDataBanner";
import { DataPanel } from "@/components/module-center/DataPanel";
import { PreviewDataTable, type PreviewColumn } from "@/components/module-center/PreviewDataTable";
import { StatusPill, type StatusPillTone } from "@/components/module-center/StatusPill";
import { getHrisPreviewData, type DepartmentRow } from "@/features/hris/lib/temporaryHrisMockData";

const statusTone: Record<DepartmentRow["status"], StatusPillTone> = {
  Aktif: "green",
  Nonaktif: "slate",
};

const columns: PreviewColumn<DepartmentRow>[] = [
  { key: "departemen", label: "Departemen", render: (r) => r.departemen },
  { key: "jabatan", label: "Jabatan", render: (r) => r.jabatan },
  { key: "jumlah", label: "Jumlah Karyawan", align: "right", render: (r) => String(r.jumlahKaryawan) },
  { key: "level", label: "Level", render: (r) => r.level },
  { key: "status", label: "Status", render: (r) => <StatusPill label={r.status} tone={statusTone[r.status]} /> },
];

export default function DepartemenJabatanPage() {
  const { departments } = getHrisPreviewData();
  return (
    <ModuleDetailShell parentHref="/hris" parentLabel="Kembali ke HRIS">
      <DummyDataBanner />
      <ModuleDetailHeader eyebrow="HRIS — DEPARTEMEN & JABATAN" title="Departemen & Jabatan" description="Struktur departemen, jabatan, dan jumlah karyawan." />
      <DataPanel title="Departemen & Jabatan" subtitle="Struktur organisasi Probetes.">
        <PreviewDataTable columns={columns} rows={departments} rowKey={(r) => `${r.departemen}-${r.jabatan}`} />
      </DataPanel>
    </ModuleDetailShell>
  );
}
