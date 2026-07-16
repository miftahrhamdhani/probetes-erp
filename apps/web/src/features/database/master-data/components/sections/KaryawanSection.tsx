"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { DataPanel } from "@/features/database/components/DataPanel";
import { usePagedData } from "../../hooks/usePagedData";
import { EditRecordModal, type EditField } from "../EditRecordModal";
import { MasterTable, RowActionButton, type MasterColumn } from "../MasterTable";
import { ToolbarSelect } from "../TableToolbar";

interface KaryawanRow {
  id: string;
  name: string;
  role: string;
  divisi: string;
}

const editFields: EditField<KaryawanRow>[] = [
  { key: "id", label: "ID", readOnly: true },
  { key: "name", label: "Nama" },
  { key: "role", label: "Role" },
  { key: "divisi", label: "Divisi" },
];

export function KaryawanSection() {
  const [editingRow, setEditingRow] = useState<KaryawanRow | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const data = usePagedData<KaryawanRow>("/api/master/karyawan", ["name", "role", "divisi"]);

  const saveRow = async (updated: KaryawanRow) => {
    setIsSaving(true);
    try {
      if (isAdding) {
        const res = await fetch("/api/master/karyawan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updated),
        });
        if (!res.ok) throw new Error("Gagal menambah data");
        data.reload();
      } else {
        // Implementasi edit via API belum ada, tapi mock update lokal:
        data.updateRows((current) => current.map((row) => (row.id === updated.id ? updated : row)), { persisted: false });
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Terjadi kesalahan saat menyimpan data.");
    } finally {
      setIsSaving(false);
      setEditingRow(null);
      setIsAdding(false);
    }
  };

  const deleteRow = (id: string) => {
    if (!window.confirm("Hapus data Karyawan ini?")) return;
    data.updateRows((current) => current.filter((row) => row.id !== id), { persisted: false });
  };

  const columns: MasterColumn<KaryawanRow>[] = [
    { key: "id", label: "ID", tone: "muted", width: 80 },
    { key: "name", label: "Nama", tone: "strong", width: 300 },
    { key: "role", label: "Role", width: 220 },
    { key: "divisi", label: "Divisi", width: 150 },
  ];

  return (
    <div className="flex flex-col gap-6">
      <DataPanel title="Data Karyawan" subtitle="Daftar seluruh tim dan karyawan internal. (Penambahan data akan otomatis disimpan ke database).">
        <MasterTable
          paged={data}
          columns={columns}
          rowKey={(row) => row.id}
          searchPlaceholder="Cari nama karyawan..."
          minWidth={740}
          toolbar={
            <>
              <ToolbarSelect
                value={data.filters.role ?? ""}
                onChange={(v) => data.setFilter("role", v)}
                allLabel="Semua Role"
                options={data.distinct("role").map((r) => ({ value: r, label: r }))}
              />
              <ToolbarSelect
                value={data.filters.divisi ?? ""}
                onChange={(v) => data.setFilter("divisi", v)}
                allLabel="Semua Divisi"
                options={data.distinct("divisi").map((d) => ({ value: d, label: d }))}
              />
              <button
                type="button"
                onClick={() => setIsAdding(true)}
                className="ml-auto inline-flex h-10 items-center gap-2 rounded-xl bg-brand-red px-4 text-sm font-bold text-white transition hover:bg-brand-red/90"
              >
                <Plus className="size-4" />
                Tambah Karyawan
              </button>
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

      {(editingRow || isAdding) && (
        <EditRecordModal
          title={isAdding ? "Tambah Karyawan" : "Edit Data Karyawan"}
          record={editingRow ?? { id: "", name: "", role: "", divisi: "" }}
          fields={editFields.map(f => (isAdding && f.key === "id" ? { ...f, readOnly: true, label: "ID (Otomatis)" } : f))}
          onClose={() => { setEditingRow(null); setIsAdding(false); }}
          onSave={saveRow}
        />
      )}
    </div>
  );
}
