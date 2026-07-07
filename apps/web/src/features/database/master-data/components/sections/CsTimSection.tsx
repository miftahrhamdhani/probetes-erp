"use client";

import { useState } from "react";
import { DataPanel } from "@/features/database/overview/components/DataPanel";
import { KpiCard } from "@/features/database/overview/components/KpiCard";
import { StatusBadge } from "@/features/database/overview/components/StatusBadge";
import type { StatusTone } from "@/features/database/overview/types/databaseOverview.types";
import { usePagedData } from "../../hooks/usePagedData";
import { formatNumber } from "../../lib/format";
import { EditRecordModal, type EditField } from "../EditRecordModal";
import { TablePagination } from "../TablePagination";
import { TableToolbar, ToolbarSelect } from "../TableToolbar";

interface UserRow {
  id: string;
  name: string;
  role: string;
  divisi: string;
  orders: number;
  status: string;
}

interface SumberLainRow {
  name: string;
  jenis: string;
  orders: number;
}

const kpiItems = [
  { label: "User Aktif", value: "62", detail: "Nama orang", tone: "green" as const },
  { label: "Order Tertaut CS", value: "39.085", detail: "Terhubung", tone: "blue" as const },
  { label: "Bukan Nama Orang", value: "32", detail: "Dipisah", tone: "amber" as const },
  { label: "Nama Mirip", value: "8", detail: "Perlu dicek", tone: "slate" as const },
];

const jenisTone: Record<string, StatusTone> = {
  "Toko/Brand": "blue",
  Kategori: "purple",
  Penanda: "slate",
  Sumber: "amber",
  Mitra: "green",
  "Salah Input": "red",
};

const notes = [
  "Perbedaan huruf besar/kecil sudah digabung — WAHYU dan Wahyu dihitung satu orang.",
  "Nama mirip (FIA/FIAN, Elin/Erlin, Anggi/Anggit) masih dipisah, menunggu konfirmasi apakah orang yang sama.",
  "Nama toko, affiliate, dan penanda dikeluarkan dari daftar tim sesuai keputusan owner.",
];

const editFields: EditField<UserRow>[] = [
  { key: "id", label: "ID", readOnly: true },
  { key: "name", label: "Nama" },
  { key: "role", label: "Role" },
  { key: "divisi", label: "Divisi" },
  { key: "orders", label: "Pesanan", type: "number" },
  { key: "status", label: "Status" },
];

