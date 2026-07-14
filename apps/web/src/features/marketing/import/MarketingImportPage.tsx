"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Download,
  Eye,
  Loader2,
  Megaphone,
  ReceiptText,
  RotateCcw,
  Store,
  Upload,
  X,
} from "lucide-react";
import { useRowVirtualizer } from "@/features/database/master-data/hooks/useRowVirtualizer";
import { DummyBanner } from "@/features/marketing/components/DummyBanner";
import { MarketingBackButton } from "@/features/marketing/components/MarketingBackButton";
import { MetaLogo, ShopeeLogo, SkalevLogo, TikTokLogo } from "@/features/marketing/components/BrandLogos";
import type {
  ImportCommitResponse,
  ImportHistoryEntry,
  ImportOptionsByPlatform,
  ImportPlatform,
  ImportPreviewResponse,
  ImportSourceOption,
  ImportValidationStatus,
  MarketplaceImportType,
} from "@/server/modules/marketing/import/import.types";
import {
  cancelMarketplaceImport,
  commitMarketplaceImport,
  createImportOption,
  fetchImportHistory,
  fetchImportHistoryDetail,
  fetchImportOptions,
  previewMarketplaceImport,
  removeImportOption,
  renameImportOption,
} from "./importApi";
import {
  ChipSelector,
  ImportTypeCard,
  PanelHeader,
  PlatformCard,
  ValidationBadge,
} from "./ImportUi";

const PLATFORM_LABEL: Record<ImportPlatform, string> = {
  tiktok: "TikTok Shop",
  shopee: "Shopee",
  meta: "Meta / Akuisisi",
};

const EMPTY_OPTIONS = (): ImportOptionsByPlatform => ({
  tiktok: { adv: [], stores: [] },
  shopee: { adv: [], stores: [] },
  meta: { adv: [], stores: [] },
});

type ValidationFilter = "all" | ImportValidationStatus;

