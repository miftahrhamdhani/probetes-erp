"use client";

import { ModuleDetailShell } from "@/components/module-center/ModuleDetailShell";
import { ModulePreviewActions } from "@/components/module-center/ModulePreviewActions";
import { ModuleDetailHeader } from "@/components/module-center/ModuleDetailHeader";
import { DummyDataBanner } from "@/components/module-center/DummyDataBanner";
import { DataPanel } from "@/components/module-center/DataPanel";
import { PreviewDataTable, type PreviewColumn } from "@/components/module-center/PreviewDataTable";
import { StatusPill, type StatusPillTone } from "@/components/module-center/StatusPill";
import { getWarehousePreviewData, type StockStatus, type StokBarangRow } from "@/features/warehouse/lib/temporaryWarehouseMockData";

const statusTone: Record<StockStatus, StatusPillTone> = {
  Aman: "green",
  "Stok Kritis": "red",
  "Perlu Opname": "amber",
  "Perlu Mapping SKU": "purple",
  Retur: "slate",
};

const columns: PreviewColumn<StokBarangRow>[] = [
  { key: "tanggal", label: "Tanggal", render: (r) => r.tanggal },
  { key: "sku", label: "SKU", render: (r) => r.sku },
  { key: "produk", label: "Produk", render: (r) => r.produk },
  { key: "gudang", label: "Gudang", render: (r) => r.gudang },
  { key: "tersedia", label: "Stok Tersedia", align: "right", render: (r) => r.stokTersedia.toLocaleString("id-ID") },
  { key: "reserved", label: "Reserved", align: "right", render: (r) => r.reserved.toLocaleString("id-ID") },
  { key: "reorder", label: "Reorder Point", align: "right", render: (r) => r.reorderPoint.toLocaleString("id-ID") },
  { key: "status", label: "Status", render: (r) => <StatusPill label={r.status} tone={statusTone[r.status]} /> },
];

export default function StokBarangPage() {
  const { stokBarang } = getWarehousePreviewData();
  return (
    <ModuleDetailShell parentHref="/warehouse" parentLabel="Kembali ke Warehouse">
      <DummyDataBanner />
      <ModuleDetailHeader eyebrow="WAREHOUSE — STOK BARANG" title="Stok Barang" description="Stok tersedia, reserved, dan reorder point per gudang." />
      <DataPanel title="Stok Barang" subtitle="Detail stok per SKU & gudang.">
        <ModulePreviewActions initialRows={stokBarang} importLabel="Import Stok" addManualLabel="Tambah Stok Manual" importTitle="Import Stok" importColumns={["Tanggal", "SKU", "Produk", "Gudang", "Stok Tersedia", "Reserved", "Reorder Point"]} manualTitle="Tambah Stok Manual" manualFields={[{ key: "sku", label: "SKU" }, { key: "produk", label: "Produk" }, { key: "stokTersedia", label: "Stok Tersedia", type: "number" }, { key: "reorderPoint", label: "Reorder Point", type: "number" }]} createImportedRow={() => ({ tanggal: new Date().toISOString().slice(0, 10), sku: "SKU-PREVIEW", produk: "Produk Preview", gudang: "Gudang Jakarta" as const, stokTersedia: 0, reserved: 0, reorderPoint: 0, status: "Perlu Opname" as const })} createManualRow={(v) => ({ tanggal: new Date().toISOString().slice(0, 10), sku: v.sku || "SKU-PREVIEW", produk: v.produk || "Produk Preview", gudang: "Gudang Jakarta" as const, stokTersedia: Number(v.stokTersedia) || 0, reserved: 0, reorderPoint: Number(v.reorderPoint) || 0, status: "Perlu Opname" as const })}>{(rows) => <PreviewDataTable columns={columns} rows={rows} rowKey={(r) => `${r.tanggal}-${r.sku}-${r.gudang}`} />}</ModulePreviewActions>
      </DataPanel>
    </ModuleDetailShell>
  );
}
