import * as XLSX from "xlsx";
import type { MarketplaceImportType } from "../import.types";
import { MAX_IMPORT_FILE_SIZE, MAX_IMPORT_ROWS, normalizeImportHeader } from "../utils";
import { ADS_ALIASES, ORDER_ALIASES } from "../mappers/aliases";

/** Error yang dimengerti user kantor (bukan stack teknis). */
export class ImportFileError extends Error {
  constructor(message: string, public readonly status = 400) {
    super(message);
    this.name = "ImportFileError";
  }
}

type Cell = string | number | boolean | null | undefined;
type AliasGroups = Record<string, readonly string[]>;

const REQUIRED_FIELDS: Record<MarketplaceImportType, readonly string[]> = {
  ads: ["reportDate", "campaign", "spend"],
  order: ["orderDate", "invoice", "customer", "product", "qty", "total"],
};

function aliasLookup(groups: AliasGroups): Map<string, string> {
  return new Map(Object.entries(groups).flatMap(([key, aliases]) => aliases.map((alias) => [normalizeImportHeader(alias), key])));
}

/** Tebak pemisah CSV (koma/semikolon/tab) dari beberapa baris pertama. */
function detectDelimiter(text: string): string {
  const sample = text.split(/\r?\n/).slice(0, 8).join("\n");
  const candidates = [",", ";", "\t"];
  let best = ",";
  let bestCount = -1;
  for (const delimiter of candidates) {
    let quoted = false;
    let count = 0;
    for (let index = 0; index < sample.length; index += 1) {
      const char = sample[index]!;
      if (char === '"') {
        if (quoted && sample[index + 1] === '"') index += 1;
        else quoted = !quoted;
      } else if (char === delimiter && !quoted) count += 1;
    }
    if (count > bestCount) {
      best = delimiter;
      bestCount = count;
    }
  }
  return best;
}

function parseDelimited(text: string, delimiter: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let value = "";
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index]!;
    if (char === '"') {
      if (quoted && text[index + 1] === '"') { value += '"'; index += 1; }
      else quoted = !quoted;
    } else if (char === delimiter && !quoted) { row.push(value); value = ""; }
    else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && text[index + 1] === "\n") index += 1;
      row.push(value);
      if (row.some((cell) => cell.trim() !== "")) rows.push(row);
      row = []; value = "";
    } else value += char;
  }
  row.push(value);
  if (row.some((cell) => cell.trim() !== "")) rows.push(row);
  return rows;
}

function uniqueHeaders(values: Cell[]): string[] {
  const used = new Map<string, number>();
  return values.map((value, index) => {
    const base = String(value ?? "").trim() || `Kolom ${index + 1}`;
    const count = used.get(base) ?? 0;
    used.set(base, count + 1);
    return count === 0 ? base : `${base} (${count + 1})`;
  });
}

interface TableCandidate {
  sheetName: string;
  matrix: Cell[][];
  headerIndex: number;
  requiredMatches: number;
  totalMatches: number;
  nonEmpty: number;
}

function bestCandidate(sheets: Array<{ name: string; matrix: Cell[][] }>, importType: MarketplaceImportType): TableCandidate | null {
  const groups = (importType === "ads" ? ADS_ALIASES : ORDER_ALIASES) as AliasGroups;
  const lookup = aliasLookup(groups);
  const required = new Set(REQUIRED_FIELDS[importType]);
  let best: TableCandidate | null = null;
  const isBetter = (candidate: TableCandidate, current: TableCandidate) => {
    if (candidate.requiredMatches !== current.requiredMatches) return candidate.requiredMatches > current.requiredMatches;
    if (candidate.totalMatches !== current.totalMatches) return candidate.totalMatches > current.totalMatches;
    return candidate.nonEmpty > current.nonEmpty;
  };
  for (const sheet of sheets) {
    // ponytail: 100 baris awal cukup untuk export marketplace; naikkan bila ada format nyata dengan header lebih dalam.
    for (let index = 0; index < Math.min(sheet.matrix.length, 100); index += 1) {
      const row = sheet.matrix[index] ?? [];
      const fields = new Set(row.map((cell) => lookup.get(normalizeImportHeader(String(cell ?? "")))).filter(Boolean) as string[]);
      const candidate: TableCandidate = {
        sheetName: sheet.name,
        matrix: sheet.matrix,
        headerIndex: index,
        requiredMatches: [...fields].filter((field) => required.has(field)).length,
        totalMatches: fields.size,
        nonEmpty: row.filter((cell) => String(cell ?? "").trim()).length,
      };
      if (!best || isBetter(candidate, best)) best = candidate;
    }
  }
  return best;
}

