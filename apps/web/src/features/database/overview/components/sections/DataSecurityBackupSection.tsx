import { DataPanel } from "../DataPanel";
import { KpiCard } from "../KpiCard";
import { StatusBadge } from "../StatusBadge";

const kpiItems = [
  { label: "Cadangan Terakhir", value: "12 Mei 2026", detail: "Berhasil", tone: "green" as const },
  { label: "Status Sistem", value: "Normal", detail: "Aman", tone: "green" as const },
  { label: "Sumber Asli", value: "Aman", detail: "Terjaga", tone: "green" as const },
  { label: "Data Sensitif", value: "Terlindungi", detail: "Enkripsi", tone: "blue" as const },
];

const securityRows = [
  { label: "Sumber data asli tidak diubah", status: "Aman" },
  { label: "Data mengandung informasi sensitif", status: "Terlindungi" },
  { label: "Akses perlu dibatasi", status: "Perlu perhatian" },
];

const backupRows = [
  { label: "Cadangan terakhir berhasil", status: "Berhasil" },
  { label: "Waktu cadangan: 12 Mei 2026 23:30 WIB", status: "Tersimpan" },
  { label: "Status sistem operasional", status: "Normal" },
];

const notes = [
  "Jaga kerahasiaan dan integritas data.",
  "Batasi akses hanya kepada pihak yang berwenang.",
  "Pastikan cadangan data tersimpan aman dan dapat dipulihkan.",
];

const summaryItems = [
  { label: "Status Aman", value: "3" },
  { label: "Cadangan Aktif", value: "1" },
  { label: "Perlu Perhatian", value: "1" },
  { label: "Status Umum", value: "Terjamin" },
];

export function DataSecurityBackupSection() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpiItems.map((item) => (
          <KpiCard key={item.label} item={item} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <DataPanel title="Keamanan Data">
            <div className="divide-y divide-slate-100">
              {securityRows.map((row) => (
                <div key={row.label} className="flex items-center justify-between py-3">
                  <span className="text-sm font-medium text-slate-700">{row.label}</span>
                  <StatusBadge label={row.status} />
                </div>
              ))}
            </div>
          </DataPanel>

          <DataPanel title="Cadangan Data (Backup)">
            <div className="divide-y divide-slate-100">
              {backupRows.map((row) => (
                <div key={row.label} className="flex items-center justify-between py-3">
                  <span className="text-sm font-medium text-slate-700">{row.label}</span>
                  <StatusBadge label={row.status} />
                </div>
              ))}
            </div>
          </DataPanel>
        </div>

        <div className="flex flex-col gap-6">
          <DataPanel title="Catatan Keamanan">
            <ul className="flex flex-col gap-3">
              {notes.map((note) => (
                <li key={note} className="flex items-start gap-2.5 text-sm font-medium text-slate-600">
                  <span className="mt-1 size-1.5 shrink-0 rounded-full bg-brand-red" />
                  {note}
                </li>
              ))}
            </ul>
          </DataPanel>

          <DataPanel title="Ringkasan Keamanan">
            <div className="divide-y divide-slate-100">
              {summaryItems.map((item) => (
                <div key={item.label} className="flex items-center justify-between py-2.5">
                  <span className="text-sm font-semibold text-slate-600">{item.label}</span>
                  <span className="text-sm font-black text-slate-950">{item.value}</span>
                </div>
              ))}
            </div>
          </DataPanel>
        </div>
      </div>
    </div>
  );
}
