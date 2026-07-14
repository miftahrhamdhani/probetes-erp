import type { PoolClient } from "pg";
import { pool } from "@/server/common/db";
import { ImportFileError, parseMarketplaceImport } from "./parsers";
import * as repo from "./import.repository";
import type {
  ImportCommitResponse,
  ImportHistoryEntry,
  ImportOptionsByPlatform,
  ImportPlatform,
  ImportPreviewResponse,
  ImportPreviewRow,
  ImportSourceOption,
  ImportValidationStatus,
  MarketplaceImportType,
  ParsedImportFile,
  ParsedImportRow,
} from "./import.types";

const PLATFORMS: ImportPlatform[] = ["tiktok", "shopee", "meta"];

export class ImportServiceError extends Error {
  constructor(message: string, public readonly status = 400) {
    super(message);
    this.name = "ImportServiceError";
  }
}

export function isImportPlatform(value: string): value is ImportPlatform {
  return PLATFORMS.includes(value as ImportPlatform);
}

export function isMarketplaceImportType(value: string): value is MarketplaceImportType {
  return value === "ads" || value === "order";
}

function asOption(row: repo.OptionRow): ImportSourceOption {
  return { id: row.option_id, platform: row.platform, type: row.option_type, label: row.label };
}

// --- source options --------------------------------------------------------
export async function getImportOptions(): Promise<ImportOptionsByPlatform> {
  const rows = await repo.listOptions();
  const result: ImportOptionsByPlatform = {
    tiktok: { adv: [], stores: [] },
    shopee: { adv: [], stores: [] },
    meta: { adv: [], stores: [] },
  };
  for (const row of rows) {
    const bucket = row.option_type === "adv" ? result[row.platform].adv : result[row.platform].stores;
    bucket.push(asOption(row));
  }
  return result;
}

function assertLabel(label: string) {
  if (label.length < 2 || label.length > 100) {
    throw new ImportServiceError("Nama harus terdiri dari 2 sampai 100 karakter.");
  }
}

export async function createImportOption(input: {
  platform: ImportPlatform;
  type: "adv" | "store";
  label: string;
}): Promise<ImportSourceOption> {
  const label = input.label.trim();
  assertLabel(label);
  try {
    const rows = await repo.insertOption(input.platform, input.type, label);
    return asOption(rows[0]!);
  } catch (error) {
    if (repo.isUniqueViolation(error)) throw new ImportServiceError("Nama tersebut sudah tersedia pada pilihan ini.", 409);
    throw error;
  }
}

export async function updateImportOption(id: string, labelInput: string): Promise<ImportSourceOption> {
  const label = labelInput.trim();
  assertLabel(label);
  try {
    const rows = await repo.updateOption(id, label);
    if (!rows[0]) throw new ImportServiceError("Pilihan tidak ditemukan.", 404);
    return asOption(rows[0]);
  } catch (error) {
    if (repo.isUniqueViolation(error)) throw new ImportServiceError("Nama tersebut sudah tersedia pada pilihan ini.", 409);
    throw error;
  }
}

export async function deleteImportOption(id: string): Promise<void> {
  const rows = await repo.deactivateOption(id);
  if (!rows[0]) throw new ImportServiceError("Pilihan tidak ditemukan.", 404);
}

async function requireSelectedOption(
  client: PoolClient,
  id: string,
  platform: ImportPlatform,
  type: "adv" | "store",
): Promise<repo.OptionRow> {
  const option = await repo.findSelectedOption(client, id, platform, type);
  if (!option) {
    throw new ImportServiceError(type === "adv" ? "ADV yang dipilih tidak tersedia." : "Toko yang dipilih tidak tersedia.");
  }
  return option;
}

// --- preview ---------------------------------------------------------------
function rowStatusCounts(rows: ParsedImportRow[]) {
  const count = (status: ImportValidationStatus) => rows.filter((row) => row.status === status).length;
  return {
    totalRows: rows.length,
    validRows: count("valid"),
    reviewRows: count("review"),
    errorRows: count("error"),
    duplicateRows: count("duplicate"),
  };
}

function addRowIssue(row: ParsedImportRow, status: "review" | "duplicate", note: string) {
  if (row.status !== "error") row.status = status === "duplicate" ? "duplicate" : row.status === "valid" ? "review" : row.status;
  if (!row.notes.includes(note)) row.notes.push(note);
}

function validationLabel(status: ImportValidationStatus): string {
  return status === "valid"
    ? "Valid"
    : status === "review"
      ? "Perlu Dicek"
      : status === "duplicate"
        ? "Duplikat"
        : "Error";
}

function applyValidationDisplay(row: ParsedImportRow) {
  row.display["Status Validasi"] = validationLabel(row.status);
  row.display["Catatan Validasi"] = row.notes.join(" ") || "Data siap disimpan.";
}

