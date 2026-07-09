"use client";

import { DummyBanner } from "@/features/marketing/components/DummyBanner";
import { MarketingBackButton } from "@/features/marketing/components/MarketingBackButton";
import { SimpleBarChart, SimpleLineChart, DonutChart } from "@/features/marketing/components/Charts";
import { salesByChannel, salesByProduct, dailySales, channelColor } from "@/features/marketing/data/dummy";
import { formatRupiah, formatRupiahRingkas } from "@/features/marketing/lib/format";

export default function SalesReportPage() {
  const totalOmzet = salesByChannel.reduce((sum, s) => sum + s.omzet, 0);
  const totalOrder = salesByChannel.reduce((sum, s) => sum + s.orders, 0);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#eef2f6]/90 text-brand-deep">
      <main className="mx-auto flex w-full max-w-[1680px] flex-col gap-6 px-5 py-6 sm:px-7 lg:px-10">
        <DummyBanner />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-[-0.03em] text-slate-900">Laporan Penjualan</h1>
            <p className="mt-1 text-sm font-medium text-slate-500">Omzet asli dari closingan (Skalev) dan marketplace.</p>
          </div>
          <div className="flex gap-2">
            <select className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm outline-none">
              <option>Juni 2026</option>
              <option>Mei 2026</option>
            </select>
          </div>
        </div>

        {/* KPI */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-[20px] bg-brand-red p-6 text-white shadow-sm">
            <p className="text-sm font-medium text-white/80">Total Omzet</p>
            <p className="mt-1 text-2xl font-extrabold tracking-tight">{formatRupiahRingkas(totalOmzet)}</p>
            <p className="mt-3 text-xs font-medium text-white/70">Dari semua channel</p>
          </div>
          <div className="rounded-[20px] bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Total Pesanan</p>
            <p className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">{totalOrder.toLocaleString("id-ID")}</p>
            <p className="mt-3 text-xs font-medium text-emerald-600">↑ 12% vs bulan lalu</p>
          </div>
          <div className="rounded-[20px] bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Average Order Value (AOV)</p>
            <p className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">{formatRupiahRingkas(totalOmzet / totalOrder)}</p>
            <p className="mt-3 text-xs font-medium text-slate-400">Rata-rata belanja</p>
          </div>
          <div className="rounded-[20px] bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Channel Tertinggi</p>
            <p className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">Meta</p>
            <p className="mt-3 text-xs font-medium text-slate-400">Menyumbang 52% omzet</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Tren Omzet */}
          <div className="rounded-[24px] bg-white p-6 shadow-sm lg:col-span-2">
            <h2 className="text-lg font-bold tracking-[-0.02em] text-slate-900">Tren Omzet Harian</h2>
            <div className="mt-6">
              <SimpleLineChart
                data={dailySales.map((d) => ({ label: d.tanggal, value: d.omzet }))}
                formatValue={formatRupiahRingkas}
                height={180}
              />
            </div>
          </div>

          {/* Donut per Channel */}
          <div className="rounded-[24px] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold tracking-[-0.02em] text-slate-900">Proporsi Channel</h2>
            <div className="mt-6 flex flex-col items-center">
              <DonutChart
                data={salesByChannel.map((c) => ({
                  label: c.channel,
                  value: c.omzet,
                  color: channelColor[c.channel] || channelColor["Lainnya"] || "#ccc",
                }))}
                size={160}
              />
              <div className="mt-8 flex w-full flex-col gap-3">
                {salesByChannel.map((c) => (
                  <div key={c.channel} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="size-3 rounded-sm" style={{ backgroundColor: channelColor[c.channel] || channelColor["Lainnya"] }} />
                      <span className="font-semibold text-slate-700">{c.channel}</span>
                    </div>
                    <span className="font-bold text-slate-900">{formatRupiahRingkas(c.omzet)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tabel Penjualan per Produk */}
        <div className="rounded-[24px] bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-lg font-bold tracking-[-0.02em] text-slate-900">Penjualan per Produk</h2>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 font-semibold text-slate-500">
                  <th className="pb-3 pr-4 font-semibold">Produk</th>
                  <th className="pb-3 pr-4 font-semibold">Channel</th>
                  <th className="pb-3 pr-4 text-right font-semibold">Qty</th>
                  <th className="pb-3 pr-4 text-right font-semibold">Omzet</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {salesByProduct.map((p, i) => (
                  <tr key={i}>
                    <td className="py-4 pr-4 font-bold text-slate-900">{p.produk}</td>
                    <td className="py-4 pr-4">
                      <span className="inline-flex rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                        {p.channel}
                      </span>
                    </td>
                    <td className="py-4 pr-4 text-right">{p.qty.toLocaleString("id-ID")}</td>
                    <td className="py-4 pr-4 text-right font-bold text-slate-900">{formatRupiah(p.omzet)}</td>
                  </tr>
                ))}
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
