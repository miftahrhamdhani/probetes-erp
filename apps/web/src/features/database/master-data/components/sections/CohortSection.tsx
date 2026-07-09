"use client";

import { useMemo, useState } from "react";
import { DataPanel } from "@/features/database/components/DataPanel";
import { KpiCard } from "@/features/database/components/KpiCard";
import { StatusBadge } from "@/features/database/components/StatusBadge";
import type { StatusTone } from "@/features/database/types/database.types";
import { usePagedData } from "../../hooks/usePagedData";
import { formatNumber, formatRupiah } from "../../lib/format";
import { EditRecordModal, type EditField } from "../EditRecordModal";
import { MasterTable, NotesList, RowActionButton, type MasterColumn } from "../MasterTable";
import { DateRangeFilter, ToolbarSelect } from "../TableToolbar";

interface CohortSummaryRow {
  id: string;
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
  rowId: number;
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

const clusterTone: Record<string, StatusTone> = {
  Baru: "blue",
  Repeat: "green",
  "High Value": "purple",
  "Perlu Dicek": "amber",
};

const notes = [
  "No. WA dipakai sebagai identitas pelanggan cohort, sesuai data asli (kolom User ID di data lama adalah nomor WA). Pelanggan tanpa No HP tampil \"-\" tapi tetap dibedakan lewat ID Customer.",
  "Belanja beberapa produk sekali checkout = 1 transaksi — baris dengan ID Transaksi sama adalah satu belanjaan.",
  "Frekuensi Trx = berapa kali pelanggan belanja (bukan jumlah barang; jumlah barang ada di Total Qty).",
  "Cluster membantu CS menentukan siapa yang perlu di-follow-up atau diarahkan ke konsultasi WA grup.",
  "Ringkasan Customer Cohort punya 2 tanggal: Beli Awal (transaksi pertama, jadi patokan filter) dan Beli Akhir (transaksi terakhir, info saja). Riwayat Transaksi punya 1 tanggal per baris karena tiap baris memang 1 transaksi.",
  "Frekuensi dan Total Beli di ringkasan dihitung dari data pesanan operasional (sumber utama), sedangkan tabel Riwayat menampilkan transaksi closing CRM — jadi jumlah baris riwayat seorang pelanggan bisa berbeda dengan angka Frekuensi di ringkasannya.",
  "Angka Repeat di sini dihitung dari cluster cohort — bisa sedikit lebih besar daripada menu Pelanggan karena pelanggan berstatus Perlu Dicek tetap punya cluster.",
];

const summaryEditFields: EditField<CohortSummaryRow>[] = [
  { key: "id", label: "ID Customer", readOnly: true },
  { key: "wa", label: "No. WA", readOnly: true },
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
  const summary = usePagedData<CohortSummaryRow>("/api/master/cohort-summary", ["id", "wa", "name"]);
  const riwayat = usePagedData<CohortTxRow>("/api/master/cohort-riwayat", ["wa", "name", "product", "trx"]);

  // KPI dihitung dari data yang sama dengan tabel — tidak ada angka mati.
  const kpiItems = useMemo(() => {
    const byCluster = (cluster: string) => summary.allRows.filter((row) => row.cluster === cluster).length;
    const distinctTrx = new Set(riwayat.allRows.map((row) => row.trx)).size;
    return [
      { label: "Transaksi Tercatat", value: formatNumber(distinctTrx), detail: "Setelah digabung", tone: "blue" as const },
      { label: "Pelanggan Terdata", value: formatNumber(summary.allRows.length), detail: "Punya riwayat", tone: "slate" as const },
      { label: "Pelanggan Repeat", value: formatNumber(byCluster("Repeat")), detail: "Cluster repeat", tone: "green" as const },
      { label: "Bernilai Tinggi", value: formatNumber(byCluster("High Value")), detail: "High Value", tone: "green" as const },
    ];
  }, [summary.allRows, riwayat.allRows]);

  // Kunci edit/hapus: id (customer_id) untuk ringkasan, rowId untuk riwayat.
  // JANGAN pakai No. WA / ID Transaksi — keduanya tidak unik ("-" bersama,
  // baris bundling berbagi TRX id).
  const saveSummary = (updated: CohortSummaryRow) => {
    summary.updateRows((current) => current.map((row) => (row.id === updated.id ? updated : row)));
    setEditingSummary(null);
  };
  const deleteSummary = (id: string) => {
    if (!window.confirm("Hapus data cohort pelanggan ini dari tampilan sementara?")) return;
    summary.updateRows((current) => current.filter((row) => row.id !== id));
  };
  const saveRiwayat = (updated: CohortTxRow) => {
    riwayat.updateRows((current) => current.map((row) => (row.rowId === updated.rowId ? updated : row)));
    setEditingRiwayat(null);
  };
  const deleteRiwayat = (rowId: number) => {
    if (!window.confirm("Hapus baris transaksi ini dari tampilan sementara?")) return;
    riwayat.updateRows((current) => current.filter((row) => row.rowId !== rowId));
  };

  const summaryColumns: MasterColumn<CohortSummaryRow>[] = [
    { key: "first", label: "Beli Awal", tone: "muted", width: 110 },
    { key: "last", label: "Beli Akhir", tone: "muted", width: 110 },
    { key: "id", label: "ID Customer", tone: "muted", width: 130 },
    { key: "wa", label: "No. WA", tone: "muted", width: 140 },
    { key: "name", label: "Nama", tone: "strong", width: 200 },
    { key: "cohort", label: "Cohort", width: 120 },
    { key: "freq", label: "Frekuensi Trx", align: "right", tone: "strong", width: 130, render: (row) => `${formatNumber(row.freq)}x` },
    { key: "qty", label: "Total Qty", align: "right", width: 110, render: (row) => formatNumber(row.qty) },
    { key: "total", label: "Total Beli", align: "right", tone: "strong", width: 150, render: (row) => formatRupiah(row.total) },
    {
      key: "cluster",
      label: "Cluster",
      align: "right",
      width: 130,
      render: (row) => <StatusBadge label={row.cluster} tone={clusterTone[row.cluster]} />,
    },
  ];

  const riwayatColumns: MasterColumn<CohortTxRow>[] = [
    { key: "date", label: "Tanggal", tone: "muted", width: 110 },
    { key: "trx", label: "ID Transaksi", tone: "muted", width: 140 },
    { key: "wa", label: "No. WA", width: 140 },
    { key: "name", label: "Customer", tone: "strong", width: 200 },
    { key: "cs", label: "CS", width: 130 },
    { key: "product", label: "Produk", width: 220 },
    { key: "qty", label: "Qty", align: "right", width: 90, render: (row) => formatNumber(row.qty) },
    { key: "total", label: "Total", align: "right", tone: "strong", width: 140, render: (row) => formatRupiah(row.total) },
    { key: "cohort", label: "Cohort", width: 120 },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpiItems.map((item) => (
          <KpiCard key={item.label} item={item} />
        ))}
      </div>

      <DataPanel title="Ringkasan Customer Cohort" subtitle="Riwayat belanja tiap pelanggan dari waktu ke waktu.">
        <MasterTable
          paged={summary}
          columns={summaryColumns}
          rowKey={(row) => row.id}
          searchPlaceholder="Cari nama, No. WA, ID customer…"
          minWidth={1020}
          virtualized
          toolbar={
            <>
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
              <DateRangeFilter
                label="Beli Awal"
                from={summary.dateFrom.first ?? ""}
                to={summary.dateTo.first ?? ""}
                onFrom={(v) => summary.setDateFrom("first", v)}
                onTo={(v) => summary.setDateTo("first", v)}
              />
            </>
          }
          renderActions={(row) => (
            <>
              <RowActionButton label="Edit" onClick={() => setEditingSummary(row)} />
              <RowActionButton label="Hapus" danger onClick={() => deleteSummary(row.id)} />
            </>
          )}
        />
      </DataPanel>

      <DataPanel title="Riwayat Transaksi Cohort" subtitle="Catatan pembelian per tanggal, sesuai data asli.">
        <MasterTable
          paged={riwayat}
          columns={riwayatColumns}
          rowKey={(row) => String(row.rowId)}
          searchPlaceholder="Cari nama, No. WA, produk, ID transaksi…"
          minWidth={900}
          virtualized
          toolbar={
            <>
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
              <DateRangeFilter
                label="Tanggal Transaksi"
                from={riwayat.dateFrom.date ?? ""}
                to={riwayat.dateTo.date ?? ""}
                onFrom={(v) => riwayat.setDateFrom("date", v)}
                onTo={(v) => riwayat.setDateTo("date", v)}
              />
            </>
          }
          renderActions={(row) => (
            <>
              <RowActionButton label="Edit" onClick={() => setEditingRiwayat(row)} />
              <RowActionButton label="Hapus" danger onClick={() => deleteRiwayat(row.rowId)} />
            </>
          )}
        />
      </DataPanel>

      <DataPanel title="Catatan Cohort">
        <NotesList notes={notes} />
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
