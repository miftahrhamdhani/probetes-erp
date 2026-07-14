import type { PoolClient } from "pg";
import { query } from "@/server/common/db";
import type {
  ImportPlatform,
  ImportValidationStatus,
  MarketplaceImportType,
} from "./import.types";

// ---------------------------------------------------------------------------
// Semua akses PostgreSQL untuk modul import ada di sini (repository layer).
// Service memanggil fungsi-fungsi ini; tidak menulis SQL sendiri.
// ---------------------------------------------------------------------------

const PLATFORM_ADS_LABEL: Record<ImportPlatform, string> = {
  tiktok: "TikTok Ads",
  shopee: "Shopee Ads",
  meta: "Meta Ads",
};
const PLATFORM_DB_LABEL: Record<ImportPlatform, string> = {
  tiktok: "TikTok Shop",
  shopee: "Shopee",
  meta: "Meta / Akuisisi",
};

export interface OptionRow {
  option_id: string;
  platform: ImportPlatform;
  option_type: "adv" | "store";
  label: string;
  user_id: string | null;
}

export interface BatchRow {
  batch_id: string;
  platform: ImportPlatform;
  import_type: MarketplaceImportType;
  file_name: string;
  adv_name: string | null;
  store_name: string | null;
  period_label: string | null;
  period_start: string | null;
  period_end: string | null;
  status: string;
  total_rows: number;
  valid_rows: number;
  review_rows: number;
  error_rows: number;
  duplicate_rows: number;
  imported_rows: number;
  failed_rows: number;
  created_at: string;
  committed_at: string | null;
  expires_at: string;
}

export interface StagingRow {
  row_id: number;
  row_number: number;
  raw_data: Record<string, string>;
  parsed_data: Record<string, string | number | null>;
  display_data: Record<string, string | number | null>;
  validation_status: ImportValidationStatus;
  validation_notes: string[];
  duplicate_key: string | null;
  target_entity: "ad_campaign_metrics" | "orders";
}

export function isUniqueViolation(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === "23505";
}

// ---- import source options ------------------------------------------------
export function listOptions() {
  return query<OptionRow>(`
    SELECT option_id, platform, option_type, label, user_id
    FROM marketing.import_source_options
    WHERE is_active
    ORDER BY platform, option_type, lower(label)
  `);
}

export function insertOption(platform: ImportPlatform, type: "adv" | "store", label: string) {
  return query<OptionRow>(`
    INSERT INTO marketing.import_source_options (platform, option_type, label)
    VALUES ($1, $2, $3)
    RETURNING option_id, platform, option_type, label, user_id
  `, [platform, type, label]);
}

export function updateOption(id: string, label: string) {
  return query<OptionRow>(`
    UPDATE marketing.import_source_options
    SET label = $2, updated_at = now()
    WHERE option_id = $1 AND is_active
    RETURNING option_id, platform, option_type, label, user_id
  `, [id, label]);
}

export function deactivateOption(id: string) {
  return query<{ option_id: string }>(`
    UPDATE marketing.import_source_options
    SET is_active = false, updated_at = now()
    WHERE option_id = $1 AND is_active
    RETURNING option_id
  `, [id]);
}

export async function findSelectedOption(
  client: PoolClient,
  id: string,
  platform: ImportPlatform,
  type: "adv" | "store",
): Promise<OptionRow | null> {
  const result = await client.query<OptionRow>(`
    SELECT option_id, platform, option_type, label, user_id
    FROM marketing.import_source_options
    WHERE option_id = $1 AND platform = $2 AND option_type = $3 AND is_active
  `, [id, platform, type]);
  return result.rows[0] ?? null;
}

// ---- preview enrichment ---------------------------------------------------
export function loadProductLookup(client: PoolClient) {
  return client.query<{ lookup_name: string; product_id: string }>(`
    SELECT lower(trim(product_final_name)) AS lookup_name, product_id
    FROM master.products
    WHERE nullif(trim(product_final_name), '') IS NOT NULL
    UNION
    SELECT lower(trim(original_name)) AS lookup_name, product_id
    FROM master.product_aliases
    WHERE product_id IS NOT NULL AND nullif(trim(original_name), '') IS NOT NULL
  `);
}

