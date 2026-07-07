"use client";

import { DataPanel } from "@/features/database/overview/components/DataPanel";
import { KpiCard } from "@/features/database/overview/components/KpiCard";
import { StatusBadge } from "@/features/database/overview/components/StatusBadge";
import { usePagedData } from "../../hooks/usePagedData";
import { formatNumber, formatRupiah } from "../../lib/format";
import { TablePagination } from "../TablePagination";
import { TableToolbar, ToolbarSelect } from "../TableToolbar";

interface ProductRow {
  id: string;
  name: string;
  sku: string;
  original: string;
  qty: number;
  value: number;
  status: string;
}

const kpiItems = [
  { label: "Produk Final", value: "94", detail: "Tersedia", tone: "green" as const },
  { label: "Nama Asli Digabung", value: "116", detail: "Dirapikan", tone: "blue" as const },
  { label: "Perlu Dicek", value: "1", detail: "Data uji", tone: "amber" as const },
  { label: "SKU Terisi", value: "0", detail: "Menunggu SKU", tone: "slate" as const },
];

const notes = [
  "Varian 'S' dan 'Tk' sengaja tetap terpisah sesuai keputusan owner, menunggu penyamaan SKU antar gudang.",
  "Varian 'Bonus' sudah digabung ke produk intinya masing-masing.",
  "Kolom SKU tampil '-' karena kode produk antar gudang belum disamakan.",
  "Nama asli dari data lama tetap disimpan agar bisa ditelusuri kembali.",
];

export function ProdukSection() {
  const {
    rows, total, totalAll, loading, error, page, setPage, pageSize, setPageSize, totalPages,
    query, setQuery, filters, setFilter, sort, setSort, resetControls, hasActiveControls,
  } = usePagedData<ProductRow>("/data/products.json", ["id", "name", "sku", "original"]);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpiItems.map((item) => (
          <KpiCard key={item.label} item={item} />
        ))}
      </div>

      <DataPanel title="Daftar Produk" subtitle="Seluruh produk final hasil merapikan variasi tulisan lama.">
        {loading && <p className="py-8 text-center text-sm font-medium text-slate-400">Memuat data…</p>}
        {error && (
          <p className="py-8 text-center text-sm font-medium text-amber-600">
            Data belum tersedia. Jalankan export data terlebih dahulu.
          </p>
        )}
        {!loading && !error && (
          <>
            <TableToolbar
              query={query}
              onQuery={setQuery}
              placeholder="Cari ID, produk, SKU, nama asli…"
              total={total}
              totalAll={totalAll}
              onReset={resetControls}
              hasActive={hasActiveControls}
            >
              <ToolbarSelect
                value={filters.status ?? ""}
                onChange={(v) => setFilter("status", v)}
                allLabel="Semua Status"
                options={["Tersedia", "Perlu dicek"].map((s) => ({ value: s, label: s }))}
              />
              <ToolbarSelect
                value={sort}
                onChange={setSort}
                allLabel="Urutan asli"
                options={[
                  { value: "value:desc", label: "Nilai terbesar" },
                  { value: "qty:desc", label: "Qty terbanyak" },
                  { value: "name:asc", label: "Produk A-Z" },
                ]}
              />
            </TableToolbar>
            {total === 0 && (
              <p className="py-6 text-center text-sm font-medium text-slate-400">
                Tidak ada data yang cocok dengan pencarian/filter.
              </p>
            )}
            <div className="max-h-[560px] overflow-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead className="sticky top-0 z-10 bg-white">
                  <tr className="border-b border-slate-200">
                    <th className="pb-3 pr-4 text-left font-bold text-slate-500">ID</th>
                    <th className="pb-3 pr-4 text-left font-bold text-slate-500">Produk Final</th>
                    <th className="pb-3 pr-4 text-left font-bold text-slate-500">SKU</th>
                    <th className="pb-3 pr-4 text-left font-bold text-slate-500">Nama Asli dari Data</th>
                    <th className="pb-3 pr-4 text-right font-bold text-slate-500">Qty</th>
                    <th className="pb-3 pr-4 text-right font-bold text-slate-500">Nilai</th>
                    <th className="pb-3 text-right font-bold text-slate-500">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.map((row) => (
                    <tr key={row.id}>
                      <td className="py-3 pr-4 font-medium text-slate-500">{row.id}</td>
                      <td className="py-3 pr-4 font-semibold text-slate-950">{row.name}</td>
                      <td className="py-3 pr-4 font-medium text-slate-600">{row.sku}</td>
                      <td className="py-3 pr-4 font-medium text-slate-600">{row.original}</td>
                      <td className="py-3 pr-4 text-right font-medium text-slate-600">{formatNumber(row.qty)}</td>
                      <td className="py-3 pr-4 text-right font-semibold text-slate-950">{formatRupiah(row.value)}</td>
                      <td className="py-3 text-right">
                        <StatusBadge label={row.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <TablePagination
              page={page}
              totalPages={totalPages}
              pageSize={pageSize}
              total={total}
              onPage={setPage}
              onPageSize={setPageSize}
            />
          </>
        )}
      </DataPanel>

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
  );
}
