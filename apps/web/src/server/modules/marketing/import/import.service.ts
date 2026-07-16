import type { PoolClient } from "pg";
import { logChange } from "@/lib/audit";
import { pool } from "@/server/common/db";
import { ImportFileError, parseMarketplaceImport } from "./parsers";
import { deriveAdsMetrics } from "./normalizers/ads-metrics";
import { normalizeImportHeader, normalizeImportPhone, parseImportNumber } from "./utils";
import { hasInconsistentOrderHeader } from "./validators/order-group";
import * as repo from "./import.repository";
import type {
  AdminInputerResult,
  AdminInputerUpdateInput,
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

function groupParsedOrderRows(rows: ParsedImportRow[]): ParsedImportRow[][] {
  const groups = new Map<string, ParsedImportRow[]>();
  for (const row of rows) {
    const invoice = String(row.parsed.invoice ?? "").trim().toLocaleLowerCase("id-ID");
    const key = invoice || `__row_${row.rowNumber}`;
    const group = groups.get(key) ?? [];
    group.push(row);
    groups.set(key, group);
  }
  return [...groups.values()];
}

function enforceAtomicOrderValidation(rows: ParsedImportRow[]): void {
  for (const group of groupParsedOrderRows(rows)) {
    const candidateRows = group.filter((row) => row.status !== "duplicate");
    const inconsistent = hasInconsistentOrderHeader(candidateRows.map((row) => row.parsed));
    if (inconsistent) {
      for (const row of candidateRows) {
        addRowIssue(row, "review", "Data header untuk invoice yang sama tidak konsisten; pesanan tidak akan disimpan sebagian.");
      }
    }
    const hasBlockedItem = candidateRows.some((row) => row.status === "review" || row.status === "error");
    if (hasBlockedItem) {
      for (const row of candidateRows) {
        if (row.status === "valid") {
          addRowIssue(row, "review", "Item lain pada invoice yang sama belum valid; seluruh pesanan menunggu perbaikan.");
        }
      }
    }
  }
}

interface ProductLookupEntry {
  lookup_name: string;
  product_id: string;
  product_name: string;
}

interface CourierLookupEntry {
  courier_id: string;
  courier_name: string;
  lookup_name: string;
}

function matchProduct(productInput: string, products: ProductLookupEntry[]): ProductLookupEntry | null {
  const source = normalizeImportHeader(productInput);
  if (!source) return null;
  const exact = products.find((product) => normalizeImportHeader(product.lookup_name) === source);
  if (exact) return exact;
  const sourceTokens = new Set(source.split(" ").filter(Boolean));
  const candidates = products.map((product) => {
    const alias = normalizeImportHeader(product.lookup_name);
    const tokens = alias.split(" ").filter(Boolean);
    const tokenMatch = tokens.length > 0 && tokens.every((token) => sourceTokens.has(token));
    const phraseMatch = alias.length >= 5 && source.includes(alias);
    return {
      product,
      score: tokenMatch || phraseMatch ? (tokens.length * 1_000) + alias.length : -1,
    };
  }).filter((candidate) => candidate.score >= 0)
    .sort((left, right) => right.score - left.score);
  if (!candidates[0]) return null;
  if (candidates[1] && candidates[1].score === candidates[0].score
    && candidates[1].product.product_id !== candidates[0].product.product_id) return null;
  return candidates[0].product;
}

function matchCourier(courierInput: string, couriers: CourierLookupEntry[]): CourierLookupEntry | null {
  const source = normalizeImportHeader(courierInput);
  if (!source) return null;
  const exact = couriers.find((courier) => normalizeImportHeader(courier.lookup_name) === source);
  if (exact) return exact;
  const candidates = couriers.map((courier) => {
    const alias = normalizeImportHeader(courier.lookup_name);
    const matched = alias.length >= 3 && (source.includes(alias) || alias.includes(source));
    return { courier, score: matched ? alias.length : -1 };
  }).filter((candidate) => candidate.score >= 0)
    .sort((left, right) => right.score - left.score);
  if (!candidates[0]) return null;
  if (candidates[1] && candidates[1].score === candidates[0].score
    && candidates[1].courier.courier_id !== candidates[0].courier.courier_id) return null;
  return candidates[0].courier;
}

async function enrichOrderRows(client: PoolClient, parsedFile: ParsedImportFile): Promise<void> {
  const products = await repo.loadProductLookup(client);
  const couriers = await repo.loadCourierLookup(client);
  const invoices = parsedFile.rows.map((row) => String(row.parsed.invoice ?? "").trim()).filter(Boolean);
  const existingOrders = invoices.length ? await repo.loadExistingOrders(client, invoices) : { rows: [] as { order_id: string }[] };
  const existingIds = new Set(existingOrders.rows.map((row) => row.order_id));

  for (const row of parsedFile.rows) {
    const productInput = String(row.parsed.product ?? "").trim();
    const product = matchProduct(productInput, products.rows);
    row.parsed.productId = product?.product_id ?? null;
    if (product) row.display.Produk = product.product_name;
    else if (productInput) addRowIssue(row, "review", "Produk belum memiliki mapping ke Data Utama.");
    const courierInput = String(row.parsed.courier ?? "").trim();
    const courier = matchCourier(courierInput, couriers.rows);
    row.parsed.courierId = courier?.courier_id ?? null;
    if (courier) row.display.Ekspedisi = courier.courier_name;
    const invoice = String(row.parsed.invoice ?? "").trim();
    if (invoice && existingIds.has(invoice)) addRowIssue(row, "duplicate", "No invoice sudah ada di database.");
  }
  enforceAtomicOrderValidation(parsedFile.rows);
  for (const row of parsedFile.rows) applyValidationDisplay(row);
}

async function enrichAdsRows(client: PoolClient, parsedFile: ParsedImportFile, platform: ImportPlatform, advName: string) {
  const existing = await repo.loadExistingAdsKeys(client, platform, advName);
  const platformLabel = platform === "tiktok" ? "TikTok Ads" : platform === "shopee" ? "Shopee Ads" : "Meta Ads";
  const keys = new Set(existing.rows.map((row) => [
    platformLabel, advName, row.report_date, row.campaign_name, row.ad_name,
  ].map((part) => part.toLocaleLowerCase("id-ID").trim()).join("|")));
  for (const row of parsedFile.rows) {
    if (row.duplicateKey && keys.has(row.duplicateKey)) {
      addRowIssue(row, "duplicate", "Campaign pada tanggal tersebut sudah ada di database.");
    }
    applyValidationDisplay(row);
  }
}

function toPreviewRows(rows: ParsedImportRow[]): ImportPreviewRow[] {
  return rows.map((row) => ({
    rowNumber: row.rowNumber,
    status: row.status,
    notes: row.notes,
    data: { ...row.display },
  }));
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
    const parsedFile = await parseMarketplaceImport(input.file, input.platform, input.importType, sourceName, input.periodLabel);
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
    if (batch.import_type === "ads") {
      for (const row of rows) {
        await client.query("SAVEPOINT promote_import_row");
        try {
          const promotedId = await repo.promoteAdsRow(client, batch, row);
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
    } else {
      const channelId = await repo.findChannelId(client, batch.platform);
      if (!channelId) throw new ImportServiceError("Channel platform belum terpetakan.", 400);
      const groups = new Map<string, repo.StagingRow[]>();
      for (const row of rows) {
        const invoice = String(row.parsed_data.invoice ?? "").trim().toLocaleLowerCase("id-ID");
        const key = invoice || `__row_${row.row_id}`;
        const group = groups.get(key) ?? [];
        group.push(row);
        groups.set(key, group);
      }
      for (const group of groups.values()) {
        await client.query("SAVEPOINT promote_import_order");
        try {
          const primary = group[0]!;
          const inconsistent = hasInconsistentOrderHeader(group.map((row) => row.parsed_data));
          if (inconsistent) throw new Error("Data header item dalam invoice yang sama tidak konsisten.");
          const customerId = await repo.findOrCreateCustomer(client, batch, primary.parsed_data);
          const orderId = await repo.insertOrderWithItems(
            client,
            batch,
            group.map((row) => row.parsed_data),
            channelId,
            customerId,
          );
          if (!orderId) throw new ImportServiceError("No invoice sudah ada di database.", 409);
          for (const row of group) await repo.markRowPromoted(client, row.row_id, orderId);
          await client.query("RELEASE SAVEPOINT promote_import_order");
          importedRows += group.length;
        } catch (error) {
          await client.query("ROLLBACK TO SAVEPOINT promote_import_order");
          const message = error instanceof Error ? error.message : "Kesalahan database.";
          for (const row of group) await repo.markRowFailure(client, row, message);
          await client.query("RELEASE SAVEPOINT promote_import_order");
          runtimeFailures += group.length;
        }
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

function historyNumber(value: unknown): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  return typeof value === "string" ? parseImportNumber(value) : null;
}

function normalizeHistoryDisplay(
  displayData: repo.HistoryPreviewRow["display_data"],
  importType: MarketplaceImportType,
): Record<string, string | number | null> {
  const data = { ...displayData };
  if (importType === "ads") {
    const derived = deriveAdsMetrics({
      clicks: historyNumber(data.Click),
      conversions: historyNumber(data["Konversi / Pesanan"]),
      impressions: historyNumber(data["Impression / Tayangan"]),
      purchaseValue: historyNumber(data["Nilai Konversi Platform"]),
      spend: historyNumber(data.Spending),
    });
    data["CTR (%)"] = derived.ctr;
    data["Biaya per Pesanan (CPA)"] = derived.costPerOrder === null ? "-" : Math.round(derived.costPerOrder);
    data["ROAS Platform"] = derived.platformRoas;
  } else if (data["Subtotal Produk"] === undefined || data["Subtotal Produk"] === "-") {
    const qty = historyNumber(data.Qty);
    const unitPrice = historyNumber(data["Harga Produk"]);
    data["Subtotal Produk"] = qty !== null && unitPrice !== null
      ? Math.round(qty * unitPrice)
      : data["Total Bayar"] ?? "-";
  }
  return data;
}

function asPreviewRow(row: repo.HistoryPreviewRow, importType: MarketplaceImportType): ImportPreviewRow {
  return {
    rowId: row.row_id,
    rowNumber: row.row_number,
    status: row.validation_status,
    notes: row.validation_notes ?? [],
    data: normalizeHistoryDisplay(row.display_data, importType),
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
  const rows = await repo.listHistoryPreviewRows(batchId);
  return { ...asHistoryEntry(batches[0]), rows: rows.map((row) => asPreviewRow(row, batches[0]!.import_type)) };
}

function asAdminInputerResult(row: Awaited<ReturnType<typeof repo.findAdminInputerOrders>>[number]): AdminInputerResult {
  return {
    orderId: row.order_id,
    orderDate: row.order_date,
    platform: row.platform,
    storeId: row.store_id,
    storeName: row.store_name,
    orderStatus: row.order_status,
    paymentMethod: row.payment_method,
    totalAmount: row.total_amount,
    channel: row.channel,
    courier: row.courier,
    trackingNumber: row.tracking_number,
    packageStatus: row.package_status,
    customerId: row.customer_id,
    customerVersion: row.customer_version,
    customer: {
      name: row.name ?? "",
      phone: row.phone ?? "",
      address: row.address ?? "",
      city: row.city ?? "",
      province: row.province ?? "",
    },
    items: row.items,
    phoneCandidates: [],
  };
}

export async function searchAdminInputerOrder(input: {
  platform: ImportPlatform;
  storeId: string;
  orderId?: string;
  trackingNumber?: string;
}): Promise<AdminInputerResult> {
  if (input.platform === "meta") throw new ImportServiceError("Admin Inputer hanya tersedia untuk TikTok Shop dan Shopee.");
  if (!input.storeId || (!input.orderId?.trim() && !input.trackingNumber?.trim())) {
    throw new ImportServiceError("Pilih toko dan masukkan ID Pesanan atau nomor resi.");
  }
  const client = await pool.connect();
  try {
    const rows = await repo.findAdminInputerOrders(client, {
      platform: input.platform,
      storeId: input.storeId,
      orderId: input.orderId?.trim(),
      trackingNumber: input.orderId?.trim() ? undefined : input.trackingNumber?.trim(),
    });
    if (!rows.length) throw new ImportServiceError("Pesanan tidak ditemukan pada platform dan toko tersebut.", 404);
    if (!input.orderId?.trim() && rows.length > 1) throw new ImportServiceError("Nomor resi ditemukan pada beberapa pesanan. Gunakan ID Pesanan agar lebih tepat.", 409);
    return asAdminInputerResult(rows[0]!);
  } finally { client.release(); }
}

export async function updateAdminInputerIdentity(input: AdminInputerUpdateInput): Promise<AdminInputerResult["customer"] & { customerVersion: string; phoneCandidates?: AdminInputerResult["phoneCandidates"] }> {
  const normalizedPhone = normalizeImportPhone(input.phone);
  if (!input.name.trim() || !normalizedPhone || !input.address.trim()) {
    throw new ImportServiceError("Nama, nomor WA yang valid, dan alamat wajib diisi.");
  }
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const before = await repo.loadAdminCustomerForUpdate(client, input.orderId, input.customerId);
    if (!before) throw new ImportServiceError("Pesanan tidak lagi terhubung ke pelanggan tersebut.", 409);
    if (before.customer_version !== input.customerVersion) throw new ImportServiceError("Data pelanggan sudah berubah. Muat ulang sebelum menyimpan.", 409);
    const candidates = await repo.findPhoneCandidates(client, normalizedPhone, input.customerId);
    if (candidates.rows.length && !input.acknowledgeDuplicatePhone) {
      await client.query("ROLLBACK");
      const error = new ImportServiceError("Nomor WA ini sudah terhubung ke pelanggan lain. Periksa sebelum menyimpan.", 409) as ImportServiceError & { candidates?: AdminInputerResult["phoneCandidates"] };
      error.candidates = candidates.rows.map((row) => ({ customerId: row.customer_id, name: row.name, transactionCount: row.transaction_count }));
      throw error;
    }
    const updated = await repo.updateAdminCustomerIdentity(client, { ...input, name: input.name.trim(), address: input.address.trim(), city: input.city.trim(), province: input.province.trim() }, normalizedPhone);
    if (!updated) throw new ImportServiceError("Data pelanggan sudah berubah. Muat ulang sebelum menyimpan.", 409);
    await logChange(client, "master.customers", input.customerId, "update", before, { ...updated, adminInputerOrderId: input.orderId });
    await client.query("COMMIT");
    return { name: updated.name, phone: updated.phone, address: updated.address, city: updated.city, province: updated.province, customerVersion: updated.customer_version };
  } catch (error) {
    try { await client.query("ROLLBACK"); } catch {}
    throw error;
  } finally { client.release(); }
}
