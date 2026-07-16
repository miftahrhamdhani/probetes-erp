"use client";

import { ModuleDetailShell } from "@/components/module-center/ModuleDetailShell";
import { ModulePreviewActions } from "@/components/module-center/ModulePreviewActions"
import { ModuleDetailHeader } from "@/components/module-center/ModuleDetailHeader";
import { DummyDataBanner } from "@/components/module-center/DummyDataBanner";
import { DataPanel } from "@/components/module-center/DataPanel";
import { PreviewDataTable, type PreviewColumn } from "@/components/module-center/PreviewDataTable";
import { StatusPill, type StatusPillTone } from "@/components/module-center/StatusPill";
import { getWarehousePreviewData, type BarangKeluarRow } from "@/features/warehouse/lib/temporaryWarehouseMockData";

const statusTone: Record<BarangKeluarRow["status"], StatusPillTone> = {
  Terkirim: "green",
  Diproses: "blue",
};

const columns: PreviewColumn<BarangKeluarRow>[] = [
  { key: "tanggal", label: "Tanggal", render: (r) => r.tanggal },
  { key: "order", label: "Order / Ref", render: (r) => r.orderRef },
  { key: "produk", label: "Produk", render: (r) => r.produk },
  { key: "sku", label: "SKU", render: (r) => r.sku },
  { key: "gudang", label: "Gudang", render: (r) => r.gudang },
  { key: "qty", label: "Qty Keluar", align: "right", render: (r) => r.qtyKeluar.toLocaleString("id-ID") },
  { key: "status", label: "Status", render: (r) => <StatusPill label={r.status} tone={statusTone[r.status]} /> },
];

export default function BarangKeluarPage() {
  const { barangKeluar } = getWarehousePreviewData();
  return (
    <ModuleDetailShell parentHref="/warehouse" parentLabel="Kembali ke Warehouse">
      <DummyDataBanner />
      <ModuleDetailHeader eyebrow="WAREHOUSE — BARANG KELUAR" title="Barang Keluar" description="Catat pengiriman barang keluar gudang untuk order." />
      <DataPanel title="Barang Keluar" subtitle="Riwayat pengeluaran barang untuk order.">
        <ModulePreviewActions initialRows={barangKeluar} importLabel="Import Barang Keluar" addManualLabel="Tambah Barang Keluar" importTitle="Import Barang Keluar" importColumns={["Tanggal", "Order / Ref", "Produk", "SKU", "Gudang", "Qty Keluar"]} manualTitle="Tambah Barang Keluar" manualFields={[{ key: "orderRef", label: "Order / Ref" }, { key: "produk", label: "Produk" }, { key: "qtyKeluar", label: "Qty Keluar", type: "number" }]} createImportedRow={() => ({ tanggal: new Date().toISOString().slice(0, 10), orderRef: "ORD-PREVIEW", produk: "Produk Preview", sku: "-", gudang: "Gudang Jakarta" as const, qtyKeluar: 0, status: "Diproses" as const })} createManualRow={(v) => ({ tanggal: new Date().toISOString().slice(0, 10), orderRef: v.orderRef || "ORD-PREVIEW", produk: v.produk || "Produk Preview", sku: "-", gudang: "Gudang Jakarta" as const, qtyKeluar: Number(v.qtyKeluar) || 0, status: "Diproses" as const })}>{(rows) => <PreviewDataTable columns={columns} rows={rows} rowKey={(r) => `${r.tanggal}-${r.orderRef}`} />}</ModulePreviewActions>
      </DataPanel>
    </ModuleDetailShell>
  );
}
