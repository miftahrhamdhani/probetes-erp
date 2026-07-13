"use client";
// Chart primitif SVG untuk Iklan & ROAS — dibuat meniru bentuk visual di mockup
// (D:\PROBETES\mockup iklan & roas): dual-line tren spending vs sales, vertical bar ROAS
// per platform (warna beda tiap platform), donut dengan legend kanan (nominal + persen),
// grouped bar perbandingan spending vs sales. Tanpa dependency chart library baru.

export function ChartEmpty({ message = "Belum ada data untuk filter ini." }: { message?: string }) {
  return <p className="rounded-2xl bg-slate-50 p-8 text-center text-sm font-semibold text-slate-400">{message}</p>;
}

// ---------------------------------------------------------------------------
// Dual-line trend chart — Tren Spending Ads vs Sales (merah = spending, biru = sales).
// ---------------------------------------------------------------------------
export function SpendingSalesTrendChart({ labels, spending, sales, formatValue }: {
  labels: string[];
  spending: number[];
  sales: number[];
  formatValue: (v: number) => string;
}) {
  if (labels.length === 0) return <ChartEmpty />;
  const w = 720, padX = 42, padTop = 18, padBottom = 28;
  const plotW = w - padX * 2, plotH = 240 - padTop - padBottom;
  const max = Math.max(...spending, ...sales, 1);
  const x = (i: number) => padX + (i * plotW) / Math.max(1, labels.length - 1);
  const y = (v: number) => padTop + plotH - (v / max) * plotH;

  return (
    <div className="overflow-x-auto">
      <div className="mb-2 flex gap-4 text-xs font-bold text-slate-600">
        <span className="inline-flex items-center gap-1.5"><span className="h-0.5 w-4 rounded bg-brand-red" />Spending Ads</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-0.5 w-4 rounded bg-blue-600" />Sales</span>
      </div>
      <svg viewBox={`0 0 ${w} 240`} className="w-full" style={{ maxHeight: 240, minWidth: 480 }}>
        {[0.25, 0.5, 0.75, 1].map((t) => (
          <g key={t}>
            <line x1={padX} x2={w - padX} y1={padTop + plotH - t * plotH} y2={padTop + plotH - t * plotH} stroke="#eef2f6" strokeWidth="1" />
            <text x={padX - 6} y={padTop + plotH - t * plotH + 3} textAnchor="end" fontSize="9" fontWeight="600" fill="#94a3b8">{formatValue(max * t)}</text>
          </g>
        ))}
        <polyline points={spending.map((v, i) => `${x(i)},${y(v)}`).join(" ")} fill="none" stroke="#E30613" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {spending.map((v, i) => <circle key={i} cx={x(i)} cy={y(v)} r="3.5" fill="#E30613" stroke="white" strokeWidth="1.5"><title>{`Spending · ${labels[i]}: ${formatValue(v)}`}</title></circle>)}
        <polyline points={sales.map((v, i) => `${x(i)},${y(v)}`).join(" ")} fill="none" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {sales.map((v, i) => <circle key={i} cx={x(i)} cy={y(v)} r="3.5" fill="#2563EB" stroke="white" strokeWidth="1.5"><title>{`Sales · ${labels[i]}: ${formatValue(v)}`}</title></circle>)}
        {labels.map((label, i) => <text key={label} x={x(i)} y={240 - 8} textAnchor="middle" fontSize="9.5" fontWeight="600" fill="#64748b">{label}</text>)}
      </svg>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Vertical bar ROAS per platform — tiap bar warnanya beda (TikTok merah, Shopee biru,
// Meta Ads ungu), label ROAS "x.xxx" di atas bar.
// ---------------------------------------------------------------------------
export function PlatformRoasBarChart({ data }: { data: { platform: string; roas: number; color: string }[] }) {
  if (data.length === 0) return <ChartEmpty />;
  const height = 180;
  const max = Math.max(...data.map((d) => d.roas), 1);
  const slot = 110, barW = 56;
  const w = data.length * slot;
  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${w} ${height + 34}`} className="w-full" style={{ minWidth: w * 0.7, maxHeight: height + 34 }}>
        {data.map((d, i) => {
          const barH = (d.roas / max) * height;
          const x = i * slot + (slot - barW) / 2;
          const y = height - barH;
          return (
            <g key={d.platform}>
              <rect x={x} y={y} width={barW} height={barH} rx="6" fill={d.color}><title>{`${d.platform}: ${d.roas.toFixed(2)}x`}</title></rect>
              <text x={x + barW / 2} y={y - 8} textAnchor="middle" fontSize="13" fontWeight="800" fill="#1e293b">{d.roas.toFixed(2)}x</text>
              <text x={x + barW / 2} y={height + 18} textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#64748b">{d.platform}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Donut dengan legend kanan (nominal + persen) — Distribusi Spending Ads, Sales per
// Platform, Kontribusi Sales Toko.
// ---------------------------------------------------------------------------
export function RoasDonutChart({ data, formatValue, size = 168 }: {
  data: { label: string; value: number; color: string }[];
  formatValue: (v: number) => string;
  size?: number;
}) {
  if (data.length === 0 || data.every((d) => d.value === 0)) return <ChartEmpty />;
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const r = size * 0.36, cx = size / 2, cy = size / 2, c = 2 * Math.PI * r;
  let acc = 0;
  const segs = data.map((d) => { const frac = d.value / total; const seg = { ...d, frac, offset: acc }; acc += frac; return seg; });

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90 shrink-0">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#eef2f6" strokeWidth={size * 0.13} />
        {segs.map((s) => (
          <circle key={s.label} cx={cx} cy={cy} r={r} fill="none" stroke={s.color} strokeWidth={size * 0.13} strokeDasharray={`${s.frac * c} ${c}`} strokeDashoffset={-s.offset * c}>
            <title>{`${s.label}: ${formatValue(s.value)} (${(s.frac * 100).toFixed(1)}%)`}</title>
          </circle>
        ))}
      </svg>
      <div className="w-full space-y-2.5">
        {segs.map((s) => (
          <div key={s.label} className="flex items-center gap-2 text-sm">
            <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: s.color }} />
            <span className="min-w-0 flex-1 truncate font-bold text-slate-700" title={s.label}>{s.label}</span>
            <span className="shrink-0 text-right text-xs font-extrabold text-slate-900">{formatValue(s.value)} <span className="font-semibold text-slate-400">({(s.frac * 100).toLocaleString("id-ID", { maximumFractionDigits: 1 })}%)</span></span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Grouped bar chart — Perbandingan Spending dan Sales per Platform (merah = spending,
// biru = sales), dengan value label di atas tiap bar seperti mockup.
// ---------------------------------------------------------------------------
export function SpendingSalesComparisonChart({ data, formatValue }: {
  data: { platform: string; spending: number; sales: number }[];
  formatValue: (v: number) => string;
}) {
  if (data.length === 0) return <ChartEmpty />;
  const height = 190;
  const maxSales = Math.max(...data.map((d) => d.sales), 1);
  const slot = 118, barW = 34, gap = 6;
  const w = data.length * slot;
  return (
    <div className="overflow-x-auto">
      <div className="mb-2 flex gap-4 text-xs font-bold text-slate-600">
        <span className="inline-flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-brand-red" />Spending Ads</span>
        <span className="inline-flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-blue-600" />Sales</span>
      </div>
      <svg viewBox={`0 0 ${w} ${height + 34}`} className="w-full" style={{ minWidth: w * 0.7, maxHeight: height + 34 }}>
        {data.map((d, i) => {
          const hSpending = (d.spending / maxSales) * height;
          const hSales = (d.sales / maxSales) * height;
          const groupX = i * slot + slot / 2 - (barW * 2 + gap) / 2;
          return (
            <g key={d.platform}>
              <rect x={groupX} y={height - hSpending} width={barW} height={hSpending} rx="5" fill="#E30613"><title>{`Spending · ${d.platform}: ${formatValue(d.spending)}`}</title></rect>
              <text x={groupX + barW / 2} y={height - hSpending - 6} textAnchor="middle" fontSize="9.5" fontWeight="800" fill="#1e293b">{formatValue(d.spending)}</text>
              <rect x={groupX + barW + gap} y={height - hSales} width={barW} height={hSales} rx="5" fill="#2563EB"><title>{`Sales · ${d.platform}: ${formatValue(d.sales)}`}</title></rect>
              <text x={groupX + barW + gap + barW / 2} y={height - hSales - 6} textAnchor="middle" fontSize="9.5" fontWeight="800" fill="#1e293b">{formatValue(d.sales)}</text>
              <text x={i * slot + slot / 2} y={height + 18} textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#64748b">{d.platform}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Vertical bar generik — dipakai ROAS/Spending/Sales per ADV, Sales/Order per Toko.
// ---------------------------------------------------------------------------
export function VerticalValueBarChart({ data, formatValue, color = "#E30613", height = 190 }: {
  data: { name: string; value: number }[];
  formatValue: (v: number) => string;
  color?: string;
  height?: number;
}) {
  if (data.length === 0) return <ChartEmpty />;
  const max = Math.max(...data.map((d) => d.value), 1);
  const slot = 96, barW = Math.min(48, slot * 0.55);
  const w = data.length * slot;
  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${w} ${height + 34}`} className="w-full" style={{ minWidth: w * 0.72, maxHeight: height + 34 }}>
        {data.map((d, i) => {
          const barH = (d.value / max) * height;
          const x = i * slot + (slot - barW) / 2;
          const y = height - barH;
          return (
            <g key={d.name}>
              <rect x={x} y={y} width={barW} height={barH} rx="6" fill={color}><title>{`${d.name}: ${formatValue(d.value)}`}</title></rect>
              <text x={x + barW / 2} y={y - 6} textAnchor="middle" fontSize="9.5" fontWeight="800" fill="#1e293b">{formatValue(d.value)}</text>
              <text x={x + barW / 2} y={height + 16} textAnchor="middle" fontSize="9.5" fontWeight="600" fill="#64748b">{d.name.length > 10 ? `${d.name.slice(0, 10)}…` : d.name}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Horizontal value bar — Bar jumlah issue per tipe data (Data Review tab).
// ---------------------------------------------------------------------------
export function HorizontalValueBars({ data, color = "#E30613", formatValue = (v: number) => v.toLocaleString("id-ID") }: {
  data: { label: string; value: number }[];
  color?: string;
  formatValue?: (v: number) => string;
}) {
  if (data.length === 0) return <ChartEmpty />;
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="space-y-3">
      {data.map((d) => (
        <div key={d.label} className="grid grid-cols-[1fr_2.4fr_auto] items-center gap-3 text-sm">
          <span className="truncate font-semibold text-slate-600" title={d.label}>{d.label}</span>
          <div className="h-3.5 overflow-hidden rounded-md bg-slate-100"><div className="h-full rounded-md" style={{ width: `${Math.max(4, (d.value / max) * 100)}%`, backgroundColor: color }} /></div>
          <span className="shrink-0 text-right font-bold text-slate-900">{formatValue(d.value)}</span>
        </div>
      ))}
    </div>
  );
}
