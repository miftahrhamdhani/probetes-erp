"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppHeader } from "@/components/layout/AppHeader";
import { DatabaseBackButton } from "@/features/database/components/DatabaseBackButton";
import { DataPanel } from "@/features/database/components/DataPanel";
import { KpiCard } from "@/features/database/components/KpiCard";
import type { KpiItem } from "@/features/database/types/database.types";
import { formatNumber } from "@/features/database/master-data/lib/format";

interface SummaryData {
  core: {
    pelanggan: number;
    target_crm: number;
    pesanan: number;
    transaksi_cohort: number;
    produk: number;
    data_awal: string | null;
    data_akhir: string | null;
  };
  cluster: { baru: number; repeat: number; high_value: number };
  rfm: { segment: string; jumlah: number; nilai: number }[];
  health: {
    produk_tanpa_kategori: number;
    produk_nama_review: number;
    nama_bermasalah: number;
    kota_kosong: number;
    hp_tidak_normal: number;
    channel_belum_tercatat: number;
  };
}

const BULAN = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
];

function fmtBulan(iso: string | null) {
  if (!iso) return "-";
  const [y, m] = iso.split("-");
  return `${BULAN[Number(m) - 1] ?? m} ${y}`;
}

// Warna donut segmen — merah Probetes ke abu, konsisten & aksesibel.
const segmentColor: Record<string, string> = {
  Champions: "#E30613",
  Loyal: "#F0483E",
  "Big Spender": "#F97316",
  Berpotensi: "#FBBF24",
  "Pelanggan Baru": "#38BDF8",
  "Berisiko Hilang": "#94A3B8",
  "Tidak Aktif": "#CBD5E1",
};

function num(v: number | undefined) {
  return formatNumber(v ?? 0);
}

