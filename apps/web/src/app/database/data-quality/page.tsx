"use client";

import { useState } from "react";
import { AppHeader } from "@/components/layout/AppHeader";
import { DatabaseBackButton } from "@/features/database/components/DatabaseBackButton";
import { DataPanel } from "@/features/database/overview/components/DataPanel";
import { KpiCard } from "@/features/database/overview/components/KpiCard";
import { StatusBadge } from "@/features/database/overview/components/StatusBadge";
import { formatNumber, formatRupiah } from "@/features/database/master-data/lib/format";
import type { KpiItem, StatusTone } from "@/features/database/overview/types/databaseOverview.types";

type SectionId = "produk" | "pelanggan" | "hp" | "pesanan" | "nilai";

type ProductIssue = {
  id: string;
  product: string;
  original: string;
  qty: number;
  value: number;
  issue: string;
  suggestion: string;
  priority: string;
};

type CustomerIssue = {
  id: string;
  name: string;
  city: string;
  source: string;
  trx: number;
  issue: string;
};

type PhoneIssue = {
  id: string;
  name: string;
  phone: string;
  length: number;
  issue: string;
};

type OrderCompare = {
  id: string;
  type: string;
  date: string;
  customer: string;
  product: string;
  qty: number;
  value: number;
  status: string;
};

const kpiItems = [
  { label: "Produk Perlu Dirapikan", value: "34", detail: "Tampil tabel", tone: "amber" },
  { label: "Pelanggan Perlu Dicek", value: "2.054", detail: "Tampil tabel", tone: "amber" },
  { label: "No HP Tidak Normal", value: "10", detail: "Tampil tabel", tone: "amber" },
  { label: "Selisih Pesanan", value: "733", detail: "Cek data", tone: "amber" },
] satisfies KpiItem[];

const menuItems: Array<{ id: SectionId; title: string; badge: string; tone: StatusTone }> = [
  { id: "produk", title: "Nama Produk Perlu Dirapikan", badge: "34 data", tone: "amber" },
  { id: "pelanggan", title: "Pelanggan Perlu Dicek", badge: "2.054 data", tone: "amber" },
  { id: "hp", title: "No HP Tidak Normal", badge: "10 data", tone: "amber" },
  { id: "pesanan", title: "Pesanan vs Cohort", badge: "733 selisih", tone: "amber" },
  { id: "nilai", title: "Nilai Pesanan vs Penjualan", badge: "Selisih nilai", tone: "amber" },
];

