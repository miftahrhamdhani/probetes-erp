"use client";

import { useMemo, useState } from "react";
import { DataPanel } from "@/features/database/components/DataPanel";
import { KpiCard } from "@/features/database/components/KpiCard";
import { StatusBadge } from "@/features/database/components/StatusBadge";
import { usePagedData } from "../../hooks/usePagedData";
import { formatNumber, formatRupiah } from "../../lib/format";
import { EditRecordModal, type EditField } from "../EditRecordModal";
import { MasterTable, NotesList, RowActionButton, type MasterColumn } from "../MasterTable";
import { ToolbarSelect } from "../TableToolbar";

interface ProductRow {
  id: string;
  name: string;
  sku: string;
  category: string;
  original: string;
  alias?: string;
  qty: number;
  value: number;
  status: string;
}

const notes = [
  "Varian 'S' dan 'Tk' sengaja tetap terpisah sesuai keputusan owner, menunggu penyamaan SKU antar gudang.",
  "Varian 'Bonus' sudah digabung ke produk intinya masing-masing.",
  "Kolom SKU tampil '-' karena kode produk antar gudang belum disamakan.",
  "Nama asli dari data lama tetap disimpan agar bisa ditelusuri kembali.",
];

// Qty dan Nilai adalah hasil hitung transaksi, jadi tidak boleh diubah manual.
const editFields: EditField<ProductRow>[] = [
  { key: "id", label: "ID", readOnly: true },
  { key: "name", label: "Produk Final" },
  { key: "sku", label: "SKU" },
  { key: "category", label: "Kategori" },
  { key: "original", label: "Nama Asli dari Data", readOnly: true },
  { key: "alias", label: "Alias Tambahan (pisah ;)" },
  { key: "qty", label: "Qty", type: "number", readOnly: true },
  { key: "value", label: "Nilai", type: "number", readOnly: true },
  { key: "status", label: "Status" },
];

export function ProdukSection() {
  const [editingRow, setEditingRow] = useState<ProductRow | null>(null);
  const paged = usePagedData<ProductRow>("/api/master/products", ["id", "name", "sku", "original"]);
  const { allRows, filters, setFilter, sort, setSort, updateRows } = paged;

  // KPI dihitung dari data yang sama dengan tabel — tidak ada angka mati.
  // "Nama Asli Digabung" = total variasi tulisan lama (dipisah koma) yang
  // sudah dilebur ke daftar produk final ini.
  const kpiItems = useMemo(() => {
    const originalCount = allRows.reduce(
      (sum, row) => sum + row.original.split(",").filter((name) => name.trim()).length,
      0,
    );
    const needReview = allRows.filter((row) => row.status !== "Tersedia").length;
    const withSku = allRows.filter((row) => row.sku !== "-").length;
    return [
      { label: "Produk Final", value: formatNumber(allRows.length), detail: "Tersedia", tone: "green" as const },
      { label: "Nama Asli Digabung", value: formatNumber(originalCount), detail: "Dirapikan", tone: "blue" as const },
      { label: "Perlu Dicek", value: formatNumber(needReview), detail: "Menunggu review", tone: "amber" as const },
      { label: "SKU Terisi", value: formatNumber(withSku), detail: withSku === 0 ? "Menunggu SKU" : "Tersedia", tone: "slate" as const },
    ];
  }, [allRows]);

  const saveRow = async (updated: ProductRow) => {
    const res = await fetch(`/api/master/products/${encodeURIComponent(updated.id)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: updated.name, sku: updated.sku, category: updated.category, original: updated.alias, status: updated.status }),
    });
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      window.alert(data.error ?? "Gagal menyimpan mapping produk.");
      return;
    }
    updateRows((current) => current.map((row) => (row.id === updated.id ? updated : row)), { persisted: true });
    setEditingRow(null);
  };
  const deleteRow = async (id: string) => {
    if (!window.confirm("Arsipkan produk ini? Data tidak dihapus permanen.")) return;
    const res = await fetch(`/api/master/products/${encodeURIComponent(id)}`, { method: "DELETE" });
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      window.alert(data.error ?? "Gagal mengarsipkan produk.");
      return;
    }
    updateRows((current) => current.filter((row) => row.id !== id), { persisted: true });
  };

  const columns: MasterColumn<ProductRow>[] = [
    { key: "id", label: "ID", tone: "muted" },
    { key: "name", label: "Produk Final", tone: "strong" },
    { key: "sku", label: "SKU" },
    { key: "category", label: "Kategori" },
    { key: "original", label: "Nama Asli dari Data" },
    { key: "qty", label: "Qty", align: "right", render: (row) => formatNumber(row.qty) },
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

      <DataPanel title="Daftar Produk" subtitle="Seluruh produk final hasil merapikan variasi tulisan lama.">
        <MasterTable
          paged={paged}
          columns={columns}
          rowKey={(row) => row.id}
          searchPlaceholder="Cari ID, produk, SKU, nama asli…"
          minWidth={860}
          toolbar={
            <>
              <ToolbarSelect
                value={filters.status ?? ""}
                onChange={(v) => setFilter("status", v)}
                allLabel="Semua Status"
                options={["Tersedia", "Perlu dicek"].map((s) => ({ value: s, label: s }))}
              />
              <ToolbarSelect
                value={sort}
                onChange={setSort}
                allLabel="Urutan asli"
                options={[
                  { value: "value:desc", label: "Nilai terbesar" },
                  { value: "qty:desc", label: "Qty terbanyak" },
                  { value: "name:asc", label: "Produk A-Z" },
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

      <DataPanel title="Catatan Produk">
        <NotesList notes={notes} />
      </DataPanel>

      {editingRow && (
        <EditRecordModal
          title="Edit Produk"
          record={editingRow}
          fields={editFields}
          onClose={() => setEditingRow(null)}
          onSave={saveRow}
          note="Kategori dan SKU tersimpan ke database. Nama asli dikunci; masukkan alias baru bila perlu."
        />
      )}
    </div>
  );
}
