import { DataPanel } from "../DataPanel";
import { KpiCard } from "../KpiCard";
import { StatusBadge } from "../StatusBadge";

const kpiItems = [
  { label: "Data Perlu Dicek", value: "18", detail: "Prioritas", tone: "red" as const },
  { label: "Nomor HP Tidak Lengkap", value: "7", detail: "Perlu dicek", tone: "amber" as const },
  { label: "Nama Produk Belum Rapi", value: "41", detail: "Perlu review", tone: "amber" as const },
  { label: "Catatan Pembayaran/Pengiriman", value: "6", detail: "Tidak lengkap", tone: "amber" as const },
];

const tableRows = [
  { name: "Nomor HP", desc: "Sebagian data belum lengkap", status: "Perlu dicek" },
  { name: "Nama Produk", desc: "Masih ada nama yang belum rapi", status: "Perlu review" },
  { name: "Pembayaran", desc: "Beberapa data belum lengkap", status: "Perlu dicek" },
  { name: "Pengiriman", desc: "Sebagian data perlu verifikasi", status: "Perlu dicek" },
  { name: "Data Pelanggan", desc: "Sudah diringkas dari sumber tersedia", status: "Aman" },
];

const notes = [
  "Pastikan nomor HP pelanggan dilengkapi.",
  "Rapikan nama produk untuk menghindari duplikasi.",
  "Lengkapi data pembayaran dan pengiriman agar operasional lebih akurat.",
];

const summaryItems = [
  { label: "Baik/Aman", value: "1" },
  { label: "Perlu dicek", value: "3" },
  { label: "Perlu review", value: "1" },
  { label: "Tingkat kualitas", value: "78%" },
];

export function InitialDataQualitySection() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpiItems.map((item) => (
          <KpiCard key={item.label} item={item} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <DataPanel title="Hasil Pemeriksaan Kualitas" className="lg:col-span-2">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px] text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="pb-3 text-left font-bold text-slate-500">Indikator</th>
                  <th className="pb-3 text-left font-bold text-slate-500">Keterangan</th>
                  <th className="pb-3 text-right font-bold text-slate-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tableRows.map((row) => (
                  <tr key={row.name}>
                    <td className="py-3 font-semibold text-slate-950">{row.name}</td>
                    <td className="py-3 text-slate-600">{row.desc}</td>
                    <td className="py-3 text-right">
                      <StatusBadge label={row.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DataPanel>

        <div className="flex flex-col gap-6">
          <DataPanel title="Catatan Kualitas">
            <ul className="flex flex-col gap-3">
              {notes.map((note) => (
                <li key={note} className="flex items-start gap-2.5 text-sm font-medium text-slate-600">
                  <span className="mt-1 size-1.5 shrink-0 rounded-full bg-brand-red" />
                  {note}
                </li>
              ))}
            </ul>
          </DataPanel>

          <DataPanel title="Ringkasan Pemeriksaan">
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
