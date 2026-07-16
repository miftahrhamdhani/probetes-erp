import { ModuleDetailShell } from "@/components/module-center/ModuleDetailShell";
import { ModuleDetailHeader } from "@/components/module-center/ModuleDetailHeader";
import { DummyDataBanner } from "@/components/module-center/DummyDataBanner";
import { DataPanel } from "@/components/module-center/DataPanel";
import { PreviewDataTable, type PreviewColumn } from "@/components/module-center/PreviewDataTable";
import { StatusPill, type StatusPillTone } from "@/components/module-center/StatusPill";
import { getWarehousePreviewData, type StockOpnameRow, type StockStatus } from "@/features/warehouse/lib/temporaryWarehouseMockData";

const statusTone: Record<StockStatus, StatusPillTone> = {
  Aman: "green",
  "Stok Kritis": "red",
  "Perlu Opname": "amber",
  "Perlu Mapping SKU": "purple",
  Retur: "slate",
};

const columns: PreviewColumn<StockOpnameRow>[] = [
  { key: "tanggal", label: "Tanggal", render: (r) => r.tanggal },
  { key: "produk", label: "Produk", render: (r) => r.produk },
  { key: "sistem", label: "Stok Sistem", align: "right", render: (r) => r.stokSistem.toLocaleString("id-ID") },
  { key: "fisik", label: "Stok Fisik", align: "right", render: (r) => r.stokFisik.toLocaleString("id-ID") },
  { key: "selisih", label: "Selisih", align: "right", render: (r) => r.selisih.toLocaleString("id-ID") },
  { key: "status", label: "Status", render: (r) => <StatusPill label={r.status} tone={statusTone[r.status]} /> },
];

export default function StockOpnamePage() {
  const { stockOpname } = getWarehousePreviewData();
  return (
    <ModuleDetailShell parentHref="/warehouse" parentLabel="Kembali ke Warehouse">
      <DummyDataBanner />
      <ModuleDetailHeader eyebrow="WAREHOUSE — STOCK OPNAME" title="Stock Opname" description="Bandingkan stok sistem dengan stok fisik gudang." />
      <DataPanel title="Stock Opname" subtitle="Selisih stok sistem vs fisik.">
        <PreviewDataTable columns={columns} rows={stockOpname} rowKey={(r) => `${r.tanggal}-${r.produk}`} />
      </DataPanel>
    </ModuleDetailShell>
  );
}
