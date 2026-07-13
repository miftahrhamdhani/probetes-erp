import {
  AlertCircle, AlertOctagon, AlertTriangle, Info, Receipt, Target, TrendingUp, Users, Wallet, type LucideIcon,
} from "lucide-react";
import type { AdsRoasKpi } from "../types/marketingAdsRoasTypes";

const ICONS: Record<string, LucideIcon> = {
  wallet: Wallet, cart: Receipt, target: Target, receipt: Receipt, "wallet-cards": Wallet,
  users: Users, "trending-up": TrendingUp, "alert-triangle": AlertTriangle, "alert-octagon": AlertOctagon,
  "alert-circle": AlertCircle, info: Info,
};

/** Kartu KPI Iklan & ROAS — icon merah dalam kotak pink muda, label kecil, angka besar,
 * indikator naik/turun hijau/merah, teks pembanding kecil. Persis gaya mockup. */
export function AdsRoasKpiCard({ item }: { item: AdsRoasKpi }) {
  const Icon = ICONS[item.icon] ?? Wallet;
  const hasDelta = !!item.delta;
  const up = item.delta ? item.delta.pct >= 0 : true;
  const positive = item.delta ? (item.delta.goodWhenUp ? up : !up) : true;

  return (
    <div className="rounded-[18px] border border-slate-100 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-red/10 text-brand-red">
          <Icon className="size-4.5" strokeWidth={2.2} />
        </span>
      </div>
      <p className="mt-3 text-xs font-bold text-slate-500">{item.label}</p>
      <p className="mt-1 truncate text-xl font-extrabold tracking-tight text-slate-900" title={item.value}>{item.value}</p>
      {hasDelta && (
        <p className={`mt-1 inline-flex items-center gap-1 text-xs font-extrabold ${positive ? "text-emerald-600" : "text-red-600"}`}>
          {up ? "▲" : "▼"} {Math.abs(item.delta!.pct).toLocaleString("id-ID", { maximumFractionDigits: 1 })}%
        </p>
      )}
      {item.caption && <p className="text-[11px] font-semibold text-slate-400">{item.caption}</p>}
    </div>
  );
}
