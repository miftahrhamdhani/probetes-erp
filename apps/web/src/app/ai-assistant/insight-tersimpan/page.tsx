import { ModuleDetailShell } from "@/components/module-center/ModuleDetailShell";
import { ModuleDetailHeader } from "@/components/module-center/ModuleDetailHeader";
import { DummyDataBanner } from "@/components/module-center/DummyDataBanner";
import { DataPanel } from "@/components/module-center/DataPanel";
import { PreviewDataTable, type PreviewColumn } from "@/components/module-center/PreviewDataTable";
import { StatusPill, type StatusPillTone } from "@/components/module-center/StatusPill";
import { getAiAssistantPreviewData, type InsightStatus, type SavedInsightRow } from "@/features/ai-assistant/lib/temporaryAiMockData";

const statusTone: Record<InsightStatus, StatusPillTone> = {
  "Siap Dilihat": "green",
  "Perlu Ditindaklanjuti": "amber",
  Draft: "slate",
};

const columns: PreviewColumn<SavedInsightRow>[] = [
  { key: "tanggal", label: "Tanggal", render: (r) => r.tanggal },
  { key: "judul", label: "Judul Insight", render: (r) => r.judulInsight },
  { key: "modul", label: "Modul", render: (r) => r.modul },
  { key: "disimpan", label: "Disimpan Oleh", render: (r) => r.disimpanOleh },
  { key: "status", label: "Status", render: (r) => <StatusPill label={r.status} tone={statusTone[r.status]} /> },
];

export default function InsightTersimpanPage() {
  const { savedInsights } = getAiAssistantPreviewData();
  return (
    <ModuleDetailShell parentHref="/ai-assistant" parentLabel="Kembali ke AI Assistant">
      <DummyDataBanner />
      <ModuleDetailHeader eyebrow="AI ASSISTANT — INSIGHT TERSIMPAN" title="Insight Tersimpan" description="Insight yang sudah disimpan untuk ditindaklanjuti." />
      <DataPanel title="Insight Tersimpan" subtitle="Insight tersimpan, terbaru di atas.">
        <PreviewDataTable columns={columns} rows={savedInsights} rowKey={(r) => `${r.tanggal}-${r.judulInsight}`} />
      </DataPanel>
    </ModuleDetailShell>
  );
}