export function loadExistingOrders(client: PoolClient, invoices: string[]) {
  return client.query<{ order_id: string }>(
    "SELECT order_id FROM orders.orders WHERE order_id = ANY($1::text[])",
    [invoices],
  );
}

export function loadExistingAdsKeys(client: PoolClient, platform: ImportPlatform, advName: string) {
  return client.query<{ report_date: string; campaign_name: string; ad_name: string }>(`
    SELECT coalesce(report_date, report_start_date)::text AS report_date,
      campaign_name, coalesce(raw_data->>'adName', '') AS ad_name
    FROM marketing.ad_campaign_metrics
    WHERE lower(coalesce(platform, '')) = lower($1)
      AND lower(coalesce(advertiser_name, '')) = lower($2)
  `, [PLATFORM_ADS_LABEL[platform], advName]);
}

// ---- batch + staging writes ----------------------------------------------
export async function insertBatch(client: PoolClient, params: unknown[]): Promise<string> {
  const batch = await client.query<{ batch_id: string }>(`
    INSERT INTO marketing.import_batches (
      platform, import_type, file_name, file_size, file_mime,
      adv_option_id, adv_id, adv_name, store_option_id, store_name,
      period_label, period_start, period_end, note, status,
      total_rows, valid_rows, review_rows, error_rows, duplicate_rows,
      validation_summary, file_metadata, imported_by
    ) VALUES (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,'preview',
      $15,$16,$17,$18,$19,$20,$21,$22
    ) RETURNING batch_id
  `, params);
  return batch.rows[0]!.batch_id;
}

export function insertStagingRows(client: PoolClient, batchId: string, payloadJson: string) {
  return client.query(`
    INSERT INTO staging.import_rows (
      batch_id, row_number, raw_data, parsed_data, display_data,
      validation_status, validation_notes, duplicate_key, target_entity
    )
    SELECT $1, (item->>'rowNumber')::integer, item->'raw', item->'parsed', item->'display',
      item->>'status', item->'notes', nullif(item->>'duplicateKey', ''), item->>'targetEntity'
    FROM jsonb_array_elements($2::jsonb) AS item
  `, [batchId, payloadJson]);
}

export function insertImportLog(client: PoolClient, batchId: string, action: string, actor: string, detailJson: string) {
  return client.query(`
    INSERT INTO audit.import_logs (batch_id, action, actor, detail)
    VALUES ($1, $2, $3, $4::jsonb)
  `, [batchId, action, actor, detailJson]);
}

// ---- commit / cancel ------------------------------------------------------
export async function loadBatchForUpdate(client: PoolClient, batchId: string): Promise<BatchRow | null> {
  const result = await client.query<BatchRow>(`
    SELECT batch_id, platform, import_type, file_name, adv_name, store_name,
      period_label, period_start, period_end, status, total_rows, valid_rows,
      review_rows, error_rows, duplicate_rows, imported_rows, failed_rows,
      created_at, committed_at, expires_at
    FROM marketing.import_batches
    WHERE batch_id = $1
    FOR UPDATE
  `, [batchId]);
  return result.rows[0] ?? null;
}

export async function loadValidRows(client: PoolClient, batchId: string): Promise<StagingRow[]> {
  const result = await client.query<StagingRow>(`
    SELECT row_id, row_number, raw_data, parsed_data, display_data,
      validation_status, validation_notes, duplicate_key, target_entity
    FROM staging.import_rows
    WHERE batch_id = $1 AND validation_status = 'valid'
    ORDER BY row_number
  `, [batchId]);
  return result.rows;
}

export function setBatchStatus(client: PoolClient, batchId: string, status: string) {
  return client.query(
    "UPDATE marketing.import_batches SET status = $2, updated_at = now() WHERE batch_id = $1",
    [batchId, status],
  );
}

