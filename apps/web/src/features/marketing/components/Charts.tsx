"use client";
// Bar chart sederhana: setiap bar = satu item, label + value di bawah.
// Amber pakai label relief (putih outline) karena kontras <3:1 vs surface.

interface BarItem {
  label: string;
  value: number;
  color: string;
}

interface SimpleBarChartProps {
  data: BarItem[];
  formatValue?: (v: number) => string;
  height?: number;
}

export function SimpleBarChart({ data, formatValue = (v) => v.toLocaleString("id-ID"), height = 160 }: SimpleBarChartProps) {
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${data.length * 60} ${height + 40}`} className="w-full" style={{ minWidth: data.length * 48, maxHeight: height + 40 }}>
        {data.map((d, i) => {
          const barH = (d.value / max) * height;
          const x = i * 60 + 8;
          const y = height - barH;
          return (
            <g key={i}>
              <rect x={x} y={y} width={44} height={barH} rx={6} fill={d.color} />
              {/* value on top */}
              <text x={x + 22} y={y - 5} textAnchor="middle" fontSize={9} fontWeight={700} fill="#1e293b">
                {formatValue(d.value)}
              </text>
              {/* label below */}
              <text x={x + 22} y={height + 14} textAnchor="middle" fontSize={9} fontWeight={600} fill="#64748b">
                {d.label.length > 9 ? d.label.slice(0, 9) + "…" : d.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

interface LineItem {
  label: string;
  value: number;
}

interface SimpleLineChartProps {
  data: LineItem[];
  color?: string;
  formatValue?: (v: number) => string;
  height?: number;
}

export function SimpleLineChart({ data, color = "#E30613", formatValue = (v) => v.toLocaleString("id-ID"), height = 100 }: SimpleLineChartProps) {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data.map((d) => d.value), 1);
  const W = 480;
  const pad = 16;
  const w = W - pad * 2;
  const stepX = w / (data.length - 1 || 1);

  const pts = data.map((d, i) => ({
    x: pad + i * stepX,
    y: pad + (1 - d.value / max) * (height - pad * 2),
  }));

  const polyline = pts.map((p) => `${p.x},${p.y}`).join(" ");
  const area = `M${pts[0]!.x},${height} ` + pts.map((p) => `L${p.x},${p.y}`).join(" ") + ` L${pts[pts.length - 1]!.x},${height} Z`;

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${height + 20}`} className="w-full" style={{ maxHeight: height + 20 }}>
        <defs>
          <linearGradient id="lg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.15} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#lg)" />
        <polyline points={polyline} fill="none" stroke={color} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        {pts.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={3.5} fill={color} />
            <text x={p.x} y={height + 16} textAnchor="middle" fontSize={8} fontWeight={600} fill="#64748b">
              {data[i]!.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

interface DonutItem {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: DonutItem[];
  size?: number;
}

export function DonutChart({ data, size = 140 }: DonutChartProps) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const r = size * 0.38;
  const cx = size / 2;
  const cy = size / 2;
  let angle = -Math.PI / 2;
  const slices = data.map((d) => {
    const frac = d.value / total;
    const start = angle;
    angle += frac * 2 * Math.PI;
    return { ...d, start, end: angle, frac };
  });

  function arc(start: number, end: number) {
    const large = end - start > Math.PI ? 1 : 0;
    const x1 = cx + r * Math.cos(start);
    const y1 = cy + r * Math.sin(start);
    const x2 = cx + r * Math.cos(end);
    const y2 = cy + r * Math.sin(end);
    return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {slices.map((s, i) => (
        <path key={i} d={arc(s.start, s.end)} fill={s.color} stroke="white" strokeWidth={2} />
      ))}
      {/* hole */}
      <circle cx={cx} cy={cy} r={r * 0.52} fill="white" />
    </svg>
  );
}

interface FunnelStage {
  label: string;
  value: number; // persen, 0-100
}

interface RetentionFunnelProps {
  stages: FunnelStage[];
  color?: string;
  height?: number;
}

/** Funnel horizontal untuk retensi tonton video: tiap tahap = 1 bar, lebar sebanding
 * dengan % retensi terhadap tahap pertama. Sequential 1 hue (opacity naik = tahap makin
 * dalam) — bukan kategorikal, jadi tidak perlu divalidasi lewat validate_palette.js. */
export function RetentionFunnel({ stages, color = "#E30613", height = 36 }: RetentionFunnelProps) {
  if (!stages || stages.length === 0) return null;
  const W = 480;
  const labelW = 90;
  const barAreaW = W - labelW - 50;
  const gap = 10;

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${(height + gap) * stages.length}`} className="w-full" style={{ minWidth: 320 }}>
        {stages.map((s, i) => {
          const y = i * (height + gap);
          const w = Math.max(2, (s.value / 100) * barAreaW);
          const opacity = 0.35 + (i / Math.max(1, stages.length - 1)) * 0.65; // 0.35 -> 1.0, monoton
          return (
            <g key={i}>
              <text x={labelW - 8} y={y + height / 2 + 4} textAnchor="end" fontSize={11} fontWeight={600} fill="#475569">
                {s.label}
              </text>
              <rect x={labelW} y={y} width={w} height={height} rx={6} fill={color} opacity={opacity} />
              <text x={labelW + w + 8} y={y + height / 2 + 4} fontSize={11} fontWeight={700} fill="#1e293b">
                {s.value.toLocaleString("id-ID", { maximumFractionDigits: 1 })}%
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
