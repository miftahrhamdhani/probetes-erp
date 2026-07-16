"use client";

import { ModuleDetailShell } from "@/components/module-center/ModuleDetailShell";
import { ModulePreviewActions } from "@/components/module-center/ModulePreviewActions"
import { ModuleDetailHeader } from "@/components/module-center/ModuleDetailHeader";
import { DummyDataBanner } from "@/components/module-center/DummyDataBanner";
import { DataPanel } from "@/components/module-center/DataPanel";
import { PreviewDataTable, type PreviewColumn } from "@/components/module-center/PreviewDataTable";
import { StatusPill, type StatusPillTone } from "@/components/module-center/StatusPill";
import { getHrisPreviewData, type LeaveRow } from "@/features/hris/lib/temporaryHrisMockData";

const statusTone: Record<LeaveRow["status"], StatusPillTone> = {
  Diajukan: "amber",
  Disetujui: "green",
  Ditolak: "red",
};

const columns: PreviewColumn<LeaveRow>[] = [
  { key: "tanggalPengajuan", label: "Tanggal Pengajuan", render: (r) => r.tanggalPengajuan },
  { key: "nama", label: "Nama", render: (r) => r.nama },
  { key: "jenis", label: "Jenis", render: (r) => r.jenis },
  { key: "tanggalCuti", label: "Tanggal Cuti", render: (r) => r.tanggalCuti },
  { key: "totalHari", label: "Total Hari", align: "right", render: (r) => String(r.totalHari) },
  { key: "approver", label: "Approver", render: (r) => r.approver },
  { key: "status", label: "Status", render: (r) => <StatusPill label={r.status} tone={statusTone[r.status]} /> },
];

export default function CutiIzinPage() {
  const { leaves } = getHrisPreviewData();
  return (
    <ModuleDetailShell parentHref="/hris" parentLabel="Kembali ke HRIS">
      <DummyDataBanner />
      <ModuleDetailHeader eyebrow="HRIS — CUTI & IZIN" title="Cuti & Izin" description="Kelola pengajuan cuti, izin, persetujuan, riwayat cuti, dan status kehadiran." />
      <DataPanel title="Cuti & Izin" subtitle="Pengajuan cuti/izin terbaru.">
        <ModulePreviewActions initialRows={leaves} importLabel="Import Riwayat Cuti" addManualLabel="Tambah Pengajuan" importTitle="Import Riwayat Cuti" importColumns={["Tanggal Pengajuan", "Nama", "Jenis", "Tanggal Cuti", "Total Hari", "Approver"]} manualTitle="Tambah Pengajuan Cuti/Izin" manualFields={[{ key: "nama", label: "Nama" }, { key: "tanggalCuti", label: "Tanggal Cuti" }, { key: "totalHari", label: "Total Hari", type: "number" }]} createImportedRow={() => ({ tanggalPengajuan: new Date().toISOString().slice(0, 10), nama: "Karyawan Preview", jenis: "Izin" as const, tanggalCuti: new Date().toISOString().slice(0, 10), totalHari: 1, approver: "Approver Preview", status: "Diajukan" as const })} createManualRow={(v) => ({ tanggalPengajuan: new Date().toISOString().slice(0, 10), nama: v.nama || "Karyawan Preview", jenis: "Izin" as const, tanggalCuti: v.tanggalCuti || new Date().toISOString().slice(0, 10), totalHari: Number(v.totalHari) || 1, approver: "Approver Preview", status: "Diajukan" as const })}>{(rows) => <PreviewDataTable columns={columns} rows={rows} rowKey={(r) => `${r.tanggalPengajuan}-${r.nama}`} />}</ModulePreviewActions>
      </DataPanel>
    </ModuleDetailShell>
  );
}
