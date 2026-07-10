"use client";
// Chart primitif SVG untuk Sales & Order — dibuat meniru bentuk visual di mockup
// (D:\PROBETES\mockup sales & order): dual-line tren dengan callout bubble, donut
// dengan angka di tengah, ranked horizontal bar bernomor, grouped/stacked bar, heatmap.
// Tanpa dependency chart library baru (pola sama seperti features/marketing/components/Charts.tsx).

export const BRAND_RED = "#E30613";
export const NAVY = "#0b1220";

export function ChartEmpty({ message = "Belum ada data untuk filter ini." }: { message?: string }) {
  return <p className="rounded-2xl bg-slate-50 p-8 text-center text-sm font-semibold text-slate-400">{message}</p>;
}

// ---------------------------------------------------------------------------
// Dual-line tren (Tren Penjualan Harian, dua sumbu independen: merah = value A,
// biru = value B) dengan callout bubble di titik terakhir.
// ---------------------------------------------------------------------------
export function DualLineTrendChart({
  labels, seriesA, seriesB, formatA, formatB, height = 220, calloutA,
}: {
  labels: string[];
  seriesA: { name: string; color: string; points: number[] };
  seriesB: { name: string; color: string; points: number[] };
  formatA: (v: number) => string;
  formatB: (v: number) => string;
  height?: number;
  calloutA?: boolean;
}) {
  if (labels.length === 0) return <ChartEmpty />;
  const w = 900, padX = 26, padTop = 22, padBottom = 30;
  const plotW = w - padX * 2, plotH = height - padTop - padBottom;
  const maxA = Math.max(...seriesA.points, 1);
  const maxB = Math.max(...seriesB.points, 1);
  const x = (i: number) => padX + (i * plotW) / Math.max(1, labels.length - 1);
  const yA = (v: number) => padTop + plotH - (v / maxA) * plotH;
  const yB = (v: number) => padTop + plotH - (v / maxB) * plotH;
  const lastIdx = labels.length - 1;
  const areaA = `M${x(0)},${padTop + plotH} ${seriesA.points.map((v, i) => `L${x(i)},${yA(v)}`).join(" ")} L${x(lastIdx)},${padTop + plotH} Z`;

  return (
    <div className="overflow-x-auto">
      <div className="mb-2 flex items-center justify-between text-xs font-bold text-slate-500">
        <span className="inline-flex items-center gap-1.5"><span className="h-0.5 w-4 rounded" style={{ backgroundColor: seriesA.color }} />{seriesA.name}</span>
        <span className="inline-flex items-center gap-1.5">{seriesB.name}<span className="h-0.5 w-4 rounded" style={{ backgroundColor: seriesB.color }} /></span>
      </div>
      <svg viewBox={`0 0 ${w} ${height}`} className="w-full" style={{ maxHeight: height, minWidth: 560 }}>
        {[0.25, 0.5, 0.75, 1].map((t) => (
          <line key={t} x1={padX} x2={w - padX} y1={padTop + plotH - t * plotH} y2={padTop + plotH - t * plotH} stroke="#eef2f6" strokeWidth="1" />
        ))}
        <path d={areaA} fill={seriesA.color} fillOpacity="0.08" />
        <polyline points={seriesB.points.map((v, i) => `${x(i)},${yB(v)}`).join(" ")} fill="none" stroke={seriesB.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {seriesB.points.map((v, i) => <circle key={i} cx={x(i)} cy={yB(v)} r="3.5" fill={seriesB.color} stroke="white" strokeWidth="1.5"><title>{`${seriesB.name} · ${labels[i]}: ${formatB(v)}`}</title></circle>)}
        <polyline points={seriesA.points.map((v, i) => `${x(i)},${yA(v)}`).join(" ")} fill="none" stroke={seriesA.color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        {seriesA.points.map((v, i) => <circle key={i} cx={x(i)} cy={yA(v)} r="4" fill={seriesA.color} stroke="white" strokeWidth="2"><title>{`${seriesA.name} · ${labels[i]}: ${formatA(v)}`}</title></circle>)}
        {calloutA && (() => {
          const cx = x(lastIdx), cy = yA(seriesA.points[lastIdx]!);
          const text = formatA(seriesA.points[lastIdx]!);
          const boxW = 18 + text.length * 6.4;
          return (
            <g>
              <rect x={cx - boxW / 2} y={cy - 28} width={boxW} height={20} rx="10" fill={seriesA.color} />
              <text x={cx} y={cy - 14} textAnchor="middle" fontSize="10.5" fontWeight="800" fill="white">{text}</text>
            </g>
          );
        })()}
        {labels.map((label, i) => (
          (i % Math.ceil(labels.length / 10 || 1) === 0) && (
            <text key={label} x={x(i)} y={height - 10} textAnchor="middle" fontSize="10" fontWeight="700" fill="#64748b">{label}</text>
          )
        ))}
      </svg>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Multi-line chart dengan opsi callout bubble di titik terakhir tiap series.
// ---------------------------------------------------------------------------
export function TrendLineChart({
  labels, series, height = 200, formatValue = (v: number) => v.toLocaleString("id-ID"), showCallouts = false,
}: {
  labels: string[];
  series: { name: string; color: string; points: number[] }[];
  height?: number;
  formatValue?: (v: number) => string;
  showCallouts?: boolean;
}) {
  if (labels.length === 0 || series.length === 0) return <ChartEmpty />;
  const w = 900, padX = 24, padTop = 24, padBottom = 30;
  const plotW = w - padX * 2, plotH = height - padTop - padBottom;
  const max = Math.max(...series.flatMap((s) => s.points), 1);
  const x = (i: number) => padX + (i * plotW) / Math.max(1, labels.length - 1);
  const y = (v: number) => padTop + plotH - (v / max) * plotH;
  const lastIdx = labels.length - 1;

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${w} ${height}`} className="w-full" style={{ maxHeight: height, minWidth: 520 }}>
        {[0.25, 0.5, 0.75, 1].map((t) => <line key={t} x1={padX} x2={w - padX} y1={padTop + plotH - t * plotH} y2={padTop + plotH - t * plotH} stroke="#eef2f6" strokeWidth="1" />)}
        {series.map((s) => (
          <g key={s.name}>
            <polyline points={s.points.map((v, i) => `${x(i)},${y(v)}`).join(" ")} fill="none" stroke={s.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            {s.points.map((v, i) => <circle key={i} cx={x(i)} cy={y(v)} r="3.5" fill={s.color} stroke="white" strokeWidth="1.5"><title>{`${s.name} · ${labels[i]}: ${formatValue(v)}`}</title></circle>)}
            {showCallouts && (() => {
              const cx = x(lastIdx), cy = y(s.points[lastIdx]!);
              const text = formatValue(s.points[lastIdx]!);
              const boxW = 16 + text.length * 6.4;
              return (
                <g>
                  <rect x={cx - boxW / 2} y={cy - 26} width={boxW} height={18} rx="9" fill={s.color} />
                  <text x={cx} y={cy - 13} textAnchor="middle" fontSize="10" fontWeight="800" fill="white">{text}</text>
                </g>
              );
            })()}
          </g>
        ))}
        {labels.map((label, i) => (
          (i % Math.ceil(labels.length / 10 || 1) === 0) && (
            <text key={label} x={x(i)} y={height - 10} textAnchor="middle" fontSize="10" fontWeight="700" fill="#64748b">{label}</text>
          )
        ))}
      </svg>
      {series.length > 1 && (
        <div className="mt-2 flex flex-wrap gap-4 text-xs font-bold text-slate-600">
          {series.map((s) => <span key={s.name} className="inline-flex items-center gap-2"><span className="size-2.5 rounded-full" style={{ backgroundColor: s.color }} />{s.name}</span>)}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Horizontal value bars — label kiri, bar, value kanan (Sales per Platform,
// Status per Ekspedisi, Retur per Ekspedisi, Retur per Produk).
// ---------------------------------------------------------------------------
export function HorizontalValueBars({ data, color = BRAND_RED, formatValue = (v: number) => v.toLocaleString("id-ID") }: {
  data: { label: string; value: number; color?: string }[];
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
          <div className="h-3.5 overflow-hidden rounded-md bg-slate-100">
            <div className="h-full rounded-md" style={{ width: `${Math.max(4, (d.value / max) * 100)}%`, backgroundColor: d.color ?? color }} />
          </div>
          <span className="shrink-0 text-right font-bold text-slate-900">{formatValue(d.value)}</span>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Ranked horizontal bars bernomor — Top 10 Produk by Sales, Top CS/CRM by Sales.
// ---------------------------------------------------------------------------
export function RankedHorizontalBars({ data, color = BRAND_RED, formatValue = (v: number) => v.toLocaleString("id-ID") }: {
  data: { rank: number; code?: string; name: string; value: number }[];
  color?: string;
  formatValue?: (v: number) => string;
}) {
  if (data.length === 0) return <ChartEmpty />;
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="space-y-2.5">
      {data.map((d) => (
        <div key={d.rank} className="grid grid-cols-[20px_1fr_auto] items-center gap-2.5 text-sm">
          <span className="text-xs font-extrabold text-slate-400">{d.rank}</span>
          <div className="min-w-0">
            <p className="truncate text-xs font-bold text-slate-700" title={d.name}>{d.code ? `${d.code} · ` : ""}{d.name}</p>
            <div className="mt-1 h-2.5 overflow-hidden rounded-md bg-slate-100">
              <div className="h-full rounded-md" style={{ width: `${Math.max(4, (d.value / max) * 100)}%`, backgroundColor: color }} />
            </div>
          </div>
          <span className="shrink-0 text-right text-xs font-extrabold text-slate-900">{formatValue(d.value)}</span>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Vertical column chart — Order per Platform, Sales per Toko, Sales per Tim,
// Jumlah Order per Status, Top 10 Produk by Qty.
// ---------------------------------------------------------------------------
export function VerticalColumnChart({ data, height = 200, formatValue = (v: number) => v.toLocaleString("id-ID"), color = BRAND_RED }: {
  data: { label: string; value: number; color?: string }[];
  height?: number;
  formatValue?: (v: number) => string;
  color?: string;
}) {
  if (data.length === 0) return <ChartEmpty />;
  const max = Math.max(...data.map((d) => d.value), 1);
  const slot = 78;
  const barW = Math.min(46, slot * 0.6);
  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${data.length * slot} ${height + 42}`} className="w-full" style={{ minWidth: data.length * slot * 0.72, maxHeight: height + 42 }}>
        {data.map((d, i) => {
          const barH = (d.value / max) * height;
          const x = i * slot + (slot - barW) / 2;
          const y = height - barH;
          return (
            <g key={d.label}>
              <rect x={x} y={y} width={barW} height={barH} rx="6" fill={d.color ?? color}><title>{`${d.label}: ${formatValue(d.value)}`}</title></rect>
              <text x={x + barW / 2} y={y - 6} textAnchor="middle" fontSize="10.5" fontWeight="800" fill="#1e293b">{formatValue(d.value)}</text>
              <text x={x + barW / 2} y={height + 16} textAnchor="middle" fontSize="9.5" fontWeight="600" fill="#64748b">{d.label.length > 11 ? `${d.label.slice(0, 11)}…` : d.label}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Grouped dual bar — Sales vs Order per Platform (dua sumbu independen).
// ---------------------------------------------------------------------------
export function GroupedDualBarChart({
  data, nameA, nameB, colorA = BRAND_RED, colorB = "#2563EB", formatA = (v: number) => v.toLocaleString("id-ID"), formatB = (v: number) => v.toLocaleString("id-ID"), height = 210,
}: {
  data: { label: string; a: number; b: number }[];
  nameA: string;
  nameB: string;
  colorA?: string;
  colorB?: string;
  formatA?: (v: number) => string;
  formatB?: (v: number) => string;
  height?: number;
}) {
  if (data.length === 0) return <ChartEmpty />;
  const maxA = Math.max(...data.map((d) => d.a), 1);
  const maxB = Math.max(...data.map((d) => d.b), 1);
  const slot = 110, barW = 30, gap = 6;
  return (
    <div className="overflow-x-auto">
      <div className="mb-2 flex gap-4 text-xs font-bold text-slate-600">
        <span className="inline-flex items-center gap-1.5"><span className="size-2.5 rounded-sm" style={{ backgroundColor: colorA }} />{nameA}</span>
        <span className="inline-flex items-center gap-1.5"><span className="size-2.5 rounded-sm" style={{ backgroundColor: colorB }} />{nameB}</span>
      </div>
      <svg viewBox={`0 0 ${data.length * slot} ${height + 34}`} className="w-full" style={{ minWidth: data.length * slot * 0.75, maxHeight: height + 34 }}>
        {data.map((d, i) => {
          const hA = (d.a / maxA) * height, hB = (d.b / maxB) * height;
          const groupX = i * slot + slot / 2 - (barW * 2 + gap) / 2;
          return (
            <g key={d.label}>
              <rect x={groupX} y={height - hA} width={barW} height={hA} rx="5" fill={colorA}><title>{`${nameA} · ${d.label}: ${formatA(d.a)}`}</title></rect>
              <text x={groupX + barW / 2} y={height - hA - 6} textAnchor="middle" fontSize="9.5" fontWeight="800" fill="#1e293b">{formatA(d.a)}</text>
              <rect x={groupX + barW + gap} y={height - hB} width={barW} height={hB} rx="5" fill={colorB}><title>{`${nameB} · ${d.label}: ${formatB(d.b)}`}</title></rect>
              <text x={groupX + barW + gap + barW / 2} y={height - hB - 6} textAnchor="middle" fontSize="9.5" fontWeight="800" fill="#1e293b">{formatB(d.b)}</text>
              <text x={i * slot + slot / 2} y={height + 18} textAnchor="middle" fontSize="9.5" fontWeight="600" fill="#64748b">{d.label.length > 10 ? `${d.label.slice(0, 10)}…` : d.label}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Combo bar + line overlay — Sales vs Order per Toko.
// ---------------------------------------------------------------------------
export function ComboBarLineChart({ data, barLabel, lineLabel, barColor = BRAND_RED, lineColor = NAVY, formatBar = (v: number) => v.toLocaleString("id-ID"), formatLine = (v: number) => v.toLocaleString("id-ID"), height = 210 }: {
  data: { label: string; bar: number; line: number }[];
  barLabel: string;
  lineLabel: string;
  barColor?: string;
  lineColor?: string;
  formatBar?: (v: number) => string;
  formatLine?: (v: number) => string;
  height?: number;
}) {
  if (data.length === 0) return <ChartEmpty />;
  const padX = 24, padTop = 20, padBottom = 30;
  const slot = 96;
  const w = data.length * slot;
  const plotH = height - padTop - padBottom;
  const maxBar = Math.max(...data.map((d) => d.bar), 1);
  const maxLine = Math.max(...data.map((d) => d.line), 1);
  const barW = Math.min(38, slot * 0.5);
  const cx = (i: number) => i * slot + slot / 2;
  const yBar = (v: number) => padTop + plotH - (v / maxBar) * plotH;
  const yLine = (v: number) => padTop + plotH - (v / maxLine) * plotH;

  return (
    <div className="overflow-x-auto">
      <div className="mb-2 flex gap-4 text-xs font-bold text-slate-600">
        <span className="inline-flex items-center gap-1.5"><span className="size-2.5 rounded-sm" style={{ backgroundColor: barColor }} />{barLabel}</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-0.5 w-4 rounded" style={{ backgroundColor: lineColor }} />{lineLabel}</span>
      </div>
      <svg viewBox={`0 0 ${w} ${height}`} className="w-full" style={{ minWidth: w * 0.75, maxHeight: height }}>
        {data.map((d, i) => (
          <rect key={d.label} x={cx(i) - barW / 2} y={yBar(d.bar)} width={barW} height={padTop + plotH - yBar(d.bar)} rx="5" fill={barColor}><title>{`${barLabel} · ${d.label}: ${formatBar(d.bar)}`}</title></rect>
        ))}
        <polyline points={data.map((d, i) => `${cx(i)},${yLine(d.line)}`).join(" ")} fill="none" stroke={lineColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {data.map((d, i) => <circle key={d.label} cx={cx(i)} cy={yLine(d.line)} r="4" fill={lineColor} stroke="white" strokeWidth="2"><title>{`${lineLabel} · ${d.label}: ${formatLine(d.line)}`}</title></circle>)}
        {data.map((d, i) => <text key={d.label} x={cx(i)} y={height - 10} textAnchor="middle" fontSize="9.5" fontWeight="600" fill="#64748b">{d.label.length > 10 ? `${d.label.slice(0, 10)}…` : d.label}</text>)}
      </svg>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Donut dengan teks di tengah (angka total) + legend list di kanan.
// ---------------------------------------------------------------------------
export function DonutWithCenter({ data, centerTop, centerBottom, formatValue, size = 168 }: {
  data: { label: string; value: number; color: string }[];
  centerTop?: string;
  centerBottom?: string;
  formatValue?: (value: number, pct: number) => string;
  size?: number;
}) {
  if (data.length === 0 || data.every((d) => d.value === 0)) return <ChartEmpty />;
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const r = size * 0.36, cx = size / 2, cy = size / 2, c = 2 * Math.PI * r;
  let acc = 0;
  const segs = data.map((d) => { const frac = d.value / total; const seg = { ...d, frac, offset: acc }; acc += frac; return seg; });
  const fmt = formatValue ?? ((v: number, pct: number) => `${(pct * 100).toLocaleString("id-ID", { maximumFractionDigits: 0 })}% · ${v.toLocaleString("id-ID")}`);

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#eef2f6" strokeWidth={size * 0.11} />
          {segs.map((s) => <circle key={s.label} cx={cx} cy={cy} r={r} fill="none" stroke={s.color} strokeWidth={size * 0.11} strokeDasharray={`${s.frac * c} ${c}`} strokeDashoffset={-s.offset * c}><title>{`${s.label}: ${fmt(s.value, s.frac)}`}</title></circle>)}
        </svg>
        {(centerTop || centerBottom) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            {centerTop && <p className="text-lg font-black leading-tight text-slate-900">{centerTop}</p>}
            {centerBottom && <p className="text-[11px] font-bold uppercase tracking-[0.04em] text-slate-400">{centerBottom}</p>}
          </div>
        )}
      </div>
      <div className="w-full space-y-2">
        {segs.map((s) => (
          <div key={s.label} className="flex items-center justify-between gap-3 text-sm">
            <span className="inline-flex min-w-0 items-center gap-2 font-bold text-slate-700"><span className="size-3 shrink-0 rounded-full" style={{ backgroundColor: s.color }} /><span className="truncate" title={s.label}>{s.label}</span></span>
            <span className="shrink-0 font-extrabold text-slate-900">{fmt(s.value, s.frac)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stacked percent bar (100%) — Distribusi Order per Channel, Progress Pengiriman Harian.
// ---------------------------------------------------------------------------
export function StackedPercentBarChart({ data, height = 190, showLabels = true }: {
  data: { label: string; segments: { name: string; value: number; color: string }[] }[];
  height?: number;
  showLabels?: boolean;
}) {
  if (data.length === 0) return <ChartEmpty />;
  const seriesNames = data[0]?.segments.map((s) => s.name) ?? [];
  const seriesColors = data[0]?.segments.map((s) => s.color) ?? [];
  const slot = 64, barW = 38;
  const w = data.length * slot;

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${w} ${height + 40}`} className="w-full" style={{ minWidth: w * 0.75, maxHeight: height + 40 }}>
        {data.map((d, gi) => {
          const total = d.segments.reduce((s, x) => s + x.value, 0) || 1;
          let yCursor = height;
          const x = gi * slot + (slot - barW) / 2;
          return (
            <g key={d.label}>
              {d.segments.map((seg) => {
                const segH = (seg.value / total) * height;
                yCursor -= segH;
                const pct = (seg.value / total) * 100;
                return (
                  <g key={seg.name}>
                    <rect x={x} y={yCursor} width={barW} height={segH} fill={seg.color}><title>{`${seg.name} · ${d.label}: ${pct.toFixed(0)}%`}</title></rect>
                    {showLabels && segH > 14 && <text x={x + barW / 2} y={yCursor + segH / 2 + 3.5} textAnchor="middle" fontSize="8.5" fontWeight="800" fill="white">{pct.toFixed(0)}%</text>}
                  </g>
                );
              })}
              <text x={gi * slot + slot / 2} y={height + 16} textAnchor="middle" fontSize="9.5" fontWeight="600" fill="#64748b">{d.label}</text>
            </g>
          );
        })}
      </svg>
      <div className="mt-2 flex flex-wrap gap-4 text-xs font-bold text-slate-600">
        {seriesNames.map((name, i) => <span key={name} className="inline-flex items-center gap-2"><span className="size-2.5 rounded-sm" style={{ backgroundColor: seriesColors[i] }} />{name}</span>)}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Heatmap matrix — Fast Moving vs Slow Moving.
// ---------------------------------------------------------------------------
export function HeatmapMatrix({ rows, columns }: { rows: { label: string; values: number[] }[]; columns: string[] }) {
  if (rows.length === 0) return <ChartEmpty />;
  const max = Math.max(...rows.flatMap((r) => r.values), 1);
  const colorFor = (v: number) => `rgba(227, 6, 19, ${(0.1 + (v / max) * 0.75).toFixed(2)})`;
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-separate" style={{ borderSpacing: 6 }}>
        <thead>
          <tr>
            <th className="text-left text-xs font-bold text-slate-400" />
            {columns.map((c) => <th key={c} className="px-2 pb-2 text-center text-xs font-bold text-slate-500">{c}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label}>
              <td className="whitespace-nowrap pr-3 text-sm font-bold text-slate-700">{r.label}</td>
              {r.values.map((v, i) => (
                <td key={columns[i]} className="min-w-[64px] rounded-xl p-3 text-center text-sm font-extrabold text-slate-900" style={{ backgroundColor: colorFor(v) }}>{v.toLocaleString("id-ID")}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Mini sparkline dengan callout — dipakai kartu menu Center.
// ---------------------------------------------------------------------------
export function MiniSparklineCallout({ points, formatValue = (v: number) => v.toLocaleString("id-ID"), color = "white" }: {
  points: number[];
  formatValue?: (v: number) => string;
  color?: string;
}) {
  if (points.length === 0) return null;
  const w = 220, h = 56, pad = 6;
  const max = Math.max(...points, 1);
  const min = Math.min(...points, 0);
  const x = (i: number) => pad + (i * (w - pad * 2)) / Math.max(1, points.length - 1);
  const y = (v: number) => h - pad - ((v - min) / Math.max(1, max - min)) * (h - pad * 2 - 14) - 14;
  const line = points.map((v, i) => `${x(i)},${y(v)}`).join(" ");
  const lastX = x(points.length - 1), lastY = y(points[points.length - 1]!);
  const text = formatValue(points[points.length - 1]!);
  const boxW = 14 + text.length * 6;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-14 w-full">
      <path d={`M${x(0)},${h} L${line.split(" ").join(" L")} L${lastX},${h} Z`} fill={color} fillOpacity="0.14" />
      <polyline points={line} fill="none" stroke={color} strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" />
      <rect x={lastX - boxW / 2} y={0} width={boxW} height={15} rx="7.5" fill="white" />
      <text x={lastX} y={10.5} textAnchor="middle" fontSize="9" fontWeight="800" fill={BRAND_RED}>{text}</text>
    </svg>
  );
}

export function MiniRankedBars({ data, formatValue = (v: number) => v.toLocaleString("id-ID") }: { data: { code?: string; name: string; value: number }[]; formatValue?: (v: number) => string }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="space-y-1.5">
      {data.slice(0, 4).map((d) => (
        <div key={d.name} className="flex items-center gap-2 text-[11px] font-bold text-white/90">
          <span className="w-12 shrink-0 truncate">{d.code ?? d.name}</span>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/20"><div className="h-full rounded-full bg-white" style={{ width: `${Math.max(6, (d.value / max) * 100)}%` }} /></div>
          <span className="w-14 shrink-0 text-right">{formatValue(d.value)}</span>
        </div>
      ))}
    </div>
  );
}

export function MiniColumnBars({ values }: { values: number[] }) {
  const max = Math.max(...values, 1);
  return (
    <div className="flex h-14 items-end gap-2.5">
      {values.slice(0, 5).map((v, i) => (
        <div key={i} className="w-4 rounded-t-sm bg-white/85" style={{ height: `${Math.max(8, (v / max) * 100)}%` }} />
      ))}
    </div>
  );
}

export function MiniDonutLegend({ segments }: { segments: { label: string; value: number; color?: string }[] }) {
  const total = segments.reduce((s, v) => s + v.value, 0) || 1;
  const size = 52, r = 18, cx = size / 2, cy = size / 2, c = 2 * Math.PI * r;
  let acc = 0;
  return (
    <div className="flex items-center gap-3">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90 shrink-0">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="9" />
        {segments.map((s, i) => { const frac = s.value / total; const seg = <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke="white" strokeOpacity={0.4 + i * 0.18} strokeWidth="9" strokeDasharray={`${frac * c} ${c}`} strokeDashoffset={-acc * c} />; acc += frac; return seg; })}
      </svg>
      <div className="space-y-1 text-[10px] font-bold text-white/85">
        {segments.slice(0, 3).map((s) => <p key={s.label} className="truncate">{s.label} {((s.value / total) * 100).toFixed(0)}%</p>)}
      </div>
    </div>
  );
}
