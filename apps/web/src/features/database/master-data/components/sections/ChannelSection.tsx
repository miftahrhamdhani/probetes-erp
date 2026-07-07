"use client";

import { DataPanel } from "@/features/database/overview/components/DataPanel";
import { KpiCard } from "@/features/database/overview/components/KpiCard";
import { StatusBadge } from "@/features/database/overview/components/StatusBadge";
import { usePagedData } from "../../hooks/usePagedData";
import { formatNumber, formatRupiah } from "../../lib/format";
import { TablePagination } from "../TablePagination";
import { TableToolbar, ToolbarSelect } from "../TableToolbar";

interface ChannelRow {
  id: string;
  name: string;
  type: string;
  original: string;
  orders: number;
  value: number;
  status: string;
}

interface MitraRow {
  id: string;
  name: string;
  original: string;
  orders: number;
  value: number;
  status: string;
}

const kpiItems = [
  { label: "Channel", value: "6", detail: "Termasuk Stokis", tone: "green" as const },
  { label: "Divisi Tim", value: "4", detail: "Terpisah", tone: "blue" as const },
  { label: "Mitra", value: "6", detail: "Tabel sendiri", tone: "green" as const },
  { label: "Transaksi Tanpa Platform", value: "21.026", detail: "Perlu dicek", tone: "amber" as const },
];

const divisiRows = [
  { name: "Akuisisi", orders: "15.548" },
  { name: "CRM", orders: "8.971" },
  { name: "Marketplace", orders: "7.311" },
  { name: "CS", orders: "1" },
];

const notes = [
  "Channel = tempat order masuk. Jenisnya 4: Akuisisi (iklan), Retensi (CRM/WA), Marketplace (TikTok/Shopee), dan Offline (Stokis) — sesuai arahan owner.",
  "Stokis = jalur penjualan lewat agen offline. Masih 0 karena data lama belum ada transaksi offline; tempatnya sudah disiapkan.",
  "'Belum Tercatat' artinya platform tidak dicatat di data lama — bukan data hilang. Ke depan channel wajib diisi saat input.",
  "Mitra (UP DM, JAWARA, dll.) dicatat pada tabel sendiri, bukan dicampur ke channel.",
];

