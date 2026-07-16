"use client";

import { FormEvent, useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Loader2, Search, ShieldCheck } from "lucide-react";
import type { AdminInputerResult, ImportOptionsByPlatform } from "@/server/modules/marketing/import/import.types";
import { formatRupiah } from "@/components/module-center/format";
import { ImportApiError, saveAdminInputer, searchAdminInputer } from "./importApi";

interface Props { options: ImportOptionsByPlatform }
type Draft = AdminInputerResult["customer"];

export function AdminInputerPanel({ options }: Props) {
  const [platform, setPlatform] = useState<"tiktok" | "shopee">("tiktok");
  const [storeId, setStoreId] = useState("");
  const [orderId, setOrderId] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [result, setResult] = useState<AdminInputerResult | null>(null);
  const [draft, setDraft] = useState<Draft>({ name: "", phone: "", address: "", city: "", province: "" });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [candidates, setCandidates] = useState<AdminInputerResult["phoneCandidates"]>([]);

  const stores = options[platform].stores;
  useEffect(() => { setStoreId(""); setResult(null); }, [platform]);

  const search = async (event: FormEvent) => {
    event.preventDefault(); setLoading(true); setError(""); setSuccess(""); setCandidates([]);
    try {
      const data = await searchAdminInputer({ platform, storeId, orderId: orderId.trim() || undefined, trackingNumber: orderId.trim() ? undefined : trackingNumber.trim() || undefined });
      setResult(data); setDraft(data.customer);
    } catch (reason) { setResult(null); setError(reason instanceof Error ? reason.message : "Pesanan gagal dicari."); }
    finally { setLoading(false); }
  };

  const save = async (acknowledgeDuplicatePhone = false) => {
    if (!result || !window.confirm("Yakin data sudah valid? Silakan cek ulang sebelum menyimpan.")) return;
    setSaving(true); setError(""); setSuccess("");
    try {
      const updated = await saveAdminInputer({ orderId: result.orderId, customerId: result.customerId, customerVersion: result.customerVersion, ...draft, acknowledgeDuplicatePhone });
      setResult((current) => current ? { ...current, customer: { name: updated.name, phone: updated.phone, address: updated.address, city: updated.city, province: updated.province }, customerVersion: updated.customerVersion } : current);
      setDraft({ name: updated.name, phone: updated.phone, address: updated.address, city: updated.city, province: updated.province });
      setCandidates([]); setSuccess("Identitas pelanggan berhasil dilengkapi dan dicatat pada riwayat perubahan.");
    } catch (reason) {
      if (reason instanceof ImportApiError && reason.candidates?.length) setCandidates(reason.candidates);
      setError(reason instanceof Error ? reason.message : "Data gagal disimpan.");
    } finally { setSaving(false); }
  };

  return <div className="flex flex-col gap-5">
    <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-5"><h2 className="text-xl font-black text-slate-900">Cari Pesanan Marketplace</h2><p className="mt-1 text-sm font-medium text-slate-500">Cari pesanan yang sudah diimport. ID Pesanan menjadi pencarian utama, resi menjadi alternatif.</p></div>
      <form onSubmit={search} className="grid gap-4 lg:grid-cols-5">
        <Field label="Platform"><select value={platform} onChange={(e) => setPlatform(e.target.value as typeof platform)} className={control}><option value="tiktok">TikTok Shop</option><option value="shopee">Shopee</option></select></Field>
        <Field label="Toko"><select required value={storeId} onChange={(e) => setStoreId(e.target.value)} className={control}><option value="">Pilih toko</option>{stores.map((store) => <option key={store.id} value={store.id}>{store.label}</option>)}</select></Field>
        <Field label="ID Pesanan"><input value={orderId} onChange={(e) => setOrderId(e.target.value)} placeholder="ID Pesanan exact" className={control} /></Field>
        <Field label="Nomor Resi (alternatif)"><input value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} disabled={Boolean(orderId.trim())} placeholder="Dipakai jika ID kosong" className={control} /></Field>
        <div className="flex items-end"><button disabled={loading || !storeId || (!orderId.trim() && !trackingNumber.trim())} className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand-red px-4 text-sm font-bold text-white disabled:opacity-50">{loading ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />} Cari Pesanan</button></div>
      </form>
    </div>

    {error && <Message tone="red"><AlertCircle className="size-4 shrink-0" />{error}</Message>}
    {success && <Message tone="green"><CheckCircle2 className="size-4 shrink-0" />{success}</Message>}

    {result && <>
      <div className="grid gap-5 xl:grid-cols-[1.2fr_1fr]">
        <section className="rounded-[24px] bg-white p-6 shadow-sm"><h3 className="text-lg font-black text-slate-900">Data Pesanan — Hanya Lihat</h3><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3"><Read label="ID Pesanan" value={result.orderId} /><Read label="Tanggal" value={result.orderDate ?? "-"} /><Read label="Platform / Toko" value={`${result.platform === "tiktok" ? "TikTok Shop" : "Shopee"} / ${result.storeName}`} /><Read label="Resi" value={result.trackingNumber ?? "-"} /><Read label="Status Pesanan" value={result.orderStatus ?? "-"} /><Read label="Status Paket" value={result.packageStatus ?? "-"} /><Read label="Metode Bayar" value={result.paymentMethod ?? "-"} /><Read label="Kurir" value={result.courier ?? "-"} /><Read label="Total Belanja" value={result.totalAmount === null ? "-" : formatRupiah(result.totalAmount)} /></div></section>
        <section className="rounded-[24px] border border-brand-red/15 bg-white p-6 shadow-sm"><div className="flex items-start gap-3"><div className="grid size-10 place-items-center rounded-xl bg-brand-red/10 text-brand-red"><ShieldCheck className="size-5" /></div><div><h3 className="text-lg font-black text-slate-900">Lengkapi Identitas Pelanggan</h3><p className="text-xs font-semibold text-slate-500">Hanya identitas yang dapat diubah. Data transaksi dan uang tetap terkunci.</p></div></div><div className="mt-5 grid gap-4 sm:grid-cols-2">{([['name','Nama'],['phone','Nomor WA'],['address','Alamat'],['city','Kota/Kabupaten'],['province','Provinsi']] as const).map(([key,label]) => <Field key={key} label={label} wide={key === "address"}><input required={key === "name" || key === "phone" || key === "address"} value={draft[key]} onChange={(e) => setDraft((current) => ({ ...current, [key]: e.target.value }))} className={control} /></Field>)}</div><div className="mt-5 rounded-xl bg-slate-50 p-3 text-xs font-semibold text-slate-600">Perubahan berlaku pada pelanggan <strong>{result.customerId}</strong> dan akan tercatat pada riwayat.</div><button type="button" onClick={() => void save(false)} disabled={saving} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-red px-4 py-3 text-sm font-bold text-white disabled:opacity-50">{saving ? <Loader2 className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />} Simpan Perbaikan Identitas</button></section>
      </div>
      <section className="rounded-[24px] bg-white p-6 shadow-sm"><h3 className="text-lg font-black text-slate-900">Rincian Produk — Hanya Lihat</h3><div className="mt-4 overflow-x-auto"><table className="w-full whitespace-nowrap text-left text-sm"><thead><tr className="border-b border-slate-200 text-slate-500"><th className="pb-3 pr-4">Produk</th><th className="pb-3 pr-4 text-right">Qty</th><th className="pb-3 pr-4 text-right">Harga</th><th className="pb-3 text-right">Subtotal</th></tr></thead><tbody>{result.items.map((item,index) => <tr key={`${item.productId}-${index}`} className="border-b border-slate-100"><td className="py-3 pr-4 font-bold text-slate-800">{item.productName}</td><td className="py-3 pr-4 text-right">{item.quantity ?? "-"}</td><td className="py-3 pr-4 text-right">{item.unitPrice === null ? "-" : formatRupiah(item.unitPrice)}</td><td className="py-3 text-right">{item.subtotal === null ? "-" : formatRupiah(item.subtotal)}</td></tr>)}</tbody></table></div></section>
    </>}

    {candidates.length > 0 && <div className="rounded-[24px] border border-amber-200 bg-amber-50 p-5"><h3 className="font-black text-amber-900">Potensi pelanggan yang sama</h3><p className="mt-1 text-sm font-medium text-amber-800">Nomor WA sudah terhubung ke pelanggan lain. Sistem tidak akan menggabungkan secara otomatis.</p><ul className="mt-3 space-y-1 text-sm font-semibold text-amber-900">{candidates.map((candidate) => <li key={candidate.customerId}>{candidate.customerId} — {candidate.name} ({candidate.transactionCount} transaksi)</li>)}</ul><div className="mt-4 flex gap-2"><button onClick={() => setCandidates([])} className="rounded-xl border border-amber-300 px-4 py-2 text-sm font-bold text-amber-900">Batal</button><button onClick={() => void save(true)} className="rounded-xl bg-amber-700 px-4 py-2 text-sm font-bold text-white">Tetap Simpan Tanpa Menggabungkan</button></div></div>}
  </div>;
}

const control = "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none focus:border-brand-red/40 focus:ring-4 focus:ring-brand-red/10 disabled:bg-slate-100";
function Field({ label, children, wide }: { label: string; children: React.ReactNode; wide?: boolean }) { return <label className={`flex flex-col gap-1.5 ${wide ? "sm:col-span-2" : ""}`}><span className="text-xs font-black uppercase tracking-[0.06em] text-slate-500">{label}</span>{children}</label>; }
function Read({ label, value }: { label: string; value: string }) { return <div className="rounded-xl bg-slate-50 p-3"><p className="text-[11px] font-black uppercase tracking-wider text-slate-400">{label}</p><p className="mt-1 break-words text-sm font-bold text-slate-800">{value}</p></div>; }
function Message({ tone, children }: { tone: "red" | "green"; children: React.ReactNode }) { return <div className={`flex items-start gap-2 rounded-xl border px-4 py-3 text-sm font-semibold ${tone === "red" ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>{children}</div>; }
