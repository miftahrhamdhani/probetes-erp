import type { PoolClient } from "pg";
import { query } from "@/server/common/db";
import type {
  AdminInputerResult,
  AdminInputerUpdateInput,
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

/** Bentuk minimum staging yang dibutuhkan oleh preview riwayat. */
export type HistoryPreviewRow = Pick<
  StagingRow,
  "row_id" | "row_number" | "display_data" | "validation_status" | "validation_notes"
>;

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
  return client.query<{ lookup_name: string; product_id: string; product_name: string }>(`
    SELECT lower(trim(product_final_name)) AS lookup_name, product_id, product_final_name AS product_name
    FROM master.products
    WHERE nullif(trim(product_final_name), '') IS NOT NULL
    UNION
    SELECT lower(trim(alias.original_name)) AS lookup_name, alias.product_id, product.product_final_name AS product_name
    FROM master.product_aliases alias
    JOIN master.products product ON product.product_id = alias.product_id
    WHERE alias.product_id IS NOT NULL AND nullif(trim(alias.original_name), '') IS NOT NULL
  `);
}

export function loadCourierLookup(client: PoolClient) {
  return client.query<{ lookup_name: string; courier_id: string; courier_name: string }>(`
    SELECT lower(trim(courier_final_name)) AS lookup_name,
      courier_id, courier_final_name AS courier_name
    FROM master.couriers
    WHERE nullif(trim(courier_final_name), '') IS NOT NULL
    UNION
    SELECT lower(trim(alias_name)) AS lookup_name,
      courier.courier_id, courier.courier_final_name AS courier_name
    FROM master.couriers courier
    CROSS JOIN LATERAL regexp_split_to_table(coalesce(courier.original_names, ''), '\\s*/\\s*') alias_name
    WHERE nullif(trim(alias_name), '') IS NOT NULL
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
  const phone = String(data.phoneNormalized ?? "").trim() || null;
  if (phone) {
    const existing = await client.query<{ customer_id: string }>(`
      SELECT customer_id FROM master.customers
      WHERE phone_normalized = $1
      ORDER BY customer_id
      LIMIT 1
    `, [phone]);
    if (existing.rows[0]) return existing.rows[0].customer_id;
  }
  const channelId = await findChannelId(client, batch.platform);
  const created = await client.query<{ customer_id: string }>(`
    INSERT INTO master.customers (
      customer_id, name, phone, phone_normalized, address, city, province,
      source_origin, channel_id, transaction_count, status, is_crm_target
    ) VALUES (
      'PB-CUST-IMP-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12)),
      $1,$2,$3,$4,$5,$6,$7,$8,0,$9,$10
    ) RETURNING customer_id
  `, [
    data.customer,
    data.phone,
    phone,
    data.address,
    data.city,
    data.province,
    PLATFORM_DB_LABEL[batch.platform],
    channelId,
    phone ? "Baru" : "Perlu Dilengkapi",
    Boolean(phone),
  ]);
  return created.rows[0]!.customer_id;
}

export async function insertOrderWithItems(
  client: PoolClient,
  batch: BatchRow,
  orderRows: Array<StagingRow["parsed_data"]>,
  channelId: string,
  customerId: string,
): Promise<string | null> {
  const data = orderRows[0];
  if (!data) throw new Error("Pesanan tidak memiliki item untuk disimpan.");
  const orderId = String(data.invoice ?? "").trim();
  const inserted = await client.query<{ order_id: string }>(`
    INSERT INTO orders.orders (
      order_id, customer_id, order_date, channel_id, courier_id,
      payment_method, payment_status, total_amount, order_status, source_file_id, flag
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'valid')
    ON CONFLICT (order_id) DO NOTHING
    RETURNING order_id
  `, [
    orderId,
    customerId,
    data.orderDate,
    channelId,
    data.courierId,
    data.paymentMethod,
    data.paymentStatus,
    data.total,
    data.orderStatus ?? "Imported",
    batch.batch_id,
  ]);
  if (!inserted.rows[0]) return null;
  const items = orderRows.map((item) => ({
    product_id: item.productId ?? null,
    product: item.product ?? null,
    qty: item.qty ?? null,
    unit_price: item.unitPrice ?? null,
    subtotal: item.itemSubtotal ?? null,
  }));
  await client.query(`
    INSERT INTO orders.order_items (
      order_item_id, order_id, product_id, original_product_name,
      qty, unit_price, subtotal, status
    )
    SELECT
      'PB-ITEM-IMP-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12)),
      $1, item.product_id, item.product, item.qty, item.unit_price, item.subtotal, 'valid'
    FROM jsonb_to_recordset($2::jsonb) AS item(
      product_id text,
      product text,
      qty integer,
      unit_price bigint,
      subtotal bigint
    )
  `, [orderId, JSON.stringify(items)]);
  const trackingNumber = String(data.trackingNumber ?? "").trim();
  if (trackingNumber) {
    await client.query(`
      INSERT INTO tracking.shipments (
        shipment_id, order_id, tracking_number, customer_id, ship_city,
        courier_id, payment_method, package_status, flag
      ) VALUES (
        'PB-SHIP-IMP-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12)),
        $1,$2,$3,$4,$5,$6,$7,'valid'
      )
    `, [
      orderId,
      trackingNumber,
      customerId,
      data.city,
      data.courierId,
      data.paymentMethod,
      data.orderStatus ?? "Menunggu Pickup",
    ]);
  }
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

export function listHistoryPreviewRows(batchId: string) {
  return query<HistoryPreviewRow>(`
    SELECT row_id, row_number, display_data, validation_status, validation_notes
    FROM staging.import_rows
    WHERE batch_id = $1
    ORDER BY row_number
  `, [batchId]);
}

interface AdminOrderRow {
  order_id: string;
  order_date: string | null;
  platform: ImportPlatform;
  store_id: string;
  store_name: string;
  order_status: string | null;
  payment_method: string | null;
  total_amount: number | null;
  channel: string | null;
  courier: string | null;
  tracking_number: string | null;
  package_status: string | null;
  customer_id: string;
  customer_version: string;
  name: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  province: string | null;
  items: AdminInputerResult["items"];
}

/** Cari pesanan import marketplace secara exact; tidak memakai partial/fuzzy search. */
export async function findAdminInputerOrders(client: PoolClient, input: {
  platform: ImportPlatform;
  storeId: string;
  orderId?: string;
  trackingNumber?: string;
}): Promise<AdminOrderRow[]> {
  const result = await client.query<AdminOrderRow>(`
    SELECT o.order_id, o.order_date::text, b.platform,
      b.store_option_id::text AS store_id, b.store_name,
      o.order_status, o.payment_method, o.total_amount,
      ch.channel_final_name AS channel, co.courier_final_name AS courier,
      sh.tracking_number, sh.package_status,
      cu.customer_id, cu.xmin::text AS customer_version,
      cu.name, cu.phone, cu.address, cu.city, cu.province,
      coalesce(items.items, '[]'::jsonb) AS items
    FROM orders.orders o
    JOIN marketing.import_batches b ON b.batch_id::text = o.source_file_id
    JOIN master.customers cu ON cu.customer_id = o.customer_id
    LEFT JOIN master.channels ch ON ch.channel_id = o.channel_id
    LEFT JOIN master.couriers co ON co.courier_id = o.courier_id
    LEFT JOIN LATERAL (
      SELECT tracking_number, package_status
      FROM tracking.shipments
      WHERE order_id = o.order_id
      ORDER BY shipment_id
      LIMIT 1
    ) sh ON true
    LEFT JOIN LATERAL (
      SELECT jsonb_agg(jsonb_build_object(
        'productId', oi.product_id,
        'productName', coalesce(p.product_final_name, oi.original_product_name, '-'),
        'quantity', oi.qty,
        'unitPrice', oi.unit_price,
        'subtotal', oi.subtotal,
        'status', oi.status
      ) ORDER BY oi.order_item_id) AS items
      FROM orders.order_items oi
      LEFT JOIN master.products p ON p.product_id = oi.product_id
      WHERE oi.order_id = o.order_id
    ) items ON true
    WHERE b.import_type = 'order' AND b.status = 'completed'
      AND b.platform = $1 AND b.store_option_id = $2::uuid
      AND ($3::text IS NOT NULL AND o.order_id = $3
        OR $3::text IS NULL AND $4::text IS NOT NULL AND sh.tracking_number = $4)
    ORDER BY o.order_date DESC NULLS LAST, o.order_id
    LIMIT 10
  `, [input.platform, input.storeId, input.orderId || null, input.trackingNumber || null]);
  return result.rows;
}

export function findPhoneCandidates(client: PoolClient, normalizedPhone: string, excludeCustomerId: string) {
  return client.query<{ customer_id: string; name: string; transaction_count: number }>(`
    SELECT customer_id, coalesce(name, '-') AS name, coalesce(transaction_count, 0) AS transaction_count
    FROM master.customers
    WHERE phone_normalized = $1 AND customer_id <> $2 AND coalesce(status, '') <> 'Arsip'
    ORDER BY customer_id
    LIMIT 10
  `, [normalizedPhone, excludeCustomerId]);
}

export async function loadAdminCustomerForUpdate(client: PoolClient, orderId: string, customerId: string) {
  const result = await client.query<{
    customer_id: string; customer_version: string; name: string | null; phone: string | null;
    address: string | null; city: string | null; province: string | null;
  }>(`
    SELECT cu.customer_id, cu.xmin::text AS customer_version,
      cu.name, cu.phone, cu.address, cu.city, cu.province
    FROM orders.orders o
    JOIN master.customers cu ON cu.customer_id = o.customer_id
    WHERE o.order_id = $1 AND cu.customer_id = $2
    FOR UPDATE OF cu
  `, [orderId, customerId]);
  return result.rows[0] ?? null;
}

export async function updateAdminCustomerIdentity(client: PoolClient, input: AdminInputerUpdateInput, normalizedPhone: string) {
  const result = await client.query<{
    customer_id: string; customer_version: string; name: string; phone: string;
    address: string; city: string; province: string;
  }>(`
    UPDATE master.customers
    SET name = $3, phone = $4, phone_normalized = $5,
      address = $6, city = $7, province = $8
    WHERE customer_id = $1 AND xmin::text = $2
    RETURNING customer_id, xmin::text AS customer_version,
      coalesce(name, '') AS name, coalesce(phone, '') AS phone,
      coalesce(address, '') AS address, coalesce(city, '') AS city, coalesce(province, '') AS province
  `, [input.customerId, input.customerVersion, input.name, input.phone, normalizedPhone, input.address, input.city, input.province]);
  return result.rows[0] ?? null;
}