const productIssues: ProductIssue[] = [
  { id: "PRD-001", product: "Amandia 10", original: "Amandia 10 / Tk Amandia 10", qty: 7810, value: 740130216, issue: "Prefiks S/Tk", suggestion: "Gabung ke produk inti + simpan atribut", priority: "Tinggi" },
  { id: "PRD-004", product: "Yacona", original: "Yacona", qty: 50, value: 12450000, issue: "Kemungkinan duplikat", suggestion: "Konfirmasi lalu gabung", priority: "Sedang" },
  { id: "PRD-006", product: "MINYAK", original: "MINYAK", qty: 6, value: 184000, issue: "Nama polos ambigu", suggestion: "Tanya owner produk mana", priority: "Tinggi" },
  { id: "PRD-007", product: "Beras", original: "BERAS / Beras", qty: 24, value: 962000, issue: "Nama polos ambigu", suggestion: "Tanya owner produk mana", priority: "Tinggi" },
  { id: "PRD-012", product: "Amandia", original: "Amandia", qty: 1, value: 130000, issue: "Nama polos ambigu", suggestion: "Tanya owner produk mana", priority: "Tinggi" },
  { id: "PRD-013", product: "Stevia", original: "Stevia Bonus / Stevia / STEVIA", qty: 275, value: 3750000, issue: "Ada varian Bonus", suggestion: "Gabung ke produk inti + flag bonus", priority: "Sedang" },
  { id: "PRD-014", product: "Beras Organik", original: "Beras Organik / Beras Organik Bonus", qty: 2207, value: 80090656, issue: "Ada varian Bonus", suggestion: "Gabung ke produk inti + flag bonus", priority: "Sedang" },
  { id: "PRD-016", product: "Amandia 5", original: "Amandia 5 / S Amandia 5", qty: 56, value: 3020000, issue: "Prefiks S/Tk", suggestion: "Gabung ke produk inti + simpan atribut", priority: "Tinggi" },
  { id: "PRD-018", product: "Ebook 90", original: "Ebook 90 / Ebook 90 Bonus", qty: 10418, value: 939654793, issue: "Ada varian Bonus", suggestion: "Gabung ke produk inti + flag bonus", priority: "Sedang" },
  { id: "PRD-022", product: "Amandia10", original: "Amandia10", qty: 4, value: 360000, issue: "Kemungkinan duplikat", suggestion: "Konfirmasi lalu gabung", priority: "Sedang" },
  { id: "PRD-037", product: "Buku Remisi", original: "Buku Remisi / Buku Remisi Bonus / S Buku Remisi / Tk Buku Remisi", qty: 1145, value: 97999553, issue: "Prefiks S/Tk", suggestion: "Gabung ke produk inti + simpan atribut", priority: "Tinggi" },
  { id: "PRD-038", product: "Ebook Hipertrnsi", original: "Ebook Hipertrnsi", qty: 1, value: 89000, issue: "Kemungkinan duplikat", suggestion: "Konfirmasi lalu gabung", priority: "Sedang" },
  { id: "PRD-047", product: "Amandia 7", original: "Amandia 7 / S Amandia 7 / Tk Amandia 7 / Bonus", qty: 6550, value: 465986818, issue: "Prefiks S/Tk", suggestion: "Gabung ke produk inti + simpan atribut", priority: "Tinggi" },
  { id: "PRD-049", product: "Probetes Herbal 24", original: "Probetes Herbal 24 / S Probetes Herbal 24 / Tk Probetes Herbal 24", qty: 15471, value: 1341654969, issue: "Prefiks S/Tk", suggestion: "Gabung ke produk inti + simpan atribut", priority: "Tinggi" },
  { id: "PRD-055", product: "Amandia Muesli", original: "Amandia Muesli / Bonus / S / Tk", qty: 1026, value: 46942398, issue: "Prefiks S/Tk", suggestion: "Gabung ke produk inti + simpan atribut", priority: "Tinggi" },
  { id: "PRD-056", product: "Minyak VCO", original: "Minyak VCO / Bonus / S Minyak VCO", qty: 116, value: 5920000, issue: "Prefiks S/Tk + duplikat", suggestion: "Gabung ke produk inti", priority: "Tinggi" },
  { id: "PRD-058", product: "Ebook Fatloss", original: "Ebook Fatloss", qty: 4, value: 336000, issue: "Kemungkinan duplikat", suggestion: "Konfirmasi lalu gabung", priority: "Sedang" },
  { id: "PRD-059", product: "Probetes Oil", original: "Probetes Oil / Bonus / S / Tk", qty: 916, value: 46890411, issue: "Prefiks S/Tk", suggestion: "Gabung ke produk inti + simpan atribut", priority: "Tinggi" },
  { id: "PRD-060", product: "Probetes Herbal", original: "Probetes Herbal", qty: 9, value: 869000, issue: "Nama polos ambigu", suggestion: "Tanya owner produk mana", priority: "Tinggi" },
  { id: "PRD-061", product: "Minyak CCO", original: "Minyak CCO", qty: 1, value: 60000, issue: "Kemungkinan duplikat", suggestion: "Konfirmasi lalu gabung", priority: "Sedang" },
  { id: "PRD-063", product: "Amandia Museli", original: "Amandia Museli", qty: 2, value: 64000, issue: "Kemungkinan duplikat", suggestion: "Konfirmasi lalu gabung", priority: "Sedang" },
  { id: "PRD-067", product: "Ebook Hiperteni", original: "Ebook Hiperteni", qty: 1, value: 98000, issue: "Kemungkinan duplikat", suggestion: "Konfirmasi lalu gabung", priority: "Sedang" },
  { id: "PRD-069", product: "Pro Herbal 24", original: "Pro Herbal 24", qty: 8, value: 720000, issue: "Kemungkinan duplikat", suggestion: "Konfirmasi lalu gabung", priority: "Sedang" },
  { id: "PRD-070", product: "NEU20", original: "NEU20", qty: 35, value: 0, issue: "Kode tidak jelas", suggestion: "Konfirmasi produk / promo / salah input", priority: "Sedang" },
  { id: "PRD-071", product: "GM", original: "GM", qty: 60, value: 0, issue: "Kode tidak jelas", suggestion: "Konfirmasi produk / promo / salah input", priority: "Sedang" },
  { id: "PRD-072", product: "Minyak Kelapa VCO", original: "Minyak Kelapa VCO Bonus / Minyak Kelapa VCO", qty: 32, value: 1184000, issue: "Ada varian Bonus", suggestion: "Gabung ke produk inti + flag bonus", priority: "Sedang" },
  { id: "PRD-073", product: "Tas Probetes", original: "Tas Probetes Bonus", qty: 38, value: 0, issue: "Ada varian Bonus", suggestion: "Gabung ke produk inti + flag bonus", priority: "Sedang" },
  { id: "PRD-075", product: "Minyak Kelapa CCO", original: "Minyak Kelapa CCO / Bonus", qty: 228, value: 10560000, issue: "Ada varian Bonus", suggestion: "Gabung ke produk inti + flag bonus", priority: "Sedang" },
  { id: "PRD-076", product: "Topping", original: "Topping Bonus / Topping", qty: 20, value: 0, issue: "Ada varian Bonus", suggestion: "Gabung ke produk inti + flag bonus", priority: "Sedang" },
  { id: "PRD-077", product: "Pro Herbal", original: "Pro Herbal Dummy", qty: 428, value: 0, issue: "Data test", suggestion: "Keluarkan dari penjualan", priority: "Tinggi" },
  { id: "PRD-078", product: "HP COD", original: "HP COD", qty: 358, value: 34772000, issue: "Kode tidak jelas", suggestion: "Konfirmasi produk / promo / salah input", priority: "Sedang" },
  { id: "PRD-079", product: "GMB", original: "GMB", qty: 3, value: 0, issue: "Kode tidak jelas", suggestion: "Konfirmasi produk / promo / salah input", priority: "Sedang" },
  { id: "PRD-080", product: "HP", original: "HP", qty: 1, value: 99000, issue: "Kode tidak jelas", suggestion: "Konfirmasi produk / promo / salah input", priority: "Sedang" },
  { id: "PRD-081", product: "Paket Apresiasi Remisi", original: "Paket Apresiasi Remisi", qty: 2, value: 0, issue: "Nilai jual Rp 0", suggestion: "Cek bonus / promo / salah input", priority: "Rendah" },
];

