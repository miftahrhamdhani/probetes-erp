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

interface MergePreview {
  source: { customer_id: string; name: string | null; phone_normalized: string | null };
  target: { customer_id: string; name: string | null; phone_normalized: string | null };
  samePhone: boolean;
  impact: { orders: number; transactions: number; shipments: number; returns: number };
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

// Hanya identitas inti yang bisa diedit. Channel/Frekuensi/Status/Tanggal adalah
// hasil hitung dari transaksi, jadi read-only (tidak diubah manual di sini).
const editFields: EditField<CustomerRow>[] = [
  { key: "id", label: "ID", readOnly: true },
  { key: "firstPurchase", label: "Tanggal", readOnly: true },
  { key: "name", label: "Nama" },
  { key: "phone", label: "No. HP" },
  { key: "address", label: "Alamat" },
  { key: "city", label: "Kota" },
  { key: "province", label: "Provinsi" },
  { key: "source", label: "Channel Utama", readOnly: true },
  { key: "trx", label: "Frekuensi Trx", type: "number", readOnly: true },
  { key: "status", label: "Status", readOnly: true },
];

export function PelangganSection() {
  const [editingRow, setEditingRow] = useState<CustomerRow | null>(null);
  const [detailRow, setDetailRow] = useState<CustomerRow | null>(null);
  const [mergeSource, setMergeSource] = useState<CustomerRow | null>(null);
  const [mergeTargetId, setMergeTargetId] = useState("");
  const [mergePreview, setMergePreview] = useState<MergePreview | null>(null);
  const [mergeError, setMergeError] = useState("");
  const [mergeBusy, setMergeBusy] = useState(false);
  const [lastMergeId, setLastMergeId] = useState("");
  const paged = usePagedData<CustomerRow>("/api/master/customers", ["id", "name", "phone", "city", "province"]);
  const { allRows, filters, setFilter, dateFrom, setDateFrom, dateTo, setDateTo, sort, setSort, distinct, updateRows, reload } = paged;

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

  const loadMergePreview = async () => {
    if (!mergeSource || !mergeTargetId) return;
    setMergeBusy(true);
    setMergeError("");
    setMergePreview(null);
    try {
      const res = await fetch(`/api/master/customers/merge?sourceId=${encodeURIComponent(mergeSource.id)}&targetId=${encodeURIComponent(mergeTargetId)}`);
      const data = (await res.json()) as MergePreview & { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Gagal memuat pratinjau gabung.");
      setMergePreview(data);
    } catch (err) {
      setMergeError(err instanceof Error ? err.message : "Gagal memuat pratinjau gabung.");
    } finally {
      setMergeBusy(false);
    }
  };

  const mergeCustomers = async () => {
    if (!mergeSource || !mergePreview) return;
    if (!window.confirm("Gabungkan pelanggan ini? Riwayat sumber akan dipindahkan ke pelanggan utama dan data sumber diarsipkan.")) return;
    setMergeBusy(true);
    try {
      const res = await fetch("/api/master/customers/merge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceId: mergeSource.id, targetId: mergePreview.target.customer_id, confirmed: true }),
      });
      const data = (await res.json()) as { mergeId?: string; error?: string };
      if (!res.ok || !data.mergeId) throw new Error(data.error ?? "Gagal menggabungkan pelanggan.");
      setLastMergeId(data.mergeId);
      setMergeSource(null);
      setMergePreview(null);
      setMergeTargetId("");
      reload();
    } catch (err) {
      setMergeError(err instanceof Error ? err.message : "Gagal menggabungkan pelanggan.");
    } finally {
      setMergeBusy(false);
    }
  };

  const restoreLastMerge = async () => {
    if (!lastMergeId) return;
    if (!window.confirm("Pulihkan gabung pelanggan terakhir? Riwayat yang dipindahkan akan dikembalikan ke pelanggan sumber.")) return;
    const res = await fetch(`/api/master/customers/merge/${encodeURIComponent(lastMergeId)}/restore`, { method: "POST" });
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok) {
      window.alert(data.error ?? "Gagal memulihkan gabung pelanggan.");
      return;
    }
    setLastMergeId("");
    reload();
  };

