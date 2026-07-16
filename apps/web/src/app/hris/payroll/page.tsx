"use client";

import { ModuleDetailShell } from "@/components/module-center/ModuleDetailShell";
import { ModulePreviewActions } from "@/components/module-center/ModulePreviewActions"
import { ModuleDetailHeader } from "@/components/module-center/ModuleDetailHeader";
import { DummyDataBanner } from "@/components/module-center/DummyDataBanner";
import { DataPanel } from "@/components/module-center/DataPanel";
import { PreviewDataTable, type PreviewColumn } from "@/components/module-center/PreviewDataTable";
import { StatusPill, type StatusPillTone } from "@/components/module-center/StatusPill";
import { formatRupiah } from "@/components/module-center/format";
import { getHrisPreviewData, type PayrollRow } from "@/features/hris/lib/temporaryHrisMockData";

const statusTone: Record<PayrollRow["status"], StatusPillTone> = {
  Draft: "slate",
  Final: "blue",
  Dibayar: "green",
};

const columns: PreviewColumn<PayrollRow>[] = [
  { key: "periode", label: "Periode", render: (r) => r.periode },
  { key: "nama", label: "Nama", render: (r) => r.nama },
  { key: "jabatan", label: "Jabatan", render: (r) => r.jabatan },
  { key: "pokok", label: "Gaji Pokok", align: "right", render: (r) => formatRupiah(r.gajiPokok) },
  { key: "tunjangan", label: "Tunjangan", align: "right", render: (r) => formatRupiah(r.tunjangan) },
  { key: "potongan", label: "Potongan", align: "right", render: (r) => formatRupiah(r.potongan) },
  { key: "net", label: "Net Pay", align: "right", render: (r) => formatRupiah(r.netPay) },
  { key: "status", label: "Status", render: (r) => <StatusPill label={r.status} tone={statusTone[r.status]} /> },
];

export default function PayrollPage() {
  const { payroll } = getHrisPreviewData();
  return (
    <ModuleDetailShell parentHref="/hris" parentLabel="Kembali ke HRIS">
      <DummyDataBanner />
      <ModuleDetailHeader eyebrow="HRIS — PAYROLL" title="Payroll" description="Kelola periode gaji, slip gaji, gaji pokok, tunjangan, potongan, bonus, dan total gaji bersih." />
      <DataPanel title="Payroll & Slip Gaji" subtitle="Rincian gaji per periode, terbaru di atas.">
        <ModulePreviewActions initialRows={payroll} importLabel="Import Payroll" addManualLabel="Tambah Komponen" manualTitle="Tambah Komponen Payroll" manualFields={[{ key: "nama", label: "Nama Karyawan" }, { key: "periode", label: "Periode" }, { key: "gajiPokok", label: "Gaji Pokok", type: "number" }, { key: "tunjangan", label: "Tunjangan", type: "number" }, { key: "potongan", label: "Potongan", type: "number" }]} extraActions={[{ label: "Generate Slip Preview", onClick: () => undefined }]} importTitle="Import Payroll" importColumns={["Periode", "Nama", "Jabatan", "Gaji Pokok", "Tunjangan", "Potongan", "Net Pay"]} createImportedRow={() => ({ periode: "Juli 2026", nama: "Karyawan Preview", jabatan: "Jabatan Preview", gajiPokok: 0, tunjangan: 0, potongan: 0, netPay: 0, status: "Draft" as const })} createManualRow={(v) => { const pokok = Number(v.gajiPokok) || 0; const tunjangan = Number(v.tunjangan) || 0; const potongan = Number(v.potongan) || 0; return { periode: v.periode || "Juli 2026", nama: v.nama || "Karyawan Preview", jabatan: "Jabatan Preview", gajiPokok: pokok, tunjangan, potongan, netPay: pokok + tunjangan - potongan, status: "Draft" as const }; }}>{(rows) => <PreviewDataTable columns={columns} rows={rows} rowKey={(r) => `${r.periode}-${r.nama}`} />}</ModulePreviewActions>
      </DataPanel>
    </ModuleDetailShell>
  );
}
