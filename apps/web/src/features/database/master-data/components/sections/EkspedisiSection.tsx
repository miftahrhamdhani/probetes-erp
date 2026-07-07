"use client";

import { useState } from "react";
import { DataPanel } from "@/features/database/overview/components/DataPanel";
import { KpiCard } from "@/features/database/overview/components/KpiCard";
import { StatusBadge } from "@/features/database/overview/components/StatusBadge";
import { usePagedData } from "../../hooks/usePagedData";
import { formatNumber } from "../../lib/format";
import { EditRecordModal, type EditField } from "../EditRecordModal";
import { TablePagination } from "../TablePagination";
import { TableToolbar, ToolbarSelect } from "../TableToolbar";

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

const editFields: EditField<CourierRow>[] = [
  { key: "id", label: "ID", readOnly: true },
  { key: "name", label: "Ekspedisi" },
  { key: "original", label: "Nama Asli" },
  { key: "service", label: "Layanan" },
  { key: "orders", label: "Pesanan", type: "number" },
  { key: "status", label: "Status" },
];

export function EkspedisiSection() {
  const [editingCourier, setEditingCourier] = useState<CourierRow | null>(null);
  const {
    rows, total, totalAll, loading, error, page, setPage, pageSize, setPageSize, totalPages,
    query, setQuery, filters, setFilter, sort, setSort, resetControls, hasActiveControls, distinct,
    updateRows,
  } = usePagedData<CourierRow>("/data/couriers.json", ["id", "name", "original", "service"]);

  const saveCourier = (updated: CourierRow) => {
    updateRows((current) => current.map((row) => (row.id === updated.id ? updated : row)));
    setEditingCourier(null);
  };
  const deleteCourier = (id: string) => {
    if (!window.confirm("Hapus data ekspedisi ini dari tampilan sementara?")) return;
    updateRows((current) => current.filter((row) => row.id !== id));
  };

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
            <TableToolbar
              query={query}
              onQuery={setQuery}
              placeholder="Cari ekspedisi, layanan, nama asli…"
              total={total}
              totalAll={totalAll}
              onReset={resetControls}
              hasActive={hasActiveControls}
            >
              <ToolbarSelect
                value={filters.service ?? ""}
                onChange={(v) => setFilter("service", v)}
                allLabel="Semua Layanan"
                options={distinct("service").map((s) => ({ value: s, label: s }))}
              />
              <ToolbarSelect
                value={filters.status ?? ""}
                onChange={(v) => setFilter("status", v)}
                allLabel="Semua Status"
                options={["Aktif", "Perlu dicek"].map((s) => ({ value: s, label: s }))}
              />
              <ToolbarSelect
                value={sort}
                onChange={setSort}
                allLabel="Urutan asli"
                options={[
                  { value: "orders:desc", label: "Pesanan terbanyak" },
                  { value: "name:asc", label: "Ekspedisi A-Z" },
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
                    <th className="pb-3 pr-4 text-left font-bold text-slate-500">Ekspedisi</th>
                    <th className="pb-3 pr-4 text-left font-bold text-slate-500">Nama Asli</th>
                    <th className="pb-3 pr-4 text-left font-bold text-slate-500">Layanan</th>
                    <th className="pb-3 pr-4 text-right font-bold text-slate-500">Pesanan</th>
                    <th className="pb-3 pr-4 text-right font-bold text-slate-500">Status</th>
                    <th className="pb-3 text-right font-bold text-slate-500">Aksi</th>
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
                      <td className="py-3 pr-4 text-right">
                        <StatusBadge label={row.status} />
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button type="button" onClick={() => setEditingCourier(row)} className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-bold text-slate-600 hover:border-brand-red/40 hover:text-brand-red">Edit</button>
                          <button type="button" onClick={() => deleteCourier(row.id)} className="rounded-lg border border-red-100 px-2.5 py-1 text-xs font-bold text-red-600 hover:bg-red-50">Hapus</button>
                        </div>
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

      {editingCourier && (
        <EditRecordModal
          title="Edit Ekspedisi"
          record={editingCourier}
          fields={editFields}
          onClose={() => setEditingCourier(null)}
          onSave={saveCourier}
        />
      )}
    </div>
  );
}
