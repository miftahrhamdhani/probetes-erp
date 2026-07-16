"use client";

import { ModuleDetailShell } from "@/components/module-center/ModuleDetailShell";
import { ModulePreviewActions } from "@/components/module-center/ModulePreviewActions";
import { ModuleDetailHeader } from "@/components/module-center/ModuleDetailHeader";
import { DummyDataBanner } from "@/components/module-center/DummyDataBanner";
import { DataPanel } from "@/components/module-center/DataPanel";
import { PreviewDataTable, type PreviewColumn } from "@/components/module-center/PreviewDataTable";
import { formatRupiah } from "@/components/module-center/format";
import { getFinancePreviewData, type HppMarginRow } from "@/features/finance/lib/temporaryFinanceMockData";

const columns: PreviewColumn<HppMarginRow>[] = [
  { key: "tanggal", label: "Tanggal", render: (r) => r.tanggal },
  { key: "produk", label: "Produk / Order", render: (r) => r.produkOrder },
  { key: "hpp", label: "HPP", align: "right", render: (r) => formatRupiah(r.hpp) },
  { key: "sales", label: "Sales", align: "right", render: (r) => formatRupiah(r.sales) },
  { key: "margin", label: "Margin", align: "right", render: (r) => formatRupiah(r.margin) },
  { key: "rate", label: "Margin Rate", align: "right", render: (r) => r.marginRate },
];

export default function HppMarginPage() {
  const { hppMargin } = getFinancePreviewData();
  return (
    <ModuleDetailShell parentHref="/finance" parentLabel="Kembali ke Finance">
      <DummyDataBanner />
      <ModuleDetailHeader eyebrow="FINANCE — HPP & MARGIN" title="HPP & Margin" description="Hitung HPP dan margin per produk/order." />
      <DataPanel title="HPP & Margin" subtitle="Margin per produk/order.">
        <ModulePreviewActions initialRows={hppMargin} importLabel="Import HPP" addManualLabel="Tambah HPP Produk" importTitle="Import HPP" importColumns={["Tanggal", "Produk / Order", "HPP", "Sales"]} manualTitle="Tambah HPP Produk" manualFields={[{ key: "produkOrder", label: "Produk / Order" }, { key: "hpp", label: "HPP", type: "number" }, { key: "sales", label: "Sales", type: "number" }]} createImportedRow={() => ({ tanggal: new Date().toISOString().slice(0, 10), produkOrder: "Produk Preview", hpp: 0, sales: 0, margin: 0, marginRate: "0%" })} createManualRow={(v) => { const hpp = Number(v.hpp) || 0; const sales = Number(v.sales) || 0; const margin = sales - hpp; return { tanggal: new Date().toISOString().slice(0, 10), produkOrder: v.produkOrder || "Produk Preview", hpp, sales, margin, marginRate: sales ? `${Math.round((margin / sales) * 100)}%` : "0%" }; }}>{(rows) => <PreviewDataTable columns={columns} rows={rows} rowKey={(r) => `${r.tanggal}-${r.produkOrder}`} />}</ModulePreviewActions>
      </DataPanel>
    </ModuleDetailShell>
  );
}