export function DatabaseOverviewPage() {
  const [data, setData] = useState<SummaryData | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/database/summary")
      .then((res) => (res.ok ? (res.json() as Promise<SummaryData>) : Promise.reject()))
      .then(setData)
      .catch(() => setError(true));
  }, []);

  const core = data?.core;
  const cluster = data?.cluster;
  const health = data?.health;
  const rfm = data?.rfm ?? [];
  const rfmTotal = rfm.reduce((s, r) => s + r.jumlah, 0);

  const coreCards: KpiItem[] = [
    { label: "Total Pelanggan", value: num(core?.pelanggan), detail: "Terdata", tone: "blue" },
    { label: "Target CRM", value: num(core?.target_crm), detail: "Bisa di-WA", tone: "green" },
    { label: "Total Pesanan", value: num(core?.pesanan), detail: "Operasional", tone: "slate" },
    { label: "Transaksi Cohort", value: num(core?.transaksi_cohort), detail: "Closing CRM", tone: "slate" },
    { label: "Total Produk", value: num(core?.produk), detail: "Master", tone: "slate" },
  ];

  const clusterCards: KpiItem[] = [
    { label: "Pelanggan Baru", value: num(cluster?.baru), detail: "Sekali beli", tone: "blue" },
    { label: "Repeat", value: num(cluster?.repeat), detail: "Beli ulang", tone: "green" },
    { label: "High Value", value: num(cluster?.high_value), detail: "Belanja besar", tone: "red" },
  ];

  const healthItems = [
    { label: "Nama produk perlu dirapikan", value: health?.produk_nama_review ?? 0 },
    { label: "Produk belum berkategori", value: health?.produk_tanpa_kategori ?? 0 },
    { label: "Nama pelanggan bermasalah", value: health?.nama_bermasalah ?? 0 },
    { label: "Kota belum terbaca", value: health?.kota_kosong ?? 0 },
    { label: "No HP tidak normal", value: health?.hp_tidak_normal ?? 0 },
    { label: "Channel belum tercatat", value: health?.channel_belum_tercatat ?? 0 },
  ];

  // Donut sederhana pakai conic-gradient (tanpa library).
  let acc = 0;
  const gradient = rfm
    .map((r) => {
      const start = (acc / (rfmTotal || 1)) * 360;
      acc += r.jumlah;
      const end = (acc / (rfmTotal || 1)) * 360;
      return `${segmentColor[r.segment] ?? "#CBD5E1"} ${start}deg ${end}deg`;
    })
    .join(", ");

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#eef2f6]/90 text-brand-deep">
      <AppHeader />
      <main className="mx-auto flex w-full max-w-[1680px] flex-col gap-6 px-5 py-6 sm:px-7 lg:px-10">
        <div>
          <h1 className="text-3xl font-black tracking-[-0.045em] text-slate-950 sm:text-4xl">Ringkasan Data</h1>
          <p className="mt-2 max-w-3xl text-sm font-medium leading-6 text-slate-600 sm:text-base">
            Kesehatan data dan kondisi pelanggan dalam satu pandangan. Semua angka dibaca langsung dari database ERP.
          </p>
        </div>

        {error && (
          <DataPanel>
            <p className="py-4 text-center text-sm font-semibold text-amber-600">
              Data belum bisa dimuat. Pastikan database aktif.
            </p>
          </DataPanel>
        )}

        {/* Baris 1 — Angka Inti Bisnis */}
        <div>
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-lg font-bold tracking-[-0.03em] text-slate-950">Angka Inti Bisnis</h2>
            <span className="text-xs font-semibold text-slate-500">
              Rentang data: {fmtBulan(core?.data_awal ?? null)} – {fmtBulan(core?.data_akhir ?? null)}
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {coreCards.map((item) => (
              <KpiCard key={item.label} item={item} />
            ))}
          </div>
        </div>

        {/* Baris 2 — Kondisi & Segmen Pelanggan */}
        <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
          <DataPanel title="Kondisi Pelanggan" subtitle="Baru, repeat, dan bernilai tinggi.">
            <div className="grid gap-4 sm:grid-cols-3">
              {clusterCards.map((item) => (
                <KpiCard key={item.label} item={item} />
              ))}
            </div>
          </DataPanel>

          <DataPanel title="Segmen Pelanggan (RFM)" subtitle="Hanya pelanggan yang bisa di-follow up CRM.">
            <div className="flex flex-col items-center gap-6 sm:flex-row">
              <div className="relative shrink-0" style={{ width: 150, height: 150 }}>
                <div
                  className="size-full rounded-full"
                  style={{ background: rfmTotal ? `conic-gradient(${gradient})` : "#E2E8F0" }}
                />
                <div className="absolute inset-[22%] grid place-items-center rounded-full bg-white text-center shadow-inner">
                  <div>
                    <p className="text-xl font-black leading-none text-slate-950">{num(rfmTotal)}</p>
                    <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">Target CRM</p>
                  </div>
                </div>
              </div>
              <ul className="flex w-full flex-col gap-2">
                {rfm.map((r) => (
                  <li key={r.segment} className="flex items-center gap-2.5 text-sm">
                    <span className="size-3 shrink-0 rounded-full" style={{ background: segmentColor[r.segment] ?? "#CBD5E1" }} />
                    <span className="flex-1 font-semibold text-slate-700">{r.segment}</span>
                    <span className="font-black text-slate-950">{num(r.jumlah)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </DataPanel>
        </div>

        {/* Baris 3 — Kesehatan Data */}
        <DataPanel
          title="Kesehatan Data"
          subtitle="Data yang masih perlu dirapikan. Klik untuk melihat daftarnya di Kualitas Data."
        >
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {healthItems.map((item) => {
              const clean = item.value === 0;
              return (
                <Link
                  key={item.label}
                  href="/database/data-quality"
                  className={`flex items-center justify-between rounded-2xl border p-4 transition ${
                    clean
                      ? "border-emerald-100 bg-emerald-50/60 hover:border-emerald-200"
                      : "border-amber-100 bg-amber-50/60 hover:border-amber-300"
                  }`}
                >
                  <span className="text-sm font-semibold text-slate-700">{item.label}</span>
                  <span className={`text-lg font-black ${clean ? "text-emerald-600" : "text-amber-700"}`}>
                    {clean ? "Aman" : num(item.value)}
                  </span>
                </Link>
              );
            })}
          </div>
        </DataPanel>

        <DataPanel title="Catatan">
          <p className="text-sm font-medium leading-6 text-slate-600">
            Ringkasan ini fokus pada jumlah data dan kualitasnya. Laporan nilai penjualan dan performa
            (RFM, cohort, omzet) akan tampil di menu Reports agar rumusnya bisa dipastikan benar dulu.
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