export function ChannelSection() {
  const channels = usePagedData<ChannelRow>("/data/channels.json", ["id", "name", "type", "original"]);
  const mitra = usePagedData<MitraRow>("/data/mitra.json", ["id", "name", "original"]);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpiItems.map((item) => (
          <KpiCard key={item.label} item={item} />
        ))}
      </div>

      <DataPanel title="Daftar Channel" subtitle="Asal order berdasarkan platform.">
        {channels.loading && <p className="py-8 text-center text-sm font-medium text-slate-400">Memuat data…</p>}
        {channels.error && (
          <p className="py-8 text-center text-sm font-medium text-amber-600">
            Data belum tersedia. Jalankan export data terlebih dahulu.
          </p>
        )}
        {!channels.loading && !channels.error && (
          <>
            <TableToolbar
              query={channels.query}
              onQuery={channels.setQuery}
              placeholder="Cari channel, jenis, nama asli…"
              total={channels.total}
              totalAll={channels.totalAll}
              onReset={channels.resetControls}
              hasActive={channels.hasActiveControls}
            >
              <ToolbarSelect
                value={channels.filters.type ?? ""}
                onChange={(v) => channels.setFilter("type", v)}
                allLabel="Semua Jenis"
                options={channels.distinct("type").map((t) => ({ value: t, label: t }))}
              />
              <ToolbarSelect
                value={channels.filters.status ?? ""}
                onChange={(v) => channels.setFilter("status", v)}
                allLabel="Semua Status"
                options={["Aktif", "Perlu review"].map((s) => ({ value: s, label: s }))}
              />
              <ToolbarSelect
                value={channels.sort}
                onChange={channels.setSort}
                allLabel="Urutan asli"
                options={[
                  { value: "orders:desc", label: "Pesanan terbanyak" },
                  { value: "value:desc", label: "Nilai terbesar" },
                  { value: "name:asc", label: "Channel A-Z" },
                ]}
              />
            </TableToolbar>
            {channels.total === 0 && (
              <p className="py-6 text-center text-sm font-medium text-slate-400">
                Tidak ada data yang cocok dengan pencarian/filter.
              </p>
            )}
            <div className="max-h-[560px] overflow-auto">
              <table className="w-full min-w-[680px] text-sm">
                <thead className="sticky top-0 z-10 bg-white">
                  <tr className="border-b border-slate-200">
                    <th className="pb-3 pr-4 text-left font-bold text-slate-500">ID</th>
                    <th className="pb-3 pr-4 text-left font-bold text-slate-500">Channel</th>
                    <th className="pb-3 pr-4 text-left font-bold text-slate-500">Jenis</th>
                    <th className="pb-3 pr-4 text-left font-bold text-slate-500">Nama Asli</th>
                    <th className="pb-3 pr-4 text-right font-bold text-slate-500">Pesanan</th>
                    <th className="pb-3 pr-4 text-right font-bold text-slate-500">Nilai</th>
                    <th className="pb-3 text-right font-bold text-slate-500">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {channels.rows.map((row) => (
                    <tr key={row.id}>
                      <td className="py-3 pr-4 font-medium text-slate-500">{row.id}</td>
                      <td className="py-3 pr-4 font-semibold text-slate-950">{row.name}</td>
                      <td className="py-3 pr-4 font-medium text-slate-600">{row.type}</td>
                      <td className="py-3 pr-4 font-medium text-slate-600">{row.original}</td>
                      <td className="py-3 pr-4 text-right font-medium text-slate-600">{formatNumber(row.orders)}</td>
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
              page={channels.page}
              totalPages={channels.totalPages}
              pageSize={channels.pageSize}
              total={channels.total}
              onPage={channels.setPage}
              onPageSize={channels.setPageSize}
            />
          </>
        )}
      </DataPanel>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <DataPanel title="Daftar Mitra" subtitle="Mitra penjualan dicatat terpisah dari channel." className="lg:col-span-2">
          {mitra.loading && <p className="py-8 text-center text-sm font-medium text-slate-400">Memuat data…</p>}
          {mitra.error && (
            <p className="py-8 text-center text-sm font-medium text-amber-600">
              Data belum tersedia. Jalankan export data terlebih dahulu.
            </p>
          )}
          {!mitra.loading && !mitra.error && (
            <>
              <TableToolbar
                query={mitra.query}
                onQuery={mitra.setQuery}
                placeholder="Cari mitra…"
                total={mitra.total}
                totalAll={mitra.totalAll}
                onReset={mitra.resetControls}
                hasActive={mitra.hasActiveControls}
              >
                <ToolbarSelect
                  value={mitra.filters.status ?? ""}
                  onChange={(v) => mitra.setFilter("status", v)}
                  allLabel="Semua Status"
                  options={["Aktif", "Perlu review"].map((s) => ({ value: s, label: s }))}
                />
                <ToolbarSelect
                  value={mitra.sort}
                  onChange={mitra.setSort}
                  allLabel="Urutan asli"
                  options={[
                    { value: "orders:desc", label: "Pesanan terbanyak" },
                    { value: "value:desc", label: "Nilai terbesar" },
                    { value: "name:asc", label: "Mitra A-Z" },
                  ]}
                />
              </TableToolbar>
              {mitra.total === 0 && (
                <p className="py-6 text-center text-sm font-medium text-slate-400">
                  Tidak ada data yang cocok dengan pencarian/filter.
                </p>
              )}
              <div className="max-h-[420px] overflow-auto">
                <table className="w-full min-w-[560px] text-sm">
                  <thead className="sticky top-0 z-10 bg-white">
                    <tr className="border-b border-slate-200">
                      <th className="pb-3 pr-4 text-left font-bold text-slate-500">ID</th>
                      <th className="pb-3 pr-4 text-left font-bold text-slate-500">Mitra</th>
                      <th className="pb-3 pr-4 text-left font-bold text-slate-500">Nama Asli</th>
                      <th className="pb-3 pr-4 text-right font-bold text-slate-500">Pesanan</th>
                      <th className="pb-3 pr-4 text-right font-bold text-slate-500">Nilai</th>
                      <th className="pb-3 text-right font-bold text-slate-500">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {mitra.rows.map((row) => (
                      <tr key={row.id}>
                        <td className="py-3 pr-4 font-medium text-slate-500">{row.id}</td>
                        <td className="py-3 pr-4 font-semibold text-slate-950">{row.name}</td>
                        <td className="py-3 pr-4 font-medium text-slate-600">{row.original}</td>
                        <td className="py-3 pr-4 text-right font-medium text-slate-600">{formatNumber(row.orders)}</td>
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
                page={mitra.page}
                totalPages={mitra.totalPages}
                pageSize={mitra.pageSize}
                total={mitra.total}
                onPage={mitra.setPage}
                onPageSize={mitra.setPageSize}
              />
            </>
          )}
        </DataPanel>

        <DataPanel title="Divisi Tim" subtitle="Tim internal yang mengerjakan order.">
          <ul className="flex flex-col divide-y divide-slate-100">
            {divisiRows.map((row) => (
              <li key={row.name} className="flex items-center justify-between py-3 text-sm">
                <span className="font-semibold text-slate-950">{row.name}</span>
                <span className="font-medium text-slate-600">{row.orders} pesanan</span>
              </li>
            ))}
          </ul>
        </DataPanel>
      </div>

      <DataPanel title="Catatan Channel">
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