export function CsTimSection() {
  const [editingRow, setEditingRow] = useState<UserRow | null>(null);
  const users = usePagedData<UserRow>("/data/users.json", ["id", "name", "role", "divisi"]);
  const sumberLain = usePagedData<SumberLainRow>("/data/sumber_lain.json", ["name", "jenis"]);

  const saveRow = (updated: UserRow) => {
    users.updateRows((current) => current.map((row) => (row.id === updated.id ? updated : row)));
    setEditingRow(null);
  };
  const deleteRow = (id: string) => {
    if (!window.confirm("Hapus data CS / Tim ini dari tampilan sementara?")) return;
    users.updateRows((current) => current.filter((row) => row.id !== id));
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpiItems.map((item) => (
          <KpiCard key={item.label} item={item} />
        ))}
      </div>

      <DataPanel title="Daftar CS / Tim" subtitle="Seluruh user internal yang menangani pelanggan dan order.">
        {users.loading && <p className="py-8 text-center text-sm font-medium text-slate-400">Memuat data…</p>}
        {users.error && (
          <p className="py-8 text-center text-sm font-medium text-amber-600">
            Data belum tersedia. Jalankan export data terlebih dahulu.
          </p>
        )}
        {!users.loading && !users.error && (
          <>
            <TableToolbar
              query={users.query}
              onQuery={users.setQuery}
              placeholder="Cari nama, role, divisi…"
              total={users.total}
              totalAll={users.totalAll}
              onReset={users.resetControls}
              hasActive={users.hasActiveControls}
            >
              <ToolbarSelect
                value={users.filters.role ?? ""}
                onChange={(v) => users.setFilter("role", v)}
                allLabel="Semua Role"
                options={users.distinct("role").map((r) => ({ value: r, label: r }))}
              />
              <ToolbarSelect
                value={users.filters.status ?? ""}
                onChange={(v) => users.setFilter("status", v)}
                allLabel="Semua Status"
                options={["Aktif", "Perlu dicek"].map((s) => ({ value: s, label: s }))}
              />
              <ToolbarSelect
                value={users.sort}
                onChange={users.setSort}
                allLabel="Urutan asli"
                options={[
                  { value: "orders:desc", label: "Pesanan terbanyak" },
                  { value: "name:asc", label: "Nama A-Z" },
                ]}
              />
            </TableToolbar>
            {users.total === 0 && (
              <p className="py-6 text-center text-sm font-medium text-slate-400">
                Tidak ada data yang cocok dengan pencarian/filter.
              </p>
            )}
            <div className="max-h-[560px] overflow-auto">
              <table className="w-full min-w-[740px] text-sm">
                <thead className="sticky top-0 z-10 bg-white">
                  <tr className="border-b border-slate-200">
                    <th className="pb-3 pr-4 text-left font-bold text-slate-500">ID</th>
                    <th className="pb-3 pr-4 text-left font-bold text-slate-500">Nama</th>
                    <th className="pb-3 pr-4 text-left font-bold text-slate-500">Role</th>
                    <th className="pb-3 pr-4 text-left font-bold text-slate-500">Divisi</th>
                    <th className="pb-3 pr-4 text-right font-bold text-slate-500">Pesanan</th>
                    <th className="pb-3 pr-4 text-right font-bold text-slate-500">Status</th>
                    <th className="pb-3 text-right font-bold text-slate-500">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.rows.map((row) => (
                    <tr key={row.id}>
                      <td className="py-3 pr-4 font-medium text-slate-500">{row.id}</td>
                      <td className="py-3 pr-4 font-semibold text-slate-950">{row.name}</td>
                      <td className="py-3 pr-4 font-medium text-slate-600">{row.role}</td>
                      <td className="py-3 pr-4 font-medium text-slate-600">{row.divisi}</td>
                      <td className="py-3 pr-4 text-right font-medium text-slate-600">{formatNumber(row.orders)}</td>
                      <td className="py-3 pr-4 text-right">
                        <StatusBadge label={row.status} />
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button type="button" onClick={() => setEditingRow(row)} className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-bold text-slate-600 hover:border-brand-red/40 hover:text-brand-red">Edit</button>
                          <button type="button" onClick={() => deleteRow(row.id)} className="rounded-lg border border-red-100 px-2.5 py-1 text-xs font-bold text-red-600 hover:bg-red-50">Hapus</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <TablePagination
              page={users.page}
              totalPages={users.totalPages}
              pageSize={users.pageSize}
              total={users.total}
              onPage={users.setPage}
              onPageSize={users.setPageSize}
            />
          </>
        )}
      </DataPanel>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <DataPanel title="Bukan Nama Orang" subtitle="Dipisah dari daftar tim (toko, affiliate, penanda, salah input).">
          {sumberLain.loading && <p className="py-8 text-center text-sm font-medium text-slate-400">Memuat data…</p>}
          {sumberLain.error && (
            <p className="py-8 text-center text-sm font-medium text-amber-600">
              Data belum tersedia. Jalankan export data terlebih dahulu.
            </p>
          )}
          {!sumberLain.loading && !sumberLain.error && (
            <>
              <TableToolbar
                query={sumberLain.query}
                onQuery={sumberLain.setQuery}
                placeholder="Cari nama bukan user…"
                total={sumberLain.total}
                totalAll={sumberLain.totalAll}
                onReset={sumberLain.resetControls}
                hasActive={sumberLain.hasActiveControls}
              >
                <ToolbarSelect
                  value={sumberLain.filters.jenis ?? ""}
                  onChange={(v) => sumberLain.setFilter("jenis", v)}
                  allLabel="Semua Jenis"
                  options={sumberLain.distinct("jenis").map((j) => ({ value: j, label: j }))}
                />
                <ToolbarSelect
                  value={sumberLain.sort}
                  onChange={sumberLain.setSort}
                  allLabel="Urutan asli"
                  options={[
                    { value: "orders:desc", label: "Pesanan terbanyak" },
                    { value: "name:asc", label: "Nama A-Z" },
                  ]}
                />
              </TableToolbar>
              {sumberLain.total === 0 && (
                <p className="py-6 text-center text-sm font-medium text-slate-400">
                  Tidak ada data yang cocok dengan pencarian/filter.
                </p>
              )}
              <div className="max-h-[420px] overflow-auto">
                <table className="w-full min-w-[420px] text-sm">
                  <thead className="sticky top-0 z-10 bg-white">
                    <tr className="border-b border-slate-200">
                      <th className="pb-3 pr-4 text-left font-bold text-slate-500">Nama</th>
                      <th className="pb-3 pr-4 text-left font-bold text-slate-500">Jenis</th>
                      <th className="pb-3 text-right font-bold text-slate-500">Pesanan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sumberLain.rows.map((row) => (
                      <tr key={row.name}>
                        <td className="py-3 pr-4 font-semibold text-slate-950">{row.name}</td>
                        <td className="py-3 pr-4">
                          <StatusBadge label={row.jenis} tone={jenisTone[row.jenis]} />
                        </td>
                        <td className="py-3 text-right font-medium text-slate-600">{formatNumber(row.orders)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <TablePagination
                page={sumberLain.page}
                totalPages={sumberLain.totalPages}
                pageSize={sumberLain.pageSize}
                total={sumberLain.total}
                onPage={sumberLain.setPage}
                onPageSize={sumberLain.setPageSize}
              />
            </>
          )}
        </DataPanel>

        <DataPanel title="Catatan CS / Tim">
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
          title="Edit CS / Tim"
          record={editingRow}
          fields={editFields}
          onClose={() => setEditingRow(null)}
          onSave={saveRow}
        />
      )}
    </div>
  );
}
