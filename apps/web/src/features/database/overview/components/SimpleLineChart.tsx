import type { ChartPoint } from "../types/databaseOverview.types";

export function SimpleLineChart({ data }: { data: ChartPoint[] }) {
  const width = 560;
  const height = 180;
  const padding = 24;
  const values = data.map((point) => point.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const points = data.map((point, index) => {
    const x = padding + (index * (width - padding * 2)) / Math.max(1, data.length - 1);
    const y = height - padding - ((point.value - min) / range) * (height - padding * 2);
    return { ...point, x, y };
  });
  const path = points.map((point, index) => `${index === 0 ? "M" : "L"}${point.x},${point.y}`).join(" ");
  const area = `${path} L${width - padding},${height - padding} L${padding},${height - padding} Z`;

  return (
    <div className="w-full overflow-hidden rounded-2xl bg-slate-50 p-3">
      <svg className="h-[220px] w-full" viewBox={`0 0 ${width} ${height + 34}`} role="img" aria-label="Line chart">
        <path d={area} fill="rgba(227, 6, 19, 0.10)" />
        <path d={path} fill="none" stroke="#e30613" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" />
        {points.map((point) => (
          <g key={point.label}>
            <circle cx={point.x} cy={point.y} r="5" fill="#e30613" stroke="white" strokeWidth="3" />
            <text x={point.x} y={height + 14} textAnchor="middle" className="fill-slate-500 text-[11px] font-bold">
              {point.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
