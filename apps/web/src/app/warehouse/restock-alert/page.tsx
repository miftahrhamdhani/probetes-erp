import { ModuleDetailShell } from "@/components/module-center/ModuleDetailShell";
import { ModuleDetailHeader } from "@/components/module-center/ModuleDetailHeader";
import { DummyDataBanner } from "@/components/module-center/DummyDataBanner";
import { DataPanel } from "@/components/module-center/DataPanel";
import { PreviewDataTable, type PreviewColumn } from "@/components/module-center/PreviewDataTable";
import { getWarehousePreviewData, type RestockAlertRow } from "@/features/warehouse/lib/temporaryWarehouseMockData";

const columns: PreviewColumn<RestockAlertRow>[] = [
  { key: "produk", label: "Produk", render: (r) => r.produk },
  { key: "gudang", label: "Gudang", render: (r) => r.gudang },
  { key: "tersedia", label: "Stok Tersedia", align: "right", render: (r) => r.stokTersedia.toLocaleString("id-ID") },
  { key: "reorder", label: "Reorder Point", align: "right", render: (r) => r.reorderPoint.toLocaleString("id-ID") },
  { key: "rekomendasi", label: "Rekomendasi Restock", render: (r) => r.rekomendasi },
];

export default function RestockAlertPage() {
  const { restockAlert } = getWarehousePreviewData();
  return (
    <ModuleDetailShell parentHref="/warehouse" parentLabel="Kembali ke Warehouse">
      <DummyDataBanner />
      <ModuleDetailHeader eyebrow="WAREHOUSE — RESTOCK ALERT" title="Restock Alert" description="Produk yang stoknya di bawah atau mendekati reorder point." />
      <DataPanel title="Restock Alert" subtitle="Rekomendasi restock per produk & gudang.">
        <PreviewDataTable columns={columns} rows={restockAlert} rowKey={(r) => `${r.produk}-${r.gudang}`} />
      </DataPanel>
    </ModuleDetailShell>
  );
}