function assertRequiredHeaders(candidate: TableCandidate, importType: MarketplaceImportType, headers: string[], allowMissingAdsDate: boolean): void {
  const groups = (importType === "ads" ? ADS_ALIASES : ORDER_ALIASES) as AliasGroups;
  const normalized = new Set(headers.map(normalizeImportHeader));
  const requiredFields = importType === "ads" && allowMissingAdsDate
    ? REQUIRED_FIELDS.ads.filter((field) => field !== "reportDate")
    : REQUIRED_FIELDS[importType];
  const missing = requiredFields.filter((key) => !(groups[key] ?? []).some((alias) => normalized.has(normalizeImportHeader(alias))));
  if (!missing.length) return;
  const labels: Record<string, string> = { reportDate: "tanggal", campaign: "campaign", spend: "spending", orderDate: "tanggal pesanan", invoice: "invoice / ID pesanan", customer: "customer", product: "produk", qty: "qty", total: "total bayar" };
  const details = missing.map((key) => `${labels[key] ?? key} (contoh header: ${(groups[key] ?? []).slice(0, 4).join(", ")})`).join("; ");
  throw new ImportFileError(`File ${importType === "ads" ? "Spending Ads" : "Data Pesanan"} tidak cocok. Sheet "${candidate.sheetName}", baris header ${candidate.headerIndex + 1}. Kolom wajib belum ditemukan: ${details}. Header terbaca: ${headers.join(", ")}.`);
}

/** Baca file CSV/XLSX menjadi header + row mentah dengan tabel terbaik sesuai jenis import. */
export async function readTabularFile(file: File, importType: MarketplaceImportType, allowMissingAdsDate = false): Promise<{ headers: string[]; rows: Record<string, string>[] }> {
  const extension = file.name.toLocaleLowerCase("id-ID").match(/\.[^.]+$/)?.[0] ?? "";
  if (![".csv", ".xlsx", ".xls"].includes(extension)) throw new ImportFileError("Format file tidak didukung. Gunakan CSV, XLS, atau XLSX.");
  if (file.size <= 0) throw new ImportFileError("File kosong. Pilih file yang berisi data.");
  if (file.size > MAX_IMPORT_FILE_SIZE) throw new ImportFileError("Ukuran file terlalu besar. Batas maksimal adalah 10 MB.", 413);
  const allowedMime = new Set(["", "text/csv", "application/csv", "text/plain", "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/octet-stream"]);
  if (file.type && !allowedMime.has(file.type.toLocaleLowerCase("id-ID"))) throw new ImportFileError("Tipe file tidak sesuai. Pastikan file benar-benar CSV atau Excel.");

  let sheets: Array<{ name: string; matrix: Cell[][] }>;
  try {
    if (extension === ".csv") {
      const text = await file.text();
      sheets = [{ name: "CSV", matrix: parseDelimited(text, detectDelimiter(text)) }];
    }
    else {
      const workbook = XLSX.read(await file.arrayBuffer(), { type: "array", cellDates: false });
      sheets = workbook.SheetNames.map((name) => ({
        name,
        matrix: XLSX.utils.sheet_to_json<Cell[]>(workbook.Sheets[name]!, { header: 1, defval: "", raw: true }),
      }));
    }
  } catch {
    throw new ImportFileError("File tidak dapat dibaca. Pastikan format CSV atau Excel tidak rusak.");
  }

  const candidate = bestCandidate(sheets, importType);
  if (!candidate || candidate.matrix.length < 2) throw new ImportFileError("File tidak memiliki tabel data yang dapat dibaca.");
  const headers = uniqueHeaders(candidate.matrix[candidate.headerIndex] ?? []);
  assertRequiredHeaders(candidate, importType, headers, allowMissingAdsDate);
  const rows = candidate.matrix.slice(candidate.headerIndex + 1)
    .filter((cells) => cells.some((cell) => String(cell ?? "").trim() !== ""))
    .map((cells) => Object.fromEntries(headers.map((header, index) => [header, String(cells[index] ?? "").trim()])));
  if (!rows.length) throw new ImportFileError("File tidak memiliki baris data yang dapat dibaca.");
  if (rows.length > MAX_IMPORT_ROWS) throw new ImportFileError(`File berisi lebih dari ${MAX_IMPORT_ROWS.toLocaleString("id-ID")} baris. Pecah file menjadi beberapa batch.`, 413);
  return { headers, rows };
}
