"use client";

import { useState } from "react";
import { DataPanel } from "@/features/database/overview/components/DataPanel";
import { KpiCard } from "@/features/database/overview/components/KpiCard";
import { StatusBadge } from "@/features/database/overview/components/StatusBadge";
import type { StatusTone } from "@/features/database/overview/types/databaseOverview.types";
import { usePagedData } from "../../hooks/usePagedData";
import { formatNumber, formatRupiah } from "../../lib/format";
import { EditRecordModal, type EditField } from "../EditRecordModal";
import { TablePagination } from "../TablePagination";
import { TableToolbar, ToolbarSelect } from "../TableToolbar";

interface CohortSummaryRow {
  wa: string;
  name: string;
  cohort: string;
  first: string;
  last: string;
  freq: number;
  qty: number;
  total: number;
  cluster: string;
}

interface CohortTxRow {
  date: string;
  trx: string;
  wa: string;
  name: string;
  cs: string;
  product: string;
  qty: number;
  total: number;
  cohort: string;
}

const kpiItems = [
  { label: "Transaksi Tercatat", value: "18.215", detail: "Setelah digabung", tone: "blue" as const },
  { label: "Pelanggan Terdata", value: "21.603", detail: "Punya riwayat", tone: "slate" as const },
  { label: "Pelanggan Repeat", value: "4.428", detail: "Beli ulang", tone: "green" as const },
  { label: "Bernilai Tinggi", value: "63", detail: "High Value", tone: "green" as const },
];

const clusterTone: Record<string, StatusTone> = {
  Baru: "blue",
  Repeat: "green",
  "High Value": "purple",
  "Perlu Dicek": "amber",
};

const notes = [
  "No. WA dipakai sebagai ID pelanggan cohort, sesuai data asli (kolom User ID di data lama adalah nomor WA).",
  "Belanja beberapa produk sekali checkout = 1 transaksi — baris dengan ID Transaksi sama adalah satu belanjaan.",
  "Frekuensi Trx = berapa kali pelanggan belanja (bukan jumlah barang; jumlah barang ada di Total Qty).",
  "Cluster membantu CS menentukan siapa yang perlu di-follow-up atau diarahkan ke konsultasi WA grup.",
];

const summaryEditFields: EditField<CohortSummaryRow>[] = [
  { key: "wa", label: "No. WA (ID)", readOnly: true },
  { key: "name", label: "Nama" },
  { key: "cohort", label: "Cohort" },
  { key: "first", label: "Beli Awal" },
  { key: "last", label: "Beli Akhir" },
  { key: "freq", label: "Frekuensi Trx", type: "number" },
  { key: "qty", label: "Total Qty", type: "number" },
  { key: "total", label: "Total Beli", type: "number" },
  { key: "cluster", label: "Cluster" },
];

const riwayatEditFields: EditField<CohortTxRow>[] = [
  { key: "trx", label: "ID Transaksi", readOnly: true },
  { key: "date", label: "Tanggal" },
  { key: "wa", label: "No. WA" },
  { key: "name", label: "Customer" },
  { key: "cs", label: "CS" },
  { key: "product", label: "Produk" },
  { key: "qty", label: "Qty", type: "number" },
  { key: "total", label: "Total", type: "number" },
  { key: "cohort", label: "Cohort" },
];

