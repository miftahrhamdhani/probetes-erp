export type AdsRoasBadgeTone = "green" | "amber" | "red";

const TONE_CLASS: Record<AdsRoasBadgeTone, string> = {
  green: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  amber: "bg-amber-50 text-amber-700 ring-amber-100",
  red: "bg-red-50 text-red-700 ring-red-100",
};

const AUTO_TONE: Record<string, AdsRoasBadgeTone> = {
  Scale: "green", Bagus: "green",
  Cek: "amber",
  Evaluasi: "red", "Stop / Review": "red",
  Tinggi: "red", Sedang: "amber", Rendah: "green",
};

export function AdsRoasStatusBadge({ label, tone }: { label: string; tone?: AdsRoasBadgeTone }) {
  return (
    <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${TONE_CLASS[tone ?? AUTO_TONE[label] ?? "amber"]}`}>
      {label}
    </span>
  );
}
