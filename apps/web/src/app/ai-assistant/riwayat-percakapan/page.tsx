import { ModuleDetailShell } from "@/components/module-center/ModuleDetailShell";
import { ModuleDetailHeader } from "@/components/module-center/ModuleDetailHeader";
import { DummyDataBanner } from "@/components/module-center/DummyDataBanner";
import { DataPanel } from "@/components/module-center/DataPanel";
import { PreviewDataTable, type PreviewColumn } from "@/components/module-center/PreviewDataTable";
import { StatusPill, type StatusPillTone } from "@/components/module-center/StatusPill";
import { getAiAssistantPreviewData, type ConversationRow } from "@/features/ai-assistant/lib/temporaryAiMockData";

const statusTone: Record<ConversationRow["status"], StatusPillTone> = {
  Terjawab: "green",
  "Perlu Data Tambahan": "amber",
};

const columns: PreviewColumn<ConversationRow>[] = [
  { key: "tanggal", label: "Tanggal", render: (r) => r.tanggal },
  { key: "user", label: "User", render: (r) => r.user },
  { key: "pertanyaan", label: "Pertanyaan", render: (r) => r.pertanyaan },
  { key: "sumber", label: "Sumber Data", render: (r) => r.sumberData },
  { key: "status", label: "Status", render: (r) => <StatusPill label={r.status} tone={statusTone[r.status]} /> },
];

export default function RiwayatPercakapanPage() {
  const { conversations } = getAiAssistantPreviewData();
  return (
    <ModuleDetailShell parentHref="/ai-assistant" parentLabel="Kembali ke AI Assistant">
      <DummyDataBanner />
      <ModuleDetailHeader eyebrow="AI ASSISTANT — RIWAYAT PERCAKAPAN" title="Riwayat Percakapan" description="Lihat kembali percakapan yang pernah ditanyakan." />
      <DataPanel title="Riwayat Percakapan" subtitle="Percakapan terbaru, terbaru di atas.">
        <PreviewDataTable columns={columns} rows={conversations} rowKey={(r) => `${r.tanggal}-${r.user}-${r.pertanyaan}`} />
      </DataPanel>
    </ModuleDetailShell>
  );
}
