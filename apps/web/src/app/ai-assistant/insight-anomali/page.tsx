import { ModuleDetailShell } from "@/components/module-center/ModuleDetailShell";
import { ModuleDetailHeader } from "@/components/module-center/ModuleDetailHeader";
import { DummyDataBanner } from "@/components/module-center/DummyDataBanner";
import { DataPanel } from "@/components/module-center/DataPanel";
import { PreviewDataTable, type PreviewColumn } from "@/components/module-center/PreviewDataTable";
import { StatusPill, type StatusPillTone } from "@/components/module-center/StatusPill";
import { getAiAssistantPreviewData, type AnomalyRow, type RiskLevel } from "@/features/ai-assistant/lib/temporaryAiMockData";

const riskTone: Record<RiskLevel, StatusPillTone> = {
  Rendah: "green",
  Sedang: "amber",
  Tinggi: "red",
};

const columns: PreviewColumn<AnomalyRow>[] = [
  { key: "tanggal", label: "Tanggal", render: (r) => r.tanggal },
  { key: "modul", label: "Modul", render: (r) => r.modul },
  { key: "insight", label: "Insight", render: (r) => r.insight },
  { key: "risiko", label: "Tingkat Risiko", render: (r) => <StatusPill label={r.tingkatRisiko} tone={riskTone[r.tingkatRisiko]} /> },
  { key: "rekomendasi", label: "Rekomendasi", render: (r) => r.rekomendasi },
];

export default function InsightAnomaliPage() {
  const { anomalies } = getAiAssistantPreviewData();
  return (
    <ModuleDetailShell parentHref="/ai-assistant" parentLabel="Kembali ke AI Assistant">
      <DummyDataBanner />
      <ModuleDetailHeader eyebrow="AI ASSISTANT — INSIGHT & ANOMALI" title="Insight & Anomali" description="Temukan pola dan anomali dari data transaksi." />
      <DataPanel title="Insight & Anomali" subtitle="Anomali terbaru, terbaru di atas.">
        <PreviewDataTable columns={columns} rows={anomalies} rowKey={(r) => `${r.tanggal}-${r.modul}`} />
      </DataPanel>
    </ModuleDetailShell>
  );
}
