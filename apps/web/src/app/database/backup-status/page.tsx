"use client";

import { useEffect, useState } from "react";
import { Download, HardDriveDownload, Loader2 } from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { DatabaseBackButton } from "@/features/database/components/DatabaseBackButton";
import { DataPanel } from "@/features/database/overview/components/DataPanel";
import { StatusBadge } from "@/features/database/overview/components/StatusBadge";
import type { StatusTone } from "@/features/database/overview/types/databaseOverview.types";

interface Settings {
  schedule: string;
  folder_path: string;
  updated_at: string | null;
}

interface HistoryRow {
  id: number;
  startedAt: string;
  finishedAt: string | null;
  triggerType: string;
  status: string;
  folderPath: string | null;
  totalRows: number | null;
  totalFiles: number | null;
  errorMessage: string | null;
  backupMode: string;
  dateFrom: string | null;
  dateTo: string | null;
}

const scheduleOptions = [
  { value: "manual", label: "Manual saja (tidak otomatis)" },
  { value: "daily", label: "Harian (tiap hari)" },
  { value: "weekly", label: "Mingguan (tiap hari Senin)" },
  { value: "monthly", label: "Bulanan (tiap tanggal 1)" },
];

const statusTone: Record<string, StatusTone> = {
  success: "green",
  running: "blue",
  failed: "red",
};
const statusLabel: Record<string, string> = {
  success: "Berhasil",
  running: "Sedang Berjalan",
  failed: "Gagal",
};
const triggerLabel: Record<string, string> = {
  manual: "Manual",
  scheduled: "Otomatis",
};

