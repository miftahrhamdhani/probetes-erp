"use client";

import { useState } from "react";
import { DataPanel } from "@/features/database/overview/components/DataPanel";
import { KpiCard } from "@/features/database/overview/components/KpiCard";
import { StatusBadge } from "@/features/database/overview/components/StatusBadge";
import type { StatusTone } from "@/features/database/overview/types/databaseOverview.types";
import { usePagedData } from "../../hooks/usePagedData";
import { useRowVirtualizer } from "../../hooks/useRowVirtualizer";
import { formatNumber } from "../../lib/format";
import { EditRecordModal, type EditField } from "../EditRecordModal";
import { TablePagination } from "../TablePagination";
import { DateRangeFilter, TableToolbar, ToolbarSelect } from "../TableToolbar";

interface CustomerRow {
  id: string;
  name: string;
  phone: string;
  city: string;
  province: string;
  source: string;
  trx: number;
  status: string;
  firstPurchase: string;
}

const kpiItems = [
  { label: "Total Pelanggan", value: "21.603", detail: "Tersedia", tone: "green" as const },
  { label: "Pelanggan Repeat", value: "4.222", detail: "Beli ulang", tone: "blue" as const },
  { label: "Pelanggan Bernilai Tinggi", value: "63", detail: "High Value", tone: "green" as const },
  { label: "Perlu Dicek", value: "2.193", detail: "Tanpa No HP", tone: "amber" as const },
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
  "Channel Utama = channel penjualan (TikTok Shop, Shopee, Meta, Stokis, dst) yang paling sering dipakai pelanggan saat order. \"Belum Tercatat\" berarti channel tidak dicatat di data lama, bukan data hilang.",
  "Provinsi dibaca otomatis dari alamat — pelanggan tanpa alamat (marketplace) provinsinya kosong dulu.",
  "Frekuensi Trx = berapa kali pelanggan belanja; beli beberapa produk sekali checkout dihitung 1 transaksi (sama seperti di Database Cohort). Angka ini total sepanjang waktu, bukan per periode.",
  "Tanggal (kolom paling kiri) = tanggal pelanggan ini pertama kali tercatat/transaksi, sama seperti kolom Tanggal di data lama. Bisa difilter untuk melihat pelanggan yang masuk pada bulan/tanggal tertentu.",
];

const editFields: EditField<CustomerRow>[] = [
  { key: "id", label: "ID", readOnly: true },
  { key: "firstPurchase", label: "Tanggal", readOnly: true },
  { key: "name", label: "Nama" },
  { key: "phone", label: "No. HP" },
  { key: "city", label: "Kota" },
  { key: "province", label: "Provinsi" },
  { key: "source", label: "Channel Utama" },
  { key: "trx", label: "Frekuensi Trx", type: "number" },
  { key: "status", label: "Status" },
];

