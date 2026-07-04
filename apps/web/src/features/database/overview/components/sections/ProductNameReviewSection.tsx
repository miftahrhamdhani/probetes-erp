import { DataPanel } from "../DataPanel";
import { KpiCard } from "../KpiCard";
import { StatusBadge } from "../StatusBadge";

const kpiItems = [
  { label: "Nama Produk Perlu Dirapikan", value: "41", detail: "Perlu review", tone: "amber" as const },
  { label: "Prioritas Tinggi", value: "8", detail: "Penting", tone: "red" as const },
  { label: "Sudah Cocok", value: "12", detail: "Cocok sebagian", tone: "amber" as const },
  { label: "Perlu Review", value: "29", detail: "Belum dicek", tone: "slate" as const },
];

const tableRows = [
  { no: 1, name: "Probetes Herbal", count: "1.240", value: "215,8 Jt", status: "Cocok sebagian" },
  { no: 2, name: "Ebook", count: "450", value: "12,5 Jt", status: "Perlu review" },
  { no: 3, name: "Ebook 145", count: "320", value: "8,9 Jt", status: "Perlu review" },
  { no: 4, name: "Amandia", count: "150", value: "25,0 Jt", status: "Cocok sebagian" },
  { no: 5, name: "Yacona", count: "125", value: "22,5 Jt", status: "Cocok sebagian" },
  { no: 6, name: "S Probetes Herbal", count: "85", value: "15,2 Jt", status: "Perlu review" },
  { no: 7, name: "Tk Probetes Herbal", count: "42", value: "7,8 Jt", status: "Perlu review" },
];

const notes = [
  "Beberapa nama produk masih bervariasi sehingga perlu dirapikan agar tidak terduplikasi.",
  "Review dilakukan sebelum data produk final digunakan.",
  "Konsistensi nama produk penting untuk akurasi laporan dan analisis.",
];

export function ProductNameReviewSection() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpiItems.map((item) => (
          <KpiCard key={item.label} item={item} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <DataPanel title="Daftar Produk Perlu Direview" className="lg:col-span-2">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px] text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="pb-3 pr-4 text-left font-bold text-slate-500">No</th>
                  <th className="pb-3 text-left font-bold text-slate-500">Nama Produk</th>
                  <th className="pb-3 text-right font-bold text-slate-500">Jumlah Data</th>
                  <th className="pb-3 text-right font-bold text-slate-500">Nilai</th>
                  <th className="pb-3 text-right font-bold text-slate-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tableRows.map((row) => (
                  <tr key={row.name}>
                    <td className="py-3 pr-4 font-medium text-slate-500">{row.no}</td>
                    <td className="py-3 font-semibold text-slate-950">{row.name}</td>
                    <td className="py-3 text-right font-medium text-slate-600">{row.count}</td>
                    <td className="py-3 text-right font-medium text-slate-600">{row.value}</td>
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
          <DataPanel title="Catatan Produk">
            <ul className="flex flex-col gap-3">
              {notes.map((note) => (
                <li key={note} className="flex items-start gap-2.5 text-sm font-medium text-slate-600">
                  <span className="mt-1 size-1.5 shrink-0 rounded-full bg-brand-red" />
                  {note}
                </li>
              ))}
            </ul>
          </DataPanel>
        </div>
      </div>
    </div>
  );
}
