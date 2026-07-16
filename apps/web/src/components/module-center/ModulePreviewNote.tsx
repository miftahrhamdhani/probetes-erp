import { Info } from "lucide-react";

/** Catatan kecil bahwa perubahan (tambah/import) baru masuk state lokal, belum ke backend. */
export function ModulePreviewNote({ text = "Data yang ditambahkan/di-import di sini hanya tersimpan sementara di tampilan (belum ke database)." }: { text?: string }) {
  return (
    <p className="flex items-start gap-2 text-xs font-semibold text-amber-700">
      <Info className="mt-0.5 size-3.5 shrink-0" strokeWidth={2.2} />
      {text}
    </p>
  );
}