  // F2-01: simpan perubahan ke database lewat API. Kalau gagal, data tidak diubah.
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
    updateRows((current) => current.map((row) => (row.id === updated.id ? updated : row)), { persisted: true });
    setEditingRow(null);
  };
  // Hapus = ARSIP (soft delete). Data tidak hilang permanen, hanya disembunyikan.
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
              <RowActionButton label="Gabung" onClick={() => { setMergeSource(row); setMergeTargetId(""); setMergePreview(null); setMergeError(""); }} />
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

      {mergeSource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-6">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-5 shadow-2xl">
            <h2 className="text-xl font-black text-slate-950">Gabung Pelanggan</h2>
            <p className="mt-1 text-sm font-medium text-slate-500">Pilih pelanggan utama. Data sumber tidak dihapus; riwayat dipindah dan sumber diarsipkan.</p>
            <div className="mt-4 rounded-xl bg-slate-50 p-3 text-sm"><b>Sumber:</b> {mergeSource.id} — {mergeSource.name} ({mergeSource.phone})</div>
            <label className="mt-4 flex flex-col gap-1.5 text-sm font-bold text-slate-700">
              Pelanggan utama
              <select value={mergeTargetId} onChange={(event) => setMergeTargetId(event.target.value)} className="h-11 rounded-xl border border-slate-200 bg-white px-3">
                <option value="">Pilih pelanggan utama…</option>
                {allRows.filter((row) => row.id !== mergeSource.id && row.phone !== "-" && row.phone === mergeSource.phone).map((row) => <option key={row.id} value={row.id}>{row.id} — {row.name} ({row.phone})</option>)}
              </select>
            </label>
            {mergePreview && <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950"><p><b>Alasan:</b> {mergePreview.samePhone ? "No. HP ternormalisasi sama" : "Dipilih admin (No. HP berbeda)"}</p><p className="mt-2"><b>Yang dipindahkan:</b> {mergePreview.impact.orders} pesanan, {mergePreview.impact.transactions} transaksi cohort, {mergePreview.impact.shipments} pengiriman, {mergePreview.impact.returns} retur.</p></div>}
            {mergeError && <p className="mt-3 text-sm font-semibold text-red-600">{mergeError}</p>}
            <div className="mt-5 flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4">
              <button type="button" onClick={() => setMergeSource(null)} disabled={mergeBusy} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600">Batal</button>
              {!mergePreview ? <button type="button" onClick={loadMergePreview} disabled={!mergeTargetId || mergeBusy} className="rounded-xl bg-brand-red px-4 py-2 text-sm font-bold text-white disabled:opacity-60">{mergeBusy ? "Memuat…" : "Lihat Dampak"}</button> : <button type="button" onClick={mergeCustomers} disabled={mergeBusy} className="rounded-xl bg-brand-red px-4 py-2 text-sm font-bold text-white disabled:opacity-60">{mergeBusy ? "Menggabungkan…" : "Konfirmasi Gabung"}</button>}
            </div>
          </div>
        </div>
      )}
      {lastMergeId && <button type="button" onClick={restoreLastMerge} className="fixed bottom-5 right-5 z-40 rounded-xl bg-amber-500 px-4 py-3 text-sm font-bold text-white shadow-lg">Batalkan gabung pelanggan terakhir</button>}

      {editingRow && (
        <EditRecordModal
          title="Edit Pelanggan"
          record={editingRow}
          fields={editFields}
          onClose={() => setEditingRow(null)}
          onSave={saveRow}
          note="Perubahan disimpan langsung ke database."
        />
      )}
    </div>
  );
}
