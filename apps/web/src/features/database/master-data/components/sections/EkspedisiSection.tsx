"use client";

import { DataPanel } from "@/features/database/overview/components/DataPanel";
import { KpiCard } from "@/features/database/overview/components/KpiCard";
import { StatusBadge } from "@/features/database/overview/components/StatusBadge";
import { usePagedData } from "../../hooks/usePagedData";
import { formatNumber } from "../../lib/format";
import { TablePagination } from "../TablePagination";

interface CourierRow {
  id: string;
  name: string;
  original: string;
  service: string;
  orders: number;
  status: string;
}

const kpiItems = [
  { label: "Ekspedisi Final", value: "22", detail: "Tersedia", tone: "green" as const },
  { label: "Nama Asli Digabung", value: "44", detail: "Dirapikan", tone: "blue" as const },
  { label: "Perlu Dicek", value: "11", detail: "Tulisan aneh", tone: "amber" as const },
  { label: "Order dengan Ekspedisi", value: "32.146", detail: "Tercatat", tone: "slate" as const },
];

const notes = [
  "Nomor resi tidak ditampilkan di sini — cek resi dan status kiriman ada di menu Data Tracking.",
  "Variasi tulisan kurir (NINJA/Ninja, JNT/J&T) sudah digabung ke nama final.",
  "Tulisan yang tidak dikenal (LIO, SOX, JNR, Diet) berstatus perlu dicek — kemungkinan salah input.",
];

export function EkspedisiSection() {
  const { rows, total, loading, error, page, setPage, pageSize, setPageSize, totalPages } =
    usePagedData<CourierRow>("/data/couriers.json");

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpiItems.map((item) => (
          <KpiCard key={item.label} item={item} />
        ))}
      </div>

      <DataPanel title="Daftar Ekspedisi" subtitle="Seluruh kurir pengiriman sebagai data acuan.">
        {loading && <p className="py-8 text-center text-sm font-medium text-slate-400">Memuat data…</p>}
        {error && (
          <p className="py-8 text-center text-sm font-medium text-amber-600">
            Data belum tersedia. Jalankan export data terlebih dahulu.
          </p>
        )}
        {!loading && !error && (
          <>
            <div className="max-h-[560px] overflow-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead className="sticky top-0 z-10 bg-white">
                  <tr className="border-b border-slate-200">
                    <th className="pb-3 pr-4 text-left font-bold text-slate-500">ID</th>
                    <th className="pb-3 pr-4 text-left font-bold text-slate-500">Ekspedisi</th>
                    <th className="pb-3 pr-4 text-left font-bold text-slate-500">Nama Asli</th>
                    <th className="pb-3 pr-4 text-left font-bold text-slate-500">Layanan</th>
                    <th className="pb-3 pr-4 text-right font-bold text-slate-500">Pesanan</th>
                    <th className="pb-3 text-right font-bold text-slate-500">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.map((row) => (
                    <tr key={row.id}>
                      <td className="py-3 pr-4 font-medium text-slate-500">{row.id}</td>
                      <td className="py-3 pr-4 font-semibold text-slate-950">{row.name}</td>
                      <td className="py-3 pr-4 font-medium text-slate-600">{row.original}</td>
                      <td className="py-3 pr-4 font-medium text-slate-600">{row.service}</td>
                      <td className="py-3 pr-4 text-right font-medium text-slate-600">{formatNumber(row.orders)}</td>
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

      <DataPanel title="Catatan Ekspedisi">
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
