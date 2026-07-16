import { Info } from "lucide-react";

/**
 * Banner peringatan data dummy — dipakai di semua menu yang belum punya
 * backend/API asli. Style: amber soft, tidak mencolok, tapi jelas.
 */
export function DummyDataBanner() {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
      <Info className="mt-0.5 size-4 shrink-0" strokeWidth={2} />
      <span>
        Data dummy berdasarkan struktur database asli. Digunakan untuk preview tampilan frontend,
        belum menjadi laporan final.
      </span>
    </div>
  );
}
