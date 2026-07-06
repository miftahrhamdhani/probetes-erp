"use client";

import { DataPanel } from "@/features/database/overview/components/DataPanel";
import { KpiCard } from "@/features/database/overview/components/KpiCard";
import { StatusBadge } from "@/features/database/overview/components/StatusBadge";
import type { StatusTone } from "@/features/database/overview/types/databaseOverview.types";
import { usePagedData } from "../../hooks/usePagedData";
import { formatNumber } from "../../lib/format";
import { TablePagination } from "../TablePagination";

interface CustomerRow {
  id: string;
  name: string;
  phone: string;
  city: string;
  source: string;
  trx: number;
  status: string;
}

const kpiItems = [
  { label: "Total Pelanggan", value: "21.603", detail: "Tersedia", tone: "green" as const },
  { label: "Pelanggan Repeat", value: "5.626", detail: "Beli ulang", tone: "blue" as const },
  { label: "Pelanggan Bernilai Tinggi", value: "118", detail: "High Value", tone: "green" as const },
  { label: "Perlu Dicek", value: "2.491", detail: "Tanpa No HP", tone: "amber" as const },
];

const statusTone: Record<string, StatusTone> = {
  Baru: "blue",
  Repeat: "green",
  "High Value": "purple",
  "Perlu Dicek": "amber",
};

const legendItems = [
  { label: "Baru", description: "Baru sekali membeli." },
  { label: "Repeat", description: "Sudah membeli lebih dari satu kali." },
  { label: "High Value", description: "Total belanja besar (di atas Rp5 juta)." },
  { label: "Perlu Dicek", description: "Data belum lengkap, misal tanpa No HP." },
];

const notes = [
  "Pelanggan dikenali dari No HP, bukan nama — nama boleh beda, No HP sama tetap dihitung satu pelanggan.",
  "Pelanggan tanpa No HP berasal dari marketplace; dibedakan lewat nama + alamat.",
  "Nomor HP ditampilkan tersamar untuk keamanan data.",
];

export function PelangganSection() {
  const { rows, total, loading, error, page, setPage, pageSize, setPageSize, totalPages } =
    usePagedData<CustomerRow>("/data/customers.json");

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpiItems.map((item) => (
          <KpiCard key={item.label} item={item} />
        ))}
      </div>

      <DataPanel title="Daftar Pelanggan" subtitle="Seluruh pelanggan hasil penggabungan data.">
        {loading && <p className="py-8 text-center text-sm font-medium text-slate-400">Memuat data…</p>}
        {error && (
          <p className="py-8 text-center text-sm font-medium text-amber-600">
            Data belum tersedia. Jalankan export data terlebih dahulu.
          </p>
        )}
        {!loading && !error && (
          <>
            <div className="max-h-[560px] overflow-auto">
              <table className="w-full min-w-[680px] text-sm">
                <thead className="sticky top-0 z-10 bg-white">
                  <tr className="border-b border-slate-200">
                    <th className="pb-3 pr-4 text-left font-bold text-slate-500">ID</th>
                    <th className="pb-3 pr-4 text-left font-bold text-slate-500">Nama</th>
                    <th className="pb-3 pr-4 text-left font-bold text-slate-500">No. HP</th>
                    <th className="pb-3 pr-4 text-left font-bold text-slate-500">Kota</th>
                    <th className="pb-3 pr-4 text-left font-bold text-slate-500">Asal Data</th>
                    <th className="pb-3 pr-4 text-right font-bold text-slate-500">Transaksi</th>
                    <th className="pb-3 text-right font-bold text-slate-500">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.map((row) => (
                    <tr key={row.id}>
                      <td className="py-3 pr-4 font-medium text-slate-500">{row.id}</td>
                      <td className="py-3 pr-4 font-semibold text-slate-950">{row.name}</td>
                      <td className="py-3 pr-4 font-medium text-slate-600">{row.phone}</td>
                      <td className="py-3 pr-4 font-medium text-slate-600">{row.city}</td>
                      <td className="py-3 pr-4 font-medium text-slate-600">{row.source}</td>
                      <td className="py-3 pr-4 text-right font-medium text-slate-600">{formatNumber(row.trx)}</td>
                      <td className="py-3 text-right">
                        <StatusBadge label={row.status} tone={statusTone[row.status]} />
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <DataPanel title="Keterangan Status">
          <ul className="flex flex-col gap-3">
            {legendItems.map((item) => (
              <li key={item.label} className="flex items-start gap-3 text-sm">
                <StatusBadge label={item.label} tone={statusTone[item.label]} />
                <span className="pt-0.5 font-medium text-slate-600">{item.description}</span>
              </li>
            ))}
          </ul>
        </DataPanel>

        <DataPanel title="Catatan Pelanggan">
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