export function PelangganSection() {
  const [editingRow, setEditingRow] = useState<CustomerRow | null>(null);
  const {
    rows, total, totalAll, loading, error, page, setPage, pageSize, setPageSize, totalPages,
    query, setQuery, filters, setFilter, dateFrom, setDateFrom, dateTo, setDateTo,
    sort, setSort, resetControls, updateRows, hasActiveControls, distinct,
  } = usePagedData<CustomerRow>("/api/master/customers", ["id", "name", "phone", "city", "province"]);

  const saveRow = (updated: CustomerRow) => {
    updateRows((current) => current.map((row) => (row.id === updated.id ? updated : row)));
    setEditingRow(null);
  };
  const deleteRow = (id: string) => {
    if (!window.confirm("Hapus data pelanggan ini dari tampilan sementara?")) return;
    updateRows((current) => current.filter((row) => row.id !== id));
  };

  const ROW_HEIGHT = 45;
  const { containerRef, start, end, topSpacer, bottomSpacer } = useRowVirtualizer<HTMLDivElement>({
    count: rows.length,
    rowHeight: ROW_HEIGHT,
  });
  const visibleRows = rows.slice(start, end);

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
            <TableToolbar
              query={query}
              onQuery={setQuery}
              placeholder="Cari nama, No HP, ID, kota…"
              total={total}
              totalAll={totalAll}
              onReset={resetControls}
              hasActive={hasActiveControls}
            >
              <ToolbarSelect
                value={filters.status ?? ""}
                onChange={(v) => setFilter("status", v)}
                allLabel="Semua Status"
                options={["Baru", "Repeat", "High Value", "Perlu Dicek"].map((s) => ({ value: s, label: s }))}
              />
              <ToolbarSelect
                value={filters.province ?? ""}
                onChange={(v) => setFilter("province", v)}
                allLabel="Semua Provinsi"
                options={distinct("province").map((p) => ({ value: p, label: p }))}
              />
              <ToolbarSelect
                value={sort}
                onChange={setSort}
                allLabel="Urutan asli"
                options={[
                  { value: "trx:desc", label: "Frekuensi Trx terbanyak" },
                  { value: "name:asc", label: "Nama A-Z" },
                ]}
              />
              <DateRangeFilter
                label="Tanggal"
                from={dateFrom.firstPurchase ?? ""}
                to={dateTo.firstPurchase ?? ""}
                onFrom={(v) => setDateFrom("firstPurchase", v)}
                onTo={(v) => setDateTo("firstPurchase", v)}
              />
            </TableToolbar>
            {total === 0 && (
              <p className="py-6 text-center text-sm font-medium text-slate-400">
                Tidak ada data yang cocok dengan pencarian/filter.
              </p>
            )}
            <div ref={containerRef} className="max-h-[560px] overflow-auto">
              <table className="w-full min-w-[980px] text-sm">
                <thead className="sticky top-0 z-10 bg-white">
                  <tr className="border-b border-slate-200">
                    <th className="pb-3 pr-4 text-left font-bold text-slate-500">Tanggal</th>
                    <th className="pb-3 pr-4 text-left font-bold text-slate-500">ID</th>
                    <th className="pb-3 pr-4 text-left font-bold text-slate-500">Nama</th>
                    <th className="pb-3 pr-4 text-left font-bold text-slate-500">No. HP</th>
                    <th className="pb-3 pr-4 text-left font-bold text-slate-500">Kota</th>
                    <th className="pb-3 pr-4 text-left font-bold text-slate-500">Provinsi</th>
                    <th className="pb-3 pr-4 text-left font-bold text-slate-500">Channel Utama</th>
                    <th className="pb-3 pr-4 text-right font-bold text-slate-500">Frekuensi Trx</th>
                    <th className="pb-3 pr-4 text-right font-bold text-slate-500">Status</th>
                    <th className="pb-3 text-right font-bold text-slate-500">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {topSpacer > 0 && (
                    <tr aria-hidden="true" style={{ height: topSpacer }}>
                      <td colSpan={10} />
                    </tr>
                  )}
                  {visibleRows.map((row) => (
                    <tr key={row.id}>
                      <td className="py-3 pr-4 font-medium text-slate-500">{row.firstPurchase || "-"}</td>
                      <td className="py-3 pr-4 font-medium text-slate-500">{row.id}</td>
                      <td className="py-3 pr-4 font-semibold text-slate-950">{row.name}</td>
                      <td className="py-3 pr-4 font-medium text-slate-600">{row.phone}</td>
                      <td className="py-3 pr-4 font-medium text-slate-600">{row.city}</td>
                      <td className="py-3 pr-4 font-medium text-slate-600">{row.province}</td>
                      <td className="py-3 pr-4 font-medium text-slate-600">{row.source}</td>
                      <td className="py-3 pr-4 text-right font-semibold text-slate-950">{formatNumber(row.trx)}x</td>
                      <td className="py-3 pr-4 text-right">
                        <StatusBadge label={row.status} tone={statusTone[row.status]} />
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button type="button" onClick={() => setEditingRow(row)} className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-bold text-slate-600 hover:border-brand-red/40 hover:text-brand-red">Edit</button>
                          <button type="button" onClick={() => deleteRow(row.id)} className="rounded-lg border border-red-100 px-2.5 py-1 text-xs font-bold text-red-600 hover:bg-red-50">Hapus</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {bottomSpacer > 0 && (
                    <tr aria-hidden="true" style={{ height: bottomSpacer }}>
                      <td colSpan={10} />
                    </tr>
                  )}
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

      {editingRow && (
        <EditRecordModal
          title="Edit Pelanggan"
          record={editingRow}
          fields={editFields}
          onClose={() => setEditingRow(null)}
          onSave={saveRow}
        />
      )}
    </div>
  );
}
