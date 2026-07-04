import { DataPanel } from "../DataPanel";
import { KpiCard } from "../KpiCard";
import { StatusBadge } from "../StatusBadge";

const kpiItems = [
  { label: "Data Pesanan Operasional", value: "2.962", detail: "Tersedia", tone: "green" as const },
  { label: "Nilai Pesanan", value: "388,8 Jt", detail: "Tersedia", tone: "green" as const },
  { label: "Transaksi Penjualan", value: "2.229", detail: "Tersedia", tone: "green" as const },
  { label: "Total Penjualan", value: "332,9 Jt", detail: "Tersedia", tone: "green" as const },
];

const notes = [
  "Data pesanan operasional lebih tinggi karena mencakup pesanan yang belum menjadi transaksi.",
  "Data penjualan lebih ringkas karena hanya mencakup transaksi yang sudah selesai.",
  "Perbedaan angka masih wajar karena sumber dan cara pencatatan berbeda.",
];

const summary = [
  { label: "Selisih jumlah data", value: "733" },
  { label: "Selisih nilai", value: "55.872.727" },
  { label: "Sumber utama", value: "2" },
  { label: "Status", value: "Normal" },
];

export function OrderSalesComparisonSection() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpiItems.map((item) => (
          <KpiCard key={item.label} item={item} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Comparison bars */}
        <DataPanel title="Perbandingan Volume Data">
          <div className="flex flex-col gap-5">
            <div>
              <div className="mb-1.5 flex items-center justify-between text-sm font-semibold text-slate-700">
                <span>Pesanan Operasional</span>
                <span className="font-black text-slate-950">2.962</span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-brand-red" style={{ width: "100%" }} />
              </div>
            </div>
            <div>
              <div className="mb-1.5 flex items-center justify-between text-sm font-semibold text-slate-700">
                <span>Transaksi Penjualan</span>
                <span className="font-black text-slate-950">2.229</span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-brand-red/60" style={{ width: "75%" }} />
              </div>
            </div>
            <div>
              <div className="mb-1.5 flex items-center justify-between text-sm font-semibold text-slate-700">
                <span>Nilai Pesanan</span>
                <span className="font-black text-slate-950">388,8 Jt</span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-blue-400" style={{ width: "100%" }} />
              </div>
            </div>
            <div>
              <div className="mb-1.5 flex items-center justify-between text-sm font-semibold text-slate-700">
                <span>Total Penjualan</span>
                <span className="font-black text-slate-950">332,9 Jt</span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-blue-400/60" style={{ width: "86%" }} />
              </div>
            </div>
          </div>
        </DataPanel>

        <div className="flex flex-col gap-6">
          <DataPanel title="Catatan Perbandingan">
            <ul className="flex flex-col gap-3">
              {notes.map((note) => (
                <li key={note} className="flex items-start gap-2.5 text-sm font-medium text-slate-600">
                  <span className="mt-1 size-1.5 shrink-0 rounded-full bg-brand-red" />
                  {note}
                </li>
              ))}
            </ul>
          </DataPanel>

          <DataPanel title="Ringkasan Selisih">
            <div className="divide-y divide-slate-100">
              {summary.map((row) => (
                <div key={row.label} className="flex items-center justify-between py-2.5">
                  <span className="text-sm font-semibold text-slate-600">{row.label}</span>
                  <StatusBadge label={row.value} />
                </div>
              ))}
            </div>
          </DataPanel>
        </div>
      </div>
    </div>
  );
}
