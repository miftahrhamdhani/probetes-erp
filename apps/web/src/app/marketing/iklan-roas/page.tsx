"use client";

import { DummyBanner } from "@/features/marketing/components/DummyBanner";
import { MarketingBackButton } from "@/features/marketing/components/MarketingBackButton";
import { SimpleLineChart } from "@/features/marketing/components/Charts";
import { adCampaigns, dailySpend } from "@/features/marketing/data/dummy";
import { formatRupiah, formatRupiahRingkas, formatRoas } from "@/features/marketing/lib/format";

export default function AdsRoasPage() {
  const totalSpend = adCampaigns.reduce((sum, c) => sum + c.spend, 0);
  const totalOmzet = adCampaigns.reduce((sum, c) => sum + c.omzet, 0);
  const roasAsli = totalOmzet / totalSpend;

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#eef2f6]/90 text-brand-deep">
      <main className="mx-auto flex w-full max-w-[1680px] flex-col gap-6 px-5 py-6 sm:px-7 lg:px-10">
        <DummyBanner />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-[-0.03em] text-slate-900">Iklan &amp; ROAS</h1>
            <p className="mt-1 text-sm font-medium text-slate-500">Tracking pengeluaran iklan vs omzet closingan sebenarnya.</p>
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
            <p className="text-sm font-medium text-white/80">Total Spend</p>
            <p className="mt-1 text-2xl font-extrabold tracking-tight">{formatRupiahRingkas(totalSpend)}</p>
            <p className="mt-3 text-xs font-medium text-white/70">Dari Meta &amp; Shopee Ads</p>
          </div>
          <div className="rounded-[20px] bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Omzet Closing (Asli)</p>
            <p className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">{formatRupiahRingkas(totalOmzet)}</p>
            <p className="mt-3 text-xs font-medium text-slate-400">Hasil perjodohan data</p>
          </div>
          <div className="rounded-[20px] bg-emerald-600 p-6 text-white shadow-sm">
            <p className="text-sm font-medium text-emerald-100">ROAS Asli (Skalev)</p>
            <p className="mt-1 text-2xl font-extrabold tracking-tight">{formatRoas(roasAsli)}</p>
            <p className="mt-3 text-xs font-medium text-emerald-200">Omzet Closing / Spend</p>
          </div>
          <div className="rounded-[20px] bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Avg. Cost per Purchase</p>
            <p className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">
              {formatRupiahRingkas(totalSpend / adCampaigns.reduce((sum, c) => sum + c.pembelian, 0))}
            </p>
            <p className="mt-3 text-xs font-medium text-slate-400">Spend / Jml Pembelian</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Tren Spend */}
          <div className="rounded-[24px] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold tracking-[-0.02em] text-slate-900">Tren Spend Iklan Harian</h2>
            <div className="mt-6">
              <SimpleLineChart
                data={dailySpend.map((d) => ({ label: d.tanggal, value: d.omzet }))}
                color="#E30613"
                formatValue={formatRupiahRingkas}
                height={160}
              />
            </div>
          </div>

          <div className="flex flex-col gap-4 rounded-[24px] bg-brand-red/5 p-6 border border-brand-red/10">
            <h3 className="font-bold text-brand-red">Kenapa ROAS Asli Berbeda?</h3>
            <p className="text-sm text-slate-700 leading-relaxed">
              <strong>ROAS Platform (Facebook/Shopee)</strong> sering kali terlalu optimis karena mengandalkan tracking pixel, yang bisa mencatat double atau salah mendeteksi konversi.
            </p>
            <p className="text-sm text-slate-700 leading-relaxed">
              <strong>ROAS Asli</strong> dihitung dengan menjodohkan data <em>spend</em> dari Ads Manager dengan data <em>closing riil</em> dari Skalev berdasarkan nama advertiser dan UTM Campaign. Ini adalah angka sebenarnya yang masuk ke kas.
            </p>
          </div>
        </div>

        {/* Tabel Kampanye */}
        <div className="rounded-[24px] bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-lg font-bold tracking-[-0.02em] text-slate-900">Performa Kampanye Iklan</h2>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 font-semibold text-slate-500">
                  <th className="pb-3 pr-4 font-semibold">Kampanye &amp; ADV</th>
                  <th className="pb-3 pr-4 text-right font-semibold">Spend</th>
                  <th className="pb-3 pr-4 text-right font-semibold">Closing Asli</th>
                  <th className="pb-3 pr-4 text-center font-semibold">ROAS FB</th>
                  <th className="pb-3 pr-4 text-center font-semibold">ROAS Asli</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {adCampaigns.map((c, i) => {
                  const roas = c.omzet / c.spend;
                  const isUnderperforming = roas < 1.5;

                  return (
                    <tr key={i}>
                      <td className="py-4 pr-4">
                        <div className="font-bold text-slate-900">{c.kampanye}</div>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span>{c.advertiser}</span> • <span>{c.channel}</span>
                        </div>
                      </td>
                      <td className="py-4 pr-4 text-right font-semibold text-slate-900">{formatRupiah(c.spend)}</td>
                      <td className="py-4 pr-4 text-right font-semibold text-emerald-600">{formatRupiah(c.omzet)}</td>
                      <td className="py-4 pr-4 text-center text-slate-400">{formatRoas(c.roasFb)}</td>
                      <td className="py-4 pr-4 text-center">
                        <span className={`inline-flex rounded-md px-2 py-1 font-bold ${isUnderperforming ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                          {formatRoas(roas)}
                        </span>
                      </td>
                    </tr>
                  );
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
