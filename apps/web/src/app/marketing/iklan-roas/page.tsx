"use client";

import { useMemo, useState, type ReactNode } from "react";
import { DummyBanner } from "@/features/marketing/components/DummyBanner";
import { MarketingBackButton } from "@/features/marketing/components/MarketingBackButton";
import { formatPersen, formatRupiahRingkas, formatRoas } from "@/features/marketing/lib/format";

type TabKey = "overview" | "platform" | "adv" | "campaign" | "toko" | "review";
type PlatformName = "TikTok" | "Shopee" | "Meta Ads";
type StatusName = "Scale" | "Bagus" | "Cek" | "Review" | "Stop";

type MarketingRow = {
  tanggal: string;
  date: string;
  platform: PlatformName;
  adv: string;
  toko: string;
  campaign: string;
  produk: string;
  spend: number;
  sales: number;
  order: number;
  leads: number;
  ctr: number;
  cpc: number;
};

type ReviewRow = {
  tipe: string;
  platform: PlatformName;
  masalah: string;
  dampak: string;
  aksi: string;
};

const tabs: { key: TabKey; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "platform", label: "Platform" },
  { key: "adv", label: "ADV" },
  { key: "campaign", label: "Campaign" },
  { key: "toko", label: "Toko" },
  { key: "review", label: "Data Review" },
];

// Dummy Probetes: angka diambil dari pola export Marketing Juni 2026 (Meta/Shopee/TikTok),
// belum masuk database dan belum dianggap laporan final Finance.
const rows: MarketingRow[] = [
  { tanggal: "01 Jun", date: "2026-06-01", platform: "Meta Ads", adv: "Adv Irfan", toko: "Akuisisi Skalev", campaign: "PRP TOF", produk: "Ebook 90 Hari Remisi", spend: 21_985_866, sales: 37_866_291, order: 360, leads: 487, ctr: 1.52, cpc: 2644 },
  { tanggal: "01 Jun", date: "2026-06-01", platform: "Meta Ads", adv: "Adv Irfan", toko: "Akuisisi Skalev", campaign: "BID CAP", produk: "Ebook 90 Hari Remisi", spend: 25_452_481, sales: 48_446_819, order: 467, leads: 634, ctr: 2.34, cpc: 1833 },
  { tanggal: "08 Jun", date: "2026-06-08", platform: "Meta Ads", adv: "Adv Irfan", toko: "Akuisisi Skalev", campaign: "PRP TOF - EXC", produk: "Ebook 90 Hari Remisi", spend: 10_484_921, sales: 14_501_695, order: 144, leads: 191, ctr: 1.63, cpc: 2527 },
  { tanggal: "15 Jun", date: "2026-06-15", platform: "Meta Ads", adv: "Adv Bagas", toko: "Akuisisi Skalev", campaign: "HP - ASC - IC", produk: "Probetes Herbal", spend: 12_247_672, sales: 18_046_305, order: 101, leads: 317, ctr: 2.14, cpc: 2745 },
  { tanggal: "20 Jun", date: "2026-06-20", platform: "Meta Ads", adv: "Adv Zidny", toko: "Akuisisi Skalev", campaign: "ZIDNY 81.500", produk: "Ebook 90 Hari Remisi", spend: 5_270_042, sales: 12_315_144, order: 106, leads: 148, ctr: 1.69, cpc: 2525 },

  { tanggal: "10 Jun", date: "2026-06-10", platform: "Shopee", adv: "Adv Bagas", toko: "Shopee Probetes", campaign: "GMV Max Probetes Herbal", produk: "Probetes Herbal 24 Kapsul", spend: 2_374_370, sales: 14_419_039, order: 83, leads: 0, ctr: 3.72, cpc: 3542 },
  { tanggal: "18 Jun", date: "2026-06-18", platform: "Shopee", adv: "Adv Bagas", toko: "Shopee Digital", campaign: "GMV Max Ebook Digital", produk: "Ebook 90 Hari Remisi", spend: 1_081_629, sales: 3_846_971, order: 42, leads: 0, ctr: 2.96, cpc: 4118 },
  { tanggal: "24 Jun", date: "2026-06-24", platform: "Shopee", adv: "Adv Fian", toko: "Shopee Probetes Makassar", campaign: "Iklan Produk Amandia", produk: "Amandia", spend: 3_850_000, sales: 12_900_000, order: 76, leads: 0, ctr: 3.18, cpc: 3980 },

  { tanggal: "05 Jun", date: "2026-06-05", platform: "TikTok", adv: "Adv Wahyu", toko: "TikTok Probetes", campaign: "GMV Max Probetes Herbal", produk: "Probetes Herbal 24 Kapsul", spend: 18_600_000, sales: 92_800_000, order: 318, leads: 0, ctr: 3.9, cpc: 2110 },
  { tanggal: "12 Jun", date: "2026-06-12", platform: "TikTok", adv: "Adv Wahyu", toko: "TikTok Probetes", campaign: "Video Edukasi Gula Darah", produk: "Probetes Herbal 24 Kapsul", spend: 11_400_000, sales: 47_600_000, order: 174, leads: 0, ctr: 4.2, cpc: 1960 },
  { tanggal: "19 Jun", date: "2026-06-19", platform: "TikTok", adv: "Adv Sari", toko: "TikTok Amandia", campaign: "Amandia Diabetes Konten Test", produk: "Amandia", spend: 7_900_000, sales: 24_200_000, order: 91, leads: 0, ctr: 2.8, cpc: 2880 },
  { tanggal: "25 Jun", date: "2026-06-25", platform: "TikTok", adv: "Adv Rian", toko: "TikTok Probetes Makassar", campaign: "NetSales Commission Reduction", produk: "Probetes Herbal 24 Kapsul", spend: 5_600_000, sales: 3_400_000, order: 18, leads: 0, ctr: 1.1, cpc: 5220 },
];

