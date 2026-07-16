import { ModuleDetailShell } from "@/components/module-center/ModuleDetailShell";
import { ModuleDetailHeader } from "@/components/module-center/ModuleDetailHeader";
import { DummyDataBanner } from "@/components/module-center/DummyDataBanner";
import { DataPanel } from "@/components/module-center/DataPanel";
import { PreviewDataTable, type PreviewColumn } from "@/components/module-center/PreviewDataTable";
import { StatusPill, type StatusPillTone } from "@/components/module-center/StatusPill";
import { formatRupiah } from "@/components/module-center/format";
import { getHrisPreviewData, type HrdReportRow } from "@/features/hris/lib/temporaryHrisMockData";

const statusTone: Record<HrdReportRow["statusLaporan"], StatusPillTone> = {
  "Siap Dilihat": "green",
  Draft: "slate",
  "Belum Final": "red",
};

const columns: PreviewColumn<HrdReportRow>[] = [
  { key: "periode", label: "Periode", render: (r) => r.periode },
  { key: "total", label: "Total Karyawan", align: "right", render: (r) => String(r.totalKaryawan) },
  { key: "hadir", label: "Hadir", align: "right", render: (r) => String(r.hadir) },
  { key: "izin", label: "Izin", align: "right", render: (r) => String(r.izin) },
  { key: "alpha", label: "Alpha", align: "right", render: (r) => String(r.alpha) },
  { key: "biaya", label: "Biaya Gaji", align: "right", render: (r) => formatRupiah(r.biayaGaji) },
  { key: "status", label: "Status Laporan", render: (r) => <StatusPill label={r.statusLaporan} tone={statusTone[r.statusLaporan]} /> },
];

export default function LaporanHrdPage() {
  const { hrdReports } = getHrisPreviewData();
  return (
    <ModuleDetailShell parentHref="/hris" parentLabel="Kembali ke HRIS">
      <DummyDataBanner />
      <ModuleDetailHeader eyebrow="HRIS — LAPORAN HRD" title="Laporan HRD" description="Lihat ringkasan karyawan, absensi, cuti, payroll, komisi, dan laporan kepegawaian untuk HRD/owner." />
      <DataPanel title="Laporan HRD" subtitle="Ringkasan per periode, terbaru di atas.">
        <PreviewDataTable columns={columns} rows={hrdReports} rowKey={(r) => r.periode} />
      </DataPanel>
    </ModuleDetailShell>
  );
}
