"use client";

import { useMemo, useState } from "react";
import { DataPanel } from "@/features/database/components/DataPanel";
import { KpiCard } from "@/features/database/components/KpiCard";
import { StatusBadge } from "@/features/database/components/StatusBadge";
import { usePagedData } from "../../hooks/usePagedData";
import { formatNumber } from "../../lib/format";
import { EditRecordModal, type EditField } from "../EditRecordModal";
import { MasterTable, NotesList, RowActionButton, type MasterColumn } from "../MasterTable";
import { ToolbarSelect } from "../TableToolbar";

interface CourierRow {
  id: string;
  name: string;
  original: string;
  service: string;
  orders: number;
  status: string;
}

const notes = [
  "Nomor resi tidak ditampilkan di sini — cek resi dan status kiriman ada di menu Data Tracking.",
  "Variasi tulisan kurir (NINJA/Ninja, JNT/J&T) sudah digabung ke nama final.",
  "Tulisan yang tidak dikenal (LIO, SOX, JNR, Diet) berstatus perlu dicek — kemungkinan salah input.",
];

const editFields: EditField<CourierRow>[] = [
  { key: "id", label: "ID", readOnly: true },
  { key: "name", label: "Ekspedisi" },
  { key: "original", label: "Nama Asli" },
  { key: "service", label: "Layanan" },
  { key: "orders", label: "Pesanan", type: "number" },
  { key: "status", label: "Status" },
];

export function EkspedisiSection() {
  const [editingCourier, setEditingCourier] = useState<CourierRow | null>(null);
  const paged = usePagedData<CourierRow>("/api/master/couriers", ["id", "name", "original", "service"]);
  const { allRows, filters, setFilter, sort, setSort, distinct, updateRows } = paged;

  // KPI dihitung dari data yang sama dengan tabel — tidak ada angka mati.
  // "Nama Asli Digabung" = total variasi tulisan lama (dipisah "/") yang
  // sudah dilebur ke daftar ekspedisi final ini.
  const kpiItems = useMemo(() => {
    const originalCount = allRows.reduce(
      (sum, row) => sum + row.original.split("/").filter((name) => name.trim()).length,
      0,
    );
    const needCheck = allRows.filter((row) => row.status !== "Aktif").length;
    const totalOrders = allRows.reduce((sum, row) => sum + row.orders, 0);
    return [
      { label: "Ekspedisi Final", value: formatNumber(allRows.length), detail: "Tersedia", tone: "green" as const },
      { label: "Nama Asli Digabung", value: formatNumber(originalCount), detail: "Dirapikan", tone: "blue" as const },
      { label: "Perlu Dicek", value: formatNumber(needCheck), detail: "Tulisan aneh", tone: "amber" as const },
      { label: "Order dengan Ekspedisi", value: formatNumber(totalOrders), detail: "Tercatat", tone: "slate" as const },
    ];
  }, [allRows]);

  const saveCourier = (updated: CourierRow) => {
    updateRows((current) => current.map((row) => (row.id === updated.id ? updated : row)));
    setEditingCourier(null);
  };
  const deleteCourier = (id: string) => {
    if (!window.confirm("Hapus data ekspedisi ini dari tampilan sementara?")) return;
    updateRows((current) => current.filter((row) => row.id !== id));
  };

  const columns: MasterColumn<CourierRow>[] = [
    { key: "id", label: "ID", tone: "muted" },
    { key: "name", label: "Ekspedisi", tone: "strong" },
    { key: "original", label: "Nama Asli" },
    { key: "service", label: "Layanan" },
    { key: "orders", label: "Pesanan", align: "right", render: (row) => formatNumber(row.orders) },
    { key: "status", label: "Status", align: "right", render: (row) => <StatusBadge label={row.status} /> },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpiItems.map((item) => (
          <KpiCard key={item.label} item={item} />
        ))}
      </div>

      <DataPanel title="Daftar Ekspedisi" subtitle="Seluruh kurir pengiriman sebagai data acuan.">
        <MasterTable
          paged={paged}
          columns={columns}
          rowKey={(row) => row.id}
          searchPlaceholder="Cari ekspedisi, layanan, nama asli…"
          minWidth={720}
          toolbar={
            <>
              <ToolbarSelect
                value={filters.service ?? ""}
                onChange={(v) => setFilter("service", v)}
                allLabel="Semua Layanan"
                options={distinct("service").map((s) => ({ value: s, label: s }))}
              />
              <ToolbarSelect
                value={filters.status ?? ""}
                onChange={(v) => setFilter("status", v)}
                allLabel="Semua Status"
                options={["Aktif", "Perlu dicek"].map((s) => ({ value: s, label: s }))}
              />
              <ToolbarSelect
                value={sort}
                onChange={setSort}
                allLabel="Urutan asli"
                options={[
                  { value: "orders:desc", label: "Pesanan terbanyak" },
                  { value: "name:asc", label: "Ekspedisi A-Z" },
                ]}
              />
            </>
          }
          renderActions={(row) => (
            <>
              <RowActionButton label="Edit" onClick={() => setEditingCourier(row)} />
              <RowActionButton label="Hapus" danger onClick={() => deleteCourier(row.id)} />
            </>
          )}
        />
      </DataPanel>

      <DataPanel title="Catatan Ekspedisi">
        <NotesList notes={notes} />
      </DataPanel>

      {editingCourier && (
        <EditRecordModal
          title="Edit Ekspedisi"
          record={editingCourier}
          fields={editFields}
          onClose={() => setEditingCourier(null)}
          onSave={saveCourier}
        />
      )}
    </div>
  );
}
