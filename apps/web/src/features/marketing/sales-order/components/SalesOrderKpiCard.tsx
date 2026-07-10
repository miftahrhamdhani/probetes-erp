import {
  Award, Box, Boxes, Calendar, Check, CheckCircle2, Clock, Database, Filter as FilterIcon,
  Package, Percent, PieChart, Receipt, Repeat, RotateCcw, ShieldCheck, ShoppingBag, ShoppingCart,
  Store, Target, TrendingUp, Truck, TriangleAlert, UserPlus, Users, Wallet, XCircle,
  type LucideIcon,
} from "lucide-react";
import type { KpiItem } from "../types/salesOrder.types";
import { formatPersen } from "../lib/format";

const ICONS: Record<string, LucideIcon> = {
  wallet: Wallet, receipt: Receipt, box: Box, boxes: Boxes, cart: ShoppingCart, "user-plus": UserPlus,
  repeat: Repeat, award: Award, "shopping-bag": ShoppingBag, "pie-chart": PieChart, "rotate-ccw": RotateCcw,
  "trending-up": TrendingUp, store: Store, target: Target, users: Users, "check-circle": CheckCircle2,
  clock: Clock, truck: Truck, "x-circle": XCircle, "shield-check": ShieldCheck, percent: Percent,
  database: Database, "alert-triangle": TriangleAlert, filter: FilterIcon, calendar: Calendar, package: Package, check: Check,
};

const TONE_CLASS: Record<NonNullable<KpiItem["tone"]>, string> = {
  red: "border-brand-red/20 bg-white",
  green: "border-emerald-100 bg-white",
  amber: "border-amber-100 bg-white",
  blue: "border-blue-100 bg-white",
  purple: "border-purple-100 bg-white",
  slate: "border-slate-200 bg-white",
};

const ICON_TONE: Record<NonNullable<KpiItem["tone"]>, string> = {
  red: "bg-brand-red/10 text-brand-red",
  green: "bg-emerald-50 text-emerald-600",
  amber: "bg-amber-50 text-amber-600",
  blue: "bg-blue-50 text-blue-600",
  purple: "bg-purple-50 text-purple-600",
  slate: "bg-slate-100 text-slate-500",
};

export function SalesOrderKpiCard({ item, sparkColor }: { item: KpiItem; sparkColor?: string }) {
  const Icon = ICONS[item.icon] ?? Wallet;
  const tone = item.tone ?? "slate";
  const up = item.delta ? item.delta.pct >= 0 : true;
  const positive = item.delta ? (item.delta.goodWhenUp ? up : !up) : true;

  return (
    <div className={`rounded-[20px] border p-4 shadow-sm sm:p-5 ${TONE_CLASS[tone]}`}>
      <div className="flex items-start justify-between gap-2">
        <span className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${ICON_TONE[tone]}`}>
          <Icon className="size-4.5" strokeWidth={2.2} />
        </span>
      </div>
      <p className="mt-3 text-xs font-bold uppercase tracking-[0.04em] text-slate-400">{item.label}</p>
      <p className="mt-1 truncate text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl" title={item.value}>{item.value}</p>
      {item.delta && (
        <p className={`mt-1.5 inline-flex items-center gap-1 text-xs font-extrabold ${positive ? "text-emerald-600" : "text-red-600"}`}>
          {up ? "▲" : "▼"} {formatPersen(Math.abs(item.delta.pct), 1)}
          <span className="font-semibold text-slate-400">{item.caption ?? "vs periode lalu"}</span>
        </p>
      )}
      {!item.delta && item.caption && <p className="mt-1.5 text-xs font-semibold text-slate-400">{item.caption}</p>}
      <svg viewBox="0 0 100 16" className="mt-2 h-3 w-full" preserveAspectRatio="none">
        <path d="M0,10 C15,4 25,14 40,8 C55,3 65,12 80,6 C90,3 95,8 100,5" fill="none" stroke={sparkColor ?? (positive ? "#ef4444" : "#94a3b8")} strokeWidth="1.6" strokeLinecap="round" opacity="0.55" />
      </svg>
    </div>
  );
}
