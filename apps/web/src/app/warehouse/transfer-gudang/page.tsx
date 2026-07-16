"use client";

import { ModuleDetailShell } from "@/components/module-center/ModuleDetailShell";
import { ModulePreviewActions } from "@/components/module-center/ModulePreviewActions";
import { ModuleDetailHeader } from "@/components/module-center/ModuleDetailHeader";
import { DummyDataBanner } from "@/components/module-center/DummyDataBanner";
import { DataPanel } from "@/components/module-center/DataPanel";
import { PreviewDataTable, type PreviewColumn } from "@/components/module-center/PreviewDataTable";
import { StatusPill, type StatusPillTone } from "@/components/module-center/StatusPill";
import { getWarehousePreviewData, type TransferGudangRow } from "@/features/warehouse/lib/temporaryWarehouseMockData";

const statusTone: Record<TransferGudangRow["status"], StatusPillTone> = {
  Selesai: "green",
  "Dalam Perjalanan": "blue",
};

const columns: PreviewColumn<TransferGudangRow>[] = [
  { key: "tanggal", label: "Tanggal", render: (r) => r.tanggal },
  { key: "produk", label: "Produk", render: (r) => r.produk },
  { key: "dari", label: "Dari Gudang", render: (r) => r.dariGudang },
  { key: "ke", label: "Ke Gudang", render: (r) => r.keGudang },
  { key: "qty", label: "Qty", align: "right", render: (r) => r.qty.toLocaleString("id-ID") },
  { key: "status", label: "Status", render: (r) => <StatusPill label={r.status} tone={statusTone[r.status]} /> },
];

export default function TransferGudangPage() {
  const { transferGudang } = getWarehousePreviewData();
  return (
    <ModuleDetailShell parentHref="/warehouse" parentLabel="Kembali ke Warehouse">
      <DummyDataBanner />
      <ModuleDetailHeader eyebrow="WAREHOUSE — TRANSFER GUDANG" title="Transfer Gudang" description="Riwayat perpindahan stok antar gudang." />
      <DataPanel title="Transfer Gudang" subtitle="Perpindahan stok Jakarta ↔ Makassar.">
        <ModulePreviewActions initialRows={transferGudang} addManualLabel="Tambah Transfer" manualTitle="Tambah Transfer" manualFields={[{ key: "produk", label: "Produk" }, { key: "qty", label: "Qty", type: "number" }]} createManualRow={(v) => ({ tanggal: new Date().toISOString().slice(0, 10), produk: v.produk || "Produk Preview", dariGudang: "Gudang Jakarta" as const, keGudang: "Gudang Makassar" as const, qty: Number(v.qty) || 0, status: "Dalam Perjalanan" as const })}>{(rows) => <PreviewDataTable columns={columns} rows={rows} rowKey={(r) => `${r.tanggal}-${r.produk}`} />}</ModulePreviewActions>
      </DataPanel>
    </ModuleDetailShell>
  );
}
