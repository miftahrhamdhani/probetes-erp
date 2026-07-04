import { DataPanel } from "../DataPanel";
import { KpiCard } from "../KpiCard";

const kpiItems = [
  { label: "Pelanggan", value: "2.055", detail: "Tersedia", tone: "green" as const },
  { label: "Pesanan", value: "2.962", detail: "Tersedia", tone: "green" as const },
  { label: "Item Pesanan", value: "2.962", detail: "Tersedia", tone: "green" as const },
  { label: "Transaksi Penjualan", value: "2.229", detail: "Tersedia", tone: "green" as const },
  { label: "Nama Produk Perlu Dirapikan", value: "41", detail: "Perlu review", tone: "amber" as const },
];

const notes = [
  "Data utama sudah tersedia untuk tahap awal.",
  "Beberapa nama produk masih perlu dirapikan.",
  "Data mengandung informasi sensitif sehingga perlu dijaga.",
];

export function AvailableDataSummarySection() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {kpiItems.map((item) => (
          <KpiCard key={item.label} item={item} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <DataPanel title="Tren Data Tersedia" subtitle="Gambaran distribusi data yang sudah masuk" className="lg:col-span-2">
          <div className="mt-2 flex h-40 items-end gap-2 rounded-2xl bg-slate-50 p-4">
            {[
              { label: "Pelanggan", h: "60%" },
              { label: "Pesanan", h: "85%" },
              { label: "Item Pesanan", h: "85%" },
              { label: "Transaksi", h: "65%" },
              { label: "Produk", h: "12%" },
            ].map((bar) => (
              <div key={bar.label} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className="w-full rounded-t-lg bg-brand-red/80 transition-all"
                  style={{ height: bar.h }}
                />
                <span className="text-center text-[10px] font-semibold text-slate-500">{bar.label}</span>
              </div>
            ))}
          </div>
        </DataPanel>

        <DataPanel title="Catatan Data">
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
  );
}
