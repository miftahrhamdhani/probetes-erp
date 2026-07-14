"use client";

import { useMemo, useState } from "react";
import { DataPanel } from "@/features/database/components/DataPanel";
import { KpiCard } from "@/features/database/components/KpiCard";
import { StatusBadge } from "@/features/database/components/StatusBadge";
import type { StatusTone } from "@/features/database/types/database.types";
import type { CustomerListItem } from "@/server/modules/master/customers/customers.types";
import { usePagedData } from "../../hooks/usePagedData";
import { formatNumber, formatRupiah } from "../../lib/format";
import { DetailRecordModal } from "../DetailRecordModal";
import { EditRecordModal, type EditField } from "../EditRecordModal";
import { MasterTable, NotesList, RowActionButton, type MasterColumn } from "../MasterTable";
import { DateRangeFilter, ToolbarSelect } from "../TableToolbar";

type CustomerRow = CustomerListItem;
type CustomerTab = "all" | "complete" | "validation";

const statusTone: Record<string, StatusTone> = {
  Baru: "blue",
  Repeat: "green",
  "High Value": "purple",
  "Perlu Dicek": "amber",
  Valid: "green",
  Lengkap: "green",
  "Belum Lengkap": "amber",
  Tersensor: "red",
  "Perlu Validasi": "amber",
  "Potensi Duplikat": "purple",
  "Belum Bisa Dipastikan": "slate",
};

const legendItems = [
  { label: "Lengkap", description: "Nama, No. HP/WA, alamat, dan source dapat digunakan." },
  { label: "Belum Lengkap", description: "Ada identitas wajib atau source yang belum tersedia." },
  { label: "Tersensor", description: "Ada identitas yang masih disamarkan oleh sumber data." },
  { label: "Potensi Duplikat", description: "Penanda untuk audit identitas dan riwayat pada data sumber." },
  { label: "Belum Bisa Dipastikan", description: "Status pelanggan belum dipercaya karena identitas bermasalah." },
];

const notes = [
  "Status Baru, Repeat, atau High Value hanya ditampilkan bila identitas pelanggan lengkap dan tidak sedang perlu validasi.",
  "Pelanggan tanpa No. HP/WA atau alamat tidak dianggap unik hanya berdasarkan nama dan alamat; datanya masuk antrean validasi.",
  "Source pertama/terakhir berasal dari channel transaksi. Belum Tercatat berarti data lama belum memiliki pemetaan channel yang jelas.",
  "Filter CRM hanya menampilkan source yang memang berlabel CRM; source lama tidak ditebak sebagai CRM.",
  "Potensi duplikat hanya penanda untuk audit data sumber dan tidak menjalankan perubahan otomatis apa pun.",
  "Transaksi Terakhir selalu menjadi kolom tanggal paling kiri dan dapat difilter per rentang tanggal.",
];

// Identitas inti dapat diedit. Metrik transaksi, source, dan status hasil
// penilaian backend tetap read-only supaya operator tidak mengubah hasil hitung.
const editFields: EditField<CustomerRow>[] = [
  { key: "id", label: "ID", readOnly: true },
  { key: "lastTransaction", label: "Transaksi Terakhir", readOnly: true },
  { key: "name", label: "Nama" },
  { key: "phone", label: "No. HP/WA" },
  { key: "address", label: "Alamat" },
  { key: "city", label: "Kota" },
  { key: "province", label: "Provinsi" },
  { key: "firstSource", label: "Sumber Pertama", readOnly: true },
  { key: "lastSource", label: "Sumber Terakhir", readOnly: true },
  { key: "platformChannel", label: "Platform / Channel", readOnly: true },
  { key: "totalTransactions", label: "Total Transaksi", type: "number", readOnly: true },
  { key: "totalPurchase", label: "Total Pembelian", type: "number", readOnly: true },
  { key: "customerStatus", label: "Status Pelanggan", readOnly: true },
  { key: "completenessStatus", label: "Status Kelengkapan", readOnly: true },
  { key: "validationStatus", label: "Status Validasi", readOnly: true },
];

