"use client";

import { FormEvent, useMemo, useState } from "react";
import { Bot, History, Lightbulb, Plus, Send, Sparkles, X } from "lucide-react";
import { DataPanel } from "@/components/module-center/DataPanel";
import { DummyDataBanner } from "@/components/module-center/DummyDataBanner";
import { ModuleCenterShell } from "@/components/module-center/ModuleCenterShell";
import { PreviewKpiCard } from "@/components/module-center/PreviewKpiCard";
import { StatusPill } from "@/components/module-center/StatusPill";
import { getAiAssistantPreviewData } from "@/features/ai-assistant/lib/temporaryAiMockData";

interface Skill {
  name: string;
  description: string;
  prompt: string;
  kategori: string;
  output: string;
}
interface ChatMessage {
  role: "user" | "assistant";
  text: string;
}

const initialSkills: Skill[] = [
  { name: "Laporan Penjualan Hari Ini", description: "Order, omzet, produk terlaris, dan channel terbaik.", prompt: "Buat laporan penjualan hari ini.", kategori: "Sales", output: "Ringkasan + KPI + tabel" },
  { name: "Spending vs Sales", description: "Bandingkan spending iklan dengan sales dan ROAS.", prompt: "Bandingkan spending dan sales bulan ini.", kategori: "Marketing", output: "KPI + insight" },
  { name: "COD Pending", description: "Daftar COD yang belum cair dan umur pending.", prompt: "Tampilkan COD yang belum cair minggu ini.", kategori: "Tracking", output: "Tabel + rekomendasi" },
  { name: "Laporan Gudang Bulanan", description: "Stok, barang masuk, keluar, retur, dan opname.", prompt: "Buat laporan gudang bulan Juli.", kategori: "Warehouse", output: "Ringkasan + tabel" },
];