const reviewRows: ReviewRow[] = [
  { tipe: "Biaya Iklan", platform: "TikTok", masalah: "Sebagian baris auto-created tidak punya judul video", dampak: "Analisis materi iklan belum lengkap", aksi: "Pisahkan campaign auto dan video asli" },
  { tipe: "Data Pesanan", platform: "Shopee", masalah: "Toko berbeda format nama", dampak: "Laporan toko bisa terpecah", aksi: "Samakan nama toko" },
  { tipe: "Campaign", platform: "Meta Ads", masalah: "Beberapa campaign biaya iklan ada, pembelian kosong", dampak: "Efisiensi campaign jadi 0", aksi: "Review campaign dan tracking" },
  { tipe: "Produk", platform: "Shopee", masalah: "Nama produk terlalu panjang", dampak: "Ranking produk susah dibaca", aksi: "Mapping ke nama produk final" },
];

const roas = (sales: number, spend: number) => (spend > 0 ? sales / spend : 0);
const costPerOrder = (spend: number, order: number) => (order > 0 ? spend / order : 0);
const closingRate = (order: number, leads: number) => (leads > 0 ? (order / leads) * 100 : 0);

function statusFromRoas(value: number): { label: StatusName; tone: string } {
  if (value >= 4) return { label: "Scale", tone: "bg-emerald-100 text-emerald-800" };
  if (value >= 3) return { label: "Bagus", tone: "bg-blue-100 text-blue-800" };
  if (value >= 2) return { label: "Cek", tone: "bg-amber-100 text-amber-800" };
  if (value >= 1) return { label: "Review", tone: "bg-orange-100 text-orange-800" };
  return { label: "Stop", tone: "bg-red-100 text-red-800" };
}

function groupBy<T extends string>(items: MarketingRow[], key: (row: MarketingRow) => T) {
  const map = new Map<T, MarketingRow[]>();
  items.forEach((item) => map.set(key(item), [...(map.get(key(item)) ?? []), item]));
  return Array.from(map.entries()).map(([name, group]) => summarize(name, group));
}