const customerIssues: CustomerIssue[] = [
  { id: "PB-CUST-21431", name: "#ERROR!", city: "-", source: "04_cohort", trx: 0, issue: "Nama tidak terbaca" },
  { id: "PB-CUST-21129", name: "250812KDTRX7RR", city: "-", source: "02_probetes_non_prodig", trx: 1, issue: "Nama tidak wajar" },
  { id: "PB-CUST-20649", name: "44N", city: "BARITO SELATAN", source: "01_database_all", trx: 2, issue: "Nama terlalu pendek" },
  { id: "PB-CUST-19462", name: "Aan Dwi", city: "Bandar Lampung", source: "01_database_all", trx: 2, issue: "No HP kosong" },
  { id: "PB-CUST-15617", name: "abdul halim", city: "-", source: "01_database_all", trx: 2, issue: "No HP kosong" },
  { id: "PB-CUST-13256", name: "abdul haq", city: "-", source: "01_database_all", trx: 2, issue: "No HP kosong" },
  { id: "PB-CUST-14107", name: "Abdul Latif R", city: "-", source: "01_database_all", trx: 1, issue: "No HP kosong" },
  { id: "PB-CUST-5986", name: "abdul ropiq", city: "-", source: "01_database_all", trx: 2, issue: "No HP kosong" },
  { id: "PB-CUST-0775", name: "Abdul Syukur", city: "-", source: "01_database_all", trx: 1, issue: "No HP kosong" },
  { id: "PB-CUST-3572", name: "Abdur rauf", city: "-", source: "01_database_all", trx: 2, issue: "No HP kosong" },
];

