"use client";

import { ModuleDetailShell } from "@/components/module-center/ModuleDetailShell";
import { ModulePreviewActions } from "@/components/module-center/ModulePreviewActions"
import { ModuleDetailHeader } from "@/components/module-center/ModuleDetailHeader";
import { DummyDataBanner } from "@/components/module-center/DummyDataBanner";
import { DataPanel } from "@/components/module-center/DataPanel";
import { PreviewDataTable, type PreviewColumn } from "@/components/module-center/PreviewDataTable";
import { StatusPill, type StatusPillTone } from "@/components/module-center/StatusPill";
import { getHrisPreviewData, type AttendanceRow, type AttendanceStatus } from "@/features/hris/lib/temporaryHrisMockData";

const statusTone: Record<AttendanceStatus, StatusPillTone> = {
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
  { key: "checkIn", label: "Check-in", render: (r) => r.checkIn },
  { key: "checkOut", label: "Check-out", render: (r) => r.checkOut },
  { key: "status", label: "Status Kehadiran", render: (r) => <StatusPill label={r.statusKehadiran} tone={statusTone[r.statusKehadiran]} /> },
  { key: "jamKerja", label: "Jam Kerja", render: (r) => r.jamKerja },
];

export default function AbsensiPage() {
  const { attendance } = getHrisPreviewData();
  return (
    <ModuleDetailShell parentHref="/hris" parentLabel="Kembali ke HRIS">
      <DummyDataBanner />
      <ModuleDetailHeader eyebrow="HRIS — ABSENSI" title="Absensi" description="Pantau kehadiran, keterlambatan, izin, sakit, alpha, libur, dan jam kerja karyawan." />
      <DataPanel title="Absensi" subtitle="Kehadiran harian karyawan.">
        <ModulePreviewActions initialRows={attendance} importLabel="Import Absensi" addManualLabel="Tambah Absensi" importTitle="Import Absensi" importColumns={["Tanggal", "Nama Karyawan", "Departemen", "Check-in", "Check-out", "Status Kehadiran"]} manualTitle="Tambah Absensi" manualFields={[{ key: "namaKaryawan", label: "Nama Karyawan" }, { key: "departemen", label: "Departemen" }, { key: "checkIn", label: "Check-in" }, { key: "checkOut", label: "Check-out" }]} createImportedRow={() => ({ tanggal: new Date().toISOString().slice(0, 10), namaKaryawan: "Karyawan Preview", departemen: "Departemen Preview", checkIn: "08:00", checkOut: "17:00", statusKehadiran: "Hadir" as const, jamKerja: "9j" })} createManualRow={(v) => ({ tanggal: new Date().toISOString().slice(0, 10), namaKaryawan: v.namaKaryawan || "Karyawan Preview", departemen: v.departemen || "Departemen Preview", checkIn: v.checkIn || "-", checkOut: v.checkOut || "-", statusKehadiran: "Hadir" as const, jamKerja: "Preview" })}>{(rows) => <PreviewDataTable columns={columns} rows={rows} rowKey={(r) => `${r.tanggal}-${r.namaKaryawan}`} />}</ModulePreviewActions>
      </DataPanel>
    </ModuleDetailShell>
  );
}
