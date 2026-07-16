import { ModuleDetailShell } from "@/components/module-center/ModuleDetailShell";
import { ModuleDetailHeader } from "@/components/module-center/ModuleDetailHeader";
import { DummyDataBanner } from "@/components/module-center/DummyDataBanner";
import { DataPanel } from "@/components/module-center/DataPanel";
import { PreviewKpiCard } from "@/components/module-center/PreviewKpiCard";
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
  { key: "status", label: "Status", render: (r) => <StatusPill label={r.status} tone={statusTone[r.status]} /> },
];

export default function WarehouseDashboardPage() {
  const { kpi, stokBarang } = getWarehousePreviewData();
  return (
    <ModuleDetailShell parentHref="/warehouse" parentLabel="Kembali ke Warehouse">
      <DummyDataBanner />
      <ModuleDetailHeader eyebrow="WAREHOUSE — DASHBOARD STOK" title="Dashboard Stok" description="KPI stok, stok kritis, restock, dan mapping SKU." />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {kpi.map((item) => <PreviewKpiCard key={item.label} item={item} />)}
      </div>
      <DataPanel title="Ringkasan Stok" subtitle="Snapshot stok terbaru per gudang.">
        <PreviewDataTable columns={columns} rows={stokBarang} rowKey={(r) => `${r.tanggal}-${r.sku}-${r.gudang}`} />
      </DataPanel>
    </ModuleDetailShell>
  );
}