const phoneIssues: PhoneIssue[] = [
  { id: "PB-CUST-2266", name: "Kak Anugrah kusuma", phone: "6387774690006", length: 13, issue: "Tidak diawali 62" },
  { id: "PB-CUST-6265", name: "Ibu yanida gulo", phone: "685274696376", length: 12, issue: "Tidak diawali 62" },
  { id: "PB-CUST-6758", name: "Siti nur elisa", phone: "682264416933", length: 12, issue: "Tidak diawali 62" },
  { id: "PB-CUST-9232", name: "Ibu Adelia Safitri", phone: "6381241528515", length: 13, issue: "Tidak diawali 62" },
  { id: "PB-CUST-10840", name: "Ibu Nung Tirta", phone: "64210611678", length: 11, issue: "Tidak diawali 62" },
  { id: "PB-CUST-11567", name: "Kak Tony", phone: "97433362273", length: 11, issue: "Tidak diawali 62" },
  { id: "PB-CUST-12484", name: "Bpk Mardian Rico", phone: "60193254279", length: 11, issue: "Tidak diawali 62" },
  { id: "PB-CUST-18417", name: "Ida Bagus", phone: "281809824323", length: 12, issue: "Tidak diawali 62" },
  { id: "PB-CUST-20926", name: "Ibu Nur Fatmawati", phone: "6382223643115", length: 13, issue: "Tidak diawali 62" },
  { id: "PB-CUST-21090", name: "Ibu Anie Bakery", phone: "638872628001", length: 12, issue: "Tidak diawali 62" },
];

const orderRows: OrderCompare[] = [
  { id: "ORD-000001", type: "Pesanan", date: "2025-01-01", customer: "PB-CUST-0001", product: "Amandia 10", qty: 1, value: 278000, status: "Ada di pesanan" },
  { id: "ORD-000002", type: "Pesanan", date: "2025-01-01", customer: "PB-CUST-0002", product: "NUTRIFLAKES", qty: 3, value: 276000, status: "Ada di pesanan" },
  { id: "TRX-000001", type: "Cohort", date: "2024-07-31", customer: "PB-CUST-8210", product: "Beras Organik", qty: 3, value: 84650, status: "Ada di cohort" },
  { id: "TRX-000002", type: "Cohort", date: "2024-08-01", customer: "PB-CUST-21305", product: "Beras Organik", qty: 3, value: 97221, status: "Ada di cohort" },
];

