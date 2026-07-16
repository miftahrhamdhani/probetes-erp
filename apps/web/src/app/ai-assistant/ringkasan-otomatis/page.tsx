import { ModuleDetailShell } from "@/components/module-center/ModuleDetailShell";
import { ModuleDetailHeader } from "@/components/module-center/ModuleDetailHeader";
import { DummyDataBanner } from "@/components/module-center/DummyDataBanner";
import { DataPanel } from "@/components/module-center/DataPanel";
import { PreviewDataTable, type PreviewColumn } from "@/components/module-center/PreviewDataTable";
import { StatusPill, type StatusPillTone } from "@/components/module-center/StatusPill";
import { getAiAssistantPreviewData, type AutoSummaryRow, type InsightStatus } from "@/features/ai-assistant/lib/temporaryAiMockData";

const statusTone: Record<InsightStatus, StatusPillTone> = {
  "Siap Dilihat": "green",
  "Perlu Ditindaklanjuti": "amber",
  Draft: "slate",
};

const columns: PreviewColumn<AutoSummaryRow>[] = [
  { key: "tanggal", label: "Tanggal", render: (r) => r.tanggal },
  { key: "modul", label: "Modul", render: (r) => r.modul },
  { key: "ringkasan", label: "Ringkasan", render: (r) => r.ringkasan },
  { key: "status", label: "Status", render: (r) => <StatusPill label={r.status} tone={statusTone[r.status]} /> },
];

export default function RingkasanOtomatisPage() {
  const { autoSummaries } = getAiAssistantPreviewData();
  return (
    <ModuleDetailShell parentHref="/ai-assistant" parentLabel="Kembali ke AI Assistant">
      <DummyDataBanner />
      <ModuleDetailHeader eyebrow="AI ASSISTANT — RINGKASAN OTOMATIS" title="Ringkasan Otomatis" description="Ringkasan harian/mingguan lintas modul." />
      <DataPanel title="Ringkasan Otomatis" subtitle="Ringkasan terbaru, terbaru di atas.">
        <PreviewDataTable columns={columns} rows={autoSummaries} rowKey={(r) => `${r.tanggal}-${r.modul}`} />
      </DataPanel>
    </ModuleDetailShell>
  );
}
