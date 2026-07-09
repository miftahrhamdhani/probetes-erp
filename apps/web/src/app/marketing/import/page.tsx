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

  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isUploading, setIsUploading] = useState(false); // State untuk layar Pilih File
  const [previewType, setPreviewType] = useState<string>("");
  const [parsedData, setParsedData] = useState<any[]>([]); // Menyimpan data baris asli file

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleSelectUpload = (type: string) => {
    if (type === 'Input Data Manual') {
       // Khusus manual, langsung ke form
       setPreviewType(type);
       setIsPreviewing(true);
       setIsUploading(false);
    } else {
       // Khusus import, masuk ke layar Pilih File dulu
       setPreviewType(type);
       setIsUploading(true);
       setIsPreviewing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      // Parsing CSV Manual
      const separator = text.includes(';') ? ';' : ',';
      const lines = text.split('\n').filter(line => line.trim() !== '');

      if (lines.length > 1) {
        const headers = lines[0].split(separator).map(h => h.replace(/"/g, '').trim());

        // Ambil SEMUA baris, bukan cuma 5
        const allLines = lines.slice(1);
        const data = allLines.map(line => {
          const values = line.split(new RegExp(`${separator}(?=(?:(?:[^"]*"){2})*[^"]*$)`));
          const row: any = {};
          headers.forEach((header, i) => {
            row[header] = values[i] ? values[i].replace(/"/g, '').trim() : '';
          });
          return row;
        });

        setParsedData(data);
        setCurrentPage(1); // reset ke halaman 1 tiap upload baru
        setIsUploading(false);
        setIsPreviewing(true);
      }
    };

    reader.readAsText(file);
  };

  const handleCancelPreview = () => {
    setIsPreviewing(false);
    setIsUploading(false);
    setPreviewType("");
  };

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
    if (isPreviewing) {
      handleCancelPreview();
    } else if (selectedStore) {
      // Jika sedang berada di dalam toko (Flow 3), kembali ke pemilihan toko (Flow 2)
      setSelectedStore(null);
    } else {
      // Jika berada di pemilihan toko (Flow 2) atau tambah toko, kembali ke awal
      setPlatform(null);
      setSelectedStore(null);
      setIsAddingStore(false);
    }
  };

  const renderUploadPanel = () => (
    <div className="rounded-[24px] bg-white p-6 shadow-sm sm:p-8 border border-slate-200 animate-in fade-in slide-in-from-right-4">
      <div className="flex items-center gap-4 border-b border-slate-100 pb-4 mb-6">
        <button
          onClick={handleCancelPreview}
          className="flex size-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200"
        >
          <ArrowLeft className="size-4" />
        </button>
        <div>
          <h2 className="text-xl font-bold tracking-[-0.02em] text-slate-900">
            Upload: {previewType}
          </h2>
          <p className="text-sm text-brand-red font-bold">Toko/Sumber: {selectedStore || platform}</p>
        </div>
      </div>

      <p className="text-sm text-slate-500 mb-6 text-center max-w-lg mx-auto">
        Silakan upload file yang sesuai. Sistem mendukung file berformat <strong>.CSV</strong> maupun <strong>.XLSX (Excel)</strong>.
      </p>

      {/* Upload Area with hidden file input */}
      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-12 text-center transition hover:border-brand-red hover:bg-brand-red/5 max-w-2xl mx-auto cursor-pointer relative overflow-hidden">
        <input
          type="file"
          accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={handleFileChange}
          title="Klik atau tarik file ke sini"
        />
        <div className="flex flex-col items-center pointer-events-none">
          <Upload className="size-12 text-slate-400 mb-4" strokeWidth={1.5} />
          <p className="text-lg font-bold text-slate-700">Tarik &amp; lepas file ke sini</p>
          <p className="mt-1 text-sm font-medium text-slate-500">Mendukung .csv, .xls, .xlsx hingga 10MB</p>
          <div className="mt-6 rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-bold text-white transition shadow-sm">
            Pilih File dari Komputer
          </div>
        </div>
      </div>
    </div>
  );

  const renderPreviewPanel = () => {
    const isManualMode = previewType === "Input Data Manual";

    // Logic Pagination
    const totalData = parsedData.length;
    const totalPages = Math.ceil(totalData / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;
    const currentData = parsedData.slice(startIndex, startIndex + rowsPerPage);

    return (
      <div className="rounded-[24px] bg-white p-6 shadow-sm sm:p-8 border border-brand-red/20 animate-in fade-in slide-in-from-right-4">
        <div className="flex items-center gap-4 border-b border-slate-100 pb-4 mb-6">
          <button
            onClick={handleCancelPreview}
            className="flex size-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200"
          >
            <ArrowLeft className="size-4" />
          </button>
          <div>
            <h2 className="text-xl font-bold tracking-[-0.02em] text-slate-900">
              {isManualMode ? "Input Data Manual" : `Preview: ${previewType}`}
            </h2>
            <p className="text-sm text-brand-red font-bold">Toko/Sumber: {selectedStore || platform}</p>
          </div>
        </div>

        {!isManualMode && (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-slate-500">
                Sistem berhasil membaca <strong>{totalData} baris data</strong> dari file Anda.
              </p>
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-slate-500">Tampilkan</span>
                <select
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 shadow-sm outline-none"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                  <option value={totalData}>Semua Data</option>
                </select>
              </div>
            </div>

            {/* Tabel Preview Asli dari File (Scrollable) */}
            <div className="rounded-xl border border-slate-200 mb-6 bg-white overflow-hidden flex flex-col">
              <div className="overflow-x-auto overflow-y-auto max-h-[400px]">
                {parsedData.length > 0 ? (
                  <table className="w-full text-left text-sm whitespace-nowrap relative">
                    <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
                      <tr className="font-semibold text-slate-500">
                        <th className="p-3 border-b border-slate-200 min-w-[150px]">Tanggal / Waktu</th>
                        <th className="p-3 border-b border-slate-200 min-w-[150px]">ID Pesanan</th>
                        <th className="p-3 border-b border-slate-200">Sumber Data</th>
                        <th className="p-3 border-b border-slate-200">Sumber Toko</th>
                        <th className="p-3 border-b border-slate-200">Media/Platform</th>
                        <th className="p-3 border-b border-slate-200">Nama Pelanggan</th>
                        <th className="p-3 border-b border-slate-200">No HP</th>
                        <th className="p-3 border-b border-slate-200">Email</th>
                        <th className="p-3 border-b border-slate-200">Produk Asli</th>
                        <th className="p-3 border-b border-slate-200">CS Handler</th>
                        <th className="p-3 border-b border-slate-200">Metode Bayar</th>
                        <th className="p-3 border-b border-slate-200">Status Pembayaran</th>
                        <th className="p-3 border-b border-slate-200 text-right">Harga Produk</th>
                        <th className="p-3 border-b border-slate-200 text-right">Ongkos Kirim</th>
                        <th className="p-3 border-b border-slate-200 text-right">Total Omzet</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {currentData.map((row, idx) => {
                        // Helper styling status
                        const status = (row['payment_status'] || row['Status'] || '').toLowerCase();
                        let statusColor = "bg-slate-100 text-slate-700";
                        if (status === 'settled' || status === 'paid' || status === 'selesai' || status === 'lunas') statusColor = "bg-emerald-100 text-emerald-800";
                        else if (status === 'pending' || status === 'belum bayar') statusColor = "bg-amber-100 text-amber-800";
                        else if (status === 'canceled' || status === 'batal') statusColor = "bg-red-100 text-red-800";

                        return (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="p-3 text-slate-600 font-mono text-xs">
                              {row['paid_time'] ? row['paid_time'] :
                               row['completed_time'] ? row['completed_time'] :
                               row['confirmed_time'] ? row['confirmed_time'] :
                               row['draft_time'] ? row['draft_time'] :
                               row['Tanggal'] ? row['Tanggal'] : '-'}
                            </td>
                            <td className="p-3 font-mono text-xs">{row['order_id'] || row['ID Pesanan'] || row['Order ID'] || '-'}</td>
                            <td className="p-3 text-slate-600 font-medium capitalize">{platform === 'meta' ? 'Meta / Skalev' : platform}</td>
                            <td className="p-3 text-slate-600 font-medium">{platform === 'meta' ? 'Akuisisi' : (selectedStore || 'Glow Studio')}</td>
                            <td className="p-3 text-slate-600 uppercase font-medium">{row['platform'] || row['utm_source'] || row['Media'] || '-'}</td>
                            <td className="p-3 font-medium text-slate-900">{row['name'] || row['Nama'] || row['Customer'] || '-'}</td>
                            <td className="p-3 text-slate-600 font-mono text-xs">{row['phone'] || row['No HP'] || row['Telepon'] || '-'}</td>
                            <td className="p-3 text-slate-600 truncate max-w-[150px]" title={row['email'] || row['Email']}>
                              {row['email'] || row['Email'] || '-'}
                            </td>
                            <td className="p-3 text-slate-900 font-bold truncate max-w-[200px]" title={row['business_name'] || row['notes'] || row['Produk']}>
                              {row['business_name'] || row['notes'] || row['Produk'] || '-'}
                            </td>
                            <td className="p-3 text-slate-600 font-medium">{row['handler'] || row['CS'] || '-'}</td>
                            <td className="p-3 text-slate-600 font-medium uppercase">{row['payment_method'] || row['Metode'] || '-'}</td>
                            <td className="p-3">
                              {row['payment_status'] || row['Status'] ? (
                                <span className={`inline-flex rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${statusColor}`}>
                                  {row['payment_status'] || row['Status']}
                                </span>
                              ) : '-'}
                            </td>
                            <td className="p-3 text-right text-slate-500 font-mono text-xs">Rp {row['product_price'] || row['Harga'] || '0'}</td>
                            <td className="p-3 text-right text-slate-500 font-mono text-xs">Rp {row['shipping_cost'] || row['Ongkir'] || '0'}</td>
                            <td className="p-3 text-right font-bold text-slate-900">Rp {row['net_revenue'] || row['gross_revenue'] || row['Total'] || '0'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-12 text-center text-slate-500">
                    Data tidak dapat diparsing. Pastikan file menggunakan format tabel yang benar.
                  </div>
                )}
              </div>

              {/* Pagination Controls */}
              {totalData > 0 && totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 p-3 px-4">
                  <span className="text-xs font-semibold text-slate-500">
                    Menampilkan {startIndex + 1}-{Math.min(startIndex + rowsPerPage, totalData)} dari {totalData} baris
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100"
                    >
                      Sebelumnya
                    </button>
                    <span className="px-3 text-xs font-bold text-slate-700">
                      Hal {currentPage} / {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100"
                    >
                      Berikutnya
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Form Tambah Manual (Hanya utama jika di mode manual) */}
        {isManualMode && (
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-6 mb-8">
            <h3 className="font-bold text-slate-900 text-lg mb-4 flex items-center gap-2">
              <Plus className="size-5" /> Form Input Data Pesanan Baru
            </h3>

            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal</label>
                  <input type="date" className="w-full rounded-lg border border-slate-300 py-2.5 px-3 text-sm outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ID Pesanan (Otomatis/Manual)</label>
                  <input type="text" placeholder="Contoh: ORD-1003" className="w-full rounded-lg border border-slate-300 py-2.5 px-3 text-sm outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nama Pelanggan</label>
                  <input type="text" placeholder="Masukkan nama..." className="w-full rounded-lg border border-slate-300 py-2.5 px-3 text-sm outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nomor HP</label>
                  <input type="text" placeholder="08..." className="w-full rounded-lg border border-slate-300 py-2.5 px-3 text-sm outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                 <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nama Produk</label>
                  <input type="text" placeholder="Pilih produk..." className="w-full rounded-lg border border-slate-300 py-2.5 px-3 text-sm outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Qty</label>
                  <input type="number" min="1" defaultValue="1" className="w-full rounded-lg border border-slate-300 py-2.5 px-3 text-sm outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nilai / Omzet</label>
                  <input type="number" placeholder="Rp..." className="w-full rounded-lg border border-slate-300 py-2.5 px-3 text-sm outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red" />
                </div>
                <div className="flex items-end">
                  <button className="w-full rounded-lg bg-slate-900 py-2.5 text-white hover:bg-slate-800 text-sm font-bold transition">
                    Tambahkan ke Daftar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabel Data Manual (Hanya muncul jika mode Input Manual dan sudah ada data ditambahkan) */}
        {isManualMode && (
           <div className="mb-8">
             <h3 className="font-bold text-slate-800 mb-3">Daftar Data Yang Akan Di-import</h3>
             <div className="overflow-x-auto rounded-xl border border-slate-200 bg-slate-50 p-8 text-center">
                <p className="text-sm font-medium text-slate-500">Belum ada data yang ditambahkan.</p>
             </div>
           </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <button onClick={handleCancelPreview} className="rounded-xl px-6 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-100">
            {isManualMode ? "Batal" : "Batal Import"}
          </button>
          <button onClick={() => { alert(isManualMode ? "Data berhasil disimpan!" : "Simulasi Import Berhasil!"); handleCancelPreview(); resetSelection(); }} className="inline-flex items-center gap-2 rounded-xl bg-brand-red px-6 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#d60511]">
            <CheckCircle2 className="size-5" /> {isManualMode ? "Simpan Data Manual" : "Proses Import Final"}
          </button>
        </div>
      </div>
    );
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
        {isUploading ? (
          renderUploadPanel()
        ) : isPreviewing ? (
          renderPreviewPanel()
        ) : !platform ? (
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
              <div className="max-w-4xl">
                <p className="text-sm text-slate-500 mb-6">Pilih jenis data yang ingin Anda masukkan ke dalam sistem.</p>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 flex flex-col items-center text-center gap-3">
                    <h3 className="font-bold text-slate-700">Skalev Order</h3>
                    <p className="text-xs text-slate-500 flex-1">Export data pesanan/closingan leads dari Skalev.</p>
                    <button onClick={() => handleSelectUpload('Skalev Order (CSV/Excel)')} className="mt-2 flex w-full justify-center items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white transition hover:bg-slate-800">
                      <Upload className="size-4" /> Upload Excel/CSV
                    </button>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 flex flex-col items-center text-center gap-3">
                    <h3 className="font-bold text-slate-700">Meta Ads Spend</h3>
                    <p className="text-xs text-slate-500 flex-1">Laporan campaign, spend, dan ROAS versi Ads Manager.</p>
                    <button onClick={() => handleSelectUpload('Meta Ads Spend (CSV/Excel)')} className="mt-2 flex w-full justify-center items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white transition hover:bg-slate-800">
                      <Upload className="size-4" /> Upload Excel/CSV
                    </button>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 flex flex-col items-center text-center gap-3">
                    <h3 className="font-bold text-slate-700">Input Manual</h3>
                    <p className="text-xs text-slate-500 flex-1">Ketik langsung pesanan manual jika file tidak tersedia.</p>
                    <button onClick={() => handleSelectUpload('Input Data Manual')} className="mt-2 flex w-full justify-center items-center gap-2 rounded-xl bg-brand-red px-4 py-2 text-sm font-bold text-white transition hover:bg-[#d60511]">
                      <Plus className="size-4" /> Ketik Manual
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
              <div className="max-w-4xl animate-in fade-in slide-in-from-right-4">
                <p className="text-sm text-slate-500 mb-6">Pilih jenis data yang ingin Anda masukkan untuk toko ini.</p>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 flex flex-col items-center text-center gap-3">
                    <h3 className="font-bold text-slate-700">Data Pesanan</h3>
                    <p className="text-xs text-slate-500 flex-1">Export order list dari {platform === 'tiktok' ? 'TikTok Seller Center' : 'Shopee Seller Centre'}.</p>
                    <button onClick={() => handleSelectUpload('Data Pesanan (CSV/Excel)')} className="mt-2 flex w-full justify-center items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white transition hover:bg-slate-800">
                      <Upload className="size-4" /> Upload Excel/CSV
                    </button>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 flex flex-col items-center text-center gap-3">
                    <h3 className="font-bold text-slate-700">Spend Ads</h3>
                    <p className="text-xs text-slate-500 flex-1">Data pengeluaran {platform === 'tiktok' ? 'TikTok Ads' : 'Shopee Ads'}.</p>
                    <button onClick={() => handleSelectUpload('Spend Ads (CSV/Excel)')} className="mt-2 flex w-full justify-center items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white transition hover:bg-slate-800">
                      <Upload className="size-4" /> Upload Excel/CSV
                    </button>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 flex flex-col items-center text-center gap-3">
                    <h3 className="font-bold text-slate-700">Input Manual</h3>
                    <p className="text-xs text-slate-500 flex-1">Ketik langsung pesanan manual jika file tidak tersedia.</p>
                    <button onClick={() => handleSelectUpload('Input Data Manual')} className="mt-2 flex w-full justify-center items-center gap-2 rounded-xl bg-brand-red px-4 py-2 text-sm font-bold text-white transition hover:bg-[#d60511]">
                      <Plus className="size-4" /> Ketik Manual
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
