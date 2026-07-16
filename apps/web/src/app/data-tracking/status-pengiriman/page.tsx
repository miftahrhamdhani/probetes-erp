"use client";

import { ModuleDetailShell } from "@/components/module-center/ModuleDetailShell";
import { ModulePreviewActions } from "@/components/module-center/ModulePreviewActions";
import { ModuleDetailHeader } from "@/components/module-center/ModuleDetailHeader";
import { DummyDataBanner } from "@/components/module-center/DummyDataBanner";
import { DataPanel } from "@/components/module-center/DataPanel";
import { PreviewDataTable, type PreviewColumn } from "@/components/module-center/PreviewDataTable";
import { StatusPill, type StatusPillTone } from "@/components/module-center/StatusPill";
import { getTrackingPreviewData, type PackageStatus, type StatusPengirimanRow } from "@/features/data-tracking/lib/temporaryTrackingMockData";

const statusTone: Record<PackageStatus, StatusPillTone> = {
  "Dalam Pengiriman": "blue",
  Terkirim: "green",
  "Gagal Kirim": "red",
  Retur: "red",
  "Perlu Follow-up": "amber",
};

const columns: PreviewColumn<StatusPengirimanRow>[] = [
  { key: "tanggal", label: "Tanggal", render: (row) => row.tanggal },
  { key: "resi", label: "Nomor Resi", render: (row) => row.noResi },
  { key: "customer", label: "Customer", render: (row) => row.customer },
  { key: "status", label: "Status Paket", render: (row) => <StatusPill label={row.statusPaket} tone={statusTone[row.statusPaket]} /> },
  { key: "umur", label: "Umur Paket", render: (row) => row.umurPaket },
  { key: "cs", label: "CS PJ", render: (row) => row.csPenanggungJawab },
  { key: "tindakLanjut", label: "Tindak Lanjut", render: (row) => row.tindakLanjut },
];

export default function StatusPengirimanPage() {
  const { statusPengiriman } = getTrackingPreviewData();
  return (
    <ModuleDetailShell parentHref="/data-tracking" parentLabel="Kembali ke Data Tracking">
      <DummyDataBanner />
      <ModuleDetailHeader
        eyebrow="DATA TRACKING — STATUS PENGIRIMAN"
        title="Status Pengiriman"
        description="Pantau paket yang sedang dikirim, terkirim, gagal kirim, retur, atau perlu follow-up."
      />
      <DataPanel title="Status Pengiriman" subtitle="Umur paket dan tindak lanjut CS.">
        <ModulePreviewActions initialRows={statusPengiriman} importLabel="Import Update Pengiriman" addManualLabel="Tambah Follow-up" importTitle="Import Update Pengiriman" importColumns={["Tanggal", "Resi", "Status Paket", "CS PJ", "Tindak Lanjut"]} manualTitle="Tambah Follow-up" manualFields={[{ key: "noResi", label: "Nomor Resi" }, { key: "customer", label: "Customer" }, { key: "tindakLanjut", label: "Tindak Lanjut" }] } createImportedRow={() => ({ tanggal: new Date().toISOString().slice(0, 10), noResi: "PREVIEW-RESI", customer: "Customer Preview", statusPaket: "Perlu Follow-up" as const, umurPaket: "0 hari", csPenanggungJawab: "CS Preview", tindakLanjut: "Cek kembali" })} createManualRow={(v) => ({ tanggal: new Date().toISOString().slice(0, 10), noResi: v.noResi || "PREVIEW-RESI", customer: v.customer || "Customer Preview", statusPaket: "Perlu Follow-up" as const, umurPaket: "0 hari", csPenanggungJawab: "CS Preview", tindakLanjut: v.tindakLanjut || "Cek kembali" })}>{(rows) => <PreviewDataTable columns={columns} rows={rows} rowKey={(row) => `${row.tanggal}-${row.noResi}`} />}</ModulePreviewActions>
      </DataPanel>
    </ModuleDetailShell>
  );
}
