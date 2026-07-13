"use client";
import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { CheckCircle2, Download, FileSpreadsheet, RotateCcw, Upload, X } from "lucide-react";
import { DummyBanner } from "@/features/marketing/components/DummyBanner";
import { MarketingBackButton } from "@/features/marketing/components/MarketingBackButton";
import { getCrmImportSummary } from "./lib/crmService";
import { CrmCard, CrmPageHeader, CrmPageShell } from "./components/CrmUi";
import type { CrmImportSummary, CrmImportType } from "./types/crmTypes";

const types: CrmImportType[] = ["Closingan CRM", "Masuk Grup", "Follow-up", "Status Grup"];

function sampleRows() {
  return [
    { Tanggal: "2026-07-13", "Nama Customer": "Siti Rahma", "No WA": "081234567890", Produk: "Probetes Herbal", Qty: "2", "Total Bayar": "580000", "CS/CRM": "Rista", "Status Grup": "Sudah Masuk", Catatan: "Follow-up 7 hari" },
    { Tanggal: "2026-07-13", "Nama Customer": "Budi Santoso", "No WA": "085712312312", Produk: "Ebook 145", Qty: "1", "Total Bayar": "145000", "CS/CRM": "Nadia", "Status Grup": "Belum Masuk", Catatan: "Invite grup" }
  ];
}

