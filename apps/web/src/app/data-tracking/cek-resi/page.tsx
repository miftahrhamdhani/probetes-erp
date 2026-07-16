"use client";

import { ModuleDetailShell } from "@/components/module-center/ModuleDetailShell";
import { ModulePreviewActions } from "@/components/module-center/ModulePreviewActions";
import { ModuleDetailHeader } from "@/components/module-center/ModuleDetailHeader";
import { DummyDataBanner } from "@/components/module-center/DummyDataBanner";
import { DataPanel } from "@/components/module-center/DataPanel";
import { PreviewDataTable, type PreviewColumn } from "@/components/module-center/PreviewDataTable";
import { StatusPill, type StatusPillTone } from "@/components/module-center/StatusPill";
import { getTrackingPreviewData, type CekResiRow, type PackageStatus } from "@/features/data-tracking/lib/temporaryTrackingMockData";

const statusTone: Record<PackageStatus, StatusPillTone> = {
  "Dalam Pengiriman": "blue",
  Terkirim: "green",
  "Gagal Kirim": "red",
  Retur: "red",
  "Perlu Follow-up": "amber",
};

const columns: PreviewColumn<CekResiRow>[] = [
  { key: "resi", label: "Nomor Resi", render: (row) => row.noResi },
  { key: "orderId", label: "Order ID", render: (row) => row.orderId },
  { key: "customer", label: "Customer", render: (row) => row.customer },
  { key: "hp", label: "No. HP", render: (row) => row.noHp },
  { key: "ekspedisi", label: "Ekspedisi", render: (row) => row.ekspedisi },
  { key: "layanan", label: "Layanan", render: (row) => row.layanan },
  { key: "status", label: "Status", render: (row) => <StatusPill label={row.status} tone={statusTone[row.status]} /> },
  { key: "update", label: "Update Terakhir", render: (row) => row.updateTerakhir },
];

export default function CekResiPage() {
  const { cekResi } = getTrackingPreviewData();
  return (
    <ModuleDetailShell parentHref="/data-tracking" parentLabel="Kembali ke Data Tracking">
      <DummyDataBanner />
      <ModuleDetailHeader eyebrow="DATA TRACKING — CEK RESI" title="Cek Resi" description="Cari nomor resi, customer, ekspedisi, dan status pengiriman." />
      <DataPanel title="Daftar Resi" subtitle="Preview data resi terbaru.">
        <ModulePreviewActions
          initialRows={cekResi}
          importLabel="Import Resi"
          addManualLabel="Tambah Resi Manual"
          importTitle="Import Resi"
          importSources={["Export Ekspedisi", "Input CS"]}
          importColumns={["Nomor Resi", "Order ID", "Customer", "No. HP", "Alamat Ringkas", "Ekspedisi", "Status"]}
          manualTitle="Tambah Resi Manual"
          manualFields={[{ key: "noResi", label: "Nomor Resi" }, { key: "orderId", label: "Order ID" }, { key: "customer", label: "Customer" }, { key: "noHp", label: "No. HP" }, { key: "ekspedisi", label: "Ekspedisi" }, { key: "layanan", label: "Layanan" }]}
          createImportedRow={() => ({ noResi: "PREVIEW-RESI", orderId: "ORD-PREVIEW", customer: "Customer Preview", noHp: "08xx-xxxx-xxxx", ekspedisi: "Ekspedisi Preview", layanan: "Reguler", status: "Dalam Pengiriman" as const, updateTerakhir: new Date().toISOString().slice(0, 16).replace("T", " ") })}
          createManualRow={(values) => ({ noResi: values.noResi || "PREVIEW-RESI", orderId: values.orderId || "ORD-PREVIEW", customer: values.customer || "Customer Preview", noHp: values.noHp || "-", ekspedisi: values.ekspedisi || "-", layanan: values.layanan || "-", status: "Dalam Pengiriman" as const, updateTerakhir: new Date().toISOString().slice(0, 16).replace("T", " ") })}
        >
          {(rows) => <PreviewDataTable columns={columns} rows={rows} rowKey={(row) => row.noResi} />}
        </ModulePreviewActions>
      </DataPanel>
    </ModuleDetailShell>
  );
}
