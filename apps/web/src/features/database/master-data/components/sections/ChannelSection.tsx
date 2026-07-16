"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { DataPanel } from "@/features/database/components/DataPanel";
import { StatusBadge } from "@/features/database/components/StatusBadge";
import { usePagedData } from "../../hooks/usePagedData";
import { MasterTable, RowActionButton, type MasterColumn } from "../MasterTable";
import { ToolbarSelect } from "../TableToolbar";
import { EditRecordModal, type EditField } from "../EditRecordModal";

interface ChannelRow {
  id: string;
  name: string;
  type: string;
  storeCount: number;
  stores: string[] | string;
}

interface MitraRow {
  id: string;
  id_mitra: string;
  name: string;
  original: string;
}

function StoreDetailModal({ channel, onClose }: { channel: ChannelRow; onClose: () => void }) {
  const stores = Array.isArray(channel.stores) ? channel.stores : [];
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h3 className="text-lg font-black text-slate-900">Daftar Toko: {channel.name}</h3>
        <p className="mt-1 text-sm text-slate-500">Terdapat {channel.storeCount} toko yang terdaftar di jenis {channel.type}.</p>
        
        <ul className="mt-4 flex max-h-[300px] flex-col gap-2 overflow-y-auto">
          {stores.map((store, i) => (
            <li key={i} className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-sm font-semibold text-slate-700">
              {store}
            </li>
          ))}
          {stores.length === 0 && (
            <li className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-sm font-semibold text-slate-400 italic">
              Belum ada toko yang didaftarkan.
            </li>
          )}
        </ul>

        <button 
          onClick={onClose}
          className="mt-6 w-full rounded-xl bg-brand-red py-2.5 text-sm font-bold text-white transition hover:bg-brand-red/90"
        >
          Tutup
        </button>
      </div>
    </div>
  );
}