export async function promoteAdsRow(client: PoolClient, batch: BatchRow, row: StagingRow): Promise<string> {
  const data = row.parsed_data;
  const result = await client.query<{ metric_id: string }>(`
    INSERT INTO marketing.ad_campaign_metrics (
      batch_id, report_start_date, report_end_date, report_date, platform,
      campaign_name, campaign_delivery_status, product_label, account_code,
      advertiser_name, report_month, spend, purchase_value, link_clicks,
      impressions, leads, source_file_name, raw_data
    ) VALUES (
      $1,$2,$3,$2,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17
    ) RETURNING metric_id
  `, [
    batch.batch_id,
    data.reportDate,
    data.reportEndDate ?? data.reportDate,
    PLATFORM_ADS_LABEL[batch.platform],
    data.campaign,
    data.deliveryStatus,
    data.productId,
    data.campaignId,
    batch.adv_name,
    batch.period_label,
    data.spend ?? 0,
    data.purchaseValue ?? 0,
    data.clicks ?? 0,
    data.impressions ?? 0,
    data.leads,
    batch.file_name,
    JSON.stringify({ ...row.raw_data, adName: data.adName ?? "", adset: data.adset ?? "" }),
  ]);
  return result.rows[0]!.metric_id;
}

export function ensureAdsBatch(client: PoolClient, batch: BatchRow) {
  return client.query(`
    INSERT INTO marketing.ad_import_batches (
      batch_id, file_name, file_label, platform, advertiser_name, report_month,
      status, total_rows, success_rows, failed_rows, imported_by, processed_at,
      raw_file_metadata
    ) VALUES ($1,$2,$2,$3,$4,$5,'pending',$6,0,0,'app',now(),$7::jsonb)
    ON CONFLICT (batch_id) DO NOTHING
  `, [
    batch.batch_id,
    batch.file_name,
    PLATFORM_ADS_LABEL[batch.platform],
    batch.adv_name,
    batch.period_label,
    batch.total_rows,
    JSON.stringify({ genericImportBatchId: batch.batch_id }),
  ]);
}

export async function findChannelId(client: PoolClient, platform: ImportPlatform): Promise<string | null> {
  const names: Record<ImportPlatform, string> = { tiktok: "TikTok Shop", shopee: "Shopee", meta: "Meta" };
  const result = await client.query<{ channel_id: string }>(`
    SELECT channel_id FROM master.channels
    WHERE lower(channel_final_name) = lower($1) AND status = 'Aktif'
    LIMIT 1
  `, [names[platform]]);
  return result.rows[0]?.channel_id ?? null;
}

export async function findOrCreateCustomer(
  client: PoolClient,
  batch: BatchRow,
  data: StagingRow["parsed_data"],
): Promise<string> {
  const phone = String(data.phoneNormalized ?? "");
  const existing = await client.query<{ customer_id: string }>(`
    SELECT customer_id FROM master.customers
    WHERE phone_normalized = $1
    ORDER BY customer_id
    LIMIT 1
  `, [phone]);
  if (existing.rows[0]) return existing.rows[0].customer_id;
  const channelId = await findChannelId(client, batch.platform);
  const created = await client.query<{ customer_id: string }>(`
    INSERT INTO master.customers (
      customer_id, name, phone, phone_normalized, source_origin,
      channel_id, transaction_count, status, is_crm_target
    ) VALUES (
      'PB-CUST-IMP-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12)),
      $1,$2,$3,$4,$5,0,'Baru',true
    ) RETURNING customer_id
  `, [data.customer, data.phone, phone, PLATFORM_DB_LABEL[batch.platform], channelId]);
  return created.rows[0]!.customer_id;
}

