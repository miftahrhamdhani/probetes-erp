"use client";

import { useEffect, useState } from "react";
import { AppHeader } from "@/components/layout/AppHeader";
import { DatabaseBackButton } from "@/features/database/components/DatabaseBackButton";
import { DataPanel } from "@/features/database/components/DataPanel";
import { KpiCard } from "@/features/database/components/KpiCard";
import { StatusBadge } from "@/features/database/components/StatusBadge";
import type { KpiItem } from "@/features/database/types/database.types";
import { DetailRecordModal } from "@/features/database/master-data/components/DetailRecordModal";
import { formatNumber, formatRupiah } from "@/features/database/master-data/lib/format";

type SectionId = "produk-nama" | "produk-kategori" | "pelanggan" | "hp" | "kota";
type Summary = Record<SectionId, number>;
type Row = Record<string, string | number>;

const emptySummary: Summary = {
  "produk-nama": 0,
  "produk-kategori": 0,
  pelanggan: 0,
  hp: 0,
  kota: 0,
};

const menuMeta: { id: SectionId; title: string; note: string }[] = [
  { id: "produk-nama", title: "Nama Produk Perlu Dirapikan", note: "Nama bervariasi/prefiks — perlu digabung." },
  { id: "produk-kategori", title: "Produk Belum Berkategori", note: "Kategori belum diisi (untuk RFM)." },
  { id: "pelanggan", title: "Pelanggan Perlu Dicek", note: "Nama kosong / aneh / terlalu pendek." },
  { id: "hp", title: "No HP Tidak Normal", note: "Nomor ada tapi format salah." },
  { id: "kota", title: "Kota Belum Terbaca", note: "Punya alamat tapi kota belum terisi." },
];

// Kolom yang ditampilkan di tabel per bagian (key -> label). Sisanya muncul di popup detail.
const tableColumns: Record<SectionId, { key: string; label: string; align?: "right" }[]> = {
  "produk-nama": [
    { key: "id", label: "ID" },
    { key: "product", label: "Produk Final" },
    { key: "original", label: "Nama Asli di Data" },
    { key: "qty", label: "Qty", align: "right" },
    { key: "value", label: "Nilai", align: "right" },
    { key: "issue", label: "Masalah" },
  ],
  "produk-kategori": [
    { key: "id", label: "ID" },
    { key: "product", label: "Produk Final" },
    { key: "qty", label: "Qty", align: "right" },
    { key: "value", label: "Nilai", align: "right" },
    { key: "suggestion", label: "Saran" },
  ],
  pelanggan: [
    { key: "id", label: "ID Customer" },
    { key: "name", label: "Nama" },
    { key: "city", label: "Kota" },
    { key: "source", label: "Sumber Data" },
    { key: "trx", label: "Transaksi", align: "right" },
    { key: "issue", label: "Masalah" },
  ],
  hp: [
    { key: "id", label: "ID Customer" },
    { key: "name", label: "Nama" },
    { key: "phone", label: "No HP Asli" },
    { key: "length", label: "Panjang", align: "right" },
    { key: "issue", label: "Masalah" },
  ],
  kota: [
    { key: "id", label: "ID Customer" },
    { key: "name", label: "Nama" },
    { key: "address", label: "Alamat" },
    { key: "province", label: "Provinsi" },
    { key: "city_terbaca", label: "Kota Terbaca" },
  ],
};

const labelMap: Record<string, string> = {
  id: "ID",
  product: "Produk Final",
  original: "Nama Asli di Data",
  qty: "Qty",
  value: "Nilai",
  issue: "Masalah",
  suggestion: "Saran",
  name: "Nama",
  phone: "No. HP",
  address: "Alamat Lengkap",
  city: "Kota",
  city_terbaca: "Kota Terbaca dari Alamat",
  province: "Provinsi",
  source: "Sumber Data",
  trx: "Jumlah Transaksi",
  length: "Panjang Nomor",
};

const moneyKeys = new Set(["value"]);
const numberKeys = new Set(["qty", "trx", "length"]);

function fmtCell(key: string, value: string | number) {
  if (value === null || value === undefined || value === "") return "-";
  if (moneyKeys.has(key)) return formatRupiah(Number(value) || 0);
  if (numberKeys.has(key)) return formatNumber(Number(value) || 0);
  return String(value);
}

