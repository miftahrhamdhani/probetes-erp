"use client";

import { ModuleDetailShell } from "@/components/module-center/ModuleDetailShell";
import { ModulePreviewActions } from "@/components/module-center/ModulePreviewActions";
import { ModuleDetailHeader } from "@/components/module-center/ModuleDetailHeader";
import { DummyDataBanner } from "@/components/module-center/DummyDataBanner";
import { DataPanel } from "@/components/module-center/DataPanel";
import { PreviewDataTable, type PreviewColumn } from "@/components/module-center/PreviewDataTable";
import { StatusPill, type StatusPillTone } from "@/components/module-center/StatusPill";
import { formatRupiah } from "@/components/module-center/format";
import { getTrackingPreviewData, type CodPembayaranRow } from "@/features/data-tracking/lib/temporaryTrackingMockData";

const statusTone: Record<CodPembayaranRow["status"], StatusPillTone> = {
  "COD Belum Cair": "amber",
  "COD Sudah Cair": "green",
  "Non-COD": "slate",
};

const columns: PreviewColumn<CodPembayaranRow>[] = [
  { key: "tanggal", label: "Tanggal", render: (row) => row.tanggal },
  { key: "orderId", label: "Order ID", render: (row) => row.orderId },
  { key: "customer", label: "Customer", render: (row) => row.customer },
  { key: "nominal", label: "Nominal COD", align: "right", render: (row) => formatRupiah(row.nominalCod) },
  { key: "ongkir", label: "Ongkir", align: "right", render: (row) => formatRupiah(row.ongkir) },
  { key: "fee", label: "Fee COD", align: "right", render: (row) => formatRupiah(row.feeCod) },
  { key: "cair", label: "Tanggal Cair", render: (row) => row.tanggalCair ?? "-" },
  { key: "status", label: "Status", render: (row) => <StatusPill label={row.status} tone={statusTone[row.status]} /> },
];

export default function CodPembayaranPage() {
  const { codPembayaran } = getTrackingPreviewData();
  return (
    <ModuleDetailShell parentHref="/data-tracking" parentLabel="Kembali ke Data Tracking">
      <DummyDataBanner />
      <ModuleDetailHeader
        eyebrow="DATA TRACKING — COD & PEMBAYARAN"
        title="COD & Pembayaran"
        description="Pantau COD belum cair, COD sudah cair, non-COD, ongkir, fee COD, dan status pembayaran."
      />
      <DataPanel title="COD & Pembayaran" subtitle="Nominal COD, ongkir, fee, dan status cair.">
        <ModulePreviewActions initialRows={codPembayaran} importLabel="Import COD Cair" addManualLabel="Tambah Pembayaran Manual" importTitle="Import COD Cair" importColumns={["Tanggal", "Order ID", "Customer", "Nominal COD", "Ongkir", "Fee COD", "Tanggal Cair"]} manualTitle="Tambah Pembayaran Manual" manualFields={[{ key: "orderId", label: "Order ID" }, { key: "customer", label: "Customer" }, { key: "nominalCod", label: "Nominal COD", type: "number" }, { key: "ongkir", label: "Ongkir", type: "number" }]} createImportedRow={() => ({ tanggal: new Date().toISOString().slice(0, 10), orderId: "ORD-PREVIEW", customer: "Customer Preview", nominalCod: 0, ongkir: 0, feeCod: 0, tanggalCair: null, status: "COD Belum Cair" as const })} createManualRow={(v) => ({ tanggal: new Date().toISOString().slice(0, 10), orderId: v.orderId || "ORD-PREVIEW", customer: v.customer || "Customer Preview", nominalCod: Number(v.nominalCod) || 0, ongkir: Number(v.ongkir) || 0, feeCod: 0, tanggalCair: null, status: "COD Belum Cair" as const })}>{(rows) => <PreviewDataTable columns={columns} rows={rows} rowKey={(row) => `${row.tanggal}-${row.orderId}`} />}</ModulePreviewActions>
      </DataPanel>
    </ModuleDetailShell>
  );
}