function EditChannelModal({ 
  record, 
  isAdding, 
  onClose, 
  onSave 
}: { 
  record: ChannelRow; 
  isAdding: boolean;
  onClose: () => void;
  onSave: (record: ChannelRow) => void;
}) {
  const [name, setName] = useState(record.name);
  const [type, setType] = useState(record.type);
  const [stores, setStores] = useState<string[]>(Array.isArray(record.stores) ? record.stores : []);

  const addStore = () => setStores([...stores, ""]);
  const updateStore = (index: number, val: string) => {
    const newStores = [...stores];
    newStores[index] = val;
    setStores(newStores);
  };
  const removeStore = (index: number) => {
    setStores(stores.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    const finalStores = stores.map(s => s.trim()).filter(Boolean);
    onSave({ ...record, name, type, stores: finalStores });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <h3 className="mb-6 text-lg font-black text-slate-900">{isAdding ? "Tambah Channel" : "Edit Channel"}</h3>

        <div className="flex flex-col gap-4">
          {!isAdding && (
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">ID</label>
              <input value={record.id} readOnly className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-medium text-slate-500" />
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">Nama Channel</label>
              <input value={name} onChange={e => setName(e.target.value)} className="w-full rounded-xl border border-slate-200 p-3 text-sm font-medium text-slate-900" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">Jenis</label>
              <input value={type} onChange={e => setType(e.target.value)} placeholder="Misal: marketplace" className="w-full rounded-xl border border-slate-200 p-3 text-sm font-medium text-slate-900" />
            </div>
          </div>

          <div className="mt-2">
            <div className="mb-3 flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Daftar Toko</label>
              <button onClick={addStore} className="flex items-center gap-1 rounded-lg bg-brand-red/10 px-3 py-1.5 text-xs font-bold text-brand-red transition hover:bg-brand-red/20">
                <Plus className="size-3" /> Tambah Toko
              </button>
            </div>
            
            <div className="flex max-h-[250px] flex-col gap-3 overflow-y-auto pr-2">
              {stores.length === 0 && (
                <p className="text-xs italic text-slate-400">Belum ada toko yang ditambahkan. Klik tombol "Tambah Toko".</p>
              )}
              {stores.map((store, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input 
                    value={store} 
                    onChange={e => updateStore(i, e.target.value)} 
                    placeholder={`Nama Toko ${i + 1}`}
                    className="flex-1 rounded-xl border border-slate-200 p-2.5 text-sm font-medium text-slate-900" 
                  />
                  <button onClick={() => removeStore(i)} className="rounded-xl border border-red-200 p-2.5 text-red-500 hover:bg-red-50 hover:text-red-600 transition">
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-end gap-3 border-t border-slate-100 pt-6">
          <button onClick={onClose} className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 transition">Batal</button>
          <button onClick={handleSave} className="rounded-xl bg-brand-red px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-red/90 transition">Simpan Perubahan</button>
        </div>
      </div>
    </div>
  );
}

export function ChannelSection() {
  const [viewStore, setViewStore] = useState<ChannelRow | null>(null);
  
  // State for Channel
  const [editingChannel, setEditingChannel] = useState<ChannelRow | null>(null);
  const [isAddingChannel, setIsAddingChannel] = useState(false);
  const dataChannel = usePagedData<ChannelRow>("/api/master/channel-stores", ["name", "type"]);

  // State for Mitra
  const [editingMitra, setEditingMitra] = useState<MitraRow | null>(null);
  const [isAddingMitra, setIsAddingMitra] = useState(false);
  const dataMitra = usePagedData<MitraRow>("/api/master/mitra", ["id_mitra", "name", "original"]);

  // Handlers for Channel
  const saveChannel = async (updated: ChannelRow) => {
    try {
      if (isAddingChannel) {
        const res = await fetch("/api/master/channel-stores", {
          method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(updated),
        });
        if (!res.ok) throw new Error("Gagal menambah data channel.");
      } else {
        const res = await fetch(`/api/master/channel-stores/${encodeURIComponent(updated.id)}`, {
          method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(updated),
        });
        if (!res.ok) throw new Error("Gagal mengedit data channel.");
      }
      dataChannel.reload();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setEditingChannel(null);
      setIsAddingChannel(false);
    }
  };

  const deleteChannel = async (id: string) => {
    if (!window.confirm("Hapus data Channel ini?")) return;
    try {
      const res = await fetch(`/api/master/channel-stores/${encodeURIComponent(id)}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus data.");
      dataChannel.reload();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Terjadi kesalahan.");
    }
  };

  // Handlers for Mitra
  const saveMitra = async (updated: MitraRow) => {
    try {
      if (isAddingMitra) {
        const res = await fetch("/api/master/mitra", {
          method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(updated),
        });
        if (!res.ok) throw new Error("Gagal menambah data mitra.");
      } else {
        const res = await fetch(`/api/master/mitra/${encodeURIComponent(updated.id)}`, {
          method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(updated),
        });
        if (!res.ok) throw new Error("Gagal mengedit data mitra.");
      }
      dataMitra.reload();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setEditingMitra(null);
      setIsAddingMitra(false);
    }
  };

  const deleteMitra = async (id: string) => {
    if (!window.confirm("Hapus data Mitra ini?")) return;
    try {
      const res = await fetch(`/api/master/mitra/${encodeURIComponent(id)}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus data.");
      dataMitra.reload();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Terjadi kesalahan.");
    }
  };

  const channelColumns: MasterColumn<ChannelRow>[] = [
    { key: "id", label: "ID", tone: "muted", width: 80 },
    { key: "name", label: "Channel", tone: "strong", width: 300 },
    { 
      key: "type", label: "Jenis", width: 200, 
      render: (row) => <StatusBadge label={row.type} tone={row.type === "marketplace" ? "blue" : row.type === "akuisisi" ? "purple" : "slate"} /> 
    },
    { 
      key: "storeCount", label: "Jumlah Toko", width: 150, align: "right",
      render: (row) => (
        <button 
          onClick={() => setViewStore(row)}
          className="rounded-lg bg-brand-red/10 px-3 py-1 text-xs font-bold text-brand-red transition hover:bg-brand-red/20"
        >
          {row.storeCount} Toko (Lihat)
        </button>
      )
    },
  ];

  const mitraColumns: MasterColumn<MitraRow>[] = [
    { key: "id", label: "UUID", tone: "muted", width: 80 },
    { key: "id_mitra", label: "ID Mitra", tone: "strong", width: 120 },
    { key: "name", label: "Nama Mitra", tone: "strong", width: 250 },
    { key: "original", label: "Nama Asli (Alias)", width: 400 },
  ];

  const activeChannelRecord = editingChannel || (isAddingChannel ? { id: "", name: "", type: "", storeCount: 0, stores: [] } : null);
  const activeMitraRecord = editingMitra || (isAddingMitra ? { id: "", id_mitra: "", name: "", original: "" } : null);

  return (
    <div className="flex flex-col gap-8">
      {/* CHANNEL TABLE */}
      <DataPanel title="Data Channel" subtitle="Daftar asal order dan rincian toko (Terhubung langsung ke database).">
        <MasterTable
          paged={dataChannel}
          columns={channelColumns}
          rowKey={(row) => row.id}
          searchPlaceholder="Cari nama channel..."
          minWidth={740}
          toolbar={
            <>
              <ToolbarSelect
                value={dataChannel.filters.type ?? ""}
                onChange={(v) => dataChannel.setFilter("type", v)}
                allLabel="Semua Jenis"
                options={dataChannel.distinct("type").map((t) => ({ value: t, label: t }))}
              />
              <button
                type="button"
                onClick={() => setIsAddingChannel(true)}
                className="ml-auto inline-flex h-10 items-center gap-2 rounded-xl bg-brand-red px-4 text-sm font-bold text-white transition hover:bg-brand-red/90"
              >
                <Plus className="size-4" />
                Tambah Channel
              </button>
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

      {/* MITRA TABLE */}
      <DataPanel title="Daftar Mitra" subtitle="Data mitra yang bekerja sama secara terpisah dari Channel utama.">
        <MasterTable
          paged={dataMitra}
          columns={mitraColumns}
          rowKey={(row) => row.id}
          searchPlaceholder="Cari nama mitra atau alias..."
          minWidth={740}
          toolbar={
            <button
              type="button"
              onClick={() => setIsAddingMitra(true)}
              className="ml-auto inline-flex h-10 items-center gap-2 rounded-xl bg-brand-red px-4 text-sm font-bold text-white transition hover:bg-brand-red/90"
            >
              <Plus className="size-4" />
              Tambah Mitra
            </button>
          }
          renderActions={(row) => (
            <>
              <RowActionButton label="Edit" onClick={() => setEditingMitra(row)} />
              <RowActionButton label="Hapus" danger onClick={() => deleteMitra(row.id)} />
            </>
          )}
        />
      </DataPanel>

      {/* MODALS */}
      {viewStore && (
        <StoreDetailModal channel={viewStore} onClose={() => setViewStore(null)} />
      )}

      {activeChannelRecord && (
        <EditChannelModal
          isAdding={isAddingChannel}
          record={activeChannelRecord as ChannelRow}
          onClose={() => { setEditingChannel(null); setIsAddingChannel(false); }}
          onSave={saveChannel}
        />
      )}

      {activeMitraRecord && (
        <EditRecordModal
          title={isAddingMitra ? "Tambah Mitra" : "Edit Mitra"}
          record={activeMitraRecord}
          fields={[
            ...(isAddingMitra ? [] : [{ key: "id", label: "UUID", readOnly: true }]),
            { key: "id_mitra", label: "ID Mitra (Misal: MTR-007)" },
            { key: "name", label: "Nama Mitra" },
            { key: "original", label: "Nama Asli / Alias (Bisa dipisah dengan slash '/')" },
          ] as EditField<typeof activeMitraRecord>[]}
          onClose={() => { setEditingMitra(null); setIsAddingMitra(false); }}
          onSave={saveMitra as any}
        />
      )}
    </div>
  );
}
