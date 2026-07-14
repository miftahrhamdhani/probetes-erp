import type { ImportValidationStatus, ParsedImportFile, ParsedImportRow } from "../import.types";

/** Naikkan status baris ke tingkat lebih parah (error mengalahkan review). */
export function escalateStatus(current: ImportValidationStatus, next: "review" | "error"): ImportValidationStatus {
  if (current === "error" || next === "error") return "error";
  return "review";
}

/** Rangkum baris hasil parsing jadi ParsedImportFile (kolom + periode + error file). */
export function finalizeFile(headers: string[], rows: ParsedImportRow[], fileErrors: string[]): ParsedImportFile {
  const dates = rows
    .flatMap((row) => [row.parsed.reportDate, row.parsed.reportEndDate, row.parsed.orderDate])
    .map((date) => String(date ?? ""))
    .filter((date) => /^\d{4}-\d{2}-\d{2}$/.test(date))
    .sort();
  const columns = rows[0] ? [...Object.keys(rows[0].display), "Status Validasi", "Catatan Validasi"] : [];
  return {
    headers,
    columns,
    rows,
    periodStart: dates[0] ?? null,
    periodEnd: dates.at(-1) ?? null,
    fileErrors,
  };
}
