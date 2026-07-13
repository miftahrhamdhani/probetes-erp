import { LoaderCircle, RotateCcw } from "lucide-react";
import type { ReactNode } from "react";

interface SourceSummary { total_order: number; revenue: number; product_sold: number; unique_customer: number; aov: number | null; top_products: SourceProduct[] }
interface SourceChannel { channel_id: string; channel_name: string; platform: string; total_order: number; revenue: number; product_sold: number; unique_customer: number; aov: number | null }
interface SourceDivision { divisi: string; total_order: number; revenue: number; product_sold: number; unique_customer: number; aov: number | null }
interface SourceProduct { product_id: string | null; product_name: string; product_sold: number; revenue: number }
interface SourceTrend { date: string; total_order: number; revenue: number; unique_customer: number }
interface SourceOrder { order_id: string; order_date: string; customer_name: string; channel_name: string; divisi: string; cs_name: string; total_amount: number }

const rupiah = (value: number | null | undefined) => value === null || value === undefined || !Number.isFinite(value) ? "—" : new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);
const number = (value: number | null | undefined) => value === null || value === undefined || !Number.isFinite(value) ? "—" : new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(value);

export function SourcePerformanceTab({ summary, channels, divisions, trend, orders, loading, error, title, onChannel, onDivision, onProduct, onReset }: {
  summary: SourceSummary | null; channels: SourceChannel[]; divisions: SourceDivision[]; trend: SourceTrend[]; orders: SourceOrder[];
  loading: boolean; error: string | null; title: string | null; onChannel: (row: SourceChannel) => void; onDivision: (row: SourceDivision) => void; onProduct: (row: SourceProduct) => void; onReset: () => void;
}) {
  const maxRevenue = Math.max(1, ...trend.map((row) => row.revenue));
  if (loading && !summary) return <div className="flex items-center justify-center gap-2 rounded-2xl bg-white p-12 text-sm font-bold text-slate-400"><LoaderCircle className="size-5 animate-spin" />Memuat performa sumber...</div>;
  if (error) return <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div>;
  if (!summary || !summary.total_order) return <div className="rounded-2xl bg-white p-10 text-center shadow-sm"><h2 className="font-black text-slate-700">Belum ada pesanan valid</h2><p className="mt-1 text-sm text-slate-500">Tidak ada pesanan valid pada rentang tanggal yang dipilih.</p></div>;

  return <>
    <p className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-800">Source Performance membaca pesanan ERP valid berdasarkan channel dan divisi. Ini bukan atribusi iklan atau ROAS ERP.</p>
    <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
      <Kpi label="Total Pesanan" value={number(summary.total_order)} /><Kpi label="Pendapatan Pesanan" value={rupiah(summary.revenue)} /><Kpi label="Produk Terjual" value={number(summary.product_sold)} /><Kpi label="Pelanggan Unik" value={number(summary.unique_customer)} /><Kpi label="Rata-rata Pesanan" value={rupiah(summary.aov)} />
    </section>
    <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      <Card title="Tren Pendapatan Pesanan"><div className="space-y-3">{trend.map((row) => <button key={row.date} onClick={onReset} className="grid w-full grid-cols-[85px_1fr_88px] items-center gap-2 text-left text-xs"><span className="font-semibold text-slate-500">{row.date}</span><span className="h-6 overflow-hidden rounded bg-slate-100"><span className="block h-full rounded bg-brand-red" style={{ width: `${Math.max(2, row.revenue / maxRevenue * 100)}%` }} /></span><span className="text-right font-bold">{rupiah(row.revenue)}</span></button>)}</div></Card>
      <Card title="Produk Terlaris"><div className="space-y-2">{summary.top_products.map((row) => <button key={row.product_id ?? row.product_name} onClick={() => onProduct(row)} disabled={!row.product_id} className="flex w-full items-center justify-between gap-3 rounded-lg px-2 py-2 text-left text-sm transition hover:bg-brand-red/5 disabled:cursor-default disabled:hover:bg-transparent"><span className="font-bold text-slate-700">{row.product_name}</span><span className="text-right text-xs"><b>{number(row.product_sold)} qty</b><br />{rupiah(row.revenue)}</span></button>)}</div></Card>
    </section>
    <section className="grid grid-cols-1 gap-4 xl:grid-cols-2"><Card title="Performa Channel"><SourceTable rows={channels} label="Channel" name={(row) => `${row.channel_name} · ${row.platform}`} onClick={onChannel} /><Card title="Performa Divisi"><SourceTable rows={divisions} label="Divisi" name={(row) => row.divisi} onClick={onDivision} /></Card></section>
    <Card title={title ?? "Daftar Pesanan Valid"} action={title ? <button onClick={onReset} className="inline-flex items-center gap-1 text-xs font-bold text-brand-red"><RotateCcw className="size-3.5" />Semua pesanan</button> : undefined}><OrderTable rows={orders} /></Card>
  </>;
}

function Kpi({ label, value }: { label: string; value: string }) { return <div className="rounded-2xl bg-white p-4 shadow-sm"><p className="text-xs font-bold uppercase tracking-wide text-slate-400">{label}</p><p className="mt-3 text-2xl font-black text-slate-800">{value}</p></div>; }
function Card({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) { return <section className="rounded-2xl bg-white p-5 shadow-sm"><div className="mb-4 flex items-center justify-between gap-3"><h2 className="font-black text-slate-800">{title}</h2>{action}</div>{children}</section>; }
function SourceTable<T extends { total_order: number; revenue: number; product_sold: number; aov: number | null }>({ rows, label, name, onClick }: { rows: T[]; label: string; name: (row: T) => string; onClick: (row: T) => void }) { if (!rows.length) return <p className="py-8 text-center text-sm font-semibold text-slate-400">Belum ada data pada rentang tanggal ini.</p>; return <div className="overflow-x-auto"><table className="w-full min-w-[590px] text-left text-sm"><thead><tr className="border-b text-xs uppercase text-slate-400"><th className="pb-3">{label}</th><th className="text-right">Pesanan</th><th className="text-right">Pendapatan</th><th className="text-right">Qty</th><th className="text-right">Rata-rata</th></tr></thead><tbody>{rows.map((row) => <tr key={name(row)} onClick={() => onClick(row)} className="cursor-pointer border-b border-slate-50 hover:bg-brand-red/5"><td className="py-3 font-bold">{name(row)}</td><td className="text-right">{number(row.total_order)}</td><td className="text-right">{rupiah(row.revenue)}</td><td className="text-right">{number(row.product_sold)}</td><td className="text-right">{rupiah(row.aov)}</td></tr>)}</tbody></table></div>; }
function OrderTable({ rows }: { rows: SourceOrder[] }) { if (!rows.length) return <p className="py-8 text-center text-sm font-semibold text-slate-400">Tidak ada pesanan untuk filter ini.</p>; return <div className="overflow-x-auto"><table className="w-full min-w-[850px] text-left text-sm"><thead><tr className="border-b text-xs uppercase text-slate-400"><th className="pb-3">Tanggal</th><th>Pesanan</th><th>Pelanggan</th><th>Channel</th><th>Divisi</th><th>CS</th><th className="text-right">Total</th></tr></thead><tbody>{rows.map((row) => <tr key={row.order_id} className="border-b border-slate-50"><td className="py-3">{row.order_date}</td><td className="font-bold">{row.order_id}</td><td>{row.customer_name}</td><td>{row.channel_name}</td><td>{row.divisi}</td><td>{row.cs_name}</td><td className="text-right">{rupiah(row.total_amount)}</td></tr>)}</tbody></table></div>; }