export async function insertOrderWithItem(
  client: PoolClient,
  batch: BatchRow,
  data: StagingRow["parsed_data"],
  channelId: string,
  customerId: string,
): Promise<string | null> {
  const orderId = String(data.invoice ?? "").trim();
  const inserted = await client.query<{ order_id: string }>(`
    INSERT INTO orders.orders (
      order_id, customer_id, order_date, channel_id, payment_method,
      total_amount, order_status, source_file_id, flag
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'valid')
    ON CONFLICT (order_id) DO NOTHING
    RETURNING order_id
  `, [
    orderId,
    customerId,
    data.orderDate,
    channelId,
    data.paymentMethod,
    data.total,
    data.orderStatus ?? "Imported",
    batch.batch_id,
  ]);
  if (!inserted.rows[0]) return null;
  await client.query(`
    INSERT INTO orders.order_items (
      order_item_id, order_id, product_id, original_product_name,
      qty, unit_price, subtotal, status
    ) VALUES (
      'PB-ITEM-IMP-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12)),
      $1,$2,$3,$4,$5,$6,'valid'
    )
  `, [orderId, data.productId, data.product, data.qty, data.unitPrice, data.total]);
  await client.query(`
    UPDATE master.customers
    SET transaction_count = (SELECT count(*) FROM orders.orders WHERE customer_id = $1)
    WHERE customer_id = $1
  `, [customerId]);
  return orderId;
}

export function markRowPromoted(client: PoolClient, rowId: number, promotedId: string) {
  return client.query(
    "UPDATE staging.import_rows SET promoted_id = $2, promoted_at = now() WHERE row_id = $1",
    [rowId, promotedId],
  );
}

export function markRowFailure(client: PoolClient, row: StagingRow, message: string) {
  const notes = [...(row.validation_notes ?? []), `Gagal disimpan: ${message}`];
  return client.query(`
    UPDATE staging.import_rows
    SET validation_status = 'error', validation_notes = $2::jsonb,
      display_data = jsonb_set(
        jsonb_set(display_data, '{Status Validasi}', to_jsonb('Error'::text), true),
        '{Catatan Validasi}', to_jsonb($3::text), true
      )
    WHERE row_id = $1
  `, [row.row_id, JSON.stringify(notes), notes.join(" ")]);
}

export function finalizeBatchCompleted(client: PoolClient, batchId: string, importedRows: number, failedRows: number, runtimeFailures: number) {
  return client.query(`
    UPDATE marketing.import_batches
    SET status = 'completed', imported_rows = $2, failed_rows = $3,
      error_rows = error_rows + $4, valid_rows = greatest(valid_rows - $4, 0),
      committed_at = now(), updated_at = now()
    WHERE batch_id = $1
  `, [batchId, importedRows, failedRows, runtimeFailures]);
}

export function finalizeAdsBatchCompleted(client: PoolClient, batchId: string, importedRows: number, failedRows: number) {
  return client.query(`
    UPDATE marketing.ad_import_batches
    SET status = 'success', success_rows = $2, failed_rows = $3, processed_at = now()
    WHERE batch_id = $1
  `, [batchId, importedRows, failedRows]);
}

export function markBatchCancelled(client: PoolClient, batchId: string) {
  return client.query(`
    UPDATE marketing.import_batches
    SET status = 'cancelled', cancelled_at = now(), updated_at = now()
    WHERE batch_id = $1
  `, [batchId]);
}

// ---- history --------------------------------------------------------------
const HISTORY_SELECT = `
  SELECT batch_id, platform, import_type, file_name, adv_name, store_name,
    period_label, period_start, period_end,
    CASE WHEN status = 'preview' AND expires_at < now() THEN 'expired' ELSE status END AS status,
    total_rows, valid_rows, review_rows, error_rows, duplicate_rows,
    imported_rows, failed_rows, created_at, committed_at, expires_at
  FROM marketing.import_batches
`;

export function listHistory(limit: number) {
  return query<BatchRow>(`${HISTORY_SELECT} ORDER BY created_at DESC LIMIT $1`, [limit]);
}

export function findHistory(batchId: string) {
  return query<BatchRow>(`${HISTORY_SELECT} WHERE batch_id = $1`, [batchId]);
}

export function listBatchRows(batchId: string) {
  return query<StagingRow>(`
    SELECT row_id, row_number, raw_data, parsed_data, display_data,
      validation_status, validation_notes, duplicate_key, target_entity
    FROM staging.import_rows
    WHERE batch_id = $1
    ORDER BY row_number
  `, [batchId]);
}
