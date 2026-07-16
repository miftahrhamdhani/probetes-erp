import { Bot, Send } from "lucide-react";
import { ModuleDetailShell } from "@/components/module-center/ModuleDetailShell";
import { ModuleDetailHeader } from "@/components/module-center/ModuleDetailHeader";
import { DummyDataBanner } from "@/components/module-center/DummyDataBanner";
import { DataPanel } from "@/components/module-center/DataPanel";
import { getAiAssistantPreviewData } from "@/features/ai-assistant/lib/temporaryAiMockData";

export default function TanyaDataPage() {
  const { sampleQuestions } = getAiAssistantPreviewData();
  return (
    <ModuleDetailShell parentHref="/ai-assistant" parentLabel="Kembali ke AI Assistant">
      <DummyDataBanner />
      <ModuleDetailHeader
        eyebrow="AI ASSISTANT — TANYA DATA"
        title="Tanya Data ERP"
        description="Ajukan pertanyaan bahasa sehari-hari tentang data ERP. Jawaban selalu menyertakan sumber data."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
        <DataPanel title="Preview Percakapan" subtitle="Tampilan chat masih placeholder frontend, belum tersambung model AI.">
          <div className="flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-red/10 text-brand-red">
                <Bot className="size-5" strokeWidth={2} />
              </div>
              <div className="rounded-2xl rounded-tl-sm bg-slate-100 px-4 py-3 text-sm font-medium text-slate-700">
                Halo, saya AI Assistant Probetes ERP. Coba tanya soal sales, tracking, atau stok gudang.
              </div>
            </div>
            <div className="flex items-start justify-end gap-3">
              <div className="rounded-2xl rounded-tr-sm bg-brand-red px-4 py-3 text-sm font-medium text-white">
                {sampleQuestions[0]?.pertanyaan}
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-red/10 text-brand-red">
                <Bot className="size-5" strokeWidth={2} />
              </div>
              <div className="rounded-2xl rounded-tl-sm bg-slate-100 px-4 py-3 text-sm font-medium text-slate-700">
                Ini masih tampilan contoh. Jawaban asli akan diambil dari {sampleQuestions[0]?.sumberData} setelah backend AI Assistant tersedia.
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-2">
            <input
              disabled
              placeholder="Ketik pertanyaan tentang data ERP…"
              className="flex-1 rounded-xl border-none bg-transparent px-3 py-2 text-sm font-medium text-slate-500 outline-none placeholder:text-slate-400"
            />
            <button disabled type="button" className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-red/40 text-white">
              <Send className="size-4" strokeWidth={2.2} />
            </button>
          </div>
        </DataPanel>

        <DataPanel title="Contoh Pertanyaan" subtitle="Pertanyaan yang bisa dicoba nanti.">
          <ul className="flex flex-col gap-3">
            {sampleQuestions.map((q) => (
              <li key={q.pertanyaan} className="rounded-xl bg-slate-50 p-3">
                <p className="text-sm font-semibold text-slate-800">{q.pertanyaan}</p>
                <p className="mt-1 text-xs font-medium text-slate-500">Sumber: {q.sumberData}</p>
              </li>
            ))}
          </ul>
        </DataPanel>
      </div>
    </ModuleDetailShell>
  );
}