function summarize(name: string, group: MarketingRow[]) {
  const spend = group.reduce((sum, row) => sum + row.spend, 0);
  const sales = group.reduce((sum, row) => sum + row.sales, 0);
  const order = group.reduce((sum, row) => sum + row.order, 0);
  const leads = group.reduce((sum, row) => sum + row.leads, 0);
  return { name, spend, sales, order, leads, roas: roas(sales, spend), cpo: costPerOrder(spend, order), closing: closingRate(order, leads), rows: group };
}

export default function AdsRoasPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [startDate, setStartDate] = useState("2026-06-01");
  const [endDate, setEndDate] = useState("2026-06-30");
  const [platform, setPlatform] = useState("Semua");
  const [adv, setAdv] = useState("Semua");
  const [toko, setToko] = useState("Semua");
  const [campaign, setCampaign] = useState("Semua");
  const [produk, setProduk] = useState("Semua");

  const filteredRows = useMemo(() => rows.filter((row) => (
    row.date >= startDate &&
    row.date <= endDate &&
    (platform === "Semua" || row.platform === platform) &&
    (adv === "Semua" || row.adv === adv) &&
    (toko === "Semua" || row.toko === toko) &&
    (campaign === "Semua" || row.campaign === campaign) &&
    (produk === "Semua" || row.produk === produk)
  )), [startDate, endDate, platform, adv, toko, campaign, produk]);

  const total = summarize("Total", filteredRows);
  const platforms = groupBy(filteredRows, (row) => row.platform).sort((a, b) => b.roas - a.roas);
  const advs = groupBy(filteredRows, (row) => row.adv).sort((a, b) => b.roas - a.roas);
  const campaigns = groupBy(filteredRows, (row) => row.campaign).sort((a, b) => b.sales - a.sales);
  const tokos = groupBy(filteredRows, (row) => row.toko).sort((a, b) => b.sales - a.sales);
  const daily = groupBy(filteredRows, (row) => row.tanggal).sort((a, b) => a.name.localeCompare(b.name));

  const bestPlatform = platforms[0];
  const bestAdv = advs[0];
  const bestCampaign = campaigns[0];

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#eef2f6]/90 text-brand-deep">
      <main className="mx-auto flex w-full max-w-[1680px] flex-col gap-6 px-5 py-6 sm:px-7 lg:px-10">
        <DummyBanner />

        <div>
          <h1 className="text-3xl font-extrabold tracking-[-0.03em] text-slate-900">Iklan &amp; ROAS</h1>
          <p className="mt-1 text-sm font-medium text-slate-600">
            Analisis biaya iklan, nilai hasil iklan, ROAS, ADV, campaign, dan toko. Data masih dummy Probetes dari contoh export Marketing — belum masuk database.
          </p>
        </div>

        <FilterBar
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          platform={platform}
          setPlatform={setPlatform}
          adv={adv}
          setAdv={setAdv}
          toko={toko}
          setToko={setToko}
          campaign={campaign}
          setCampaign={setCampaign}
          produk={produk}
          setProduk={setProduk}
        />

        <div className="flex gap-2 overflow-x-auto rounded-[20px] bg-white p-2 shadow-sm">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`whitespace-nowrap rounded-2xl px-4 py-2 text-sm font-extrabold transition ${activeTab === tab.key ? "bg-brand-red text-white shadow-sm" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <KpiGrid total={total} bestPlatform={bestPlatform?.name ?? "-"} bestAdv={bestAdv?.name ?? "-"} bestCampaign={bestCampaign?.name ?? "-"} />

        {activeTab === "overview" && (
          <>
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.25fr_0.75fr]">
              <Card title="Tren Biaya Iklan vs Nilai Iklan" subtitle="Melihat apakah nilai hasil iklan ikut naik ketika biaya iklan naik.">
                <TwoLineChart data={daily.map((item) => ({ label: item.name, spend: item.spend, sales: item.sales }))} />
              </Card>
              <Card title="ROAS per Platform" subtitle="Platform dengan ROAS paling baik ada di atas.">
                <HorizontalMetric data={platforms.map((item) => ({ label: item.name, value: item.roas, display: formatRoas(item.roas) }))} />
              </Card>
            </div>
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
              {platforms.map((item) => <PlatformCard key={item.name} item={item} />)}
            </div>
            <ComparisonTable rows={campaigns.slice(0, 6)} title="Campaign yang Harus Dilihat Dulu" nameLabel="Campaign" />
          </>
        )}

        {activeTab === "platform" && (
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <Card title="Biaya Iklan vs Nilai Iklan per Platform" subtitle="Cari platform dengan biaya besar tapi nilai hasil iklan kecil.">
              <CompareBars data={platforms.map((item) => ({ label: item.name, spend: item.spend, sales: item.sales }))} />
            </Card>
            <Card title="Detail Platform" subtitle="Ringkasan performa tiap platform.">
              <RankingTable rows={platforms} nameLabel="Platform" />
            </Card>
          </div>
        )}

        {activeTab === "adv" && (
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.8fr_1.2fr]">
            <Card title="Leaderboard ADV" subtitle="Bahan awal evaluasi performa ADV, belum KPI final.">
              <HorizontalMetric data={advs.map((item) => ({ label: item.name, value: item.roas, display: formatRoas(item.roas) }))} />
            </Card>
            <Card title="Ranking ADV" subtitle="Urut berdasarkan ROAS tertinggi.">
              <RankingTable rows={advs} nameLabel="ADV" />
            </Card>
          </div>
        )}

        {activeTab === "campaign" && (
          <Card title="Ranking Campaign" subtitle="Untuk menentukan campaign mana yang scale, cek, review, atau stop.">
            <CampaignTable rows={campaigns} />
          </Card>
        )}

        {activeTab === "toko" && (
          <Card title="Ranking Toko" subtitle="Membandingkan toko asal pembelian dan nilai iklan terbesar.">
            <RankingTable rows={tokos} nameLabel="Toko" />
          </Card>
        )}

        {activeTab === "review" && (
          <Card title="Data Review" subtitle="Data yang belum rapi dan perlu dicek sebelum jadi laporan final.">
            <ReviewTable rows={reviewRows.filter((row) => platform === "Semua" || row.platform === platform)} />
          </Card>
        )}

        <div className="rounded-[24px] border border-brand-red/10 bg-brand-red/5 p-6">
          <h3 className="font-bold text-brand-red">Catatan</h3>
          <p className="mt-1 text-sm leading-relaxed text-slate-700">
            Angka di halaman ini berasal dari laporan iklan platform. ROAS menunjukkan perbandingan nilai hasil iklan terhadap biaya iklan, bukan laba bersih.
          </p>
        </div>

        <div className="flex"><MarketingBackButton /></div>
      </main>
      <footer className="pb-7 pt-3 text-center text-xs font-medium text-slate-500 sm:text-sm">© 2026 Probetes ERP. All rights reserved.</footer>
    </div>
  );
}

function FilterBar(props: {
  startDate: string; setStartDate: (v: string) => void;
  endDate: string; setEndDate: (v: string) => void;
  platform: string; setPlatform: (v: string) => void;
  adv: string; setAdv: (v: string) => void;
  toko: string; setToko: (v: string) => void;
  campaign: string; setCampaign: (v: string) => void;
  produk: string; setProduk: (v: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 rounded-[24px] bg-white p-4 shadow-sm md:grid-cols-3 xl:grid-cols-7">
      <DateInput label="Dari Tanggal" value={props.startDate} onChange={props.setStartDate} />
      <DateInput label="Sampai Tanggal" value={props.endDate} onChange={props.setEndDate} />
      <Select label="Platform" value={props.platform} onChange={props.setPlatform} options={["Semua", ...unique(rows.map((row) => row.platform))]} />
      <Select label="ADV" value={props.adv} onChange={props.setAdv} options={["Semua", ...unique(rows.map((row) => row.adv))]} />
      <Select label="Toko" value={props.toko} onChange={props.setToko} options={["Semua", ...unique(rows.map((row) => row.toko))]} />
      <Select label="Campaign" value={props.campaign} onChange={props.setCampaign} options={["Semua", ...unique(rows.map((row) => row.campaign))]} />
      <Select label="Produk" value={props.produk} onChange={props.setProduk} options={["Semua", ...unique(rows.map((row) => row.produk))]} />
    </div>
  );
}

function DateInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold uppercase tracking-[0.08em] text-slate-400">{label}</span>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700 outline-none focus:border-brand-red"
      />
    </label>
  );
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold uppercase tracking-[0.08em] text-slate-400">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700 outline-none focus:border-brand-red">
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </label>
  );
}

function KpiGrid({ total, bestPlatform, bestAdv, bestCampaign }: { total: ReturnType<typeof summarize>; bestPlatform: string; bestAdv: string; bestCampaign: string }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
      <Kpi title="Biaya Iklan" value={formatRupiahRingkas(total.spend)} tone="red" />
      <Kpi title="Nilai Iklan" value={formatRupiahRingkas(total.sales)} />
      <Kpi title="ROAS" value={formatRoas(total.roas)} tone="green" />
      <Kpi title="Pembelian" value={total.order.toLocaleString("id-ID")} />
      <Kpi title="Biaya / Pembelian" value={formatRupiahRingkas(total.cpo)} />
      <Kpi title="Total Leads" value={total.leads.toLocaleString("id-ID")} />
      <Kpi title="Closing Rate" value={total.leads > 0 ? formatPersen(total.closing, 1) : "-"} />
      <Kpi title="Platform Terbaik" value={bestPlatform} />
      <Kpi title="ADV Terbaik" value={bestAdv} />
      <Kpi title="Campaign Terbaik" value={bestCampaign} />
    </div>
  );
}

function Kpi({ title, value, tone = "white" }: { title: string; value: string; tone?: "white" | "red" | "green" }) {
  const cls = tone === "red" ? "bg-brand-red text-white" : tone === "green" ? "bg-emerald-600 text-white" : "bg-white text-slate-900";
  return (
    <div className={`rounded-[22px] p-5 shadow-sm ${cls}`}>
      <p className={`text-xs font-bold uppercase tracking-[0.08em] ${tone === "white" ? "text-slate-400" : "text-white/75"}`}>{title}</p>
      <p className="mt-2 truncate text-2xl font-extrabold tracking-tight" title={value}>{value}</p>
    </div>
  );
}

function Card({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <section className="rounded-[24px] bg-white p-6 shadow-sm">
      <h2 className="text-lg font-extrabold tracking-[-0.02em] text-slate-900">{title}</h2>
      {subtitle && <p className="mt-1 text-sm font-medium text-slate-500">{subtitle}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

function TwoLineChart({ data }: { data: { label: string; spend: number; sales: number }[] }) {
  if (data.length === 0) return <Empty />;
  const width = 760;
  const height = 230;
  const pad = 28;
  const max = Math.max(...data.flatMap((item) => [item.spend, item.sales]), 1);
  const x = (i: number) => pad + (i * (width - pad * 2)) / Math.max(1, data.length - 1);
  const y = (v: number) => height - pad - (v / max) * (height - pad * 2);
  const line = (key: "spend" | "sales") => data.map((item, i) => `${x(i)},${y(item[key])}`).join(" ");

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ maxHeight: height }}>
        {[0.25, 0.5, 0.75].map((tick) => <line key={tick} x1={pad} x2={width - pad} y1={y(max * tick)} y2={y(max * tick)} stroke="#e2e8f0" strokeDasharray="4 4" />)}
        <polyline points={line("sales")} fill="none" stroke="#059669" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <polyline points={line("spend")} fill="none" stroke="#E30613" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        {data.map((item, i) => (
          <g key={item.label}>
            <circle cx={x(i)} cy={y(item.sales)} r="4" fill="#059669" stroke="white" strokeWidth="2" />
            <circle cx={x(i)} cy={y(item.spend)} r="4" fill="#E30613" stroke="white" strokeWidth="2" />
            <text x={x(i)} y={height - 6} textAnchor="middle" fontSize="10" fontWeight="700" fill="#64748b">{item.label}</text>
          </g>
        ))}
      </svg>
      <div className="mt-3 flex gap-4 text-xs font-bold text-slate-600">
        <span className="inline-flex items-center gap-2"><span className="size-2 rounded-full bg-brand-red" />Biaya Iklan</span>
        <span className="inline-flex items-center gap-2"><span className="size-2 rounded-full bg-emerald-600" />Nilai Iklan</span>
      </div>
    </div>
  );
}

function HorizontalMetric({ data }: { data: { label: string; value: number; display: string }[] }) {
  if (data.length === 0) return <Empty />;
  const max = Math.max(...data.map((item) => item.value), 1);
  return (
    <div className="space-y-4">
      {data.map((item) => (
        <div key={item.label}>
          <div className="mb-1 flex justify-between text-sm font-bold"><span className="text-slate-700">{item.label}</span><span className="text-slate-900">{item.display}</span></div>
          <div className="h-3 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-brand-red" style={{ width: `${Math.max(4, (item.value / max) * 100)}%` }} /></div>
        </div>
      ))}
    </div>
  );
}

function CompareBars({ data }: { data: { label: string; spend: number; sales: number }[] }) {
  if (data.length === 0) return <Empty />;
  const max = Math.max(...data.flatMap((item) => [item.spend, item.sales]), 1);
  return (
    <div className="space-y-5">
      {data.map((item) => (
        <div key={item.label}>
          <div className="mb-2 flex justify-between text-sm font-extrabold text-slate-800"><span>{item.label}</span><span>{formatRoas(roas(item.sales, item.spend))}</span></div>
          <Bar label="Biaya" value={item.spend} max={max} color="bg-brand-red" />
          <Bar label="Nilai" value={item.sales} max={max} color="bg-emerald-600" />
        </div>
      ))}
    </div>
  );
}

function Bar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  return (
    <div className="mb-1 grid grid-cols-[80px_1fr_80px] items-center gap-2 text-xs font-bold text-slate-500">
      <span>{label}</span>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${color}`} style={{ width: `${Math.max(3, (value / max) * 100)}%` }} /></div>
      <span className="text-right">{formatRupiahRingkas(value)}</span>
    </div>
  );
}