export function CrmImportPage() {
  const [kind, setKind] = useState<CrmImportType>("Closingan CRM");
  const [method, setMethod] = useState<"file" | "manual">("file");
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [summary, setSummary] = useState<CrmImportSummary | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getCrmImportSummary().then(setSummary);
  }, []);

  const preview = (selected: File) => {
    setFile(selected);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const workbook = XLSX.read(event.target?.result, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]!];
        const parsed = XLSX.utils.sheet_to_json<Record<string, string>>(sheet!, { defval: "" });
        setRows(parsed.length ? parsed : sampleRows());
      } catch {
        setRows(sampleRows());
      }
    };
    reader.readAsArrayBuffer(selected);
  };

  const reset = () => {
    setRows([]);
    setFile(null);
    setSaved(false);
  };

  const handleManualSubmit = () => {
    setFile(new File([], "input_manual.csv"));
    setRows(sampleRows());
  };

  const valid = rows.filter((row) => row["Nama Customer"] || row.Customer || row.Nama).length;

  return (
    <CrmPageShell>
      <DummyBanner />
      <CrmPageHeader 
        title="Import / Input CRM" 
        subtitle="Import atau input data CRM secara manual untuk closingan, masuk grup, follow-up, atau status grup." 
      />
      
      <CrmCard title="Pengaturan Input">
        <div className="mb-5 flex flex-col gap-2">
          <span className="text-xs font-bold text-slate-500">Data yang akan di-input</span>
          <div className="flex flex-wrap gap-2">
            {types.map((item) => (
              <button 
                key={item} 
                onClick={() => { setKind(item); reset(); }} 
                className={`rounded-xl px-4 py-2.5 text-sm font-bold transition-colors ${kind === item ? "bg-brand-red text-white" : "border border-slate-200 bg-white text-slate-600 hover:border-brand-red/50 hover:bg-brand-red/5"}`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold text-slate-500">Metode Input</span>
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => { setMethod("file"); reset(); }} 
              className={`rounded-xl px-4 py-2.5 text-sm font-bold transition-colors ${method === "file" ? "bg-slate-800 text-white" : "border border-slate-200 bg-white text-slate-600 hover:border-slate-800/50 hover:bg-slate-50"}`}
            >
              Upload File (Excel/CSV)
            </button>
            <button 
              onClick={() => { setMethod("manual"); reset(); }} 
              className={`rounded-xl px-4 py-2.5 text-sm font-bold transition-colors ${method === "manual" ? "bg-slate-800 text-white" : "border border-slate-200 bg-white text-slate-600 hover:border-slate-800/50 hover:bg-slate-50"}`}
            >
              Isi Manual (Satu Per Satu)
            </button>
          </div>
        </div>
      </CrmCard>

      {!file && method === "file" && (
        <CrmCard title="Upload File">
          <label className="relative flex min-h-52 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center transition hover:border-brand-red hover:bg-brand-red/5">
            <input onChange={(event) => event.target.files?.[0] && preview(event.target.files[0])} className="absolute inset-0 cursor-pointer opacity-0" type="file" accept=".csv,.xls,.xlsx" />
            <Upload className="size-10 text-slate-400" />
            <p className="mt-3 font-extrabold text-slate-700">Tarik & lepas file CSV / Excel di sini</p>
            <p className="mt-1 text-sm text-slate-500">Mendukung .csv, .xls, .xlsx</p>
            <span className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-bold text-brand-red shadow-sm"><Download className="size-4" />Download Template</span>
          </label>
        </CrmCard>
      )}

      {!file && method === "manual" && (
        <CrmCard title={`Form Input: ${kind}`}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-bold text-slate-500">Nama Customer</label>
              <input type="text" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red" placeholder="Contoh: Budi Santoso" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-slate-500">No WhatsApp</label>
              <input type="text" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red" placeholder="Contoh: 0812345..." />
            </div>
            {kind === "Closingan CRM" && (
              <>
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-500">ID Pesanan</label>
                  <input type="text" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red" placeholder="Contoh: ORD-12345" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-500">Nomor Resi</label>
                  <input type="text" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red" placeholder="Contoh: JX123456789" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-500">Produk</label>
                  <input type="text" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red" placeholder="Contoh: Paket Probetes Herbal" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-500">Quantity (Qty)</label>
                  <input type="number" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red" placeholder="Contoh: 1" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-500">Total Bayar (Rp)</label>
                  <input type="number" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red" placeholder="Contoh: 580000" />
                </div>
              </>
            )}
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-bold text-slate-500">Catatan Tambahan (Opsional)</label>
              <textarea className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red" rows={3} placeholder="Tuliskan catatan khusus atau keterangan followup..." />
            </div>
          </div>
          <div className="mt-5 flex justify-end">
            <button onClick={handleManualSubmit} className="inline-flex items-center gap-2 rounded-xl bg-brand-red px-6 py-3 text-sm font-bold text-white shadow-md hover:bg-red-700 transition">
              <CheckCircle2 className="size-4" />
              Preview Data Input
            </button>
          </div>
        </CrmCard>
      )}

      {file && (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <CrmCard title={method === "file" ? "Ringkasan File" : "Ringkasan Input"}>
              <p className="font-bold text-slate-800">{method === "file" ? file.name : "Input Manual (Form)"}</p>
              <p className="mt-1 text-sm text-slate-500">{method === "file" ? `${(file.size / 1024).toFixed(1)} KB · ` : "1 antrean input · "}{rows.length} baris total</p>
            </CrmCard>
            <CrmCard title="Validasi Import">
              <p className="text-sm font-bold text-emerald-600">Valid: {valid}</p>
              <p className="mt-1 text-sm font-bold text-amber-600">Review: {Math.max(0, rows.length - valid)}</p>
              <p className="mt-1 text-sm font-bold text-red-600">Error: 0</p>
            </CrmCard>
            <CrmCard title="Status Data">
              <p className="text-sm font-bold text-slate-700">Jenis: {kind}</p>
              <p className="mt-1 text-sm text-slate-500">Preview wajib dicek sebelum simpan.</p>
            </CrmCard>
          </div>
          
          {method === "file" && (
            <CrmCard title="Mapping Kolom">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-xs font-bold uppercase text-slate-400">
                      <th className="py-2">Kolom File</th>
                      <th>Field Sistem</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary?.mapping.map((map) => (
                      <tr key={map.file} className="border-b border-slate-50">
                        <td className="py-3 font-bold">{map.file}</td>
                        <td>{map.system}</td>
                        <td><span className={map.status === "Cocok" ? "text-emerald-600" : "text-amber-600"}>{map.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CrmCard>
          )}
          
          <CrmCard title="Preview Data">
            <div className="max-h-[420px] overflow-auto">
              <table className="w-full whitespace-nowrap text-left text-sm">
                <thead className="sticky top-0 bg-slate-50">
                  <tr>
                    {Object.keys(rows[0] ?? {}).map((key) => (
                      <th key={key} className="border-b px-3 py-3 text-xs font-bold text-slate-500">{key}</th>
                    ))}
                    <th className="border-b px-3 py-3 text-xs font-bold text-slate-500">Status Validasi</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(0, 100).map((row, index) => (
                    <tr key={index} className="border-b border-slate-50">
                      {Object.keys(rows[0] ?? {}).map((key) => (
                        <td key={key} className="px-3 py-3">{row[key] || "-"}</td>
                      ))}
                      <td className="px-3 py-3">
                        <span className="rounded bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700">Valid</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CrmCard>
          
          <div className="flex flex-col justify-end gap-3 sm:flex-row">
            <button onClick={reset} className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-slate-500 hover:bg-slate-100 transition">
              <X className="size-4" />Cancel
            </button>
            <button onClick={reset} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition">
              <RotateCcw className="size-4" />{method === "file" ? "Upload Ulang" : "Edit Ulang"}
            </button>
            <button onClick={() => setSaved(true)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-red px-6 py-3 text-sm font-bold text-white shadow-md hover:bg-red-700 transition">
              <CheckCircle2 className="size-4" />Simpan ke Database
            </button>
          </div>
        </>
      )}

      {saved && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-7 text-center shadow-xl">
            <CheckCircle2 className="mx-auto size-12 text-emerald-500" />
            <h2 className="mt-4 text-xl font-black">Data siap disimpan</h2>
            <p className="mt-2 text-sm text-slate-500">Tahap frontend: penyimpanan masih simulasi. Data final akan memakai API CRM.</p>
            <button onClick={reset} className="mt-5 w-full rounded-xl bg-brand-red px-5 py-2.5 text-sm font-bold text-white hover:bg-red-700 transition">Selesai</button>
          </div>
        </div>
      )}
      
      <div className="mt-4">
        <MarketingBackButton href="/marketing/crm" label="Kembali ke CRM" />
      </div>
    </CrmPageShell>
  );
}
