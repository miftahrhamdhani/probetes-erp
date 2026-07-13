"use client";

import { LayoutGrid, Megaphone, ShieldAlert, Store, UserCog } from "lucide-react";
import { TikTokLogo, ShopeeLogo, MetaLogo } from "@/features/marketing/components/BrandLogos";

export type AdsRoasTabKey = "overview" | "tiktok" | "shopee" | "meta" | "adv" | "campaign" | "toko" | "review";

const TABS: { key: AdsRoasTabKey; label: string }[] = [
  { key: "overview", label: "Overview Semua Platform" },
  { key: "tiktok", label: "TikTok" },
  { key: "shopee", label: "Shopee" },
  { key: "meta", label: "Meta Ads" },
  { key: "adv", label: "Performa ADV" },
  { key: "campaign", label: "Performa Campaign" },
  { key: "toko", label: "Performa Toko" },
  { key: "review", label: "Data Review" },
];

function TabIcon({ tabKey }: { tabKey: AdsRoasTabKey }) {
  switch (tabKey) {
    case "overview": return <LayoutGrid className="size-4" strokeWidth={2.2} />;
    case "tiktok": return <TikTokLogo className="size-4" />;
    case "shopee": return <ShopeeLogo className="size-4 text-[#EE4D2D]" />;
    case "meta": return <MetaLogo className="size-4 text-blue-600" />;
    case "adv": return <UserCog className="size-4" strokeWidth={2.2} />;
    case "campaign": return <Megaphone className="size-4" strokeWidth={2.2} />;
    case "toko": return <Store className="size-4" strokeWidth={2.2} />;
    case "review": return <ShieldAlert className="size-4" strokeWidth={2.2} />;
  }
}

/** Tab horizontal di bawah filter bar — tab aktif merah + underline merah, sesuai mockup. */
export function AdsRoasTabs({ active, onChange }: { active: AdsRoasTabKey; onChange: (key: AdsRoasTabKey) => void }) {
  return (
    <div className="flex gap-1 overflow-x-auto rounded-[16px] bg-white p-1.5 shadow-sm">
      {TABS.map((tab) => {
        const isActive = tab.key === active;
        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl border-b-2 px-3.5 py-2 text-sm font-bold transition ${
              isActive ? "border-brand-red text-brand-red" : "border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-800"
            }`}
          >
            <TabIcon tabKey={tab.key} />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
