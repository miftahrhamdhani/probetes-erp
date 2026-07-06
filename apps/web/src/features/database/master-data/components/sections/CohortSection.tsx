"use client";

import { DataPanel } from "@/features/database/overview/components/DataPanel";
import { KpiCard } from "@/features/database/overview/components/KpiCard";
import { StatusBadge } from "@/features/database/overview/components/StatusBadge";
import type { StatusTone } from "@/features/database/overview/types/databaseOverview.types";
import { usePagedData } from "../../hooks/usePagedData";
import { formatNumber, formatRupiah } from "../../lib/format";
import { TablePagination } from "../TablePagination";

interface CohortSummaryRow {
  wa: string;
  name: string;
  cohort: string;
  first: string;
  last: string;
  qty: number;
  total: number;
  cluster: string;
}

interface CohortTxRow {
  date: string;
  wa: string;
  name: string;
  cs: string;
  product: string;
  qty: number;
  total: number;
  cohort: string;
}

const kpiItems = [
  { label: "Transaksi Tercatat", value: "20.332", detail: "Data cohort", tone: "blue" as const },
  { label: "Pelanggan Terdata", value: "21.304", detail: "Punya riwayat", tone: "slate" as const },
  { label: "Pelanggan Repeat", value: "6.972", detail: "Beli ulang", tone: "green" as const },
  { label: "Bernilai Tinggi", value: "118", detail: "High Value", tone: "green" as const },
];

const clusterTone: Record<string, StatusTone> = {
  Baru: "blue",
  Repeat: "green",
  "High Value": "purple",
  "Perlu Dicek": "amber",
};

const notes = [
  "No. WA dipakai sebagai ID pelanggan cohort, sesuai data asli (kolom User ID di data lama adalah nomor WA).",
  "Database Cohort menjawab: pelanggan ini baru atau lama, pertama dan terakhir beli kapan, serta total belanjanya berapa.",
  "Cluster membantu CS menentukan siapa yang perlu di-follow-up atau diarahkan ke konsultasi WA grup.",
];

export function CohortSection() {
  const summary = usePagedData<CohortSummaryRow>("/data/cohort_summary.json");
  const riwayat = usePagedData<CohortTxRow>("/data/cohort_riwayat.json");

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpiItems.map((item) => (
          <KpiCard key={item.label} item={item} />
        ))}
      </div>

      <DataPanel title="Ringkasan Customer Cohort" subtitle="Riwayat belanja tiap pelanggan dari waktu ke waktu.">
        {summary.loading && <p className="py-8 text-center text-sm font-medium text-slate-400">Memuat data…</p>}
        {summary.error && (
          <p className="py-8 text-center text-sm font-medium text-amber-600">
            Data belum tersedia. Jalankan export data terlebih dahulu.
          </p>
        )}
        {!summary.loading && !summary.error && (
          <>
            <div className="max-h-[560px] overflow-auto">
              <table className="w-full min-w-[760px] text-sm">
                <thead className="sticky top-0 z-10 bg-white">
                  <tr className="border-b border-slate-200">
                    <th className="pb-3 pr-4 text-left font-bold text-slate-500">No. WA (ID)</th>
                    <th className="pb-3 pr-4 text-left font-bold text-slate-500">Nama</th>
                    <th className="pb-3 pr-4 text-left font-bold text-slate-500">Cohort</th>
                    <th className="pb-3 pr-4 text-left font-bold text-slate-500">Beli Awal</th>
                    <th className="pb-3 pr-4 text-left font-bold text-slate-500">Beli Akhir</th>
                    <th className="pb-3 pr-4 text-right font-bold text-slate-500">Total Qty</th>
                    <th className="pb-3 pr-4 text-right font-bold text-slate-500">Total Beli</th>
                    <th className="pb-3 text-right font-bold text-slate-500">Cluster</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {summary.rows.map((row, index) => (
                    <tr key={`${row.wa}-${index}`}>
                      <td className="py-3 pr-4 font-medium text-slate-500">{row.wa}</td>
                      <td className="py-3 pr-4 font-semibold text-slate-950">{row.name}</td>
                      <td className="py-3 pr-4 font-medium text-slate-600">{row.cohort}</td>
                      <td className="py-3 pr-4 font-medium text-slate-600">{row.first}</td>
                      <td className="py-3 pr-4 font-medium text-slate-600">{row.last}</td>
                      <td className="py-3 pr-4 text-right font-medium text-slate-600">{formatNumber(row.qty)}</td>
                      <td className="py-3 pr-4 text-right font-semibold text-slate-950">{formatRupiah(row.total)}</td>
                      <td className="py-3 text-right">
                        <StatusBadge label={row.cluster} tone={clusterTone[row.cluster]} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <TablePagination
              page={summary.page}
              totalPages={summary.totalPages}
              pageSize={summary.pageSize}
              total={summary.total}
              onPage={summary.setPage}
              onPageSize={summary.setPageSize}
            />
          </>
        )}
      </DataPanel>

      <DataPanel title="Riwayat Transaksi Cohort" subtitle="Catatan pembelian per tanggal, sesuai data asli.">
        {riwayat.loading && <p className="py-8 text-center text-sm font-medium text-slate-400">Memuat data…</p>}
        {riwayat.error && (
          <p className="py-8 text-center text-sm font-medium text-amber-600">
            Data belum tersedia. Jalankan export data terlebih dahulu.
          </p>
        )}
        {!riwayat.loading && !riwayat.error && (
          <>
            <div className="max-h-[560px] overflow-auto">
              <table className="w-full min-w-[760px] text-sm">
                <thead className="sticky top-0 z-10 bg-white">
                  <tr className="border-b border-slate-200">
                    <th className="pb-3 pr-4 text-left font-bold text-slate-500">Tanggal</th>
                    <th className="pb-3 pr-4 text-left font-bold text-slate-500">No. WA (ID)</th>
                    <th className="pb-3 pr-4 text-left font-bold text-slate-500">Customer</th>
                    <th className="pb-3 pr-4 text-left font-bold text-slate-500">CS</th>
                    <th className="pb-3 pr-4 text-left font-bold text-slate-500">Produk</th>
                    <th className="pb-3 pr-4 text-right font-bold text-slate-500">Qty</th>
                    <th className="pb-3 pr-4 text-right font-bold text-slate-500">Total</th>
                    <th className="pb-3 text-left font-bold text-slate-500">Cohort</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {riwayat.rows.map((row, index) => (
                    <tr key={`${row.date}-${row.wa}-${index}`}>
                      <td className="py-3 pr-4 font-medium text-slate-500">{row.date}</td>
                      <td className="py-3 pr-4 font-medium text-slate-600">{row.wa}</td>
                      <td className="py-3 pr-4 font-semibold text-slate-950">{row.name}</td>
                      <td className="py-3 pr-4 font-medium text-slate-600">{row.cs}</td>
                      <td className="py-3 pr-4 font-medium text-slate-600">{row.product}</td>
                      <td className="py-3 pr-4 text-right font-medium text-slate-600">{formatNumber(row.qty)}</td>
                      <td className="py-3 pr-4 text-right font-semibold text-slate-950">{formatRupiah(row.total)}</td>
                      <td className="py-3 font-medium text-slate-600">{row.cohort}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <TablePagination
              page={riwayat.page}
              totalPages={riwayat.totalPages}
              pageSize={riwayat.pageSize}
              total={riwayat.total}
              onPage={riwayat.setPage}
              onPageSize={riwayat.setPageSize}
            />
          </>
        )}
      </DataPanel>

      <DataPanel title="Catatan Cohort">
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
