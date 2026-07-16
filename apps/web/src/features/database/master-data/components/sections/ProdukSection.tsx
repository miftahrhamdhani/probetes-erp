"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
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

interface ProdukBaruRow {
  id: string;
  id_produk: string;
  name: string;
  price: number;
  hpp: number;
}

const notes = [
  "Varian 'S' dan 'Tk' sengaja tetap terpisah sesuai keputusan owner, menunggu penyamaan SKU antar gudang.",
  "Varian 'Bonus' sudah digabung ke produk intinya masing-masing.",
  "Kolom SKU tampil '-' karena kode produk antar gudang belum disamakan.",
  "Nama asli dari data lama tetap disimpan agar bisa ditelusuri kembali.",
];

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
  // STATE: PRODUK LAMA (OLD)
  const [editingRow, setEditingRow] = useState<ProductRow | null>(null);
  const paged = usePagedData<ProductRow>("/api/master/products", ["id", "name", "sku", "original"]);
  const { allRows, filters, setFilter, sort, setSort, updateRows } = paged;

  // STATE: PRODUK BARU
  const pagedBaru = usePagedData<ProdukBaruRow>("/api/master/produk-baru", ["id_produk", "name"]);
  const [editingBaru, setEditingBaru] = useState<ProdukBaruRow | null>(null);
  const [isAddingBaru, setIsAddingBaru] = useState(false);

  // KPI DARI DATA LAMA
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

  // HANDLER PRODUK LAMA
  const saveRow = async (updated: ProductRow) => {
    const res = await fetch(`/api/master/products/${encodeURIComponent(updated.id)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: updated.name, sku: updated.sku, category: updated.category, original: updated.alias, status: updated.status }),
    });
    if (!res.ok) {
      window.alert("Gagal menyimpan mapping produk.");
      return;
    }
    updateRows((current) => current.map((row) => (row.id === updated.id ? updated : row)), { persisted: true });
    setEditingRow(null);
  };

  const deleteRow = async (id: string) => {
    if (!window.confirm("Arsipkan produk ini? Data tidak dihapus permanen.")) return;
    const res = await fetch(`/api/master/products/${encodeURIComponent(id)}`, { method: "DELETE" });
    if (!res.ok) {
      window.alert("Gagal mengarsipkan produk.");
      return;
    }
    updateRows((current) => current.filter((row) => row.id !== id), { persisted: true });
  };

  // HANDLER PRODUK BARU
  const saveBaru = async (updated: ProdukBaruRow) => {
    try {
      if (isAddingBaru) {
        const res = await fetch("/api/master/produk-baru", {
          method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(updated),
        });
        if (!res.ok) throw new Error("Gagal menambah data produk.");
      } else {
        const res = await fetch(`/api/master/produk-baru/${encodeURIComponent(updated.id)}`, {
          method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(updated),
        });
        if (!res.ok) throw new Error("Gagal mengedit data produk.");
      }
      pagedBaru.reload();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setEditingBaru(null);
      setIsAddingBaru(false);
    }
  };

  const deleteBaru = async (id: string) => {
    if (!window.confirm("Hapus data Produk ini?")) return;
    try {
      const res = await fetch(`/api/master/produk-baru/${encodeURIComponent(id)}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus data.");
      pagedBaru.reload();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Terjadi kesalahan.");
    }
  };

  const columnsLama: MasterColumn<ProductRow>[] = [
    { key: "id", label: "ID", tone: "muted" },
    { key: "name", label: "Produk Final", tone: "strong" },
    { key: "sku", label: "SKU" },
    { key: "category", label: "Kategori" },
    { key: "original", label: "Nama Asli dari Data" },
    { key: "qty", label: "Qty", align: "right", render: (row) => formatNumber(row.qty) },
    { key: "value", label: "Nilai", align: "right", tone: "strong", render: (row) => formatRupiah(row.value) },
    { key: "status", label: "Status", align: "right", render: (row) => <StatusBadge label={row.status} /> },
  ];

  const columnsBaru: MasterColumn<ProdukBaruRow>[] = [
    { key: "id", label: "UUID", tone: "muted", width: 80 },
    { key: "id_produk", label: "ID Produk", tone: "strong", width: 120 },
    { key: "name", label: "Nama Produk", tone: "strong", width: 300 },
    { key: "price", label: "Harga Jual", align: "right", tone: "strong", render: (row) => formatRupiah(row.price) },
    { key: "hpp", label: "HPP", align: "right", render: (row) => formatRupiah(row.hpp) },
  ];

  const activeBaruRecord = editingBaru || (isAddingBaru ? { id: "", id_produk: "", name: "", price: 0, hpp: 0 } : null);

  return (
    <div className="flex flex-col gap-8">
      {/* KPI */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpiItems.map((item) => (
          <KpiCard key={item.label} item={item} />
        ))}
      </div>

      {/* TABLE PRODUK BARU */}
      <DataPanel title="Produk Baru" subtitle="Data produk baru yang bisa ditambahkan manual ke dalam database.">
        <MasterTable
          paged={pagedBaru}
          columns={columnsBaru}
          rowKey={(row) => row.id}
          searchPlaceholder="Cari nama produk atau ID..."
          minWidth={740}
          toolbar={
            <button
              type="button"
              onClick={() => setIsAddingBaru(true)}
              className="ml-auto inline-flex h-10 items-center gap-2 rounded-xl bg-brand-red px-4 text-sm font-bold text-white transition hover:bg-brand-red/90"
            >
              <Plus className="size-4" />
              Tambah Produk
            </button>
          }
          renderActions={(row) => (
            <>
              <RowActionButton label="Edit" onClick={() => setEditingBaru(row)} />
              <RowActionButton label="Hapus" danger onClick={() => deleteBaru(row.id)} />
            </>
          )}
        />
      </DataPanel>

      {/* TABLE PRODUK LAMA */}
      <DataPanel title="Daftar Produk (Lama)" subtitle="Seluruh produk final hasil merapikan variasi tulisan lama.">
        <MasterTable
          paged={paged}
          columns={columnsLama}
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

      <DataPanel title="Catatan Produk (Lama)">
        <NotesList notes={notes} />
      </DataPanel>

      {/* MODALS */}
      {editingRow && (
        <EditRecordModal
          title="Edit Produk Lama"
          record={editingRow}
          fields={editFields}
          onClose={() => setEditingRow(null)}
          onSave={saveRow}
          note="Kategori dan SKU tersimpan ke database. Nama asli dikunci; masukkan alias baru bila perlu."
        />
      )}

      {activeBaruRecord && (
        <EditRecordModal
          title={isAddingBaru ? "Tambah Produk Baru" : "Edit Produk Baru"}
          record={activeBaruRecord}
          fields={[
            ...(isAddingBaru ? [] : [{ key: "id", label: "UUID", readOnly: true }]),
            { key: "id_produk", label: "ID Produk (Misal: PRD-024)" },
            { key: "name", label: "Nama Produk" },
            { key: "price", label: "Harga Jual (Angka Saja)", type: "number" },
            { key: "hpp", label: "HPP (Angka Saja)", type: "number" },
          ] as EditField<typeof activeBaruRecord>[]}
          onClose={() => { setEditingBaru(null); setIsAddingBaru(false); }}
          onSave={saveBaru as any}
        />
      )}
    </div>
  );
}