function DataTable({ columns, rows, onSelect }: {
  columns: { key: string; label: string; align?: "right" }[];
  rows: Row[];
  onSelect: (row: Row) => void;
}) {
  return (
    <div className="max-h-[560px] overflow-auto">
      <table className="w-full min-w-[820px] text-sm">
        <thead className="sticky top-0 z-10 bg-white">
          <tr className="border-b border-slate-200">
            {columns.map((c) => (
              <th key={c.key} className={`pb-3 pr-4 font-bold text-slate-500 ${c.align === "right" ? "text-right" : "text-left"}`}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row, i) => (
            <tr key={`${row.id}-${i}`} onClick={() => onSelect(row)} className="cursor-pointer transition hover:bg-slate-50">
              {columns.map((c) => (
                <td
                  key={c.key}
                  className={`py-3 pr-4 ${c.align === "right" ? "text-right font-semibold text-slate-950" : "font-medium text-slate-600"}`}
                >
                  {c.key === "issue" ? (
                    <StatusBadge label={String(row[c.key] ?? "-")} tone="amber" />
                  ) : c.key === "city_terbaca" ? (
                    <span className={row[c.key] && row[c.key] !== "-" ? "font-semibold text-emerald-700" : "text-slate-400"}>
                      {fmtCell(c.key, row[c.key] as string)}
                    </span>
                  ) : (
                    fmtCell(c.key, row[c.key] as string | number)
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function DataQualityPage() {
  const [activeId, setActiveId] = useState<SectionId>("produk-nama");
  const [summary, setSummary] = useState<Summary>(emptySummary);
  const [rows, setRows] = useState<Row[]>([]);
  const [selectedRow, setSelectedRow] = useState<Row | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const menuItems = menuMeta.map((m) => ({ ...m, count: summary[m.id] }));
  const activeMenu = menuItems.find((m) => m.id === activeId) ?? menuItems[0]!;

  const kpiItems = [
    { label: "Produk Perlu Dirapikan", value: formatNumber(summary["produk-nama"] + summary["produk-kategori"]), detail: "Nama + kategori", tone: "amber" },
    { label: "Pelanggan Perlu Dicek", value: formatNumber(summary.pelanggan), detail: "Nama bermasalah", tone: "amber" },
    { label: "No HP Tidak Normal", value: formatNumber(summary.hp), detail: "Format salah", tone: "amber" },
    { label: "Kota Belum Terbaca", value: formatNumber(summary.kota), detail: "Dari alamat", tone: "amber" },
  ] satisfies KpiItem[];

  useEffect(() => {
    fetch("/api/data-quality?section=summary")
      .then((res) => (res.ok ? (res.json() as Promise<Summary>) : Promise.reject()))
      .then(setSummary)
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(false);
    fetch(`/api/data-quality?section=${activeId}`)
      .then((res) => (res.ok ? (res.json() as Promise<Row[]>) : Promise.reject()))
      .then(setRows)
      .catch(() => {
        setRows([]);
        setError(true);
      })
      .finally(() => setLoading(false));
  }, [activeId]);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#eef2f6]/90 text-brand-deep">
      <AppHeader />
      <main className="mx-auto flex w-full max-w-[1680px] flex-col gap-6 px-5 py-6 sm:px-7 lg:px-10">
        <div>
          <h1 className="text-3xl font-black tracking-[-0.045em] text-slate-950 sm:text-4xl">Kualitas Data</h1>
          <p className="mt-2 max-w-3xl text-sm font-medium leading-6 text-slate-600 sm:text-base">
            Daftar data yang benar-benar perlu dirapikan. Data marketplace yang wajar tanpa No HP/alamat tidak dihitung sebagai masalah.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {menuItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveId(item.id)}
              className={`flex min-h-[96px] flex-col items-start justify-between gap-3 rounded-2xl border border-brand-red bg-brand-red p-4 text-left text-white shadow-card transition hover:bg-[#d60511] ${
                activeId === item.id ? "ring-4 ring-brand-red/20" : "opacity-90 hover:opacity-100"
              }`}
            >
              <span className="text-sm font-black leading-snug tracking-[-0.02em]">{item.title}</span>
              <span className="inline-flex rounded-full bg-white px-2.5 py-1 text-xs font-black text-brand-red">
                {formatNumber(item.count)} data
              </span>
            </button>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {kpiItems.map((item) => (
            <KpiCard key={item.label} item={item} />
          ))}
        </div>

        <DataPanel title={activeMenu.title} subtitle={activeMenu.note}>
          {loading && <p className="py-8 text-center text-sm font-medium text-slate-400">Memuat data…</p>}
          {error && !loading && (
            <p className="py-8 text-center text-sm font-medium text-amber-600">
              Data belum bisa dimuat. Pastikan database aktif.
            </p>
          )}
          {!loading && !error && rows.length === 0 && (
            <p className="py-8 text-center text-sm font-medium text-emerald-700">
              Bagus — tidak ada data bermasalah untuk bagian ini.
            </p>
          )}
          {!loading && !error && rows.length > 0 && (
            <DataTable columns={tableColumns[activeId]} rows={rows} onSelect={setSelectedRow} />
          )}
        </DataPanel>

        <DataPanel title="Catatan Data">
          <p className="text-sm font-medium leading-6 text-slate-600">
            Data ini dibaca langsung dari database ERP. Yang tidak bisa dirapikan otomatis bisa diperbaiki lewat menu Data Utama (edit).
          </p>
        </DataPanel>

        <DatabaseBackButton />
      </main>

      {selectedRow && (
        <DetailRecordModal
          title={`Detail ${activeMenu.title}`}
          subtitle="Informasi lengkap dari baris data yang dipilih."
          fields={Object.entries(selectedRow).map(([key, value]) => ({
            label: labelMap[key] ?? key,
            value: moneyKeys.has(key) ? formatRupiah(Number(value) || 0) : value,
          }))}
          onClose={() => setSelectedRow(null)}
        />
      )}
      <footer className="pb-7 pt-3 text-center text-xs font-medium text-slate-500 sm:text-sm">
        © 2026 Probetes ERP. All rights reserved.
      </footer>
    </div>
  );
}