async function enrichOrderRows(client: PoolClient, parsedFile: ParsedImportFile): Promise<void> {
  const products = await repo.loadProductLookup(client);
  const productMap = new Map(products.rows.map((row) => [row.lookup_name, row.product_id]));
  const invoices = parsedFile.rows.map((row) => String(row.parsed.invoice ?? "").trim()).filter(Boolean);
  const existingOrders = invoices.length ? await repo.loadExistingOrders(client, invoices) : { rows: [] as { order_id: string }[] };
  const existingIds = new Set(existingOrders.rows.map((row) => row.order_id));

  for (const row of parsedFile.rows) {
    const productName = String(row.parsed.product ?? "").trim().toLocaleLowerCase("id-ID");
    const productId = productMap.get(productName) ?? null;
    row.parsed.productId = productId;
    if (!productId && productName) addRowIssue(row, "review", "Produk belum memiliki mapping ke Data Utama.");
    const invoice = String(row.parsed.invoice ?? "").trim();
    if (invoice && existingIds.has(invoice)) addRowIssue(row, "duplicate", "No invoice sudah ada di database.");
    applyValidationDisplay(row);
  }
}

async function enrichAdsRows(client: PoolClient, parsedFile: ParsedImportFile, platform: ImportPlatform, advName: string) {
  const existing = await repo.loadExistingAdsKeys(client, platform, advName);
  const keys = new Set(existing.rows.map((row) => [
    platform, advName, row.report_date, row.campaign_name, row.ad_name,
  ].map((part) => part.toLocaleLowerCase("id-ID").trim()).join("|")));
  for (const row of parsedFile.rows) {
    if (row.duplicateKey && keys.has(row.duplicateKey)) {
      addRowIssue(row, "duplicate", "Campaign pada tanggal tersebut sudah ada di database.");
    }
    applyValidationDisplay(row);
  }
}

function toPreviewRows(rows: ParsedImportRow[]): ImportPreviewRow[] {
  return rows.map((row) => ({ rowNumber: row.rowNumber, status: row.status, notes: row.notes, data: row.display }));
}

