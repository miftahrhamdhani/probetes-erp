import {
  NORMALIZED_IMPORT_COLUMNS,
  type ImportValidationStatus,
  type ParsedImportFile,
  type ParsedImportRow,
} from "../import.types";

/** Naikkan status baris ke tingkat lebih parah (error mengalahkan review). */
export function escalateStatus(current: ImportValidationStatus, next: "review" | "error"): ImportValidationStatus {
  if (current === "error" || next === "error") return "error";
  return "review";
}

function hasDisplayValue(rows: ParsedImportRow[], column: string): boolean {
  return rows.some((row) => {
    const value = row.display[column];
    return value !== null && value !== undefined && value !== "" && value !== "-";
  });
}

/** Rangkum baris hasil parsing jadi ParsedImportFile (kolom + periode + error file). */
export function finalizeFile(headers: string[], rows: ParsedImportRow[], fileErrors: string[]): ParsedImportFile {
  const dates = rows
    .flatMap((row) => [row.parsed.reportDate, row.parsed.reportEndDate, row.parsed.orderDate])
    .map((date) => String(date ?? ""))
    .filter((date) => /^\d{4}-\d{2}-\d{2}$/.test(date))
    .sort();
  const importType = rows.some((row) => row.targetEntity === "ad_campaign_metrics") ? "ads" : "order";
  const preferred = NORMALIZED_IMPORT_COLUMNS[importType];
  const dateColumn = preferred[0]!;
  const columns = [
    dateColumn,
    ...preferred.slice(1).filter((column) => hasDisplayValue(rows, column)),
    "Status Validasi",
    "Catatan Validasi",
  ];
  return {
    headers,
    columns,
    rows,
    periodStart: dates[0] ?? null,
    periodEnd: dates.at(-1) ?? null,
    fileErrors,
  };
}