function ProductTable() {
  return (
    <div className="max-h-[560px] overflow-auto">
      <table className="w-full min-w-[980px] text-sm">
        <thead className="sticky top-0 z-10 bg-white">
          <tr className="border-b border-slate-200">
            <th className="pb-3 pr-4 text-left font-bold text-slate-500">ID</th>
            <th className="pb-3 pr-4 text-left font-bold text-slate-500">Produk Final</th>
            <th className="pb-3 pr-4 text-left font-bold text-slate-500">Nama Asli di Data</th>
            <th className="pb-3 pr-4 text-right font-bold text-slate-500">Qty</th>
            <th className="pb-3 pr-4 text-right font-bold text-slate-500">Nilai</th>
            <th className="pb-3 pr-4 text-left font-bold text-slate-500">Masalah</th>
            <th className="pb-3 pr-4 text-left font-bold text-slate-500">Saran</th>
            <th className="pb-3 text-right font-bold text-slate-500">Prioritas</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {productIssues.map((row) => (
            <tr key={row.id}>
              <td className="py-3 pr-4 font-medium text-slate-500">{row.id}</td>
              <td className="py-3 pr-4 font-semibold text-slate-950">{row.product}</td>
              <td className="py-3 pr-4 font-medium text-slate-600">{row.original}</td>
              <td className="py-3 pr-4 text-right font-medium text-slate-600">{formatNumber(row.qty)}</td>
              <td className="py-3 pr-4 text-right font-semibold text-slate-950">{formatRupiah(row.value)}</td>
              <td className="py-3 pr-4 font-medium text-slate-600">{row.issue}</td>
              <td className="py-3 pr-4 font-medium text-slate-600">{row.suggestion}</td>
              <td className="py-3 text-right"><StatusBadge label={row.priority} tone={row.priority === "Tinggi" ? "red" : row.priority === "Sedang" ? "amber" : "slate"} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CustomerTable() {
  return (
    <div className="max-h-[560px] overflow-auto">
      <table className="w-full min-w-[760px] text-sm">
        <thead className="sticky top-0 z-10 bg-white">
          <tr className="border-b border-slate-200">
            <th className="pb-3 pr-4 text-left font-bold text-slate-500">ID Customer</th>
            <th className="pb-3 pr-4 text-left font-bold text-slate-500">Nama</th>
            <th className="pb-3 pr-4 text-left font-bold text-slate-500">Kota</th>
            <th className="pb-3 pr-4 text-left font-bold text-slate-500">Asal Data</th>
            <th className="pb-3 pr-4 text-right font-bold text-slate-500">Transaksi</th>
            <th className="pb-3 text-right font-bold text-slate-500">Masalah</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {customerIssues.map((row) => (
            <tr key={row.id}>
              <td className="py-3 pr-4 font-medium text-slate-500">{row.id}</td>
              <td className="py-3 pr-4 font-semibold text-slate-950">{row.name}</td>
              <td className="py-3 pr-4 font-medium text-slate-600">{row.city}</td>
              <td className="py-3 pr-4 font-medium text-slate-600">{row.source}</td>
              <td className="py-3 pr-4 text-right font-medium text-slate-600">{formatNumber(row.trx)}</td>
              <td className="py-3 text-right"><StatusBadge label={row.issue} tone="amber" /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PhoneTable() {
  return (
    <div className="max-h-[560px] overflow-auto">
      <table className="w-full min-w-[720px] text-sm">
        <thead className="sticky top-0 z-10 bg-white">
          <tr className="border-b border-slate-200">
            <th className="pb-3 pr-4 text-left font-bold text-slate-500">ID Customer</th>
            <th className="pb-3 pr-4 text-left font-bold text-slate-500">Nama</th>
            <th className="pb-3 pr-4 text-left font-bold text-slate-500">No HP Asli</th>
            <th className="pb-3 pr-4 text-right font-bold text-slate-500">Panjang</th>
            <th className="pb-3 text-right font-bold text-slate-500">Masalah</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {phoneIssues.map((row) => (
            <tr key={row.id}>
              <td className="py-3 pr-4 font-medium text-slate-500">{row.id}</td>
              <td className="py-3 pr-4 font-semibold text-slate-950">{row.name}</td>
              <td className="py-3 pr-4 font-medium text-slate-600">{row.phone}</td>
              <td className="py-3 pr-4 text-right font-medium text-slate-600">{row.length}</td>
              <td className="py-3 text-right"><StatusBadge label={row.issue} tone="amber" /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function OrderTable() {
  return (
    <div className="max-h-[560px] overflow-auto">
      <table className="w-full min-w-[820px] text-sm">
        <thead className="sticky top-0 z-10 bg-white">
          <tr className="border-b border-slate-200">
            <th className="pb-3 pr-4 text-left font-bold text-slate-500">ID</th>
            <th className="pb-3 pr-4 text-left font-bold text-slate-500">Jenis Data</th>
            <th className="pb-3 pr-4 text-left font-bold text-slate-500">Tanggal</th>
            <th className="pb-3 pr-4 text-left font-bold text-slate-500">Customer</th>
            <th className="pb-3 pr-4 text-left font-bold text-slate-500">Produk</th>
            <th className="pb-3 pr-4 text-right font-bold text-slate-500">Qty</th>
            <th className="pb-3 pr-4 text-right font-bold text-slate-500">Nilai</th>
            <th className="pb-3 text-right font-bold text-slate-500">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {orderRows.map((row) => (
            <tr key={row.id}>
              <td className="py-3 pr-4 font-medium text-slate-500">{row.id}</td>
              <td className="py-3 pr-4 font-semibold text-slate-950">{row.type}</td>
              <td className="py-3 pr-4 font-medium text-slate-600">{row.date}</td>
              <td className="py-3 pr-4 font-medium text-slate-600">{row.customer}</td>
              <td className="py-3 pr-4 font-medium text-slate-600">{row.product}</td>
              <td className="py-3 pr-4 text-right font-medium text-slate-600">{formatNumber(row.qty)}</td>
              <td className="py-3 pr-4 text-right font-semibold text-slate-950">{formatRupiah(row.value)}</td>
              <td className="py-3 text-right"><StatusBadge label={row.status} tone="blue" /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ActiveTable({ activeId }: { activeId: SectionId }) {
  if (activeId === "produk") return <ProductTable />;
  if (activeId === "pelanggan") return <CustomerTable />;
  if (activeId === "hp") return <PhoneTable />;
  return <OrderTable />;
}

export default function DataQualityPage() {
  const [activeId, setActiveId] = useState<SectionId>("produk");
  const activeMenu = menuItems.find((item) => item.id === activeId) ?? menuItems[0]!;

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#eef2f6]/90 text-brand-deep">
      <AppHeader />
      <main className="mx-auto flex w-full max-w-[1680px] flex-col gap-6 px-5 py-6 sm:px-7 lg:px-10">
        <div>
          <h1 className="text-3xl font-black tracking-[-0.045em] text-slate-950 sm:text-4xl">Kualitas Data</h1>
          <p className="mt-2 max-w-3xl text-sm font-medium leading-6 text-slate-600 sm:text-base">
            Pilih jenis masalah, lalu lihat daftar datanya langsung seperti halaman Data Utama.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {kpiItems.map((item) => (
            <KpiCard key={item.label} item={item} />
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {menuItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveId(item.id)}
              className={`rounded-2xl border p-4 text-left shadow-card transition ${
                activeId === item.id
                  ? "border-brand-red bg-brand-red text-white"
                  : "border-slate-200 bg-white text-slate-900 hover:border-brand-red/30"
              }`}
            >
              <span className="text-sm font-black tracking-[-0.02em]">{item.title}</span>
              <span className={`mt-3 inline-flex rounded-full px-2.5 py-1 text-xs font-black ${activeId === item.id ? "bg-white text-brand-red" : "bg-amber-50 text-amber-700"}`}>
                {item.badge}
              </span>
            </button>
          ))}
        </div>

        <DataPanel title={activeMenu.title} subtitle="Data yang ditampilkan adalah data yang perlu dicek, bukan hanya angka ringkasan.">
          <ActiveTable activeId={activeId} />
        </DataPanel>

        <DataPanel title="Catatan Data">
          <p className="text-sm font-medium leading-6 text-slate-600">
            Data ini masih contoh frontend dari file awal dan hasil olahan. Setelah database asli aktif, tabel ini tinggal diganti membaca data langsung dari database.
          </p>
        </DataPanel>

        <DatabaseBackButton />
      </main>
      <footer className="pb-7 pt-3 text-center text-xs font-medium text-slate-500 sm:text-sm">
        © 2026 Probetes ERP. All rights reserved.
      </footer>
    </div>
  );
}
