"use client";

import { useMemo, useState } from "react";
import { DataPanel } from "@/features/database/components/DataPanel";
import { KpiCard } from "@/features/database/components/KpiCard";
import { StatusBadge } from "@/features/database/components/StatusBadge";
import type { StatusTone } from "@/features/database/types/database.types";
import { usePagedData } from "../../hooks/usePagedData";
import { formatNumber } from "../../lib/format";
import { EditRecordModal, type EditField } from "../EditRecordModal";
import { MasterTable, NotesList, RowActionButton, type MasterColumn } from "../MasterTable";
import { ToolbarSelect } from "../TableToolbar";

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
  "Kolom Pesanan = jumlah pesanan operasional + transaksi CRM yang tertaut ke user tersebut, jadi totalnya bisa lebih besar dari jumlah pesanan saja.",
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
  const users = usePagedData<UserRow>("/api/master/users", ["id", "name", "role", "divisi"]);
  const sumberLain = usePagedData<SumberLainRow>("/api/master/sumber-lain", ["name", "jenis"]);

  // KPI dihitung dari data yang sama dengan tabel — tidak ada angka mati.
  const kpiItems = useMemo(() => {
    const totalOrders = users.allRows.reduce((sum, row) => sum + row.orders, 0);
    const needCheck = users.allRows.filter((row) => row.status !== "Aktif").length;
    return [
      { label: "User Aktif", value: formatNumber(users.allRows.length), detail: "Nama orang", tone: "green" as const },
      { label: "Order Tertaut CS", value: formatNumber(totalOrders), detail: "Pesanan + CRM", tone: "blue" as const },
      { label: "Bukan Nama Orang", value: formatNumber(sumberLain.allRows.length), detail: "Dipisah", tone: "amber" as const },
      { label: "Perlu Dicek", value: formatNumber(needCheck), detail: "Role ganda", tone: "slate" as const },
    ];
  }, [users.allRows, sumberLain.allRows]);

  const saveRow = (updated: UserRow) => {
    users.updateRows((current) => current.map((row) => (row.id === updated.id ? updated : row)));
    setEditingRow(null);
  };
  const deleteRow = (id: string) => {
    if (!window.confirm("Hapus data CS / Tim ini dari tampilan sementara?")) return;
    users.updateRows((current) => current.filter((row) => row.id !== id));
  };

  const userColumns: MasterColumn<UserRow>[] = [
    { key: "id", label: "ID", tone: "muted" },
    { key: "name", label: "Nama", tone: "strong" },
    { key: "role", label: "Role" },
    { key: "divisi", label: "Divisi" },
    { key: "orders", label: "Pesanan", align: "right", render: (row) => formatNumber(row.orders) },
    { key: "status", label: "Status", align: "right", render: (row) => <StatusBadge label={row.status} /> },
  ];

  const sumberLainColumns: MasterColumn<SumberLainRow>[] = [
    { key: "name", label: "Nama", tone: "strong" },
    { key: "jenis", label: "Jenis", render: (row) => <StatusBadge label={row.jenis} tone={jenisTone[row.jenis]} /> },
    { key: "orders", label: "Pesanan", align: "right", render: (row) => formatNumber(row.orders) },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpiItems.map((item) => (
          <KpiCard key={item.label} item={item} />
        ))}
      </div>

      <DataPanel title="Daftar CS / Tim" subtitle="Seluruh user internal yang menangani pelanggan dan order.">
        <MasterTable
          paged={users}
          columns={userColumns}
          rowKey={(row) => row.id}
          searchPlaceholder="Cari nama, role, divisi…"
          minWidth={740}
          toolbar={
            <>
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
            </>
          }
          renderActions={(row) => (
            <>
              <RowActionButton label="Edit" onClick={() => setEditingRow(row)} />
              <RowActionButton label="Hapus" danger onClick={() => deleteRow(row.id)} />
            </>
          )}
        />
      </DataPanel>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <DataPanel title="Bukan Nama Orang" subtitle="Dipisah dari daftar tim (toko, affiliate, penanda, salah input).">
          <MasterTable
            paged={sumberLain}
            columns={sumberLainColumns}
            rowKey={(row) => row.name}
            searchPlaceholder="Cari nama bukan user…"
            minWidth={420}
            maxHeight={420}
            toolbar={
              <>
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
              </>
            }
          />
        </DataPanel>

        <DataPanel title="Catatan CS / Tim">
          <NotesList notes={notes} />
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
