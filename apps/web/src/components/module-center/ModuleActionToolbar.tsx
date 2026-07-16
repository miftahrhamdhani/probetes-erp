import type { LucideIcon } from "lucide-react";
import { Download, Plus, Upload } from "lucide-react";

interface ToolbarAction {
  label: string;
  onClick: () => void;
  icon?: LucideIcon;
}

interface ModuleActionToolbarProps {
  /** Tombol "Import ..." — biasanya membuka ModuleImportModal. */
  onImport?: () => void;
  importLabel?: string;
  /** Tombol "Tambah ... Manual/Preview" — biasanya membuka ModuleManualFormModal. */
  onAddManual?: () => void;
  addManualLabel?: string;
  /** Tombol tambahan opsional, mis. "Export Preview", "Generate Slip Preview". */
  extraActions?: ToolbarAction[];
}

/**
 * Baris tombol aksi di atas tabel data (Import / Tambah Manual / aksi lain).
 * Semua aksi di sini frontend-only — tidak memanggil API.
 */
export function ModuleActionToolbar({
  onImport,
  importLabel = "Import",
  onAddManual,
  addManualLabel = "Tambah Manual",
  extraActions,
}: ModuleActionToolbarProps) {
  if (!onImport && !onAddManual && !extraActions?.length) return null;
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      {onImport && (
        <button
          type="button"
          onClick={onImport}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:border-brand-red/40 hover:text-brand-red"
        >
          <Upload className="size-4" strokeWidth={2.2} />
          {importLabel}
        </button>
      )}
      {onAddManual && (
        <button
          type="button"
          onClick={onAddManual}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-red px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#d60511]"
        >
          <Plus className="size-4" strokeWidth={2.4} />
          {addManualLabel}
        </button>
      )}
      {extraActions?.map((action) => {
        const Icon = action.icon ?? Download;
        return (
          <button
            key={action.label}
            type="button"
            onClick={action.onClick}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:border-brand-red/40 hover:text-brand-red"
          >
            <Icon className="size-4" strokeWidth={2.2} />
            {action.label}
          </button>
        );
      })}
    </div>
  );
}
