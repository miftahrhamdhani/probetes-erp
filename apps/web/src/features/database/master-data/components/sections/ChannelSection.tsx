"use client";

import { useEffect, useMemo, useState } from "react";
import { DataPanel } from "@/features/database/components/DataPanel";
import { KpiCard } from "@/features/database/components/KpiCard";
import { StatusBadge } from "@/features/database/components/StatusBadge";
import { usePagedData } from "../../hooks/usePagedData";
import { formatNumber, formatRupiah } from "../../lib/format";
import { EditRecordModal, type EditField } from "../EditRecordModal";
import { MasterTable, NotesList, RowActionButton, type MasterColumn } from "../MasterTable";
import { ToolbarSelect } from "../TableToolbar";

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

interface DivisiRow {
  name: string;
  orders: number;
}

const notes = [
  "Channel = tempat order masuk. Jenisnya 4: Akuisisi (iklan), Retensi (CRM/WA), Marketplace (TikTok/Shopee), dan Offline (Stokis) — sesuai arahan owner.",
  "Stokis = jalur penjualan lewat agen offline. Masih 0 karena data lama belum ada transaksi offline; tempatnya sudah disiapkan.",
  "'Belum Tercatat' artinya platform tidak dicatat di data lama — bukan data hilang. Ke depan channel wajib diisi saat input.",
  "Mitra (UP DM, JAWARA, dll.) dicatat pada tabel sendiri, bukan dicampur ke channel.",
];

const channelEditFields: EditField<ChannelRow>[] = [
  { key: "id", label: "ID", readOnly: true },
  { key: "name", label: "Channel" },
  { key: "type", label: "Jenis" },
  { key: "original", label: "Nama Asli" },
  { key: "orders", label: "Pesanan", type: "number" },
  { key: "value", label: "Nilai", type: "number" },
  { key: "status", label: "Status" },
];

const mitraEditFields: EditField<MitraRow>[] = [
  { key: "id", label: "ID", readOnly: true },
  { key: "name", label: "Mitra" },
  { key: "original", label: "Nama Asli" },
  { key: "orders", label: "Pesanan", type: "number" },
  { key: "value", label: "Nilai", type: "number" },
  { key: "status", label: "Status" },
];

