import * as XLSX from "xlsx";
import { MAX_IMPORT_FILE_SIZE, MAX_IMPORT_ROWS, normalizeImportHeader } from "../utils";
import { ADS_ALIASES, ORDER_ALIASES } from "../mappers/aliases";

/** Error yang dimengerti user kantor (bukan stack teknis). */
export class ImportFileError extends Error {
  constructor(message: string, public readonly status = 400) {
    super(message);
    this.name = "ImportFileError";
  }
}

function aliasSet(groups: Record<string, readonly string[]>): Set<string> {
  return new Set(Object.values(groups).flat().map(normalizeImportHeader));
}

const ALL_KNOWN_HEADERS = new Set([...aliasSet(ADS_ALIASES), ...aliasSet(ORDER_ALIASES)]);

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
      if (quoted && text[index + 1] === '"') {
        value += '"';
        index += 1;
      } else quoted = !quoted;
    } else if (char === delimiter && !quoted) {
      row.push(value);
      value = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && text[index + 1] === "\n") index += 1;
      row.push(value);
      if (row.some((cell) => cell.trim() !== "")) rows.push(row);
      row = [];
      value = "";
    } else value += char;
  }

  row.push(value);
  if (row.some((cell) => cell.trim() !== "")) rows.push(row);
  return rows;
}

/** Cari baris yang paling mungkin jadi header (skor: jumlah alias dikenal + sel terisi). */
function findHeaderIndex(rows: string[][]): number {
  let bestIndex = 0;
  let bestScore = -1;
  for (let index = 0; index < Math.min(rows.length, 20); index += 1) {
    const cells = rows[index] ?? [];
    const normalized = cells.map((cell) => normalizeImportHeader(cell));
    const aliases = normalized.filter((cell) => ALL_KNOWN_HEADERS.has(cell)).length;
    const nonEmpty = normalized.filter(Boolean).length;
    const score = aliases * 100 + nonEmpty;
    if (score > bestScore) {
      bestIndex = index;
      bestScore = score;
    }
  }
  return bestIndex;
}

function uniqueHeaders(values: string[]): string[] {
  const used = new Map<string, number>();
  return values.map((value, index) => {
    const base = value.trim() || `Kolom ${index + 1}`;
    const count = used.get(base) ?? 0;
    used.set(base, count + 1);
    return count === 0 ? base : `${base} (${count + 1})`;
  });
}

/** Baca file CSV/XLSX menjadi { headers, rows } — sudah validasi ukuran, mime, dan isi. */
export async function readTabularFile(file: File): Promise<{ headers: string[]; rows: Record<string, string>[] }> {
  const extension = file.name.toLocaleLowerCase("id-ID").match(/\.[^.]+$/)?.[0] ?? "";
  if (![".csv", ".xlsx", ".xls"].includes(extension)) {
    throw new ImportFileError("Format file tidak didukung. Gunakan CSV, XLS, atau XLSX.");
  }
  if (file.size <= 0) throw new ImportFileError("File kosong. Pilih file yang berisi data.");
  if (file.size > MAX_IMPORT_FILE_SIZE) {
    throw new ImportFileError("Ukuran file terlalu besar. Batas maksimal adalah 10 MB.", 413);
  }

  const allowedMime = new Set([
    "", "text/csv", "application/csv", "text/plain", "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/octet-stream",
  ]);
  if (file.type && !allowedMime.has(file.type.toLocaleLowerCase("id-ID"))) {
    throw new ImportFileError("Tipe file tidak sesuai. Pastikan file benar-benar CSV atau Excel.");
  }

  let matrix: string[][];
  try {
    if (extension === ".csv") {
      const text = await file.text();
      matrix = parseDelimited(text, detectDelimiter(text));
    } else {
      const workbook = XLSX.read(await file.arrayBuffer(), { type: "array", cellDates: true });
      const sheetName = workbook.SheetNames[0];
      if (!sheetName) throw new Error("Workbook tidak memiliki sheet.");
      const sheet = workbook.Sheets[sheetName];
      matrix = XLSX.utils.sheet_to_json<(string | number | boolean | Date)[]>(sheet!, {
        header: 1,
        defval: "",
        raw: false,
        dateNF: "yyyy-mm-dd",
      }).map((row) => row.map((cell) => String(cell ?? "").trim()));
    }
  } catch {
    throw new ImportFileError("File tidak dapat dibaca. Pastikan format CSV atau Excel tidak rusak.");
  }

  if (matrix.length < 2) throw new ImportFileError("File tidak memiliki baris data yang dapat dibaca.");
  const headerIndex = findHeaderIndex(matrix);
  const headers = uniqueHeaders(matrix[headerIndex] ?? []);
  if (!headers.some((header) => header.trim())) throw new ImportFileError("Header file tidak dapat dibaca.");

  const rows = matrix
    .slice(headerIndex + 1)
    .filter((cells) => cells.some((cell) => String(cell ?? "").trim() !== ""))
    .map((cells) => Object.fromEntries(headers.map((header, index) => [header, String(cells[index] ?? "").trim()])));

  if (rows.length === 0) throw new ImportFileError("File tidak memiliki baris data yang dapat dibaca.");
  if (rows.length > MAX_IMPORT_ROWS) {
    throw new ImportFileError(`File berisi lebih dari ${MAX_IMPORT_ROWS.toLocaleString("id-ID")} baris. Pecah file menjadi beberapa batch.`, 413);
  }
  return { headers, rows };
}
