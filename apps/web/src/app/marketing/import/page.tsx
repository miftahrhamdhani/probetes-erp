"use client";

import { useState } from "react";
import { DummyBanner } from "@/features/marketing/components/DummyBanner";
import { MarketingBackButton } from "@/features/marketing/components/MarketingBackButton";
import { TikTokLogo, ShopeeLogo, MetaLogo, SkalevLogo } from "@/features/marketing/components/BrandLogos";
import { importHistory } from "@/features/marketing/data/dummy";
import {
  CheckCircle2, AlertCircle, Clock, Plus, X, Upload,
  ChevronRight, ArrowLeft, Store
} from "lucide-react";

export default function ImportChannelPage() {
  const [platform, setPlatform] = useState<"tiktok" | "shopee" | "meta" | null>(null);

  // State dummy untuk daftar toko per platform
  const [stores, setStores] = useState({
    tiktok: ["Toko Utama (Glow)", "Glow Official TikTok"],
    shopee: ["Glow Studio Official Shop"],
  });

  const [selectedStore, setSelectedStore] = useState<string | null>(null);
  const [isAddingStore, setIsAddingStore] = useState(false);
  const [newStoreName, setNewStoreName] = useState("");

  const handleAddStore = () => {
    if (!newStoreName.trim() || !platform || platform === "meta") return;
    setStores(prev => ({
      ...prev,
      [platform]: [...prev[platform], newStoreName.trim()]
    }));
    setSelectedStore(newStoreName.trim());
    setNewStoreName("");
    setIsAddingStore(false);
  };

  const resetSelection = () => {
    if (selectedStore) {
      // Jika sedang berada di dalam toko (Flow 3), kembali ke pemilihan toko (Flow 2)
      setSelectedStore(null);
    } else {
      // Jika berada di pemilihan toko (Flow 2) atau tambah toko, kembali ke awal
      setPlatform(null);
      setSelectedStore(null);
      setIsAddingStore(false);
    }
  };

  const renderPlatformCards = () => (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {/* TikTok Card */}
      <button
        onClick={() => setPlatform('tiktok')}
        className="group relative flex w-full items-center gap-4 overflow-hidden rounded-2xl border border-transparent bg-[#e30613] p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:bg-[#c90510]"
      >
        <div className="flex size-[60px] shrink-0 items-center justify-center rounded-xl bg-white shadow-sm transition-transform group-hover:scale-105">
          <TikTokLogo className="size-8 text-black" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-bold text-white tracking-[-0.02em]">TikTok Shop</h3>
          <span className="mt-1.5 inline-block rounded-full bg-white px-2.5 py-0.5 text-xs font-bold text-[#e30613]">
            {stores.tiktok.length} Toko
          </span>
        </div>
        <ChevronRight className="size-6 text-white/70 transition group-hover:translate-x-1 group-hover:text-white" />
      </button>

      {/* Shopee Card */}
      <button
        onClick={() => setPlatform('shopee')}
        className="group relative flex w-full items-center gap-4 overflow-hidden rounded-2xl border border-transparent bg-[#e30613] p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:bg-[#c90510]"
      >
        <div className="flex size-[60px] shrink-0 items-center justify-center rounded-xl bg-white shadow-sm transition-transform group-hover:scale-105">
          <ShopeeLogo className="size-9 text-[#EE4D2D]" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-bold text-white tracking-[-0.02em]">Shopee</h3>
          <span className="mt-1.5 inline-block rounded-full bg-white px-2.5 py-0.5 text-xs font-bold text-[#e30613]">
            {stores.shopee.length} Toko
          </span>
        </div>
        <ChevronRight className="size-6 text-white/70 transition group-hover:translate-x-1 group-hover:text-white" />
      </button>

      {/* Meta Card (2 Logos) */}
      <button
        onClick={() => setPlatform('meta')}
        className="group relative flex w-full items-center gap-4 overflow-hidden rounded-2xl border border-transparent bg-[#e30613] p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:bg-[#c90510]"
      >
        <div className="flex size-[60px] shrink-0 items-center justify-center rounded-xl bg-white shadow-sm transition-transform group-hover:scale-105 relative">
          {/* Skalev Logo */}
          <div className="absolute left-2 top-2.5 flex size-7 items-center justify-center rounded-full bg-slate-900 border-2 border-white z-10">
            <SkalevLogo className="size-4 text-white" />
          </div>
          {/* Meta Logo */}
          <div className="absolute right-2 bottom-2.5 flex size-7 items-center justify-center rounded-full bg-blue-600 border-2 border-white">
            <MetaLogo className="size-4 text-white" />
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-bold text-white tracking-[-0.02em]">Meta / Akuisisi</h3>
          <span className="mt-1.5 inline-block rounded-full bg-white px-2.5 py-0.5 text-xs font-bold text-[#e30613]">
            Skalev &amp; Ads
          </span>
        </div>
        <ChevronRight className="size-6 text-white/70 transition group-hover:translate-x-1 group-hover:text-white" />
      </button>
    </div>
  );

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#eef2f6]/90 text-brand-deep">
      <main className="mx-auto flex w-full max-w-[1680px] flex-col gap-6 px-5 py-6 sm:px-7 lg:px-10">
        <DummyBanner />

        {/* Header - Disamakan gayanya dengan Data Utama */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-extrabold tracking-[-0.03em] text-slate-900">
            Import Data Channel
          </h1>
          <p className="text-sm font-medium text-slate-600">
            Upload laporan pesanan dan pengeluaran iklan. Data akan disinkronkan ke dalam sistem ERP.
          </p>
        </div>

        {/* Main Content Area */}
        {!platform ? (
          renderPlatformCards()
        ) : (
          <div className="rounded-[24px] bg-white p-6 shadow-sm sm:p-8 border border-slate-200 animate-in fade-in slide-in-from-top-4">
            {/* Header Form/Toko */}
            <div className="flex items-center gap-4 border-b border-slate-100 pb-4 mb-6">
              <button
                onClick={resetSelection}
                className="flex size-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200"
              >
                <ArrowLeft className="size-4" />
              </button>
              <div>
                <h2 className="text-xl font-bold tracking-[-0.02em] text-slate-900 capitalize">
                  Import {platform}
                </h2>
                {selectedStore && <p className="text-sm text-brand-red font-bold">Toko: {selectedStore}</p>}
              </div>
            </div>

            {/* FLOW 1: META (Langsung Upload) */}
            {platform === 'meta' && (
              <div className="max-w-2xl">
                <p className="text-sm text-slate-500 mb-6">Upload data closingan Skalev dan laporan pengeluaran Meta Ads Manager.</p>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 flex flex-col items-center text-center gap-3">
                    <h3 className="font-bold text-slate-700">Skalev Order</h3>
                    <p className="text-xs text-slate-500">Export data pesanan/closingan leads dari Skalev.</p>
                    <button className="mt-2 flex items-center gap-2 rounded-xl bg-brand-red px-4 py-2 text-sm font-bold text-white transition hover:bg-[#d60511]">
                      <Upload className="size-4" /> Upload CSV Skalev
                    </button>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 flex flex-col items-center text-center gap-3">
                    <h3 className="font-bold text-slate-700">Meta Ads Spend</h3>
                    <p className="text-xs text-slate-500">Laporan campaign, spend, dan ROAS versi Ads Manager.</p>
                    <button className="mt-2 flex items-center gap-2 rounded-xl bg-brand-red px-4 py-2 text-sm font-bold text-white transition hover:bg-[#d60511]">
                      <Upload className="size-4" /> Upload CSV Meta
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* FLOW 2: TIKTOK / SHOPEE (Pilih Toko Dulu) */}
            {(platform === 'tiktok' || platform === 'shopee') && !selectedStore && (
              <div className="max-w-2xl">
                {!isAddingStore ? (
                  <>
                    <p className="text-sm text-slate-500 mb-6">Pilih toko mana yang ingin Anda import datanya.</p>
                    <div className="flex flex-col gap-3">
                      {stores[platform].map(store => (
                        <button
                          key={store}
                          onClick={() => setSelectedStore(store)}
                          className="flex items-center justify-between rounded-xl border border-slate-200 p-4 text-left transition hover:border-brand-red hover:bg-brand-red/5"
                        >
                          <div className="flex items-center gap-3">
                            <Store className="size-5 text-slate-400" />
                            <span className="font-bold text-slate-700">{store}</span>
                          </div>
                          <ChevronRight className="size-5 text-slate-400" />
                        </button>
                      ))}

                      <button
                        onClick={() => setIsAddingStore(true)}
                        className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-4 text-slate-600 transition hover:border-brand-red hover:bg-white hover:text-brand-red"
                      >
                        <Plus className="size-5" />
                        <span className="font-bold">Tambah Toko Baru</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="rounded-xl border border-brand-red/20 bg-brand-red/5 p-6">
                    <h3 className="font-bold text-brand-red mb-4">Tambah Toko {platform === 'tiktok' ? 'TikTok' : 'Shopee'}</h3>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Nama Toko</label>
                    <input
                      type="text"
                      autoFocus
                      placeholder="Contoh: Glow Studio Official"
                      value={newStoreName}
                      onChange={(e) => setNewStoreName(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red"
                    />
                    <div className="mt-4 flex gap-3">
                      <button
                        onClick={handleAddStore}
                        className="rounded-xl bg-brand-red px-4 py-2 text-sm font-bold text-white transition hover:bg-[#d60511]"
                      >
                        Simpan Toko
                      </button>
                      <button
                        onClick={() => setIsAddingStore(false)}
                        className="rounded-xl px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100"
                      >
                        Batal
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* FLOW 3: TIKTOK / SHOPEE (Upload setelah pilih toko) */}
            {(platform === 'tiktok' || platform === 'shopee') && selectedStore && (
              <div className="max-w-2xl animate-in fade-in slide-in-from-right-4">
                <p className="text-sm text-slate-500 mb-6">Pilih jenis file yang ingin di-upload untuk toko ini.</p>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 flex flex-col items-center text-center gap-3">
                    <h3 className="font-bold text-slate-700">Data Pesanan</h3>
                    <p className="text-xs text-slate-500">Export order list dari {platform === 'tiktok' ? 'TikTok Seller Center' : 'Shopee Seller Centre'}.</p>
                    <button className="mt-2 flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white transition hover:bg-slate-800">
                      <Upload className="size-4" /> Upload {platform === 'tiktok' ? 'CSV' : 'Excel'}
                    </button>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 flex flex-col items-center text-center gap-3">
                    <h3 className="font-bold text-slate-700">Spend Ads</h3>
                    <p className="text-xs text-slate-500">Data pengeluaran {platform === 'tiktok' ? 'TikTok Ads' : 'Shopee Ads'}.</p>
                    <button className="mt-2 flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white transition hover:bg-slate-800">
                      <Upload className="size-4" /> Upload {platform === 'tiktok' ? 'CSV' : 'Excel'}
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

        {/* Riwayat Tetap Ada di Bawah */}
        <div className="rounded-[24px] bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-lg font-bold tracking-[-0.02em] text-slate-900">Riwayat Import Terbaru</h2>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 font-semibold text-slate-500">
                  <th className="pb-3 pr-4 font-semibold">ID &amp; Waktu</th>
                  <th className="pb-3 pr-4 font-semibold">Sumber</th>
                  <th className="pb-3 pr-4 font-semibold">File</th>
                  <th className="pb-3 pr-4 text-right font-semibold">Baris</th>
                  <th className="pb-3 pr-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {importHistory.map((h) => (
                  <tr key={h.id}>
                    <td className="py-4 pr-4">
                      <div className="font-bold text-slate-900">{h.id}</div>
                      <div className="text-xs text-slate-500">{h.waktu}</div>
                    </td>
                    <td className="py-4 pr-4">
                      {h.source}
                      {/* Simulasi kalau data dummy punya nama toko */}
                      {h.source === 'TikTok Shop' && <div className="text-[10px] text-slate-400">Toko Utama (Glow)</div>}
                    </td>
                    <td className="py-4 pr-4 font-mono text-xs text-slate-600">{h.file}</td>
                    <td className="py-4 pr-4 text-right">{h.rows.toLocaleString("id-ID")}</td>
                    <td className="py-4 pr-4">
                      {h.status === "Selesai" && (
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                          <CheckCircle2 className="size-3.5" /> Selesai
                        </span>
                      )}
                      {h.status === "Perlu Dicek" && (
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">
                          <AlertCircle className="size-3.5" /> Ada Error
                        </span>
                      )}
                      {h.status === "Diproses" && (
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
                          <Clock className="size-3.5" /> Diproses
                        </span>
                      )}
                    </td>
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
