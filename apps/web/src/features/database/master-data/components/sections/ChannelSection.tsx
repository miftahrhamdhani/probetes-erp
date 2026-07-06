"use client";

import { DataPanel } from "@/features/database/overview/components/DataPanel";
import { KpiCard } from "@/features/database/overview/components/KpiCard";
import { StatusBadge } from "@/features/database/overview/components/StatusBadge";
import { usePagedData } from "../../hooks/usePagedData";
import { formatNumber, formatRupiah } from "../../lib/format";
import { TablePagination } from "../TablePagination";

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
  { label: "Channel Platform", value: "5", detail: "Aktif", tone: "green" as const },
  { label: "Divisi Tim", value: "4", detail: "Terpisah", tone: "blue" as const },
  { label: "Mitra", value: "6", detail: "Tabel sendiri", tone: "green" as const },
  { label: "Order Tanpa Platform", value: "25.964", detail: "Perlu dicek", tone: "amber" as const },
];

const divisiRows = [
  { name: "Akuisisi", orders: "16.713" },
  { name: "CRM", orders: "16.315" },
  { name: "Marketplace", orders: "9.360" },
  { name: "CS", orders: "2" },
];

const notes = [
  "Channel = tempat order masuk (TikTok, Shopee, Meta). Divisi = tim yang mengerjakan (Akuisisi, CRM). Keduanya dipisah sesuai keputusan owner.",
  "'Belum Tercatat' artinya platform tidak dicatat di data lama — bukan data hilang. Ke depan channel wajib diisi saat input.",
  "Mitra (UP DM, JAWARA, dll.) dicatat pada tabel sendiri, bukan dicampur ke channel.",
];

export function ChannelSection() {
  const channels = usePagedData<ChannelRow>("/data/channels.json");
  const mitra = usePagedData<MitraRow>("/data/mitra.json");

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