export default function AiAssistantPage() {
  const data = useMemo(() => getAiAssistantPreviewData(), []);
  const [skills, setSkills] = useState(initialSkills);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", text: "Halo, saya AI Assistant Probetes ERP. Pilih skill atau tulis pertanyaan tentang sales, tracking, finance, gudang, atau HRIS." },
    { role: "assistant", text: "Ini adalah jawaban preview frontend. Data asli belum tersambung ke backend." },
  ]);
  const [prompt, setPrompt] = useState("");
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [showSkillForm, setShowSkillForm] = useState(false);
  const [skillForm, setSkillForm] = useState<Skill>({ name: "", description: "", prompt: "", kategori: "Sales", output: "Ringkasan + KPI + tabel" });

  const sendPrompt = (value: string) => {
    const text = value.trim();
    if (!text) return;
    setMessages((current) => [
      ...current,
      { role: "user", text },
      { role: "assistant", text: "Preview jawaban: data terkait sedang disiapkan. Ringkasan, KPI, tabel, insight, dan sumber periode akan tampil setelah koneksi data ERP tersedia." },
    ]);
    setPrompt("");
  };

  const submitChat = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    sendPrompt(prompt);
  };

  const chooseSkill = (skill: Skill) => {
    setSelectedSkill(skill);
    setPrompt(skill.prompt);
    sendPrompt(skill.prompt);
  };

  const saveSkill = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!skillForm.name.trim() || !skillForm.prompt.trim()) return;
    setSkills((current) => [skillForm, ...current]);
    setShowSkillForm(false);
    setSkillForm({ name: "", description: "", prompt: "", kategori: "Sales", output: "Ringkasan + KPI + tabel" });
  };

  return (
    <ModuleCenterShell>
      <DummyDataBanner />
      <div className="flex flex-col gap-2">
        <span className="inline-flex w-fit rounded-md bg-brand-red/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-red">AI ASSISTANT ERP</span>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="mt-2 text-3xl font-black tracking-[-0.04em] text-slate-950">Tanya Data Probetes</h1>
            <p className="mt-2 max-w-2xl text-sm font-medium text-slate-600 sm:text-base">Chat internal untuk membaca ringkasan ERP, mencoba skill laporan, dan menemukan insight dari data preview.</p>
          </div>
          <button type="button" onClick={() => setShowSkillForm(true)} className="inline-flex items-center gap-2 rounded-xl bg-brand-red px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-[#d60511]"><Plus className="size-4" />Buat Skill</button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {data.kpi.map((item) => <PreviewKpiCard key={item.label} item={item} />)}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.5fr_1fr]">
        <DataPanel title="Percakapan ERP" subtitle="Jawaban hanya preview lokal, tidak dikirim ke server.">
          <div className="flex min-h-[280px] flex-col gap-3">
            {messages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={`flex items-start gap-3 ${message.role === "user" ? "justify-end" : ""}`}>
                {message.role === "assistant" && <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-red/10 text-brand-red"><Bot className="size-5" /></div>}
                <div className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm font-medium ${message.role === "user" ? "rounded-tr-sm bg-brand-red text-white" : "rounded-tl-sm bg-slate-100 text-slate-700"}`}>{message.text}</div>
              </div>
            ))}
          </div>
          <form onSubmit={submitChat} className="mt-4 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-2">
            <input value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder="Tulis pertanyaan tentang data ERP…" className="flex-1 rounded-xl border-none bg-transparent px-3 py-2 text-sm font-medium text-slate-700 outline-none placeholder:text-slate-400" />
            <button type="submit" className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-red text-white hover:bg-[#d60511]" aria-label="Kirim pertanyaan"><Send className="size-4" /></button>
          </form>
        </DataPanel>

        <DataPanel title="Skill Shortcut" subtitle="Klik skill untuk menjalankan prompt preview.">
          <div className="grid gap-3">
            {skills.map((skill) => (
              <button key={`${skill.name}-${skill.prompt}`} type="button" onClick={() => chooseSkill(skill)} className={`rounded-2xl border p-3 text-left transition hover:border-brand-red/40 hover:bg-brand-red/[0.03] ${selectedSkill?.name === skill.name ? "border-brand-red/50 bg-brand-red/[0.04]" : "border-slate-200"}`}>
                <div className="flex items-start gap-3"><div className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-red/10 text-brand-red"><Sparkles className="size-4" /></div><div><p className="text-sm font-bold text-slate-900">{skill.name}</p><p className="mt-1 text-xs font-medium leading-5 text-slate-500">{skill.description}</p><span className="mt-2 inline-flex rounded-full bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-600">{skill.kategori}</span></div></div>
              </button>
            ))}
          </div>
        </DataPanel>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <DataPanel title="Preview Laporan" subtitle="Format jawaban yang akan dihasilkan AI."><div className="space-y-3 text-sm"><div className="rounded-xl bg-slate-50 p-3"><p className="font-bold text-slate-800">Ringkasan Sales</p><p className="mt-1 font-medium text-slate-600">Sales hari ini naik 8% dibanding kemarin.</p></div><div className="grid grid-cols-3 gap-2"><div className="rounded-xl bg-emerald-50 p-2"><strong className="block text-emerald-700">128</strong><span className="text-xs font-semibold text-slate-500">Order</span></div><div className="rounded-xl bg-blue-50 p-2"><strong className="block text-blue-700">Rp42 Jt</strong><span className="text-xs font-semibold text-slate-500">Sales</span></div><div className="rounded-xl bg-amber-50 p-2"><strong className="block text-amber-700">TikTok</strong><span className="text-xs font-semibold text-slate-500">Terbaik</span></div></div><p className="text-xs font-semibold text-slate-500">Sumber: Reports preview · Periode: 10 Juli 2026</p></div></DataPanel>
        <DataPanel title="Riwayat Percakapan" subtitle="Pertanyaan terakhir (preview)."><div className="space-y-2">{data.conversations.map((row) => <button type="button" key={`${row.tanggal}-${row.pertanyaan}`} onClick={() => sendPrompt(row.pertanyaan)} className="flex w-full items-start gap-2 rounded-xl bg-slate-50 p-3 text-left hover:bg-slate-100"><History className="mt-0.5 size-4 shrink-0 text-brand-red" /><span><strong className="block text-sm text-slate-800">{row.pertanyaan}</strong><span className="mt-1 block text-xs font-medium text-slate-500">{row.tanggal} · {row.status}</span></span></button>)}</div></DataPanel>
        <DataPanel title="Insight Tersimpan" subtitle="Insight yang siap ditindaklanjuti."><div className="space-y-2">{data.savedInsights.map((row) => <button type="button" key={row.judulInsight} onClick={() => sendPrompt(row.judulInsight)} className="flex w-full items-start gap-2 rounded-xl bg-slate-50 p-3 text-left hover:bg-slate-100"><Lightbulb className="mt-0.5 size-4 shrink-0 text-amber-500" /><span><strong className="block text-sm text-slate-800">{row.judulInsight}</strong><span className="mt-1 block text-xs font-medium text-slate-500">{row.modul} · <StatusPill label={row.status} tone={row.status === "Siap Dilihat" ? "green" : "amber"} /></span></span></button>)}</div></DataPanel>
      </div>

      {showSkillForm && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-6"><form onSubmit={saveSkill} className="w-full max-w-2xl rounded-3xl bg-white p-5 shadow-2xl"><div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4"><div><h2 className="text-xl font-black text-slate-950">Buat Skill</h2><p className="mt-1 text-sm font-medium text-slate-500">Skill hanya tersimpan sebagai preview selama halaman terbuka.</p></div><button type="button" onClick={() => setShowSkillForm(false)} className="grid size-9 place-items-center rounded-xl border border-slate-200 text-slate-500" aria-label="Tutup"><X className="size-4" /></button></div><div className="mt-5 grid gap-4 sm:grid-cols-2">{([['name','Nama Skill'],['description','Deskripsi'],['prompt','Prompt / Instruksi']] as const).map(([key,label]) => <label key={key} className="flex flex-col gap-1.5 sm:col-span-2"><span className="text-xs font-black uppercase tracking-[0.08em] text-slate-500">{label}</span><input required={key !== 'description'} value={skillForm[key]} onChange={(event) => setSkillForm((current) => ({ ...current, [key]: event.target.value }))} className="h-11 rounded-xl border border-slate-200 px-3 text-sm font-semibold outline-none focus:border-brand-red/40 focus:ring-4 focus:ring-brand-red/10" /></label>)}<label className="flex flex-col gap-1.5"><span className="text-xs font-black uppercase tracking-[0.08em] text-slate-500">Kategori Data</span><select value={skillForm.kategori} onChange={(event) => setSkillForm((current) => ({ ...current, kategori: event.target.value }))} className="h-11 rounded-xl border border-slate-200 px-3 text-sm font-semibold"><option>Sales</option><option>Marketing</option><option>Tracking</option><option>Finance</option><option>Warehouse</option><option>HRIS</option></select></label><label className="flex flex-col gap-1.5"><span className="text-xs font-black uppercase tracking-[0.08em] text-slate-500">Format Output</span><select value={skillForm.output} onChange={(event) => setSkillForm((current) => ({ ...current, output: event.target.value }))} className="h-11 rounded-xl border border-slate-200 px-3 text-sm font-semibold"><option>Ringkasan + KPI + tabel</option><option>KPI + insight</option><option>Tabel + rekomendasi</option></select></label></div><div className="mt-6 flex justify-end gap-2 border-t border-slate-100 pt-4"><button type="button" onClick={() => setShowSkillForm(false)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600">Batal</button><button type="submit" className="rounded-xl bg-brand-red px-4 py-2 text-sm font-bold text-white">Simpan Preview</button></div></form></div>}
    </ModuleCenterShell>
  );
}
