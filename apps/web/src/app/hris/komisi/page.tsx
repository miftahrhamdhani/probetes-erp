"use client";

import { ModuleDetailShell } from "@/components/module-center/ModuleDetailShell";
import { ModulePreviewActions } from "@/components/module-center/ModulePreviewActions"
import { ModuleDetailHeader } from "@/components/module-center/ModuleDetailHeader";
import { DummyDataBanner } from "@/components/module-center/DummyDataBanner";
import { DataPanel } from "@/components/module-center/DataPanel";
import { PreviewDataTable, type PreviewColumn } from "@/components/module-center/PreviewDataTable";
import { StatusPill, type StatusPillTone } from "@/components/module-center/StatusPill";
import { formatRupiah } from "@/components/module-center/format";
import { getHrisPreviewData, type CommissionRow, type HrisRowStatus } from "@/features/hris/lib/temporaryHrisMockData";

const statusTone: Record<HrisRowStatus, StatusPillTone> = {
  Aktif: "green",
  "Perlu Review": "amber",
  Draft: "slate",
};

const columns: PreviewColumn<CommissionRow>[] = [
  { key: "periode", label: "Periode", render: (r) => r.periode },
  { key: "nama", label: "Nama", render: (r) => r.nama },
  { key: "tim", label: "Tim", render: (r) => r.tim },
  { key: "dasar", label: "Dasar Komisi", render: (r) => r.dasarKomisi },
  { key: "nominal", label: "Nominal Komisi", align: "right", render: (r) => formatRupiah(r.nominalKomisi) },
  { key: "status", label: "Status", render: (r) => <StatusPill label={r.status} tone={statusTone[r.status]} /> },
];

export default function KomisiPage() {
  const { commissions } = getHrisPreviewData();
  return (
    <ModuleDetailShell parentHref="/hris" parentLabel="Kembali ke HRIS">
      <DummyDataBanner />
      <ModuleDetailHeader
        eyebrow="HRIS — KOMISI CS/CRM/ADV"
        title="Komisi CS / CRM / ADV"
        description="Hitung dan pantau komisi tim CS, CRM, dan ADV berdasarkan closing, order, leads, campaign, atau performa yang sudah ditentukan."
      />
      <DataPanel title="Komisi Tim" subtitle="Rincian komisi per periode & tim, terbaru di atas.">
        <ModulePreviewActions initialRows={commissions} importLabel="Import Komisi" addManualLabel="Tambah Komisi Manual" importTitle="Import Komisi" importColumns={["Periode", "Nama", "Tim", "Dasar Komisi", "Nominal Komisi"]} manualTitle="Tambah Komisi Manual" manualFields={[{ key: "nama", label: "Nama" }, { key: "periode", label: "Periode" }, { key: "dasarKomisi", label: "Dasar Komisi" }, { key: "nominalKomisi", label: "Nominal Komisi", type: "number" }]} extraActions={[{ label: "Hitung Komisi Preview", onClick: () => undefined }]} createImportedRow={() => ({ periode: "Juli 2026", nama: "Karyawan Preview", tim: "CS" as const, dasarKomisi: "Order preview", nominalKomisi: 0, status: "Draft" as const })} createManualRow={(v) => ({ periode: v.periode || "Juli 2026", nama: v.nama || "Karyawan Preview", tim: "CS" as const, dasarKomisi: v.dasarKomisi || "Dasar preview", nominalKomisi: Number(v.nominalKomisi) || 0, status: "Draft" as const })}>{(rows) => <PreviewDataTable columns={columns} rows={rows} rowKey={(r) => `${r.periode}-${r.nama}`} />}</ModulePreviewActions>
      </DataPanel>
    </ModuleDetailShell>
  );
}