function PlatformCard({ item }: { item: ReturnType<typeof summarize> }) {
  const status = statusFromRoas(item.roas);
  return (
    <div className="rounded-[24px] bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div><h3 className="text-xl font-extrabold text-slate-900">{item.name}</h3><p className="mt-1 text-sm font-semibold text-slate-500">{item.order.toLocaleString("id-ID")} order</p></div>
        <span className={`rounded-lg px-2 py-1 text-xs font-extrabold ${status.tone}`}>{status.label}</span>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <MiniStat label="Biaya Iklan" value={formatRupiahRingkas(item.spend)} />
        <MiniStat label="Nilai Iklan" value={formatRupiahRingkas(item.sales)} />
        <MiniStat label="ROAS" value={formatRoas(item.roas)} />
        <MiniStat label="Biaya / Pembelian" value={formatRupiahRingkas(item.cpo)} />
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl bg-slate-50 p-3"><p className="text-xs font-bold text-slate-400">{label}</p><p className="mt-1 font-extrabold text-slate-900">{value}</p></div>;
}

function RankingTable({ rows, nameLabel }: { rows: ReturnType<typeof summarize>[]; nameLabel: string }) {
  if (rows.length === 0) return <Empty />;
  return (
    <div className="overflow-x-auto">
      <table className="w-full whitespace-nowrap text-left text-sm">
        <thead><tr className="border-b border-slate-200 text-slate-500"><Th>{nameLabel}</Th><Th right>Biaya Iklan</Th><Th right>Nilai Iklan</Th><Th right>Pembelian</Th><Th right>ROAS</Th><Th>Status</Th></tr></thead>
        <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
          {rows.map((row) => {
            const status = statusFromRoas(row.roas);
            return <tr key={row.name}><Td bold>{row.name}</Td><Td right>{formatRupiahRingkas(row.spend)}</Td><Td right>{formatRupiahRingkas(row.sales)}</Td><Td right>{row.order.toLocaleString("id-ID")}</Td><Td right bold>{formatRoas(row.roas)}</Td><Td><span className={`rounded-md px-2 py-1 text-xs font-bold ${status.tone}`}>{status.label}</span></Td></tr>;
          })}
        </tbody>
      </table>
    </div>
  );
}

function CampaignTable({ rows }: { rows: ReturnType<typeof summarize>[] }) {
  if (rows.length === 0) return <Empty />;
  return (
    <div className="overflow-x-auto">
      <table className="w-full whitespace-nowrap text-left text-sm">
        <thead><tr className="border-b border-slate-200 text-slate-500"><Th>Campaign</Th><Th>Platform</Th><Th>ADV</Th><Th right>Biaya Iklan</Th><Th right>Nilai Iklan</Th><Th right>Pembelian</Th><Th right>ROAS</Th><Th>Status</Th></tr></thead>
        <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
          {rows.map((row) => {
            const first = row.rows[0]!;
            const status = statusFromRoas(row.roas);
            return <tr key={row.name}><Td bold>{row.name}</Td><Td>{first.platform}</Td><Td>{first.adv}</Td><Td right>{formatRupiahRingkas(row.spend)}</Td><Td right>{formatRupiahRingkas(row.sales)}</Td><Td right>{row.order.toLocaleString("id-ID")}</Td><Td right bold>{formatRoas(row.roas)}</Td><Td><span className={`rounded-md px-2 py-1 text-xs font-bold ${status.tone}`}>{status.label}</span></Td></tr>;
          })}
        </tbody>
      </table>
    </div>
  );
}

function ComparisonTable({ rows, title, nameLabel }: { rows: ReturnType<typeof summarize>[]; title: string; nameLabel: string }) {
  return <Card title={title} subtitle="Urutan berdasar nilai iklan terbesar, tetap cek ROAS untuk keputusan scale/stop."><RankingTable rows={rows} nameLabel={nameLabel} /></Card>;
}

function ReviewTable({ rows }: { rows: ReviewRow[] }) {
  if (rows.length === 0) return <Empty />;
  return (
    <div className="overflow-x-auto">
      <table className="w-full whitespace-nowrap text-left text-sm">
        <thead><tr className="border-b border-slate-200 text-slate-500"><Th>Tipe Data</Th><Th>Platform</Th><Th>Masalah</Th><Th>Dampak</Th><Th>Aksi</Th></tr></thead>
        <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
          {rows.map((row) => <tr key={`${row.tipe}-${row.masalah}`}><Td bold>{row.tipe}</Td><Td>{row.platform}</Td><Td>{row.masalah}</Td><Td>{row.dampak}</Td><Td>{row.aksi}</Td></tr>)}
        </tbody>
      </table>
    </div>
  );
}

function Th({ children, right = false }: { children: ReactNode; right?: boolean }) {
  return <th className={`pb-3 pr-4 font-bold ${right ? "text-right" : ""}`}>{children}</th>;
}

function Td({ children, right = false, bold = false }: { children: ReactNode; right?: boolean; bold?: boolean }) {
  return <td className={`py-3 pr-4 ${right ? "text-right" : ""} ${bold ? "font-extrabold text-slate-900" : ""}`}>{children}</td>;
}

function Empty() {
  return <p className="rounded-2xl bg-slate-50 p-8 text-center text-sm font-bold text-slate-400">Belum ada data untuk filter ini.</p>;
}

function unique(values: string[]) {
  return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b));
}
