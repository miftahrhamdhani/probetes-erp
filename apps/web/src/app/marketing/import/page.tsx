"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import { useRowVirtualizer } from "@/features/database/master-data/hooks/useRowVirtualizer";
import { DummyBanner } from "@/features/marketing/components/DummyBanner";
import { MarketingBackButton } from "@/features/marketing/components/MarketingBackButton";
import { TikTokLogo, ShopeeLogo, MetaLogo, SkalevLogo } from "@/features/marketing/components/BrandLogos";
import { useImportHistory } from "@/features/marketing/context/ImportHistoryContext";
import {
  type Platform, type ImportType, type ImportHistoryEntry,
  platformLabel, historyLabel, downloadCsv,
} from "@/features/marketing/lib/importHistory";
import {
  CheckCircle2, AlertCircle, Clock, Plus, X, Upload, ChevronRight, ArrowLeft,
  Store, Megaphone, ReceiptText, Check, Trash2, RotateCcw, Pencil, Eye, Download,
} from "lucide-react";

export default function MarketingImportPage() {
  // --- Langkah wizard ---
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null);
  const [selectedImportType, setSelectedImportType] = useState<ImportType | null>(null);
  const [selectedAdv, setSelectedAdv] = useState<string | null>(null);
  const [selectedStore, setSelectedStore] = useState<string | null>(null);
  const [periode, setPeriode] = useState("");
  const [catatan, setCatatan] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewRows, setPreviewRows] = useState<any[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [importStatus, setImportStatus] = useState<"idle" | "saved">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  // --- Riwayat Import (dibagi ke halaman lain lewat Context, mis. Iklan & ROAS) ---
  const { history, setHistory } = useImportHistory();
  const [historyPreviewId, setHistoryPreviewId] = useState<string | null>(null);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyRowsPerPage, setHistoryRowsPerPage] = useState(10);

  // --- Pagination preview ---
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // --- Data ADV & Toko (dummy, bisa dikelola) ---
  const [advList, setAdvList] = useState<Record<Platform, string[]>>({
    tiktok: ["Adv Rian", "Adv Sari"],
    shopee: ["Adv Bagas"],
    meta: ["Irfan", "Zidny", "Bagas"],
  });
  const [storeList, setStoreList] = useState<Record<Platform, string[]>>({
    tiktok: ["Probetes", "Amandia"],
    shopee: ["Probetes Herbal"],
    meta: ["Akuisisi (Skalev)"],
  });

  // --- Pagination & virtualisasi tabel preview ---
  // Dihitung selalu (bukan cuma di dalam renderPreview) supaya urutan pemanggilan hook React
  // tetap stabil — hook tidak boleh dipanggil di dalam fungsi yang dieksekusi kondisional.
  // Virtualisasi mencegah lag/macet saat "Tampilkan: Semua" dipilih pada file berisi puluhan ribu baris:
  // hanya baris di sekitar area yang terlihat yang benar-benar dirender ke DOM.
  const totalPreviewPages = Math.ceil(previewRows.length / rowsPerPage) || 1;
  const previewStartIndex = (currentPage - 1) * rowsPerPage;
  const currentPreviewRows = previewRows.slice(previewStartIndex, previewStartIndex + rowsPerPage);
  const previewVirt = useRowVirtualizer<HTMLDivElement>({ count: currentPreviewRows.length, rowHeight: 44 });
  const visiblePreviewRows = currentPreviewRows.slice(previewVirt.start, previewVirt.end);

  // Data & virtualisasi untuk modal "Lihat" riwayat import (hook dipanggil unconditional juga,
  // walau modalnya sendiri belum tentu terbuka — sama alasannya dengan previewVirt di atas).
  const historyEntryOpen = history.find((h) => h.id === historyPreviewId) ?? null;
  const historyRows = historyEntryOpen?.rows ?? [];
  const historyTotalPages = Math.ceil(historyRows.length / historyRowsPerPage) || 1;
  const historyStartIndex = (historyPage - 1) * historyRowsPerPage;
  const currentHistoryRows = historyRows.slice(historyStartIndex, historyStartIndex + historyRowsPerPage);
  const historyVirt = useRowVirtualizer<HTMLDivElement>({ count: currentHistoryRows.length, rowHeight: 44 });
  const visibleHistoryRows = currentHistoryRows.slice(historyVirt.start, historyVirt.end);

  // ---------------------------------------------------------------------------
  // NAVIGASI / RESET
  // ---------------------------------------------------------------------------
  const currentStep = showPreview
    ? 4
    : selectedPlatform && selectedImportType
      ? 3
      : selectedPlatform
        ? 2
        : 1;

  const resetDetail = () => {
    setSelectedAdv(null);
    setSelectedStore(null);
    setPeriode("");
    setCatatan("");
    setSelectedFile(null);
    setPreviewRows([]);
    setShowPreview(false);
    setErrorMsg("");
  };

  const resetAll = () => {
    setSelectedPlatform(null);
    setSelectedImportType(null);
    resetDetail();
    setImportStatus("idle");
  };

  const goBack = () => {
    setErrorMsg("");
    if (showPreview) {
      setShowPreview(false);
      return;
    }
    if (selectedImportType) {
      setSelectedImportType(null);
      resetDetail();
      return;
    }
    if (selectedPlatform) {
      setSelectedPlatform(null);
      return;
    }
  };

  // ---------------------------------------------------------------------------
  // KELOLA ADV / TOKO (tambah & hapus sederhana)
  // ---------------------------------------------------------------------------
  const addAdv = (name: string) => {
    if (!selectedPlatform || !name.trim()) return;
    const p = selectedPlatform;
    setAdvList((prev) => ({ ...prev, [p]: [...prev[p], name.trim()] }));
    setSelectedAdv(name.trim());
  };
  const deleteAdv = (name: string) => {
    if (!selectedPlatform) return;
    const p = selectedPlatform;
    setAdvList((prev) => ({ ...prev, [p]: prev[p].filter((a) => a !== name) }));
    if (selectedAdv === name) setSelectedAdv(null);
  };
  const addStore = (name: string) => {
    if (!selectedPlatform || !name.trim()) return;
    const p = selectedPlatform;
    setStoreList((prev) => ({ ...prev, [p]: [...prev[p], name.trim()] }));
    setSelectedStore(name.trim());
  };
  const deleteStore = (name: string) => {
    if (!selectedPlatform) return;
    const p = selectedPlatform;
    setStoreList((prev) => ({ ...prev, [p]: prev[p].filter((s) => s !== name) }));
    if (selectedStore === name) setSelectedStore(null);
  };
  const renameAdv = (oldName: string, newName: string) => {
    if (!selectedPlatform || !newName.trim()) return;
    const p = selectedPlatform;
    setAdvList((prev) => ({ ...prev, [p]: prev[p].map((a) => (a === oldName ? newName.trim() : a)) }));
    if (selectedAdv === oldName) setSelectedAdv(newName.trim());
  };
  const renameStore = (oldName: string, newName: string) => {
    if (!selectedPlatform || !newName.trim()) return;
    const p = selectedPlatform;
    setStoreList((prev) => ({ ...prev, [p]: prev[p].map((s) => (s === oldName ? newName.trim() : s)) }));
    if (selectedStore === oldName) setSelectedStore(newName.trim());
  };

  // ---------------------------------------------------------------------------
  // UPLOAD + PARSING CSV (asli); mock fallback bila parsing gagal
  // ---------------------------------------------------------------------------
  // Spending Ads: iklan berjalan per toko (bukan cuma per ADV), jadi dua-duanya wajib.
  const detailReady =
    selectedImportType === "ads" ? !!selectedAdv && !!selectedStore : !!selectedStore;

  // Baris header (dalam CSV/Excel) dideteksi otomatis: baris dengan jumlah kolom terisi terbanyak
  // di 15 baris awal — Shopee/Meta kadang punya baris metadata (Username, Nama Toko, dst) di atas header asli.
  const findHeaderIdx = (rows: any[][], scanLimit = 15) => {
    let headerIdx = 0;
    let maxCols = 0;
    for (let i = 0; i < Math.min(rows.length, scanLimit); i++) {
      const nonEmpty = (rows[i] || []).filter((c) => c !== undefined && c !== null && String(c).trim() !== "").length;
      if (nonEmpty > maxCols) { maxCols = nonEmpty; headerIdx = i; }
    }
    return headerIdx;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg("");
    const file = e.target.files?.[0];
    if (!file) return;
    if (!detailReady) {
      if (selectedImportType === "ads") {
        setErrorMsg(
          !selectedAdv && !selectedStore ? "Pilih ADV dan Toko dulu sebelum upload."
          : !selectedAdv ? "Pilih ADV dulu sebelum upload."
          : "Pilih Toko dulu sebelum upload."
        );
      } else {
        setErrorMsg("Pilih Toko dulu sebelum upload.");
      }
      return;
    }
    setSelectedFile(file);

    const finishRows = (rows: any[]) => {
      if (rows.length === 0) rows = mockRows(selectedImportType);
      setPreviewRows(rows);
      setCurrentPage(1);
      setShowPreview(true);
    };

    const isExcel = /\.(xlsx|xls)$/i.test(file.name);
    const reader = new FileReader();

    if (isExcel) {
      // File Excel asli (.xlsx/.xls) — parse sungguhan pakai SheetJS, bukan dibaca sebagai teks
      // (kalau dibaca sebagai teks, isinya jadi karakter aneh karena .xlsx itu file biner/ZIP).
      reader.onload = (event) => {
        try {
          const data = event.target?.result as ArrayBuffer;
          const workbook = XLSX.read(data, { type: "array" });
          const sheet = workbook.Sheets[workbook.SheetNames[0]!];
          const raw = XLSX.utils.sheet_to_json(sheet!, { header: 1, defval: "", raw: false }) as any[][];
          const headerIdx = findHeaderIdx(raw);
          const headers = (raw[headerIdx] || []).map((h) => String(h ?? "").trim());
          const rows = raw.slice(headerIdx + 1).map((arr) => {
            const row: any = {};
            headers.forEach((h, i) => { if (h) row[h] = arr[i] !== undefined ? String(arr[i]).trim() : ""; });
            return row;
          }).filter((row) => Object.values(row).some((v) => v && String(v).trim() !== ""));
          finishRows(rows);
        } catch {
          finishRows([]); // fallback mock jika file gagal diparse
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      reader.onload = (event) => {
        const text = event.target?.result as string;
        let rows: any[] = [];
        if (text) {
          const separator = text.includes(";") ? ";" : ",";
          const splitRegex = new RegExp(`${separator}(?=(?:(?:[^"]*"){2})*[^"]*$)`);
          const lines = text.split("\n").filter((l) => l.trim() !== "");
          if (lines.length > 1) {
            const headerIdx = findHeaderIdx(lines.map((l) => l.split(splitRegex)));
            const headers = (lines[headerIdx] ?? "").split(separator).map((h) => h.replace(/"/g, "").trim());
            rows = lines.slice(headerIdx + 1).map((line) => {
              const values = line.split(splitRegex);
              const row: any = {};
              headers.forEach((h, i) => { row[h] = values[i] ? values[i].replace(/"/g, "").trim() : ""; });
              return row;
            }).filter((row) => Object.values(row).some((v) => v && String(v).trim() !== ""));
          }
        }
        finishRows(rows);
      };
      reader.readAsText(file);
    }
  };

  const mockRows = (type: ImportType | null): any[] => {
    if (type === "ads") {
      // Mock ini meniru persis kolom asli export Meta Ads Manager (kolom apa adanya, tanpa dipetakan).
      return [
        { "Awal pelaporan": "2026-06-01", "Akhir pelaporan": "2026-06-30", "Nama kampanye": "PRP TOF", "Penayangan kampanye": "active", "Jumlah yang dibelanjakan (IDR)": "21985866", "Pembelian": "360", "Nilai konversi pembelian": "62400000", "ROAS (imbal hasil belanja iklan) pembelian": "1.72", "Klik tautan": "8315", "CTR (rasio klik tayang tautan)": "1.52" },
        { "Awal pelaporan": "2026-06-01", "Akhir pelaporan": "2026-06-30", "Nama kampanye": "BID CAP", "Penayangan kampanye": "active", "Jumlah yang dibelanjakan (IDR)": "25452481", "Pembelian": "467", "Nilai konversi pembelian": "79300000", "ROAS (imbal hasil belanja iklan) pembelian": "1.9", "Klik tautan": "13889", "CTR (rasio klik tayang tautan)": "2.34" },
      ];
    }
    if (selectedPlatform === "meta") {
      return [
        { "Tanggal": "2026-06-01", platform: "facebook", "No Invoice": "260601XQZLBNC", "No Resi": "-", "Customer": "Siti Rahma", customer_type: "new", email: "siti@gmail.com", "No HP": "08123456789", "Produk": "UPDM - Ebook Remisi", "Qty": "1", product_price: "89000", shipping_cost: "0", "Total": "89000", payment_method: "qris", handler: "Rista CS", order_status: "completed", payment_status: "settled" },
        { "Tanggal": "2026-06-01", platform: "instagram", "No Invoice": "260601MTIZTII", "No Resi": "-", "Customer": "Dewi Eka", customer_type: "repeat", email: "dewi@gmail.com", "No HP": "08787751314", "Produk": "UPDM - Ebook Remisi", "Qty": "1", product_price: "145000", shipping_cost: "0", "Total": "145000", payment_method: "transfer", handler: "Rista CS", order_status: "canceled", payment_status: "pending" },
      ];
    }
    return [
      { "Tanggal": "2026-06-01", "No Invoice": "ORD-1001", "No Resi": "JX0011", "Customer": "Siti Rahma", "No HP": "08123456789", "Produk": "Paket Glow", "Qty": "1", "Total": "150000", "Status": "Selesai" },
      { "Tanggal": "2026-06-01", "No Invoice": "ORD-1002", "No Resi": "JX0012", "Customer": "Budi Santoso", "No HP": "08571231231", "Produk": "Serum Vit C", "Qty": "2", "Total": "170000", "Status": "Dikirim" },
    ];
  };

  // ---------------------------------------------------------------------------
  // FORMAT
  // ---------------------------------------------------------------------------
  const fmtRp = (v: any) => {
    const n = Number(String(v ?? "").replace(/[^0-9.-]/g, ""));
    if (!v || isNaN(n) || n === 0) return "-";
    return "Rp" + Math.round(n).toLocaleString("id-ID");
  };
  const pick = (row: any, keys: string[], fallback = "-") => {
    for (const k of keys) if (row[k] !== undefined && String(row[k]).trim() !== "") return row[k];
    return fallback;
  };

  // ===========================================================================
  // RENDER: STEP INDICATOR
  // ===========================================================================
  const steps = ["Platform", "Jenis Import", "Detail & Upload", "Preview"];
  const StepIndicator = () => (
    <div className="flex items-center gap-2 overflow-x-auto rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      {steps.map((label, i) => {
        const num = i + 1;
        const active = num === currentStep;
        const done = num < currentStep;
        return (
          <div key={label} className="flex items-center gap-2 whitespace-nowrap">
            <span className={`flex size-6 items-center justify-center rounded-full text-xs font-bold ${done ? "bg-emerald-500 text-white" : active ? "bg-brand-red text-white" : "bg-slate-100 text-slate-400"}`}>
              {done ? <Check className="size-3.5" /> : num}
            </span>
            <span className={`text-sm font-bold ${active ? "text-slate-900" : done ? "text-emerald-600" : "text-slate-400"}`}>{label}</span>
            {i < steps.length - 1 && <ChevronRight className="size-4 text-slate-300" />}
          </div>
        );
      })}
    </div>
  );

  // ===========================================================================
  // RENDER: STEP 1 — PILIH PLATFORM
  // ===========================================================================
  const renderPlatforms = () => (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <PlatformCard onClick={() => setSelectedPlatform("tiktok")} logo={<TikTokLogo className="size-8 text-black" />} title="TikTok Shop" badge={`${storeList.tiktok.length} Toko`} />
      <PlatformCard onClick={() => setSelectedPlatform("shopee")} logo={<ShopeeLogo className="size-9 text-[#EE4D2D]" />} title="Shopee" badge={`${storeList.shopee.length} Toko`} />
      <button
        onClick={() => setSelectedPlatform("meta")}
        className="group relative flex w-full items-center gap-4 overflow-hidden rounded-2xl border border-transparent bg-[#e30613] p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:bg-[#c90510]"
      >
        <div className="relative flex size-[60px] shrink-0 items-center justify-center rounded-xl bg-white shadow-sm transition-transform group-hover:scale-105">
          <div className="absolute left-2 top-2.5 flex size-7 items-center justify-center rounded-full border-2 border-white bg-slate-900"><SkalevLogo className="size-4 text-white" /></div>
          <div className="absolute bottom-2.5 right-2 flex size-7 items-center justify-center rounded-full border-2 border-white bg-blue-600"><MetaLogo className="size-4 text-white" /></div>
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-bold tracking-[-0.02em] text-white">Meta / Akuisisi</h3>
          <span className="mt-1.5 inline-block rounded-full bg-white px-2.5 py-0.5 text-xs font-bold text-[#e30613]">Skalev &amp; Ads</span>
        </div>
        <ChevronRight className="size-6 text-white/70 transition group-hover:translate-x-1 group-hover:text-white" />
      </button>
    </div>
  );

  // ===========================================================================
  // RENDER: STEP 2 — PILIH JENIS IMPORT
  // ===========================================================================
  const renderImportTypes = () => (
    <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8 animate-in fade-in slide-in-from-top-4">
      <PanelHeader onBack={goBack} title={`Import ${platformLabel[selectedPlatform!]}`} subtitle="Pilih jenis data yang ingin diimpor." />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 max-w-3xl">
        <ImportTypeCard
          onClick={() => setSelectedImportType("ads")}
          icon={<Megaphone className="size-6" />}
          title="Spending Ads"
          desc="Laporan pengeluaran iklan per kampanye. Wajib pilih ADV & Toko."
        />
        <ImportTypeCard
          onClick={() => setSelectedImportType("order")}
          icon={<ReceiptText className="size-6" />}
          title="Data Pesanan"
          desc="Daftar pesanan/closingan pelanggan. Wajib pilih Toko."
        />
      </div>
    </div>
  );

  // ===========================================================================
  // RENDER: STEP 3 — DETAIL IMPORT + UPLOAD
  // ===========================================================================
  const renderDetailForm = () => {
    const isAds = selectedImportType === "ads";
    return (
      <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8 animate-in fade-in slide-in-from-top-4">
        <PanelHeader
          onBack={goBack}
          title={`${isAds ? "Spending Ads" : "Data Pesanan"} — ${platformLabel[selectedPlatform!]}`}
          subtitle="Lengkapi detail sebelum upload file."
        />

        <div className="flex flex-col gap-6 max-w-3xl">
          {/* Pilih ADV (khusus Ads) — iklan dijalankan oleh advertiser tertentu */}
          {isAds && (
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-800">
                Pilih ADV (Advertiser) <span className="text-brand-red">*</span>
              </label>
              <ChipSelector
                options={advList[selectedPlatform!]}
                selected={selectedAdv}
                onSelect={setSelectedAdv}
                onAdd={addAdv}
                onDelete={deleteAdv}
                onEdit={renameAdv}
                icon={<Megaphone className="size-4 text-slate-400" />}
                addLabel="Tambah ADV"
                placeholder="Nama advertiser…"
              />
            </div>
          )}

          {/* Pilih Toko — wajib untuk Data Pesanan maupun Spending Ads (iklan berjalan per toko) */}
          <div>
            <label className="mb-2 block text-sm font-bold text-slate-800">
              Pilih Toko <span className="text-brand-red">*</span>
            </label>
            <ChipSelector
              options={storeList[selectedPlatform!]}
              selected={selectedStore}
              onSelect={setSelectedStore}
              onAdd={addStore}
              onDelete={deleteStore}
              onEdit={renameStore}
              icon={<Store className="size-4 text-slate-400" />}
              addLabel="Tambah Toko"
              placeholder="Nama toko…"
            />
          </div>

          {/* Periode & Catatan */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-bold text-slate-800">Periode Data</label>
              <input
                type="text"
                value={periode}
                onChange={(e) => setPeriode(e.target.value)}
                placeholder="cth: Juni 2026"
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-bold text-slate-800">Catatan Import (opsional)</label>
              <input
                type="text"
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                placeholder="cth: batch pertama, cek ulang HP"
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red"
              />
            </div>
          </div>

          {/* Upload box */}
          <div>
            <label className="mb-2 block text-sm font-bold text-slate-800">Upload File <span className="text-brand-red">*</span></label>
            <div className={`relative flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-10 text-center transition ${detailReady ? "border-slate-300 bg-slate-50 hover:border-brand-red hover:bg-brand-red/5 cursor-pointer" : "border-slate-200 bg-slate-50/60"}`}>
              <input
                type="file"
                accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                disabled={!detailReady}
                onChange={handleFileChange}
                className={`absolute inset-0 h-full w-full opacity-0 ${detailReady ? "cursor-pointer" : "cursor-not-allowed"}`}
              />
              <Upload className={`size-10 ${detailReady ? "text-slate-400" : "text-slate-300"}`} strokeWidth={1.5} />
              <p className={`text-base font-bold ${detailReady ? "text-slate-700" : "text-slate-400"}`}>Tarik &amp; lepas file ke sini</p>
              <p className="text-xs font-medium text-slate-500">Mendukung .csv, .xls, .xlsx</p>
              {!detailReady && (
                <p className="mt-1 text-xs font-bold text-amber-600">
                  {isAds ? "Pilih ADV dan Toko dulu untuk mengaktifkan upload." : "Pilih Toko dulu untuk mengaktifkan upload."}
                </p>
              )}
            </div>
          </div>

          {errorMsg && (
            <p className="flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-700">
              <AlertCircle className="size-4" /> {errorMsg}
            </p>
          )}
        </div>
      </div>
    );
  };

  // ===========================================================================
  // RENDER: STEP 4 — PREVIEW + ACTION BAR
  // ===========================================================================
  const renderPreview = () => {
    const isAds = selectedImportType === "ads";
    const totalData = previewRows.length;
    const totalPages = totalPreviewPages;
    const startIndex = previewStartIndex;
    const current = currentPreviewRows;
    const virt = previewVirt;
    const visibleRows = visiblePreviewRows;
    const platLabel = platformLabel[selectedPlatform!];
    const isMeta = selectedPlatform === "meta";
    // Toko dipilih user sendiri lewat chip (bisa di-rename), jadi tampilkan apa adanya — tidak perlu hardcode label.
    const sumberToko = selectedStore;
    const statusColor = (raw: string) => {
      const s = raw.toLowerCase();
      if (["settled", "paid", "selesai", "lunas", "completed"].includes(s)) return "bg-emerald-100 text-emerald-800";
      if (["pending", "belum bayar", "diproses", "in_process", "shipped"].includes(s)) return "bg-amber-100 text-amber-800";
      if (["canceled", "cancelled", "batal", "rts"].includes(s)) return "bg-red-100 text-red-800";
      return "bg-slate-100 text-slate-600";
    };
    // Kolom Spending Ads = persis kolom di file CSV (tidak dipetakan manual), biar tidak ada kekeliruan
    // antar format advertiser/platform yang beda-beda. Format sedikit angka murni saja untuk keterbacaan.
    const adsColumns = isAds && previewRows.length > 0 ? Object.keys(previewRows[0]) : [];
    // Data Pesanan TikTok/Shopee: format kolom aslinya belum kita verifikasi (beda dari Skalev yang
    // sudah dicek berkali-kali), jadi tampilkan mentah persis isi file — hindari salah tebak nama kolom.
    const orderRawColumns = !isAds && !isMeta && previewRows.length > 0 ? Object.keys(previewRows[0]) : [];
    const formatCell = (v: any) => {
      if (v === undefined || v === null || String(v).trim() === "") return "-";
      const n = Number(v);
      if (!isNaN(n) && String(v).trim() !== "" && /^-?[0-9.]+$/.test(String(v).trim())) return n.toLocaleString("id-ID");
      return String(v);
    };
    // Tanggal selalu paling kiri di setiap tabel: cari kolom bertanggal di antara kolom mentah
    // (mis. "Tanggal Mulai" di Shopee, "Awal pelaporan" di Meta) dan pindahkan ke depan.
    const extractDateColumn = (cols: string[]): { dateCol: string | null; rest: string[] } => {
      const idx = cols.findIndex((c) => {
        const lower = c.toLowerCase();
        return lower.includes("tanggal") || lower.includes("pelaporan") || lower.includes("waktu");
      });
      if (idx === -1) return { dateCol: null, rest: cols };
      const rest = [...cols];
      const [dateCol] = rest.splice(idx, 1);
      return { dateCol: dateCol ?? null, rest };
    };
    const { dateCol: adsDateCol, rest: adsRestColumns } = extractDateColumn(adsColumns);
    const { dateCol: orderDateCol, rest: orderRestColumns } = extractDateColumn(orderRawColumns);

    // Snapshot data yang SUDAH diformat rapi (persis seperti kolom di preview ini) untuk disimpan
    // ke Riwayat Import — supaya "Lihat" & "Download" nanti tidak perlu menebak ulang mapping kolom.
    const buildSnapshotRows = (): Record<string, string>[] => {
      if (isAds) {
        return previewRows.map((row) => {
          const obj: Record<string, string> = {};
          if (adsDateCol) obj[adsDateCol] = formatCell(row[adsDateCol]);
          obj["Platform"] = platLabel;
          obj["ADV"] = selectedAdv ?? "-";
          obj["Toko"] = selectedStore ?? "-";
          adsRestColumns.forEach((h) => { obj[h] = formatCell(row[h]); });
          obj["Catatan"] = catatan || "-";
          return obj;
        });
      }
      if (isMeta) {
        return previewRows.map((row) => {
          const rawType = String(pick(row, ["customer_type", "Tipe Pelanggan"], "")).toLowerCase();
          const tipeLabel = rawType === "new" ? "Baru" : rawType === "repeat" ? "Repeat" : rawType || "-";
          return {
            "Tanggal Pesanan": String(pick(row, ["Tanggal", "paid_time", "completed_time", "confirmed_time", "draft_time"])),
            Platform: platLabel,
            Toko: sumberToko ?? "-",
            Media: String(pick(row, ["platform", "utm_source", "Media"])),
            "No Invoice": String(pick(row, ["No Invoice", "order_id", "No. Pesanan", "Order ID"])),
            "No Resi": String(pick(row, ["No Resi", "shipment_receipt", "Nomor Resi"])),
            Customer: String(pick(row, ["Customer", "name", "Nama"])),
            "Tipe Pelanggan": tipeLabel,
            Email: String(pick(row, ["email", "Email"])),
            "No HP": String(pick(row, ["No HP", "phone", "Telepon"])),
            Produk: String(pick(row, ["Produk", "store", "product", "Nama Produk"])),
            Qty: String(pick(row, ["Qty", "quantity", "Jumlah"])),
            "Harga Produk": fmtRp(pick(row, ["product_price", "Harga"], "0")),
            "Ongkos Kirim": fmtRp(pick(row, ["shipping_cost", "Ongkir"], "0")),
            "Total Bayar": fmtRp(pick(row, ["Total", "Total Bayar", "net_revenue", "gross_revenue"], "0")),
            "Metode Bayar": String(pick(row, ["payment_method", "Metode"])),
            "CS Handler": String(pick(row, ["handler", "CS"])),
            "Status Pesanan": String(row["order_status"] ?? "-"),
            "Status Pembayaran": String(row["payment_status"] ?? "-"),
          };
        });
      }
      // TikTok/Shopee Data Pesanan: kolom mentah persis file
      return previewRows.map((row) => {
        const obj: Record<string, string> = {};
        if (orderDateCol) obj[orderDateCol] = formatCell(row[orderDateCol]);
        obj["Platform"] = platLabel;
        obj["Toko"] = sumberToko ?? "-";
        orderRestColumns.forEach((h) => { obj[h] = formatCell(row[h]); });
        return obj;
      });
    };

    const handleSaveClick = () => {
      const snapshotRows = buildSnapshotRows();
      const newEntry: ImportHistoryEntry = {
        id: `IMP-${String(history.length + 1).padStart(4, "0")}`,
        waktu: new Date().toLocaleString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }),
        platform: selectedPlatform!,
        jenis: selectedImportType!,
        adv: isAds ? selectedAdv : null,
        toko: selectedStore,
        periode,
        fileName: selectedFile?.name ?? "-",
        rowCount: previewRows.length,
        status: "Selesai",
        rows: snapshotRows,
      };
      setHistory((prev) => [newEntry, ...prev]);
      setImportStatus("saved");
    };

    return (
      <div className="rounded-[24px] border border-brand-red/20 bg-white p-6 shadow-sm sm:p-8 animate-in fade-in slide-in-from-right-4">
        <PanelHeader
          onBack={goBack}
          title={`Preview: ${isAds ? "Spending Ads" : "Data Pesanan"}`}
          subtitle={`${platLabel} • ${isAds ? `ADV: ${selectedAdv} • Toko: ${selectedStore}` : `Toko: ${sumberToko}`}${periode ? ` • ${periode}` : ""}`}
        />

        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Terbaca <strong>{totalData} baris</strong> dari file{selectedFile ? ` "${selectedFile.name}"` : ""}. Cek dulu sebelum disimpan.
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Tampilkan</span>
            <select
              value={rowsPerPage}
              onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 shadow-sm outline-none"
            >
              {[10, 20, 50, 100].map((n) => <option key={n} value={n}>{n}</option>)}
              <option value={totalData || 1}>Semua</option>
            </select>
          </div>
        </div>

        {/* Tabel preview */}
        <div className="mb-6 flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div ref={virt.containerRef} className="max-h-[420px] overflow-auto">
            <table className="w-full whitespace-nowrap text-left text-sm">
              <thead className="sticky top-0 z-10 bg-slate-50 shadow-sm">
                <tr className="font-semibold text-slate-500">
                  {isAds
                    ? (
                      <>
                        {adsDateCol && <th className="min-w-[120px] border-b border-slate-200 p-3">{adsDateCol}</th>}
                        <th className="border-b border-slate-200 p-3">Platform</th>
                        <th className="border-b border-slate-200 p-3">ADV</th>
                        <th className="border-b border-slate-200 p-3">Toko</th>
                        {adsRestColumns.map((h) => (
                          <th key={h} className="max-w-[220px] truncate border-b border-slate-200 p-3" title={h}>{h}</th>
                        ))}
                        <th className="border-b border-slate-200 p-3">Catatan</th>
                      </>
                    )
                    : isMeta
                    ? [
                        "Tanggal Pesanan", "Platform", "Toko", "Media",
                        "No Invoice", "No Resi", "Customer", "Tipe Pelanggan", "Email",
                        "No HP", "Produk", "Qty", "Harga Produk", "Ongkos Kirim", "Total Bayar",
                        "Metode Bayar", "CS Handler", "Status Pesanan", "Status Pembayaran",
                      ].map((h) => (
                        <th key={h} className={`border-b border-slate-200 p-3 ${["Qty", "Total Bayar", "Harga Produk", "Ongkos Kirim"].includes(h) ? "text-right" : ""}`}>{h}</th>
                      ))
                    : (
                      // TikTok/Shopee: kolom persis apa adanya dari file, tidak dipetakan/ditebak
                      <>
                        {orderDateCol && <th className="min-w-[120px] border-b border-slate-200 p-3">{orderDateCol}</th>}
                        <th className="border-b border-slate-200 p-3">Platform</th>
                        <th className="border-b border-slate-200 p-3">Toko</th>
                        {orderRestColumns.map((h) => (
                          <th key={h} className="max-w-[220px] truncate border-b border-slate-200 p-3" title={h}>{h}</th>
                        ))}
                      </>
                    )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {virt.topSpacer > 0 && (
                  <tr aria-hidden="true" style={{ height: virt.topSpacer }}><td colSpan={999} /></tr>
                )}
                {visibleRows.map((row, i) => {
                  const idx = virt.start + i;
                  return isAds ? (
                    <tr key={idx} className="hover:bg-slate-50">
                      {adsDateCol && <td className="p-3 font-mono text-xs text-slate-600">{formatCell(row[adsDateCol])}</td>}
                      <td className="p-3 font-medium text-slate-600">{platLabel}</td>
                      <td className="p-3 font-medium text-slate-600">{selectedAdv}</td>
                      <td className="p-3 font-medium text-slate-600">{selectedStore}</td>
                      {adsRestColumns.map((h) => (
                        <td key={h} className="max-w-[220px] truncate p-3 text-slate-700" title={formatCell(row[h])}>
                          {formatCell(row[h])}
                        </td>
                      ))}
                      <td className="p-3 text-slate-500">{catatan || "-"}</td>
                    </tr>
                  ) : isMeta ? (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-3 font-mono text-xs text-slate-600">{pick(row, ["Tanggal", "paid_time", "completed_time", "confirmed_time", "draft_time"])}</td>
                      <td className="p-3 font-medium text-slate-600">{platLabel}</td>
                      <td className="p-3 font-medium text-slate-600">{sumberToko}</td>
                      <td className="p-3 font-medium uppercase text-slate-600">{pick(row, ["platform", "utm_source", "Media"])}</td>
                      <td className="p-3 font-mono text-xs text-slate-700">{pick(row, ["No Invoice", "order_id", "No. Pesanan", "Order ID"])}</td>
                      <td className="p-3 font-mono text-xs text-slate-600">{pick(row, ["No Resi", "shipment_receipt", "Nomor Resi"])}</td>
                      <td className="p-3 font-medium text-slate-900">{pick(row, ["Customer", "name", "Nama"])}</td>
                      {(() => {
                        const rawType = String(pick(row, ["customer_type", "Tipe Pelanggan"], "")).toLowerCase();
                        const label = rawType === "new" ? "Baru" : rawType === "repeat" ? "Repeat" : rawType ? rawType : "-";
                        const tone = rawType === "new" ? "bg-blue-100 text-blue-800" : rawType === "repeat" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500";
                        return (
                          <td className="p-3">
                            <span className={`inline-flex rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${tone}`}>{label}</span>
                          </td>
                        );
                      })()}
                      <td className="max-w-[150px] truncate p-3 text-slate-600" title={pick(row, ["email", "Email"])}>{pick(row, ["email", "Email"])}</td>
                      <td className="p-3 font-mono text-xs text-slate-600">{pick(row, ["No HP", "phone", "Telepon"])}</td>
                      <td className="max-w-[200px] truncate p-3 text-slate-700" title={pick(row, ["Produk", "store", "product", "Nama Produk"])}>{pick(row, ["Produk", "store", "product", "Nama Produk"])}</td>
                      <td className="p-3 text-right text-slate-700">{pick(row, ["Qty", "quantity", "Jumlah"])}</td>
                      <td className="p-3 text-right font-mono text-xs text-slate-500">{fmtRp(pick(row, ["product_price", "Harga"], "0"))}</td>
                      <td className="p-3 text-right font-mono text-xs text-slate-500">{fmtRp(pick(row, ["shipping_cost", "Ongkir"], "0"))}</td>
                      <td className="p-3 text-right font-bold text-slate-900">{fmtRp(pick(row, ["Total", "Total Bayar", "net_revenue", "gross_revenue"], "0"))}</td>
                      <td className="p-3 font-medium uppercase text-slate-600">{pick(row, ["payment_method", "Metode"])}</td>
                      <td className="p-3 font-medium text-slate-600">{pick(row, ["handler", "CS"])}</td>
                      {/* Persis nilai asli file: order_status & payment_status Skalev beda arti, tidak boleh ditebak/campur */}
                      <td className="p-3"><StatusBadge value={String(row["order_status"] ?? "-")} color={statusColor} /></td>
                      <td className="p-3"><StatusBadge value={String(row["payment_status"] ?? "-")} color={statusColor} /></td>
                    </tr>
                  ) : (
                    // TikTok/Shopee: baris persis apa adanya dari file, tidak dipetakan/ditebak
                    <tr key={idx} className="hover:bg-slate-50">
                      {orderDateCol && <td className="p-3 font-mono text-xs text-slate-600">{formatCell(row[orderDateCol])}</td>}
                      <td className="p-3 font-medium text-slate-600">{platLabel}</td>
                      <td className="p-3 font-medium text-slate-600">{sumberToko}</td>
                      {orderRestColumns.map((h) => (
                        <td key={h} className="max-w-[220px] truncate p-3 text-slate-700" title={formatCell(row[h])}>
                          {formatCell(row[h])}
                        </td>
                      ))}
                    </tr>
                  );
                })}
                {virt.bottomSpacer > 0 && (
                  <tr aria-hidden="true" style={{ height: virt.bottomSpacer }}><td colSpan={999} /></tr>
                )}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 p-3 px-4">
              <span className="text-xs font-semibold text-slate-500">
                {startIndex + 1}–{Math.min(startIndex + rowsPerPage, totalData)} dari {totalData}
              </span>
              <div className="flex items-center gap-1">
                <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-50">Sebelumnya</button>
                <span className="px-3 text-xs font-bold text-slate-700">Hal {currentPage} / {totalPages}</span>
                <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-50">Berikutnya</button>
              </div>
            </div>
          )}
        </div>

        {/* Action bar */}
        <div className="flex flex-col-reverse items-stretch justify-end gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center">
          <button onClick={resetDetail} className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-100">
            <X className="size-4" /> Cancel
          </button>
          <button onClick={() => { setShowPreview(false); setSelectedFile(null); setPreviewRows([]); }} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50">
            <RotateCcw className="size-4" /> Upload Ulang
          </button>
          <button onClick={handleSaveClick} className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-red px-6 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#d60511]">
            <CheckCircle2 className="size-5" /> Simpan ke Database
          </button>
        </div>
      </div>
    );
  };

  // ===========================================================================
  // LAYOUT
  // ===========================================================================
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#eef2f6]/90 text-brand-deep">
      <main className="mx-auto flex w-full max-w-[1680px] flex-col gap-6 px-5 py-6 sm:px-7 lg:px-10">
        <DummyBanner />

        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-extrabold tracking-[-0.03em] text-slate-900">Import Data Channel</h1>
          <p className="text-sm font-medium text-slate-600">
            Alur: Pilih Platform → Jenis Import → Detail → Upload → Preview → Simpan. Data tidak langsung tersimpan sebelum Anda cek preview.
          </p>
        </div>

        <StepIndicator />

        {currentStep === 1 && renderPlatforms()}
        {currentStep === 2 && renderImportTypes()}
        {currentStep === 3 && renderDetailForm()}
        {currentStep === 4 && renderPreview()}

        {/* Riwayat Import */}
        <div className="rounded-[24px] bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-lg font-bold tracking-[-0.02em] text-slate-900">Riwayat Import Terbaru</h2>
          <p className="mt-1 text-xs font-medium text-slate-400">
            Data dummy untuk sesi ini — belum tersimpan permanen (menunggu backend).
          </p>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full whitespace-nowrap text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 font-semibold text-slate-500">
                  <th className="pb-3 pr-4 font-semibold">ID &amp; Waktu</th>
                  <th className="pb-3 pr-4 font-semibold">Sumber</th>
                  <th className="pb-3 pr-4 font-semibold">Jenis</th>
                  <th className="pb-3 pr-4 font-semibold">File</th>
                  <th className="pb-3 pr-4 text-right font-semibold">Baris</th>
                  <th className="pb-3 pr-4 font-semibold">Status</th>
                  <th className="pb-3 pr-4 text-right font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {history.map((h) => (
                  <tr key={h.id}>
                    <td className="py-4 pr-4"><div className="font-bold text-slate-900">{h.id}</div><div className="text-xs text-slate-500">{h.waktu}</div></td>
                    <td className="py-4 pr-4">{historyLabel(h)}</td>
                    <td className="py-4 pr-4">
                      {h.jenis === "ads" ? (
                        <span className="inline-flex rounded-md bg-violet-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-violet-700">Spending Ads</span>
                      ) : (
                        <span className="inline-flex rounded-md bg-blue-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-700">Data Pesanan</span>
                      )}
                    </td>
                    <td className="py-4 pr-4 font-mono text-xs text-slate-600">{h.fileName}</td>
                    <td className="py-4 pr-4 text-right">{h.rowCount.toLocaleString("id-ID")}</td>
                    <td className="py-4 pr-4">
                      {h.status === "Selesai" && <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700"><CheckCircle2 className="size-3.5" /> Selesai</span>}
                      {h.status === "Perlu Dicek" && <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700"><AlertCircle className="size-3.5" /> Ada Error</span>}
                      {h.status === "Diproses" && <span className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700"><Clock className="size-3.5" /> Diproses</span>}
                    </td>
                    <td className="py-4 pr-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => { setHistoryPreviewId(h.id); setHistoryPage(1); }}
                          title="Lihat kembali"
                          className="flex size-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:border-brand-red/40 hover:text-brand-red"
                        >
                          <Eye className="size-4" />
                        </button>
                        <button
                          onClick={() => downloadCsv(`${h.id}_${h.fileName.replace(/\.[^.]+$/, "")}.csv`, h.rows)}
                          title="Download CSV"
                          className="flex size-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:border-brand-red/40 hover:text-brand-red"
                        >
                          <Download className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex"><MarketingBackButton /></div>
      </main>
      <footer className="pb-7 pt-3 text-center text-xs font-medium text-slate-500 sm:text-sm">© 2026 Probetes ERP. All rights reserved.</footer>

      {/* Modal sukses simpan (simulasi) */}
      {importStatus === "saved" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-[24px] bg-white p-8 text-center shadow-xl animate-in zoom-in-95">
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 className="size-9" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Data berhasil disimpan</h3>
            <p className="mt-2 text-sm text-slate-500">Untuk tahap ini masih simulasi (belum ada database). Muncul di Riwayat Import di bawah — bisa dilihat & diunduh lagi kapan saja.</p>
            <button onClick={resetAll} className="mt-6 w-full rounded-xl bg-brand-red px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#d60511]">Selesai</button>
          </div>
        </div>
      )}

      {/* Modal "Lihat" riwayat import — menampilkan snapshot data yang sudah tersimpan */}
      {historyEntryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 animate-in fade-in" onClick={() => setHistoryPreviewId(null)}>
          <div
            className="flex max-h-[85vh] w-full max-w-5xl flex-col rounded-[24px] bg-white p-6 shadow-xl animate-in zoom-in-95 sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{historyEntryOpen.id} — {historyLabel(historyEntryOpen)}</h3>
                <p className="text-sm font-medium text-slate-500">{historyEntryOpen.waktu} • {historyEntryOpen.fileName} • {historyEntryOpen.rowCount.toLocaleString("id-ID")} baris</p>
              </div>
              <button onClick={() => setHistoryPreviewId(null)} className="flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200"><X className="size-4" /></button>
            </div>

            <div className="mb-4 flex items-center justify-end gap-2">
              <span className="text-xs font-semibold text-slate-500">Tampilkan</span>
              <select
                value={historyRowsPerPage}
                onChange={(e) => { setHistoryRowsPerPage(Number(e.target.value)); setHistoryPage(1); }}
                className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 shadow-sm outline-none"
              >
                {[10, 20, 50, 100].map((n) => <option key={n} value={n}>{n}</option>)}
                <option value={historyRows.length || 1}>Semua</option>
              </select>
            </div>

            <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-slate-200">
              <div ref={historyVirt.containerRef} className="max-h-[50vh] overflow-auto">
                <table className="w-full whitespace-nowrap text-left text-sm">
                  <thead className="sticky top-0 z-10 bg-slate-50 shadow-sm">
                    <tr className="font-semibold text-slate-500">
                      {historyRows[0] && Object.keys(historyRows[0]).map((h) => (
                        <th key={h} className="max-w-[220px] truncate border-b border-slate-200 p-3" title={h}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {historyVirt.topSpacer > 0 && (
                      <tr aria-hidden="true" style={{ height: historyVirt.topSpacer }}><td colSpan={999} /></tr>
                    )}
                    {visibleHistoryRows.map((row, i) => (
                      <tr key={historyStartIndex + historyVirt.start + i} className="hover:bg-slate-50">
                        {Object.keys(row).map((h) => (
                          <td key={h} className="max-w-[220px] truncate p-3 text-slate-700" title={row[h]}>{row[h]}</td>
                        ))}
                      </tr>
                    ))}
                    {historyVirt.bottomSpacer > 0 && (
                      <tr aria-hidden="true" style={{ height: historyVirt.bottomSpacer }}><td colSpan={999} /></tr>
                    )}
                  </tbody>
                </table>
              </div>
              {historyTotalPages > 1 && (
                <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 p-3 px-4">
                  <span className="text-xs font-semibold text-slate-500">
                    {historyStartIndex + 1}–{Math.min(historyStartIndex + historyRowsPerPage, historyRows.length)} dari {historyRows.length}
                  </span>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setHistoryPage((p) => Math.max(1, p - 1))} disabled={historyPage === 1} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-50">Sebelumnya</button>
                    <span className="px-3 text-xs font-bold text-slate-700">Hal {historyPage} / {historyTotalPages}</span>
                    <button onClick={() => setHistoryPage((p) => Math.min(historyTotalPages, p + 1))} disabled={historyPage === historyTotalPages} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-50">Berikutnya</button>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 flex justify-end gap-3 border-t border-slate-100 pt-4">
              <button onClick={() => setHistoryPreviewId(null)} className="rounded-xl px-5 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-100">Tutup</button>
              <button
                onClick={() => downloadCsv(`${historyEntryOpen.id}_${historyEntryOpen.fileName.replace(/\.[^.]+$/, "")}.csv`, historyEntryOpen.rows)}
                className="inline-flex items-center gap-2 rounded-xl bg-brand-red px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#d60511]"
              >
                <Download className="size-4" /> Download CSV
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// KOMPONEN KECIL
// =============================================================================
function PlatformCard({ onClick, logo, title, badge }: { onClick: () => void; logo: React.ReactNode; title: string; badge: string }) {
  return (
    <button onClick={onClick} className="group relative flex w-full items-center gap-4 overflow-hidden rounded-2xl border border-transparent bg-[#e30613] p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:bg-[#c90510]">
      <div className="flex size-[60px] shrink-0 items-center justify-center rounded-xl bg-white shadow-sm transition-transform group-hover:scale-105">{logo}</div>
      <div className="min-w-0 flex-1">
        <h3 className="text-lg font-bold tracking-[-0.02em] text-white">{title}</h3>
        <span className="mt-1.5 inline-block rounded-full bg-white px-2.5 py-0.5 text-xs font-bold text-[#e30613]">{badge}</span>
      </div>
      <ChevronRight className="size-6 text-white/70 transition group-hover:translate-x-1 group-hover:text-white" />
    </button>
  );
}

function ImportTypeCard({ onClick, icon, title, desc }: { onClick: () => void; icon: React.ReactNode; title: string; desc: string }) {
  return (
    <button onClick={onClick} className="group flex flex-col items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-6 text-left transition hover:-translate-y-0.5 hover:border-brand-red hover:bg-brand-red/5">
      <div className="flex size-12 items-center justify-center rounded-xl bg-brand-red/10 text-brand-red transition group-hover:bg-brand-red group-hover:text-white">{icon}</div>
      <div>
        <h3 className="text-base font-bold text-slate-900">{title}</h3>
        <p className="mt-1 text-sm text-slate-500">{desc}</p>
      </div>
      <span className="mt-auto inline-flex items-center gap-1 pt-2 text-sm font-bold text-brand-red">Pilih <ChevronRight className="size-4" /></span>
    </button>
  );
}

function StatusBadge({ value, color }: { value: string; color: (raw: string) => string }) {
  if (!value || value === "-") return <span className="text-slate-300">-</span>;
  return <span className={`inline-flex rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${color(value)}`}>{value}</span>;
}

function PanelHeader({ onBack, title, subtitle }: { onBack: () => void; title: string; subtitle: string }) {
  return (
    <div className="mb-6 flex items-center gap-4 border-b border-slate-100 pb-4">
      <button onClick={onBack} className="flex size-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200"><ArrowLeft className="size-4" /></button>
      <div>
        <h2 className="text-xl font-bold tracking-[-0.02em] text-slate-900">{title}</h2>
        <p className="text-sm font-medium text-slate-500">{subtitle}</p>
      </div>
    </div>
  );
}

function ChipSelector({
  options, selected, onSelect, onAdd, onDelete, onEdit, icon, addLabel, placeholder,
}: {
  options: string[];
  selected: string | null;
  onSelect: (v: string) => void;
  onAdd: (v: string) => void;
  onDelete: (v: string) => void;
  onEdit: (oldName: string, newName: string) => void;
  icon: React.ReactNode;
  addLabel: string;
  placeholder: string;
}) {
  const [adding, setAdding] = useState(false);
  const [value, setValue] = useState("");
  const submit = () => { if (value.trim()) { onAdd(value); setValue(""); setAdding(false); } };

  const [editingOpt, setEditingOpt] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const startEdit = (opt: string) => { setEditingOpt(opt); setEditValue(opt); };
  const submitEdit = () => {
    if (editingOpt && editValue.trim()) onEdit(editingOpt, editValue);
    setEditingOpt(null);
    setEditValue("");
  };
  const cancelEdit = () => { setEditingOpt(null); setEditValue(""); };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {options.map((opt) => {
        if (editingOpt === opt) {
          return (
            <span key={opt} className="inline-flex items-center gap-1 rounded-xl border border-brand-red/30 bg-white px-2 py-1.5">
              <input
                autoFocus
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") submitEdit(); if (e.key === "Escape") cancelEdit(); }}
                className="w-36 text-sm outline-none"
              />
              <button onClick={submitEdit} className="rounded-lg bg-brand-red p-1 text-white hover:bg-[#d60511]"><Check className="size-4" /></button>
              <button onClick={cancelEdit} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"><X className="size-4" /></button>
            </span>
          );
        }
        const active = selected === opt;
        return (
          <span key={opt} className={`group inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-bold transition ${active ? "border-brand-red bg-brand-red/5 text-brand-red" : "border-slate-200 bg-white text-slate-700 hover:border-brand-red/40"}`}>
            <button onClick={() => onSelect(opt)} className="inline-flex items-center gap-2">
              {icon}{opt}
            </button>
            <button onClick={() => startEdit(opt)} title="Edit nama" className="text-slate-300 hover:text-brand-red"><Pencil className="size-3.5" /></button>
            <button onClick={() => onDelete(opt)} title="Hapus" className="text-slate-300 hover:text-red-500"><Trash2 className="size-3.5" /></button>
          </span>
        );
      })}

      {adding ? (
        <span className="inline-flex items-center gap-1 rounded-xl border border-brand-red/30 bg-white px-2 py-1.5">
          <input
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") submit(); if (e.key === "Escape") { setAdding(false); setValue(""); } }}
            placeholder={placeholder}
            className="w-36 text-sm outline-none"
          />
          <button onClick={submit} className="rounded-lg bg-brand-red p-1 text-white hover:bg-[#d60511]"><Check className="size-4" /></button>
          <button onClick={() => { setAdding(false); setValue(""); }} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"><X className="size-4" /></button>
        </span>
      ) : (
        <button onClick={() => setAdding(true)} className="inline-flex items-center gap-1.5 rounded-xl border-2 border-dashed border-slate-300 px-3 py-2 text-sm font-bold text-slate-500 transition hover:border-brand-red hover:text-brand-red">
          <Plus className="size-4" /> {addLabel}
        </button>
      )}
    </div>
  );
}
