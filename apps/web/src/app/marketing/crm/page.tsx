"use client";

import { useState } from "react";
// Kita pakai dummy banner dari sisi server component terpisah, atau biarkan di sini.
// Karena ada input manual, kita jadikan client component.
import { DummyBanner } from "@/features/marketing/components/DummyBanner";
import { MarketingBackButton } from "@/features/marketing/components/MarketingBackButton";
import { rfmSegments, rfmColor, cohortRows, crmCustomers, csOptions, channelOptions, productOptions } from "@/features/marketing/data/dummy";
import { formatRupiahRingkas } from "@/features/marketing/lib/format";
import { SimpleBarChart } from "@/features/marketing/components/Charts";
import { UserPlus, Save, RefreshCw } from "lucide-react";

export default function CrmPage() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#eef2f6]/90 text-brand-deep">
      <main className="mx-auto flex w-full max-w-[1680px] flex-col gap-6 px-5 py-6 sm:px-7 lg:px-10">
        <DummyBanner />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-[-0.03em] text-slate-900">CRM (RFM &amp; Cohort)</h1>
            <p className="mt-1 text-sm font-medium text-slate-500">Analisis retensi dan nilai pelanggan jangka panjang.</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {}}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              <RefreshCw className="size-4" /> Hitung Ulang RFM
            </button>
            <button
              onClick={() => setShowForm(!showForm)}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-red px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-[#d60511]"
            >
              <UserPlus className="size-4" /> Input Closingan
            </button>
          </div>
        </div>

        {/* Form Input Closingan Manual */}
        {showForm && (
          <div className="rounded-[24px] bg-white p-6 shadow-sm border border-brand-red/20 sm:p-8">
            <h2 className="text-lg font-bold tracking-[-0.02em] text-slate-900">Input Manual Closingan (CS)</h2>
            <p className="mt-1 mb-6 text-sm text-slate-500">Sistem akan otomatis mencocokkan nomor HP. Jika sudah ada, transaksi ditambahkan ke cohort pelanggan lama.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal</label>
                <input type="date" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red" defaultValue="2026-07-09" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nomor HP</label>
                <input type="text" placeholder="08..." className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Pelanggan</label>
                <input type="text" placeholder="Nama..." className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Produk</label>
                <select className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red">
                  <option value="">Pilih Produk...</option>
                  {productOptions.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Qty</label>
                  <input type="number" min="1" defaultValue="1" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Total Harga</label>
                  <input type="number" placeholder="Rp..." className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">CS (Handler)</label>
                  <select className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red">
                    {csOptions.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Channel Asal</label>
                  <select className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red">
                    {channelOptions.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setShowForm(false)} className="rounded-xl px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100">Batal</button>
              <button className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800"><Save className="size-4" /> Simpan Closingan</button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Segmen RFM */}
          <div className="rounded-[24px] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold tracking-[-0.02em] text-slate-900">Segmen Pelanggan (RFM)</h2>
            <p className="text-sm text-slate-500 mt-1 mb-6">Berdasarkan Recency (kapan terakhir beli), Frequency, dan Monetary.</p>
            <div className="mt-6">
              <SimpleBarChart
                data={rfmSegments.map((r, i) => ({ label: r.nama, value: r.jumlah, color: rfmColor[i] || "#ccc" }))}
                height={160}
              />
            </div>
          </div>

          <div className="flex flex-col gap-4 rounded-[24px] bg-white p-6 shadow-sm">
             <h2 className="text-lg font-bold tracking-[-0.02em] text-slate-900">Keterangan Segmen</h2>
             <div className="flex flex-col gap-3 mt-2">
                {rfmSegments.map((r, i) => (
                  <div key={r.nama} className="flex items-center gap-3">
                    <div className="size-4 rounded flex-shrink-0" style={{ backgroundColor: rfmColor[i] }} />
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-slate-800">{r.nama}</span>
                        <span className="text-sm font-bold text-slate-900">{r.jumlah} orang</span>
                      </div>
                      <p className="text-xs text-slate-500">{r.keterangan}</p>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </div>

        {/* Tabel Cohort Retensi (Heatmap) */}
        <div className="rounded-[24px] bg-white p-6 shadow-sm sm:p-8 overflow-hidden">
          <h2 className="text-lg font-bold tracking-[-0.02em] text-slate-900">Cohort Retensi (Bulan ke Bulan)</h2>
          <p className="text-sm text-slate-500 mt-1 mb-6">Persentase pelanggan yang kembali berbelanja di bulan-bulan berikutnya.</p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-separate border-spacing-1">
              <thead>
                <tr>
                  <th className="pb-3 px-2 font-semibold text-slate-500 w-24">Bulan Gabung</th>
                  <th className="pb-3 px-2 font-semibold text-slate-500 text-right w-20">Pelanggan</th>
                  {[0,1,2,3,4,5].map(m => (
                    <th key={m} className="pb-3 px-2 font-semibold text-slate-500 text-center w-16">Bulan {m}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cohortRows.map(row => (
                  <tr key={row.cohort}>
                    <td className="py-2 px-2 font-bold text-slate-800">{row.cohort}</td>
                    <td className="py-2 px-2 text-right font-medium text-slate-600 border-r border-slate-100 pr-4">{row.ukuran}</td>
                    {row.retensi.map((val, i) => {
                      if (val === null) return <td key={i} className="py-2 px-2 bg-slate-50 rounded-md"></td>;
                      // Heatmap color logic (simple opacity based on percentage)
                      let bg = "bg-brand-red/5";
                      if (val > 80) bg = "bg-brand-red text-white";
                      else if (val > 40) bg = "bg-brand-red/60 text-white";
                      else if (val > 30) bg = "bg-brand-red/40 text-brand-red";
                      else if (val > 20) bg = "bg-brand-red/20 text-brand-red";

                      return (
                        <td key={i} className={`py-2 px-2 text-center font-bold rounded-md ${bg}`}>
                          {val}%
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tabel Data Pelanggan CRM */}
        <div className="rounded-[24px] bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-lg font-bold tracking-[-0.02em] text-slate-900">Daftar Pelanggan Utama</h2>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 font-semibold text-slate-500">
                  <th className="pb-3 pr-4 font-semibold">Pelanggan &amp; HP</th>
                  <th className="pb-3 pr-4 font-semibold">Segmen</th>
                  <th className="pb-3 pr-4 text-right font-semibold">Freq</th>
                  <th className="pb-3 pr-4 text-right font-semibold">Total Nilai</th>
                  <th className="pb-3 pr-4 font-semibold">Trx Terakhir</th>
                  <th className="pb-3 pr-4 font-semibold">CS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {crmCustomers.map((c, i) => {
                  const rfmIdx = rfmSegments.findIndex(s => s.nama === c.segmen);
                  const color = rfmIdx >= 0 ? rfmColor[rfmIdx] : "#94A3B8";

                  return (
                    <tr key={i}>
                      <td className="py-4 pr-4">
                        <div className="font-bold text-slate-900">{c.nama}</div>
                        <div className="text-xs text-slate-500">{c.hp}</div>
                      </td>
                      <td className="py-4 pr-4">
                        <span className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-bold" style={{ backgroundColor: `${color}15`, color }}>
                           <span className="size-1.5 rounded-full" style={{ backgroundColor: color }} />
                           {c.segmen}
                        </span>
                      </td>
                      <td className="py-4 pr-4 text-right">{c.frekuensi}x</td>
                      <td className="py-4 pr-4 text-right font-bold text-slate-900">{formatRupiahRingkas(c.totalBeli)}</td>
                      <td className="py-4 pr-4 text-slate-600">{c.terakhir}</td>
                      <td className="py-4 pr-4">{c.cs}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex">
          <MarketingBackButton />
        </div>
      </main>
      <footer className="pb-7 pt-3 text-center text-xs font-medium text-slate-500 sm:text-sm">
        © 2026 Probetes ERP. All rights reserved.
      </footer>
    </div>
  );
}
