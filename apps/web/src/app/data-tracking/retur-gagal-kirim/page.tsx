"use client";

import { ModuleDetailShell } from "@/components/module-center/ModuleDetailShell";
import { ModulePreviewActions } from "@/components/module-center/ModulePreviewActions";
import { ModuleDetailHeader } from "@/components/module-center/ModuleDetailHeader";
import { DummyDataBanner } from "@/components/module-center/DummyDataBanner";
import { DataPanel } from "@/components/module-center/DataPanel";
import { PreviewDataTable, type PreviewColumn } from "@/components/module-center/PreviewDataTable";
import { StatusPill, type StatusPillTone } from "@/components/module-center/StatusPill";
import { getTrackingPreviewData, type ReturGagalRow } from "@/features/data-tracking/lib/temporaryTrackingMockData";

const followUpTone: Record<ReturGagalRow["statusFollowUp"], StatusPillTone> = {
  "Perlu Follow-up": "amber",
  "Sedang Diproses": "blue",
  Selesai: "green",
};

const columns: PreviewColumn<ReturGagalRow>[] = [
  { key: "tanggal", label: "Tanggal", render: (row) => row.tanggal },
  { key: "orderId", label: "Order ID", render: (row) => row.orderId },
  { key: "resi", label: "Nomor Resi", render: (row) => row.noResi },
  { key: "customer", label: "Customer", render: (row) => row.customer },
  { key: "ekspedisi", label: "Ekspedisi", render: (row) => row.ekspedisi },
  { key: "alasan", label: "Alasan", render: (row) => row.alasan },
  { key: "followUp", label: "Status Follow-up", render: (row) => <StatusPill label={row.statusFollowUp} tone={followUpTone[row.statusFollowUp]} /> },
];

export default function ReturGagalKirimPage() {
  const { returGagal } = getTrackingPreviewData();
  return (
    <ModuleDetailShell parentHref="/data-tracking" parentLabel="Kembali ke Data Tracking">
      <DummyDataBanner />
      <ModuleDetailHeader
        eyebrow="DATA TRACKING — RETUR & GAGAL KIRIM"
        title="Retur & Gagal Kirim"
        description="Lihat daftar paket retur, gagal kirim, alasan retur, dan follow-up CS."
      />
      <DataPanel title="Retur & Gagal Kirim" subtitle="Alasan dan status follow-up CS.">
        <ModulePreviewActions initialRows={returGagal} importLabel="Import Retur" addManualLabel="Tambah Retur Manual" importTitle="Import Retur" importColumns={["Tanggal", "Order ID", "Resi", "Customer", "Ekspedisi", "Alasan", "Status Follow-up"]} manualTitle="Tambah Retur Manual" manualFields={[{ key: "orderId", label: "Order ID" }, { key: "noResi", label: "Nomor Resi" }, { key: "customer", label: "Customer" }, { key: "alasan", label: "Alasan" }]} createImportedRow={() => ({ tanggal: new Date().toISOString().slice(0, 10), orderId: "ORD-PREVIEW", noResi: "RESI-PREVIEW", customer: "Customer Preview", ekspedisi: "Ekspedisi Preview", alasan: "Perlu dicek", statusFollowUp: "Perlu Follow-up" as const })} createManualRow={(v) => ({ tanggal: new Date().toISOString().slice(0, 10), orderId: v.orderId || "ORD-PREVIEW", noResi: v.noResi || "RESI-PREVIEW", customer: v.customer || "Customer Preview", ekspedisi: "Ekspedisi Preview", alasan: v.alasan || "Perlu dicek", statusFollowUp: "Perlu Follow-up" as const })}>{(rows) => <PreviewDataTable columns={columns} rows={rows} rowKey={(row) => `${row.tanggal}-${row.orderId}`} />}</ModulePreviewActions>
      </DataPanel>
    </ModuleDetailShell>
  );
}