export function ChannelSection() {
  const [editingChannel, setEditingChannel] = useState<ChannelRow | null>(null);
  const [editingMitra, setEditingMitra] = useState<MitraRow | null>(null);
  const [divisiRows, setDivisiRows] = useState<DivisiRow[]>([]);
  const channels = usePagedData<ChannelRow>("/api/master/channels", ["id", "name", "type", "original"]);
  const mitra = usePagedData<MitraRow>("/api/master/mitra", ["id", "name", "original"]);

  useEffect(() => {
    let alive = true;
    fetch("/api/master/divisi")
      .then((res) => (res.ok ? (res.json() as Promise<DivisiRow[]>) : Promise.reject()))
      .then((data) => {
        if (alive) setDivisiRows(data);
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, []);

  // KPI dihitung dari data yang sama dengan tabel — tidak ada angka mati.
  const kpiItems = useMemo(() => {
    const tanpaPlatform = channels.allRows.find((row) => row.name === "Belum Tercatat")?.orders ?? 0;
    return [
      { label: "Channel", value: formatNumber(channels.allRows.length), detail: "Termasuk Stokis", tone: "green" as const },
      { label: "Divisi Tim", value: formatNumber(divisiRows.length), detail: "Terpisah", tone: "blue" as const },
      { label: "Mitra", value: formatNumber(mitra.allRows.length), detail: "Tabel sendiri", tone: "green" as const },
      { label: "Pesanan Tanpa Platform", value: formatNumber(tanpaPlatform), detail: "Belum tercatat", tone: "amber" as const },
    ];
  }, [channels.allRows, mitra.allRows, divisiRows]);

  const saveChannel = (updated: ChannelRow) => {
    channels.updateRows((current) => current.map((row) => (row.id === updated.id ? updated : row)));
    setEditingChannel(null);
  };
  const deleteChannel = (id: string) => {
    if (!window.confirm("Hapus data channel ini dari tampilan sementara?")) return;
    channels.updateRows((current) => current.filter((row) => row.id !== id));
  };
  const saveMitra = (updated: MitraRow) => {
    mitra.updateRows((current) => current.map((row) => (row.id === updated.id ? updated : row)));
    setEditingMitra(null);
  };
  const deleteMitra = (id: string) => {
    if (!window.confirm("Hapus data mitra ini dari tampilan sementara?")) return;
    mitra.updateRows((current) => current.filter((row) => row.id !== id));
  };

  const channelColumns: MasterColumn<ChannelRow>[] = [
    { key: "id", label: "ID", tone: "muted" },
    { key: "name", label: "Channel", tone: "strong" },
    { key: "type", label: "Jenis" },
    { key: "original", label: "Nama Asli" },
    { key: "orders", label: "Pesanan", align: "right", render: (row) => formatNumber(row.orders) },
    { key: "value", label: "Nilai", align: "right", tone: "strong", render: (row) => formatRupiah(row.value) },
    { key: "status", label: "Status", align: "right", render: (row) => <StatusBadge label={row.status} /> },
  ];

  const mitraColumns: MasterColumn<MitraRow>[] = [
    { key: "id", label: "ID", tone: "muted" },
    { key: "name", label: "Mitra", tone: "strong" },
    { key: "original", label: "Nama Asli" },
    { key: "orders", label: "Pesanan", align: "right", render: (row) => formatNumber(row.orders) },
    { key: "value", label: "Nilai", align: "right", tone: "strong", render: (row) => formatRupiah(row.value) },
    { key: "status", label: "Status", align: "right", render: (row) => <StatusBadge label={row.status} /> },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpiItems.map((item) => (
          <KpiCard key={item.label} item={item} />
        ))}
      </div>

      <DataPanel title="Daftar Channel" subtitle="Asal order berdasarkan platform.">
        <MasterTable
          paged={channels}
          columns={channelColumns}
          rowKey={(row) => row.id}
          searchPlaceholder="Cari channel, jenis, nama asli…"
          minWidth={820}
          toolbar={
            <>
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
            </>
          }
          renderActions={(row) => (
            <>
              <RowActionButton label="Edit" onClick={() => setEditingChannel(row)} />
              <RowActionButton label="Hapus" danger onClick={() => deleteChannel(row.id)} />
            </>
          )}
        />
      </DataPanel>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <DataPanel title="Daftar Mitra" subtitle="Mitra penjualan dicatat terpisah dari channel." className="lg:col-span-2">
          <MasterTable
            paged={mitra}
            columns={mitraColumns}
            rowKey={(row) => row.id}
            searchPlaceholder="Cari mitra…"
            minWidth={700}
            maxHeight={420}
            toolbar={
              <>
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
              </>
            }
            renderActions={(row) => (
              <>
                <RowActionButton label="Edit" onClick={() => setEditingMitra(row)} />
                <RowActionButton label="Hapus" danger onClick={() => deleteMitra(row.id)} />
              </>
            )}
          />
        </DataPanel>

        <DataPanel title="Divisi Tim" subtitle="Jumlah pesanan yang dikerjakan tiap divisi.">
          {divisiRows.length === 0 ? (
            <p className="py-6 text-center text-sm font-medium text-slate-400">Memuat data…</p>
          ) : (
            <ul className="flex flex-col divide-y divide-slate-100">
              {divisiRows.map((row) => (
                <li key={row.name} className="flex items-center justify-between py-3 text-sm">
                  <span className="font-semibold text-slate-950">{row.name}</span>
                  <span className="font-medium text-slate-600">{formatNumber(row.orders)} pesanan</span>
                </li>
              ))}
            </ul>
          )}
        </DataPanel>
      </div>

      <DataPanel title="Catatan Channel">
        <NotesList notes={notes} />
      </DataPanel>

      {editingChannel && (
        <EditRecordModal
          title="Edit Channel"
          record={editingChannel}
          fields={channelEditFields}
          onClose={() => setEditingChannel(null)}
          onSave={saveChannel}
        />
      )}
      {editingMitra && (
        <EditRecordModal
          title="Edit Mitra"
          record={editingMitra}
          fields={mitraEditFields}
          onClose={() => setEditingMitra(null)}
          onSave={saveMitra}
        />
      )}
    </div>
  );
}