export function CohortSection() {
  const [editingSummary, setEditingSummary] = useState<CohortSummaryRow | null>(null);
  const [editingRiwayat, setEditingRiwayat] = useState<CohortTxRow | null>(null);
  const summary = usePagedData<CohortSummaryRow>("/data/cohort_summary.json", ["wa", "name"]);
  const riwayat = usePagedData<CohortTxRow>("/data/cohort_riwayat.json", ["wa", "name", "product", "trx"]);

  const saveSummary = (updated: CohortSummaryRow) => {
    summary.updateRows((current) => current.map((row) => (row.wa === updated.wa ? updated : row)));
    setEditingSummary(null);
  };
  const deleteSummary = (wa: string) => {
    if (!window.confirm("Hapus data cohort pelanggan ini dari tampilan sementara?")) return;
    summary.updateRows((current) => current.filter((row) => row.wa !== wa));
  };
  const saveRiwayat = (updated: CohortTxRow) => {
    riwayat.updateRows((current) =>
      current.map((row) => (row.trx === updated.trx && row.wa === updated.wa ? updated : row)),
    );
    setEditingRiwayat(null);
  };
  const deleteRiwayat = (trx: string, wa: string) => {
    if (!window.confirm("Hapus baris transaksi ini dari tampilan sementara?")) return;
    riwayat.updateRows((current) => current.filter((row) => !(row.trx === trx && row.wa === wa)));
  };

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
            <TableToolbar
              query={summary.query}
              onQuery={summary.setQuery}
              placeholder="Cari nama atau No. WA…"
              total={summary.total}
              totalAll={summary.totalAll}
              onReset={summary.resetControls}
              hasActive={summary.hasActiveControls}
            >
              <ToolbarSelect
                value={summary.filters.cluster ?? ""}
                onChange={(v) => summary.setFilter("cluster", v)}
                allLabel="Semua Cluster"
                options={["Baru", "Repeat", "High Value"].map((s) => ({ value: s, label: s }))}
              />
              <ToolbarSelect
                value={summary.sort}
                onChange={summary.setSort}
                allLabel="Urutan asli"
                options={[
                  { value: "total:desc", label: "Total beli terbesar" },
                  { value: "freq:desc", label: "Frekuensi terbanyak" },
                  { value: "last:desc", label: "Beli terakhir terbaru" },
                  { value: "name:asc", label: "Nama A-Z" },
                ]}
              />
            </TableToolbar>
            {summary.total === 0 && (
              <p className="py-6 text-center text-sm font-medium text-slate-400">
                Tidak ada data yang cocok dengan pencarian/filter.
              </p>
            )}
            <div className="max-h-[560px] overflow-auto">
              <table className="w-full min-w-[900px] text-sm">
                <thead className="sticky top-0 z-10 bg-white">
                  <tr className="border-b border-slate-200">
                    <th className="pb-3 pr-4 text-left font-bold text-slate-500">No. WA (ID)</th>
                    <th className="pb-3 pr-4 text-left font-bold text-slate-500">Nama</th>
                    <th className="pb-3 pr-4 text-left font-bold text-slate-500">Cohort</th>
                    <th className="pb-3 pr-4 text-left font-bold text-slate-500">Beli Awal</th>
                    <th className="pb-3 pr-4 text-left font-bold text-slate-500">Beli Akhir</th>
                    <th className="pb-3 pr-4 text-right font-bold text-slate-500">Frekuensi Trx</th>
                    <th className="pb-3 pr-4 text-right font-bold text-slate-500">Total Qty</th>
                    <th className="pb-3 pr-4 text-right font-bold text-slate-500">Total Beli</th>
                    <th className="pb-3 pr-4 text-right font-bold text-slate-500">Cluster</th>
                    <th className="pb-3 text-right font-bold text-slate-500">Aksi</th>
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
                      <td className="py-3 pr-4 text-right font-semibold text-slate-950">{formatNumber(row.freq)}x</td>
                      <td className="py-3 pr-4 text-right font-medium text-slate-600">{formatNumber(row.qty)}</td>
                      <td className="py-3 pr-4 text-right font-semibold text-slate-950">{formatRupiah(row.total)}</td>
                      <td className="py-3 pr-4 text-right">
                        <StatusBadge label={row.cluster} tone={clusterTone[row.cluster]} />
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button type="button" onClick={() => setEditingSummary(row)} className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-bold text-slate-600 hover:border-brand-red/40 hover:text-brand-red">Edit</button>
                          <button type="button" onClick={() => deleteSummary(row.wa)} className="rounded-lg border border-red-100 px-2.5 py-1 text-xs font-bold text-red-600 hover:bg-red-50">Hapus</button>
                        </div>
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
            <TableToolbar
              query={riwayat.query}
              onQuery={riwayat.setQuery}
              placeholder="Cari nama, No. WA, produk, ID transaksi…"
              total={riwayat.total}
              totalAll={riwayat.totalAll}
              onReset={riwayat.resetControls}
              hasActive={riwayat.hasActiveControls}
            >
              <ToolbarSelect
                value={riwayat.filters.product ?? ""}
                onChange={(v) => riwayat.setFilter("product", v)}
                allLabel="Semua Produk"
                options={riwayat.distinct("product").map((p) => ({ value: p, label: p }))}
              />
              <ToolbarSelect
                value={riwayat.sort}
                onChange={riwayat.setSort}
                allLabel="Urutan asli"
                options={[
                  { value: "date:desc", label: "Tanggal terbaru" },
                  { value: "date:asc", label: "Tanggal terlama" },
                  { value: "total:desc", label: "Nilai terbesar" },
                ]}
              />
            </TableToolbar>
            {riwayat.total === 0 && (
              <p className="py-6 text-center text-sm font-medium text-slate-400">
                Tidak ada data yang cocok dengan pencarian/filter.
              </p>
            )}
            <div className="max-h-[560px] overflow-auto">
              <table className="w-full min-w-[900px] text-sm">
                <thead className="sticky top-0 z-10 bg-white">
                  <tr className="border-b border-slate-200">
                    <th className="pb-3 pr-4 text-left font-bold text-slate-500">Tanggal</th>
                    <th className="pb-3 pr-4 text-left font-bold text-slate-500">ID Transaksi</th>
                    <th className="pb-3 pr-4 text-left font-bold text-slate-500">No. WA</th>
                    <th className="pb-3 pr-4 text-left font-bold text-slate-500">Customer</th>
                    <th className="pb-3 pr-4 text-left font-bold text-slate-500">CS</th>
                    <th className="pb-3 pr-4 text-left font-bold text-slate-500">Produk</th>
                    <th className="pb-3 pr-4 text-right font-bold text-slate-500">Qty</th>
                    <th className="pb-3 pr-4 text-right font-bold text-slate-500">Total</th>
                    <th className="pb-3 pr-4 text-left font-bold text-slate-500">Cohort</th>
                    <th className="pb-3 text-right font-bold text-slate-500">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {riwayat.rows.map((row, index) => (
                    <tr key={`${row.trx}-${index}`}>
                      <td className="py-3 pr-4 font-medium text-slate-500">{row.date}</td>
                      <td className="py-3 pr-4 font-medium text-slate-500">{row.trx}</td>
                      <td className="py-3 pr-4 font-medium text-slate-600">{row.wa}</td>
                      <td className="py-3 pr-4 font-semibold text-slate-950">{row.name}</td>
                      <td className="py-3 pr-4 font-medium text-slate-600">{row.cs}</td>
                      <td className="py-3 pr-4 font-medium text-slate-600">{row.product}</td>
                      <td className="py-3 pr-4 text-right font-medium text-slate-600">{formatNumber(row.qty)}</td>
                      <td className="py-3 pr-4 text-right font-semibold text-slate-950">{formatRupiah(row.total)}</td>
                      <td className="py-3 pr-4 font-medium text-slate-600">{row.cohort}</td>
                      <td className="py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button type="button" onClick={() => setEditingRiwayat(row)} className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-bold text-slate-600 hover:border-brand-red/40 hover:text-brand-red">Edit</button>
                          <button type="button" onClick={() => deleteRiwayat(row.trx, row.wa)} className="rounded-lg border border-red-100 px-2.5 py-1 text-xs font-bold text-red-600 hover:bg-red-50">Hapus</button>
                        </div>
                      </td>
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

      {editingSummary && (
        <EditRecordModal
          title="Edit Cohort Pelanggan"
          record={editingSummary}
          fields={summaryEditFields}
          onClose={() => setEditingSummary(null)}
          onSave={saveSummary}
        />
      )}
      {editingRiwayat && (
        <EditRecordModal
          title="Edit Riwayat Transaksi"
          record={editingRiwayat}
          fields={riwayatEditFields}
          onClose={() => setEditingRiwayat(null)}
          onSave={saveRiwayat}
        />
      )}
    </div>
  );
}
