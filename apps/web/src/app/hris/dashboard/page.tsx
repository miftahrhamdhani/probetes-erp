import { ModuleDetailShell } from "@/components/module-center/ModuleDetailShell";
import { ModuleDetailHeader } from "@/components/module-center/ModuleDetailHeader";
import { DummyDataBanner } from "@/components/module-center/DummyDataBanner";
import { DataPanel } from "@/components/module-center/DataPanel";
import { PreviewKpiCard } from "@/components/module-center/PreviewKpiCard";
import { PreviewDataTable, type PreviewColumn } from "@/components/module-center/PreviewDataTable";
import { StatusPill, type StatusPillTone } from "@/components/module-center/StatusPill";
import { getHrisPreviewData, type AttendanceRow, type AttendanceStatus } from "@/features/hris/lib/temporaryHrisMockData";

const attendanceTone: Record<AttendanceStatus, StatusPillTone> = {
  Hadir: "green",
  Terlambat: "amber",
  Izin: "blue",
  Sakit: "purple",
  Alpha: "red",
  Libur: "slate",
};

const columns: PreviewColumn<AttendanceRow>[] = [
  { key: "tanggal", label: "Tanggal", render: (r) => r.tanggal },
  { key: "nama", label: "Nama Karyawan", render: (r) => r.namaKaryawan },
  { key: "departemen", label: "Departemen", render: (r) => r.departemen },
  { key: "status", label: "Status Kehadiran", render: (r) => <StatusPill label={r.statusKehadiran} tone={attendanceTone[r.statusKehadiran]} /> },
];

export default function HrisDashboardPage() {
  const { kpi, attendance } = getHrisPreviewData();
  return (
    <ModuleDetailShell parentHref="/hris" parentLabel="Kembali ke HRIS">
      <DummyDataBanner />
      <ModuleDetailHeader eyebrow="HRIS — DASHBOARD" title="Dashboard HRIS" description="KPI karyawan aktif, absensi hari ini, terlambat, izin, dan payroll." />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {kpi.map((item) => <PreviewKpiCard key={item.label} item={item} />)}
      </div>
      <DataPanel title="Absensi Terbaru" subtitle="Snapshot kehadiran karyawan.">
        <PreviewDataTable columns={columns} rows={attendance} rowKey={(r) => `${r.tanggal}-${r.namaKaryawan}`} />
      </DataPanel>
    </ModuleDetailShell>
  );
}