export default function MarketingImportPage() {
  const [selectedPlatform, setSelectedPlatform] = useState<ImportPlatform | null>(null);
  const [selectedImportType, setSelectedImportType] = useState<MarketplaceImportType | null>(null);
  const [selectedAdvId, setSelectedAdvId] = useState<string | null>(null);
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const [period, setPeriod] = useState("");
  const [note, setNote] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ImportPreviewResponse | null>(null);
  const [options, setOptions] = useState<ImportOptionsByPlatform>(EMPTY_OPTIONS);
  const [history, setHistory] = useState<ImportHistoryEntry[]>([]);
  const [historyDetail, setHistoryDetail] = useState<ImportHistoryEntry | null>(null);
  const [commitResult, setCommitResult] = useState<ImportCommitResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [validationFilter, setValidationFilter] = useState<ValidationFilter>("all");
  const [previewPage, setPreviewPage] = useState(1);
  const [previewRowsPerPage, setPreviewRowsPerPage] = useState(10);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyRowsPerPage, setHistoryRowsPerPage] = useState(10);

  useEffect(() => {
    let active = true;
    Promise.all([fetchImportOptions(), fetchImportHistory()])
      .then(([nextOptions, nextHistory]) => {
        if (!active) return;
        setOptions(nextOptions);
        setHistory(nextHistory);
      })
      .catch((error: unknown) => {
        if (active) setErrorMessage(errorMessageOf(error));
      })
      .finally(() => {
        if (active) setIsLoadingInitial(false);
      });
    return () => { active = false; };
  }, []);

  const selectedAdv = selectedPlatform
    ? options[selectedPlatform].adv.find((option) => option.id === selectedAdvId) ?? null
    : null;
  const selectedStore = selectedPlatform
    ? options[selectedPlatform].stores.find((option) => option.id === selectedStoreId) ?? null
    : null;
  const detailReady = selectedImportType === "ads" ? Boolean(selectedAdvId) : Boolean(selectedStoreId);
  const currentStep = preview ? 4 : selectedPlatform && selectedImportType ? 3 : selectedPlatform ? 2 : 1;
  const filteredPreviewRows = useMemo(() => {
    const rows = preview?.rows ?? [];
    return validationFilter === "all" ? rows : rows.filter((row) => row.status === validationFilter);
  }, [preview, validationFilter]);
  const previewTotalPages = Math.max(1, Math.ceil(filteredPreviewRows.length / previewRowsPerPage));
  const previewStart = (previewPage - 1) * previewRowsPerPage;
  const currentPreviewRows = filteredPreviewRows.slice(previewStart, previewStart + previewRowsPerPage);
  const previewVirtualizer = useRowVirtualizer<HTMLDivElement>({ count: currentPreviewRows.length, rowHeight: 48 });
  const visiblePreviewRows = currentPreviewRows.slice(previewVirtualizer.start, previewVirtualizer.end);

  const historyRows = historyDetail?.rows ?? [];
  const historyTotalPages = Math.max(1, Math.ceil(historyRows.length / historyRowsPerPage));
  const historyStart = (historyPage - 1) * historyRowsPerPage;
  const currentHistoryRows = historyRows.slice(historyStart, historyStart + historyRowsPerPage);
  const historyVirtualizer = useRowVirtualizer<HTMLDivElement>({ count: currentHistoryRows.length, rowHeight: 48 });
  const visibleHistoryRows = currentHistoryRows.slice(historyVirtualizer.start, historyVirtualizer.end);

  const refreshHistory = async () => setHistory(await fetchImportHistory());

  const resetDetail = () => {
    setSelectedAdvId(null);
    setSelectedStoreId(null);
    setPeriod("");
    setNote("");
    setSelectedFile(null);
    setPreview(null);
    setValidationFilter("all");
    setPreviewPage(1);
  };

  const resetAll = () => {
    setSelectedPlatform(null);
    setSelectedImportType(null);
    resetDetail();
    setCommitResult(null);
    setErrorMessage("");
  };

  const goBack = async () => {
    setErrorMessage("");
    if (preview) {
      await cancelCurrentPreview(false);
      return;
    }
    if (selectedImportType) {
      setSelectedImportType(null);
      resetDetail();
      return;
    }
    setSelectedPlatform(null);
  };

  const mutateOption = async (
    type: "adv" | "store",
    action: "create" | "rename" | "delete",
    optionOrLabel: ImportSourceOption | string,
    label?: string,
  ) => {
    if (!selectedPlatform) return;
    setErrorMessage("");
    try {
      if (action === "create") {
        const created = await createImportOption({ platform: selectedPlatform, type, label: String(optionOrLabel) });
        setOptions((previous) => ({
          ...previous,
          [selectedPlatform]: {
            ...previous[selectedPlatform],
            [type === "adv" ? "adv" : "stores"]: [...previous[selectedPlatform][type === "adv" ? "adv" : "stores"], created]
              .sort((a, b) => a.label.localeCompare(b.label, "id-ID")),
          },
        }));
        if (type === "adv") setSelectedAdvId(created.id);
        else setSelectedStoreId(created.id);
        return;
      }
      const option = optionOrLabel as ImportSourceOption;
      if (action === "delete") {
        if (!window.confirm(`Hapus pilihan "${option.label}"?`)) return;
        await removeImportOption(option.id);
        setOptions((previous) => ({
          ...previous,
          [selectedPlatform]: {
            ...previous[selectedPlatform],
            [type === "adv" ? "adv" : "stores"]: previous[selectedPlatform][type === "adv" ? "adv" : "stores"].filter((item) => item.id !== option.id),
          },
        }));
        if (type === "adv" && selectedAdvId === option.id) setSelectedAdvId(null);
        if (type === "store" && selectedStoreId === option.id) setSelectedStoreId(null);
        return;
      }
      const updated = await renameImportOption(option.id, label ?? "");
      setOptions((previous) => ({
        ...previous,
        [selectedPlatform]: {
          ...previous[selectedPlatform],
          [type === "adv" ? "adv" : "stores"]: previous[selectedPlatform][type === "adv" ? "adv" : "stores"]
            .map((item) => item.id === updated.id ? updated : item)
            .sort((a, b) => a.label.localeCompare(b.label, "id-ID")),
        },
      }));
    } catch (error) {
      const message = errorMessageOf(error);
      setErrorMessage(message);
      throw error;
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !selectedPlatform || !selectedImportType) return;
    if (!detailReady) {
      setErrorMessage(selectedImportType === "ads" ? "Pilih ADV dulu sebelum upload." : "Pilih Toko dulu sebelum upload.");
      return;
    }
    setErrorMessage("");
    setIsUploading(true);
    setSelectedFile(file);
    try {
      const nextPreview = await previewMarketplaceImport({
        file,
        platform: selectedPlatform,
        importType: selectedImportType,
        advId: selectedImportType === "ads" ? selectedAdvId : null,
        storeId: selectedImportType === "order" ? selectedStoreId : null,
        period,
        note,
      });
      setPreview(nextPreview);
      setValidationFilter("all");
      setPreviewPage(1);
      await refreshHistory();
    } catch (error) {
      setSelectedFile(null);
      setErrorMessage(errorMessageOf(error));
    } finally {
      setIsUploading(false);
    }
  };

  const cancelCurrentPreview = async (resetEverything: boolean) => {
    if (!preview || isCancelling) return;
    setIsCancelling(true);
    setErrorMessage("");
    try {
      await cancelMarketplaceImport(preview.previewId);
      if (resetEverything) resetAll();
      else {
        setPreview(null);
        setSelectedFile(null);
        setPreviewPage(1);
      }
      await refreshHistory();
    } catch (error) {
      setErrorMessage(errorMessageOf(error));
    } finally {
      setIsCancelling(false);
    }
  };

  const handleCommit = async () => {
    if (!preview || isSaving) return;
    setIsSaving(true);
    setErrorMessage("");
    try {
      setCommitResult(await commitMarketplaceImport(preview.previewId));
      await refreshHistory();
    } catch (error) {
      setErrorMessage(errorMessageOf(error));
    } finally {
      setIsSaving(false);
    }
  };

  const openHistory = async (entry: ImportHistoryEntry) => {
    setIsHistoryLoading(true);
    setErrorMessage("");
    try {
      setHistoryDetail(await fetchImportHistoryDetail(entry.id));
      setHistoryPage(1);
    } catch (error) {
      setErrorMessage(errorMessageOf(error));
    } finally {
      setIsHistoryLoading(false);
    }
  };

  const downloadHistory = async (entry: ImportHistoryEntry) => {
    setIsHistoryLoading(true);
    setErrorMessage("");
    try {
      const detail = entry.rows ? entry : await fetchImportHistoryDetail(entry.id);
      downloadCsv(`${shortBatchId(entry.id)}_${entry.fileName.replace(/\.[^.]+$/, "")}.csv`, detail.rows?.map((row) => row.data) ?? []);
    } catch (error) {
      setErrorMessage(errorMessageOf(error));
    } finally {
      setIsHistoryLoading(false);
    }
  };

  const renderPlatformStep = () => (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <PlatformCard onClick={() => setSelectedPlatform("tiktok")} logo={<TikTokLogo className="size-8 text-black" />} title="TikTok Shop" badge={`${options.tiktok.stores.length} Toko`} />
      <PlatformCard onClick={() => setSelectedPlatform("shopee")} logo={<ShopeeLogo className="size-9 text-[#EE4D2D]" />} title="Shopee" badge={`${options.shopee.stores.length} Toko`} />
      <button onClick={() => setSelectedPlatform("meta")} className="group relative flex w-full items-center gap-4 overflow-hidden rounded-2xl border border-transparent bg-[#e30613] p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:bg-[#c90510]">
        <div className="relative flex size-[60px] shrink-0 items-center justify-center rounded-xl bg-white shadow-sm transition-transform group-hover:scale-105">
          <div className="absolute left-2 top-2.5 flex size-7 items-center justify-center rounded-full border-2 border-white bg-slate-900"><SkalevLogo className="size-4 text-white" /></div>
          <div className="absolute bottom-2.5 right-2 flex size-7 items-center justify-center rounded-full border-2 border-white bg-blue-600"><MetaLogo className="size-4 text-white" /></div>
        </div>
        <div className="min-w-0 flex-1"><h3 className="text-lg font-bold text-white">Meta / Akuisisi</h3><span className="mt-1.5 inline-block rounded-full bg-white px-2.5 py-0.5 text-xs font-bold text-[#e30613]">Skalev &amp; Ads</span></div>
        <ChevronRight className="size-6 text-white/70 transition group-hover:translate-x-1" />
      </button>
    </div>
  );

  const renderImportTypeStep = () => (
    <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <PanelHeader onBack={() => void goBack()} title={`Import ${PLATFORM_LABEL[selectedPlatform!]}`} subtitle="Pilih jenis data yang ingin diimpor." />
      <div className="grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2">
        <ImportTypeCard onClick={() => setSelectedImportType("ads")} icon={<Megaphone className="size-6" />} title="Spending Ads" description="Laporan pengeluaran iklan per campaign. Pilih satu ADV." />
        <ImportTypeCard onClick={() => setSelectedImportType("order")} icon={<ReceiptText className="size-6" />} title="Data Pesanan" description="Daftar pesanan pelanggan. Pilih satu Toko." />
      </div>
    </div>
  );

  const renderDetailStep = () => {
    const isAds = selectedImportType === "ads";
    const platformOptions = options[selectedPlatform!];
    return (
      <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <PanelHeader onBack={() => void goBack()} title={`${isAds ? "Spending Ads" : "Data Pesanan"} — ${PLATFORM_LABEL[selectedPlatform!]}`} subtitle="Lengkapi detail sebelum upload file." />
        <div className="flex max-w-3xl flex-col gap-6">
          {isAds ? (
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-800">Pilih ADV (Advertiser) <span className="text-brand-red">*</span></label>
              {platformOptions.adv.length === 0 && !isLoadingInitial ? <p className="mb-2 text-sm text-amber-700">Belum ada ADV. Tambahkan ADV untuk melanjutkan.</p> : null}
              <ChipSelector
                options={platformOptions.adv}
                selectedId={selectedAdvId}
                onSelect={(option) => setSelectedAdvId(option.id)}
                onAdd={(label) => mutateOption("adv", "create", label)}
                onDelete={(option) => mutateOption("adv", "delete", option)}
                onEdit={(option, label) => mutateOption("adv", "rename", option, label)}
                icon={<Megaphone className="size-3.5" />}
                addLabel="Tambah ADV"
                placeholder="Nama ADV"
                disabled={isUploading}
              />
            </div>
          ) : (
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-800">Pilih Toko <span className="text-brand-red">*</span></label>
              {platformOptions.stores.length === 0 && !isLoadingInitial ? <p className="mb-2 text-sm text-amber-700">Belum ada toko. Tambahkan toko untuk melanjutkan.</p> : null}
              <ChipSelector
                options={platformOptions.stores}
                selectedId={selectedStoreId}
                onSelect={(option) => setSelectedStoreId(option.id)}
                onAdd={(label) => mutateOption("store", "create", label)}
                onDelete={(option) => mutateOption("store", "delete", option)}
                onEdit={(option, label) => mutateOption("store", "rename", option, label)}
                icon={<Store className="size-3.5" />}
                addLabel="Tambah Toko"
                placeholder="Nama toko"
                disabled={isUploading}
              />
            </div>
          )}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div><label className="mb-1 block text-sm font-bold text-slate-800">Periode (opsional)</label><input value={period} onChange={(event) => setPeriod(event.target.value)} placeholder="cth: Juli 2026" className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-brand-red" /></div>
            <div><label className="mb-1 block text-sm font-bold text-slate-800">Catatan Import (opsional)</label><input value={note} onChange={(event) => setNote(event.target.value)} placeholder="cth: batch pertama" className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-brand-red" /></div>
          </div>
          <div>
            <label className="mb-2 block text-sm font-bold text-slate-800">Upload File <span className="text-brand-red">*</span></label>
            <div className={`relative flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-10 text-center transition ${detailReady && !isUploading ? "cursor-pointer border-slate-300 bg-slate-50 hover:border-brand-red hover:bg-brand-red/5" : "border-slate-200 bg-slate-50/60"}`}>
              <input type="file" accept=".csv,.xls,.xlsx,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" disabled={!detailReady || isUploading} onChange={(event) => void handleFileChange(event)} className={`absolute inset-0 h-full w-full opacity-0 ${detailReady && !isUploading ? "cursor-pointer" : "cursor-not-allowed"}`} />
              {isUploading ? <Loader2 className="size-10 animate-spin text-brand-red" /> : <Upload className="size-10 text-slate-400" strokeWidth={1.5} />}
              <p className="text-base font-bold text-slate-700">{isUploading ? "Membaca dan memvalidasi file..." : "Pilih file untuk menampilkan preview"}</p>
              <p className="text-xs font-medium text-slate-500">CSV, XLS, atau XLSX • maksimal 10 MB</p>
              {!detailReady && <p className="mt-1 text-xs font-bold text-amber-600">{isAds ? "Pilih ADV dulu untuk mengaktifkan upload." : "Pilih Toko dulu untuk mengaktifkan upload."}</p>}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderPreviewStep = () => preview && (
    <div className="rounded-[24px] border border-brand-red/20 bg-white p-6 shadow-sm sm:p-8">
      <PanelHeader
        onBack={() => void goBack()}
        title={`Preview: ${preview.importType === "ads" ? "Spending Ads" : "Data Pesanan"}`}
        subtitle={`${PLATFORM_LABEL[preview.platform]} • ${preview.importType === "ads" ? `ADV: ${selectedAdv?.label ?? preview.sourceName}` : `Toko: ${selectedStore?.label ?? preview.sourceName}`}`}
      />
      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
        <SummaryBox label="Total" value={preview.totalRows} tone="slate" />
        <SummaryBox label="Valid" value={preview.validRows} tone="emerald" />
        <SummaryBox label="Perlu Dicek" value={preview.reviewRows} tone="amber" />
        <SummaryBox label="Duplikat" value={preview.duplicateRows} tone="violet" />
        <SummaryBox label="Error" value={preview.errorRows} tone="red" />
      </div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">Terbaca <strong>{preview.totalRows} baris</strong> dari file “{preview.fileName}”. Data belum masuk database utama.</p>
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-xs font-semibold text-slate-500" htmlFor="validation-filter">Status</label>
          <select id="validation-filter" value={validationFilter} onChange={(event) => { setValidationFilter(event.target.value as ValidationFilter); setPreviewPage(1); }} className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700">
            <option value="all">Semua</option><option value="valid">Valid</option><option value="review">Perlu Dicek</option><option value="duplicate">Duplikat</option><option value="error">Error</option>
          </select>
          <label className="text-xs font-semibold text-slate-500" htmlFor="preview-limit">Tampilkan</label>
          <select id="preview-limit" value={previewRowsPerPage} onChange={(event) => { setPreviewRowsPerPage(Number(event.target.value)); setPreviewPage(1); }} className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700">
            {[10, 20, 50, 100].map((value) => <option key={value} value={value}>{value}</option>)}
            <option value={filteredPreviewRows.length || 1}>Semua</option>
          </select>
        </div>
      </div>
      <div className="mb-6 flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div ref={previewVirtualizer.containerRef} className="max-h-[440px] overflow-auto">
          <table className="w-full whitespace-nowrap text-left text-sm">
            <thead className="sticky top-0 z-10 bg-slate-50 shadow-sm"><tr>{preview.columns.map((column) => <th key={column} className="max-w-[240px] border-b border-slate-200 p-3 font-semibold text-slate-500">{column}</th>)}</tr></thead>
            <tbody className="divide-y divide-slate-100">
              {previewVirtualizer.topSpacer > 0 && <tr aria-hidden style={{ height: previewVirtualizer.topSpacer }}><td colSpan={preview.columns.length} /></tr>}
              {visiblePreviewRows.map((row) => (
                <tr key={row.rowNumber} className="hover:bg-slate-50">
                  {preview.columns.map((column) => <PreviewCell key={column} column={column} row={row} />)}
                </tr>
              ))}
              {previewVirtualizer.bottomSpacer > 0 && <tr aria-hidden style={{ height: previewVirtualizer.bottomSpacer }}><td colSpan={preview.columns.length} /></tr>}
            </tbody>
          </table>
          {filteredPreviewRows.length === 0 && <div className="p-8 text-center text-sm font-medium text-slate-500">Tidak ada baris untuk status ini.</div>}
        </div>
        {previewTotalPages > 1 && <Pagination page={previewPage} totalPages={previewTotalPages} start={previewStart} pageSize={previewRowsPerPage} totalRows={filteredPreviewRows.length} onChange={setPreviewPage} />}
      </div>
      <div className="flex flex-col-reverse items-stretch justify-end gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center">
        <button disabled={isCancelling || isSaving} onClick={() => void cancelCurrentPreview(true)} className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-100 disabled:opacity-50"><X className="size-4" /> Cancel</button>
        <button disabled={isCancelling || isSaving} onClick={() => void cancelCurrentPreview(false)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50">{isCancelling ? <Loader2 className="size-4 animate-spin" /> : <RotateCcw className="size-4" />} Upload Ulang</button>
        <button disabled={isSaving || isCancelling} onClick={() => void handleCommit()} className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-red px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-[#d60511] disabled:opacity-50">{isSaving ? <Loader2 className="size-5 animate-spin" /> : <CheckCircle2 className="size-5" />} {isSaving ? "Menyimpan..." : "Simpan ke Database"}</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#eef2f6]/90 text-brand-deep">
      <main className="mx-auto flex w-full max-w-[1680px] flex-col gap-6 px-5 py-6 sm:px-7 lg:px-10">
        <DummyBanner />
        <div><h1 className="text-3xl font-extrabold tracking-[-0.03em] text-slate-900">Import Data Channel</h1><p className="mt-2 text-sm font-medium text-slate-600">Pilih sumber, upload file, cek hasil validasi, lalu simpan jika sudah sesuai.</p></div>
        <StepIndicator currentStep={currentStep} />
        {errorMessage && <div role="alert" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"><AlertCircle className="mt-0.5 size-4 shrink-0" /><span>{errorMessage}</span><button onClick={() => setErrorMessage("")} className="ml-auto"><X className="size-4" /></button></div>}
        {isLoadingInitial && currentStep === 1 ? <LoadingPanel label="Memuat pilihan import..." /> : null}
        {!isLoadingInitial && currentStep === 1 ? renderPlatformStep() : null}
        {currentStep === 2 ? renderImportTypeStep() : null}
        {currentStep === 3 ? renderDetailStep() : null}
        {currentStep === 4 ? renderPreviewStep() : null}
        <HistoryPanel history={history} loading={isLoadingInitial || isHistoryLoading} onView={(entry) => void openHistory(entry)} onDownload={(entry) => void downloadHistory(entry)} />
        <div className="flex"><MarketingBackButton /></div>
      </main>
      <footer className="pb-7 pt-3 text-center text-xs font-medium text-slate-500 sm:text-sm">© 2026 Probetes ERP. All rights reserved.</footer>
      {commitResult && <SuccessModal result={commitResult} onClose={resetAll} />}
      {historyDetail && (
        <HistoryModal
          entry={historyDetail}
          rows={visibleHistoryRows}
          virtualizer={historyVirtualizer}
          page={historyPage}
          totalPages={historyTotalPages}
          pageSize={historyRowsPerPage}
          start={historyStart}
          onPageChange={setHistoryPage}
          onPageSizeChange={(value) => { setHistoryRowsPerPage(value); setHistoryPage(1); }}
          onClose={() => setHistoryDetail(null)}
          onDownload={() => void downloadHistory(historyDetail)}
        />
      )}
    </div>
  );
}

function StepIndicator({ currentStep }: { currentStep: number }) {
  const steps = ["Platform", "Jenis Import", "Detail & Upload", "Preview"];
  return (
    <div className="flex items-center gap-2 overflow-x-auto rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      {steps.map((label, index) => {
        const number = index + 1;
        const active = number === currentStep;
        const done = number < currentStep;
        return <div key={label} className="flex items-center gap-2 whitespace-nowrap"><span className={`flex size-6 items-center justify-center rounded-full text-xs font-bold ${done ? "bg-emerald-500 text-white" : active ? "bg-brand-red text-white" : "bg-slate-100 text-slate-400"}`}>{done ? <Check className="size-3.5" /> : number}</span><span className={`text-sm font-bold ${active ? "text-slate-900" : done ? "text-emerald-600" : "text-slate-400"}`}>{label}</span>{index < steps.length - 1 && <ChevronRight className="size-4 text-slate-300" />}</div>;
      })}
    </div>
  );
}

function SummaryBox({ label, value, tone }: { label: string; value: number; tone: "slate" | "emerald" | "amber" | "violet" | "red" }) {
  const styles = { slate: "bg-slate-50 text-slate-700", emerald: "bg-emerald-50 text-emerald-700", amber: "bg-amber-50 text-amber-700", violet: "bg-violet-50 text-violet-700", red: "bg-red-50 text-red-700" };
  return <div className={`rounded-xl px-3 py-3 ${styles[tone]}`}><div className="text-xs font-bold uppercase tracking-wide opacity-70">{label}</div><div className="mt-1 text-xl font-extrabold">{value.toLocaleString("id-ID")}</div></div>;
}

function PreviewCell({ column, row }: { column: string; row: ImportPreviewResponse["rows"][number] }) {
  if (column === "Status Validasi") return <td className="p-3"><ValidationBadge status={row.status} /></td>;
  const value = column === "Catatan Validasi" ? row.notes.join(" ") || "Data siap disimpan." : row.data[column];
  const formatted = formatCell(column, value);
  return <td className={`max-w-[260px] p-3 text-slate-700 ${column === "Catatan Validasi" ? "min-w-[240px] whitespace-normal" : "truncate"}`} title={String(formatted)}>{formatted}</td>;
}

function formatCell(column: string, value: unknown): string {
  if (value === null || value === undefined || value === "") return "-";
  if (typeof value === "number") {
    if (/spending|harga|total bayar/i.test(column)) return `Rp${Math.round(value).toLocaleString("id-ID")}`;
    return value.toLocaleString("id-ID");
  }
  return String(value);
}

function Pagination({ page, totalPages, start, pageSize, totalRows, onChange }: { page: number; totalPages: number; start: number; pageSize: number; totalRows: number; onChange: (page: number) => void }) {
  return <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 p-3 px-4"><span className="text-xs font-semibold text-slate-500">{start + 1}–{Math.min(start + pageSize, totalRows)} dari {totalRows}</span><div className="flex items-center gap-1"><button onClick={() => onChange(Math.max(1, page - 1))} disabled={page === 1} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 disabled:opacity-50">Sebelumnya</button><span className="px-3 text-xs font-bold text-slate-700">Hal {page} / {totalPages}</span><button onClick={() => onChange(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 disabled:opacity-50">Berikutnya</button></div></div>;
}

function HistoryPanel({ history, loading, onView, onDownload }: { history: ImportHistoryEntry[]; loading: boolean; onView: (entry: ImportHistoryEntry) => void; onDownload: (entry: ImportHistoryEntry) => void }) {
  return (
    <div className="rounded-[24px] bg-white p-6 shadow-sm sm:p-8">
      <h2 className="text-lg font-bold text-slate-900">Riwayat Import Terbaru</h2><p className="mt-1 text-xs font-medium text-slate-500">Riwayat tersimpan di database dan tetap tersedia setelah halaman dimuat ulang.</p>
      {loading ? <LoadingPanel label="Memuat riwayat..." compact /> : history.length === 0 ? <div className="mt-6 rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm font-medium text-slate-500">Belum ada riwayat import.</div> : (
        <div className="mt-6 overflow-x-auto"><table className="w-full whitespace-nowrap text-left text-sm"><thead><tr className="border-b border-slate-200 text-slate-500"><th className="pb-3 pr-4">ID &amp; Waktu</th><th className="pb-3 pr-4">Sumber</th><th className="pb-3 pr-4">Jenis</th><th className="pb-3 pr-4">File</th><th className="pb-3 pr-4 text-right">Baris</th><th className="pb-3 pr-4">Status</th><th className="pb-3 text-right">Aksi</th></tr></thead><tbody className="divide-y divide-slate-100">{history.map((entry) => <tr key={entry.id}><td className="py-4 pr-4"><div className="font-bold text-slate-900">{shortBatchId(entry.id)}</div><div className="text-xs text-slate-500">{formatDateTime(entry.createdAt)}</div></td><td className="py-4 pr-4">{sourceLabel(entry)}</td><td className="py-4 pr-4">{entry.importType === "ads" ? "Spending Ads" : "Data Pesanan"}</td><td className="max-w-[220px] truncate py-4 pr-4 font-mono text-xs" title={entry.fileName}>{entry.fileName}</td><td className="py-4 pr-4 text-right">{entry.totalRows.toLocaleString("id-ID")}</td><td className="py-4 pr-4"><HistoryStatus status={entry.status} /></td><td className="py-4"><div className="flex justify-end gap-2"><button onClick={() => onView(entry)} title="Lihat" className="flex size-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:text-brand-red"><Eye className="size-4" /></button><button onClick={() => onDownload(entry)} title="Download CSV" className="flex size-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:text-brand-red"><Download className="size-4" /></button></div></td></tr>)}</tbody></table></div>
      )}
    </div>
  );
}

function HistoryStatus({ status }: { status: ImportHistoryEntry["status"] }) {
  const config = status === "completed" ? ["Selesai", "bg-emerald-50 text-emerald-700"] : status === "preview" ? ["Menunggu Simpan", "bg-blue-50 text-blue-700"] : status === "cancelled" ? ["Dibatalkan", "bg-slate-100 text-slate-600"] : status === "expired" ? ["Kedaluwarsa", "bg-amber-50 text-amber-700"] : status === "failed" ? ["Gagal", "bg-red-50 text-red-700"] : ["Diproses", "bg-blue-50 text-blue-700"];
  return <span className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold ${config[1]}`}>{status === "completed" ? <CheckCircle2 className="size-3.5" /> : <Clock className="size-3.5" />}{config[0]}</span>;
}

function HistoryModal({ entry, rows, virtualizer, page, totalPages, pageSize, start, onPageChange, onPageSizeChange, onClose, onDownload }: { entry: ImportHistoryEntry; rows: NonNullable<ImportHistoryEntry["rows"]>; virtualizer: ReturnType<typeof useRowVirtualizer<HTMLDivElement>>; page: number; totalPages: number; pageSize: number; start: number; onPageChange: (page: number) => void; onPageSizeChange: (size: number) => void; onClose: () => void; onDownload: () => void }) {
  const allRows = entry.rows ?? [];
  const columns = allRows[0] ? Object.keys(allRows[0].data) : [];
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4" onClick={onClose}><div className="flex max-h-[88vh] w-full max-w-6xl flex-col rounded-[24px] bg-white p-6 shadow-xl sm:p-8" onClick={(event) => event.stopPropagation()}><div className="mb-4 flex items-start justify-between border-b border-slate-100 pb-4"><div><h3 className="text-lg font-bold text-slate-900">{shortBatchId(entry.id)} — {sourceLabel(entry)}</h3><p className="text-sm text-slate-500">{formatDateTime(entry.createdAt)} • {entry.fileName} • {entry.totalRows.toLocaleString("id-ID")} baris</p></div><button onClick={onClose} className="flex size-8 items-center justify-center rounded-full bg-slate-100"><X className="size-4" /></button></div><div className="mb-3 flex items-center justify-end gap-2"><span className="text-xs font-semibold text-slate-500">Tampilkan</span><select value={pageSize} onChange={(event) => onPageSizeChange(Number(event.target.value))} className="rounded-xl border border-slate-200 px-3 py-1.5 text-sm font-semibold">{[10, 20, 50, 100].map((value) => <option key={value} value={value}>{value}</option>)}<option value={allRows.length || 1}>Semua</option></select></div><div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-slate-200"><div ref={virtualizer.containerRef} className="max-h-[54vh] overflow-auto"><table className="w-full whitespace-nowrap text-left text-sm"><thead className="sticky top-0 z-10 bg-slate-50"><tr>{columns.map((column) => <th key={column} className="border-b border-slate-200 p-3 text-slate-500">{column}</th>)}</tr></thead><tbody>{virtualizer.topSpacer > 0 && <tr style={{ height: virtualizer.topSpacer }}><td colSpan={columns.length} /></tr>}{rows.map((row) => <tr key={row.rowId ?? row.rowNumber} className="border-b border-slate-100">{columns.map((column) => <PreviewCell key={column} column={column} row={row} />)}</tr>)}{virtualizer.bottomSpacer > 0 && <tr style={{ height: virtualizer.bottomSpacer }}><td colSpan={columns.length} /></tr>}</tbody></table>{allRows.length === 0 && <div className="p-8 text-center text-sm text-slate-500">Tidak ada baris pada riwayat ini.</div>}</div>{totalPages > 1 && <Pagination page={page} totalPages={totalPages} start={start} pageSize={pageSize} totalRows={allRows.length} onChange={onPageChange} />}</div><div className="mt-4 flex justify-end gap-3 border-t border-slate-100 pt-4"><button onClick={onClose} className="rounded-xl px-5 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-100">Tutup</button><button onClick={onDownload} className="inline-flex items-center gap-2 rounded-xl bg-brand-red px-5 py-2.5 text-sm font-bold text-white"><Download className="size-4" /> Download CSV</button></div></div></div>;
}

function SuccessModal({ result, onClose }: { result: ImportCommitResponse; onClose: () => void }) {
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"><div className="w-full max-w-md rounded-[24px] bg-white p-8 text-center shadow-xl"><div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600"><CheckCircle2 className="size-9" /></div><h3 className="text-lg font-bold text-slate-900">Import selesai</h3><p className="mt-2 text-sm text-slate-500">{result.message}</p><div className="mt-5 grid grid-cols-3 gap-2 text-left"><SummaryBox label="Tersimpan" value={result.importedRows} tone="emerald" /><SummaryBox label="Review" value={result.reviewRows} tone="amber" /><SummaryBox label="Gagal" value={result.failedRows} tone="red" /></div><button onClick={onClose} className="mt-6 w-full rounded-xl bg-brand-red px-4 py-2.5 text-sm font-bold text-white">Selesai</button></div></div>;
}

function LoadingPanel({ label, compact = false }: { label: string; compact?: boolean }) {
  return <div className={`flex items-center justify-center gap-3 text-sm font-semibold text-slate-500 ${compact ? "py-8" : "rounded-2xl bg-white p-12 shadow-sm"}`}><Loader2 className="size-5 animate-spin text-brand-red" />{label}</div>;
}

function sourceLabel(entry: ImportHistoryEntry): string {
  return `${PLATFORM_LABEL[entry.platform]} • ${entry.importType === "ads" ? `ADV: ${entry.advName ?? "-"}` : `Toko: ${entry.storeName ?? "-"}`}`;
}

function shortBatchId(id: string): string {
  return `IMP-${id.replace(/-/g, "").slice(0, 8).toUpperCase()}`;
}

function formatDateTime(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function errorMessageOf(error: unknown): string {
  return error instanceof Error ? error.message : "Terjadi kesalahan. Silakan coba lagi.";
}

function downloadCsv(filename: string, rows: Array<Record<string, string | number | null>>) {
  if (rows.length === 0) return;
  const headers = Object.keys(rows[0]!);
  const escape = (value: unknown) => {
    const text = String(value ?? "");
    return /[",\n;]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  const csv = `\uFEFF${[headers.map(escape).join(","), ...rows.map((row) => headers.map((header) => escape(row[header])).join(","))].join("\r\n")}`;
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
