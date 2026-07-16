import { ModuleDetailShell } from "@/components/module-center/ModuleDetailShell";
import { ModuleDetailHeader } from "@/components/module-center/ModuleDetailHeader";
import { DummyDataBanner } from "@/components/module-center/DummyDataBanner";
import { DataPanel } from "@/components/module-center/DataPanel";
import { PreviewDataTable, type PreviewColumn } from "@/components/module-center/PreviewDataTable";
import { StatusPill, type StatusPillTone } from "@/components/module-center/StatusPill";
import { getWarehousePreviewData, type ReturGudangRow } from "@/features/warehouse/lib/temporaryWarehouseMockData";

const statusTone: Record<ReturGudangRow["status"], StatusPillTone> = {
  Diterima: "green",
  Diproses: "amber",
};

const columns: PreviewColumn<ReturGudangRow>[] = [
  { key: "tanggal", label: "Tanggal", render: (r) => r.tanggal },
  { key: "order", label: "Order / Ref", render: (r) => r.orderRef },
  { key: "produk", label: "Produk", render: (r) => r.produk },
  { key: "gudang", label: "Gudang", render: (r) => r.gudang },
  { key: "qty", label: "Qty Retur", align: "right", render: (r) => r.qtyRetur.toLocaleString("id-ID") },
  { key: "alasan", label: "Alasan", render: (r) => r.alasan },
  { key: "status", label: "Status", render: (r) => <StatusPill label={r.status} tone={statusTone[r.status]} /> },
];

export default function ReturGudangPage() {
  const { returGudang } = getWarehousePreviewData();
  return (
    <ModuleDetailShell parentHref="/warehouse" parentLabel="Kembali ke Warehouse">
      <DummyDataBanner />
      <ModuleDetailHeader eyebrow="WAREHOUSE — RETUR GUDANG" title="Retur Gudang" description="Kelola barang retur yang kembali ke gudang." />
      <DataPanel title="Retur Gudang" subtitle="Alasan dan status retur.">
        <PreviewDataTable columns={columns} rows={returGudang} rowKey={(r) => `${r.tanggal}-${r.orderRef}`} />
      </DataPanel>
    </ModuleDetailShell>
  );
}
