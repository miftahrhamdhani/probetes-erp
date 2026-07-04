import { DataPanel } from "../DataPanel";
import { KpiCard } from "../KpiCard";
import { StatusBadge } from "../StatusBadge";

const kpiItems = [
  { label: "Pelanggan", value: "2.055", detail: "Tersedia", tone: "green" as const },
  { label: "Pesanan", value: "2.962", detail: "Tersedia", tone: "green" as const },
  { label: "Item Pesanan", value: "2.962", detail: "Tersedia", tone: "green" as const },
  { label: "Transaksi Penjualan", value: "2.229", detail: "Tersedia", tone: "green" as const },
  { label: "Data Siap Pakai", value: "4", detail: "dari 5", tone: "blue" as const },
];

const tableRows = [
  { name: "Data Pelanggan", count: "2.055", status: "Tersedia" },
  { name: "Data Pesanan", count: "2.962", status: "Tersedia" },
  { name: "Data Item Pesanan", count: "2.962", status: "Tersedia" },
  { name: "Data Transaksi Penjualan", count: "2.229", status: "Tersedia" },
  { name: "Nama Produk", count: "41", status: "Perlu Review" },
];

const notes = [
  "Data utama sudah tersedia dan bisa digunakan untuk tahap awal.",
  "Data produk masih perlu dirapikan agar konsisten.",
  "Secara keseluruhan, data siap mendukung operasional awal.",
];

const summaryItems = [
  { label: "Data tersedia", value: "4" },
  { label: "Perlu review", value: "1" },
  { label: "Tingkat kesiapan", value: "85%" },
  { label: "Prioritas", value: "Produk" },
];

export function MainDataReadinessSection() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {kpiItems.map((item) => (
          <KpiCard key={item.label} item={item} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <DataPanel title="Status Kesiapan Data" className="lg:col-span-2">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[400px] text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="pb-3 text-left font-bold text-slate-500">Jenis Data</th>
                  <th className="pb-3 text-right font-bold text-slate-500">Jumlah</th>
                  <th className="pb-3 text-right font-bold text-slate-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tableRows.map((row) => (
                  <tr key={row.name}>
                    <td className="py-3 font-semibold text-slate-700">{row.name}</td>
                    <td className="py-3 text-right font-bold text-slate-950">{row.count}</td>
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
          <DataPanel title="Catatan Kesiapan">
            <ul className="flex flex-col gap-3">
              {notes.map((note) => (
                <li key={note} className="flex items-start gap-2.5 text-sm font-medium text-slate-600">
                  <span className="mt-1 size-1.5 shrink-0 rounded-full bg-brand-red" />
                  {note}
                </li>
              ))}
            </ul>
          </DataPanel>

          <DataPanel title="Ringkasan">
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
