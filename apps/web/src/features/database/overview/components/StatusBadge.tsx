import { cn } from "@/lib/cn";
import type { StatusTone } from "../types/databaseOverview.types";

const exactTone: Record<string, StatusTone> = {
  Healthy: "green",
  Success: "green",
  Passed: "green",
  Approved: "green",
  Stable: "green",
  "On Track": "green",
  Watch: "amber",
  Warning: "amber",
  Review: "amber",
  "Needs Review": "amber",
  Pending: "amber",
  Assigned: "blue",
  Open: "blue",
  Critical: "red",
  Failed: "red",
  Blocked: "red",
  Rejected: "red",
  Bottleneck: "red",
};

const toneClass: Record<StatusTone, string> = {
  green: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  blue: "bg-blue-50 text-blue-700 ring-blue-100",
  amber: "bg-amber-50 text-amber-700 ring-amber-100",
  red: "bg-red-50 text-red-700 ring-red-100",
  slate: "bg-slate-100 text-slate-700 ring-slate-200",
  purple: "bg-purple-50 text-purple-700 ring-purple-100",
};

export function StatusBadge({ label, tone }: { label: string; tone?: StatusTone }) {
  return (
    <span className={cn("inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold ring-1", toneClass[tone ?? exactTone[label] ?? "slate"])}>
      {label}
    </span>
  );
}
