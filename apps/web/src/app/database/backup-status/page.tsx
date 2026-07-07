import { AppHeader } from "@/components/layout/AppHeader";
import { DatabaseBackButton } from "@/features/database/components/DatabaseBackButton";
import { DataPanel } from "@/features/database/overview/components/DataPanel";
import { KpiCard } from "@/features/database/overview/components/KpiCard";
import { StatusBadge } from "@/features/database/overview/components/StatusBadge";
import type { KpiItem, StatusTone } from "@/features/database/overview/types/databaseOverview.types";

type BackupRow = {
  name: string;
  source: string;
  rows: string;
  content: string;
  status: string;
  tone: StatusTone;
};

const kpiItems = [
  { label: "Data Asli", value: "5 file", detail: "Tersimpan", tone: "green" },
  { label: "Data Utama", value: "7 file", detail: "Tersedia", tone: "green" },
  { label: "Perlu Dicek", value: "2.054", detail: "Manual", tone: "amber" },
  { label: "Database Aktif", value: "Belum", detail: "Belum", tone: "amber" },
] satisfies KpiItem[];

const sourceRows: BackupRow[] = [
  { name: "Database All", source: "01_database_all", rows: "Data utama", content: "Customer, pesanan, produk, ekspedisi, pembayaran", status: "Tersimpan", tone: "green" },
  { name: "Probetes Non Prodig", source: "02_probetes_non_prodig", rows: "Data tambahan", content: "Customer dan pesanan tambahan", status: "Tersimpan", tone: "green" },
  { name: "Database Cohort", source: "04_cohort_pelanggan", rows: "Data cohort", content: "Riwayat transaksi, produk, total harga, CS", status: "Tersimpan", tone: "green" },
  { name: "Gudang Jakarta", source: "05_gudang_jakarta", rows: "Data gudang", content: "Acuan stok/SKU gudang Jakarta", status: "Tersimpan", tone: "green" },
  { name: "Gudang Makassar", source: "06_gudang_makasar", rows: "Data gudang", content: "Acuan stok/SKU gudang Makassar", status: "Tersimpan", tone: "green" },
];

const processedRows: BackupRow[] = [
  { name: "Pelanggan", source: "customers", rows: "21.435 data", content: "Daftar customer hasil penggabungan awal", status: "Tersedia", tone: "green" },
  { name: "Produk", source: "products", rows: "81 data", content: "Produk final dan nama asli dari data lama", status: "Tersedia", tone: "green" },
  { name: "Channel", source: "channels", rows: "7 data", content: "Channel penjualan yang sudah dirapikan", status: "Tersedia", tone: "green" },
  { name: "CS / Tim", source: "users", rows: "92 data", content: "Nama CS, ADV, dan tim", status: "Tersedia", tone: "green" },
  { name: "Ekspedisi", source: "couriers", rows: "22 data", content: "Daftar ekspedisi hasil mapping", status: "Tersedia", tone: "green" },
  { name: "Pesanan", source: "orders", rows: "42.390 data", content: "Satu baris per pesanan", status: "Tersedia", tone: "green" },
  { name: "Data Perlu Dicek", source: "data_quality_checks", rows: "2.054 data", content: "Customer, produk, dan data yang perlu dicek manual", status: "Perlu Dicek", tone: "amber" },
];

const batchRows = [
  { batch: "Batch 1", periode: "Mei 2026 + Juni 2026", status: "Tahap Awal" },
  { batch: "Batch 2", periode: "Maret 2026 + April 2026", status: "Berikutnya" },
  { batch: "Batch 3", periode: "Januari 2026 + Februari 2026", status: "Berikutnya" },
  { batch: "Batch 4", periode: "November 2025 + Desember 2025", status: "Berikutnya" },
];

function BackupTable({ rows }: { rows: BackupRow[] }) {
  return (
    <div className="max-h-[520px] overflow-auto">
      <table className="w-full min-w-[760px] text-sm">
        <thead className="sticky top-0 z-10 bg-white">
          <tr className="border-b border-slate-200">
            <th className="pb-3 pr-4 text-left font-bold text-slate-500">Nama Data</th>
            <th className="pb-3 pr-4 text-left font-bold text-slate-500">Sumber</th>
            <th className="pb-3 pr-4 text-left font-bold text-slate-500">Jumlah</th>
            <th className="pb-3 pr-4 text-left font-bold text-slate-500">Isi Data</th>
            <th className="pb-3 text-right font-bold text-slate-500">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row) => (
            <tr key={row.name}>
              <td className="py-3 pr-4 font-semibold text-slate-950">{row.name}</td>
              <td className="py-3 pr-4 font-medium text-slate-600">{row.source}</td>
              <td className="py-3 pr-4 font-medium text-slate-600">{row.rows}</td>
              <td className="py-3 pr-4 font-medium text-slate-600">{row.content}</td>
              <td className="py-3 text-right"><StatusBadge label={row.status} tone={row.tone} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function BackupStatusPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#eef2f6]/90 text-brand-deep">
      <AppHeader />
      <main className="mx-auto flex w-full max-w-[1680px] flex-col gap-6 px-5 py-6 sm:px-7 lg:px-10">
        <div>
          <h1 className="text-3xl font-black tracking-[-0.045em] text-slate-950 sm:text-4xl">Status Cadangan</h1>
          <p className="mt-2 max-w-3xl text-sm font-medium leading-6 text-slate-600 sm:text-base">
            Lihat data apa saja yang sudah tersedia sebagai cadangan/acuan sebelum database asli aktif.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {kpiItems.map((item) => (
            <KpiCard key={item.label} item={item} />
          ))}
        </div>

        <DataPanel title="Data Asli yang Tersimpan" subtitle="Data sumber yang menjadi acuan awal ERP.">
          <BackupTable rows={sourceRows} />
        </DataPanel>

        <DataPanel title="Data Hasil Olahan yang Siap Dilihat" subtitle="Data yang sudah dirapikan untuk frontend, tapi belum database aktif.">
          <BackupTable rows={processedRows} />
        </DataPanel>

        <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          <DataPanel title="Rencana Cadangan Data" subtitle="Pengecekan tetap bertahap per 2 bulan.">
            <div className="space-y-3">
              {batchRows.map((row) => (
                <div key={row.batch} className="grid gap-2 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-[0.45fr_1fr_0.55fr] sm:items-center">
                  <strong className="text-sm text-slate-950">{row.batch}</strong>
                  <span className="text-sm font-medium text-slate-600">{row.periode}</span>
                  <StatusBadge label={row.status} tone={row.batch === "Batch 1" ? "blue" : "slate"} />
                </div>
              ))}
            </div>
          </DataPanel>

          <DataPanel title="Catatan Status">
            <p className="text-sm font-medium leading-6 text-slate-600">
              Halaman ini belum menampilkan cadangan teknis server. Ini menampilkan data acuan yang sudah tersimpan dan data hasil olahan yang bisa dicek tim. Setelah database asli aktif, status ini bisa diganti menjadi status cadangan database otomatis.
            </p>
          </DataPanel>
        </div>

        <DatabaseBackButton />
      </main>
      <footer className="pb-7 pt-3 text-center text-xs font-medium text-slate-500 sm:text-sm">
        © 2026 Probetes ERP. All rights reserved.
      </footer>
    </div>
  );
}