export async function createImportPreview(input: {
  file: File;
  platform: ImportPlatform;
  importType: MarketplaceImportType;
  advOptionId: string | null;
  storeOptionId: string | null;
  periodLabel: string;
  note: string;
  importedBy?: string;
}): Promise<ImportPreviewResponse> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const adv = input.importType === "ads"
      ? await requireSelectedOption(client, input.advOptionId ?? "", input.platform, "adv")
      : null;
    const store = input.importType === "order"
      ? await requireSelectedOption(client, input.storeOptionId ?? "", input.platform, "store")
      : null;
    const sourceName = adv?.label ?? store?.label ?? "";
    const parsedFile = await parseMarketplaceImport(input.file, input.platform, input.importType, sourceName);
    if (input.importType === "order") await enrichOrderRows(client, parsedFile);
    else await enrichAdsRows(client, parsedFile, input.platform, sourceName);
    const counts = rowStatusCounts(parsedFile.rows);

    const batchId = await repo.insertBatch(client, [
      input.platform,
      input.importType,
      input.file.name,
      input.file.size,
      input.file.type || null,
      adv?.option_id ?? null,
      adv?.user_id ?? null,
      adv?.label ?? null,
      store?.option_id ?? null,
      store?.label ?? null,
      input.periodLabel.trim() || null,
      parsedFile.periodStart,
      parsedFile.periodEnd,
      input.note.trim() || null,
      counts.totalRows,
      counts.validRows,
      counts.reviewRows,
      counts.errorRows,
      counts.duplicateRows,
      JSON.stringify({ ...counts, fileErrors: parsedFile.fileErrors }),
      JSON.stringify({ headers: parsedFile.headers, columns: parsedFile.columns }),
      input.importedBy ?? "app",
    ]);
    const payload = parsedFile.rows.map((row) => ({
      rowNumber: row.rowNumber,
      raw: row.raw,
      parsed: row.parsed,
      display: row.display,
      status: row.status,
      notes: row.notes,
      duplicateKey: row.duplicateKey,
      targetEntity: row.targetEntity,
    }));
    await repo.insertStagingRows(client, batchId, JSON.stringify(payload));
    await repo.insertImportLog(client, batchId, "preview", input.importedBy ?? "app", JSON.stringify(counts));
    await client.query("COMMIT");

    return {
      previewId: batchId,
      batchId,
      fileName: input.file.name,
      platform: input.platform,
      importType: input.importType,
      sourceName,
      ...counts,
      periodStart: parsedFile.periodStart,
      periodEnd: parsedFile.periodEnd,
      columns: parsedFile.columns,
      rows: toPreviewRows(parsedFile.rows),
      validationSummary: counts,
      errors: parsedFile.fileErrors,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

// --- commit ----------------------------------------------------------------
export async function commitImportBatch(batchId: string, actor = "app"): Promise<ImportCommitResponse> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const batch = await repo.loadBatchForUpdate(client, batchId);
    if (!batch) throw new ImportServiceError("Batch import tidak ditemukan.", 404);
    if (batch.status === "completed") throw new ImportServiceError("Import ini sudah pernah disimpan.", 409);
    if (batch.status === "cancelled") throw new ImportServiceError("Import ini sudah dibatalkan.", 409);
    if (new Date(batch.expires_at).getTime() < Date.now()) {
      await repo.setBatchStatus(client, batchId, "expired");
      await client.query("COMMIT");
      throw new ImportServiceError("Preview sudah kedaluwarsa. Silakan upload ulang file.", 410);
    }
    if (batch.status !== "preview" && batch.status !== "failed") {
      throw new ImportServiceError("Import sedang diproses. Tunggu beberapa saat.", 409);
    }
    await repo.setBatchStatus(client, batchId, "processing");
    const rows = await repo.loadValidRows(client, batchId);
    if (batch.import_type === "ads") await repo.ensureAdsBatch(client, batch);

    let importedRows = 0;
    let runtimeFailures = 0;
    for (const row of rows) {
      await client.query("SAVEPOINT promote_import_row");
      try {
        let promotedId: string;
        if (batch.import_type === "ads") {
          promotedId = await repo.promoteAdsRow(client, batch, row);
        } else {
          const channelId = await repo.findChannelId(client, batch.platform);
          if (!channelId) throw new Error("Channel platform belum terpetakan.");
          const customerId = await repo.findOrCreateCustomer(client, batch, row.parsed_data);
          const orderId = await repo.insertOrderWithItem(client, batch, row.parsed_data, channelId, customerId);
          if (!orderId) throw new ImportServiceError("No invoice sudah ada di database.", 409);
          promotedId = orderId;
        }
        await repo.markRowPromoted(client, row.row_id, promotedId);
        await client.query("RELEASE SAVEPOINT promote_import_row");
        importedRows += 1;
      } catch (error) {
        await client.query("ROLLBACK TO SAVEPOINT promote_import_row");
        const message = error instanceof Error ? error.message : "Kesalahan database.";
        await repo.markRowFailure(client, row, message);
        await client.query("RELEASE SAVEPOINT promote_import_row");
        runtimeFailures += 1;
      }
    }

    const failedRows = batch.error_rows + runtimeFailures;
    const reviewRows = batch.review_rows + batch.duplicate_rows;
    await repo.finalizeBatchCompleted(client, batchId, importedRows, failedRows, runtimeFailures);
    if (batch.import_type === "ads") await repo.finalizeAdsBatchCompleted(client, batchId, importedRows, failedRows);
    await repo.insertImportLog(client, batchId, "commit", actor, JSON.stringify({ importedRows, reviewRows, failedRows }));
    await client.query("COMMIT");
    return {
      success: true,
      batchId,
      importedRows,
      reviewRows,
      failedRows,
      message: importedRows > 0
        ? "Data berhasil disimpan ke database."
        : "Import selesai, tetapi belum ada baris valid yang dapat disimpan.",
    };
  } catch (error) {
    if (!(error instanceof ImportServiceError && error.status === 410)) await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

// --- cancel ----------------------------------------------------------------
export async function cancelImportBatch(batchId: string, actor = "app"): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const batch = await repo.loadBatchForUpdate(client, batchId);
    if (!batch) throw new ImportServiceError("Batch import tidak ditemukan.", 404);
    if (batch.status === "completed") throw new ImportServiceError("Import yang sudah disimpan tidak dapat dibatalkan.", 409);
    if (batch.status !== "cancelled") {
      await repo.markBatchCancelled(client, batchId);
      await repo.insertImportLog(client, batchId, "cancel", actor, "{}");
    }
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

// --- history ---------------------------------------------------------------
function asHistoryEntry(row: repo.BatchRow): ImportHistoryEntry {
  return {
    id: row.batch_id,
    createdAt: row.created_at,
    platform: row.platform,
    importType: row.import_type,
    advName: row.adv_name,
    storeName: row.store_name,
    periodLabel: row.period_label,
    fileName: row.file_name,
    status: row.status as ImportHistoryEntry["status"],
    totalRows: row.total_rows,
    validRows: row.valid_rows,
    reviewRows: row.review_rows,
    errorRows: row.error_rows,
    duplicateRows: row.duplicate_rows,
    importedRows: row.imported_rows,
    failedRows: row.failed_rows,
    committedAt: row.committed_at,
  };
}

function asPreviewRow(row: repo.StagingRow): ImportPreviewRow {
  return {
    rowId: row.row_id,
    rowNumber: row.row_number,
    status: row.validation_status,
    notes: row.validation_notes ?? [],
    data: row.display_data,
  };
}

export async function getImportHistory(limit = 20): Promise<ImportHistoryEntry[]> {
  const safeLimit = Math.min(Math.max(Math.trunc(limit) || 20, 1), 100);
  const rows = await repo.listHistory(safeLimit);
  return rows.map(asHistoryEntry);
}

export async function getImportHistoryDetail(batchId: string): Promise<ImportHistoryEntry> {
  const batches = await repo.findHistory(batchId);
  if (!batches[0]) throw new ImportServiceError("Riwayat import tidak ditemukan.", 404);
  const rows = await repo.listBatchRows(batchId);
  return { ...asHistoryEntry(batches[0]), rows: rows.map(asPreviewRow) };
}
