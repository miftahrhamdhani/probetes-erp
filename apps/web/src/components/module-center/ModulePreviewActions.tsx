"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { ModuleActionToolbar } from "./ModuleActionToolbar";
import { ModuleImportModal } from "./ModuleImportModal";
import { ModuleManualFormModal, type ManualFormField } from "./ModuleManualFormModal";
import { ModulePreviewNote } from "./ModulePreviewNote";

interface ModulePreviewActionsProps<T> {
  initialRows: T[];
  children: (rows: T[]) => ReactNode;
  importLabel?: string;
  addManualLabel?: string;
  importTitle?: string;
  importSources?: string[];
  importColumns?: string[];
  manualTitle?: string;
  manualFields?: ManualFormField[];
  createImportedRow?: () => T;
  createManualRow?: (values: Record<string, string>) => T;
  extraActions?: { label: string; onClick: () => void; icon?: import("lucide-react").LucideIcon }[];
}

/** Aksi preview bersama: semua perubahan hanya hidup di state halaman saat ini. */
export function ModulePreviewActions<T>({
  initialRows,
  children,
  importLabel,
  addManualLabel,
  importTitle = "Import Data",
  importSources = ["File Preview"],
  importColumns = [],
  manualTitle = "Tambah Data",
  manualFields = [],
  createImportedRow,
  createManualRow,
  extraActions,
}: ModulePreviewActionsProps<T>) {
  const [rows, setRows] = useState(initialRows);
  const [showImport, setShowImport] = useState(false);
  const [showManual, setShowManual] = useState(false);

  const addImportedRow = () => {
    if (createImportedRow) setRows((current) => [createImportedRow(), ...current]);
    setShowImport(false);
  };
  const addManualRow = (values: Record<string, string>) => {
    if (createManualRow) setRows((current) => [createManualRow(values), ...current]);
    setShowManual(false);
  };

  return (
    <>
      <div className="mb-4 flex flex-col gap-2">
        <ModuleActionToolbar
          onImport={createImportedRow ? () => setShowImport(true) : undefined}
          importLabel={importLabel}
          onAddManual={createManualRow ? () => setShowManual(true) : undefined}
          addManualLabel={addManualLabel}
          extraActions={extraActions}
        />
        <ModulePreviewNote />
      </div>
      {children(rows)}
      {showImport && (
        <ModuleImportModal
          title={importTitle}
          sourceOptions={importSources}
          expectedColumns={importColumns}
          onClose={() => setShowImport(false)}
          onConfirm={addImportedRow}
        />
      )}
      {showManual && (
        <ModuleManualFormModal
          title={manualTitle}
          fields={manualFields}
          onClose={() => setShowManual(false)}
          onSubmit={addManualRow}
        />
      )}
    </>
  );
}
