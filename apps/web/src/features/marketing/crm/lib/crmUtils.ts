export const formatRupiah = (value: number) => `Rp${value.toLocaleString("id-ID")}`;
export const formatRingkas = (value: number) => value >= 1_000_000 ? `Rp${(value / 1_000_000).toLocaleString("id-ID", { maximumFractionDigits: 1 })} jt` : formatRupiah(value);
export const formatPersen = (value: number) => `${value.toLocaleString("id-ID", { maximumFractionDigits: 1 })}%`;
export const safeRatio = (value: number, divisor: number) => divisor > 0 ? value / divisor : null;
export const formatRatio = (value: number, divisor: number, suffix = "x") => { const ratio = safeRatio(value, divisor); return ratio === null ? "-" : `${ratio.toLocaleString("id-ID", { maximumFractionDigits: 2 })}${suffix}`; };
export const heatTone = (percent: number) => percent >= 70 ? "bg-brand-red text-white" : percent >= 45 ? "bg-brand-red/65 text-white" : percent >= 25 ? "bg-brand-red/35 text-brand-red" : percent > 0 ? "bg-brand-red/10 text-brand-red" : "bg-slate-50 text-slate-400";
