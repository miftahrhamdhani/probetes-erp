"use client";

import { useState } from "react";
import { DummyBanner } from "@/features/marketing/components/DummyBanner";
import { MarketingBackButton } from "@/features/marketing/components/MarketingBackButton";
import { TikTokLogo, ShopeeLogo, MetaLogo, SkalevLogo } from "@/features/marketing/components/BrandLogos";
import { importHistory } from "@/features/marketing/data/dummy";
import {
  CheckCircle2, AlertCircle, Clock, Plus, X, Upload,
  ChevronRight, ArrowLeft, Store, Pencil, Trash2, Zap, Wifi
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

  const [editingStore, setEditingStore] = useState<string | null>(null);
  const [editStoreName, setEditStoreName] = useState("");

  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isUploading, setIsUploading] = useState(false); // State untuk layar Pilih File
  const [previewType, setPreviewType] = useState<string>("");
  const [parsedData, setParsedData] = useState<any[]>([]); // Menyimpan data baris asli file
  const [fileName, setFileName] = useState<string>(""); // Nama file (penting untuk Meta Ads: produk & advertiser ada di nama file)

  // Mode koneksi data: "manual" = import file (semi manual), "auto" = tarik otomatis via API omnichannel/webhook.
  // Nanti pengaturannya bisa dipindah ke menu Pengaturan; sekarang toggle di sini untuk memperlihatkan dua mode.
  const [connectionMode, setConnectionMode] = useState<"manual" | "auto">("manual");

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
      const splitRegex = new RegExp(`${separator}(?=(?:(?:[^"]*"){2})*[^"]*$)`);
      const lines = text.split('\n').filter(line => line.trim() !== '');

      if (lines.length > 1) {
        // Deteksi baris header: cari baris dengan jumlah kolom terbanyak di 15 baris awal.
        // (Skalev & Meta: header di baris 0. Shopee: ada baris metadata di atas header.)
        let headerIdx = 0;
        let maxCols = 0;
        const scanLimit = Math.min(lines.length, 15);
        for (let i = 0; i < scanLimit; i++) {
          const cols = (lines[i] ?? "").split(splitRegex).length;
          if (cols > maxCols) {
            maxCols = cols;
            headerIdx = i;
          }
        }

        const headers = (lines[headerIdx] ?? "").split(separator).map(h => h.replace(/"/g, '').trim());

        // Ambil SEMUA baris data setelah baris header
        const allLines = lines.slice(headerIdx + 1);
        const data = allLines
          .map(line => {
            const values = line.split(splitRegex);
            const row: any = {};
            headers.forEach((header, i) => {
              row[header] = values[i] ? values[i].replace(/"/g, '').trim() : '';
            });
            return row;
          })
          // buang baris kosong / baris total agregat
          .filter(row => Object.values(row).some(v => v && String(v).trim() !== ''));

        setFileName(file.name);
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
    setParsedData([]);
    setFileName("");
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

  const handleDeleteStore = (e: React.MouseEvent, storeToDelete: string) => {
    e.stopPropagation();
    if (!platform || platform === "meta" || !window.confirm(`Hapus toko "${storeToDelete}"?`)) return;
    const key = platform;
    setStores(prev => ({
      ...prev,
      [key]: prev[key].filter(s => s !== storeToDelete)
    }));
  };

  const handleStartEditStore = (e: React.MouseEvent, storeToEdit: string) => {
    e.stopPropagation();
    setEditingStore(storeToEdit);
    setEditStoreName(storeToEdit);
  };

  const handleSaveEditStore = (e: React.MouseEvent | React.FormEvent, oldName: string) => {
    e.stopPropagation();
    e.preventDefault();
    if (!platform || platform === "meta" || !editStoreName.trim()) return;
    const key = platform;
    setStores(prev => ({
      ...prev,
      [key]: prev[key].map(s => s === oldName ? editStoreName.trim() : s)
    }));
    setEditingStore(null);
    setEditStoreName("");
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
    // Mode Spending Ads: tabelnya beda dari data pesanan (1 baris = 1 kampanye/iklan).
    const isAdsMode = /spend|ads|iklan/i.test(previewType);

    // Meta: nama produk & advertiser ada di NAMA FILE (mis. "EBook 90 - 10364 - Juni - Adv Irfan.csv")
    const parseMetaFile = (fn: string) => {
      const base = fn.replace(/\.(csv|xlsx|xls)$/i, "");
      const parts = base.split(" - ").map(p => p.trim());
      const produk = parts[0] || "-";
      const advMatch = base.match(/adv\s+(.+)$/i);
      const advertiser = advMatch ? advMatch[1]!.trim() : "-";
      return { produk, advertiser };
    };
    const metaInfo = parseMetaFile(fileName);

    // Format angka Rupiah dari string mentah CSV (mis. "21985866" -> "Rp21.985.866")
    const fmtRp = (v: any) => {
      const n = Number(String(v ?? "").replace(/[^0-9.-]/g, ""));
      if (!v || isNaN(n) || n === 0) return "-";
      return "Rp" + Math.round(n).toLocaleString("id-ID");
    };
    // Format ROAS 2 desimal + "x"
    const fmtRoas = (v: any) => {
      const n = Number(String(v ?? "").replace(/[^0-9.,-]/g, "").replace(",", "."));
      if (!v || isNaN(n) || n === 0) return "-";
      return n.toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + "x";
    };

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
                {parsedData.length > 0 && isAdsMode ? (
                  /* ============ TABEL SPENDING ADS ============ */
                  <table className="w-full text-left text-sm whitespace-nowrap relative">
                    <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
                      <tr className="font-semibold text-slate-500">
                        <th className="p-3 border-b border-slate-200 min-w-[150px]">Periode</th>
                        <th className="p-3 border-b border-slate-200">Sumber Data</th>
                        <th className="p-3 border-b border-slate-200">Sumber Toko</th>
                        <th className="p-3 border-b border-slate-200">Advertiser</th>
                        <th className="p-3 border-b border-slate-200 min-w-[180px]">Nama Kampanye / Iklan</th>
                        <th className="p-3 border-b border-slate-200">Produk</th>
                        <th className="p-3 border-b border-slate-200">Status</th>
                        <th className="p-3 border-b border-slate-200 text-right">Spend</th>
                        <th className="p-3 border-b border-slate-200 text-right">Klik</th>
                        <th className="p-3 border-b border-slate-200 text-right">CTR</th>
                        <th className="p-3 border-b border-slate-200 text-right">Pembelian</th>
                        <th className="p-3 border-b border-slate-200 text-right">Omzet Iklan</th>
                        <th className="p-3 border-b border-slate-200 text-right">ROAS Platform</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {currentData.map((row, idx) => {
                        const sumberData = platform === 'meta' ? 'Meta' : (platform === 'shopee' ? 'Shopee' : platform === 'tiktok' ? 'TikTok' : '-');
                        const sumberToko = platform === 'meta' ? 'Akuisisi' : (selectedStore || '-');
                        const advertiser = platform === 'meta' ? metaInfo.advertiser : (row['handler'] || '-');
                        const produk = platform === 'meta' ? metaInfo.produk : (row['Kode Produk'] || '-');
                        const kampanye = row['Nama kampanye'] || row['Nama Iklan'] || '-';
                        const rawStatus = (row['Penayangan kampanye'] || row['Status'] || '').toLowerCase();
                        const isActive = rawStatus === 'active' || rawStatus === 'berjalan' || rawStatus === 'aktif';
                        const spend = row['Jumlah yang dibelanjakan (IDR)'] || row['Biaya'] || row['Spend'];
                        const klik = row['Klik tautan'] || row['Jumlah Klik'] || '-';
                        const ctr = row['CTR (rasio klik tayang tautan)'] || row['Persentase Klik'] || '';
                        const pembelian = row['Pembelian'] || row['Konversi'] || '-';
                        const omzet = row['Nilai konversi pembelian'] || row['Omzet Penjualan'] || '';
                        const roas = row['ROAS (imbal hasil belanja iklan) pembelian'] || row['Efektifitas Iklan'] || '';
                        const ctrDisplay = ctr ? (String(ctr).includes('%') ? ctr : `${Number(String(ctr).replace(',', '.')).toFixed(2)}%`) : '-';

                        return (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="p-3 text-slate-600 font-mono text-xs">
                              {(row['Awal pelaporan'] && row['Akhir pelaporan'])
                                ? `${row['Awal pelaporan']} s/d ${row['Akhir pelaporan']}`
                                : (row['Tanggal Mulai'] || '-')}
                            </td>
                            <td className="p-3 text-slate-600 font-medium">{sumberData}</td>
                            <td className="p-3 text-slate-600 font-medium">{sumberToko}</td>
                            <td className="p-3 text-slate-600 font-medium">{advertiser}</td>
                            <td className="p-3 font-bold text-slate-900 truncate max-w-[220px]" title={kampanye}>{kampanye}</td>
                            <td className="p-3 text-slate-600 truncate max-w-[150px]" title={produk}>{produk}</td>
                            <td className="p-3">
                              <span className={`inline-flex rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                                {isActive ? 'Aktif' : 'Nonaktif'}
                              </span>
                            </td>
                            <td className="p-3 text-right font-bold text-brand-red">{fmtRp(spend)}</td>
                            <td className="p-3 text-right text-slate-600 font-mono text-xs">{klik !== '-' ? Number(klik).toLocaleString('id-ID') : '-'}</td>
                            <td className="p-3 text-right text-slate-500 font-mono text-xs">{ctrDisplay}</td>
                            <td className="p-3 text-right text-slate-700 font-medium">{pembelian}</td>
                            <td className="p-3 text-right text-emerald-700 font-semibold">{fmtRp(omzet)}</td>
                            <td className="p-3 text-right font-bold text-slate-900">{fmtRoas(roas)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : parsedData.length > 0 ? (
                  /* ============ TABEL DATA PESANAN ============ */
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
                            <td className="p-3 text-slate-900 font-bold truncate max-w-[200px]" title={row['store'] || row['product'] || row['business_name'] || row['notes'] || row['Produk']}>
                              {row['store'] || row['product'] || row['business_name'] || row['notes'] || row['Produk'] || '-'}
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
                            <td className="p-3 text-right text-slate-500 font-mono text-xs">{fmtRp(row['product_price'] || row['Harga'])}</td>
                            <td className="p-3 text-right text-slate-500 font-mono text-xs">{fmtRp(row['shipping_cost'] || row['Ongkir'])}</td>
                            <td className="p-3 text-right font-bold text-slate-900">{fmtRp(row['net_revenue'] || row['gross_revenue'] || row['Total'])}</td>
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

  // Tampilan MODE OTOMATIS (mockup): status koneksi API per channel, bukan upload file.
  const renderAutoMode = () => {
    const integrations = [
      { key: "meta", nama: "Meta / Akuisisi", via: "Webhook Skalev", status: "terhubung", detail: "Sinkron terakhir: 5 menit lalu", biaya: "Gratis (webhook Skalev)" },
      { key: "shopee", nama: "Shopee (3 toko)", via: "API Omnichannel", status: "belum", detail: "Belum dihubungkan ke omnichannel", biaya: "Langganan omnichannel" },
      { key: "tiktok", nama: "TikTok Shop (3 toko)", via: "API Omnichannel", status: "belum", detail: "Belum dihubungkan ke omnichannel", biaya: "Langganan omnichannel" },
    ];
    return (
      <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-top-4">
        <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
          <Zap className="mt-0.5 size-4 shrink-0" />
          <span>
            <strong>Mode Otomatis.</strong> Data ditarik sendiri lewat API/webhook — tim tidak perlu upload file manual.
            Skalev bisa lewat webhook (gratis), marketplace lewat langganan omnichannel.
          </span>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {integrations.map((it) => {
            const connected = it.status === "terhubung";
            return (
              <div key={it.key} className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900">{it.nama}</h3>
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${connected ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"}`}>
                    <span className={`size-1.5 rounded-full ${connected ? "bg-emerald-500" : "bg-slate-400"}`} />
                    {connected ? "Terhubung" : "Belum"}
                  </span>
                </div>
                <div className="text-sm text-slate-600">
                  <p className="flex items-center gap-2"><Wifi className="size-4 text-slate-400" /> Via: <strong>{it.via}</strong></p>
                  <p className="mt-1 text-xs text-slate-500">{it.detail}</p>
                  <p className="mt-1 text-xs text-slate-500">Biaya: {it.biaya}</p>
                </div>
                <button className={`mt-auto rounded-xl px-4 py-2 text-sm font-bold transition ${connected ? "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50" : "bg-brand-red text-white hover:bg-[#d60511]"}`}>
                  {connected ? "Kelola Koneksi" : "Hubungkan API"}
                </button>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-slate-500">
          Catatan: mode otomatis masih tahap konsep. Import manual tetap tersedia sebagai cadangan &amp; untuk data lama.
        </p>
      </div>
    );
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#eef2f6]/90 text-brand-deep">
      <main className="mx-auto flex w-full max-w-[1680px] flex-col gap-6 px-5 py-6 sm:px-7 lg:px-10">
        <DummyBanner />

        {/* Header - Disamakan gayanya dengan Data Utama */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-[-0.03em] text-slate-900">
              Import Data Channel
            </h1>
            <p className="mt-1 text-sm font-medium text-slate-600">
              Upload laporan pesanan dan pengeluaran iklan. Data akan disinkronkan ke dalam sistem ERP.
            </p>
          </div>
          {/* Toggle Mode Koneksi */}
          <div className="inline-flex shrink-0 rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
            <button
              onClick={() => { setConnectionMode("manual"); resetSelection(); }}
              className={`rounded-xl px-4 py-2 text-sm font-bold transition ${connectionMode === "manual" ? "bg-brand-red text-white shadow-sm" : "text-slate-500 hover:bg-slate-50"}`}
            >
              Semi-Manual (Import)
            </button>
            <button
              onClick={() => { setConnectionMode("auto"); resetSelection(); }}
              className={`rounded-xl px-4 py-2 text-sm font-bold transition ${connectionMode === "auto" ? "bg-brand-red text-white shadow-sm" : "text-slate-500 hover:bg-slate-50"}`}
            >
              Otomatis (API)
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        {connectionMode === "auto" ? (
          renderAutoMode()
        ) : isUploading ? (
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
                        <div
                          key={store}
                          className="flex items-center justify-between rounded-xl border border-slate-200 p-3 pl-4 transition hover:border-brand-red group"
                        >
                          {editingStore === store ? (
                            <form 
                              onSubmit={(e) => handleSaveEditStore(e, store)}
                              className="flex w-full items-center gap-3"
                            >
                              <Store className="size-5 text-brand-red" />
                              <input
                                type="text"
                                autoFocus
                                value={editStoreName}
                                onChange={(e) => setEditStoreName(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                className="flex-1 rounded-md border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red"
                              />
                              <div className="flex items-center gap-2">
                                <button
                                  type="submit"
                                  className="rounded-md bg-brand-red px-3 py-1.5 text-xs font-bold text-white transition hover:bg-[#d60511]"
                                >
                                  Simpan
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); setEditingStore(null); }}
                                  className="rounded-md px-3 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-100"
                                >
                                  Batal
                                </button>
                              </div>
                            </form>
                          ) : (
                            <>
                              <button
                                onClick={() => setSelectedStore(store)}
                                className="flex flex-1 items-center gap-3 text-left"
                              >
                                <Store className="size-5 text-slate-400 group-hover:text-brand-red transition" />
                                <span className="font-bold text-slate-700 group-hover:text-brand-red transition">{store}</span>
                              </button>
                              <div className="flex items-center gap-1 ml-4">
                                <button
                                  onClick={(e) => handleStartEditStore(e, store)}
                                  className="flex size-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
                                  title="Edit Toko"
                                >
                                  <Pencil className="size-4" />
                                </button>
                                <button
                                  onClick={(e) => handleDeleteStore(e, store)}
                                  className="flex size-8 items-center justify-center rounded-full text-slate-400 hover:bg-red-50 hover:text-red-600 transition"
                                  title="Hapus Toko"
                                >
                                  <Trash2 className="size-4" />
                                </button>
                                <ChevronRight className="size-5 text-slate-300 ml-1" />
                              </div>
                            </>
                          )}
                        </div>
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
