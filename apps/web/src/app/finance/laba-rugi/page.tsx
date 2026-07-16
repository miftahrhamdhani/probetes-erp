import { ModuleDetailShell } from "@/components/module-center/ModuleDetailShell";
import { ModuleDetailHeader } from "@/components/module-center/ModuleDetailHeader";
import { DummyDataBanner } from "@/components/module-center/DummyDataBanner";
import { DataPanel } from "@/components/module-center/DataPanel";
import { PreviewDataTable, type PreviewColumn } from "@/components/module-center/PreviewDataTable";
import { formatRupiah } from "@/components/module-center/format";
import { getFinancePreviewData, type LabaRugiRow } from "@/features/finance/lib/temporaryFinanceMockData";

const columns: PreviewColumn<LabaRugiRow>[] = [
  { key: "periode", label: "Periode", render: (r) => r.periode },
  { key: "pemasukan", label: "Pemasukan", align: "right", render: (r) => formatRupiah(r.pemasukan) },
  { key: "pengeluaran", label: "Pengeluaran", align: "right", render: (r) => formatRupiah(r.pengeluaran) },
  { key: "hpp", label: "HPP", align: "right", render: (r) => formatRupiah(r.hpp) },
  { key: "labaKotor", label: "Laba Kotor", align: "right", render: (r) => formatRupiah(r.labaKotor) },
  { key: "labaBersih", label: "Laba Bersih", align: "right", render: (r) => formatRupiah(r.labaBersih) },
];

export default function LabaRugiPage() {
  const { labaRugi } = getFinancePreviewData();
  return (
    <ModuleDetailShell parentHref="/finance" parentLabel="Kembali ke Finance">
      <DummyDataBanner />
      <ModuleDetailHeader eyebrow="FINANCE — LABA RUGI" title="Laba Rugi" description="Periode, pemasukan, pengeluaran, HPP, laba kotor, laba bersih." />
      <DataPanel title="Laba Rugi" subtitle="Ringkasan per periode, terbaru di atas.">
        <PreviewDataTable columns={columns} rows={labaRugi} rowKey={(r) => r.periode} />
      </DataPanel>
    </ModuleDetailShell>
  );
}
