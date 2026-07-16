"use client";

import { ModuleDetailShell } from "@/components/module-center/ModuleDetailShell";
import { ModulePreviewActions } from "@/components/module-center/ModulePreviewActions";
import { ModuleDetailHeader } from "@/components/module-center/ModuleDetailHeader";
import { DummyDataBanner } from "@/components/module-center/DummyDataBanner";
import { DataPanel } from "@/components/module-center/DataPanel";
import { PreviewDataTable, type PreviewColumn } from "@/components/module-center/PreviewDataTable";
import { getWarehousePreviewData, type BarangMasukRow } from "@/features/warehouse/lib/temporaryWarehouseMockData";

const columns: PreviewColumn<BarangMasukRow>[] = [
  { key: "tanggal", label: "Tanggal", render: (r) => r.tanggal },
  { key: "ref", label: "Ref", render: (r) => r.ref },
  { key: "supplier", label: "Supplier / Produksi", render: (r) => r.supplierProduksi },
  { key: "produk", label: "Produk", render: (r) => r.produk },
  { key: "sku", label: "SKU", render: (r) => r.sku },
  { key: "gudang", label: "Gudang", render: (r) => r.gudang },
  { key: "qty", label: "Qty Masuk", align: "right", render: (r) => r.qtyMasuk.toLocaleString("id-ID") },
  { key: "penerima", label: "Penerima", render: (r) => r.penerima },
];

export default function BarangMasukPage() {
  const { barangMasuk } = getWarehousePreviewData();
  return (
    <ModuleDetailShell parentHref="/warehouse" parentLabel="Kembali ke Warehouse">
      <DummyDataBanner />
      <ModuleDetailHeader eyebrow="WAREHOUSE — BARANG MASUK" title="Barang Masuk" description="Catat penerimaan barang dari produksi atau supplier." />
      <DataPanel title="Barang Masuk" subtitle="Riwayat penerimaan barang.">
        <ModulePreviewActions initialRows={barangMasuk} importLabel="Import Barang Masuk" addManualLabel="Tambah Barang Masuk" importTitle="Import Barang Masuk" importColumns={["Tanggal", "Ref", "Supplier / Produksi", "Produk", "SKU", "Gudang", "Qty Masuk"]} manualTitle="Tambah Barang Masuk" manualFields={[{ key: "ref", label: "Ref" }, { key: "supplierProduksi", label: "Supplier / Produksi" }, { key: "produk", label: "Produk" }, { key: "qtyMasuk", label: "Qty Masuk", type: "number" }]} createImportedRow={() => ({ tanggal: new Date().toISOString().slice(0, 10), ref: "IN-PREVIEW", supplierProduksi: "Supplier Preview", produk: "Produk Preview", sku: "-", gudang: "Gudang Jakarta" as const, qtyMasuk: 0, penerima: "Penerima Preview" })} createManualRow={(v) => ({ tanggal: new Date().toISOString().slice(0, 10), ref: v.ref || "IN-PREVIEW", supplierProduksi: v.supplierProduksi || "Supplier Preview", produk: v.produk || "Produk Preview", sku: "-", gudang: "Gudang Jakarta" as const, qtyMasuk: Number(v.qtyMasuk) || 0, penerima: "Penerima Preview" })}>{(rows) => <PreviewDataTable columns={columns} rows={rows} rowKey={(r) => r.ref} />}</ModulePreviewActions>
      </DataPanel>
    </ModuleDetailShell>
  );
}
