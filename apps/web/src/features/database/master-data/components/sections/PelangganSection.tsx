"use client";

import { useMemo, useState } from "react";
import { DataPanel } from "@/features/database/components/DataPanel";
import { KpiCard } from "@/features/database/components/KpiCard";
import { StatusBadge } from "@/features/database/components/StatusBadge";
import type { StatusTone } from "@/features/database/types/database.types";
import { usePagedData } from "../../hooks/usePagedData";
import { formatNumber } from "../../lib/format";
import { DetailRecordModal } from "../DetailRecordModal";
import { EditRecordModal, type EditField } from "../EditRecordModal";
import { MasterTable, NotesList, RowActionButton, type MasterColumn } from "../MasterTable";
import { DateRangeFilter, ToolbarSelect } from "../TableToolbar";

interface CustomerRow {
  id: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  source: string;
  trx: number;
  status: string;
  firstPurchase: string;
}

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
  "Angka Repeat di sini dihitung dari status pelanggan. Di Database Cohort, Repeat dihitung dari cluster cohort — pelanggan berstatus Perlu Dicek tetap punya cluster, jadi angkanya bisa sedikit lebih besar di sana.",
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
  const [detailRow, setDetailRow] = useState<CustomerRow | null>(null);
  const paged = usePagedData<CustomerRow>("/api/master/customers", ["id", "name", "phone", "city", "province"]);
  const { allRows, filters, setFilter, dateFrom, setDateFrom, dateTo, setDateTo, sort, setSort, distinct, updateRows } = paged;

  // KPI dihitung dari data yang sama dengan tabel — tidak ada angka mati.
  const kpiItems = useMemo(() => {
    const byStatus = (status: string) => allRows.filter((row) => row.status === status).length;
    return [
      { label: "Total Pelanggan", value: formatNumber(allRows.length), detail: "Terdata", tone: "green" as const },
      { label: "Pelanggan Repeat", value: formatNumber(byStatus("Repeat")), detail: "Beli ulang", tone: "blue" as const },
      { label: "Pelanggan Bernilai Tinggi", value: formatNumber(byStatus("High Value")), detail: "High Value", tone: "green" as const },
      { label: "Perlu Dicek", value: formatNumber(byStatus("Perlu Dicek")), detail: "Data belum lengkap", tone: "amber" as const },
    ];
  }, [allRows]);

  const saveRow = (updated: CustomerRow) => {
    updateRows((current) => current.map((row) => (row.id === updated.id ? updated : row)));
    setEditingRow(null);
  };
  const deleteRow = (id: string) => {
    if (!window.confirm("Hapus data pelanggan ini dari tampilan sementara?")) return;
    updateRows((current) => current.filter((row) => row.id !== id));
  };

  const columns: MasterColumn<CustomerRow>[] = [
    { key: "firstPurchase", label: "Tanggal", tone: "muted", width: 110, render: (row) => row.firstPurchase || "-" },
    { key: "id", label: "ID", tone: "muted", width: 130 },
    { key: "name", label: "Nama", tone: "strong", width: 210 },
    { key: "phone", label: "No. HP", width: 140 },
    { key: "city", label: "Kota", width: 160 },
    { key: "province", label: "Provinsi", width: 160 },
    { key: "source", label: "Channel Utama", width: 150 },
    { key: "trx", label: "Frekuensi Trx", align: "right", tone: "strong", width: 130, render: (row) => `${formatNumber(row.trx)}x` },
    {
      key: "status",
      label: "Status",
      align: "right",
      width: 130,
      render: (row) => <StatusBadge label={row.status} tone={statusTone[row.status]} />,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpiItems.map((item) => (
          <KpiCard key={item.label} item={item} />
        ))}
      </div>

      <DataPanel title="Daftar Pelanggan" subtitle="Seluruh pelanggan hasil penggabungan data.">
        <MasterTable
          paged={paged}
          columns={columns}
          rowKey={(row) => row.id}
          searchPlaceholder="Cari nama, No HP, ID, kota…"
          minWidth={980}
          virtualized
          toolbar={
            <>
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
            </>
          }
          renderActions={(row) => (
            <>
              <RowActionButton label="Lihat" onClick={() => setDetailRow(row)} />
              <RowActionButton label="Edit" onClick={() => setEditingRow(row)} />
              <RowActionButton label="Hapus" danger onClick={() => deleteRow(row.id)} />
            </>
          )}
        />
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
          <NotesList notes={notes} />
        </DataPanel>
      </div>

      {detailRow && (
        <DetailRecordModal
          title="Detail Pelanggan"
          subtitle="Informasi lengkap pelanggan dari database ERP."
          fields={[
            { label: "Tanggal", value: detailRow.firstPurchase },
            { label: "ID Customer", value: detailRow.id },
            { label: "Nama", value: detailRow.name },
            { label: "No. HP", value: detailRow.phone },
            { label: "Alamat Lengkap", value: detailRow.address },
            { label: "Kota", value: detailRow.city },
            { label: "Provinsi", value: detailRow.province },
            { label: "Channel Utama", value: detailRow.source },
            { label: "Frekuensi Transaksi", value: `${formatNumber(detailRow.trx)}x` },
            { label: "Status", value: detailRow.status },
          ]}
          onClose={() => setDetailRow(null)}
        />
      )}

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
