"use client";

import { BarChart3, PieChart, TrendingUp } from "lucide-react";

export type CsCrmTabKey = "retention" | "frequency" | "cluster";

const TABS: { key: CsCrmTabKey; label: string; icon: typeof TrendingUp }[] = [
  { key: "retention", label: "Retention", icon: TrendingUp },
  { key: "frequency", label: "Frequency", icon: BarChart3 },
  { key: "cluster", label: "Cluster", icon: PieChart },
];

export function CsCrmTabs({ active, onChange }: { active: CsCrmTabKey; onChange: (key: CsCrmTabKey) => void }) {
  return (
    <div className="inline-flex gap-1 rounded-[16px] bg-white p-1.5 shadow-sm">
      {TABS.map((tab) => {
        const isActive = tab.key === active;
        const Icon = tab.icon;
        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-xl border-b-2 px-4 py-2 text-sm font-bold transition ${
              isActive ? "border-brand-red text-brand-red" : "border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-800"
            }`}
          >
            <Icon className="size-4" strokeWidth={2.2} />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