export function PelangganSection() {
  const [activeTab, setActiveTab] = useState<CustomerTab>("all");
  const [editingRow, setEditingRow] = useState<CustomerRow | null>(null);
  const [detailRow, setDetailRow] = useState<CustomerRow | null>(null);
  const paged = usePagedData<CustomerRow>(
    "/api/master/customers",
    ["id", "name", "phone", "address", "city", "firstSource", "lastSource"],
    {
      initialSort: "lastTransaction:desc",
      dateKeys: ["lastTransaction", "firstPurchase"],
      tieBreakerKey: "id",
    },
  );
  const {
    allRows,
    filters,
    setFilter,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    sort,
    setSort,
    distinct,
    updateRows,
    reload,
  } = paged;

  const summary = useMemo(() => ({
    all: allRows.length,
    complete: allRows.filter((row) => row.isComplete).length,
    validation: allRows.filter((row) => row.needsValidation).length,
    duplicate: allRows.filter((row) => row.isPotentialDuplicate).length,
  }), [allRows]);

  const kpiItems = useMemo(() => [
    { label: "Total Pelanggan", value: formatNumber(summary.all), detail: "Semua data", tone: "blue" as const },
    { label: "Data Lengkap", value: formatNumber(summary.complete), detail: "Siap digunakan", tone: "green" as const },
    { label: "Perlu Validasi", value: formatNumber(summary.validation), detail: "Perlu ditindaklanjuti", tone: "amber" as const },
    { label: "Potensi Duplikat", value: formatNumber(summary.duplicate), detail: "Perlu audit sumber", tone: "red" as const },
  ], [summary]);

  const tabs: Array<{ id: CustomerTab; label: string; count: number }> = [
    { id: "all", label: "Semua Data", count: summary.all },
    { id: "complete", label: "Data Lengkap", count: summary.complete },
    { id: "validation", label: "Data Perlu Validasi", count: summary.validation },
  ];

  const selectTab = (tab: CustomerTab) => {
    setActiveTab(tab);
    setFilter("isComplete", tab === "complete" ? "true" : "");
    setFilter("needsValidation", tab === "validation" ? "true" : "");
  };

  const resetControls = () => {
    setActiveTab("all");
    paged.resetControls();
  };

  const tablePaged = { ...paged, resetControls };

  const saveRow = async (updated: CustomerRow) => {
    const res = await fetch(`/api/master/customers/${encodeURIComponent(updated.id)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: updated.name,
        phone: updated.phone,
        address: updated.address,
        city: updated.city,
        province: updated.province,
      }),
    });
    if (!res.ok) {
      const msg = (await res.json().catch(() => ({}))) as { error?: string };
      window.alert(msg.error ?? "Gagal menyimpan perubahan.");
      return;
    }
    setEditingRow(null);
    reload();
  };

  // Hapus di UI tetap memakai soft-delete (arsip), tidak menghilangkan data permanen.
  const deleteRow = async (id: string) => {
    if (!window.confirm("Arsipkan pelanggan ini? Data tidak dihapus permanen, hanya disembunyikan dari daftar.")) return;
    const res = await fetch(`/api/master/customers/${encodeURIComponent(id)}`, { method: "DELETE" });
    if (!res.ok) {
      const msg = (await res.json().catch(() => ({}))) as { error?: string };
      window.alert(msg.error ?? "Gagal mengarsipkan pelanggan.");
      return;
    }
    updateRows((current) => current.filter((row) => row.id !== id), { persisted: true });
  };

  const baseColumns: MasterColumn<CustomerRow>[] = [
    { key: "lastTransaction", label: "Transaksi Terakhir", tone: "muted", width: 140, render: (row) => row.lastTransaction || "-" },
    { key: "id", label: "ID", tone: "muted", width: 130 },
    { key: "name", label: "Nama", tone: "strong", width: 190 },
    { key: "phone", label: "No. HP/WA", width: 140 },
    { key: "address", label: "Alamat", width: 260 },
    { key: "city", label: "Kota", width: 150 },
    { key: "firstSource", label: "Sumber Pertama", width: 145 },
    { key: "lastSource", label: "Sumber Terakhir", width: 145 },
    { key: "platformChannel", label: "Platform / Channel", width: 190 },
    { key: "totalTransactions", label: "Total Trx", align: "right", tone: "strong", width: 110, render: (row) => `${formatNumber(row.totalTransactions)}x` },
    { key: "totalPurchase", label: "Total Pembelian", align: "right", tone: "strong", width: 160, render: (row) => formatRupiah(row.totalPurchase) },
    { key: "customerStatus", label: "Status Pelanggan", width: 170, render: (row) => <StatusBadge label={row.customerStatus} tone={statusTone[row.customerStatus]} /> },
    { key: "completenessStatus", label: "Kelengkapan", width: 155, render: (row) => <StatusBadge label={row.completenessStatus} tone={statusTone[row.completenessStatus]} /> },
    { key: "validationStatus", label: "Validasi", width: 180, render: (row) => <StatusBadge label={row.validationStatus} tone={statusTone[row.validationStatus]} /> },
  ];
  const validationColumns: MasterColumn<CustomerRow>[] = activeTab === "validation"
    ? [
        { key: "validationReason", label: "Alasan Validasi", width: 290 },
        { key: "recommendation", label: "Rekomendasi", width: 310 },
      ]
    : [];
  const columns = [...baseColumns, ...validationColumns];

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpiItems.map((item) => <KpiCard key={item.label} item={item} />)}
      </div>

      <DataPanel
        title="Daftar Pelanggan"
        subtitle="Klik baris untuk melihat data lengkap. Status kelengkapan dan validasi dihitung read-only."
      >
        <div className="mb-5 border-b border-slate-200" role="tablist" aria-label="Tampilan data pelanggan">
          <div className="flex min-w-max gap-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.id}
                onClick={() => selectTab(tab.id)}
                className={`border-b-2 px-4 py-3 text-sm font-bold transition ${
                  activeTab === tab.id
                    ? "border-brand-red text-brand-red"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                {tab.label}
                <span className={`ml-2 rounded-full px-2 py-0.5 text-xs ${activeTab === tab.id ? "bg-red-50" : "bg-slate-100"}`}>
                  {formatNumber(tab.count)}
                </span>
              </button>
            ))}
          </div>
        </div>

        <MasterTable
          paged={tablePaged}
          columns={columns}
          rowKey={(row) => row.id}
          searchPlaceholder="Cari nama, No. HP/WA, ID, alamat, kota, source…"
          minWidth={2200}
          virtualized
          onRowClick={setDetailRow}
          rowAriaLabel={(row) => `Buka detail pelanggan ${row.name}`}
          toolbar={
            <>
              <ToolbarSelect
                value={filters.sourceCategory ?? ""}
                onChange={(value) => setFilter("sourceCategory", value)}
                allLabel="Semua Sumber"
                options={[
                  { value: "TikTok", label: "TikTok" },
                  { value: "Shopee", label: "Shopee" },
                  { value: "Meta/Akuisisi", label: "Meta / Akuisisi" },
                  { value: "CRM", label: "CRM" },
                ]}
              />
              <ToolbarSelect
                value={filters.province ?? ""}
                onChange={(value) => setFilter("province", value)}
                allLabel="Semua Provinsi"
                options={distinct("province").map((value) => ({ value, label: value }))}
              />
              <ToolbarSelect
                value={sort}
                onChange={setSort}
                allLabel="Urutan asli"
                options={[
                  { value: "lastTransaction:desc", label: "Transaksi terbaru" },
                  { value: "totalTransactions:desc", label: "Total transaksi terbanyak" },
                  { value: "totalPurchase:desc", label: "Total pembelian terbesar" },
                  { value: "name:asc", label: "Nama A-Z" },
                ]}
              />
              <DateRangeFilter
                label="Transaksi Terakhir"
                from={dateFrom.lastTransaction ?? ""}
                to={dateTo.lastTransaction ?? ""}
                onFrom={(value) => setDateFrom("lastTransaction", value)}
                onTo={(value) => setDateTo("lastTransaction", value)}
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
        <DataPanel title="Keterangan Status"><ul className="flex flex-col gap-3">
          {legendItems.map((item) => (
            <li key={item.label} className="flex items-start gap-3 text-sm">
              <StatusBadge label={item.label} tone={statusTone[item.label]} />
              <span className="pt-0.5 font-medium text-slate-600">{item.description}</span>
            </li>
          ))}
        </ul></DataPanel>
        <DataPanel title="Catatan Pelanggan"><NotesList notes={notes} /></DataPanel>
      </div>

      {detailRow && (
        <DetailRecordModal
          title="Detail Pelanggan"
          subtitle="Informasi pelanggan dan hasil validasi read-only dari database ERP."
          fields={[
            { label: "Transaksi Terakhir", value: detailRow.lastTransaction || "-" },
            { label: "Transaksi Pertama", value: detailRow.firstPurchase || "-" },
            { label: "ID Customer", value: detailRow.id },
            { label: "Nama", value: detailRow.name },
            { label: "No. HP/WA", value: detailRow.phone },
            { label: "Alamat Lengkap", value: detailRow.address },
            { label: "Kota", value: detailRow.city },
            { label: "Provinsi", value: detailRow.province },
            { label: "Sumber Pertama", value: detailRow.firstSource },
            { label: "Sumber Terakhir", value: detailRow.lastSource },
            { label: "Platform / Channel", value: detailRow.platformChannel },
            { label: "Total Transaksi", value: `${formatNumber(detailRow.totalTransactions)}x` },
            { label: "Total Pembelian", value: formatRupiah(detailRow.totalPurchase) },
            { label: "Status Pelanggan", value: detailRow.customerStatus },
            { label: "Status Kelengkapan", value: detailRow.completenessStatus },
            { label: "Status Validasi", value: detailRow.validationStatus },
            { label: "Alasan Validasi", value: detailRow.validationReason },
            { label: "Rekomendasi", value: detailRow.recommendation },
          ]}
          actions={(
            <button
              type="button"
              onClick={() => {
                setEditingRow(detailRow);
                setDetailRow(null);
              }}
              className="rounded-xl bg-brand-red px-4 py-2 text-sm font-bold text-white transition hover:bg-red-700"
            >
              Edit Data
            </button>
          )}
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
          note="Perubahan identitas disimpan langsung ke database. Status kelengkapan dihitung ulang setelah tersimpan."
        />
      )}
    </div>
  );
}
