import { FlaskConical } from "lucide-react";

export function DummyBanner() {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
      <FlaskConical className="mt-0.5 size-4 shrink-0" strokeWidth={2} />
      <span>
        <strong>Data dummy — bukan data Probetes.</strong> Semua angka dan nama di halaman ini fiktif, hanya untuk
        memperlihatkan tampilan. Menu Marketing masih dalam pengembangan oleh developer.
      </span>
    </div>
  );
}