export default function BackupStatusPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [scheduleDraft, setScheduleDraft] = useState("manual");
  const [folderDraft, setFolderDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const [history, setHistory] = useState<HistoryRow[] | null>(null);
  const [running, setRunning] = useState(false);
  const [runMessage, setRunMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [backupMode, setBackupMode] = useState<"all" | "range">("all");
  const [rangeFrom, setRangeFrom] = useState("");
  const [rangeTo, setRangeTo] = useState("");

  const loadSettings = () => {
    fetch("/api/backup/settings")
      .then((res) => res.json())
      .then((data: Settings) => {
        setSettings(data);
        setScheduleDraft(data.schedule);
        setFolderDraft(data.folder_path);
      })
      .catch(() => setSettings(null));
  };

  const loadHistory = () => {
    fetch("/api/backup/history")
      .then((res) => res.json())
      .then((data: HistoryRow[]) => setHistory(data))
      .catch(() => setHistory([]));
  };

  useEffect(() => {
    loadSettings();
    loadHistory();
  }, []);

  const saveSettings = async () => {
    setSaving(true);
    setSaveMessage(null);
    try {
      const res = await fetch("/api/backup/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schedule: scheduleDraft, folderPath: folderDraft }),
      });
      if (!res.ok) throw new Error();
      const data: Settings = await res.json();
      setSettings(data);
      setSaveMessage("Pengaturan tersimpan.");
    } catch {
      setSaveMessage("Gagal menyimpan pengaturan.");
    } finally {
      setSaving(false);
    }
  };

  const runBackup = async () => {
    if (backupMode === "range" && !rangeFrom && !rangeTo) {
      setRunMessage({ type: "error", text: "Isi minimal salah satu tanggal (dari atau sampai)." });
      return;
    }
    setRunning(true);
    setRunMessage(null);
    try {
      const res = await fetch("/api/backup/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          triggerType: "manual",
          mode: backupMode,
          dateFrom: backupMode === "range" ? rangeFrom : undefined,
          dateTo: backupMode === "range" ? rangeTo : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Cadangan gagal.");
      setRunMessage({
        type: "success",
        text: `Cadangan berhasil: ${data.totalFiles} file, ${data.totalRows.toLocaleString("id-ID")} baris, disimpan di ${data.folderPath}`,
      });
      loadHistory();
    } catch (err) {
      setRunMessage({ type: "error", text: err instanceof Error ? err.message : "Cadangan gagal." });
    } finally {
      setRunning(false);
    }
  };

  const hasChanges = settings && (scheduleDraft !== settings.schedule || folderDraft !== settings.folder_path);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#eef2f6]/90 text-brand-deep">
      <AppHeader />
      <main className="mx-auto flex w-full max-w-[1680px] flex-col gap-6 px-5 py-6 sm:px-7 lg:px-10">
        <div>
          <h1 className="text-3xl font-black tracking-[-0.045em] text-slate-950 sm:text-4xl">Status Cadangan</h1>
          <p className="mt-2 max-w-3xl text-sm font-medium leading-6 text-slate-600 sm:text-base">
            Simpan salinan seluruh data ERP ke folder di komputer ini, kapan saja atau terjadwal otomatis.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          <DataPanel title="Pengaturan Cadangan" subtitle="Atur jadwal otomatis dan folder tujuan penyimpanan.">
            <div className="flex flex-col gap-4">
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-bold text-slate-700">Jadwal Otomatis</span>
                <select
                  value={scheduleDraft}
                  onChange={(e) => setScheduleDraft(e.target.value)}
                  className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-brand-red/40 focus:ring-4 focus:ring-brand-red/10"
                >
                  {scheduleOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-bold text-slate-700">Folder Tujuan</span>
                <input
                  type="text"
                  value={folderDraft}
                  onChange={(e) => setFolderDraft(e.target.value)}
                  placeholder="D:\PROBETES\CADANGAN DATABASE"
                  className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-brand-red/40 focus:ring-4 focus:ring-brand-red/10"
                />
                <span className="text-xs font-medium text-slate-400">
                  Tiap cadangan dibuatkan sub-folder bertanggal di dalam folder ini.
                </span>
              </label>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={saveSettings}
                  disabled={saving || !hasChanges}
                  className="rounded-xl bg-brand-red px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#d60511] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {saving ? "Menyimpan…" : "Simpan Pengaturan"}
                </button>
                {saveMessage && <span className="text-xs font-semibold text-slate-500">{saveMessage}</span>}
              </div>

              {settings?.schedule === "manual" && (
                <p className="rounded-xl bg-amber-50 p-3 text-xs font-semibold text-amber-800">
                  Jadwal masih manual — cadangan hanya dibuat saat tombol &quot;Cadangkan Sekarang&quot; ditekan.
                </p>
              )}
              {settings && settings.schedule !== "manual" && (
                <p className="rounded-xl bg-blue-50 p-3 text-xs font-semibold text-blue-800">
                  Jadwal otomatis hanya berjalan bila komputer ini menyala dan Task Scheduler Windows sudah diatur. Lihat catatan di bawah.
                </p>
              )}
            </div>
          </DataPanel>

          <DataPanel title="Cadangkan Sekarang" subtitle="Buat cadangan manual kapan saja, tidak perlu menunggu jadwal.">
            <div className="flex flex-col items-start gap-4">
              <div className="flex size-16 items-center justify-center rounded-2xl bg-brand-red/10 text-brand-red">
                <HardDriveDownload className="size-8" />
              </div>

              <div className="flex w-full gap-2 rounded-xl bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => setBackupMode("all")}
                  className={`flex-1 rounded-lg px-3 py-2 text-sm font-bold transition ${backupMode === "all" ? "bg-white text-brand-red shadow-sm" : "text-slate-500"}`}
                >
                  Semua Data
                </button>
                <button
                  type="button"
                  onClick={() => setBackupMode("range")}
                  className={`flex-1 rounded-lg px-3 py-2 text-sm font-bold transition ${backupMode === "range" ? "bg-white text-brand-red shadow-sm" : "text-slate-500"}`}
                >
                  Rentang Tanggal
                </button>
              </div>

              {backupMode === "all" && (
                <p className="text-sm font-medium leading-6 text-slate-600">
                  Mengambil seluruh data pelanggan, pesanan, produk, channel, ekspedisi, cohort, tracking, dan finance dari database, lalu menyimpannya sebagai file CSV ke folder tujuan.
                </p>
              )}

              {backupMode === "range" && (
                <div className="flex w-full flex-col gap-3">
                  <p className="text-sm font-medium leading-6 text-slate-600">
                    Hanya data pesanan, item pesanan, transaksi cohort, tracking, dan finance yang tanggalnya masuk rentang ini yang dicadangkan. Pelanggan, produk, channel, CS/tim, ekspedisi, dan data acuan lain tetap ikut lengkap (agar ID di data transaksi tetap bisa diterjemahkan).
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="flex flex-col gap-1.5">
                      <span className="text-xs font-bold text-slate-500">Dari Tanggal</span>
                      <input
                        type="date"
                        value={rangeFrom}
                        onChange={(e) => setRangeFrom(e.target.value)}
                        className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none focus:border-brand-red/40 focus:ring-4 focus:ring-brand-red/10"
                      />
                    </label>
                    <label className="flex flex-col gap-1.5">
                      <span className="text-xs font-bold text-slate-500">Sampai Tanggal</span>
                      <input
                        type="date"
                        value={rangeTo}
                        onChange={(e) => setRangeTo(e.target.value)}
                        className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none focus:border-brand-red/40 focus:ring-4 focus:ring-brand-red/10"
                      />
                    </label>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={runBackup}
                disabled={running}
                className="inline-flex items-center gap-2 rounded-xl bg-brand-red px-5 py-3 text-sm font-bold text-white transition hover:bg-[#d60511] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {running && <Loader2 className="size-4 animate-spin" />}
                {running ? "Sedang Mencadangkan…" : "Cadangkan Sekarang"}
              </button>
              {runMessage && (
                <p className={`text-sm font-semibold ${runMessage.type === "success" ? "text-emerald-700" : "text-red-600"}`}>
                  {runMessage.text}
                </p>
              )}
            </div>
          </DataPanel>
        </div>

        <DataPanel title="Riwayat Cadangan" subtitle="15 cadangan terakhir, manual maupun otomatis.">
          {history === null && <p className="py-8 text-center text-sm font-medium text-slate-400">Memuat data…</p>}
          {history?.length === 0 && (
            <p className="py-8 text-center text-sm font-medium text-slate-400">
              Belum ada cadangan yang pernah dibuat. Klik &quot;Cadangkan Sekarang&quot; untuk membuat yang pertama.
            </p>
          )}
          {history && history.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="pb-3 pr-4 text-left font-bold text-slate-500">Waktu Mulai</th>
                    <th className="pb-3 pr-4 text-left font-bold text-slate-500">Jenis</th>
                    <th className="pb-3 pr-4 text-left font-bold text-slate-500">Cakupan</th>
                    <th className="pb-3 pr-4 text-left font-bold text-slate-500">Status</th>
                    <th className="pb-3 pr-4 text-right font-bold text-slate-500">File</th>
                    <th className="pb-3 pr-4 text-right font-bold text-slate-500">Baris</th>
                    <th className="pb-3 pr-4 text-left font-bold text-slate-500">Folder</th>
                    <th className="pb-3 text-right font-bold text-slate-500">Download</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {history.map((row) => {
                    const canDownload = row.status === "success" && Boolean(row.folderPath);
                    return (
                      <tr key={row.id}>
                        <td className="py-3 pr-4 font-medium text-slate-600">{row.startedAt}</td>
                        <td className="py-3 pr-4 font-medium text-slate-600">{triggerLabel[row.triggerType] ?? row.triggerType}</td>
                        <td className="py-3 pr-4 font-medium text-slate-600">
                          {row.backupMode === "range" ? `${row.dateFrom ?? "…"} s/d ${row.dateTo ?? "…"}` : "Semua Data"}
                        </td>
                        <td className="py-3 pr-4">
                          <StatusBadge label={statusLabel[row.status] ?? row.status} tone={statusTone[row.status]} />
                        </td>
                        <td className="py-3 pr-4 text-right font-medium text-slate-600">{row.totalFiles ?? "-"}</td>
                        <td className="py-3 pr-4 text-right font-medium text-slate-600">
                          {row.totalRows != null ? row.totalRows.toLocaleString("id-ID") : "-"}
                        </td>
                        <td className="py-3 pr-4 font-medium text-slate-500" title={row.folderPath ?? ""}>
                          {row.status === "failed" ? (
                            <span className="text-red-600">{row.errorMessage}</span>
                          ) : (
                            <span className="line-clamp-1">{row.folderPath}</span>
                          )}
                        </td>
                        <td className="py-3 text-right">
                          <a
                            href={canDownload ? `/api/backup/history?id=${row.id}&download=excel` : undefined}
                            aria-disabled={!canDownload}
                            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold transition ${canDownload ? "border-brand-red/20 bg-brand-red text-white hover:bg-[#d60511]" : "pointer-events-none border-slate-200 text-slate-400 opacity-50"}`}
                          >
                            <Download className="size-3.5" />
                            Download Excel
                          </a>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </DataPanel>

        <DataPanel title="Catatan Cadangan Otomatis">
          <p className="text-sm font-medium leading-6 text-slate-600">
            Jadwal harian/mingguan/bulanan di atas hanya menyimpan pengaturan. Agar benar-benar berjalan sendiri tanpa membuka aplikasi ini, perlu didaftarkan sekali ke Task Scheduler Windows — panduannya ada di <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">data_migrasi/db/README_BACKUP.md</code>. Cadangan otomatis hanya berjalan bila komputer menyala saat jadwalnya tiba.
          </p>
        </DataPanel>

        <DatabaseBackButton />
      </main>
      <footer className="pb-7 pt-3 text-center text-xs font-medium text-slate-500 sm:text-sm">
        © 2026 Probetes ERP. All rights reserved.
      </footer>
    </div>
  );
}
